import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  BookOpenCheck,
  BookOpenText,
  Coins,
  GraduationCap,
  LockKeyhole,
  LogIn,
  MapPin,
  MessageSquareText,
  PenLine,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  X,
} from 'lucide-react'
import './App.css'
import { getSchoolTopicBySlug } from './data/schools'

type UserStatus = 'active' | 'muted' | 'banned'
type VerificationStatus = 'pending' | 'approved' | 'rejected'

type CredentialDocument = {
  id: string
  name: string
  type: string
  status: VerificationStatus
  uploadedAt: string
}

type User = {
  id: string
  name: string
  email: string
  password: string
  identity: string
  school: string
  points: number
  earningPoints: number
  joinedAt: string
  status: UserStatus
  verificationStatus: VerificationStatus
  avatarUrl: string
  bio: string
  documents: CredentialDocument[]
}

type PartnerApplication = {
  id: string
  company: string
  type: string
  contact: string
  phone: string
  direction: string
  budget: string
  detail: string
  status: 'pending' | 'contacted' | 'closed'
  createdAt: string
}

type Post = {
  id: string
  title: string
  school: string
  category: string
  author: string
  authorId?: string
  country?: string
  city?: string
  identity?: string
  views?: number
  likes?: number
  bookmarks?: number
  tags?: string[]
  contentType?: string
  price: number
  hot: string
  excerpt: string
  body: string
  createdAt: string
  featured: boolean
}

type QuestionStatus = 'open' | 'solved'

type CommunityQuestion = {
  id: string
  title: string
  category: string
  country: string
  city: string
  school: string
  rewardPoints: number
  answersCount: number
  views: number
  status: QuestionStatus
  createdAt: string
  author: string
  identity: string
  tags: string[]
  detail: string
}

type QuestionAnswer = {
  id: string
  questionId: string
  author: string
  identity: string
  content: string
  likes: number
  accepted: boolean
  createdAt: string
}

type CityGuide = {
  id: string
  title: string
  category: string
  country: string
  city: string
  school: string
  summary: string
  tags: string[]
  updatedAt: string
}

type SchoolProfile = {
  id: string
  name: string
  englishName: string
  region: string
  city: string
  landmark: string
  image: string
  description: string
  programs: string[]
  strengths: string[]
  source: string
}

type CampusLink = {
  label: string
  url: string
  icon: 'pin' | 'building' | 'language'
}

type StoredState = {
  users: User[]
  posts: Post[]
  partnerApplications: PartnerApplication[]
  currentUserId: string | null
  unlockedPostIds: Record<string, string[]>
  siteContent: SiteContentSettings
}

type SiteContentSettings = {
  heroEyebrow: string
  heroTitle: string
  heroCopy: string
  heroSubcopy: string
  searchPlaceholder: string
  askButtonText: string
  shareButtonText: string
  metricAskTitle: string
  metricAskCopy: string
  metricExperienceTitle: string
  metricExperienceCopy: string
  metricRewardTitle: string
  metricRewardCopy: string
  mobileLogoWidth: number
  mobileHeroTitleSize: number
  mobileHeroCopySize: number
  mobileSearchScale: number
}

const heroImage =
  'https://images.unsplash.com/photo-1742747215638-0105cbcd2645?auto=format&fit=crop&q=80&w=2200'

const defaultSiteContent: SiteContentSettings = {
  heroEyebrow: '留学生经验分享与问题解决平台',
  heroTitle: '留学生的第一站',
  heroCopy: '签证、租房、入学、打工、保险、银行卡、毕业、就业，真实留学生经验帮你少走弯路。',
  heroSubcopy: '你可以在这里提问，也可以分享自己的留学经验，通过高质量回答和经验帖获得收益。',
  searchPlaceholder: '搜索：D-2签证、租房保证金、外国人登录证、打工、论文延期...',
  askButtonText: '我要提问',
  shareButtonText: '我要分享经验赚钱',
  metricAskTitle: '提问',
  metricAskCopy: '把签证、租房、入学和生活问题讲清楚',
  metricExperienceTitle: '经验',
  metricExperienceCopy: '真实留学生复盘避坑、流程和材料细节',
  metricRewardTitle: '收益',
  metricRewardCopy: '被采纳回答、悬赏问答和精华攻略获得回报',
  mobileLogoWidth: 82,
  mobileHeroTitleSize: 50,
  mobileHeroCopySize: 32,
  mobileSearchScale: 1.3,
}

const normalizeSiteContent = (content?: Partial<SiteContentSettings>): SiteContentSettings => ({
  ...defaultSiteContent,
  ...(content ?? {}),
  mobileLogoWidth: Math.min(110, Math.max(48, Number(content?.mobileLogoWidth ?? defaultSiteContent.mobileLogoWidth))),
  mobileHeroTitleSize: Math.min(
    72,
    Math.max(34, Number(content?.mobileHeroTitleSize ?? defaultSiteContent.mobileHeroTitleSize)),
  ),
  mobileHeroCopySize: Math.min(48, Math.max(18, Number(content?.mobileHeroCopySize ?? defaultSiteContent.mobileHeroCopySize))),
  mobileSearchScale: Math.min(2.2, Math.max(0.9, Number(content?.mobileSearchScale ?? defaultSiteContent.mobileSearchScale))),
})

const storageKey = 'shouye-platform-mvp-v1'
const adminSessionKey = 'shouye-platform-admin-session'
const registerBonusPoints = 30
const postApprovedBonusPoints = 10
const rechargePointsPerYuan = 10
const cashoutPointsPerYuan = 100 / 6
const minimumCashoutPoints = 1700
const categories = [
  '签证/滞留资格',
  '入学/选课/学分',
  '语学院/本科/大学院',
  '租房/搬家/保证金',
  '银行卡/手机卡/保险',
  '打工/劳动纠纷',
  '医院/看病/药店',
  '毕业/论文/延毕',
  '求职/实习/简历',
  '二手交易/搬家处理',
  '学校评价',
  '城市生活攻略',
]
const allCategoryLabel = '全部'
const categoryFilters = [allCategoryLabel, ...categories]
const schoolPageSize = 8

const fileImage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1800`

type CommonsImagePage = {
  imageinfo?: { thumburl?: string; url?: string }[]
}

const getFallbackGalleryImages = (school: SchoolProfile) => {
  const region = schoolRegions.find((group) => group.schools.some((item) => item.id === school.id))
  const siblingImages = region?.schools
    .filter((item) => item.id !== school.id)
    .slice(0, 2)
    .map((item) => item.image) ?? []

  return [school.image, ...siblingImages, heroImage].slice(0, 3)
}

const schoolRegions: { region: string; summary: string; schools: SchoolProfile[] }[] = [
  {
    region: '首尔',
    summary: '优先展示 QS 2026 排名前列院校，并覆盖艺术、女子大学、理工类和高频申请院校。',
    schools: [
      {
        id: 'snu',
        name: '首尔大学',
        englishName: 'Seoul National University',
        region: '首尔',
        city: '冠岳区',
        landmark: '冠岳校区正门与主轴线',
        image: fileImage('Seoul National University 20171026 164458.jpg'),
        description: '韩国国立大学代表，研究资源强，理工、人文社科、经营、国际大学院都适合重点关注。',
        programs: ['经营', '工科', '国际大学院', '人文社科'],
        strengths: ['国立旗舰', '研究资源强', '申请竞争高'],
        source: 'https://commons.wikimedia.org/wiki/File:Seoul_National_University_20171026_164458.jpg',
      },
      {
        id: 'yonsei',
        name: '延世大学',
        englishName: 'Yonsei University',
        region: '首尔',
        city: '西大门区 · 新村',
        landmark: '新村校区本馆',
        image: fileImage('Yonsei-university-main-building.jpg'),
        description: '韩国私立名校代表，新村生活便利，语学堂、经营、传媒、国际学方向关注度高。',
        programs: ['语学堂', '经营', '传媒', '国际学'],
        strengths: ['校园辨识度高', '新村生活圈', '国际学生多'],
        source: 'https://commons.wikimedia.org/wiki/File:Yonsei-university-main-building.jpg',
      },
      {
        id: 'korea',
        name: '高丽大学',
        englishName: 'Korea University',
        region: '首尔',
        city: '城北区 · 安岩',
        landmark: '安岩校区 Main Hall',
        image: fileImage('Korea University Main Hall.jpg'),
        description: '以石造建筑和虎文化闻名，商科、传媒、法政、工科和交换项目很受申请者关注。',
        programs: ['商科', '传媒', '法政', '工科'],
        strengths: ['校友网络强', '校园氛围浓', '专业选择多'],
        source: 'https://commons.wikimedia.org/wiki/File:Korea_University_Main_Hall.jpg',
      },
      {
        id: 'skku-seoul',
        name: '成均馆大学',
        englishName: 'Sungkyunkwan University',
        region: '首尔 / 京畿道',
        city: '钟路区 / 水原',
        landmark: '明伦校区与自然科学校区',
        image: fileImage('Sungkyunkwan University Station view.jpg'),
        description: '韩国传统名校之一，人文社科在首尔、理工自然科学多在水原，半导体、经营、传媒和工科方向关注度高。',
        programs: ['半导体', '经营', '传媒', '人文社科'],
        strengths: ['QS前列', '三星背景', '双校区'],
        source: 'https://commons.wikimedia.org/wiki/File:Sungkyunkwan_University_Station_view.jpg',
      },
      {
        id: 'hanyang',
        name: '汉阳大学',
        englishName: 'Hanyang University',
        region: '首尔',
        city: '城东区 · 往十里',
        landmark: '工科与都市型校区',
        image: fileImage('Hanyang University Erica Campus Fountain (South Korea) - 2024.jpg'),
        description: '工科、产业合作和实用型专业优势明显，首尔校区交通方便，ERICA 校区也适合工科方向。',
        programs: ['工科', '建筑', '经营', '艺术'],
        strengths: ['工科强', '实习机会多', '交通便利'],
        source: 'https://commons.wikimedia.org/wiki/Category:Hanyang_University_-_ERICA_Campus',
      },
      {
        id: 'kyunghee',
        name: '庆熙大学',
        englishName: 'Kyung Hee University',
        region: '首尔',
        city: '东大门区',
        landmark: '首尔校区本馆',
        image: fileImage('Kyung Hee Univ. Administration Building(Seoul Campus).JPG'),
        description: '校园建筑辨识度很高，酒店观光、传媒、经营、国际学和语学堂方向经常被咨询。',
        programs: ['酒店观光', '传媒', '经营', '语学堂'],
        strengths: ['建筑漂亮', '文商科热门', '国际学生多'],
        source: 'https://commons.wikimedia.org/wiki/File:Kyung_Hee_Univ._Administration_Building(Seoul_Campus).JPG',
      },
      {
        id: 'sejong',
        name: '世宗大学',
        englishName: 'Sejong University',
        region: '首尔',
        city: '广津区',
        landmark: '儿童大公园旁校园',
        image: fileImage('Sejong University Seoul Korea.jpg'),
        description: '酒店观光、经营、动画、AI与软件方向热度高，位置靠近儿童大公园，生活交通方便。',
        programs: ['酒店观光', 'AI', '软件', '动画'],
        strengths: ['QS上升快', '文理兼顾', '交通便利'],
        source: 'https://commons.wikimedia.org/wiki/Category:Sejong_University',
      },
      {
        id: 'cau',
        name: '中央大学',
        englishName: 'Chung-Ang University',
        region: '首尔',
        city: '铜雀区 · 黑石',
        landmark: '310馆百周年纪念馆',
        image: fileImage('Chung-Ang University Building 310 (100th Anniversary Hall).jpg'),
        description: '影像、戏剧、传媒、艺术和商科方向很受中国学生关注，首尔校区坡度较大，选课动线要提前看。',
        programs: ['传媒', '戏剧影视', '艺术', '经营'],
        strengths: ['艺术传媒强', '地铁可达', '申请热度高'],
        source: 'https://commons.wikimedia.org/wiki/Category:Chung-Ang_University',
      },
      {
        id: 'ewha',
        name: '梨花女子大学',
        englishName: 'Ewha Womans University',
        region: '首尔',
        city: '西大门区',
        landmark: 'ECC 与梨花校园谷',
        image: fileImage('Ewha Womans University Campus new.jpg'),
        description: '女子大学代表，ECC 建筑非常有辨识度，设计、教育、国际学、经营等方向适合重点查看。',
        programs: ['设计', '教育', '国际学', '经营'],
        strengths: ['校园现代', '女性教育传统', '生活便利'],
        source: 'https://commons.wikimedia.org/wiki/File:Ewha_Womans_University_Campus_new.jpg',
      },
      {
        id: 'sogang',
        name: '西江大学',
        englishName: 'Sogang University',
        region: '首尔',
        city: '麻浦区 · 新村',
        landmark: '新村校区',
        image: fileImage('Sogang University Gonzaga Hall.jpg'),
        description: '小而精的私立名校，经营、传媒、国际学、韩国语教育和人文社科方向适合重点比较。',
        programs: ['经营', '传媒', '国际学', '韩国语教育'],
        strengths: ['新村生活圈', '课堂强度高', '文商科关注度高'],
        source: 'https://commons.wikimedia.org/wiki/Category:Sogang_University',
      },
      {
        id: 'dongguk',
        name: '东国大学',
        englishName: 'Dongguk University',
        region: '首尔',
        city: '中区',
        landmark: '南山脚下首尔校区',
        image: fileImage('Dongguk University Seoul campus.jpg'),
        description: '传媒、电影影像、佛教文化、警察行政和经营方向常被咨询，校区靠近忠武路和南山。',
        programs: ['电影影像', '传媒', '经营', '警察行政'],
        strengths: ['传媒影像强', '市中心位置', '生活便利'],
        source: 'https://commons.wikimedia.org/wiki/Category:Dongguk_University',
      },
      {
        id: 'konkuk',
        name: '建国大学',
        englishName: 'Konkuk University',
        region: '首尔',
        city: '广津区',
        landmark: '一鉴湖与首尔校区',
        image: fileImage('Konkuk University Lake.jpg'),
        description: '商科、传媒、设计、兽医、房地产和生命科学方向讨论度高，周边商圈成熟。',
        programs: ['经营', '传媒', '设计', '生命科学'],
        strengths: ['校园生活强', '专业覆盖广', '商圈成熟'],
        source: 'https://commons.wikimedia.org/wiki/Category:Konkuk_University',
      },
      {
        id: 'hufs',
        name: '韩国外国语大学',
        englishName: 'Hankuk University of Foreign Studies',
        region: '首尔',
        city: '东大门区',
        landmark: '外大前校园',
        image: fileImage('Hankuk University of Foreign Studies Seoul Campus.jpg'),
        description: '外语、翻译、国际地域、国际通商和韩国语教育方向代表性强，适合语言和国际事务路线。',
        programs: ['外语', '翻译', '国际地域', '韩国语教育'],
        strengths: ['外语强校', '国际化', '专业辨识度高'],
        source: 'https://commons.wikimedia.org/wiki/Category:Hankuk_University_of_Foreign_Studies',
      },
      {
        id: 'uos',
        name: '首尔市立大学',
        englishName: 'University of Seoul',
        region: '首尔',
        city: '东大门区',
        landmark: '市立大学校园',
        image: fileImage('University of Seoul Main Gate.jpg'),
        description: '公立大学属性明显，城市科学、税务、行政、建筑、环境和经营方向适合关注性价比。',
        programs: ['城市科学', '税务', '行政', '建筑'],
        strengths: ['公立性价比', '城市研究强', '首尔位置'],
        source: 'https://commons.wikimedia.org/wiki/Category:University_of_Seoul',
      },
      {
        id: 'dankook-seoul',
        name: '檀国大学',
        englishName: 'Dankook University',
        region: '首都圈',
        city: '竹田 / 天安',
        landmark: '竹田校区',
        image: fileImage('Dankook University Jukjeon Campus.jpg'),
        description: '虽主校区不在首尔市内，但常被首都圈申请者一起比较，设计、传媒、经营、音乐和医学相关方向值得纳入择校清单。',
        programs: ['设计', '传媒', '经营', '音乐'],
        strengths: ['首都圈备选', '专业多', '生活成本可控'],
        source: 'https://commons.wikimedia.org/wiki/Category:Dankook_University',
      },
      {
        id: 'seoultech',
        name: '首尔科技大学',
        englishName: 'Seoul National University of Science and Technology',
        region: '首尔',
        city: '芦原区',
        landmark: '孔陵校区',
        image: fileImage('Seoultech campus.jpg'),
        description: '国立理工取向明显，工科、设计、建筑、IT和产业技术方向适合重视就业和费用的学生。',
        programs: ['工科', '设计', '建筑', 'IT'],
        strengths: ['国立理工', '费用友好', '实践导向'],
        source: 'https://commons.wikimedia.org/wiki/Category:Seoul_National_University_of_Science_and_Technology',
      },
      {
        id: 'kookmin',
        name: '国民大学',
        englishName: 'Kookmin University',
        region: '首尔',
        city: '城北区',
        landmark: '北岳山下校园',
        image: fileImage('Kookmin University.jpg'),
        description: '汽车、设计、经营、AI和软件方向有特色，适合看作品集、实践课程和就业合作。',
        programs: ['汽车', '设计', '经营', 'AI'],
        strengths: ['设计汽车强', '实践导向', '北首尔生活圈'],
        source: 'https://commons.wikimedia.org/wiki/Category:Kookmin_University',
      },
      {
        id: 'soongsil',
        name: '崇实大学',
        englishName: 'Soongsil University',
        region: '首尔',
        city: '铜雀区',
        landmark: '崇实大入口校园',
        image: fileImage('Soongsil University Seoul Korea.jpg'),
        description: 'IT、软件、经营、社会科学和创业方向常见，地铁通勤便利，适合务实型申请者。',
        programs: ['软件', 'IT', '经营', '创业'],
        strengths: ['IT传统', '交通方便', '就业导向'],
        source: 'https://commons.wikimedia.org/wiki/Category:Soongsil_University',
      },
      {
        id: 'sookmyung',
        name: '淑明女子大学',
        englishName: "Sookmyung Women's University",
        region: '首尔',
        city: '龙山区',
        landmark: '龙山校区',
        image: fileImage('Sookmyung Women’s University.jpg'),
        description: '女子大学代表之一，教育、传媒、经营、国际学、食品营养和艺术方向适合比较。',
        programs: ['教育', '传媒', '经营', '国际学'],
        strengths: ['龙山位置', '女性教育传统', '生活便利'],
        source: 'https://commons.wikimedia.org/wiki/Category:Sookmyung_Women%27s_University',
      },
      {
        id: 'kwangwoon',
        name: '光云大学',
        englishName: 'Kwangwoon University',
        region: '首尔',
        city: '芦原区',
        landmark: '光云大站附近校园',
        image: fileImage('Kwangwoon University.jpg'),
        description: '电子、电气、信息通信、机器人和软件方向有辨识度，适合理工方向备选。',
        programs: ['电子', '信息通信', '机器人', '软件'],
        strengths: ['电子通信强', '理工取向', '首尔北部'],
        source: 'https://commons.wikimedia.org/wiki/Category:Kwangwoon_University',
      },
      {
        id: 'myongji',
        name: '明知大学',
        englishName: 'Myongji University',
        region: '首尔 / 京畿道',
        city: '西大门区 / 龙仁',
        landmark: '人文校区与自然校区',
        image: fileImage('Myongji University.jpg'),
        description: '人文、经营、建筑、工程和艺术方向常见，申请前要确认专业所在校区。',
        programs: ['人文', '经营', '建筑', '工程'],
        strengths: ['双校区', '专业覆盖广', '适合备选'],
        source: 'https://commons.wikimedia.org/wiki/Category:Myongji_University',
      },
      {
        id: 'sangmyung',
        name: '祥明大学',
        englishName: 'Sangmyung University',
        region: '首尔 / 忠清',
        city: '钟路区 / 天安',
        landmark: '首尔校区',
        image: fileImage('Sangmyung University Seoul campus.jpg'),
        description: '艺术、设计、动漫、教育和文化内容方向常见，适合关注作品集和实践课程。',
        programs: ['设计', '动漫', '艺术', '教育'],
        strengths: ['艺术设计', '首尔校区小而集中', '作品集重要'],
        source: 'https://commons.wikimedia.org/wiki/Category:Sangmyung_University',
      },
      {
        id: 'hansung',
        name: '汉城大学',
        englishName: 'Hansung University',
        region: '首尔',
        city: '城北区',
        landmark: '汉城大入口校区',
        image: fileImage('Hansung University.jpg'),
        description: '设计、IT、经营、人文社科和美容时尚方向可作为首尔私立校备选。',
        programs: ['设计', 'IT', '经营', '时尚'],
        strengths: ['首尔位置', '实践专业', '申请灵活'],
        source: 'https://commons.wikimedia.org/wiki/Category:Hansung_University',
      },
      {
        id: 'sungshin',
        name: '诚信女子大学',
        englishName: "Sungshin Women's University",
        region: '首尔',
        city: '城北区',
        landmark: '敦岩校区',
        image: fileImage('Sungshin Women’s University.jpg'),
        description: '设计、美术、音乐、教育、护理和生活科学方向常见，女生申请者关注度高。',
        programs: ['设计', '美术', '教育', '护理'],
        strengths: ['女子大学', '艺术教育', '生活圈成熟'],
        source: 'https://commons.wikimedia.org/wiki/Category:Sungshin_Women%27s_University',
      },
      {
        id: 'dongduk',
        name: '同德女子大学',
        englishName: "Dongduk Women's University",
        region: '首尔',
        city: '城北区',
        landmark: '月谷校区',
        image: fileImage('Dongduk Women’s University.jpg'),
        description: '设计、表演艺术、时尚、音乐和人文社科方向常见，适合看作品集与面试要求。',
        programs: ['设计', '表演艺术', '时尚', '音乐'],
        strengths: ['艺术时尚', '女子大学', '面试重要'],
        source: 'https://commons.wikimedia.org/wiki/Category:Dongduk_Women%27s_University',
      },
      {
        id: 'duksung',
        name: '德成女子大学',
        englishName: "Duksung Women's University",
        region: '首尔',
        city: '道峰区',
        landmark: '双门洞校园',
        image: fileImage('Duksung Women’s University.jpg'),
        description: '药学、幼儿教育、心理、经营和人文社科方向可关注，北首尔生活成本相对友好。',
        programs: ['药学', '教育', '心理', '经营'],
        strengths: ['女子大学', '北首尔', '生活成本可控'],
        source: 'https://commons.wikimedia.org/wiki/Category:Duksung_Women%27s_University',
      },
      {
        id: 'swu',
        name: '首尔女子大学',
        englishName: "Seoul Women's University",
        region: '首尔',
        city: '芦原区',
        landmark: '花郎台附近校园',
        image: fileImage('Seoul Women’s University.jpg'),
        description: '教育、心理、传媒、经营、食品营养和人文社科方向常见，适合比较奖学金和通勤。',
        programs: ['教育', '心理', '传媒', '经营'],
        strengths: ['女子大学', '北首尔', '校园环境安静'],
        source: 'https://commons.wikimedia.org/wiki/Category:Seoul_Women%27s_University',
      },
      {
        id: 'knua',
        name: '韩国艺术综合学校',
        englishName: 'Korea National University of Arts',
        region: '首尔',
        city: '城北区 / 瑞草区',
        landmark: '石串洞与瑞草校区',
        image: fileImage('Korea National University of Arts.jpg'),
        description: '韩国顶尖艺术类国立院校，音乐、舞蹈、戏剧、电影、视觉艺术方向适合专业型申请者。',
        programs: ['音乐', '舞蹈', '戏剧', '电影'],
        strengths: ['艺术顶尖', '专业门槛高', '作品集核心'],
        source: 'https://commons.wikimedia.org/wiki/Category:Korea_National_University_of_Arts',
      },
      {
        id: 'knsu',
        name: '韩国体育大学',
        englishName: 'Korea National Sport University',
        region: '首尔',
        city: '松坡区',
        landmark: '奥林匹克公园旁校园',
        image: fileImage('Korea National Sport University.jpg'),
        description: '体育、运动科学、教练、康复和体育产业方向代表学校，适合体育专业路线。',
        programs: ['体育', '运动科学', '康复', '体育产业'],
        strengths: ['体育国立', '专业性强', '奥林匹克园区'],
        source: 'https://commons.wikimedia.org/wiki/Category:Korea_National_Sport_University',
      },
      {
        id: 'sahmyook',
        name: '三育大学',
        englishName: 'Sahmyook University',
        region: '首尔',
        city: '芦原区',
        landmark: '绿色校园',
        image: fileImage('Sahmyook University.jpg'),
        description: '护理、保健、食品营养、经营和语言方向常见，校园环境安静，适合看专业匹配度。',
        programs: ['护理', '保健', '食品营养', '经营'],
        strengths: ['保健护理', '校园安静', '首尔北部'],
        source: 'https://commons.wikimedia.org/wiki/Category:Sahmyook_University',
      },
      {
        id: 'hongik',
        name: '弘益大学',
        englishName: 'Hongik University',
        region: '首尔',
        city: '麻浦区 · 弘大',
        landmark: '弘大正门与艺术街区',
        image: fileImage('Hongik University Gate.jpg'),
        description: '美术、设计、建筑、视觉传达方向代表学校，周边文化商业氛围强。',
        programs: ['美术', '设计', '建筑', '视觉传达'],
        strengths: ['艺术设计强', '弘大商圈', '作品集重要'],
        source: 'https://commons.wikimedia.org/wiki/Category:Hongik_University',
      },
    ],
  },
  {
    region: '京畿道 / 仁川',
    summary: '首都圈通勤范围，工科、医学、产业合作项目选择多。',
    schools: [
      {
        id: 'skku',
        name: '成均馆大学',
        englishName: 'Sungkyunkwan University',
        region: '京畿道 / 首尔',
        city: '水原 / 首尔',
        landmark: '自然科学校区与成均馆大站',
        image: fileImage('Sungkyunkwan University Station view.jpg'),
        description: '三星背景和理工科资源关注度高，人文社科在首尔，理工自然科学多在水原。',
        programs: ['半导体', '工科', '经营', '人文社科'],
        strengths: ['理工资源强', '双校区', '就业关注度高'],
        source: 'https://commons.wikimedia.org/wiki/File:Sungkyunkwan_University_Station_view.jpg',
      },
      {
        id: 'ajou',
        name: '亚洲大学',
        englishName: 'Ajou University',
        region: '京畿道',
        city: '水原',
        landmark: '水原校园全景',
        image: fileImage('0-campus-sm-Ajou.jpg'),
        description: '工科、医学、国际大学院和交换项目有一定优势，适合想在首都圈但避开首尔高生活成本的学生。',
        programs: ['工科', '医学', '国际学', '经营'],
        strengths: ['首都圈', '理工医学', '性价比突出'],
        source: 'https://commons.wikimedia.org/wiki/File:0-campus-sm-Ajou.jpg',
      },
      {
        id: 'inha',
        name: '仁荷大学',
        englishName: 'Inha University',
        region: '仁川',
        city: '弥邹忽区',
        landmark: '龙岘校区',
        image: fileImage('인하대학교 본관.jpg'),
        description: '工科、物流、航空和产学合作辨识度高，适合想把仁川产业资源和首都圈通勤一起比较的学生。',
        programs: ['工科', '物流', '航空', '经营'],
        strengths: ['仁川核心校区', '工科传统强', '产学合作多'],
        source: 'https://www.inha.ac.kr/',
      },
      {
        id: 'inu',
        name: '仁川大学',
        englishName: 'Incheon National University',
        region: '仁川',
        city: '松岛',
        landmark: '松岛校区',
        image: fileImage('Songdocampus.jpg'),
        description: '位于松岛国际城，国立大学属性、国际都市环境和生活便利度适合重点比较。',
        programs: ['经营', '工科', '国际通商', '城市科学'],
        strengths: ['国立大学', '松岛国际城', '生活便利'],
        source: 'https://www.inu.ac.kr/inuengl/index.do',
      },
      {
        id: 'hanyang-erica',
        name: '汉阳大学 ERICA',
        englishName: 'Hanyang University ERICA',
        region: '京畿道',
        city: '安山',
        landmark: 'ERICA 校区喷泉',
        image: fileImage('Hanyang University Erica Campus Fountain (South Korea) - 2024.jpg'),
        description: 'ERICA 强调产业合作和实践型教育，工科、设计、软件、融合专业适合重点比较。',
        programs: ['工科', '软件', '设计', '融合专业'],
        strengths: ['产业合作', '校园空间大', '实践导向'],
        source: 'https://commons.wikimedia.org/wiki/Category:Hanyang_University_-_ERICA_Campus',
      },
      {
        id: 'cau-anseong',
        name: '中央大学 安城校区',
        englishName: 'Chung-Ang University Anseong',
        region: '京畿道',
        city: '安城',
        landmark: '安城主楼',
        image: fileImage('Chung-ang Univ.Ansung main building.jpg'),
        description: '安城校区常见于艺术、体育、生命资源等方向，申请前要确认专业所在校区和通勤生活。',
        programs: ['艺术', '体育', '生命资源', '实践专业'],
        strengths: ['校区空间大', '实践类专业', '生活成本较低'],
        source: 'https://commons.wikimedia.org/wiki/Category:Chung-Ang_University',
      },
    ],
  },
  {
    region: '釜山 / 庆南',
    summary: '海港城市、生活成本相对低，国立大学与地方强校适合做备选。',
    schools: [
      {
        id: 'pnu',
        name: '釜山大学',
        englishName: 'Pusan National University',
        region: '釜山',
        city: '金井区',
        landmark: '釜山大学本馆',
        image: fileImage('부산대(본관).jpg'),
        description: '韩国重点国立大学之一，理工、经营、韩语教育、地方就业资源都值得看。',
        programs: ['工科', '经营', '韩语教育', '自然科学'],
        strengths: ['国立大学', '生活成本较低', '釜山城市资源'],
        source: 'https://commons.wikimedia.org/wiki/File:%EB%B6%80%EC%82%B0%EB%8C%80(%EB%B3%B8%EA%B4%80).jpg',
      },
      {
        id: 'donga',
        name: '东亚大学',
        englishName: 'Dong-A University',
        region: '釜山',
        city: '沙下区 / 西区',
        landmark: '釜山主校区',
        image: fileImage('PNU Busan campus 1.JPG'),
        description: '釜山地区常见申请选择，适合将生活成本、奖学金和专业录取难度一起比较。',
        programs: ['经营', '设计', '国际学', '韩语课程'],
        strengths: ['釜山生活圈', '申请灵活', '适合备选'],
        source: 'https://commons.wikimedia.org/wiki/Category:Busan_campus_of_Pusan_National_University',
      },
    ],
  },
  {
    region: '大邱 / 庆北',
    summary: '地方国立与产业城市组合，适合看奖学金、就业和生活成本。',
    schools: [
      {
        id: 'knu',
        name: '庆北大学',
        englishName: 'Kyungpook National University',
        region: '大邱',
        city: '北区',
        landmark: '大邱国立大学校园',
        image: fileImage('Kyungpook National University in Daegu.jpg'),
        description: '地方国立代表之一，工科、IT、经营、自然科学和奖学金政策适合详细比较。',
        programs: ['IT', '工科', '经营', '自然科学'],
        strengths: ['国立背景', '生活成本低', '奖学金友好'],
        source: 'https://commons.wikimedia.org/wiki/File:Kyungpook_National_University_in_Daegu.jpg',
      },
      {
        id: 'keimyung',
        name: '启明大学',
        englishName: 'Keimyung University',
        region: '大邱',
        city: '达西区',
        landmark: '欧式校园建筑',
        image: 'https://cdn.pixabay.com/photo/2022/07/05/10/33/campus-7302247_1280.jpg',
        description: '校园建筑辨识度强，语学堂、艺术、经营、人文方向可作为地方私立校选择。',
        programs: ['语学堂', '艺术', '经营', '人文'],
        strengths: ['校园漂亮', '地方生活成本', '文化体验强'],
        source: 'https://pixabay.com/photos/campus-university-main-building-7302247/',
      },
    ],
  },
  {
    region: '大田 / 忠清',
    summary: '研究型城市和中部交通节点，适合理工、科研和性价比选择。',
    schools: [
      {
        id: 'kaist',
        name: 'KAIST',
        englishName: 'Korea Advanced Institute of Science & Technology',
        region: '大田',
        city: '儒城区',
        landmark: '大田研究型校区',
        image: fileImage('KAIST Main entrance.jpg'),
        description: '韩国理工科研代表，适合高竞争理工、AI、半导体、计算机和科研路线申请者。',
        programs: ['AI', '计算机', '半导体', '工程'],
        strengths: ['科研强', '国际化', '竞争极高'],
        source: 'https://commons.wikimedia.org/wiki/File:KAIST_Main_entrance.jpg',
      },
      {
        id: 'chungnam',
        name: '忠南大学',
        englishName: 'Chungnam National University',
        region: '大田',
        city: '儒城区',
        landmark: '大田国立大学校园',
        image: fileImage('Chungnam National University Law School Building N12.jpg'),
        description: '中部国立大学代表，适合比较学费、奖学金、专业录取难度和大田生活成本。',
        programs: ['工科', '经营', '农生命', '韩语教育'],
        strengths: ['国立大学', '大田生活圈', '性价比'],
        source: 'https://commons.wikimedia.org/wiki/Category:Chungnam_National_University',
      },
    ],
  },
]

const allSchoolProfiles = schoolRegions.flatMap((group) => group.schools)

const schoolOfficialUrls: Record<string, string> = {
  snu: 'https://www.snu.ac.kr/',
  yonsei: 'https://www.yonsei.ac.kr/en_sc/',
  korea: 'https://www.korea.edu/mbshome/mbs/en/index.do',
  'skku-seoul': 'https://www.skku.edu/eng/',
  hanyang: 'https://www.hanyang.ac.kr/web/eng/home',
  kyunghee: 'https://www.khu.ac.kr/eng/main/index.do',
  sejong: 'https://eng.sejong.ac.kr/',
  cau: 'https://www.cau.ac.kr/index.do',
  ewha: 'https://www.ewha.ac.kr/ewhaen/index.do',
  sogang: 'https://www.sogang.ac.kr/en/',
  dongguk: 'https://www.dongguk.edu/eng/main',
  konkuk: 'https://www.konkuk.ac.kr/en',
  hufs: 'https://www.hufs.ac.kr/',
  uos: 'https://english.uos.ac.kr/',
  'dankook-seoul': 'https://www.dankook.ac.kr/web/international',
  seoultech: 'https://en.seoultech.ac.kr/',
  kookmin: 'https://english.kookmin.ac.kr/',
  soongsil: 'https://eng.ssu.ac.kr/',
  sookmyung: 'https://e.sookmyung.ac.kr/',
  kwangwoon: 'https://www.kw.ac.kr/en/',
  myongji: 'https://www.mju.ac.kr/us/index.do',
  sangmyung: 'https://www.smu.ac.kr/eng/index.do',
  hansung: 'https://www.hansung.ac.kr/global_en/index.do',
  sungshin: 'https://www.sungshin.ac.kr/sites/main_eng/main.jsp',
  dongduk: 'https://www.dongduk.ac.kr/eng/main.do',
  duksung: 'https://www.duksung.ac.kr/eng/main.do',
  swu: 'https://www.swu.ac.kr/english/index.html',
  knua: 'https://www.karts.ac.kr/en/main.do',
  knsu: 'https://www.knsu.ac.kr/eng/index.do',
  sahmyook: 'https://www.syu.ac.kr/eng/',
  hongik: 'https://en.hongik.ac.kr/',
  skku: 'https://www.skku.edu/eng/',
  ajou: 'https://www.ajou.ac.kr/en/index.do',
  inha: 'https://www.inha.ac.kr/',
  inu: 'https://www.inu.ac.kr/inuengl/index.do',
  'hanyang-erica': 'https://www.hanyang.ac.kr/web/eng/erica-campus',
  'cau-anseong': 'https://www.cau.ac.kr/index.do',
  pnu: 'https://www.pusan.ac.kr/eng/Main.do',
  donga: 'https://english.donga.ac.kr/',
  knu: 'https://en.knu.ac.kr/',
  keimyung: 'https://www.kmu.ac.kr/uni/eng/main.jsp',
  kaist: 'https://www.kaist.ac.kr/en/',
  chungnam: 'https://plus.cnu.ac.kr/html/en/',
}

const schoolLanguageInstituteUrls: Record<string, string> = {
  snu: 'https://lei.snu.ac.kr/',
  yonsei: 'https://www.yskli.com/',
  korea: 'https://klc.korea.ac.kr/',
  'skku-seoul': 'https://koreansli.skku.edu/',
  hanyang: 'https://iie.hanyang.ac.kr/',
  kyunghee: 'https://iie.khu.ac.kr/',
  sejong: 'https://ili.sejong.ac.kr/',
  cau: 'https://korean.cau.ac.kr/',
  ewha: 'https://elc.ewha.ac.kr/',
  sogang: 'https://klec.sogang.ac.kr/',
  dongguk: 'https://interlang.dongguk.edu/',
  konkuk: 'https://kfli.konkuk.ac.kr/',
  hufs: 'https://builder.hufs.ac.kr/user/hufskli/',
  uos: 'https://global.uos.ac.kr/iice/',
  'dankook-seoul': 'https://www.dankook.ac.kr/web/international',
  seoultech: 'https://language.seoultech.ac.kr/',
  kookmin: 'https://iie.kookmin.ac.kr/',
  soongsil: 'https://language.ssu.ac.kr/',
  sookmyung: 'https://lingua.sookmyung.ac.kr/',
  kwangwoon: 'https://klc.kw.ac.kr/',
  myongji: 'https://kli.mju.ac.kr/',
  sangmyung: 'https://www.smu.ac.kr/smklec/index.do',
  hansung: 'https://www.hansung.ac.kr/global_en/index.do',
  sungshin: 'https://www.sungshin.ac.kr/sites/kli/index.do',
  duksung: 'https://dili.duksung.ac.kr/',
  swu: 'https://klc.swu.ac.kr/',
  sahmyook: 'https://kli.syu.ac.kr/',
  hongik: 'https://koreanle.hongik.ac.kr/',
  skku: 'https://koreansli.skku.edu/',
  ajou: 'https://kli.ajou.ac.kr/',
  inha: 'https://internationalcenter.inha.ac.kr/',
  inu: 'https://www.inu.ac.kr/inukli/index.do',
  'hanyang-erica': 'https://iie.hanyang.ac.kr/',
  'cau-anseong': 'https://korean.cau.ac.kr/',
  pnu: 'https://lei.pusan.ac.kr/',
  donga: 'https://global.donga.ac.kr/',
  knu: 'https://korean.knu.ac.kr/',
  keimyung: 'https://kli.kmu.ac.kr/',
  chungnam: 'https://plus.cnu.ac.kr/html/en/',
}

const campusLinksBySchool: Record<string, CampusLink[]> = {
  'skku-seoul': [
    { label: '明伦校区官网 · 首尔', url: 'https://www.skku.edu/eng/', icon: 'pin' },
    { label: '自然科学校区官网 · 水原', url: 'https://www.skku.edu/eng/', icon: 'building' },
  ],
  hanyang: [
    { label: '首尔校区官网 · 往十里', url: 'https://www.hanyang.ac.kr/web/eng/seoul', icon: 'pin' },
    { label: 'ERICA校区官网 · 安山', url: 'https://www.hanyang.ac.kr/web/eng/erica-campus', icon: 'building' },
  ],
  cau: [
    { label: '首尔校区官网 · 黑石', url: 'https://www.cau.ac.kr/index.do', icon: 'pin' },
    { label: '安城校区官网', url: 'https://www.cau.ac.kr/index.do', icon: 'building' },
  ],
  'dankook-seoul': [
    { label: '竹田校区官网', url: 'https://www.dankook.ac.kr/web/international', icon: 'pin' },
    { label: '天安校区官网', url: 'https://www.dankook.ac.kr/web/international', icon: 'building' },
  ],
  hufs: [
    { label: '首尔校区官网', url: 'https://www.hufs.ac.kr/', icon: 'pin' },
    { label: 'Global校区官网', url: 'https://www.hufs.ac.kr/', icon: 'building' },
  ],
  myongji: [
    { label: '人文校区官网 · 首尔', url: 'https://www.mju.ac.kr/us/index.do', icon: 'pin' },
    { label: '自然校区官网 · 龙仁', url: 'https://www.mju.ac.kr/us/index.do', icon: 'building' },
  ],
  sangmyung: [
    { label: '首尔校区官网', url: 'https://www.smu.ac.kr/eng/index.do', icon: 'pin' },
    { label: '天安校区官网', url: 'https://www.smu.ac.kr/eng/index.do', icon: 'building' },
  ],
  knua: [
    { label: '石串洞校区官网', url: 'https://www.karts.ac.kr/en/main.do', icon: 'pin' },
    { label: '瑞草校区官网', url: 'https://www.karts.ac.kr/en/main.do', icon: 'building' },
  ],
  skku: [
    { label: '自然科学校区官网 · 水原', url: 'https://www.skku.edu/eng/', icon: 'pin' },
    { label: '明伦校区官网 · 首尔', url: 'https://www.skku.edu/eng/', icon: 'building' },
  ],
  inha: [
    { label: '龙岘校区官网 · 仁川', url: 'https://www.inha.ac.kr/', icon: 'pin' },
    { label: '国际中心入口', url: 'https://internationalcenter.inha.ac.kr/', icon: 'building' },
  ],
  inu: [
    { label: '松岛校区官网 · 仁川', url: 'https://www.inu.ac.kr/inuengl/index.do', icon: 'pin' },
    { label: '国际招生入口', url: 'https://www.inu.ac.kr/sites/global/International.html', icon: 'building' },
  ],
  'hanyang-erica': [
    { label: 'ERICA校区官网 · 安山', url: 'https://www.hanyang.ac.kr/web/eng/erica-campus', icon: 'pin' },
    { label: '首尔校区官网 · 往十里', url: 'https://www.hanyang.ac.kr/web/eng/seoul', icon: 'building' },
  ],
  'cau-anseong': [
    { label: '安城校区官网', url: 'https://www.cau.ac.kr/index.do', icon: 'pin' },
    { label: '首尔校区官网 · 黑石', url: 'https://www.cau.ac.kr/index.do', icon: 'building' },
  ],
  donga: [
    { label: '胜学校区官网', url: 'https://english.donga.ac.kr/', icon: 'pin' },
    { label: '富民/九德校区官网', url: 'https://english.donga.ac.kr/', icon: 'building' },
  ],
}

const schoolBrochureUrls: Record<string, string> = {
  snu: 'https://en.snu.ac.kr/admission/undergraduate/application',
  yonsei: 'https://admission.yonsei.ac.kr/seoul/admission/html/counsel/dataView.asp?BBS_NO=3457&s_code=B&s_data=&s_page=1&s_type=',
  korea: 'https://oia.korea.ac.kr/oia/under/admission.do',
  'skku-seoul': 'https://admission-global.skku.edu/eng/',
  hanyang: 'https://oia.hanyang.ac.kr',
  kyunghee: 'https://ciss.khu.ac.kr/index/sub_admission/requirements.php',
  sejong: 'https://sos.sejong.ac.kr/kor/admission/guide/univ.do',
  cau: 'https://oia.cau.ac.kr/k_intro.php',
  ewha: 'https://rwcms.ewha.ac.kr/oisa/1444/subview.do',
  sogang: 'https://oisa-admission.sogang.ac.kr/',
  dongguk: 'https://www.dongguk.edu/eng/page/407',
  konkuk: 'https://ciss.konkuk.ac.kr/',
  hufs: 'https://international.hufs.ac.kr/sites/international/index.do',
  uos: 'https://oia.uos.ac.kr/koia/web/contents/OIAKR_Admission_01',
  'dankook-seoul': 'https://www.dku.ac.kr/-329',
  seoultech: 'https://global.seoultech.ac.kr',
  kookmin: 'https://iat.kookmin.ac.kr/admission',
  soongsil: 'https://study.ssu.ac.kr/en/program/admissions.do',
  sookmyung: 'https://www.sookmyung.ac.kr/kr/admission/admission-guide.do',
  kwangwoon: 'https://oia.kw.ac.kr/admission/faculty.php',
  myongji: 'https://abroadeng.mju.ac.kr/application/application.php?sMenu=eng31',
  sangmyung: 'https://www.smu.ac.kr/oia/admission/recruitment_eng.do',
  hansung: 'https://www.hansung.ac.kr/global_en/885/subview.do',
  sungshin: 'https://ipsi.sungshin.ac.kr/guide/dataroom.htm?bbsid=dataroom&bltn_seq=33917&ctg_cd=susi&keyword=&mode=view&page=2&skey=',
  dongduk: 'https://ipsi.dongduk.ac.kr/ipsi/contents/overseas-doc.do?etc1=67&id=90120&page=1&schBdcode=_ipsi_admdoc03&schGroupCode=&schM=view&viewCount=10',
  duksung: 'https://enter.duksung.ac.kr/notice/view.php?bn=5306&m_type=JEOEGUK',
  swu: 'https://www.swu.ac.kr/ir/admiisionsa.html',
  knua: 'https://www.karts.ac.kr/en/admission/',
  knsu: 'https://www.knsu.ac.kr/eng/admission/foreign-applicants.do',
  sahmyook: 'https://ipsi.syu.ac.kr/2016_syu/pages/index.asp?mj=12&p=42',
  hongik: 'https://www.hongik.ac.kr/kr/admission/recruitment-is.do?article.offset=0&mode=list',
  skku: 'https://admission-global.skku.edu/eng/',
  ajou: 'https://www.ajou.ac.kr/iadmissions/index.do',
  inha: 'https://internationalcenter.inha.ac.kr/',
  inu: 'https://www.inu.ac.kr/sites/global/International.html',
  'hanyang-erica': 'https://oia.hanyang.ac.kr',
  'cau-anseong': 'https://oia.cau.ac.kr/k_intro.php',
  pnu: 'https://international.pusan.ac.kr/international/15257/subview.do',
  donga: 'https://global.donga.ac.kr/global/CMS/Contents/Contents.do?mCode=MN039',
  knu: 'https://en.knu.ac.kr/admission/under01.htm',
  keimyung: 'https://www.kmu.ac.kr/page.jsp?mnu_uid=532',
  kaist: 'https://admission.kaist.ac.kr/intl-undergraduate/',
  chungnam: 'https://plus.chungnam.ac.kr/html/en/sub03/sub03_0302.html',
}

const getBrochureUrl = (school: SchoolProfile) =>
  schoolBrochureUrls[school.id] ??
  `https://www.google.com/search?q=${encodeURIComponent(`${school.name} 외국인 입학 모집요강`)}`

const getLanguageInstituteUrl = (school: SchoolProfile) =>
  schoolLanguageInstituteUrls[school.id] ??
  `https://search.naver.com/search.naver?query=${encodeURIComponent(`${school.name} 한국어학당`)}`

const schoolLogoUrls: Record<string, string> = {
  ajou: '/school-logos/seal/ajou.png',
  cau: '/school-logos/seal/cau.png',
  'cau-anseong': '/school-logos/seal/cau-anseong.png',
  chungnam: '/school-logos/seal/chungnam.png',
  'dankook-seoul': '/school-logos/seal/dankook-seoul.png',
  donga: '/school-logos/seal/donga.png',
  dongduk: '/school-logos/seal/dongduk.png',
  dongguk: '/school-logos/seal/dongguk.png',
  duksung: '/school-logos/seal/duksung.png',
  ewha: '/school-logos/seal/ewha.png',
  hansung: '/school-logos/seal/hansung.png',
  hanyang: '/school-logos/seal/hanyang.png',
  'hanyang-erica': '/school-logos/seal/hanyang-erica.png',
  inha: '/school-logos/seal/inha.png',
  inu: '/school-logos/seal/inu.png',
  hongik: '/school-logos/seal/hongik.png',
  hufs: '/school-logos/seal/hufs.png',
  kaist: '/school-logos/seal/kaist.png',
  keimyung: '/school-logos/seal/keimyung.png',
  knsu: '/school-logos/seal/knsu.png',
  knu: '/school-logos/seal/knu.png',
  knua: '/school-logos/seal/knua.png',
  konkuk: '/school-logos/seal/konkuk.png',
  kookmin: '/school-logos/seal/kookmin.png',
  korea: '/school-logos/seal/korea.png',
  kwangwoon: '/school-logos/seal/kwangwoon.png',
  kyunghee: '/school-logos/seal/kyunghee.png',
  myongji: '/school-logos/seal/myongji.png',
  pnu: '/school-logos/seal/pnu.png',
  sahmyook: '/school-logos/seal/sahmyook.png',
  sangmyung: '/school-logos/seal/sangmyung.png',
  sejong: '/school-logos/seal/sejong.png',
  seoultech: '/school-logos/seal/seoultech.png',
  skku: '/school-logos/seal/skku.png',
  'skku-seoul': '/school-logos/seal/skku-seoul.png',
  snu: '/school-logos/seal/snu.png',
  sogang: '/school-logos/seal/sogang.png',
  soongsil: '/school-logos/seal/soongsil.png',
  sookmyung: '/school-logos/seal/sookmyung.png',
  sungshin: '/school-logos/seal/sungshin.png',
  swu: '/school-logos/seal/swu.png',
  uos: '/school-logos/seal/uos.png',
  yonsei: '/school-logos/seal/yonsei.png',
}

const getSchoolLogoUrl = (school: SchoolProfile) => schoolLogoUrls[school.id] ?? ''

const getCampusLinks = (school: SchoolProfile): CampusLink[] => {
  const officialUrl = schoolOfficialUrls[school.id] ?? school.source
  const languageInstituteLink: CampusLink = {
    label: '语学院入口',
    url: getLanguageInstituteUrl(school),
    icon: 'language',
  }
  const campusLinks =
    campusLinksBySchool[school.id] ?? [
      { label: `${school.region} · ${school.city}`, url: officialUrl, icon: 'pin' },
      { label: `${school.landmark}官网`, url: officialUrl, icon: 'building' },
    ]

  return [...campusLinks, languageInstituteLink]
}

const getParentRegion = (schoolId: string) =>
  schoolRegions.find((group) => group.schools.some((school) => school.id === schoolId))?.region

const getInitialSchoolId = () => {
  if (typeof window === 'undefined') return allSchoolProfiles[0].id
  const schoolId = window.location.hash.replace('#school-', '')
  return allSchoolProfiles.some((school) => school.id === schoolId)
    ? schoolId
    : allSchoolProfiles[0].id
}

const schools = [
  {
    name: '延世大学',
    city: '首尔 · 新村',
    score: '4.8',
    posts: '326',
    tags: ['语学堂', '经营学', '传媒'],
  },
  {
    name: '高丽大学',
    city: '首尔 · 安岩',
    score: '4.7',
    posts: '284',
    tags: ['商科', '工科', '交换'],
  },
  {
    name: '成均馆大学',
    city: '首尔 / 水原',
    score: '4.6',
    posts: '219',
    tags: ['半导体', 'MBA', '奖学金'],
  },
  {
    name: '汉阳大学',
    city: '首尔 · 往十里',
    score: '4.5',
    posts: '198',
    tags: ['工科', '艺术', '实习'],
  },
]

const seedQuestions: CommunityQuestion[] = [
  {
    id: 'q-d2-extension',
    title: '韩国D-2签证延长需要哪些材料？',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    school: '中央大学',
    rewardPoints: 120,
    answersCount: 8,
    views: 2860,
    status: 'solved',
    createdAt: '2026-05-03',
    author: '大学院新生',
    identity: '大学院',
    tags: ['韩国', '首尔', '中央大学', '签证', '2026更新', '已解决'],
    detail: '第一次延长 D-2，想确认在学证明、成绩单、住宿证明和银行余额证明是否都要准备，预约当天还需要注意什么。',
  },
  {
    id: 'q-rent-deposit',
    title: '韩国租房保证金怎么防止被骗？',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    school: '延世大学',
    rewardPoints: 160,
    answersCount: 14,
    views: 4210,
    status: 'solved',
    createdAt: '2026-05-02',
    author: '准备申请中',
    identity: '准留学生',
    tags: ['韩国', '首尔', '租房', '保证金', '亲身经历', '已解决'],
    detail: '准备住新村附近，房东要求先转一部分保证金。想知道签合同前应该查哪些信息，哪些情况不能转账。',
  },
  {
    id: 'q-arc-lost',
    title: '外国人登录证丢了怎么办？',
    category: '签证/滞留资格',
    country: '韩国',
    city: '釜山',
    school: '釜山大学',
    rewardPoints: 80,
    answersCount: 6,
    views: 1520,
    status: 'open',
    createdAt: '2026-05-01',
    author: '语学院同学',
    identity: '语学院',
    tags: ['韩国', '釜山', '外国人登录证', '补办', '待回答'],
    detail: '钱包丢了，里面有外国人登录证。想知道要不要先报警、去哪里补办、补办期间能不能正常出入学校和银行。',
  },
  {
    id: 'q-bank-account',
    title: '韩国银行卡开户需要什么？',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    school: '建国大学',
    rewardPoints: 60,
    answersCount: 7,
    views: 1986,
    status: 'solved',
    createdAt: '2026-04-30',
    author: '建大本科新生',
    identity: '本科',
    tags: ['韩国', '首尔', '建国大学', '银行卡', '已解决'],
    detail: '刚拿到外国人登录证，想去学校附近银行开户。需要学生证、手机号或者学校证明吗？',
  },
  {
    id: 'q-work-hours',
    title: '韩国留学生可以合法打工多少小时？',
    category: '打工/劳动纠纷',
    country: '韩国',
    city: '首尔',
    school: '高丽大学',
    rewardPoints: 100,
    answersCount: 10,
    views: 3420,
    status: 'open',
    createdAt: '2026-04-29',
    author: '找兼职中',
    identity: '本科',
    tags: ['韩国', '首尔', '打工', '兼职', '以公告为准'],
    detail: '想确认 D-2 留学生打工许可、每周小时数和放假期间限制。希望有办过许可的人分享流程。',
  },
  {
    id: 'q-language-to-undergrad',
    title: '语学院转本科需要什么流程？',
    category: '语学院/本科/大学院',
    country: '韩国',
    city: '首尔',
    school: '庆熙大学',
    rewardPoints: 90,
    answersCount: 5,
    views: 1760,
    status: 'open',
    createdAt: '2026-04-28',
    author: '语学院4级',
    identity: '语学院',
    tags: ['韩国', '语学院', '本科申请', '材料'],
    detail: '目前语学院 4 级，想申请同校本科。想知道语言成绩、出勤、推荐信和材料时间线怎么安排。',
  },
  {
    id: 'q-thesis-delay',
    title: '韩国大学院论文延期怎么办？',
    category: '毕业/论文/延毕',
    country: '韩国',
    city: '首尔',
    school: '汉阳大学',
    rewardPoints: 180,
    answersCount: 11,
    views: 2670,
    status: 'solved',
    createdAt: '2026-04-27',
    author: '论文卡住了',
    identity: '大学院',
    tags: ['韩国', '大学院', '论文', '延毕', '已解决'],
    detail: '论文进度慢，导师建议延期。想知道延期申请、学费、签证和毕业时间线会有什么影响。',
  },
  {
    id: 'q-phone-plan',
    title: '韩国手机卡怎么选？',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    school: '弘益大学',
    rewardPoints: 50,
    answersCount: 4,
    views: 1320,
    status: 'open',
    createdAt: '2026-04-26',
    author: '刚到韩国',
    identity: '准留学生',
    tags: ['韩国', '手机卡', '认证', '生活'],
    detail: '想知道预付卡、合约机、알뜰폰 怎么选，主要需要韩国手机号认证和日常流量。',
  },
  {
    id: 'q-hospital-insurance',
    title: '韩国看病怎么用保险？',
    category: '医院/看病/药店',
    country: '韩国',
    city: '大田',
    school: '忠南大学',
    rewardPoints: 70,
    answersCount: 6,
    views: 1588,
    status: 'solved',
    createdAt: '2026-04-25',
    author: '第一次看病',
    identity: '大学院',
    tags: ['韩国', '医院', '保险', '药店', '已解决'],
    detail: '想知道国民健康保险怎么用，去医院挂号、缴费、拿药分别怎么做。',
  },
  {
    id: 'q-d10-jobseeker',
    title: '毕业后D-10求职签证怎么申请？',
    category: '求职/实习/简历',
    country: '韩国',
    city: '首尔',
    school: '西江大学',
    rewardPoints: 150,
    answersCount: 9,
    views: 2190,
    status: 'open',
    createdAt: '2026-04-24',
    author: '即将毕业',
    identity: '大学院',
    tags: ['韩国', 'D-10', '求职', '毕业', '以公告为准'],
    detail: '硕士快毕业，想从 D-2 转 D-10。希望了解准备材料、积分、求职计划书和预约经验。',
  },
]

const seedAnswers: QuestionAnswer[] = [
  {
    id: 'a-d2-extension-accepted',
    questionId: 'q-d2-extension',
    author: '中央大学博士在读',
    identity: '大学院',
    content:
      '先在 HiKorea 预约，再按学校国际处和出入境要求准备在学证明、成绩单、住宿证明、护照、外国人登录证和手续费。银行余额证明是否需要、金额多少会随个人情况和政策变化，建议以出入境最新说明为准。',
    likes: 42,
    accepted: true,
    createdAt: '2026-05-03',
  },
  {
    id: 'a-rent-deposit-accepted',
    questionId: 'q-rent-deposit',
    author: '首尔租房过来人',
    identity: '毕业生',
    content:
      '不要只看图片和聊天记录。先查房屋登记、确认房东身份、看合同里的保证金返还时间和管理费范围，尽量线下看房。大额保证金不要打给非合同主体，必要时找懂韩语的人陪同。',
    likes: 68,
    accepted: true,
    createdAt: '2026-05-02',
  },
  {
    id: 'a-thesis-delay-accepted',
    questionId: 'q-thesis-delay',
    author: '汉阳大学院毕业生',
    identity: '毕业生',
    content:
      '先和导师确认是否只是论文提交延期，还是需要延长注册学期。然后问院系办公室学费、研究登录、论文审查节点，再同步确认签证延长材料。每个院系口径不同，不要只听同学转述。',
    likes: 37,
    accepted: true,
    createdAt: '2026-04-27',
  },
]

const seedPosts: Post[] = [
  {
    id: 'post-rent-guide',
    title: '韩国留学生租房避坑指南',
    school: '首尔生活',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    author: '新村住了6年',
    identity: '毕业生',
    price: 0,
    hot: '6.2k',
    views: 6240,
    likes: 386,
    bookmarks: 820,
    tags: ['韩国', '首尔', '租房', '保证金', '亲身经历', '精华'],
    contentType: '经验帖',
    featured: true,
    createdAt: '2026-05-03',
    excerpt: '从保证金、管理费、合同主体、看房路线和退租时间线拆解第一套房怎么避坑。',
    body:
      '第一次在韩国租房，先不要被照片和低月租带着走。重点确认四件事：合同主体是谁、保证金如何返还、管理费包含哪些项目、退租提前多久通知。大额保证金尽量线下签约，转账对象要和合同信息一致。看房时记录水压、采光、噪音、霉味和通勤时间，入住前拍照留证。',
  },
  {
    id: 'post-d2-extension',
    title: 'D-2签证延长完整流程',
    school: '中央大学',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    author: '中央大学博士在读',
    identity: '大学院',
    price: 12,
    hot: '4.8k',
    views: 4820,
    likes: 241,
    bookmarks: 560,
    tags: ['韩国', '中央大学', 'D-2', '签证', '2026更新', '精华'],
    contentType: '流程攻略',
    featured: true,
    createdAt: '2026-05-02',
    excerpt: '按预约、材料准备、学校证明、现场提交和补件风险整理 D-2 延签步骤。',
    body:
      'D-2 延签建议提前看 HiKorea 可预约日期，再向学校开在学证明和成绩单。住宿证明、护照、外国人登录证、手续费是基础项，银行材料和额外说明要看个人情况。所有政策相关内容都以出入境和学校最新公告为准，本文只整理办理顺序和容易漏掉的节点。',
  },
  {
    id: 'post-arc-process',
    title: '外国人登录证办理流程',
    school: '建国大学',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    author: '建大本科生',
    identity: '本科',
    price: 0,
    hot: '3.9k',
    views: 3920,
    likes: 188,
    bookmarks: 430,
    tags: ['韩国', '首尔', '建国大学', '外国人登录证', '流程'],
    contentType: '办理流程',
    featured: true,
    createdAt: '2026-05-01',
    excerpt: '从入境后预约、照片、申请表、学校材料到领取登录证的基础流程。',
    body:
      '外国人登录证通常需要提前预约，准备护照、照片、申请表、学校相关证明和居住证明。不同签证类型材料会有差异，建议先看出入境官方页面，再让学校国际处帮你确认。办理后到领取期间，尽量保存好申请回执。',
  },
  {
    id: 'post-bank-account',
    title: '韩国银行卡开户攻略',
    school: '建国大学',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    author: '建大本科生',
    identity: '本科',
    price: 0,
    hot: '3.1k',
    views: 3180,
    likes: 142,
    bookmarks: 310,
    tags: ['韩国', '银行卡', '手机认证', '生活', '亲身经历'],
    contentType: '经验帖',
    featured: true,
    createdAt: '2026-04-30',
    excerpt: '开户前先准备外国人登录证、手机号、学校信息和本人能解释清楚的使用目的。',
    body:
      '开户时银行会确认身份、联系方式和账户用途。建议先准备外国人登录证、护照、学生证或在学证明、韩国手机号。不同银行窗口要求会有差异，遇到说材料不够时，可以换网点或让学校国际处提供说明。',
  },
  {
    id: 'post-phone-card',
    title: '韩国手机卡办理攻略',
    school: '韩国生活',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    author: '首尔生活记录员',
    identity: '在读生',
    price: 0,
    hot: '2.7k',
    views: 2710,
    likes: 124,
    bookmarks: 280,
    tags: ['韩国', '手机卡', '认证', '生活'],
    contentType: '生活攻略',
    featured: false,
    createdAt: '2026-04-29',
    excerpt: '预付卡、알뜰폰、合约套餐怎么选，重点看认证、流量和解约成本。',
    body:
      '刚到韩国先解决能接验证码的手机号。短期可以先用预付卡，稳定后再看 알뜰폰 或合约套餐。不要只看月租，注意是否能本人认证、是否有合约期、解约费用和客服语言。',
  },
  {
    id: 'post-work-notes',
    title: '韩国留学生打工注意事项',
    school: '高丽大学',
    category: '打工/劳动纠纷',
    country: '韩国',
    city: '首尔',
    author: '安岩兼职过来人',
    identity: '本科',
    price: 15,
    hot: '3.4k',
    views: 3440,
    likes: 201,
    bookmarks: 490,
    tags: ['韩国', '打工', '兼职', '劳动纠纷', '以公告为准'],
    contentType: '避坑攻略',
    featured: true,
    createdAt: '2026-04-28',
    excerpt: '打工前先确认许可、合同、工资结算和工时记录，别只听店长口头承诺。',
    body:
      '留学生打工要先确认自己签证类型和是否需要许可。工资、工时、休息时间和结算日尽量写进聊天或合同里。遇到拖欠工资时，保留排班、打卡、聊天记录和转账记录。具体合法工时和许可要求以韩国出入境最新公告为准。',
  },
  {
    id: 'post-hospital',
    title: '韩国医院看病流程',
    school: '忠南大学',
    category: '医院/看病/药店',
    country: '韩国',
    city: '大田',
    author: '在韩生活五年',
    identity: '毕业生',
    price: 0,
    hot: '2.2k',
    views: 2260,
    likes: 116,
    bookmarks: 260,
    tags: ['韩国', '医院', '保险', '药店'],
    contentType: '流程攻略',
    featured: false,
    createdAt: '2026-04-27',
    excerpt: '挂号、问诊、缴费、拿药和保险使用的基础流程，医疗判断以医生意见为准。',
    body:
      '韩国看病一般先到前台挂号，问诊后结算，再拿处方去药店。带好外国人登录证和保险信息，第一次去可以提前查科室。本文只讲流程，不替代医疗建议，症状严重时优先去正规医院。',
  },
  {
    id: 'post-grad-course',
    title: '大学院选课避坑',
    school: '汉阳大学',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    author: '工科博士在读',
    identity: '大学院',
    price: 18,
    hot: '2.9k',
    views: 2910,
    likes: 168,
    bookmarks: 352,
    tags: ['韩国', '大学院', '选课', '教授', '精华'],
    contentType: '经验帖',
    featured: true,
    createdAt: '2026-04-26',
    excerpt: '第一学期别只看课程名，要把授课语言、评价方式、教授风格和毕业要求一起看。',
    body:
      '大学院选课最怕课程和研究方向脱节。选课前确认授课语言、作业密度、是否需要发表、是否能计入毕业学分。第一学期建议保守一点，先适应教授沟通方式和组会节奏。',
  },
  {
    id: 'post-secondhand',
    title: '韩国二手交易避坑',
    school: '韩国生活',
    category: '二手交易/搬家处理',
    country: '韩国',
    city: '首尔',
    author: '搬家三次的学姐',
    identity: '毕业生',
    price: 0,
    hot: '2.0k',
    views: 2040,
    likes: 93,
    bookmarks: 210,
    tags: ['韩国', '二手交易', '搬家', '生活'],
    contentType: '避坑攻略',
    featured: false,
    createdAt: '2026-04-25',
    excerpt: '家具、电器、教材和搬家处理时，重点确认面交、付款和瑕疵记录。',
    body:
      '二手交易尽量面交，电器要现场确认能否开机，家具要量尺寸和搬运路线。付款前保留聊天记录和物品照片。搬家前处理大件物品要留出时间，不要最后一天才挂出去。',
  },
  {
    id: 'post-thesis-process',
    title: '韩国毕业论文流程整理',
    school: '汉阳大学',
    category: '毕业/论文/延毕',
    country: '韩国',
    city: '首尔',
    author: '大学院毕业生',
    identity: '毕业生',
    price: 20,
    hot: '3.6k',
    views: 3660,
    likes: 220,
    bookmarks: 540,
    tags: ['韩国', '大学院', '毕业', '论文', '精华'],
    contentType: '流程攻略',
    featured: true,
    createdAt: '2026-04-24',
    excerpt: '按导师沟通、选题、开题、中期、审查和提交节点整理论文时间线。',
    body:
      '论文流程要提前倒排。先确认院系毕业要求，再和导师定选题范围。开题、中期、查重、审查和最终提交都有固定窗口，不同学校和院系不同。不要等到最后一学期才第一次问办公室。',
  },
]

const cityGuides: CityGuide[] = [
  {
    id: 'guide-cau-life',
    title: '中央大学留学生生活攻略',
    category: '学校评价',
    country: '韩国',
    city: '首尔',
    school: '中央大学',
    summary: '黑石洞通勤、坡度、周边餐饮、艺术传媒专业生活节奏和租房选择。',
    tags: ['中央大学', '首尔', '学校生活'],
    updatedAt: '2026-05-03',
  },
  {
    id: 'guide-seoul-rent-area',
    title: '首尔租房区域推荐',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    school: '首尔生活',
    summary: '新村、弘大、往十里、建大入口、安岩等区域的通勤和生活成本比较。',
    tags: ['首尔', '租房', '通勤'],
    updatedAt: '2026-05-02',
  },
  {
    id: 'guide-anseong-life',
    title: '安城留学生生活攻略',
    category: '城市生活攻略',
    country: '韩国',
    city: '安城',
    school: '中央大学安城校区',
    summary: '安城校区周边交通、住宿、采购和回首尔的实际体验。',
    tags: ['安城', '校区生活', '交通'],
    updatedAt: '2026-05-01',
  },
  {
    id: 'guide-grad-checklist',
    title: '韩国大学院新生入学 checklist',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    school: '韩国大学院',
    summary: '从入境、住宿、学生证、选课、银行卡到保险，把第一周事项列清楚。',
    tags: ['大学院', '新生', 'checklist'],
    updatedAt: '2026-04-30',
  },
  {
    id: 'guide-mart-saving',
    title: '韩国便利店/超市省钱攻略',
    category: '城市生活攻略',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    summary: '便利店活动、超市打折时间、会员积分和日用品采购经验。',
    tags: ['生活', '省钱', '超市'],
    updatedAt: '2026-04-29',
  },
  {
    id: 'guide-moving',
    title: '韩国搬家流程',
    category: '二手交易/搬家处理',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    summary: '退租、清洁、搬家公司、废弃物贴纸和地址变更的基础流程。',
    tags: ['搬家', '退租', '生活'],
    updatedAt: '2026-04-28',
  },
  {
    id: 'guide-trash',
    title: '韩国垃圾分类指南',
    category: '城市生活攻略',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    summary: '一般垃圾、厨余、回收和大件废弃物的常见处理方式。',
    tags: ['生活', '垃圾分类', '租房'],
    updatedAt: '2026-04-27',
  },
  {
    id: 'guide-transport-card',
    title: '韩国交通卡使用指南',
    category: '城市生活攻略',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    summary: 'T-money、换乘、充值、机场交通和通勤路线选择。',
    tags: ['交通', 'T-money', '生活'],
    updatedAt: '2026-04-26',
  },
  {
    id: 'guide-scholarship',
    title: '韩国奖学金申请经验',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    school: '韩国大学',
    summary: '入学奖学金、成绩奖学金、教授项目和校内申请窗口的注意事项。',
    tags: ['奖学金', '申请', '大学院'],
    updatedAt: '2026-04-25',
  },
  {
    id: 'guide-useful-sites',
    title: '韩国留学生常用网站整理',
    category: '城市生活攻略',
    country: '韩国',
    city: '全国',
    school: '韩国生活',
    summary: 'HiKorea、学校门户、租房、地图、二手交易和求职网站入口。',
    tags: ['网站', '工具', '生活'],
    updatedAt: '2026-04-24',
  },
]

const hotQuestions = seedQuestions
const featuredExperiences = seedPosts.filter((post) => post.featured)

const pathways = [
  {
    icon: Search,
    title: '先搜问题和场景',
    text: '按签证、租房、打工、毕业和城市生活筛选真实经验。',
  },
  {
    icon: BadgeCheck,
    title: '看真实可验证经验',
    text: '区分在读、毕业、已录取和申请中，重点沉淀可复用步骤。',
  },
  {
    icon: Coins,
    title: '解决问题获得收益',
    text: '优质回答、被采纳答案和精华攻略可获得平台激励。',
  },
]

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

const userStatusLabel: Record<UserStatus, string> = {
  active: '正常',
  muted: '禁言',
  banned: '封号',
}

const verificationStatusLabel: Record<VerificationStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
}

const normalizeUser = (user: Partial<User>): User => ({
  id: user.id ?? createId('user'),
  name: user.name ?? '韩国留学用户',
  email: user.email ?? '',
  password: user.password ?? '',
  identity: user.identity ?? '准备申请',
  school: user.school ?? '暂未填写',
  points: user.points ?? 0,
  earningPoints: user.earningPoints ?? 0,
  joinedAt: user.joinedAt ?? new Date().toISOString(),
  status: user.status ?? 'active',
  verificationStatus: user.verificationStatus ?? (user.documents?.length ? 'pending' : 'pending'),
  avatarUrl: user.avatarUrl ?? '',
  bio: user.bio ?? '',
  documents: user.documents ?? [],
})

const initialState = (): StoredState => {
  if (typeof window === 'undefined') {
    return {
      users: [],
      posts: seedPosts,
      partnerApplications: [],
      currentUserId: null,
      unlockedPostIds: {},
      siteContent: defaultSiteContent,
    }
  }

  const saved = window.localStorage.getItem(storageKey)
  if (!saved) {
    return {
      users: [],
      posts: seedPosts,
      partnerApplications: [],
      currentUserId: null,
      unlockedPostIds: {},
      siteContent: defaultSiteContent,
    }
  }

  try {
    const parsed = JSON.parse(saved) as StoredState
    return {
      users: (parsed.users ?? []).map(normalizeUser),
      posts: parsed.posts?.length ? parsed.posts : seedPosts,
      partnerApplications: parsed.partnerApplications ?? [],
      currentUserId: parsed.currentUserId ?? null,
      unlockedPostIds: parsed.unlockedPostIds ?? {},
      siteContent: normalizeSiteContent(parsed.siteContent),
    }
  } catch {
    return {
      users: [],
      posts: seedPosts,
      partnerApplications: [],
      currentUserId: null,
      unlockedPostIds: {},
      siteContent: defaultSiteContent,
    }
  }
}

type EditableTextProps = {
  as?: 'p' | 'h1' | 'span' | 'strong'
  className?: string
  value: string
  onChange: (value: string) => void
}

const EditableText = ({ as = 'span', className, value, onChange }: EditableTextProps) => {
  const Tag = as

  return (
    <Tag
      className={className ? `inline-editable ${className}` : 'inline-editable'}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(event) => {
        const nextValue = event.currentTarget.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''
        onChange(nextValue || value)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && as !== 'p') {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
    >
      {value}
    </Tag>
  )
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'))
  const isAdminRoute = currentPath === '/admin'
  const isProfileRoute = currentPath === '/me'
  const isPostsRoute = currentPath === '/posts'
  const isQuestionsRoute = currentPath === '/questions'
  const questionRouteId =
    typeof window !== 'undefined' ? currentPath.match(/^\/questions\/([^/]+)$/)?.[1] : undefined
  const postRouteId = typeof window !== 'undefined' ? currentPath.match(/^\/posts\/([^/]+)$/)?.[1] : undefined
  const isQuestionDetailRoute = Boolean(questionRouteId)
  const isPostDetailRoute = Boolean(postRouteId)
  const isRewardsRoute = currentPath === '/rewards'
  const isCategoriesRoute = currentPath === '/categories'
  const isAboutRoute = currentPath === '/about'
  const isInfoRoute =
    isQuestionsRoute || isQuestionDetailRoute || isPostDetailRoute || isRewardsRoute || isCategoriesRoute || isAboutRoute
  const schoolRouteId =
    typeof window !== 'undefined'
      ? currentPath.match(/^\/schools\/([^/]+)$/)?.[1] ?? currentPath.match(/^\/school\/([^/]+)$/)?.[1]
      : undefined
  const initialAdminToken = typeof window !== 'undefined' ? window.sessionStorage.getItem(adminSessionKey) ?? '' : ''
  const [appState, setAppState] = useState<StoredState>(() => initialState())
  const currentUser = appState.users.find((user) => user.id === appState.currentUserId) ?? null
  const [selectedCategory, setSelectedCategory] = useState(allCategoryLabel)
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState(allCategoryLabel)
  const [questionStatusFilter, setQuestionStatusFilter] = useState<'all' | QuestionStatus>('all')
  const [questionSort, setQuestionSort] = useState<'reward' | 'views' | 'latest'>('reward')
  const [query, setQuery] = useState(() =>
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') ?? '' : '',
  )
  const [postSchoolFilter, setPostSchoolFilter] = useState('全部学校')
  const [postCityFilter, setPostCityFilter] = useState('全部城市')
  const [postFeaturedFilter, setPostFeaturedFilter] = useState<'all' | 'featured'>('all')
  const [selectedSchoolId, setSelectedSchoolId] = useState(() => getInitialSchoolId())
  const [openRegion, setOpenRegion] = useState(
    () => getParentRegion(getInitialSchoolId()) ?? schoolRegions[0].region,
  )
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [partnerOpen, setPartnerOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(() => isAdminRoute && Boolean(initialAdminToken))
  const [adminLoginOpen, setAdminLoginOpen] = useState(() => isAdminRoute && !initialAdminToken)
  const [adminToken, setAdminToken] = useState(initialAdminToken)
  const [adminTab, setAdminTab] = useState<'users' | 'posts' | 'partners' | 'content'>('users')
  const [contentDraft, setContentDraft] = useState<SiteContentSettings>(() => normalizeSiteContent(appState.siteContent))
  const [inlineEditMode, setInlineEditMode] = useState(false)
  const [selectedAdminUserId, setSelectedAdminUserId] = useState<string | null>(null)
  const [activePost, setActivePost] = useState<Post | null>(null)
  const [, setMessage] = useState('')
  const [schoolPages, setSchoolPages] = useState<Record<string, number>>({})
  const [authNotice, setAuthNotice] = useState('')

  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    emailCode: '',
    identity: '准备申请',
    school: '',
    avatarUrl: '',
    bio: '',
    documents: [] as CredentialDocument[],
  })
  const [pendingEmail, setPendingEmail] = useState('')
  const [pointDrafts, setPointDrafts] = useState<Record<string, string>>({})
  const [earningPointDrafts, setEarningPointDrafts] = useState<Record<string, string>>({})
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [schoolGalleries, setSchoolGalleries] = useState<Record<string, string[]>>({})

  const [postForm, setPostForm] = useState({
    title: '',
    school: allSchoolProfiles[0].name,
    category: '签证/滞留资格',
    excerpt: '',
    body: '',
    price: '0',
  })
  const [partnerForm, setPartnerForm] = useState({
    company: '',
    type: '留学机构',
    contact: '',
    phone: '',
    direction: '内容入驻',
    budget: '',
    detail: '',
  })
  const [adminLoginForm, setAdminLoginForm] = useState({
    username: '',
    password: '',
    error: '',
  })
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name ?? '',
    avatarUrl: currentUser?.avatarUrl ?? '',
    bio: currentUser?.bio ?? '',
    identity: currentUser?.identity ?? '准备申请',
    school: currentUser?.school ?? '',
    documents: [] as CredentialDocument[],
  })

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(appState))
  }, [appState])

  useEffect(() => {
    if (!adminToken) {
      setInlineEditMode(false)
    }
  }, [adminToken])

  useEffect(() => {
    fetch('/api/site-content')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { siteContent?: Partial<SiteContentSettings> } | null) => {
        if (!data?.siteContent) return
        const nextContent = normalizeSiteContent(data.siteContent)
        setAppState((state) => ({ ...state, siteContent: nextContent }))
        setContentDraft(nextContent)
      })
      .catch(() => {
        // Local saved content keeps the page editable when the API is unavailable.
      })
  }, [])

  useEffect(() => {
    const syncPath = () => {
      setCurrentPath(window.location.pathname)
      if (window.location.pathname === '/posts') {
        setQuery(new URLSearchParams(window.location.search).get('q') ?? '')
      }
    }
    window.addEventListener('popstate', syncPath)
    return () => window.removeEventListener('popstate', syncPath)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const defaultTitle = '留学生首页 - 留学生经验分享与问题解决平台'
    const defaultDescription =
      '留学生首页是一个面向留学生的经验分享与问答社区，提供签证、租房、入学、打工、保险、银行卡、毕业和就业等真实经验，帮助留学生少走弯路。'
    const routeSlug =
      currentPath.match(/^\/schools\/([^/]+)$/)?.[1] ?? currentPath.match(/^\/school\/([^/]+)$/)?.[1] ?? ''
    const currentSchoolTopic = routeSlug ? getSchoolTopicBySlug(decodeURIComponent(routeSlug)) : undefined

    document.title = currentSchoolTopic?.seoTitle ?? defaultTitle
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', currentSchoolTopic?.seoDescription ?? defaultDescription)
  }, [currentPath])

  useEffect(() => {
    fetch('/api/posts')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { posts?: Post[] } | null) => {
        if (data?.posts?.length) {
          setAppState((state) => {
            const remotePosts = data.posts ?? []
            const seedIds = new Set(seedPosts.map((post) => post.id))
            const mergedRemotePosts = remotePosts.filter((post) => !seedIds.has(post.id))
            return { ...state, posts: [...seedPosts, ...mergedRemotePosts] }
          })
        }
      })
      .catch(() => {
        // Keep the local demo data when the Cloudflare API is not bound yet.
      })
  }, [])

  const selectedAdminUser = appState.users.find((user) => user.id === selectedAdminUserId) ?? null
  const currentUnlocks = currentUser ? appState.unlockedPostIds[currentUser.id] ?? [] : []
  const decodedSchoolRouteId = schoolRouteId ? decodeURIComponent(schoolRouteId) : ''
  const schoolTopic = decodedSchoolRouteId ? getSchoolTopicBySlug(decodedSchoolRouteId) : undefined
  const routeSchool = decodedSchoolRouteId
    ? allSchoolProfiles.find((school) => school.id === decodedSchoolRouteId)
    : null
  const selectedSchool =
    routeSchool ?? allSchoolProfiles.find((school) => school.id === selectedSchoolId) ?? allSchoolProfiles[0]
  const schoolTopicHeroImage = schoolTopic?.id === 'konkuk' ? '/schools/konkuk-lake.jpg' : selectedSchool.image
  const selectedCampusLinks = getCampusLinks(selectedSchool)
  const selectedSchoolGallery = schoolGalleries[selectedSchool.id]?.length
    ? schoolGalleries[selectedSchool.id]
    : getFallbackGalleryImages(selectedSchool)
  const selectedSchoolGalleryLoaded = Boolean(schoolGalleries[selectedSchool.id]?.length)
  const normalizedAuthEmail = authForm.email.trim().toLowerCase()
  const isEmailCodeVerified =
    authMode === 'register' &&
    Boolean(pendingEmail) &&
    pendingEmail === normalizedAuthEmail &&
    authForm.emailCode.trim().length === 6

  useEffect(() => {
    if (!schoolRouteId || selectedSchoolGalleryLoaded) return

    const controller = new AbortController()
    const endpoint =
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=${encodeURIComponent(
        `${selectedSchool.englishName} campus university`,
      )}` + '&prop=imageinfo&iiprop=url&iiurlwidth=1800&format=json&origin=*'

    fetch(endpoint, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { query?: { pages?: Record<string, CommonsImagePage> } } | null) => {
        const images = Object.values(data?.query?.pages ?? {})
          .flatMap((page) => page.imageinfo ?? [])
          .map((image) => image.thumburl ?? image.url)
          .filter((url): url is string => Boolean(url))
          .filter((url) => !/logo|seal|map|icon/i.test(url))

        if (!images.length) return

        setSchoolGalleries((galleries) => ({
          ...galleries,
          [selectedSchool.id]: [...new Set([selectedSchool.image, ...images])].slice(0, 4),
        }))
      })
      .catch(() => {
        // Keep the curated school image if Wikimedia search is unavailable.
      })

    return () => controller.abort()
  }, [
    schoolRouteId,
    selectedSchool.englishName,
    selectedSchool.id,
    selectedSchool.image,
    selectedSchoolGalleryLoaded,
  ])

  const filteredPosts = useMemo(() => {
    return appState.posts.filter((post) => {
      const matchesCategory = selectedCategory === allCategoryLabel || post.category === selectedCategory
      const matchesSchool = postSchoolFilter === '全部学校' || post.school === postSchoolFilter
      const matchesCity = postCityFilter === '全部城市' || post.city === postCityFilter
      const matchesFeatured = postFeaturedFilter === 'all' || post.featured
      const text = `${post.title}${post.school}${post.category}${post.excerpt}${post.author}${post.city ?? ''}${post.country ?? ''}`
      const matchesQuery = text.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesSchool && matchesCity && matchesFeatured && matchesQuery
    })
  }, [appState.posts, postCityFilter, postFeaturedFilter, postSchoolFilter, selectedCategory, query])
  const postCityOptions = useMemo(
    () => ['全部城市', ...Array.from(new Set(appState.posts.map((post) => post.city).filter(Boolean)))],
    [appState.posts],
  )
  const filteredQuestions = useMemo(() => {
    const questions = seedQuestions.filter((question) => {
      const matchesCategory = questionCategoryFilter === allCategoryLabel || question.category === questionCategoryFilter
      const matchesStatus = questionStatusFilter === 'all' || question.status === questionStatusFilter
      return matchesCategory && matchesStatus
    })

    return [...questions].sort((a, b) => {
      if (questionSort === 'views') return b.views - a.views
      if (questionSort === 'latest') return b.createdAt.localeCompare(a.createdAt)
      return b.rewardPoints - a.rewardPoints
    })
  }, [questionCategoryFilter, questionSort, questionStatusFilter])
  const selectedQuestion = questionRouteId
    ? seedQuestions.find((question) => question.id === decodeURIComponent(questionRouteId))
    : undefined
  const selectedQuestionAnswers = selectedQuestion
    ? seedAnswers
        .filter((answer) => answer.questionId === selectedQuestion.id)
        .sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.likes - a.likes)
    : []
  const selectedPost = postRouteId
    ? appState.posts.find((post) => post.id === decodeURIComponent(postRouteId)) ??
      seedPosts.find((post) => post.id === decodeURIComponent(postRouteId))
    : undefined
  const siteContent = normalizeSiteContent(appState.siteContent)
  const activeSiteContent = inlineEditMode ? contentDraft : siteContent
  const heroStyle = {
    '--mobile-logo-width': `${activeSiteContent.mobileLogoWidth}vw`,
    '--mobile-hero-title-size': `${activeSiteContent.mobileHeroTitleSize}px`,
    '--mobile-hero-copy-size': `${activeSiteContent.mobileHeroCopySize}px`,
    '--mobile-search-scale': activeSiteContent.mobileSearchScale,
  } as CSSProperties
  const selectedSchoolPosts = appState.posts.filter((post) => post.school === selectedSchool.name)
  const currentUserPosts = currentUser
    ? appState.posts.filter((post) => post.authorId === currentUser.id || post.author === currentUser.name)
    : []
  const openPostsPage = (nextQuery = query) => {
    const trimmedQuery = nextQuery.trim()
    const nextUrl = trimmedQuery ? `/posts?q=${encodeURIComponent(trimmedQuery)}` : '/posts'
    window.history.pushState(null, '', nextUrl)
    window.dispatchEvent(new PopStateEvent('popstate'))
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  const navigateToPath = (path: string) => {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  const updateUserPoints = (userId: string, nextPoints: number) => {
    const normalizedPoints = Math.max(0, Number.isFinite(nextPoints) ? nextPoints : 0)
    setAppState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === userId ? { ...user, points: normalizedPoints } : user,
      ),
    }))
    setPointDrafts((drafts) => ({ ...drafts, [userId]: String(normalizedPoints) }))
    if (adminToken) {
      fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        body: JSON.stringify({ points: normalizedPoints }),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }).catch(() => setMessage('积分更新失败，请稍后重试。'))
    }
  }

  const updateUserEarningPoints = (userId: string, nextEarningPoints: number) => {
    const normalizedEarningPoints = Math.max(0, Number.isFinite(nextEarningPoints) ? nextEarningPoints : 0)
    setAppState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === userId ? { ...user, earningPoints: normalizedEarningPoints } : user,
      ),
    }))
    setEarningPointDrafts((drafts) => ({ ...drafts, [userId]: String(normalizedEarningPoints) }))
    if (adminToken) {
      fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        body: JSON.stringify({ earningPoints: normalizedEarningPoints }),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }).catch(() => setMessage('收益积分更新失败，请稍后重试。'))
    }
  }

  const updateUserAccount = (userId: string, patch: Partial<User>) => {
    setAppState((state) => ({
      ...state,
      users: state.users.map((user) => (user.id === userId ? { ...user, ...patch } : user)),
      currentUserId: patch.status === 'banned' && state.currentUserId === userId ? null : state.currentUserId,
    }))
    if (adminToken) {
      fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }).catch(() => setMessage('账号状态更新失败，请稍后重试。'))
    }
  }

  const updateUserDocuments = (
    userId: string,
    status: VerificationStatus,
    verificationStatus: VerificationStatus = status,
  ) => {
    setAppState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              verificationStatus,
              documents: user.documents.map((document) => ({ ...document, status })),
            }
          : user,
      ),
    }))
    if (adminToken) {
      const user = appState.users.find((item) => item.id === userId)
      fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        body: JSON.stringify({
          verificationStatus,
          documents: user?.documents.map((document) => ({ ...document, status })) ?? [],
        }),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }).catch(() => setMessage('材料审核状态更新失败，请稍后重试。'))
    }
  }

  const removeUser = (userId: string) => {
    setAppState((state) => {
      const nextUnlocks = { ...state.unlockedPostIds }
      delete nextUnlocks[userId]

      return {
        ...state,
        users: state.users.filter((user) => user.id !== userId),
        currentUserId: state.currentUserId === userId ? null : state.currentUserId,
        unlockedPostIds: nextUnlocks,
      }
    })
    if (selectedAdminUserId === userId) {
      setSelectedAdminUserId(null)
    }
    if (adminToken) {
      fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        headers: { authorization: `Bearer ${adminToken}` },
        method: 'DELETE',
      }).catch(() => setMessage('账号删除失败，请稍后重试。'))
    }
    setMessage('后台已删除用户。')
  }

  const updatePost = (postId: string, patch: Partial<Post>) => {
    setAppState((state) => ({
      ...state,
      posts: state.posts.map((post) => (post.id === postId ? { ...post, ...patch } : post)),
    }))
    if (adminToken) {
      fetch(`/api/admin/posts/${encodeURIComponent(postId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }).catch(() => setMessage('帖子更新失败，请稍后重试。'))
    }
  }

  const removePost = (postId: string) => {
    setAppState((state) => ({
      ...state,
      posts: state.posts.filter((post) => post.id !== postId),
      unlockedPostIds: Object.fromEntries(
        Object.entries(state.unlockedPostIds).map(([userId, postIds]) => [
          userId,
          postIds.filter((id) => id !== postId),
        ]),
      ),
    }))
    if (activePost?.id === postId) {
      setActivePost(null)
    }
    if (adminToken) {
      fetch(`/api/admin/posts/${encodeURIComponent(postId)}`, {
        headers: { authorization: `Bearer ${adminToken}` },
        method: 'DELETE',
      }).catch(() => setMessage('帖子删除失败，请稍后重试。'))
    }
    setMessage('后台已删除帖子。')
  }

  const updateContentDraft = <Key extends keyof SiteContentSettings>(key: Key, value: SiteContentSettings[Key]) => {
    setContentDraft((draft) => normalizeSiteContent({ ...draft, [key]: value }))
  }

  const saveSiteContent = async () => {
    const nextContent = normalizeSiteContent(contentDraft)
    setAppState((state) => ({ ...state, siteContent: nextContent }))

    if (!adminToken) {
      setMessage('内容已保存到当前浏览器。登录后台后可保存到线上数据库。')
      return
    }

    try {
      const response = await fetch('/api/admin/site-content', {
        body: JSON.stringify({ siteContent: nextContent }),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PUT',
      })
      if (!response.ok) throw new Error('site-content-save-failed')
      const data = (await response.json()) as { siteContent?: Partial<SiteContentSettings> }
      const savedContent = normalizeSiteContent(data.siteContent ?? nextContent)
      setContentDraft(savedContent)
      setAppState((state) => ({ ...state, siteContent: savedContent }))
      setMessage('网站内容设置已保存，刷新后仍然生效。')
    } catch {
      setMessage('内容已先保存到当前浏览器，线上保存失败，请稍后重试。')
    }
  }

  const resetSiteContentDraft = () => {
    setContentDraft(defaultSiteContent)
    setMessage('已恢复默认草稿，点保存后才会生效。')
  }

  const startInlineEditing = () => {
    setContentDraft(siteContent)
    setInlineEditMode(true)
    if (currentPath !== '/') {
      navigateToPath('/')
    }
  }

  const cancelInlineEditing = () => {
    setContentDraft(siteContent)
    setInlineEditMode(false)
  }

  const saveInlineEditing = async () => {
    await saveSiteContent()
    setInlineEditMode(false)
  }

  const openSchoolPage = (school: SchoolProfile) => {
    if (school.id === 'konkuk') {
      navigateToPath('/schools/konkuk')
      return
    }

    const parentRegion = schoolRegions.find((group) =>
      group.schools.some((item) => item.id === school.id),
    )
    setSelectedSchoolId(school.id)
    setOpenRegion(parentRegion?.region ?? school.region)
    window.history.replaceState(null, '', `#school-${school.id}`)
    window.setTimeout(() => {
      document.getElementById('school-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const openRegionSection = (region: string) => {
    setOpenRegion(region)
    setSchoolPages((pages) => ({ ...pages, [region]: pages[region] ?? 1 }))
    setMegaMenuOpen(false)
    document.getElementById('school-browser')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openRegionMenu = (region: string) => {
    setOpenRegion(region)
    setSchoolPages((pages) => ({ ...pages, [region]: pages[region] ?? 1 }))
  }

  const changeSchoolPage = (region: string, page: number) => {
    setSchoolPages((pages) => ({ ...pages, [region]: page }))
  }

  const refreshAdminState = async (token = adminToken) => {
    if (!token) return
    const response = await fetch('/api/admin/state', {
      headers: { authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('admin-state-failed')
    const data = (await response.json()) as {
      users: User[]
      posts: Post[]
      partnerApplications?: PartnerApplication[]
      siteContent?: Partial<SiteContentSettings>
    }
    const nextSiteContent = normalizeSiteContent(data.siteContent ?? appState.siteContent)
    setAppState((state) => ({
      ...state,
      users: data.users ?? state.users,
      posts: data.posts?.length ? data.posts : state.posts,
      partnerApplications: data.partnerApplications ?? state.partnerApplications,
      siteContent: nextSiteContent,
    }))
    setContentDraft(nextSiteContent)
  }

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthNotice('')
    const email = authForm.email.trim().toLowerCase()
    const password = authForm.password.trim()
    const confirmPassword = authForm.confirmPassword.trim()

    if (!email || !password) {
      setMessage('请填写邮箱和密码。')
      setAuthNotice('请填写邮箱和密码。')
      return
    }

    if (authMode === 'login') {
      try {
        const response = await fetch('/api/auth/login', {
          body: JSON.stringify({ email, password }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        })
        const data = (await response.json()) as { user?: User; error?: string }
        if (!response.ok || !data.user) {
          setMessage(data.error ?? '没有找到这个账号，或密码不正确。')
          setAuthNotice(data.error ?? '没有找到这个账号，或密码不正确。')
          return
        }
        const loggedInUser = data.user
        setAppState((state) => ({
          ...state,
          users: state.users.some((user) => user.id === loggedInUser.id)
            ? state.users.map((user) => (user.id === loggedInUser.id ? loggedInUser : user))
            : [...state.users, loggedInUser],
          currentUserId: loggedInUser.id,
        }))
        setAuthMode(null)
        setMessage(`欢迎回来，${loggedInUser.name}。`)
        return
      } catch {
        // Fall back to local demo login when the Cloudflare API is not configured.
      }

      const matched = appState.users.find(
        (user) => user.email === email && user.password === password,
      )
      if (!matched) {
        setMessage('没有找到这个账号，或密码不正确。')
        setAuthNotice('没有找到这个账号，或密码不正确。')
        return
      }
      if (matched.status === 'banned') {
        setMessage('这个账号已被封号，请联系平台管理员。')
        setAuthNotice('这个账号已被封号，请联系平台管理员。')
        return
      }
      setAppState((state) => ({ ...state, currentUserId: matched.id }))
      setAuthMode(null)
      setMessage(`欢迎回来，${matched.name}。`)
      return
    }

    if (password.length < 6) {
      setMessage('密码至少需要 6 位。')
      setAuthNotice('密码至少需要 6 位。')
      return
    }

    if (password !== confirmPassword) {
      setMessage('两次输入的密码不一致。')
      setAuthNotice('两次输入的密码不一致。')
      return
    }

    if (pendingEmail !== email || authForm.emailCode.trim().length !== 6) {
      setMessage('请先完成邮箱验证码校验。')
      setAuthNotice('请发送验证码，并输入邮箱收到的 6 位数字。')
      return
    }

    if (appState.users.some((user) => user.email === email)) {
      setMessage('这个邮箱已经注册过了，可以直接登录。')
      setAuthNotice('这个邮箱已经注册过了，可以直接登录。')
      return
    }

    const user: User = {
      id: createId('user'),
      name: authForm.name.trim() || '韩国留学用户',
      email,
      password,
      identity: authForm.identity,
      school: authForm.school.trim() || '暂未填写',
      points: registerBonusPoints,
      earningPoints: 0,
      joinedAt: new Date().toISOString(),
      status: 'active',
      verificationStatus: authForm.documents.length ? 'pending' : 'pending',
      avatarUrl: authForm.avatarUrl.trim(),
      bio: authForm.bio.trim(),
      documents: authForm.documents,
    }

    try {
      const response = await fetch('/api/auth/register', {
        body: JSON.stringify({ ...user, password, emailCode: authForm.emailCode.trim() }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { user?: User; error?: string }
      if (!response.ok || !data.user) {
        setMessage(data.error ?? '注册失败，请稍后再试。')
        setAuthNotice(data.error ?? '注册失败，请稍后再试。')
        return
      }
      user.id = data.user.id
      user.joinedAt = data.user.joinedAt
    } catch {
      setMessage('网络连接不稳定，本次信息已暂存，请稍后刷新确认。')
    }

    setAppState((state) => ({
      ...state,
      users: [...state.users, user],
      currentUserId: user.id,
      unlockedPostIds: { ...state.unlockedPostIds, [user.id]: [] },
    }))
    setAuthMode(null)
    setPendingEmail('')
    setAuthNotice('')
    setAuthForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      emailCode: '',
      identity: '准备申请',
      school: '',
      avatarUrl: '',
      bio: '',
      documents: [],
    })
    setMessage(`注册成功，已获得 ${registerBonusPoints} 消费积分，可用于解锁加精内容。`)
  }

  const sendEmailCode = async () => {
    const email = authForm.email.trim().toLowerCase()
    if (!email) {
      setMessage('请先填写邮箱，再发送验证码。')
      setAuthNotice('请先填写邮箱，再发送验证码。')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('邮箱格式不正确。')
      setAuthNotice('邮箱格式不正确，请检查后再发送。')
      return
    }
    if (appState.users.some((user) => user.email === email)) {
      setMessage('这个邮箱已经注册过了，可以直接登录。')
      setAuthNotice('这个邮箱已经注册过了，可以直接登录。')
      return
    }
    try {
      const response = await fetch('/api/auth/send-code', {
        body: JSON.stringify({ email }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        setAuthNotice(data.error ?? '验证码邮件发送失败。')
        setMessage(data.error ?? '验证码邮件发送失败。')
        return
      }
      setPendingEmail(email)
      setAuthForm((form) => ({ ...form, emailCode: '' }))
      setAuthNotice(`验证码已发送到 ${email}，请在 10 分钟内填写。`)
      setMessage(`验证码已发送到 ${email}。`)
    } catch {
      setAuthNotice('验证码邮件发送失败，请稍后再试。')
      setMessage('验证码邮件发送失败，请稍后再试。')
    }
  }

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) {
      setAuthMode('register')
      setMessage('请先注册或登录，再发布经验。')
      return
    }
    if (currentUser.status === 'muted' || currentUser.status === 'banned') {
      setMessage(currentUser.status === 'banned' ? '账号已被封号，不能发布内容。' : '账号已被禁言，暂时不能发布内容。')
      return
    }

    const price = Math.max(0, Number.parseInt(postForm.price, 10) || 0)
    if (!postForm.title.trim() || !postForm.body.trim()) {
      setMessage('标题和正文是必填项。')
      return
    }

    const post: Post = {
      id: createId('post'),
      title: postForm.title.trim(),
      school: postForm.school.trim() || '韩国留学',
      category: postForm.category,
      author: currentUser.name,
      authorId: currentUser.id,
      price,
      hot: '新发布',
      excerpt: postForm.excerpt.trim() || postForm.body.trim().slice(0, 58),
      body: postForm.body.trim(),
      createdAt: new Date().toISOString(),
      featured: price > 0,
    }

    try {
      const response = await fetch('/api/posts', {
        body: JSON.stringify({ ...post, userId: currentUser.id }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { post?: Post; error?: string }
      if (!response.ok || !data.post) {
        setMessage(data.error ?? '发布失败，请稍后再试。')
        return
      }
      post.id = data.post.id
      post.createdAt = data.post.createdAt
      post.author = data.post.author
      post.authorId = data.post.authorId
    } catch {
      setMessage('网络连接不稳定，本次内容已暂存，请稍后刷新确认。')
    }

    setAppState((state) => ({
      ...state,
      posts: [post, ...state.posts],
      users: state.users.map((user) =>
        user.id === currentUser.id ? { ...user, points: user.points + postApprovedBonusPoints } : user,
      ),
    }))
    setPostForm({
      title: '',
      school: allSchoolProfiles[0].name,
      category: '签证/滞留资格',
      excerpt: '',
      body: '',
      price: '0',
    })
    setPublishOpen(false)
    setMessage(`发布成功，系统已奖励 ${postApprovedBonusPoints} 消费积分。被付费解锁后会进入可提现收益积分。`)
  }

  const handlePartnerApply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!partnerForm.company.trim() || !partnerForm.contact.trim() || !partnerForm.phone.trim()) {
      setMessage('请填写机构名称、联系人和联系方式。')
      return
    }

    try {
      const response = await fetch('/api/partner-applications', {
        body: JSON.stringify(partnerForm),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { application?: PartnerApplication; error?: string }
      if (!response.ok || !data.application) {
        setMessage(data.error ?? '合作申请提交失败，请稍后再试。')
        return
      }
      setAppState((state) => ({
        ...state,
        partnerApplications: [data.application as PartnerApplication, ...state.partnerApplications],
      }))
    } catch {
      const localApplication: PartnerApplication = {
        id: createId('partner'),
        ...partnerForm,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      setAppState((state) => ({
        ...state,
        partnerApplications: [localApplication, ...state.partnerApplications],
      }))
    }

    setPartnerForm({
      company: '',
      type: '留学机构',
      contact: '',
      phone: '',
      direction: '内容入驻',
      budget: '',
      detail: '',
    })
    setPartnerOpen(false)
    setMessage('合作申请已提交，团队会在后台跟进。')
  }

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) {
      setAuthMode('login')
      return
    }

    const patch: Partial<User> = {
      name: profileForm.name.trim() || currentUser.name,
      avatarUrl: profileForm.avatarUrl.trim(),
      bio: profileForm.bio.trim(),
      identity: profileForm.identity,
      school: profileForm.school.trim() || currentUser.school,
      documents: profileForm.documents,
    }

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(currentUser.id)}`, {
        body: JSON.stringify(patch),
        headers: { 'content-type': 'application/json' },
        method: 'PATCH',
      })
      const data = (await response.json()) as { user?: User; error?: string }
      if (!response.ok || !data.user) {
        setMessage(data.error ?? '个人信息保存失败。')
        return
      }
      setAppState((state) => ({
        ...state,
        users: state.users.map((user) => (user.id === currentUser.id ? data.user as User : user)),
      }))
      setMessage('个人信息已保存。')
      return
    } catch {
      setAppState((state) => ({
        ...state,
        users: state.users.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                ...patch,
                documents: [...user.documents, ...(profileForm.documents ?? [])],
              }
            : user,
        ),
      }))
      setMessage('个人信息已保存。')
    }
  }

  const removeOwnPost = (postId: string) => {
    if (currentUser) {
      fetch(`/api/posts/${encodeURIComponent(postId)}`, {
        body: JSON.stringify({ userId: currentUser.id }),
        headers: { 'content-type': 'application/json' },
        method: 'DELETE',
      }).catch(() => setMessage('帖子已从当前列表移除，稍后将同步最新状态。'))
    }
    setAppState((state) => ({
      ...state,
      posts: state.posts.filter((post) => post.id !== postId),
    }))
    removePost(postId)
  }

  const openPost = (post: Post) => {
    if (post.price === 0 || (currentUser && currentUnlocks.includes(post.id))) {
      setActivePost(post)
      return
    }

    if (!currentUser) {
      setAuthMode('login')
      setMessage('这篇是加精内容，请先登录后用积分解锁。')
      return
    }

    if (currentUser.points < post.price) {
      setMessage(`消费积分不足，还差 ${post.price - currentUser.points} 积分。可通过发布经验或充值获取积分。`)
      return
    }

    setAppState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === currentUser.id
          ? { ...user, points: user.points - post.price }
          : user.id === post.authorId
            ? { ...user, earningPoints: user.earningPoints + post.price }
            : user,
      ),
      unlockedPostIds: {
        ...state.unlockedPostIds,
        [currentUser.id]: [...(state.unlockedPostIds[currentUser.id] ?? []), post.id],
      },
    }))
    fetch(`/api/posts/${encodeURIComponent(post.id)}/unlock`, {
      body: JSON.stringify({ userId: currentUser.id }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { users?: User[] } | null) => {
        if (data?.users?.length) {
          setAppState((state) => ({ ...state, users: data.users ?? state.users }))
        }
      })
      .catch(() => {
        // Keep the optimistic local unlock when the API is unavailable.
      })
    setActivePost(post)
    setMessage(`已使用 ${post.price} 消费积分解锁：${post.title}`)
  }

  const scrollToPartnerSection = () => {
    document.getElementById('partner-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openAdminEntry = () => {
    if (adminToken) {
      setAdminOpen(true)
      refreshAdminState().catch(() => setMessage('后台数据同步失败，请稍后重试。'))
      return
    }
    setAdminLoginOpen(true)
  }

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch('/api/admin/login', {
      body: JSON.stringify({
        username: adminLoginForm.username.trim(),
        password: adminLoginForm.password,
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    }).catch(() => null)
    const data = response ? ((await response.json()) as { token?: string; error?: string }) : null

    if (!response?.ok || !data?.token) {
      setAdminLoginForm((form) => ({
        ...form,
        error: data?.error ?? '管理员登录失败，请确认账号或密码是否正确。',
      }))
      return
    }

    window.sessionStorage.setItem(adminSessionKey, data.token)
    setAdminToken(data.token)
    setAdminLoginOpen(false)
    setAdminOpen(true)
    setAdminLoginForm({ username: '', password: '', error: '' })
    refreshAdminState(data.token).catch(() => setMessage('后台已登录，数据同步失败，请刷新后重试。'))
  }

  const logoutAdmin = () => {
    window.sessionStorage.removeItem(adminSessionKey)
    setAdminToken('')
    setAdminOpen(false)
    setSelectedAdminUserId(null)
  }

  const mainClassName = isAdminRoute
    ? 'admin-route'
    : isProfileRoute
      ? 'profile-route'
      : isPostsRoute
        ? 'posts-route'
        : isInfoRoute
          ? 'info-route'
          : schoolRouteId
            ? 'school-route'
            : undefined

  return (
    <main className={mainClassName}>
      <header className="site-header" aria-label="Main navigation">
        <a
          className="brand"
          href="/"
          aria-label="留学生经验分享与问题解决平台首页"
          onClick={(event) => {
            event.preventDefault()
            setMegaMenuOpen(false)
            window.history.pushState(null, '', '/')
            window.dispatchEvent(new PopStateEvent('popstate'))
            window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
          }}
        >
          <span className="brand-mark">
            <img className="brand-logo-image" src="/shouye-logo-wordmark.png" alt="" aria-hidden="true" />
            <button
              aria-label="打开后台管理"
              className="hidden-admin-button"
              type="button"
              onClick={(event) => {
                event.preventDefault()
                openAdminEntry()
              }}
            />
          </span>
          <span className="brand-tagline">留学生经验分享与问题解决平台</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <div
            className={megaMenuOpen ? 'nav-dropdown is-open' : 'nav-dropdown'}
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
            onFocus={() => setMegaMenuOpen(true)}
            onBlur={() => setMegaMenuOpen(false)}
          >
            <a href="#school-browser" onClick={() => setMegaMenuOpen(false)}>
              院校入口
            </a>
            <div className="mega-menu" aria-label="韩国院校地区导航">
              <div className="mega-menu-inner">
                <div>
                  <p className="mega-eyebrow">韩国主流院校导航</p>
                  <h3>按地区进入院校库</h3>
                </div>
                <div className="mega-region-grid">
                  {schoolRegions.map((group) => (
                    <button
                      key={group.region}
                      type="button"
                      onClick={() => openRegionSection(group.region)}
                    >
                      <span>{group.region}</span>
                      <small>{group.schools.length} 所院校 · {group.summary}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <a
            href="/questions"
            onClick={(event) => {
              event.preventDefault()
              navigateToPath('/questions')
            }}
          >
            我要提问
          </a>
          <a
            href="/posts"
            onClick={(event) => {
              event.preventDefault()
              openPostsPage('')
            }}
          >
            经验分享
          </a>
          <a
            href="/rewards"
            onClick={(event) => {
              event.preventDefault()
              navigateToPath('/rewards')
            }}
          >
            收益规则
          </a>
          <a
            href="/categories"
            onClick={(event) => {
              event.preventDefault()
              navigateToPath('/categories')
            }}
          >
            分类
          </a>
        </nav>
        {currentUser ? (
          <div className="user-pill">
            <span>{currentUser.name}</span>
            <strong>{currentUser.points} 消费积分</strong>
            <button
              type="button"
              onClick={() => {
                setProfileForm({
                  name: currentUser.name,
                  avatarUrl: currentUser.avatarUrl,
                  bio: currentUser.bio,
                  identity: currentUser.identity,
                  school: currentUser.school,
                  documents: [],
                })
                window.history.pushState(null, '', '/me')
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
            >
              个人中心
            </button>
            <button
              type="button"
              onClick={() => setAppState((state) => ({ ...state, currentUserId: null }))}
            >
              退出
            </button>
          </div>
        ) : (
          <div className="header-actions">
            <button className="quiet-button" type="button" onClick={() => setAuthMode('login')}>
              登录
            </button>
            <button className="ghost-button" type="button" onClick={() => setAuthMode('register')}>
              注册
              <UserPlus size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </header>

      {adminToken && !isAdminRoute && (
        <div className={inlineEditMode ? 'inline-editor-bar active' : 'inline-editor-bar'}>
          <div>
            <strong>{inlineEditMode ? '网页编辑模式' : '管理员工具'}</strong>
            <span>{inlineEditMode ? '直接点首页文字修改，改完点保存。' : '可以在当前页面直接改首页内容。'}</span>
          </div>
          <div className="inline-editor-actions">
            {inlineEditMode ? (
              <>
                <button type="button" onClick={cancelInlineEditing}>
                  取消
                </button>
                <button className="save-inline-button" type="button" onClick={saveInlineEditing}>
                  保存
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={openAdminEntry}>
                  后台
                </button>
                <button className="save-inline-button" type="button" onClick={startInlineEditing}>
                  进入编辑模式
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <section className={inlineEditMode ? 'hero-section inline-editing' : 'hero-section'} id="top" style={heroStyle}>
        <img className="hero-image" src={heroImage} alt="韩国延世大学校园建筑" />
        <div className="hero-overlay" />
        <img
          className="hero-side-wordmark"
          src="/brand/shouye-logo-mobile-light-text.png"
          alt="售业"
          aria-hidden="true"
        />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <img
            className="hero-mobile-wordmark"
            src="/brand/shouye-logo-mobile-light-text.png"
            alt="售业"
            aria-hidden="true"
          />
          {inlineEditMode ? (
            <EditableText
              as="p"
              className="eyebrow hero-eyebrow"
              value={activeSiteContent.heroEyebrow}
              onChange={(value) => updateContentDraft('heroEyebrow', value)}
            />
          ) : (
            <p className="eyebrow hero-eyebrow">{activeSiteContent.heroEyebrow}</p>
          )}
          {inlineEditMode ? (
            <EditableText
              as="h1"
              value={activeSiteContent.heroTitle}
              onChange={(value) => updateContentDraft('heroTitle', value)}
            />
          ) : (
            <h1>{activeSiteContent.heroTitle}</h1>
          )}
          {inlineEditMode ? (
            <EditableText
              as="p"
              className="hero-copy"
              value={activeSiteContent.heroCopy}
              onChange={(value) => updateContentDraft('heroCopy', value)}
            />
          ) : (
            <p className="hero-copy">{activeSiteContent.heroCopy}</p>
          )}
          {inlineEditMode ? (
            <EditableText
              as="p"
              className="hero-subcopy hero-subcopy-top"
              value={activeSiteContent.heroSubcopy}
              onChange={(value) => updateContentDraft('heroSubcopy', value)}
            />
          ) : (
            <p className="hero-subcopy hero-subcopy-top">{activeSiteContent.heroSubcopy}</p>
          )}

          <form
            className="search-shell"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              if (inlineEditMode) return
              openPostsPage(query)
            }}
          >
            <Search size={20} aria-hidden="true" />
            {inlineEditMode ? (
              <EditableText
                className="editable-placeholder"
                value={activeSiteContent.searchPlaceholder}
                onChange={(value) => updateContentDraft('searchPlaceholder', value)}
              />
            ) : (
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={activeSiteContent.searchPlaceholder}
                aria-label="搜索留学问题、经验和分类"
              />
            )}
            <button type="submit">搜索</button>
          </form>

          <div className="hero-actions" aria-label="Quick actions">
            <button
              className="primary-link"
              type="button"
              onClick={() => {
                if (!inlineEditMode) navigateToPath('/questions')
              }}
            >
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.askButtonText}
                  onChange={(value) => updateContentDraft('askButtonText', value)}
                />
              ) : (
                activeSiteContent.askButtonText
              )}
              <MessageSquareText size={18} aria-hidden="true" />
            </button>
            <button
              className="secondary-link"
              type="button"
              onClick={() => {
                if (!inlineEditMode) setPublishOpen(true)
              }}
            >
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.shareButtonText}
                  onChange={(value) => updateContentDraft('shareButtonText', value)}
                />
              ) : (
                activeSiteContent.shareButtonText
              )}
              <PenLine size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="hero-metrics" aria-label="平台能力概览">
            <div>
              {inlineEditMode ? (
                <EditableText
                  as="strong"
                  value={activeSiteContent.metricAskTitle}
                  onChange={(value) => updateContentDraft('metricAskTitle', value)}
                />
              ) : (
                <strong>{activeSiteContent.metricAskTitle}</strong>
              )}
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.metricAskCopy}
                  onChange={(value) => updateContentDraft('metricAskCopy', value)}
                />
              ) : (
                <span>{activeSiteContent.metricAskCopy}</span>
              )}
            </div>
            <div className="metric-stacked">
              {inlineEditMode ? (
                <EditableText
                  as="strong"
                  value={activeSiteContent.metricExperienceTitle}
                  onChange={(value) => updateContentDraft('metricExperienceTitle', value)}
                />
              ) : (
                <strong>{activeSiteContent.metricExperienceTitle}</strong>
              )}
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.metricExperienceCopy}
                  onChange={(value) => updateContentDraft('metricExperienceCopy', value)}
                />
              ) : (
                <span>{activeSiteContent.metricExperienceCopy}</span>
              )}
            </div>
            <div>
              {inlineEditMode ? (
                <EditableText
                  as="strong"
                  value={activeSiteContent.metricRewardTitle}
                  onChange={(value) => updateContentDraft('metricRewardTitle', value)}
                />
              ) : (
                <strong>{activeSiteContent.metricRewardTitle}</strong>
              )}
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.metricRewardCopy}
                  onChange={(value) => updateContentDraft('metricRewardCopy', value)}
                />
              ) : (
                <span>{activeSiteContent.metricRewardCopy}</span>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="proof-band" aria-label="Platform highlights">
        <div>
          <strong>Q&A</strong>
          <span>围绕真实留学问题给出可执行答案</span>
        </div>
        <div>
          <strong>{categories.length}</strong>
          <span>覆盖签证、租房、打工、毕业和生活分类</span>
        </div>
        <div>
          <strong>经验</strong>
          <span>真实经历沉淀成可检索的解决方案</span>
        </div>
        <div>
          <strong>收益</strong>
          <span>高质量回答和精华攻略获得激励</span>
        </div>
      </section>

      <section className="community-home-section" id="questions">
        <div className="section-heading">
          <p className="eyebrow dark">热门问题</p>
          <h2>留学生最常遇到的问题，先看真实回答。</h2>
        </div>
        <div className="question-card-grid">
          {hotQuestions.slice(0, 5).map((question) => (
            <article
              className="question-card clickable-card"
              key={question.id}
              onClick={() => navigateToPath(`/questions/${question.id}`)}
            >
              <div className="tag-line">
                <span>{question.category}</span>
                <span>{question.school}</span>
                {question.status === 'solved' && <span className="solved-tag">已解决</span>}
                {question.rewardPoints > 0 && <span className="bounty-tag">悬赏 {question.rewardPoints} 积分</span>}
              </div>
              <h3>{question.title}</h3>
              <div className="question-stats">
                <span>{question.views.toLocaleString()} 浏览</span>
                <span>{question.answersCount} 个回答</span>
                <span>{question.createdAt}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="community-home-section featured-experience-section" id="featured-experience">
        <div className="section-heading">
          <p className="eyebrow dark">精华经验</p>
          <h2>不是泛泛聊天，而是能直接帮你办事的经验帖。</h2>
        </div>
        <div className="experience-card-grid">
          {featuredExperiences.slice(0, 5).map((experience) => (
            <article
              className="experience-card clickable-card"
              key={experience.id}
              onClick={() => navigateToPath(`/posts/${experience.id}`)}
            >
              <div className="tag-line">
                <span>{experience.category}</span>
                <span>{experience.city}</span>
                {experience.featured && <span className="featured-tag">精华</span>}
              </div>
              <h3>{experience.title}</h3>
              <p>{experience.excerpt}</p>
              <div className="question-stats">
                <span>{experience.author}</span>
                <span>{(experience.views ?? 0).toLocaleString()} 阅读</span>
                <span>{experience.bookmarks ?? 0} 收藏</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="community-home-section solved-home-section">
        <div className="section-heading">
          <p className="eyebrow dark">已解决问题</p>
          <h2>先看被采纳的回答，再决定要不要继续提问。</h2>
        </div>
        <div className="question-card-grid compact-grid">
          {hotQuestions
            .filter((question) => question.status === 'solved')
            .slice(0, 4)
            .map((question) => (
              <article
                className="question-card clickable-card"
                key={question.id}
                onClick={() => navigateToPath(`/questions/${question.id}`)}
              >
                <div className="tag-line">
                  <span>{question.category}</span>
                  <span className="solved-tag">已解决</span>
                </div>
                <h3>{question.title}</h3>
                <div className="question-stats">
                  <span>采纳奖励 {question.rewardPoints} 积分</span>
                  <span>{question.answersCount} 个回答</span>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="community-home-section reward-mechanism-section">
        <div className="reward-mechanism-copy">
          <p className="eyebrow dark">问题悬赏</p>
          <h2>不是发帖就赚钱，而是帮助别人解决真实问题才有收益。</h2>
          <p>
            第一版先用积分模拟闭环：用户发布问题时可以设置悬赏，被采纳的回答者获得积分奖励。积分用于站内身份、内容激励和后续规则验证，不承诺现金提现。
          </p>
          <button className="primary-link" type="button" onClick={() => navigateToPath('/questions')}>
            查看悬赏问题
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="reward-mechanism-list">
          <div>
            <span>1</span>
            <strong>提问者设置悬赏</strong>
            <p>把问题、学校、时间线和材料背景写清楚。</p>
          </div>
          <div>
            <span>2</span>
            <strong>回答者给出解决方案</strong>
            <p>回答要可执行，尽量附流程、材料、窗口和注意事项。</p>
          </div>
          <div>
            <span>3</span>
            <strong>答案被采纳后结算</strong>
            <p>收益进入创作者积分账户，第一版只做站内积分记录，不做真实支付和提现。</p>
          </div>
        </div>
      </section>

      <section className="community-home-section creator-income-section">
        <div className="section-heading">
          <p className="eyebrow dark">分享赚钱</p>
          <h2>平台奖励真实、有用、可验证的经验。</h2>
        </div>
        <div className="income-rule-grid">
          <article>
            <BadgeCheck size={22} aria-hidden="true" />
            <h3>被采纳回答获得悬赏收益</h3>
            <p>解决提问者的具体问题后，收益归入创作者账户。</p>
          </article>
          <article>
            <Sparkles size={22} aria-hidden="true" />
            <h3>高质量经验帖获得平台奖励</h3>
            <p>被收藏、点赞、加精的内容会获得更多曝光和激励。</p>
          </article>
          <article>
            <BookOpenCheck size={22} aria-hidden="true" />
            <h3>精华攻略可分成或买断</h3>
            <p>签证、租房、打工、毕业等专题内容可以进入平台专题库。</p>
          </article>
          <article>
            <TrendingUp size={22} aria-hidden="true" />
            <h3>作者等级越高，曝光越高</h3>
            <p>持续贡献有效答案和真实经验，会提升内容推荐权重。</p>
          </article>
        </div>
      </section>

      <section className="community-home-section category-navigation-section">
        <div className="section-heading">
          <p className="eyebrow dark">分类导航</p>
          <h2>按问题场景进入，不用在群聊里反复翻记录。</h2>
        </div>
        <div className="category-navigation-grid">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => openPostsPage(category)}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="community-home-section guide-home-section">
        <div className="section-heading">
          <p className="eyebrow dark">城市与学校攻略</p>
          <h2>把生活落地、学校周边和常用流程整理成可复用清单。</h2>
        </div>
        <div className="guide-grid">
          {cityGuides.map((guide) => (
            <article className="guide-card clickable-card" key={guide.id} onClick={() => openPostsPage(guide.title)}>
              <div className="tag-line">
                <span>{guide.city}</span>
                <span>{guide.school}</span>
                <span>{guide.category}</span>
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.summary}</p>
              <div className="school-card-tags">
                {guide.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {isQuestionsRoute && (
        <section className="info-page">
          <div className="posts-page-head">
            <div>
              <p className="eyebrow dark">问题悬赏</p>
              <h1>把留学问题讲清楚，让有经验的人来解决。</h1>
              <p>签证、租房、入学、打工、保险、毕业和就业问题都可以在这里提问。先按分类找到相近问题，再补充自己的学校、时间线和材料背景。</p>
            </div>
            <button className="primary-link" type="button" onClick={() => navigateToPath('/categories')}>
              按分类找问题
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="list-control-bar">
            <label>
              分类
              <select value={questionCategoryFilter} onChange={(event) => setQuestionCategoryFilter(event.target.value)}>
                {categoryFilters.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              状态
              <select
                value={questionStatusFilter}
                onChange={(event) => setQuestionStatusFilter(event.target.value as 'all' | QuestionStatus)}
              >
                <option value="all">全部状态</option>
                <option value="open">待回答</option>
                <option value="solved">已解决</option>
              </select>
            </label>
            <label>
              排序
              <select
                value={questionSort}
                onChange={(event) => setQuestionSort(event.target.value as 'reward' | 'views' | 'latest')}
              >
                <option value="reward">悬赏最高</option>
                <option value="views">浏览最多</option>
                <option value="latest">最新发布</option>
              </select>
            </label>
          </div>
          <div className="question-card-grid info-grid">
            {filteredQuestions.map((question) => (
              <article
                className="question-card clickable-card"
                key={question.id}
                onClick={() => navigateToPath(`/questions/${question.id}`)}
              >
                <div className="tag-line">
                  <span>{question.category}</span>
                  <span>{question.country}</span>
                  <span>{question.city}</span>
                  <span>{question.school}</span>
                  {question.status === 'solved' && <span className="solved-tag">已解决</span>}
                  {question.rewardPoints > 0 && <span className="bounty-tag">悬赏 {question.rewardPoints} 积分</span>}
                </div>
                <h3>{question.title}</h3>
                <p>{question.detail}</p>
                <div className="question-stats">
                  <span>{question.views.toLocaleString()} 浏览</span>
                  <span>{question.answersCount} 个回答</span>
                  <span>{question.author}</span>
                  <span>{question.createdAt}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {isQuestionDetailRoute && selectedQuestion && (
        <section className="info-page content-detail-page">
          <div className="detail-hero-block">
            <p className="eyebrow dark">问题详情</p>
            <div className="tag-line">
              <span>{selectedQuestion.country}</span>
              <span>{selectedQuestion.city}</span>
              <span>{selectedQuestion.school}</span>
              <span>{selectedQuestion.identity}</span>
              <span>{selectedQuestion.createdAt}</span>
              <span className={selectedQuestion.status === 'solved' ? 'solved-tag' : 'bounty-tag'}>
                {selectedQuestion.status === 'solved' ? '已解决' : '待回答'}
              </span>
            </div>
            <h1>{selectedQuestion.title}</h1>
            <p>{selectedQuestion.detail}</p>
            <div className="detail-stat-row">
              <span>悬赏 {selectedQuestion.rewardPoints} 积分</span>
              <span>{selectedQuestion.answersCount} 个回答</span>
              <span>{selectedQuestion.views.toLocaleString()} 浏览</span>
            </div>
            <button
              className="primary-link"
              type="button"
              onClick={() => {
                if (!currentUser) {
                  setAuthMode('login')
                  setMessage('请先登录后回答问题。')
                  return
                }
                document.getElementById('answer-entry')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              回答问题
              <MessageSquareText size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="answer-list">
            <div className="section-heading">
              <p className="eyebrow dark">回答列表</p>
              <h2>{selectedQuestion.status === 'solved' ? '已采纳答案优先展示。' : '等待更多同校或同城经验。'}</h2>
            </div>
            {(selectedQuestionAnswers.length
              ? selectedQuestionAnswers
              : [
                  {
                    id: 'placeholder',
                    questionId: selectedQuestion.id,
                    author: '平台提示',
                    identity: '内容审核',
                    content: '这条问题还在等待更完整的回答。回答需要给出材料、时间线、办理地点和注意事项，复制内容和无效回答不会获得积分。',
                    likes: 0,
                    accepted: false,
                    createdAt: selectedQuestion.createdAt,
                  },
                ]).map((answer) => (
              <article className={answer.accepted ? 'answer-card accepted' : 'answer-card'} key={answer.id}>
                <div className="tag-line">
                  <span>{answer.author}</span>
                  <span>{answer.identity}</span>
                  {answer.accepted && <span className="solved-tag">已采纳</span>}
                </div>
                <p>{answer.content}</p>
                <div className="question-stats">
                  <span>{answer.likes} 赞</span>
                  <span>{answer.createdAt}</span>
                  {answer.accepted && <span>回答者获得 {selectedQuestion.rewardPoints} 积分</span>}
                </div>
              </article>
            ))}
          </div>
          <div className="answer-entry" id="answer-entry">
            <h3>回答前请确认</h3>
            <p>平台奖励真实、有用、可验证的经验。请尽量写清材料、地点、时间线和你亲身经历的边界，政策类内容以官方最新公告为准。</p>
          </div>
        </section>
      )}

      {isRewardsRoute && (
        <section className="info-page">
          <div className="section-heading rewards-heading">
            <p className="eyebrow dark">收益规则</p>
            <h1>如何通过分享经验获得收益？</h1>
            <p>平台奖励的是“真实、有用、可验证的经验”，不是单纯发帖数量。</p>
          </div>
          <div className="reward-rule-list">
            <article>
              <span>1</span>
              <h3>回答悬赏问题</h3>
              <p>回答被提问者采纳后获得悬赏积分。第一版只记录站内积分，不做真实现金提现。</p>
            </article>
            <article>
              <span>2</span>
              <h3>发布高质量经验帖</h3>
              <p>内容被收藏、点赞、加精后可获得平台奖励积分，用于创作者等级和后续激励规则测试。</p>
            </article>
            <article>
              <span>3</span>
              <h3>贡献专题攻略</h3>
              <p>签证、租房、打工、毕业等高价值内容进入专题库后，可获得额外平台积分奖励。</p>
            </article>
            <article>
              <span>4</span>
              <h3>防止垃圾内容</h3>
              <p>抄袭、AI水文、无效回答不会获得奖励，严重时扣分、禁言或封号。</p>
            </article>
          </div>
        </section>
      )}

      {isCategoriesRoute && (
        <section className="info-page">
          <div className="section-heading rewards-heading">
            <p className="eyebrow dark">分类</p>
            <h1>按留学问题场景查找经验。</h1>
            <p>从签证到就业，从租房到医院，把零散经验整理成可检索的问题分类。</p>
          </div>
          <div className="category-navigation-grid category-page-grid">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => openPostsPage(category)}>
                {category}
              </button>
            ))}
          </div>
        </section>
      )}

      {isAboutRoute && (
        <section className="info-page">
          <div className="section-heading rewards-heading">
            <p className="eyebrow dark">平台介绍</p>
            <h1>留学生经验分享与问题解决平台</h1>
            <p>
              留学生的第一站，真实经验帮你少走弯路。这里不是普通论坛，而是把签证、入学、租房、打工、生活和就业经验沉淀成可搜索、可验证、可解决问题的社区。
            </p>
          </div>
          <div className="income-rule-grid">
            <article>
              <Search size={22} aria-hidden="true" />
              <h3>先解决真实问题</h3>
              <p>每条内容都围绕具体场景：要办什么、去哪办、准备什么、怎么避坑。</p>
            </article>
            <article>
              <ShieldCheck size={22} aria-hidden="true" />
              <h3>保护分享者隐私</h3>
              <p>平台会继续完善匿名展示、身份审核和敏感信息保护。</p>
            </article>
            <article>
              <Coins size={22} aria-hidden="true" />
              <h3>让有用经验获得回报</h3>
              <p>高质量回答、被采纳答案和精华攻略会进入收益体系。</p>
            </article>
          </div>
        </section>
      )}

      {isProfileRoute && (
        <section className="profile-page">
          <div className="section-heading">
            <p className="eyebrow dark">个人中心</p>
            <h2>{currentUser ? '管理个人资料、认证材料和已发布帖子。' : '请先登录后进入个人中心。'}</h2>
          </div>
          {currentUser ? (
            <div className="profile-layout">
              <form className="profile-panel form-stack" onSubmit={handleProfileSave}>
                <div className="profile-avatar-row">
                  <div className="profile-avatar">
                    {profileForm.avatarUrl ? <img src={profileForm.avatarUrl} alt="" /> : currentUser.name.slice(0, 1)}
                  </div>
                  <label>
                    头像图片链接
                    <input
                      value={profileForm.avatarUrl}
                      onChange={(event) => setProfileForm({ ...profileForm, avatarUrl: event.target.value })}
                      placeholder="https://..."
                    />
                  </label>
                </div>
                <label>
                  昵称
                  <input
                    value={profileForm.name}
                    onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                  />
                </label>
                <div className="form-grid partner-form-grid">
                  <label>
                    身份
                    <select
                      value={profileForm.identity}
                      onChange={(event) => setProfileForm({ ...profileForm, identity: event.target.value })}
                    >
                      <option>准备申请</option>
                      <option>已录取</option>
                      <option>在读学生</option>
                      <option>毕业校友</option>
                      <option>留学顾问</option>
                    </select>
                  </label>
                  <label>
                    学校 / 目标学校
                    <input
                      value={profileForm.school}
                      onChange={(event) => setProfileForm({ ...profileForm, school: event.target.value })}
                    />
                  </label>
                </div>
                <label>
                  个人简介
                  <textarea
                    value={profileForm.bio}
                    onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })}
                    placeholder="写一下你的学校、专业、申请方向或可分享经验。"
                  />
                </label>
                <label>
                  认证材料
                  <input
                    multiple
                    type="file"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? [])
                      setProfileForm({
                        ...profileForm,
                        documents: files.map((file) => ({
                          id: createId('doc'),
                          name: file.name,
                          type: file.type || '身份/学校认证材料',
                          status: 'pending',
                          uploadedAt: new Date().toISOString(),
                        })),
                      })
                    }}
                  />
                  <small className="field-help">材料会进入后台审核；提交前建议遮挡证件号码等非必要敏感信息。</small>
                </label>
                <button type="submit">保存个人信息</button>
              </form>
              <div className="profile-panel">
                <h3>我的认证材料</h3>
                {currentUser.documents.length ? (
                  currentUser.documents.map((document) => (
                    <div className="credential-item" key={document.id}>
                      <div>
                        <strong>{document.name}</strong>
                        <small>{new Date(document.uploadedAt).toLocaleDateString('zh-CN')}</small>
                      </div>
                      <span className={`account-badge ${document.status}`}>
                        {verificationStatusLabel[document.status]}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="admin-empty">暂未提交认证材料。</p>
                )}
                <h3>我的帖子</h3>
                {currentUserPosts.length ? (
                  currentUserPosts.map((post) => (
                    <div className="profile-post-row" key={post.id}>
                      <div>
                        <strong>{post.title}</strong>
                        <small>{post.school} · {post.category} · {post.price ? `${post.price} 积分` : '免费'}</small>
                      </div>
                      <button type="button" onClick={() => setActivePost(post)}>
                        预览
                      </button>
                      <button className="danger-button" type="button" onClick={() => removeOwnPost(post.id)}>
                        删除
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="admin-empty">还没有发布帖子。</p>
                )}
              </div>
            </div>
          ) : (
            <button className="primary-link" type="button" onClick={() => setAuthMode('login')}>
              登录账号
            </button>
          )}
        </section>
      )}

      {isPostsRoute && (
        <section className="posts-page">
          <div className="posts-page-head">
          <div>
              <p className="eyebrow dark">经验分享</p>
              <h1>真实经验帖</h1>
              <p>集中浏览签证、租房、入学、打工、保险、毕业和就业经验，优先展示能解决具体问题的内容。</p>
            </div>
            <button className="primary-link" type="button" onClick={() => setPublishOpen(true)}>
              发布经验
              <PenLine size={18} aria-hidden="true" />
            </button>
          </div>

          <form
            className="posts-page-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              openPostsPage(query)
            }}
          >
            <Search size={20} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索学校、专业、教授、论文、签证、租房..."
              aria-label="搜索帖子"
            />
            <button type="submit">搜索</button>
          </form>

          <div className="posts-page-layout">
            <aside className="posts-filter-panel" aria-label="帖子筛选">
              <label>
                学校
                <select value={postSchoolFilter} onChange={(event) => setPostSchoolFilter(event.target.value)}>
                  <option>全部学校</option>
                  {allSchoolProfiles.map((school) => (
                    <option key={school.id}>{school.name}</option>
                  ))}
                </select>
              </label>
              <label>
                城市
                <select value={postCityFilter} onChange={(event) => setPostCityFilter(event.target.value)}>
                  {postCityOptions.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
              <label>
                精华
                <select
                  value={postFeaturedFilter}
                  onChange={(event) => setPostFeaturedFilter(event.target.value as 'all' | 'featured')}
                >
                  <option value="all">全部内容</option>
                  <option value="featured">只看精华</option>
                </select>
              </label>
              <div>
                <span>分类</span>
                <div className="posts-filter-tabs">
                  {categoryFilters.map((category) => (
                    <button
                      className={selectedCategory === category ? 'active' : ''}
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      type="button"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="social-post-grid">
              {filteredPosts.length ? (
                filteredPosts.map((post) => {
                  const unlocked = post.price === 0 || currentUnlocks.includes(post.id)
                  return (
                    <motion.article
                      className="social-post-card"
                      key={post.id}
                      layout
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 230, damping: 20 }}
                    >
                      <div className="social-post-cover">
                        <span>{post.school.slice(0, 2)}</span>
                      </div>
                      <div className="social-post-body">
                        <div className="post-card-header">
                          <span>{post.category}</span>
                          {post.featured && <span className="featured-tag">精华</span>}
                          <span className={post.price === 0 ? 'free' : 'locked'}>
                            {post.price === 0 ? '免费' : unlocked ? '已解锁' : `${post.price} 积分`}
                          </span>
                        </div>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <div className="tag-line">
                          <span>{post.country ?? '韩国'}</span>
                          <span>{post.city ?? '首尔'}</span>
                          <span>{post.school}</span>
                          <span>{post.identity ?? '亲身经历'}</span>
                        </div>
                        <div className="post-footer">
                          <span>{post.author}</span>
                          <span>
                            <TrendingUp size={15} aria-hidden="true" />
                            {post.hot}
                          </span>
                          <span>{post.bookmarks ?? 0} 收藏</span>
                        </div>
                        <button className="read-button" type="button" onClick={() => navigateToPath(`/posts/${post.id}`)}>
                          {post.price > 0 && !unlocked ? '积分解锁' : '查看全文'}
                        </button>
                      </div>
                    </motion.article>
                  )
                })
              ) : (
                <div className="posts-empty-state">
                  <h3>没有找到相关帖子</h3>
                  <p>换一个关键词，或发布第一篇相关经验。</p>
                  <button type="button" onClick={() => setPublishOpen(true)}>
                    发布经验
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {isPostDetailRoute && selectedPost && (
        <section className="info-page content-detail-page">
          <div className="detail-hero-block post-detail-hero">
            <p className="eyebrow dark">经验帖详情</p>
            <div className="tag-line">
              <span>{selectedPost.country ?? '韩国'}</span>
              <span>{selectedPost.city ?? '首尔'}</span>
              <span>{selectedPost.school}</span>
              <span>{selectedPost.identity ?? '亲身经历'}</span>
              <span>{selectedPost.contentType ?? '经验帖'}</span>
              {selectedPost.featured && <span className="featured-tag">精华</span>}
            </div>
            <h1>{selectedPost.title}</h1>
            <p>{selectedPost.excerpt}</p>
            <div className="detail-stat-row">
              <span>{selectedPost.author}</span>
              <span>{selectedPost.createdAt}</span>
              <span>{(selectedPost.views ?? 0).toLocaleString()} 阅读</span>
              <span>{selectedPost.likes ?? 0} 点赞</span>
              <span>{selectedPost.bookmarks ?? 0} 收藏</span>
            </div>
          </div>
          <article className="post-detail-body">
            <p>{selectedPost.body}</p>
            <div className="school-card-tags">
              {(selectedPost.tags ?? [selectedPost.category, selectedPost.school]).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
          <section className="answer-entry">
            <h3>这篇内容为什么能获得积分？</h3>
            <p>
              内容围绕真实留学问题，提供可执行步骤、材料提醒和亲身经历边界。平台会优先奖励被收藏、点赞、加精和能解决问题的经验帖，抄袭、AI水文和无效内容不奖励。
            </p>
          </section>
        </section>
      )}

      {schoolRouteId && schoolTopic && (
        <section className="school-posts-page school-topic-page">
          <div
            className="school-topic-hero"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(6, 15, 13, 0.9), rgba(6, 15, 13, 0.62), rgba(6, 15, 13, 0.18)), url("${schoolTopicHeroImage}")`,
            }}
          >
            <div className="school-topic-hero-content">
              <p className="eyebrow">韩国学校专题</p>
              <h1>{schoolTopic.heroTitle}</h1>
              <p>{schoolTopic.heroSubtitle}</p>
              <div className="school-topic-tags">
                {schoolTopic.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="school-topic-actions">
                <button className="primary-link" type="button" onClick={() => navigateToPath('/questions')}>
                  我要提问
                  <MessageSquareText size={18} aria-hidden="true" />
                </button>
                <button
                  className="secondary-link"
                  type="button"
                  onClick={() => {
                    setPostForm((form) => ({ ...form, school: schoolTopic.nameZh, category: '学校评价' }))
                    setPublishOpen(true)
                  }}
                >
                  分享建国大学经验
                  <PenLine size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <section className="school-topic-section school-topic-quick">
            <div className="section-heading">
              <p className="eyebrow dark">快速入口</p>
              <h2>按问题类型进入建国大学专题。</h2>
            </div>
            <div className="school-topic-entry-grid">
              {schoolTopic.quickEntries.map((entry) => (
                <button key={entry} type="button" onClick={() => openPostsPage(`${schoolTopic.nameZh} ${entry}`)}>
                  <span>{entry}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="school-topic-section">
            <div className="section-heading">
              <p className="eyebrow dark">热门问题</p>
              <h2>建国大学留学生正在问什么。</h2>
            </div>
            <div className="school-question-grid">
              {schoolTopic.hotQuestions.map((question) => (
                <article className="school-question-card" key={question.title}>
                  <div className="tag-line">
                    <span>{question.category}</span>
                    <span className={question.status === 'solved' ? 'solved-tag' : 'bounty-tag'}>
                      {question.status === 'solved' ? '已解决' : '待回答'}
                    </span>
                  </div>
                  <h3>{question.title}</h3>
                  <div className="school-card-tags">
                    {question.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="school-question-stats">
                    <span>悬赏 {question.rewardPoints} 积分</span>
                    <span>{question.answersCount} 个回答</span>
                    <span>{question.views} 浏览</span>
                    <span>{question.updatedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="school-topic-section school-topic-featured">
            <div className="section-heading">
              <p className="eyebrow dark">精华经验</p>
              <h2>能直接拿来参考的建国大学经验帖。</h2>
            </div>
            <div className="school-featured-grid">
              {schoolTopic.featuredPosts.map((post) => (
                <article className="school-featured-card" key={post.title}>
                  <div className="tag-line">
                    <span>{post.tags[0]}</span>
                    {post.isFeatured && <span className="featured-tag">精华</span>}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <div className="school-card-tags">
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="school-question-stats">
                    <span>{post.author}</span>
                    <span>{post.views} 阅读</span>
                    <span>{post.likes} 赞</span>
                    <span>{post.bookmarks} 收藏</span>
                    <span>{post.updatedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="school-topic-section school-info-section">
            <div className="school-info-panel">
              <div>
                <p className="eyebrow dark">学校信息</p>
                <h2>{schoolTopic.nameZh}</h2>
                <p className="school-policy-note">
                  涉及签证、滞留资格、打工时间、毕业流程等内容，请以出入境和学校最新公告为准。
                </p>
              </div>
              <dl>
                <div>
                  <dt>学校名称</dt>
                  <dd>{schoolTopic.nameZh}</dd>
                </div>
                <div>
                  <dt>韩文名</dt>
                  <dd>{schoolTopic.nameKo}</dd>
                </div>
                <div>
                  <dt>英文名</dt>
                  <dd>{schoolTopic.nameEn}</dd>
                </div>
                <div>
                  <dt>国家</dt>
                  <dd>{schoolTopic.country}</dd>
                </div>
                <div>
                  <dt>城市</dt>
                  <dd>{schoolTopic.city}</dd>
                </div>
                <div>
                  <dt>区域</dt>
                  <dd>{schoolTopic.district}</dd>
                </div>
                <div>
                  <dt>适合内容</dt>
                  <dd>{schoolTopic.suitableContent.join('、')}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="school-topic-section school-topic-cta">
            <div>
              <p className="eyebrow">没有找到你的问题？</p>
              <h2>发布建国大学相关问题，让同校或同地区的留学生回答。</h2>
              <p>高质量回答被采纳后可以获得积分奖励，平台会继续完善身份审核和内容风控。</p>
            </div>
            <button className="primary-link" type="button" onClick={() => navigateToPath('/questions')}>
              发布建国大学问题
              <MessageSquareText size={18} aria-hidden="true" />
            </button>
          </section>
        </section>
      )}

      {schoolRouteId && !schoolTopic && (
        <section className="school-posts-page">
          <div className="school-posts-hero">
            <div className="school-gallery-strip" aria-hidden="true">
              {selectedSchoolGallery.map((image, index) => (
                <img
                  key={`${selectedSchool.id}-${image}`}
                  src={image}
                  alt=""
                  style={{ animationDelay: `${index * 0.7}s` }}
                />
              ))}
            </div>
            <div className="school-posts-hero-overlay" />
            <div className="school-posts-hero-content">
              <p className="eyebrow">{selectedSchool.region} · 学校经验库</p>
              <h1>{selectedSchool.name}</h1>
              <strong>{selectedSchool.englishName}</strong>
              <p>{selectedSchool.description}</p>
              <div className="school-posts-hero-actions">
                <button type="button" onClick={() => setPublishOpen(true)}>
                  分享这所学校的经验
                  <PenLine size={18} aria-hidden="true" />
                </button>
                {selectedCampusLinks.slice(0, 2).map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="section-heading school-posts-heading">
            <p className="eyebrow dark">经验帖子</p>
            <h2>{selectedSchool.name} 相关经验</h2>
          </div>
          <div className="post-grid">
            {selectedSchoolPosts.length ? (
              selectedSchoolPosts.map((post) => (
                <article className="post-card" key={post.id}>
                  <div className="post-card-header">
                    <span>{post.category}</span>
                    <span className={post.price === 0 ? 'free' : 'locked'}>
                      {post.price === 0 ? '免费' : `${post.price} 积分`}
                    </span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <button className="read-button" type="button" onClick={() => openPost(post)}>
                    查看全文
                  </button>
                </article>
              ))
            ) : (
              <p className="admin-empty">这所学校暂时还没有经验内容，欢迎发布第一篇。</p>
            )}
          </div>
        </section>
      )}

      <section className="school-browser-section" id="school-browser">
        <div className="section-heading">
          <p className="eyebrow dark">韩国主流院校导航</p>
          <h2>按地区浏览院校，选择学校进入专属内容页。</h2>
        </div>

        <div className="school-browser">
          <div className="region-menu" aria-label="地区菜单">
            {schoolRegions.map((group) => (
              <button
                className={openRegion === group.region ? 'active' : ''}
                key={group.region}
                type="button"
                onClick={() => openRegionMenu(group.region)}
              >
                <span>{group.region}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </button>
            ))}
          </div>

          {schoolRegions.map((group) => {
            const currentPage = schoolPages[group.region] ?? 1
            const pageCount = Math.ceil(group.schools.length / schoolPageSize)
            const startIndex = (currentPage - 1) * schoolPageSize
            const pageSchools = group.schools.slice(startIndex, startIndex + schoolPageSize)

            return (
              <div
                className={openRegion === group.region ? 'school-submenu open' : 'school-submenu'}
                key={group.region}
              >
                <div className="submenu-intro">
                  <div>
                    <strong>{group.region}</strong>
                    <span>{group.schools.length} 所院校 · 按 QS 2026 与申请热度排序</span>
                  </div>
                  <p>{group.summary}</p>
                </div>
                <div className="submenu-grid">
                  {pageSchools.map((school, schoolIndex) => (
                    <button
                      className={selectedSchool.id === school.id ? 'school-menu-card active' : 'school-menu-card'}
                      key={school.id}
                      type="button"
                      onClick={() => openSchoolPage(school)}
                    >
                      <div className="school-menu-copy">
                        <em>#{startIndex + schoolIndex + 1}</em>
                        <span>{school.name}</span>
                        <small>{school.city} · {school.landmark}</small>
                      </div>
                      <div className="school-logo-mark" aria-hidden="true">
                        <span>{school.name.slice(0, 1)}</span>
                        {getSchoolLogoUrl(school) && (
                          <img
                            src={getSchoolLogoUrl(school)}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {pageCount > 1 && (
                  <div className="school-pagination" aria-label={`${group.region} 学校分页`}>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => changeSchoolPage(group.region, currentPage - 1)}
                    >
                      上一页
                    </button>
                    <div>
                      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                        <button
                          className={currentPage === page ? 'active' : ''}
                          key={page}
                          type="button"
                          onClick={() => changeSchoolPage(group.region, page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={currentPage === pageCount}
                      onClick={() => changeSchoolPage(group.region, currentPage + 1)}
                    >
                      下一页
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section
        className="school-page-section"
        id="school-page"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(6, 16, 13, 0.86), rgba(6, 16, 13, 0.48), rgba(6, 16, 13, 0.12)), url("${selectedSchool.image}")` }}
      >
        <div className="school-page-content">
          <p className="eyebrow">Selected Campus</p>
          <h2>{selectedSchool.name}</h2>
          <p className="school-english">{selectedSchool.englishName}</p>
          <p className="school-description">{selectedSchool.description}</p>
          <div className="school-page-meta">
            {selectedCampusLinks.map((campus) => {
              const Icon = campus.icon === 'pin' ? MapPin : campus.icon === 'building' ? Building2 : GraduationCap

              return (
                <a href={campus.url} key={campus.label} target="_blank" rel="noreferrer">
                  <Icon size={17} aria-hidden="true" />
                  {campus.label}
                </a>
              )
            })}
          </div>
          <div className="school-programs">
            {selectedSchool.programs.map((program) => (
              <span key={program}>{program}</span>
            ))}
            <a
              className="school-brochure-chip"
              href={getBrochureUrl(selectedSchool)}
              target="_blank"
              rel="noreferrer"
            >
              获取外国人招生简章（모집요강）
              <BookOpenCheck size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="school-strengths">
            {selectedSchool.strengths.map((strength) => (
              <strong key={strength}>{strength}</strong>
            ))}
          </div>
          <div className="school-page-actions">
            <button type="button" className="primary-link school-share-link" onClick={() => setPublishOpen(true)}>
              分享这所学校的经验
              <PenLine size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="school-experience-link"
              onClick={() => {
                window.history.pushState(null, '', `/school/${selectedSchool.id}`)
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
            >
              获取这所学校的经验
              <BookOpenText size={20} aria-hidden="true" />
            </button>
            <a className="image-source-link" href={selectedSchool.source} target="_blank" rel="noreferrer">
              背景图来源
            </a>
          </div>
          {selectedSchool.id === 'konkuk' && (
            <button
              type="button"
              className="school-topic-link"
              onClick={() => {
                window.history.pushState(null, '', '/schools/konkuk')
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
            >
              进入建国大学专题页
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      <section className="intro-section">
        <div className="section-heading">
          <p className="eyebrow dark">Why Shouye</p>
          <h2>把分散在学生群里的真实经验，沉淀成可搜索、可审核、可合作的留学决策资产。</h2>
        </div>
        <div className="pathway-grid">
          {pathways.map((item) => (
            <motion.article
              className="pathway-item"
              key={item.title}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 230, damping: 20 }}
            >
              <item.icon size={25} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="schools-section" id="schools">
        <div className="section-heading">
          <p className="eyebrow dark">School Graph</p>
          <h2>以韩国院校库建立问题入口，再围绕学校沉淀真实经验和解决方案。</h2>
        </div>
        <div className="school-list">
          {schools.map((school) => (
            <motion.article
              className="school-row"
              key={school.name}
              whileHover={{ x: 8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div>
                <h3>{school.name}</h3>
                <p>{school.city}</p>
              </div>
              <div className="tag-group">
                {school.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="school-meta">
                <span>
                  <Star size={16} fill="currentColor" aria-hidden="true" />
                  {school.score}
                </span>
                <span>{school.posts} 篇</span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="workspace-section" id="workspace">
        <div className="section-heading">
          <p className="eyebrow dark">Community Account</p>
          <h2>{currentUser ? `${currentUser.name}，管理你的提问、经验和认证。` : '为留学生设计清晰的提问、分享和认证入口。'}</h2>
        </div>
        <div className="workspace-grid">
          <article className="workspace-panel">
            <LogIn size={24} aria-hidden="true" />
            <h3>{currentUser ? '社区账户' : '留学生账号'}</h3>
            {currentUser ? (
              <>
                <p>{currentUser.identity} · {currentUser.school}</p>
                <strong>{currentUser.points} 消费积分 · {currentUser.earningPoints} 收益积分</strong>
                <small>
                  充值比例 1 元 = {rechargePointsPerYuan} 积分；收益满 {minimumCashoutPoints} 积分可申请提现，约 ¥
                  {Math.floor(minimumCashoutPoints / cashoutPointsPerYuan)} 起。
                </small>
                <button type="button" onClick={() => updateUserPoints(currentUser.id, currentUser.points + 100)}>
                  模拟充值 10 元
                </button>
              </>
            ) : (
              <>
                <p>学生完成认证后，可提问、回答悬赏问题、匿名分享经验，并通过高质量内容获得收益。</p>
                <button type="button" onClick={() => setAuthMode('register')}>创建社区账号</button>
              </>
            )}
          </article>
          <article className="workspace-panel">
            <PenLine size={24} aria-hidden="true" />
            <h3>机构合作申请</h3>
            <p>留学机构、语学院、论文辅导、政府部门和职业规划机构可提交合作表单，由后台统一跟进。</p>
            <button type="button" onClick={scrollToPartnerSection}>提交合作表单</button>
          </article>
          <article className="workspace-panel">
            <Coins size={24} aria-hidden="true" />
            <h3>资源与人才合作</h3>
            <p>认证用户积累后，可为教育机构、跨境企业和韩企提供实习、招聘与校园服务入口。</p>
            <button type="button" onClick={scrollToPartnerSection}>查看机构合作</button>
          </article>
        </div>
      </section>

      <section className="posts-section" id="posts">
        <div className="posts-topline">
          <div className="section-heading">
            <p className="eyebrow dark">Content Samples</p>
            <h2>每篇经验都对应真实的择校、申请和服务转化场景。</h2>
          </div>
          <div className="category-tabs" aria-label="Post categories">
                  {categoryFilters.map((category) => (
              <button
                className={selectedCategory === category ? 'active' : ''}
                key={category}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="post-grid">
          {filteredPosts.map((post) => {
            const unlocked = post.price === 0 || currentUnlocks.includes(post.id)
            return (
              <motion.article
                className="post-card"
                key={post.id}
                layout
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 230, damping: 20 }}
              >
                <div className="post-card-header">
                  <span>{post.category}</span>
                  <span className={post.price === 0 ? 'free' : 'locked'}>
                    {post.price === 0 || unlocked ? (
                      <BookOpenCheck size={15} aria-hidden="true" />
                    ) : (
                      <LockKeyhole size={15} aria-hidden="true" />
                    )}
                    {post.price === 0 ? '免费' : unlocked ? '已解锁' : `${post.price} 积分`}
                  </span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="post-footer">
                  <span>{post.school}</span>
                  <span>{post.author}</span>
                  <span>
                    <TrendingUp size={15} aria-hidden="true" />
                    {post.hot}
                  </span>
                </div>
                <button className="read-button" type="button" onClick={() => openPost(post)}>
                  {post.price > 0 && !unlocked ? '积分解锁' : '查看全文'}
                </button>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="points-section" id="points">
        <div className="points-copy">
          <p className="eyebrow dark">Business Model</p>
          <h2>收益来自解决真实问题，而不是制造低质量内容。</h2>
          <p>
            用户可以用积分解锁深度经验或发布悬赏问题，回答者和经验作者通过被采纳答案、精华内容和专题攻略获得收益积分。
          </p>
        </div>
        <div className="points-economy" aria-label="积分经济系统">
          <article>
            <Coins size={22} aria-hidden="true" />
            <span>充值积分</span>
            <strong>¥1 = {rechargePointsPerYuan} 积分</strong>
            <p>充值积分只能消费，用于解锁加精帖、资料和问答。</p>
          </article>
          <article>
            <Sparkles size={22} aria-hidden="true" />
            <span>内容收益</span>
            <strong>100 收益积分 ≈ ¥6</strong>
            <p>读者解锁深度内容，作者获得收益积分；无效回答和复制内容不会获得收益。</p>
          </article>
          <article>
            <MessageSquareText size={22} aria-hidden="true" />
            <span>提现规则</span>
            <strong>{minimumCashoutPoints} 积分起提</strong>
            <p>注册送分、活动分和充值分不能提现，只有内容收益积分可以申请提现。</p>
          </article>
        </div>
      </section>

      <section className="trust-section" id="trust">
        <div className="trust-panel">
          <img
            className="trust-brand-logo"
            src="/brand/shouye-logo-text-light.png"
            alt="留学生经验分享与问题解决平台"
          />
          <ShieldCheck size={30} aria-hidden="true" />
          <h2>真实、匿名、可验证，是留学生敢分享的前提。</h2>
          <p>
            平台采用后台认证、前台匿名、材料审核、同校交叉验证、小样本保护和人工审核，让内容可信，也让提问者和分享者更安全。
          </p>
        </div>
        <div className="trust-list">
          <div>
            <GraduationCap size={22} aria-hidden="true" />
            <span>学校邮箱、Offer、在读和毕业材料认证</span>
          </div>
          <div>
            <BadgeCheck size={22} aria-hidden="true" />
            <span>付费加精内容审核后展示</span>
          </div>
          <div>
            <ShieldCheck size={22} aria-hidden="true" />
            <span>匿名展示与小样本保护，降低身份暴露风险</span>
          </div>
        </div>
      </section>

      <section className="cta-section" id="partner-apply">
        <p className="eyebrow dark">Partner Application</p>
        <h2>欢迎能解决留学生真实问题的机构和服务方申请合作。</h2>
        <button className="primary-link dark-link" type="button" onClick={() => setPartnerOpen(true)}>
          申请成为首批合作方
          <Plus size={18} aria-hidden="true" />
        </button>
      </section>

      {adminLoginOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet" aria-label="管理员登录">
            <button
              className="close-button"
              type="button"
              onClick={() => {
                setAdminLoginOpen(false)
                setAdminLoginForm({ username: '', password: '', error: '' })
              }}
            >
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">管理员登录</p>
            <h2>登录管理员账号后进入后台。</h2>
            {isAdminRoute && (
              <p className="admin-login-note">后台地址：/admin。登录后可管理注册账号、认证材料、积分和帖子。</p>
            )}
            <form className="form-stack" onSubmit={handleAdminLogin}>
              <label>
                管理员账号
                <input
                  autoComplete="username"
                  value={adminLoginForm.username}
                  onChange={(event) => setAdminLoginForm({ ...adminLoginForm, username: event.target.value, error: '' })}
                  placeholder="请输入管理员账号"
                />
              </label>
              <label>
                管理员密码
                <input
                  autoComplete="current-password"
                  type="password"
                  value={adminLoginForm.password}
                  onChange={(event) => setAdminLoginForm({ ...adminLoginForm, password: event.target.value, error: '' })}
                  placeholder="请输入管理员密码"
                />
              </label>
              {adminLoginForm.error && (
                <p className="form-notice" role="status">
                  {adminLoginForm.error}
                </p>
              )}
              <p className="admin-login-note">后台仅限管理员访问，请妥善保管账号信息。</p>
              <button type="submit">进入后台</button>
            </form>
          </section>
        </div>
      )}

      {adminOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet admin-modal" aria-label="后台管理">
            <button className="close-button" type="button" onClick={() => setAdminOpen(false)}>
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">后台管理</p>
            <h2>后台管理用户积分和帖子内容。</h2>
            {isAdminRoute && <p className="admin-page-url">后台网页：/admin</p>}
            <button className="admin-logout-button" type="button" onClick={logoutAdmin}>
              退出后台登录
            </button>
            <div className="admin-summary" aria-label="后台数据概览">
              <div>
                <span>注册用户</span>
                <strong>{appState.users.length}</strong>
              </div>
              <div>
                <span>帖子总数</span>
                <strong>{appState.posts.length}</strong>
              </div>
              <div>
                <span>付费内容</span>
                <strong>{appState.posts.filter((post) => post.price > 0).length}</strong>
              </div>
              <div>
                <span>加精内容</span>
                <strong>{appState.posts.filter((post) => post.featured).length}</strong>
              </div>
              <div>
                <span>合作申请</span>
                <strong>{appState.partnerApplications.length}</strong>
              </div>
            </div>
            <div className="admin-tabs" role="tablist" aria-label="后台管理分类">
              <button
                className={adminTab === 'users' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('users')}
              >
                账号管理
              </button>
              <button
                className={adminTab === 'posts' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('posts')}
              >
                帖子管理
              </button>
              <button
                className={adminTab === 'partners' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('partners')}
              >
                合作申请
              </button>
              <button
                className={adminTab === 'content' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('content')}
              >
                内容设置
              </button>
            </div>

            {adminTab === 'users' ? (
              <div className="admin-users-layout">
                <div className="admin-table admin-user-table">
                  <div className="admin-row admin-row-head">
                    <span>注册账号</span>
                    <span>状态</span>
                    <span>认证</span>
                    <span>消费积分</span>
                    <span>收益积分</span>
                    <span>操作</span>
                  </div>
                  {appState.users.length === 0 ? (
                    <p className="admin-empty">暂无注册用户。新用户注册后会进入账号列表。</p>
                  ) : (
                    appState.users.map((user) => (
                      <div className="admin-row" key={user.id}>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                          <small>{user.identity} · {user.school}</small>
                        </div>
                        <span className={`account-badge ${user.status}`}>{userStatusLabel[user.status]}</span>
                        <span className={`account-badge ${user.verificationStatus}`}>
                          {verificationStatusLabel[user.verificationStatus]}
                        </span>
                        <input
                          aria-label={`${user.name} 消费积分`}
                          min="0"
                          type="number"
                          value={pointDrafts[user.id] ?? String(user.points)}
                          onChange={(event) =>
                            setPointDrafts((drafts) => ({ ...drafts, [user.id]: event.target.value }))
                          }
                        />
                        <input
                          aria-label={`${user.name} 收益积分`}
                          min="0"
                          type="number"
                          value={earningPointDrafts[user.id] ?? String(user.earningPoints)}
                          onChange={(event) =>
                            setEarningPointDrafts((drafts) => ({ ...drafts, [user.id]: event.target.value }))
                          }
                        />
                        <div className="admin-actions">
                          <button type="button" onClick={() => setSelectedAdminUserId(user.id)}>
                            查看账号
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateUserPoints(user.id, Number.parseInt(pointDrafts[user.id] ?? String(user.points), 10) || 0)
                              updateUserEarningPoints(
                                user.id,
                                Number.parseInt(earningPointDrafts[user.id] ?? String(user.earningPoints), 10) || 0,
                              )
                            }}
                          >
                            保存
                          </button>
                          <button type="button" onClick={() => updateUserPoints(user.id, user.points + 50)}>
                            +50
                          </button>
                          <button type="button" onClick={() => updateUserPoints(user.id, Math.max(0, user.points - 50))}>
                            -50
                          </button>
                          <button className="danger-button" type="button" onClick={() => removeUser(user.id)}>
                            删除
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <aside className="admin-account-detail">
                  {selectedAdminUser ? (
                    <>
                      <div className="admin-detail-head">
                        <div>
                          <span>账号详情</span>
                          <strong>{selectedAdminUser.name}</strong>
                          <small>{selectedAdminUser.email}</small>
                        </div>
                        <button type="button" onClick={() => setSelectedAdminUserId(null)}>
                          收起
                        </button>
                      </div>
                      <div className="admin-detail-grid">
                        <div>
                          <span>身份</span>
                          <strong>{selectedAdminUser.identity}</strong>
                        </div>
                        <div>
                          <span>学校</span>
                          <strong>{selectedAdminUser.school}</strong>
                        </div>
                        <div>
                          <span>注册时间</span>
                          <strong>{new Date(selectedAdminUser.joinedAt).toLocaleDateString('zh-CN')}</strong>
                        </div>
                        <div>
                          <span>消费积分</span>
                          <strong>{selectedAdminUser.points}</strong>
                        </div>
                        <div>
                          <span>收益积分</span>
                          <strong>{selectedAdminUser.earningPoints}</strong>
                        </div>
                        <div>
                          <span>预计可提现</span>
                          <strong>¥{Math.floor(selectedAdminUser.earningPoints / cashoutPointsPerYuan)}</strong>
                        </div>
                      </div>
                      <div className="admin-control-row">
                        <label>
                          账号状态
                          <select
                            value={selectedAdminUser.status}
                            onChange={(event) =>
                              updateUserAccount(selectedAdminUser.id, { status: event.target.value as UserStatus })
                            }
                          >
                            <option value="active">正常</option>
                            <option value="muted">禁言</option>
                            <option value="banned">封号</option>
                          </select>
                        </label>
                        <label>
                          认证状态
                          <select
                            value={selectedAdminUser.verificationStatus}
                            onChange={(event) =>
                              updateUserAccount(selectedAdminUser.id, {
                                verificationStatus: event.target.value as VerificationStatus,
                              })
                            }
                          >
                            <option value="pending">待审核</option>
                            <option value="approved">已通过</option>
                            <option value="rejected">已驳回</option>
                          </select>
                        </label>
                      </div>
                      <div className="credential-panel">
                        <div className="credential-panel-head">
                          <strong>上传证件 / 认证材料</strong>
                          <span>{selectedAdminUser.documents.length} 份</span>
                        </div>
                        {selectedAdminUser.documents.length ? (
                          selectedAdminUser.documents.map((document) => (
                            <div className="credential-item" key={document.id}>
                              <div>
                                <strong>{document.name}</strong>
                                <small>
                                  {document.type} · {new Date(document.uploadedAt).toLocaleDateString('zh-CN')}
                                </small>
                              </div>
                              <span className={`account-badge ${document.status}`}>
                                {verificationStatusLabel[document.status]}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="admin-empty">该账号暂未上传认证材料。</p>
                        )}
                      </div>
                      <div className="admin-actions detail-actions">
                        <button
                          type="button"
                          onClick={() => updateUserDocuments(selectedAdminUser.id, 'approved', 'approved')}
                        >
                          审核通过
                        </button>
                        <button
                          type="button"
                          onClick={() => updateUserDocuments(selectedAdminUser.id, 'rejected', 'rejected')}
                        >
                          驳回材料
                        </button>
                        <button type="button" onClick={() => updateUserAccount(selectedAdminUser.id, { status: 'muted' })}>
                          禁言
                        </button>
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => updateUserAccount(selectedAdminUser.id, { status: 'banned' })}
                        >
                          封号
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="admin-empty">选择账号后，可审核材料、调整认证状态、禁言或封号。</p>
                  )}
                </aside>
              </div>
            ) : adminTab === 'posts' ? (
              <div className="admin-table admin-post-table">
                <div className="admin-row admin-row-head">
                  <span>帖子</span>
                  <span>分类</span>
                  <span>价格</span>
                  <span>状态</span>
                  <span>操作</span>
                </div>
                {appState.posts.map((post) => (
                  <div className="admin-row" key={post.id}>
                    <div className="admin-post-title">
                      <input
                        aria-label="帖子标题"
                        value={post.title}
                        onChange={(event) => updatePost(post.id, { title: event.target.value })}
                      />
                      <small>{post.school} · {post.author}</small>
                    </div>
                    <select
                      aria-label={`${post.title} 分类`}
                      value={post.category}
                      onChange={(event) => updatePost(post.id, { category: event.target.value })}
                    >
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                    <input
                      aria-label={`${post.title} 解锁积分`}
                      min="0"
                      type="number"
                      value={post.price}
                      onChange={(event) => {
                        const price = Math.max(0, Number.parseInt(event.target.value, 10) || 0)
                        updatePost(post.id, { price, featured: price > 0 ? post.featured : false })
                      }}
                    />
                    <button
                      className={post.featured ? 'status-toggle active' : 'status-toggle'}
                      type="button"
                      onClick={() => updatePost(post.id, { featured: !post.featured })}
                    >
                      {post.featured ? '已加精' : '未加精'}
                    </button>
                    <div className="admin-actions">
                      <button type="button" onClick={() => setActivePost(post)}>
                        预览
                      </button>
                      <button className="danger-button" type="button" onClick={() => removePost(post.id)}>
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : adminTab === 'partners' ? (
              <div className="admin-table admin-partner-table">
                <div className="admin-row admin-row-head">
                  <span>机构</span>
                  <span>类型</span>
                  <span>方向</span>
                  <span>联系人</span>
                  <span>需求</span>
                </div>
                {appState.partnerApplications.length === 0 ? (
                  <p className="admin-empty">暂无合作申请。</p>
                ) : (
                  appState.partnerApplications.map((application) => (
                    <div className="admin-row" key={application.id}>
                      <div>
                        <strong>{application.company}</strong>
                        <small>{new Date(application.createdAt).toLocaleDateString('zh-CN')}</small>
                      </div>
                      <span>{application.type}</span>
                      <span>{application.direction}</span>
                      <div>
                        <strong>{application.contact}</strong>
                        <small>{application.phone}</small>
                        <small>{application.budget || '未填写预算'}</small>
                      </div>
                      <p className="admin-partner-detail">{application.detail || '未填写详细需求'}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="admin-content-panel">
                <div className="admin-content-head">
                  <div>
                    <p className="eyebrow dark">可视化改网站</p>
                    <h3>首页文案和手机端尺寸</h3>
                  </div>
                  <div className="admin-content-actions">
                    <button type="button" onClick={resetSiteContentDraft}>
                      恢复默认
                    </button>
                    <button className="primary-admin-button" type="button" onClick={saveSiteContent}>
                      保存到网站
                    </button>
                  </div>
                </div>
                <p className="admin-content-note">
                  这里保存后会写入线上数据库。以后你想改首页大标题、按钮文字、搜索提示、手机端字号和搜索框大小，直接在这里改，不需要碰 TSX。
                </p>

                <div className="admin-content-grid">
                  <label>
                    顶部小字
                    <input
                      value={contentDraft.heroEyebrow}
                      onChange={(event) => updateContentDraft('heroEyebrow', event.target.value)}
                    />
                  </label>
                  <label>
                    首页大标题
                    <input
                      value={contentDraft.heroTitle}
                      onChange={(event) => updateContentDraft('heroTitle', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    主标题下面的大字
                    <textarea
                      rows={3}
                      value={contentDraft.heroCopy}
                      onChange={(event) => updateContentDraft('heroCopy', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    搜索框上方说明
                    <textarea
                      rows={2}
                      value={contentDraft.heroSubcopy}
                      onChange={(event) => updateContentDraft('heroSubcopy', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    搜索框提示文字
                    <input
                      value={contentDraft.searchPlaceholder}
                      onChange={(event) => updateContentDraft('searchPlaceholder', event.target.value)}
                    />
                  </label>
                  <label>
                    蓝色按钮
                    <input
                      value={contentDraft.askButtonText}
                      onChange={(event) => updateContentDraft('askButtonText', event.target.value)}
                    />
                  </label>
                  <label>
                    红色按钮
                    <input
                      value={contentDraft.shareButtonText}
                      onChange={(event) => updateContentDraft('shareButtonText', event.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-content-grid">
                  <label>
                    第一组大字
                    <input
                      value={contentDraft.metricAskTitle}
                      onChange={(event) => updateContentDraft('metricAskTitle', event.target.value)}
                    />
                  </label>
                  <label>
                    第一组小字
                    <input
                      value={contentDraft.metricAskCopy}
                      onChange={(event) => updateContentDraft('metricAskCopy', event.target.value)}
                    />
                  </label>
                  <label>
                    第二组大字
                    <input
                      value={contentDraft.metricExperienceTitle}
                      onChange={(event) => updateContentDraft('metricExperienceTitle', event.target.value)}
                    />
                  </label>
                  <label>
                    第二组小字
                    <input
                      value={contentDraft.metricExperienceCopy}
                      onChange={(event) => updateContentDraft('metricExperienceCopy', event.target.value)}
                    />
                  </label>
                  <label>
                    第三组大字
                    <input
                      value={contentDraft.metricRewardTitle}
                      onChange={(event) => updateContentDraft('metricRewardTitle', event.target.value)}
                    />
                  </label>
                  <label>
                    第三组小字
                    <input
                      value={contentDraft.metricRewardCopy}
                      onChange={(event) => updateContentDraft('metricRewardCopy', event.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-content-grid admin-slider-grid">
                  <label>
                    手机 LOGO 宽度：{contentDraft.mobileLogoWidth}vw
                    <input
                      max="110"
                      min="48"
                      type="range"
                      value={contentDraft.mobileLogoWidth}
                      onChange={(event) => updateContentDraft('mobileLogoWidth', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    手机标题字号：{contentDraft.mobileHeroTitleSize}px
                    <input
                      max="72"
                      min="34"
                      type="range"
                      value={contentDraft.mobileHeroTitleSize}
                      onChange={(event) => updateContentDraft('mobileHeroTitleSize', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    手机副标题字号：{contentDraft.mobileHeroCopySize}px
                    <input
                      max="48"
                      min="18"
                      type="range"
                      value={contentDraft.mobileHeroCopySize}
                      onChange={(event) => updateContentDraft('mobileHeroCopySize', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    手机搜索框大小：{contentDraft.mobileSearchScale.toFixed(1)} 倍
                    <input
                      max="2.2"
                      min="0.9"
                      step="0.1"
                      type="range"
                      value={contentDraft.mobileSearchScale}
                      onChange={(event) => updateContentDraft('mobileSearchScale', Number(event.target.value))}
                    />
                  </label>
                </div>
              </div>
            )}
            <p className="admin-footnote">注册账号、合作申请、积分和帖子管理会统一保存，方便后续审核和运营。</p>
          </section>
        </div>
      )}

      {authMode && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet" aria-label={authMode === 'login' ? '登录' : '注册'}>
            <button
              className="close-button"
              type="button"
              onClick={() => {
                setAuthMode(null)
                setAuthNotice('')
              }}
            >
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">{authMode === 'login' ? '登录账号' : '创建账号'}</p>
            <h2>{authMode === 'login' ? '继续使用你的积分账户。' : '认证后即可分享经验并获得收益。'}</h2>
            <form className="form-stack" onSubmit={handleAuth}>
              {authMode === 'register' && (
                <>
                  <label>
                    昵称
                    <input
                      value={authForm.name}
                      onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                      placeholder="例如：首尔学姐"
                    />
                  </label>
                  <label>
                    身份
                    <select
                      value={authForm.identity}
                      onChange={(event) => setAuthForm({ ...authForm, identity: event.target.value })}
                    >
                      <option>准备申请</option>
                      <option>已录取</option>
                      <option>在读学生</option>
                      <option>毕业校友</option>
                      <option>留学顾问</option>
                    </select>
                  </label>
                  <label>
                    学校 / 目标学校
                    <input
                      value={authForm.school}
                      onChange={(event) => setAuthForm({ ...authForm, school: event.target.value })}
                      placeholder="例如：延世大学"
                    />
                  </label>
                  <label>
                    上传认证材料
                    <input
                      multiple
                      type="file"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? [])
                        setAuthForm({
                          ...authForm,
                          documents: files.map((file) => ({
                            id: createId('doc'),
                            name: file.name,
                            type: file.type || '身份/学校认证材料',
                            status: 'pending',
                            uploadedAt: new Date().toISOString(),
                          })),
                        })
                      }}
                    />
                    <small className="field-help">可上传学生证、在读证明、Offer、毕业证明等；提交前建议遮挡证件号码等非必要敏感信息。</small>
                  </label>
                </>
              )}
              <label>
                邮箱
                <div className="inline-field">
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) => {
                      setAuthForm({ ...authForm, email: event.target.value })
                      setAuthNotice('')
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {authMode === 'register' && (
                    <button type="button" onClick={sendEmailCode}>
                      发送验证码
                    </button>
                  )}
                </div>
              </label>
              {authMode === 'register' && (
                <label>
                  邮箱验证码
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={authForm.emailCode}
                    onChange={(event) => {
                      setAuthForm({ ...authForm, emailCode: event.target.value.replace(/\D/g, '') })
                      setAuthNotice('')
                    }}
                    placeholder="请输入 6 位验证码"
                  />
                </label>
              )}
              {authMode === 'register' && isEmailCodeVerified && (
                <p className="form-success" role="status">
                  邮箱验证码已通过。
                </p>
              )}
              {authNotice && (
                <p className="form-notice" role="status" aria-live="polite">
                  {authNotice}
                </p>
              )}
              <label>
                密码
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  placeholder="至少 6 位"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>
              {authMode === 'register' && (
                <label>
                  再次输入密码
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(event) => setAuthForm({ ...authForm, confirmPassword: event.target.value })}
                    placeholder="请再次输入密码"
                    autoComplete="new-password"
                  />
                </label>
              )}
              <button type="submit">{authMode === 'login' ? '登录' : '注册并领取初始积分'}</button>
            </form>
            <button
              className="text-switch"
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login')
                setAuthNotice('')
              }}
            >
              {authMode === 'login' ? '还没有账号？去注册' : '已有账号？去登录'}
            </button>
          </section>
        </div>
      )}

      {publishOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet wide-modal" aria-label="发布经验">
            <button className="close-button" type="button" onClick={() => setPublishOpen(false)}>
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">发布经验</p>
            <h2>发布可检索、可审核、可加精的留学经验。</h2>
            <form className="form-stack" onSubmit={handlePublish}>
              <label>
                标题
                <input
                  value={postForm.title}
                  onChange={(event) => setPostForm({ ...postForm, title: event.target.value })}
                  placeholder="例如：庆熙大学传媒研究生真实体验"
                />
              </label>
              <div className="form-grid">
                <label>
                  学校
                  <select
                    value={postForm.school}
                    onChange={(event) => setPostForm({ ...postForm, school: event.target.value })}
                  >
                    {allSchoolProfiles.map((school) => (
                      <option key={school.id} value={school.name}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  分类
                  <select
                    value={postForm.category}
                    onChange={(event) => setPostForm({ ...postForm, category: event.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  解锁积分
                  <input
                    type="number"
                    min="0"
                    value={postForm.price}
                    onChange={(event) => setPostForm({ ...postForm, price: event.target.value })}
                  />
                </label>
              </div>
              <label>
                摘要
                <input
                  value={postForm.excerpt}
                  onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })}
                  placeholder="一句话说明这篇经验解决什么问题"
                />
              </label>
              <label>
                正文
                <textarea
                  value={postForm.body}
                  onChange={(event) => setPostForm({ ...postForm, body: event.target.value })}
                  placeholder="写下申请过程、课程体验、教授风格、毕业要求、避坑建议..."
                />
              </label>
              <button type="submit">保存并发布</button>
            </form>
          </section>
        </div>
      )}

      {partnerOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet wide-modal" aria-label="机构合作申请">
            <button className="close-button" type="button" onClick={() => setPartnerOpen(false)}>
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">机构合作申请</p>
            <h2>提交机构入驻、内容合作或人才合作需求。</h2>
            <form className="form-stack" onSubmit={handlePartnerApply}>
              <div className="form-grid partner-form-grid">
                <label>
                  机构 / 公司名称
                  <input
                    value={partnerForm.company}
                    onChange={(event) => setPartnerForm({ ...partnerForm, company: event.target.value })}
                    placeholder="例如：首尔留学中心"
                  />
                </label>
                <label>
                  机构类型
                  <select
                    value={partnerForm.type}
                    onChange={(event) => setPartnerForm({ ...partnerForm, type: event.target.value })}
                  >
                    <option>留学机构</option>
                    <option>论文辅导机构</option>
                    <option>语学院 / 教育机构</option>
                    <option>招聘企业</option>
                    <option>政府部门</option>
                    <option>品牌 / 广告合作</option>
                  </select>
                </label>
              </div>
              <div className="form-grid partner-form-grid">
                <label>
                  联系人
                  <input
                    value={partnerForm.contact}
                    onChange={(event) => setPartnerForm({ ...partnerForm, contact: event.target.value })}
                    placeholder="姓名 / 称呼"
                  />
                </label>
                <label>
                  微信 / 电话 / 邮箱
                  <input
                    value={partnerForm.phone}
                    onChange={(event) => setPartnerForm({ ...partnerForm, phone: event.target.value })}
                    placeholder="方便联系即可"
                  />
                </label>
              </div>
              <div className="form-grid partner-form-grid">
                <label>
                  合作方向
                  <select
                    value={partnerForm.direction}
                    onChange={(event) => setPartnerForm({ ...partnerForm, direction: event.target.value })}
                  >
                    <option>内容入驻</option>
                    <option>招生线索合作</option>
                    <option>论文 / 课程辅导合作</option>
                    <option>留学生人才推荐</option>
                    <option>广告投放</option>
                  </select>
                </label>
                <label>
                  预算 / 合作规模
                  <input
                    value={partnerForm.budget}
                    onChange={(event) => setPartnerForm({ ...partnerForm, budget: event.target.value })}
                    placeholder="可选，例如：月预算 5000"
                  />
                </label>
              </div>
              <label>
                合作需求说明
                <textarea
                  value={partnerForm.detail}
                  onChange={(event) => setPartnerForm({ ...partnerForm, detail: event.target.value })}
                  placeholder="请写一下你们想入驻的内容、目标学生群体、主推学校/专业、希望获取的线索或合作方式。"
                />
              </label>
              <button type="submit">提交合作申请</button>
            </form>
          </section>
        </div>
      )}

      {activePost && (
        <div className="modal-backdrop" role="presentation">
          <article className="modal-sheet wide-modal" aria-label="帖子正文">
            <button className="close-button" type="button" onClick={() => setActivePost(null)}>
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">{activePost.school} · {activePost.category}</p>
            <h2>{activePost.title}</h2>
            <div className="post-detail-meta">
              <span>{activePost.author}</span>
              <span>{activePost.price ? `${activePost.price} 积分` : '免费'}</span>
              <span>{new Date(activePost.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
            <p className="post-body">{activePost.body}</p>
          </article>
        </div>
      )}
    </main>
  )
}

export default App
