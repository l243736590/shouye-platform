import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  ImageBackground,
  LogBox,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'
import type { VideoPlayer } from 'expo-video'
import { fetchAppContent, login as loginAccount, registerPhoneAccount, sendPhoneCode } from './src/api'
import { feedImages } from './src/data'
import { colors } from './src/theme'
import type { AuthUser, AuthUserType, ManagedMerchant, MerchantBrandDecoration, Post, Question, Screen, TabKey } from './src/types'

const entryLogo = require('./assets/shouye-logo-light-text.png')
const headerLogo = require('./assets/shouye-logo-text-dark.png')
const entryBackgroundPoster = require('./assets/entry-background-poster.jpg')
const entryBackgroundVideo = require('./assets/entry-background.mp4')
const loginBackgroundPoster = require('./assets/login-background-poster.jpg')
const loginBackgroundVideo = require('./assets/login-background.mp4')

LogBox.ignoreLogs(['SafeAreaView has been deprecated'])

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'home', label: '首页' },
  { key: 'questions', label: '求助' },
  { key: 'solve', label: '助人' },
  { key: 'posts', label: '经验' },
  { key: 'profile', label: '我的' }
]

const studentStageOptions = [
  { label: '准备申请', value: 'preparing' },
  { label: '已录取待入学', value: 'admitted' },
  { label: '语学院', value: 'language_school' },
  { label: '本科', value: 'undergraduate' },
  { label: '大学院', value: 'graduate' },
  { label: '已毕业', value: 'graduated' }
]

const businessCategoryOptions = ['留学咨询', '家政搬家', '通信手机', '物流快递', '餐饮团购', '租房房产', '作品集辅导', '翻译公证', '其他服务']

const skillServiceCategories = ['宠物照看/遛狗喂猫', '跑腿/排队/代办', '地陪/陪同/翻译', '学习辅导/资料整理', '搬家/取送/寄件', '同校生活帮忙', '其他技能服务']
const helpMatchTerms = ['宠物', '喂猫', '遛狗', '跑腿', '排队', '代办', '陪同', '翻译', '医院', '出入境', '学习', '资料', '搬家', '取送', '同校', '新生']

function matchHelpPosts(posts: Post[], input: string) {
  const normalized = input.replace(/\s+/g, '').toLowerCase()
  if (!normalized) return []
  return posts
    .filter((post) => post.contentType === '技能服务' || skillServiceCategories.includes(post.category || ''))
    .map((post) => {
      const text = `${post.title} ${post.category || ''} ${post.school || ''} ${post.excerpt || ''} ${post.body || ''}`.toLowerCase()
      const score =
        (text.replace(/\s+/g, '').includes(normalized) ? 80 : 0) +
        helpMatchTerms.reduce((sum, term) => sum + (normalized.includes(term) && text.includes(term) ? 12 : 0), 0)
      return { post, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.post)
}

function formatDate(value?: string) {
  return value ? value.slice(0, 10) : '刚刚'
}

function compactCount(value?: number) {
  const count = Number(value || 0)
  if (count >= 10000) return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}万`
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(count)
}

function readMinutes(text = '') {
  return Math.max(1, Math.ceil(text.length / 280))
}

function imageFor(index: number) {
  return feedImages[index % feedImages.length]
}

function useBackgroundVideoPlayback(player: VideoPlayer) {
  useEffect(() => {
    const play = () => {
      try {
        player.loop = true
        player.muted = true
        player.play()
      } catch {
        // The native player can briefly reject commands while Android is resuming.
      }
    }

    play()
    const timer = setInterval(() => {
      try {
        if (!player.playing) play()
      } catch {
        play()
      }
    }, 1500)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setTimeout(play, 250)
    })

    return () => {
      clearInterval(timer)
      subscription.remove()
    }
  }, [player])
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'login' })
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [merchants, setMerchants] = useState<ManagedMerchant[]>([])
  const [merchantBrandDecorations, setMerchantBrandDecorations] = useState<MerchantBrandDecoration[]>([])
  const [syncedAt, setSyncedAt] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchAppContent()
      .then((content) => {
        if (!mounted) return
        setQuestions(content.questions)
        setPosts(content.posts)
        setMerchants(content.merchants)
        setMerchantBrandDecorations(content.merchantBrandDecorations)
        setSyncedAt(content.syncedAt)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const currentTab: TabKey =
    screen.name === 'tab'
      ? screen.tab
      : screen.name === 'post-detail'
        ? 'posts'
        : screen.name === 'question-detail'
          ? screen.role === 'helper'
            ? 'solve'
            : 'questions'
          : 'home'

  const goTab = (tab: TabKey) => setScreen({ name: 'tab', tab })
  const openQuestion = (question: Question, role: 'reader' | 'helper') => setScreen({ name: 'question-detail', question, role })
  const openPost = (post: Post) => setScreen({ name: 'post-detail', post })
  const handleAuthenticated = (user: AuthUser) => {
    setCurrentUser(user)
    setScreen({ name: 'entry' })
  }
  const handleLogout = () => {
    setCurrentUser(null)
    setScreen({ name: 'login' })
  }

  return (
    <View style={styles.app}>
      <StatusBar
        barStyle={screen.name === 'login' || screen.name === 'entry' ? 'light-content' : 'dark-content'}
        backgroundColor={screen.name === 'login' ? '#242b2e' : colors.paper}
      />
      {screen.name === 'login' ? (
        <LoginScreen onAuthenticated={handleAuthenticated} />
      ) : screen.name === 'entry' ? (
        <EntryScreen onAsk={() => goTab('questions')} onHelp={() => goTab('solve')} />
      ) : screen.name === 'post-detail' ? (
        <View style={styles.detailShell}>
          <PostDetail post={screen.post} onBack={() => goTab('posts')} />
          <BottomNav active={currentTab} onChange={goTab} />
        </View>
      ) : screen.name === 'question-detail' ? (
        <View style={styles.detailShell}>
          <QuestionDetail question={screen.question} role={screen.role} onBack={() => goTab(screen.role === 'helper' ? 'solve' : 'questions')} />
          <BottomNav active={currentTab} onChange={goTab} />
        </View>
      ) : (
        <View style={styles.shell}>
          <Header tab={screen.tab} onHome={() => setScreen({ name: 'entry' })} />
          {loading ? (
            <LoadingState />
          ) : (
            <TabScreen
              tab={screen.tab}
              user={currentUser}
              questions={questions}
              posts={posts}
              merchants={merchants}
              merchantBrandDecorations={merchantBrandDecorations}
              syncedAt={syncedAt}
              onQuestion={openQuestion}
              onPost={openPost}
              onLogout={handleLogout}
            />
          )}
          <BottomNav active={currentTab} onChange={goTab} />
        </View>
      )}
    </View>
  )
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const loginVideoPlayer = useVideoPlayer(loginBackgroundVideo, (player) => {
    player.loop = true
    player.muted = true
    player.play()
  })
  useBackgroundVideoPlayback(loginVideoPlayer)
  const [videoReady, setVideoReady] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [showOtherLogin, setShowOtherLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phoneCodeSending, setPhoneCodeSending] = useState(false)
  const [phoneCodeCooldown, setPhoneCodeCooldown] = useState(0)
  const [userType, setUserType] = useState<AuthUserType>('student')
  const [studentStage, setStudentStage] = useState(studentStageOptions[0].value)
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessCategory, setBusinessCategory] = useState(businessCategoryOptions[0])
  const [country, setCountry] = useState('韩国')
  const [city, setCity] = useState('')
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [realName, setRealName] = useState('')
  const [identityNumber, setIdentityNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (phoneCodeCooldown <= 0) return undefined
    const timer = setTimeout(() => setPhoneCodeCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => clearTimeout(timer)
  }, [phoneCodeCooldown])

  const isRegister = authMode === 'register'
  const submitText = loading ? '提交中...' : isRegister ? '完成实名注册' : '登录'

  const ensureAgreement = () => {
    if (agreementAccepted) return true
    setNotice('请先勾选同意用户协议、隐私政策和个人信息保护规则')
    return false
  }

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setShowOtherLogin(false)
    setNotice('')
  }

  const sendCode = async () => {
    const normalizedPhone = phone.trim()
    if (!normalizedPhone) {
      setNotice('请先填写手机号，再发送验证码')
      return
    }
    if (!/^\+?\d[\d\s-]{7,18}$/.test(normalizedPhone)) {
      setNotice('手机号格式不正确，请检查后再发送')
      return
    }
    if (phoneCodeSending || phoneCodeCooldown > 0) return
    setPhoneCodeSending(true)
    setNotice('')
    try {
      const message = await sendPhoneCode(normalizedPhone)
      setPhoneCode('')
      setPhoneCodeCooldown(60)
      setNotice(message)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '验证码发送失败，请稍后再试')
    } finally {
      setPhoneCodeSending(false)
    }
  }

  const wechatLogin = () => {
    if (!ensureAgreement()) return
    setNotice('微信 App 登录需要接入微信开放平台；当前请使用“其他登录方式”。')
    setShowOtherLogin(true)
  }

  const submitAuth = async () => {
    if (loading || !ensureAgreement()) return

    if (!isRegister) {
      const account = loginId.trim()
      const normalizedPassword = loginPassword.trim()
      if (!account || !normalizedPassword) {
        setNotice('请输入手机号/邮箱和密码')
        return
      }
      setLoading(true)
      setNotice('')
      try {
        const user = await loginAccount(account, normalizedPassword)
        onAuthenticated(user)
      } catch (error) {
        setNotice(error instanceof Error ? error.message : '登录失败，请稍后再试')
      } finally {
        setLoading(false)
      }
      return
    }

    const normalizedPhone = phone.trim()
    const normalizedPassword = password.trim()
    const normalizedConfirmPassword = confirmPassword.trim()

    if (!normalizedPhone) {
      setNotice('注册只能使用手机号，请先填写手机号')
      return
    }
    if (!/^\+?\d[\d\s-]{7,18}$/.test(normalizedPhone)) {
      setNotice('手机号格式不正确')
      return
    }
    if (normalizedPassword.length < 6) {
      setNotice('密码至少需要 6 位')
      return
    }
    if (normalizedPassword !== normalizedConfirmPassword) {
      setNotice('两次输入的密码不一致')
      return
    }
    if (!/^\d{6}$/.test(phoneCode.trim())) {
      setNotice('请填写手机收到的 6 位验证码')
      return
    }
    if (!realName.trim() || !identityNumber.trim()) {
      setNotice('必须填写真实姓名和证件号码，完成实名注册')
      return
    }
    if (userType === 'student' && !studentStage) {
      setNotice('请选择学生阶段')
      return
    }
    if (userType === 'merchant' && (!businessName.trim() || !businessCategory.trim())) {
      setNotice('请填写商家/机构名称和服务类型')
      return
    }
    if (userType === 'merchant' && (!country.trim() || !city.trim())) {
      setNotice('请填写商家所在国家和城市')
      return
    }

    setLoading(true)
    setNotice('')
    try {
      const user = await registerPhoneAccount({
        userType,
        phone: normalizedPhone,
        phoneCode: phoneCode.trim(),
        realName: realName.trim(),
        identityNumber: identityNumber.trim(),
        studentStage: userType === 'student' ? studentStage : undefined,
        nickname: userType === 'student' ? name.trim() : undefined,
        businessName: userType === 'merchant' ? businessName.trim() : undefined,
        businessCategory: userType === 'merchant' ? businessCategory : undefined,
        country: userType === 'merchant' ? country.trim() : undefined,
        city: userType === 'merchant' ? city.trim() : undefined,
        school: userType === 'student' ? school.trim() : undefined,
        password: normalizedPassword,
        confirmPassword: normalizedConfirmPassword
      })
      onAuthenticated(user)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '注册失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.loginPage}>
      <Image source={loginBackgroundPoster} style={styles.loginPoster} resizeMode="cover" />
      <VideoView
        player={loginVideoPlayer}
        style={[styles.loginVideo, !videoReady && styles.loginVideoHidden]}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
        surfaceType="textureView"
        useExoShutter={false}
        onFirstFrameRender={() => {
          setVideoReady(true)
          loginVideoPlayer.play()
        }}
      />
      <View pointerEvents="none" style={styles.loginVideoShade} />
      <ScrollView style={styles.loginScroll} contentContainerStyle={styles.loginContent}>
        <Pressable
          style={styles.authHelp}
          onPress={() => Alert.alert('售业帮助', '登录后先选择“我要分享/助人”或“我要提问/求助”，再进入对应内容流。')}
        >
          <Text style={styles.authHelpText}>帮助</Text>
        </Pressable>

        <View style={styles.authBrand}>
          <Image source={entryLogo} style={styles.authLogo} resizeMode="contain" />
        </View>

        <View style={styles.authCopy}>
          <Text style={styles.authTitle}>{isRegister ? '手机号注册 / 实名认证' : '技能 / 经验变现平台'}</Text>
          <Text style={styles.authDesc}>
            {isRegister ? '注册只能使用手机号，并提交真实姓名和证件信息。' : '留学生提问求助，也用自己的经验和技能帮别人解决问题。'}
          </Text>
        </View>

        <View style={styles.authPanel}>
          {!isRegister ? (
            <>
              <Pressable style={[styles.wechatLogin, loading && styles.wechatLoginLoading]} onPress={wechatLogin} disabled={loading}>
                <Text style={styles.wechatIcon}>●◌</Text>
                <Text style={styles.wechatLoginText}>微信登录</Text>
              </Pressable>

              <Pressable style={styles.otherLogin} onPress={() => setShowOtherLogin((value) => !value)}>
                <Text style={styles.otherLoginText}>其他登录方式</Text>
                <Text style={styles.chevron}>{showOtherLogin ? '⌃' : '⌄'}</Text>
              </Pressable>

              {showOtherLogin ? (
                <View style={styles.emailLogin}>
                  <TextInput
                    style={styles.authInput}
                    value={loginId}
                    onChangeText={(value) => {
                      setLoginId(value)
                      setNotice('')
                    }}
                    placeholder="手机号 / 邮箱"
                    placeholderTextColor="rgba(255,253,247,0.46)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.authInput}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    placeholder="密码"
                    placeholderTextColor="rgba(255,253,247,0.46)"
                    secureTextEntry
                  />
                  <Pressable style={[styles.emailLoginButton, loading && styles.formButtonDisabled]} onPress={submitAuth} disabled={loading}>
                    <Text style={styles.emailLoginButtonText}>{loading ? '登录中...' : '登录'}</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.registerFields}>
              <Text style={styles.registerIntro}>注册只能使用手机号；实名信息提交后进入后台审核。</Text>
              <View style={styles.authInlineRow}>
                <TextInput
                  style={[styles.authInput, styles.authInlineInput]}
                  value={phone}
                  onChangeText={(value) => {
                    setPhone(value)
                    setNotice('')
                  }}
                  placeholder="手机号"
                  placeholderTextColor="rgba(255,253,247,0.46)"
                  keyboardType="phone-pad"
                />
                <Pressable
                  style={[styles.sendCodeButton, (phoneCodeSending || phoneCodeCooldown > 0) && styles.formButtonDisabled]}
                  onPress={sendCode}
                  disabled={phoneCodeSending || phoneCodeCooldown > 0}
                >
                  <Text style={styles.sendCodeButtonText}>
                    {phoneCodeSending ? '发送中' : phoneCodeCooldown > 0 ? `${phoneCodeCooldown}s` : '发验证码'}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                style={styles.authInput}
                value={phoneCode}
                onChangeText={(value) => setPhoneCode(value.replace(/\D/g, '').slice(0, 6))}
                placeholder="手机验证码"
                placeholderTextColor="rgba(255,253,247,0.46)"
                keyboardType="number-pad"
                maxLength={6}
              />
              <View style={styles.authInlineRow}>
                <TextInput
                  style={[styles.authInput, styles.authInlineInput]}
                  value={realName}
                  onChangeText={setRealName}
                  placeholder="真实姓名"
                  placeholderTextColor="rgba(255,253,247,0.46)"
                />
                <TextInput
                  style={[styles.authInput, styles.authInlineInput]}
                  value={identityNumber}
                  onChangeText={setIdentityNumber}
                  placeholder="证件号码"
                  placeholderTextColor="rgba(255,253,247,0.46)"
                  autoCapitalize="characters"
                />
              </View>
              <Text style={styles.authFieldLabel}>身份</Text>
              <View style={styles.authChipRow}>
                {(['student', 'merchant'] as AuthUserType[]).map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.authChip, userType === type && styles.authChipActive]}
                    onPress={() => setUserType(type)}
                  >
                    <Text style={[styles.authChipText, userType === type && styles.authChipTextActive]}>
                      {type === 'student' ? '学生' : '商家'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {userType === 'student' ? (
                <>
                  <TextInput
                    style={styles.authInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="昵称，例如：首尔学姐"
                    placeholderTextColor="rgba(255,253,247,0.46)"
                  />
                  <Text style={styles.authFieldLabel}>学生阶段</Text>
                  <View style={styles.authChipRow}>
                    {studentStageOptions.map((option) => (
                      <Pressable
                        key={option.value}
                        style={[styles.authChip, studentStage === option.value && styles.authChipActive]}
                        onPress={() => setStudentStage(option.value)}
                      >
                        <Text style={[styles.authChipText, studentStage === option.value && styles.authChipTextActive]}>{option.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    style={styles.authInput}
                    value={school}
                    onChangeText={setSchool}
                    placeholder="学校 / 目标学校，例如：延世大学"
                    placeholderTextColor="rgba(255,253,247,0.46)"
                  />
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.authInput}
                    value={businessName}
                    onChangeText={setBusinessName}
                    placeholder="商家/机构名称"
                    placeholderTextColor="rgba(255,253,247,0.46)"
                  />
                  <Text style={styles.authFieldLabel}>服务类型</Text>
                  <View style={styles.authChipRow}>
                    {businessCategoryOptions.map((category) => (
                      <Pressable
                        key={category}
                        style={[styles.authChip, businessCategory === category && styles.authChipActive]}
                        onPress={() => setBusinessCategory(category)}
                      >
                        <Text style={[styles.authChipText, businessCategory === category && styles.authChipTextActive]}>{category}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.authInlineRow}>
                    <TextInput
                      style={[styles.authInput, styles.authInlineInput]}
                      value={country}
                      onChangeText={setCountry}
                      placeholder="国家"
                      placeholderTextColor="rgba(255,253,247,0.46)"
                    />
                    <TextInput
                      style={[styles.authInput, styles.authInlineInput]}
                      value={city}
                      onChangeText={setCity}
                      placeholder="城市"
                      placeholderTextColor="rgba(255,253,247,0.46)"
                    />
                  </View>
                </>
              )}
              <TextInput
                style={styles.authInput}
                value={password}
                onChangeText={setPassword}
                placeholder="设置登录密码"
                placeholderTextColor="rgba(255,253,247,0.46)"
                secureTextEntry
              />
              <TextInput
                style={styles.authInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="再次输入密码"
                placeholderTextColor="rgba(255,253,247,0.46)"
                secureTextEntry
              />
            </View>
          )}

          <Pressable style={styles.authAgreement} onPress={() => setAgreementAccepted((value) => !value)}>
            <View style={[styles.agreeDot, agreementAccepted && styles.agreeDotChecked]} />
            <Text style={styles.agreeText}>
              我已阅读并同意
              <Text style={styles.agreeLink}>《用户协议》</Text>
              <Text style={styles.agreeLink}>《隐私政策》</Text>
              <Text style={styles.agreeLink}>《未成年人个人信息保护规则》</Text>
            </Text>
          </Pressable>

          {notice ? <Text style={styles.authNotice}>{notice}</Text> : null}

          {isRegister ? (
            <Pressable style={[styles.wechatLogin, loading && styles.wechatLoginLoading]} onPress={submitAuth} disabled={loading}>
              <Text style={styles.wechatLoginText}>{submitText}</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.otherLogin} onPress={() => switchMode(isRegister ? 'login' : 'register')}>
            <Text style={styles.otherLoginText}>{isRegister ? '已有账号？返回登录' : '还没有账号？手机号注册'}</Text>
          </Pressable>
        </View>

        {!isRegister ? (
          <Pressable style={styles.recoverLink} onPress={() => Alert.alert('找回账号', '网页版地址：https://shouye.fun')}>
            <Text style={styles.recoverLinkText}>账号丢失了？找回账号</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  )
}

function EntryScreen({ onAsk, onHelp }: { onAsk: () => void; onHelp: () => void }) {
  const entryVideoPlayer = useVideoPlayer(entryBackgroundVideo, (player) => {
    player.loop = true
    player.muted = true
    player.play()
  })
  useBackgroundVideoPlayback(entryVideoPlayer)
  const [videoReady, setVideoReady] = useState(false)

  return (
    <View style={styles.entry}>
      <Image source={entryBackgroundPoster} style={styles.entryPoster} resizeMode="cover" />
      <VideoView
        player={entryVideoPlayer}
        style={[styles.entryVideo, !videoReady && styles.entryVideoHidden]}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
        surfaceType="textureView"
        useExoShutter={false}
        onFirstFrameRender={() => {
          setVideoReady(true)
          entryVideoPlayer.play()
        }}
      />
      <View pointerEvents="none" style={styles.entryShade} />
      <View style={styles.entryBrand}>
        <Image source={entryLogo} style={styles.entryLogo} resizeMode="contain" />
      </View>
      <View style={styles.entryCopy}>
        <Text style={styles.entryTitle}>留学生经验分享与问题解决平台</Text>
        <Text style={styles.entryDesc}>提问、求助、分享经验，也用自己的经历帮助后来的人。</Text>
      </View>
      <View style={styles.entryActions}>
        <Pressable style={[styles.entryButton, styles.askButton]} onPress={onAsk}>
          <Text style={styles.entryButtonTitle}>我要提问/求助</Text>
          <Text style={styles.entryButtonText}>发布问题、悬赏解决、免费看经验帖</Text>
        </Pressable>
        <Pressable style={[styles.entryButton, styles.helpButton]} onPress={onHelp}>
          <Text style={[styles.entryButtonTitle, styles.helpButtonTitle]}>我要分享/助人</Text>
          <Text style={[styles.entryButtonText, styles.helpButtonText]}>回答求助、分享经验、积累收益和等级</Text>
        </Pressable>
      </View>
    </View>
  )
}

function Header({ tab, onHome }: { tab: TabKey; onHome: () => void }) {
  const titleMap: Record<TabKey, string> = {
    home: '售业',
    questions: '我要提问/求助',
    solve: '我要分享/助人',
    posts: '经验分享',
    profile: '我的售业'
  }

  return (
    <View style={styles.header}>
      <Pressable style={styles.headerLogoButton} onPress={onHome} hitSlop={10}>
        <Image source={headerLogo} style={styles.headerLogoImage} resizeMode="contain" />
      </Pressable>
      <View>
        <Text style={styles.headerTitle}>{titleMap[tab]}</Text>
        <Text style={styles.headerSub}>韩国留学生经验和问题解决</Text>
      </View>
    </View>
  )
}

function TabScreen({
  tab,
  user,
  questions,
  posts,
  merchants,
  merchantBrandDecorations,
  syncedAt,
  onQuestion,
  onPost,
  onLogout
}: {
  tab: TabKey
  user: AuthUser | null
  questions: Question[]
  posts: Post[]
  merchants: ManagedMerchant[]
  merchantBrandDecorations: MerchantBrandDecoration[]
  syncedAt: string
  onQuestion: (question: Question, role: 'reader' | 'helper') => void
  onPost: (post: Post) => void
  onLogout: () => void
}) {
  if (tab === 'home') {
    return (
      <HomeScreen
        questions={questions}
        posts={posts}
        merchants={merchants}
        merchantBrandDecorations={merchantBrandDecorations}
        syncedAt={syncedAt}
        onQuestion={onQuestion}
        onPost={onPost}
      />
    )
  }
  if (tab === 'questions') return <QuestionsScreen questions={questions} posts={posts} onQuestion={(item) => onQuestion(item, 'reader')} />
  if (tab === 'solve') return <SolveScreen questions={questions} onQuestion={(item) => onQuestion(item, 'helper')} />
  if (tab === 'posts') return <PostsScreen posts={posts} onPost={onPost} />
  return <ProfileScreen user={user} onLogout={onLogout} />
}

function HomeScreen({
  questions,
  posts,
  merchants,
  merchantBrandDecorations,
  syncedAt,
  onQuestion,
  onPost
}: {
  questions: Question[]
  posts: Post[]
  merchants: ManagedMerchant[]
  merchantBrandDecorations: MerchantBrandDecoration[]
  syncedAt: string
  onQuestion: (question: Question, role: 'reader' | 'helper') => void
  onPost: (post: Post) => void
}) {
  const pinnedMerchants = merchants.slice(0, 4)
  const formattedSyncedAt = syncedAt ? new Date(syncedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '刚刚'
  const featuredPosts = posts.filter((post) => post.featured || post.isFeatured).slice(0, 5)
  const hotQuestions = [...questions].sort((a, b) => Number(b.rewardPoints || 0) - Number(a.rewardPoints || 0)).slice(0, 4)

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>已同步 shouye.fun · {formattedSyncedAt}</Text>
        <Text style={styles.heroTitle}>今天先看哪条经验？</Text>
        <Text style={styles.heroDesc}>{posts.length} 篇经验 · {questions.length} 条求助 · {merchants.length} 个商家服务，网站新增内容会同步到这里。</Text>
        <View style={styles.heroStats}>
          <View>
            <Text style={styles.heroStatNumber}>{posts.filter((item) => Number(item.price || 0) <= 0).length}</Text>
            <Text style={styles.heroStatLabel}>免费帖</Text>
          </View>
          <View>
            <Text style={styles.heroStatNumber}>{questions.filter((item) => item.status !== 'solved').length}</Text>
            <Text style={styles.heroStatLabel}>待解决</Text>
          </View>
          <View>
            <Text style={styles.heroStatNumber}>{merchants.filter((item) => item.level === 'pinned').length}</Text>
            <Text style={styles.heroStatLabel}>置顶商家</Text>
          </View>
        </View>
      </View>
      <SectionTitle title="精华经验" action="横滑浏览" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyRail}>
        {featuredPosts.map((post, index) => (
          <PostStoryCard key={post.id} post={post} index={index} onPress={() => onPost(post)} />
        ))}
      </ScrollView>
      <SectionTitle title="高优先级求助" action="去助人" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questionRail}>
        {hotQuestions.map((question) => (
          <QuestionRow key={question.id} question={question} onPress={() => onQuestion(question, 'helper')} compact />
        ))}
      </ScrollView>
      <SectionTitle title="免费经验" action="去阅读" />
      {posts.filter((item) => Number(item.price || 0) <= 0).slice(0, 2).map((post, index) => (
        <PostCard key={post.id} post={post} index={index} onPress={() => onPost(post)} featured={index === 0} />
      ))}
      {pinnedMerchants.length ? (
        <>
          <SectionTitle title="商家服务" action="来自网站商家管理" />
          {pinnedMerchants.map((merchant) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              decoration={merchantBrandDecorations.find((item) => item.brandId === merchant.id)}
            />
          ))}
        </>
      ) : null}
    </ScrollView>
  )
}

function QuestionsScreen({ questions, posts, onQuestion }: { questions: Question[]; posts: Post[]; onQuestion: (question: Question) => void }) {
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [intent, setIntent] = useState<'know' | 'help'>('know')
  const [matchInput, setMatchInput] = useState('')
  const categories = useMemo(
    () => ['全部', '高悬赏', '待回答', ...Array.from(new Set(questions.map((question) => question.category).filter(Boolean))).slice(0, 6)] as string[],
    [questions]
  )
  const helpMatches = useMemo(() => matchHelpPosts(posts, matchInput), [posts, matchInput])
  const visibleQuestions = useMemo(() => {
    if (selectedCategory === '全部') return questions
    if (selectedCategory === '高悬赏') return [...questions].sort((a, b) => Number(b.rewardPoints || 0) - Number(a.rewardPoints || 0))
    if (selectedCategory === '待回答') return questions.filter((question) => question.status !== 'solved')
    return questions.filter((question) => question.category === selectedCategory)
  }, [questions, selectedCategory])

  return (
    <ScrollView contentContainerStyle={styles.contentTight}>
      <SearchBox placeholder="搜：签证、找房、入学、二手交易" />
      <View style={styles.intentSwitch}>
        <Pressable style={[styles.intentCard, intent === 'know' && styles.intentCardActive]} onPress={() => setIntent('know')}>
          <Text style={[styles.intentTitle, intent === 'know' && styles.intentTitleActive]}>我想知道</Text>
          <Text style={[styles.intentText, intent === 'know' && styles.intentTextActive]}>找知识分享和经验答案</Text>
        </Pressable>
        <Pressable style={[styles.intentCard, intent === 'help' && styles.intentCardActive]} onPress={() => setIntent('help')}>
          <Text style={[styles.intentTitle, intent === 'help' && styles.intentTitleActive]}>我需要帮助</Text>
          <Text style={[styles.intentText, intent === 'help' && styles.intentTextActive]}>匹配 I CAN 挂单</Text>
        </Pressable>
      </View>
      {intent === 'help' ? (
        <View style={styles.quickMatchBox}>
          <Text style={styles.quickMatchTitle}>快速匹配</Text>
          <TextInput
            value={matchInput}
            onChangeText={setMatchInput}
            placeholder="例如：明天弘大附近帮我喂猫"
            placeholderTextColor={colors.muted}
            style={styles.quickMatchInput}
          />
          {matchInput ? (
            helpMatches.length ? (
              helpMatches.map((post) => (
                <Pressable
                  key={post.id}
                  style={styles.matchRow}
                  onPress={() => Alert.alert('站内打招呼', `已向 ${post.author || '帮助者'} 发送招呼。帮助者可在对话里报价，求助人可接受或议价。`)}
                >
                  <Text style={styles.matchTitle}>{post.title}</Text>
                  <Text style={styles.matchMeta}>I CAN · {post.category} · {post.author || '帮助者'}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.pageLead}>暂无对应挂单，将优先提示在线验证帮助者接收打招呼。</Text>
            )
          ) : null}
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelRail}>
        {categories.map((category) => (
          <Pressable key={category} onPress={() => setSelectedCategory(category)}>
            <Text style={[styles.channelChip, selectedCategory === category && styles.channelChipActive]}>{category}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.pageLead}>像刷内容一样找问题：先看悬赏、回答数和学校，再进详情判断是否需要继续问。</Text>
      {visibleQuestions.map((question) => (
        <QuestionRow key={question.id} question={question} onPress={() => onQuestion(question)} />
      ))}
    </ScrollView>
  )
}

function SolveScreen({ questions, onQuestion }: { questions: Question[]; onQuestion: (question: Question) => void }) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => Number(b.rewardPoints || 0) - Number(a.rewardPoints || 0)),
    [questions]
  )
  return (
    <ScrollView contentContainerStyle={styles.contentTight}>
      <View style={styles.solveBanner}>
        <Text style={styles.solveTitle}>助人工作台</Text>
        <Text style={styles.solveText}>优先处理高悬赏和你熟悉的学校/类别，回答前写清边界。</Text>
      </View>
      {sorted.map((question) => (
        <QuestionRow key={question.id} question={question} onPress={() => onQuestion(question)} />
      ))}
    </ScrollView>
  )
}

function PostsScreen({ posts, onPost }: { posts: Post[]; onPost: (post: Post) => void }) {
  const [selectedCategory, setSelectedCategory] = useState('推荐')
  const categories = useMemo(
    () => ['推荐', '免费', ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).slice(0, 6)] as string[],
    [posts]
  )
  const visiblePosts = useMemo(() => {
    if (selectedCategory === '推荐') return posts
    if (selectedCategory === '免费') return posts.filter((post) => Number(post.price || 0) <= 0)
    return posts.filter((post) => post.category === selectedCategory)
  }, [posts, selectedCategory])
  const leadPost = visiblePosts[0]
  const gridPosts = visiblePosts.slice(leadPost ? 1 : 0)
  const columns = useMemo(
    () =>
      gridPosts.reduce<[Post[], Post[]]>(
        (next, post, index) => {
          next[index % 2].push(post)
          return next
        },
        [[], []]
      ),
    [gridPosts]
  )

  return (
    <ScrollView contentContainerStyle={styles.contentTight}>
      <SearchBox placeholder="搜：艺术类入学、租房、签证、打工" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelRail}>
        {categories.map((category) => (
          <Pressable key={category} onPress={() => setSelectedCategory(category)}>
            <Text style={[styles.channelChip, selectedCategory === category && styles.channelChipActive]}>{category}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {leadPost ? <PostCard post={leadPost} index={0} onPress={() => onPost(leadPost)} featured /> : null}
      <View style={styles.masonryGrid}>
        {columns.map((column, columnIndex) => (
          <View key={`column-${columnIndex}`} style={styles.masonryColumn}>
            {column.map((post, index) => (
              <PostCard key={post.id} post={post} index={index + columnIndex} onPress={() => onPost(post)} compact />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

function ProfileScreen({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.profileHead}>
        <Text style={styles.profileAvatar}>{(user?.name || '售').slice(0, 1)}</Text>
        <View>
          <Text style={styles.profileName}>{user?.name || '售业用户'}</Text>
          <Text style={styles.profileSub}>
            {Number(user?.points || 0)} 消费积分 · {Number(user?.earningPoints || 0)} 可提现积分
          </Text>
        </View>
      </View>
      <View style={styles.profilePanel}>
        <Text style={styles.panelTitle}>账号状态</Text>
        <Text style={styles.panelText}>
          {user ? `${user.email} · ${user.identity} · ${user.school}` : '请先登录或注册账号。'}
        </Text>
        <Text style={styles.panelText}>
          {user?.verificationStatus === 'approved' ? '认证已通过' : user?.verificationStatus === 'rejected' ? '认证未通过，可重新提交材料。' : '认证待审核，材料和商家权限会继续走后台审核。'}
        </Text>
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

function QuestionRow({ question, onPress, compact = false }: { question: Question; onPress: () => void; compact?: boolean }) {
  const solved = question.status === 'solved'
  return (
    <Pressable style={[styles.questionRow, compact && styles.questionRowCompact]} onPress={onPress}>
      <View style={styles.questionTop}>
        <Text style={styles.questionCategory}>{question.category || '求助'}</Text>
        <Text style={styles.reward}>{Number(question.rewardPoints || 0)} 积分</Text>
      </View>
      <Text style={styles.questionTitle} numberOfLines={compact ? 2 : 3}>{question.title}</Text>
      <Text style={styles.questionDesc} numberOfLines={compact ? 3 : 2}>{question.detail || '等待补充详情。'}</Text>
      <View style={styles.rowMeta}>
        <Text style={styles.metaText}>{question.school || '韩国留学'}</Text>
        <Text style={[styles.statusText, solved ? styles.statusSolved : styles.statusOpen]}>{solved ? '已解决' : '待回答'}</Text>
      </View>
      <View style={styles.questionMetricRow}>
        <Text style={styles.questionMetric}>{Number(question.answersCount || 0)} 回答</Text>
        <Text style={styles.questionMetric}>{compactCount(question.views)} 浏览</Text>
      </View>
    </Pressable>
  )
}

function PostCard({ post, index, onPress, compact = false, featured = false }: { post: Post; index: number; onPress: () => void; compact?: boolean; featured?: boolean }) {
  const isFree = Number(post.price || 0) <= 0
  return (
    <Pressable style={[styles.postCard, compact && styles.postCardCompact, featured && styles.postCardFeatured]} onPress={onPress}>
      <Image source={{ uri: post.image || imageFor(index) }} style={[styles.postImage, compact && (index % 3 === 0 ? styles.postImageTall : styles.postImageCompact)]} />
      <View style={[styles.postBody, compact && styles.postBodyCompact]}>
        <View style={styles.postChipRow}>
          <Text style={[styles.postChip, isFree ? styles.freeChip : styles.paidChip]}>{isFree ? '免费经验' : `${post.price} 积分`}</Text>
          {post.featured || post.isFeatured ? <Text style={[styles.postChip, styles.featuredChip]}>精华</Text> : null}
          {!compact ? <Text style={styles.postChip}>{post.category || '经验'}</Text> : null}
        </View>
        <Text style={[styles.postTitle, compact && styles.postTitleCompact]} numberOfLines={compact ? 3 : 2}>{post.title}</Text>
        {!compact ? <Text style={styles.postDesc} numberOfLines={2}>{post.summary || post.excerpt || post.body || ''}</Text> : null}
        <View style={styles.creatorRow}>
          <Text style={styles.creatorAvatar}>{(post.author || '售').slice(0, 1)}</Text>
          <Text style={styles.creatorName} numberOfLines={1}>{post.author || '售业用户'}</Text>
          <Text style={styles.likeText}>♥ {compactCount(post.likes)}</Text>
        </View>
      </View>
    </Pressable>
  )
}

function PostStoryCard({ post, index, onPress }: { post: Post; index: number; onPress: () => void }) {
  return (
    <Pressable style={styles.storyCard} onPress={onPress}>
      <ImageBackground source={{ uri: post.image || imageFor(index) }} resizeMode="cover" style={styles.storyImage}>
        <View style={styles.storyShade} />
        <Text style={styles.storyBadge}>{post.category || '经验'}</Text>
        <Text style={styles.storyTitle} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.storyMeta}>{compactCount(post.likes)} 赞 · {post.author || '售业用户'}</Text>
      </ImageBackground>
    </Pressable>
  )
}

function MerchantCard({ merchant, decoration }: { merchant: ManagedMerchant; decoration?: MerchantBrandDecoration }) {
  const logoImage = decoration?.logoReviewStatus === 'approved' && decoration.logoImage ? decoration.logoImage : merchant.logoImage
  const title = decoration?.heroTitle || merchant.summary || merchant.name
  const desc = decoration?.intro || merchant.description || merchant.detailTone || merchant.summary
  const tags = merchant.tags?.length ? merchant.tags : [merchant.category]

  return (
    <View style={[styles.merchantCard, merchant.level === 'pinned' && styles.merchantPinnedCard]}>
      <View style={styles.merchantLogoWrap}>
        {logoImage ? <Image source={{ uri: logoImage }} style={styles.merchantLogoImage} /> : <Text style={styles.merchantLogoText}>{merchant.logo || merchant.name.slice(0, 1)}</Text>}
      </View>
      <View style={styles.merchantBody}>
        <View style={styles.merchantTitleRow}>
          <Text style={styles.merchantName}>{merchant.name}</Text>
          {merchant.level === 'pinned' ? <Text style={styles.merchantPinnedBadge}>置顶</Text> : null}
        </View>
        <Text style={styles.merchantCategory}>{merchant.category} · {merchant.location || '韩国'}</Text>
        <Text style={styles.merchantSummary} numberOfLines={2}>{title}</Text>
        {desc ? <Text style={styles.merchantDesc} numberOfLines={2}>{desc}</Text> : null}
        <View style={styles.merchantTags}>
          {tags.slice(0, 3).map((tag) => (
            <Text key={`${merchant.id}-${tag}`} style={styles.merchantTag}>{tag}</Text>
          ))}
        </View>
      </View>
    </View>
  )
}

function PostDetail({ post, onBack }: { post: Post; onBack: () => void }) {
  const body = post.body || post.excerpt || post.summary || ''
  const paragraphs = body.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  const isFree = Number(post.price || 0) <= 0

  return (
    <ScrollView style={styles.detailPage} contentContainerStyle={styles.detailContent}>
      <ImageBackground source={{ uri: post.image || imageFor(1) }} resizeMode="cover" style={styles.detailHero}>
        <View style={styles.detailShade} />
        <BackIconButton onPress={onBack} light floating />
        <View style={styles.detailHeroCopy}>
          <Text style={[styles.detailBadge, isFree ? styles.freeBadge : styles.paidBadge]}>{isFree ? '免费经验' : '积分看帖'}</Text>
          <Text style={styles.detailTitle}>{post.title}</Text>
          <Text style={styles.detailSummary}>{post.summary || post.excerpt}</Text>
          <View style={styles.detailCreatorRow}>
            <Text style={styles.detailCreatorAvatar}>{(post.author || '售').slice(0, 1)}</Text>
            <View style={styles.detailCreatorCopy}>
              <Text style={styles.detailCreatorName}>{post.author || '售业用户'}</Text>
              <Text style={styles.detailCreatorMeta}>{post.school || '韩国留学'} · {post.category || '经验'}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
      <View style={styles.articleActionStrip}>
        <Text style={styles.articleAction}>♥ {compactCount(post.likes)} 点赞</Text>
        <Text style={styles.articleAction}>☆ {compactCount(post.bookmarks)} 收藏</Text>
        <Text style={styles.articleAction}>{formatDate(post.updatedAt || post.createdAt)} · {readMinutes(body)} 分钟</Text>
      </View>
      {isFree ? (
        <Text style={styles.freeNotice}>作者设置为免费可见。觉得有帮助可以点赞，点赞会为作者累计经验成长。</Text>
      ) : (
        <Pressable style={styles.unlockButton}>
          <Text style={styles.unlockText}>{post.price} 积分看帖</Text>
        </Pressable>
      )}
      {paragraphs.map((paragraph, index) => (
        <Text key={`${post.id}-${index}`} style={styles.articleText}>{paragraph}</Text>
      ))}
      <View style={styles.detailBottomActions}>
        <Text style={styles.detailBottomGhost}>收藏</Text>
        <Text style={styles.detailBottomPrimary}>{isFree ? '点赞支持作者' : `${post.price} 积分解锁`}</Text>
      </View>
    </ScrollView>
  )
}

function QuestionDetail({ question, role, onBack }: { question: Question; role: 'reader' | 'helper'; onBack: () => void }) {
  const solved = question.status === 'solved'
  return (
    <ScrollView style={styles.detailPage} contentContainerStyle={styles.detailContent}>
      <View style={styles.questionDetailHero}>
        <BackIconButton onPress={onBack} light floating />
        <Text style={styles.questionDetailMode}>{role === 'helper' ? '助人模式' : '求助详情'}</Text>
        <Text style={styles.questionDetailTitle}>{question.title}</Text>
        <Text style={styles.questionDetailDesc}>{question.detail}</Text>
        <View style={styles.questionDetailStats}>
          <View>
            <Text style={styles.questionDetailNumber}>{Number(question.rewardPoints || 0)}</Text>
            <Text style={styles.questionDetailLabel}>悬赏积分</Text>
          </View>
          <View>
            <Text style={styles.questionDetailNumber}>{Number(question.answersCount || 0)}</Text>
            <Text style={styles.questionDetailLabel}>已有回答</Text>
          </View>
          <View>
            <Text style={styles.questionDetailNumber}>{compactCount(question.views)}</Text>
            <Text style={styles.questionDetailLabel}>浏览</Text>
          </View>
        </View>
      </View>
      <View style={styles.questionContextPanel}>
        <Text style={styles.questionContextChip}>{question.category || '求助'}</Text>
        <Text style={styles.questionContextTitle}>{question.school || '韩国留学'} · {solved ? '已解决' : '等待更好的方案'}</Text>
        <Text style={styles.questionContextText}>回答时尽量写清材料、时间线、风险边界和是否来自个人经历。</Text>
      </View>
      <View style={styles.answerPanel}>
        <Text style={styles.panelTitle}>{role === 'helper' ? '我来回答' : '已有回答'}</Text>
        <Text style={styles.panelText}>
          {role === 'helper'
            ? '把步骤写具体，材料名称别写错；被采纳后进入积分结算。'
            : '这里会展示已采纳回答、补充回答和平台提醒。'}
        </Text>
        {role === 'helper' ? <TextInput style={styles.answerInput} multiline placeholder="写清步骤、材料和注意事项" /> : null}
        {role === 'helper' ? <Text style={styles.answerSubmit}>提交回答/帮助方案</Text> : <Text style={styles.answerSubmit}>查看全部回答</Text>}
      </View>
    </ScrollView>
  )
}

function BackIconButton({ onPress, light = false, floating = false }: { onPress: () => void; light?: boolean; floating?: boolean }) {
  return (
    <Pressable style={[styles.backButton, floating && styles.backButtonFloating, light && styles.backButtonLight]} onPress={onPress} hitSlop={12} accessibilityRole="button" accessibilityLabel="返回上一页">
      <Text style={[styles.backChevronGlyph, light && styles.backChevronGlyphLight]}>‹</Text>
    </Pressable>
  )
}

function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => (
        <Pressable key={tab.key} style={styles.navItem} onPress={() => onChange(tab.key)}>
          <Text style={[styles.navText, active === tab.key && styles.navTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

function SectionTitle({ title, action }: { title: string; action: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionAction}>{action}</Text>
    </View>
  )
}

function SearchBox({ placeholder }: { placeholder: string }) {
  return <TextInput style={styles.searchBox} placeholder={placeholder} placeholderTextColor="#899194" />
}

function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.red} />
      <Text style={styles.loadingText}>正在读取售业内容...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.paper
  },
  shell: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: 34
  },
  loginPage: {
    flex: 1,
    backgroundColor: '#070b0c'
  },
  loginVideo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  loginPoster: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  loginVideoHidden: {
    opacity: 0
  },
  loginVideoShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  loginScroll: {
    flex: 1
  },
  loginContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 86,
    paddingBottom: 68
  },
  authHelp: {
    position: 'absolute',
    top: 54,
    right: 28,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  authHelpText: {
    color: 'rgba(255,253,247,0.72)',
    fontSize: 14,
    fontWeight: '800'
  },
  authBrand: {
    alignItems: 'center',
    marginTop: 26
  },
  authLogo: {
    width: 176,
    height: 108
  },
  authCopy: {
    marginTop: 24,
    alignItems: 'center'
  },
  authTitle: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center'
  },
  authDesc: {
    marginTop: 12,
    maxWidth: 286,
    color: 'rgba(255,253,247,0.7)',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center'
  },
  authPanel: {
    marginTop: 54
  },
  authModeSwitch: {
    minHeight: 48,
    marginBottom: 16,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,253,247,0.18)',
    backgroundColor: 'rgba(255,253,247,0.1)',
    flexDirection: 'row'
  },
  authModeButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  authModeButtonActive: {
    backgroundColor: colors.white
  },
  authModeText: {
    color: 'rgba(255,253,247,0.72)',
    fontSize: 14,
    fontWeight: '900'
  },
  authModeTextActive: {
    color: '#242b2e'
  },
  registerFields: {
    gap: 10,
    marginBottom: 10
  },
  registerIntro: {
    color: 'rgba(255,253,247,0.72)',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800'
  },
  authFieldLabel: {
    color: 'rgba(255,253,247,0.68)',
    fontSize: 12,
    fontWeight: '900'
  },
  authChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  authChip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,253,247,0.18)',
    backgroundColor: 'rgba(255,253,247,0.08)'
  },
  authChipActive: {
    backgroundColor: colors.white,
    borderColor: colors.white
  },
  authChipText: {
    color: 'rgba(255,253,247,0.7)',
    fontSize: 12,
    fontWeight: '900'
  },
  authChipTextActive: {
    color: '#242b2e'
  },
  authInlineRow: {
    flexDirection: 'row',
    gap: 10
  },
  authInlineInput: {
    flex: 1
  },
  sendCodeButton: {
    minHeight: 48,
    minWidth: 96,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white
  },
  sendCodeButtonText: {
    color: '#242b2e',
    fontSize: 13,
    fontWeight: '900'
  },
  formButtonDisabled: {
    opacity: 0.58
  },
  wechatLogin: {
    minHeight: 54,
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#13c264',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#13c264',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  },
  wechatLoginLoading: {
    opacity: 0.86
  },
  wechatIcon: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: -3
  },
  wechatLoginText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900'
  },
  otherLogin: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6
  },
  otherLoginText: {
    color: 'rgba(255,253,247,0.78)',
    fontSize: 14,
    fontWeight: '800'
  },
  chevron: {
    color: 'rgba(255,253,247,0.72)',
    fontSize: 18,
    fontWeight: '900'
  },
  emailLogin: {
    gap: 10,
    marginBottom: 16
  },
  authInput: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,253,247,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,253,247,0.18)',
    color: colors.white,
    fontSize: 15,
    fontWeight: '700'
  },
  emailLoginButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white
  },
  emailLoginButtonText: {
    color: '#242b2e',
    fontSize: 15,
    fontWeight: '900'
  },
  authAgreement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 6
  },
  agreeDot: {
    width: 15,
    height: 15,
    marginTop: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,253,247,0.72)'
  },
  agreeDotChecked: {
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: '#242b2e'
  },
  agreeText: {
    flex: 1,
    color: 'rgba(255,253,247,0.66)',
    fontSize: 12,
    lineHeight: 22,
    fontWeight: '700'
  },
  agreeLink: {
    color: colors.white,
    fontWeight: '900'
  },
  authNotice: {
    marginTop: 12,
    color: '#ffdb7a',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center'
  },
  recoverLink: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 34
  },
  recoverLinkText: {
    color: 'rgba(255,253,247,0.68)',
    fontSize: 13,
    fontWeight: '800'
  },
  entry: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 30
  },
  entryShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9, 16, 18, 0.68)'
  },
  entryPoster: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  entryVideo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  entryVideoHidden: {
    opacity: 0
  },
  entryBrand: {
    marginTop: 0
  },
  entryLogo: {
    width: 148,
    height: 74
  },
  entryCopy: {
    marginTop: 72
  },
  entryTitle: {
    color: colors.white,
    fontSize: 35,
    fontWeight: '900',
    lineHeight: 42
  },
  entryDesc: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700'
  },
  entryActions: {
    gap: 14,
    marginTop: 74,
    marginBottom: 0
  },
  entryButton: {
    minHeight: 104,
    borderRadius: 28,
    padding: 22,
    justifyContent: 'center'
  },
  askButton: {
    backgroundColor: colors.red
  },
  helpButton: {
    backgroundColor: colors.white
  },
  entryButtonTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900'
  },
  entryButtonText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    fontWeight: '700'
  },
  helpButtonTitle: {
    color: '#2d3436'
  },
  helpButtonText: {
    color: '#4f5a5d'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  headerLogoButton: {
    width: 58,
    height: 38,
    justifyContent: 'center'
  },
  headerLogoImage: {
    width: 58,
    height: 38
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900'
  },
  headerSub: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700'
  },
  content: {
    padding: 18,
    paddingBottom: 110
  },
  contentTight: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 110
  },
  heroPanel: {
    padding: 24,
    borderRadius: 30,
    backgroundColor: colors.green
  },
  kicker: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900'
  },
  heroTitle: {
    marginTop: 10,
    color: colors.white,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900'
  },
  heroDesc: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700'
  },
  heroStats: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  heroStatNumber: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900'
  },
  heroStatLabel: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '800'
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900'
  },
  sectionAction: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900'
  },
  searchBox: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700'
  },
  pageLead: {
    marginTop: 14,
    marginBottom: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700'
  },
  intentSwitch: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12
  },
  intentCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  intentCardActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  intentTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900'
  },
  intentTitleActive: {
    color: colors.white
  },
  intentText: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800'
  },
  intentTextActive: {
    color: 'rgba(255,255,255,0.72)'
  },
  quickMatchBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.surface
  },
  quickMatchTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10
  },
  quickMatchInput: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700'
  },
  matchRow: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.white
  },
  matchTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900'
  },
  matchMeta: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800'
  },
  storyRail: {
    gap: 12,
    paddingRight: 18
  },
  storyCard: {
    width: 214,
    height: 286,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: colors.ink
  },
  storyImage: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  storyShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8,13,15,0.34)'
  },
  storyBadge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    marginLeft: 14,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900'
  },
  storyTitle: {
    paddingHorizontal: 14,
    color: colors.white,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900'
  },
  storyMeta: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 16,
    color: 'rgba(255,255,255,0.74)',
    fontSize: 12,
    fontWeight: '800'
  },
  questionRail: {
    gap: 12,
    paddingRight: 18
  },
  channelRail: {
    gap: 10,
    paddingTop: 14,
    paddingBottom: 14,
    paddingRight: 16
  },
  channelChip: {
    overflow: 'hidden',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    color: colors.muted,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 13,
    fontWeight: '900'
  },
  channelChipActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
    color: colors.white
  },
  solveBanner: {
    padding: 22,
    borderRadius: 26,
    backgroundColor: colors.ink,
    marginBottom: 14
  },
  solveTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900'
  },
  solveText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700'
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 16
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surface,
    color: colors.muted,
    fontWeight: '900'
  },
  filterActive: {
    backgroundColor: colors.ink,
    color: colors.white
  },
  questionRow: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.white,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line
  },
  questionRowCompact: {
    width: 252,
    minHeight: 188,
    marginBottom: 0
  },
  questionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  questionCategory: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900'
  },
  reward: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900'
  },
  questionTitle: {
    color: colors.ink,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900'
  },
  questionDesc: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700'
  },
  rowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 14
  },
  metaText: {
    flexShrink: 1,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800'
  },
  statusText: {
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900'
  },
  statusSolved: {
    backgroundColor: 'rgba(15,43,34,0.1)',
    color: colors.green
  },
  statusOpen: {
    backgroundColor: 'rgba(227,76,91,0.12)',
    color: colors.red
  },
  questionMetricRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  questionMetric: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800'
  },
  masonryGrid: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start'
  },
  masonryColumn: {
    flex: 1
  },
  postCard: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: colors.white,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.line
  },
  postCardCompact: {
    borderRadius: 20,
    marginBottom: 10
  },
  postCardFeatured: {
    borderColor: 'rgba(227,76,91,0.22)'
  },
  postImage: {
    width: '100%',
    height: 180
  },
  postImageCompact: {
    height: 132
  },
  postImageTall: {
    height: 176
  },
  postBody: {
    padding: 18
  },
  postBodyCompact: {
    padding: 11
  },
  postChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  postChip: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surface,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900'
  },
  freeChip: {
    backgroundColor: 'rgba(227,76,91,0.12)',
    color: colors.red
  },
  paidChip: {
    backgroundColor: 'rgba(201,154,46,0.18)',
    color: '#8a640a'
  },
  featuredChip: {
    backgroundColor: 'rgba(9,17,19,0.9)',
    color: colors.white
  },
  postTitle: {
    color: colors.ink,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900'
  },
  postTitleCompact: {
    fontSize: 15,
    lineHeight: 21
  },
  postDesc: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700'
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 13
  },
  creatorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900'
  },
  creatorName: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800'
  },
  likeText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900'
  },
  merchantCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: colors.white,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line
  },
  merchantPinnedCard: {
    borderColor: 'rgba(201,154,46,0.55)',
    backgroundColor: '#fffaf0'
  },
  merchantLogoWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.ink
  },
  merchantLogoImage: {
    width: '100%',
    height: '100%'
  },
  merchantLogoText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900'
  },
  merchantBody: {
    flex: 1
  },
  merchantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  merchantName: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900'
  },
  merchantPinnedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.gold,
    color: colors.white,
    fontSize: 11,
    fontWeight: '900'
  },
  merchantCategory: {
    marginTop: 3,
    color: colors.red,
    fontSize: 12,
    fontWeight: '900'
  },
  merchantSummary: {
    marginTop: 8,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800'
  },
  merchantDesc: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700'
  },
  merchantTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 9
  },
  merchantTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surface,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800'
  },
  profileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14
  },
  profileAvatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.ink,
    color: colors.white,
    fontSize: 26,
    fontWeight: '900'
  },
  profileName: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900'
  },
  profileSub: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700'
  },
  profilePanel: {
    marginTop: 18,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.surface
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900'
  },
  panelText: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700'
  },
  logoutButton: {
    minHeight: 46,
    marginTop: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900'
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9
  },
  navText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900'
  },
  navTextActive: {
    color: colors.red
  },
  detailShell: {
    flex: 1,
    backgroundColor: colors.paper
  },
  detailPage: {
    flex: 1,
    backgroundColor: colors.paper
  },
  detailContent: {
    paddingBottom: 120
  },
  backButton: {
    width: 48,
    height: 48,
    marginLeft: 8,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButtonFloating: {
    position: 'absolute',
    top: 34,
    left: 8,
    zIndex: 5,
    marginLeft: 0,
    marginTop: 0
  },
  backButtonLight: {
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.24)'
  },
  backChevronGlyph: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '900',
    includeFontPadding: false
  },
  backChevronGlyphLight: {
    color: colors.white
  },
  detailHero: {
    minHeight: 520,
    justifyContent: 'flex-end'
  },
  detailShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(10,18,20,0.52)'
  },
  detailHeroCopy: {
    paddingHorizontal: 22,
    paddingBottom: 26
  },
  detailBadge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: colors.white,
    fontSize: 12,
    fontWeight: '900'
  },
  freeBadge: {
    backgroundColor: colors.red
  },
  paidBadge: {
    backgroundColor: colors.gold
  },
  detailTitle: {
    marginTop: 16,
    color: colors.white,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '900'
  },
  detailSummary: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700'
  },
  detailCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20
  },
  detailCreatorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  detailCreatorCopy: {
    flex: 1
  },
  detailCreatorName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900'
  },
  detailCreatorMeta: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    fontWeight: '800'
  },
  detailTitleDark: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '900',
    marginTop: 10
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  articleActionStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.white
  },
  articleAction: {
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900'
  },
  freeNotice: {
    margin: 22,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(227,76,91,0.08)',
    color: colors.red,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '800'
  },
  unlockButton: {
    margin: 22,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red
  },
  unlockText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900'
  },
  articleText: {
    paddingHorizontal: 22,
    marginTop: 18,
    color: '#313a3d',
    fontSize: 17,
    lineHeight: 30,
    fontWeight: '600'
  },
  detailBottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 22,
    marginTop: 26
  },
  detailBottomGhost: {
    flex: 1,
    overflow: 'hidden',
    minHeight: 50,
    borderRadius: 999,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900'
  },
  detailBottomPrimary: {
    flex: 1.5,
    overflow: 'hidden',
    minHeight: 50,
    borderRadius: 999,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.red,
    color: colors.white,
    fontSize: 15,
    fontWeight: '900'
  },
  questionDetailHead: {
    margin: 18,
    padding: 22,
    borderRadius: 26,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  questionDetailHero: {
    minHeight: 430,
    paddingHorizontal: 22,
    paddingTop: 100,
    paddingBottom: 28,
    justifyContent: 'flex-end',
    backgroundColor: colors.ink
  },
  questionDetailMode: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.red,
    color: colors.white,
    fontSize: 12,
    fontWeight: '900'
  },
  questionDetailTitle: {
    marginTop: 18,
    color: colors.white,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900'
  },
  questionDetailDesc: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.74)',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '700'
  },
  questionDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)'
  },
  questionDetailNumber: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900'
  },
  questionDetailLabel: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '800'
  },
  questionContextPanel: {
    marginHorizontal: 18,
    marginTop: 18,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  questionContextChip: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(227,76,91,0.1)',
    color: colors.red,
    fontSize: 12,
    fontWeight: '900'
  },
  questionContextTitle: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900'
  },
  questionContextText: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700'
  },
  answerPanel: {
    marginHorizontal: 18,
    marginTop: 14,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.surface
  },
  answerInput: {
    marginTop: 16,
    minHeight: 120,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.white,
    textAlignVertical: 'top',
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700'
  },
  answerSubmit: {
    overflow: 'hidden',
    minHeight: 50,
    marginTop: 16,
    borderRadius: 999,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.ink,
    color: colors.white,
    fontSize: 15,
    fontWeight: '900'
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
    fontWeight: '800'
  }
})
