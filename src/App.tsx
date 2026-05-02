import type { FormEvent } from 'react'
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

type User = {
  id: string
  name: string
  email: string
  password: string
  identity: string
  school: string
  points: number
  joinedAt: string
}

type Post = {
  id: string
  title: string
  school: string
  category: string
  author: string
  authorId?: string
  price: number
  hot: string
  excerpt: string
  body: string
  createdAt: string
  featured: boolean
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

type StoredState = {
  users: User[]
  posts: Post[]
  currentUserId: string | null
  unlockedPostIds: Record<string, string[]>
}

const heroImage =
  'https://images.unsplash.com/photo-1742747215638-0105cbcd2645?auto=format&fit=crop&q=80&w=2200'

const storageKey = 'shouye-platform-mvp-v1'
const categories = ['全部', '申请避坑', '学校评价', '教授课程', '毕业就业', '生活落地']

const fileImage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1800`

const schoolRegions: { region: string; summary: string; schools: SchoolProfile[] }[] = [
  {
    region: '首尔',
    summary: 'SKY、艺术传媒、商科和语学堂资源最集中。',
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
        strengths: ['首都圈', '理工医学', '性价比可看'],
        source: 'https://commons.wikimedia.org/wiki/File:0-campus-sm-Ajou.jpg',
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
        strengths: ['国立背景', '生活成本低', '奖学金可看'],
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

const seedPosts: Post[] = [
  {
    id: 'seed-application-traps',
    title: '韩国大学院申请时，中介不会主动告诉你的 7 个细节',
    school: '韩国申请',
    category: '申请避坑',
    author: '10年韩国留学顾问',
    price: 36,
    hot: '2.4k',
    featured: true,
    createdAt: '2026-05-02',
    excerpt: '从材料时点、教授套磁、补件节奏到面试准备，按真实申请流程拆开讲。',
    body:
      '这篇内容适合刚开始准备韩国大学院的同学。重点看三件事：材料递交节奏、教授回复后的跟进方式、面试前怎样把研究计划和专业方向说清楚。很多申请失败不是条件不够，而是时点和表达出了问题。',
  },
  {
    id: 'seed-yonsei-business',
    title: '延世经营研究生真实体验：课程压力、韩语门槛和毕业论文',
    school: '延世大学',
    category: '学校评价',
    author: 'YONSEI 23届',
    price: 18,
    hot: '1.8k',
    featured: true,
    createdAt: '2026-05-02',
    excerpt: '适合想冲 SKY 但担心韩语和毕业难度的同学，含选课建议。',
    body:
      '延世经营的优势是资源和校友，但不是所有课程都适合韩语基础弱的同学。建议入学前先确认授课语言、论文指导方式和毕业要求，第一学期不要把方法论课程排得太满。',
  },
  {
    id: 'seed-hanyang-professors',
    title: '汉阳工科教授选择：项目型实验室和放养型实验室怎么分辨',
    school: '汉阳大学',
    category: '教授课程',
    author: '工科博士在读',
    price: 24,
    hot: '1.3k',
    featured: true,
    createdAt: '2026-05-02',
    excerpt: '把教授风格、组会频率、毕业要求和奖学金可能性放在一起看。',
    body:
      '工科选教授不能只看论文数量，还要看实验室经费、组会频率、毕业生去向和教授是否愿意让学生参与项目。申请前可以用邮件问清楚研究主题、毕业标准和奖学金安排。',
  },
  {
    id: 'seed-seoul-rent',
    title: '首尔租房避坑：保证金、管理费、短租和新生第一套房',
    school: '首尔生活',
    category: '生活落地',
    author: '新村住了6年',
    price: 0,
    hot: '3.1k',
    featured: false,
    createdAt: '2026-05-02',
    excerpt: '新生落地最容易踩坑的不是学校，而是合同、押金和通勤。',
    body:
      '首尔租房要先确认保证金、月租、管理费、网费和退租条件。第一次租房尽量选择交通明确、合同清晰、能线下看房的房源。不要只看图片，也不要急着转账。',
  },
]

const pathways = [
  {
    icon: Search,
    title: '先搜学校和专业',
    text: '按韩国院校、地区、专业、申请季和学位筛选真实经验。',
  },
  {
    icon: BadgeCheck,
    title: '看身份认证内容',
    text: '区分在读、毕业、已录取、申请中，内容标记年份和项目。',
  },
  {
    icon: Coins,
    title: '积分解锁深度帖',
    text: '优质复盘、教授避坑、选课攻略可用积分查看，创作者获得激励。',
  },
]

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

const initialState = (): StoredState => {
  if (typeof window === 'undefined') {
    return { users: [], posts: seedPosts, currentUserId: null, unlockedPostIds: {} }
  }

  const saved = window.localStorage.getItem(storageKey)
  if (!saved) {
    return { users: [], posts: seedPosts, currentUserId: null, unlockedPostIds: {} }
  }

  try {
    const parsed = JSON.parse(saved) as StoredState
    return {
      users: parsed.users ?? [],
      posts: parsed.posts?.length ? parsed.posts : seedPosts,
      currentUserId: parsed.currentUserId ?? null,
      unlockedPostIds: parsed.unlockedPostIds ?? {},
    }
  } catch {
    return { users: [], posts: seedPosts, currentUserId: null, unlockedPostIds: {} }
  }
}

function App() {
  const [appState, setAppState] = useState<StoredState>(() => initialState())
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const [selectedSchoolId, setSelectedSchoolId] = useState(() => getInitialSchoolId())
  const [openRegion, setOpenRegion] = useState(
    () => getParentRegion(getInitialSchoolId()) ?? schoolRegions[0].region,
  )
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [activePost, setActivePost] = useState<Post | null>(null)
  const [message, setMessage] = useState('内容会先保存在当前浏览器，适合第一版演示和测试。')

  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    emailCode: '',
    identity: '准备申请',
    school: '',
  })
  const [pendingEmailCode, setPendingEmailCode] = useState('')

  const [postForm, setPostForm] = useState({
    title: '',
    school: '',
    category: '申请避坑',
    excerpt: '',
    body: '',
    price: '0',
  })

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(appState))
  }, [appState])

  const currentUser = appState.users.find((user) => user.id === appState.currentUserId) ?? null
  const currentUnlocks = currentUser ? appState.unlockedPostIds[currentUser.id] ?? [] : []
  const selectedSchool =
    allSchoolProfiles.find((school) => school.id === selectedSchoolId) ?? allSchoolProfiles[0]

  const filteredPosts = useMemo(() => {
    return appState.posts.filter((post) => {
      const matchesCategory = selectedCategory === '全部' || post.category === selectedCategory
      const text = `${post.title}${post.school}${post.category}${post.excerpt}${post.author}`
      const matchesQuery = text.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [appState.posts, selectedCategory, query])

  const userPosts = useMemo(() => {
    if (!currentUser) return []
    return appState.posts.filter((post) => post.authorId === currentUser.id)
  }, [appState.posts, currentUser])

  const updateUserPoints = (userId: string, nextPoints: number) => {
    setAppState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === userId ? { ...user, points: nextPoints } : user,
      ),
    }))
  }

  const openSchoolPage = (school: SchoolProfile) => {
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

  const handleAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = authForm.email.trim().toLowerCase()
    const password = authForm.password.trim()
    const confirmPassword = authForm.confirmPassword.trim()

    if (!email || !password) {
      setMessage('请填写邮箱和密码。')
      return
    }

    if (authMode === 'login') {
      const matched = appState.users.find(
        (user) => user.email === email && user.password === password,
      )
      if (!matched) {
        setMessage('没有找到这个账号，或密码不正确。')
        return
      }
      setAppState((state) => ({ ...state, currentUserId: matched.id }))
      setAuthMode(null)
      setMessage(`欢迎回来，${matched.name}。`)
      return
    }

    if (password.length < 6) {
      setMessage('密码至少需要 6 位。')
      return
    }

    if (password !== confirmPassword) {
      setMessage('两次输入的密码不一致。')
      return
    }

    if (!pendingEmailCode || authForm.emailCode.trim() !== pendingEmailCode) {
      setMessage('请先发送邮箱验证码，并输入正确的验证码。')
      return
    }

    if (appState.users.some((user) => user.email === email)) {
      setMessage('这个邮箱已经注册过了，可以直接登录。')
      return
    }

    const user: User = {
      id: createId('user'),
      name: authForm.name.trim() || '韩国留学用户',
      email,
      password,
      identity: authForm.identity,
      school: authForm.school.trim() || '暂未填写',
      points: 80,
      joinedAt: new Date().toISOString(),
    }

    setAppState((state) => ({
      ...state,
      users: [...state.users, user],
      currentUserId: user.id,
      unlockedPostIds: { ...state.unlockedPostIds, [user.id]: [] },
    }))
    setAuthMode(null)
    setPendingEmailCode('')
    setAuthForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      emailCode: '',
      identity: '准备申请',
      school: '',
    })
    setMessage('注册成功，已赠送 80 积分用于体验加精内容。')
  }

  const sendEmailCode = () => {
    const email = authForm.email.trim().toLowerCase()
    if (!email) {
      setMessage('请先填写邮箱，再发送验证码。')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('邮箱格式不正确。')
      return
    }
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setPendingEmailCode(code)
    setAuthForm((form) => ({ ...form, emailCode: '' }))
    setMessage(`演示版验证码已生成：${code}。正式版会发送到 ${email}。`)
  }

  const handlePublish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) {
      setAuthMode('register')
      setMessage('请先注册或登录，再发布经验。')
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

    setAppState((state) => ({
      ...state,
      posts: [post, ...state.posts],
      users: state.users.map((user) =>
        user.id === currentUser.id ? { ...user, points: user.points + 30 } : user,
      ),
    }))
    setPostForm({
      title: '',
      school: '',
      category: '申请避坑',
      excerpt: '',
      body: '',
      price: '0',
    })
    setPublishOpen(false)
    setMessage('发布成功，系统奖励 30 积分。内容已经保存到本地存储。')
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
      setMessage(`积分不足，还差 ${post.price - currentUser.points} 积分。可以先发布经验或体验充值。`)
      return
    }

    setAppState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === currentUser.id ? { ...user, points: user.points - post.price } : user,
      ),
      unlockedPostIds: {
        ...state.unlockedPostIds,
        [currentUser.id]: [...(state.unlockedPostIds[currentUser.id] ?? []), post.id],
      },
    }))
    setActivePost(post)
    setMessage(`已使用 ${post.price} 积分解锁：${post.title}`)
  }

  const resetLocalData = () => {
    const nextState = { users: [], posts: seedPosts, currentUserId: null, unlockedPostIds: {} }
    setAppState(nextState)
    setMessage('演示数据已重置。')
  }

  return (
    <main>
      <header className="site-header" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="售业平台首页">
          <span className="brand-mark">售</span>
          <span>售业平台</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#schools">韩国院校</a>
          <a href="#school-browser">院校菜单</a>
          <a href="#posts">经验库</a>
          <a href="#workspace">工作台</a>
          <a href="#points">积分</a>
        </nav>
        {currentUser ? (
          <div className="user-pill">
            <span>{currentUser.name}</span>
            <strong>{currentUser.points} 积分</strong>
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

      <section className="hero-section" id="top">
        <img className="hero-image" src={heroImage} alt="韩国延世大学校园建筑" />
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="eyebrow">Sell Your Skills · 韩国留学先行 · 注册 / 发帖 / 积分 / 解锁</p>
          <h1>售业平台</h1>
          <p className="hero-copy">
            把韩国留学经验沉淀成可变现的真实经验库。
          </p>

          <div className="search-shell" role="search">
            <Search size={20} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索：延世大学、经营学、教授、毕业论文、签证..."
              aria-label="搜索学校、专业、教授和经验"
            />
            <button type="button">搜索</button>
          </div>

          <div className="hero-actions" aria-label="Quick actions">
            <button className="primary-link" type="button" onClick={() => setPublishOpen(true)}>
              发布经验
              <PenLine size={18} aria-hidden="true" />
            </button>
            <button className="secondary-link" type="button" onClick={() => setAuthMode('register')}>
              创建账号
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="status-line">{message}</p>
        </motion.div>
      </section>

      <section className="proof-band" aria-label="Platform highlights">
        <div>
          <strong>{appState.users.length}</strong>
          <span>已注册测试用户</span>
        </div>
        <div>
          <strong>{appState.posts.length}</strong>
          <span>经验内容已存储</span>
        </div>
        <div>
          <strong>+30</strong>
          <span>发布经验奖励积分</span>
        </div>
      </section>

      <section className="school-browser-section" id="school-browser">
        <div className="section-heading">
          <p className="eyebrow dark">韩国主流院校导航</p>
          <h2>按地区展开学校，点院校进入专属页面。</h2>
        </div>

        <div className="school-browser">
          <div className="region-menu" aria-label="地区菜单">
            {schoolRegions.map((group) => (
              <button
                className={openRegion === group.region ? 'active' : ''}
                key={group.region}
                type="button"
                onClick={() => setOpenRegion(group.region)}
              >
                <span>{group.region}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </button>
            ))}
          </div>

          {schoolRegions.map((group) => (
            <div
              className={openRegion === group.region ? 'school-submenu open' : 'school-submenu'}
              key={group.region}
            >
              <div className="submenu-intro">
                <strong>{group.region}</strong>
                <p>{group.summary}</p>
              </div>
              <div className="submenu-grid">
                {group.schools.map((school) => (
                  <button
                    className={selectedSchool.id === school.id ? 'school-menu-card active' : 'school-menu-card'}
                    key={school.id}
                    type="button"
                    onClick={() => openSchoolPage(school)}
                  >
                    <span>{school.name}</span>
                    <small>{school.city} · {school.landmark}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
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
            <span>
              <MapPin size={17} aria-hidden="true" />
              {selectedSchool.region} · {selectedSchool.city}
            </span>
            <span>
              <Building2 size={17} aria-hidden="true" />
              {selectedSchool.landmark}
            </span>
          </div>
          <div className="school-programs">
            {selectedSchool.programs.map((program) => (
              <span key={program}>{program}</span>
            ))}
          </div>
          <div className="school-strengths">
            {selectedSchool.strengths.map((strength) => (
              <strong key={strength}>{strength}</strong>
            ))}
          </div>
          <div className="school-page-actions">
            <button type="button" className="primary-link" onClick={() => setPublishOpen(true)}>
              分享这所学校的经验
              <PenLine size={18} aria-hidden="true" />
            </button>
            <button type="button" className="school-experience-link" onClick={() => setQuery(selectedSchool.name)}>
              获取这所学校的经验
              <BookOpenText size={20} aria-hidden="true" />
            </button>
            <a className="image-source-link" href={selectedSchool.source} target="_blank" rel="noreferrer">
              背景图来源
            </a>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="section-heading">
          <p className="eyebrow dark">第一阶段聚焦韩国</p>
          <h2>先把账号、内容和积分闭环跑起来。</h2>
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
          <p className="eyebrow dark">韩国院校入口</p>
          <h2>先从热门学校跑通内容结构。</h2>
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
          <p className="eyebrow dark">用户工作台</p>
          <h2>{currentUser ? `${currentUser.name}，这里是你的内容账户。` : '注册后就能发布经验并累计积分。'}</h2>
        </div>
        <div className="workspace-grid">
          <article className="workspace-panel">
            <LogIn size={24} aria-hidden="true" />
            <h3>{currentUser ? '当前账号' : '注册 / 登录'}</h3>
            {currentUser ? (
              <>
                <p>{currentUser.identity} · {currentUser.school}</p>
                <strong>{currentUser.points} 积分</strong>
                <button type="button" onClick={() => updateUserPoints(currentUser.id, currentUser.points + 100)}>
                  体验充值 +100
                </button>
              </>
            ) : (
              <>
                <p>新用户注册赠送 80 积分，方便测试加精内容解锁。</p>
                <button type="button" onClick={() => setAuthMode('register')}>立即注册</button>
              </>
            )}
          </article>
          <article className="workspace-panel">
            <PenLine size={24} aria-hidden="true" />
            <h3>内容发布</h3>
            <p>标题、学校、分类、摘要、正文和积分价格都会被保存。</p>
            <button type="button" onClick={() => setPublishOpen(true)}>发布经验</button>
          </article>
          <article className="workspace-panel">
            <Coins size={24} aria-hidden="true" />
            <h3>我的数据</h3>
            <p>已发布 {userPosts.length} 篇，已解锁 {currentUnlocks.length} 篇。</p>
            <button type="button" onClick={resetLocalData}>重置演示数据</button>
          </article>
        </div>
      </section>

      <section className="posts-section" id="posts">
        <div className="posts-topline">
          <div className="section-heading">
            <p className="eyebrow dark">经验内容流</p>
            <h2>让申请者按问题找答案。</h2>
          </div>
          <div className="category-tabs" aria-label="Post categories">
            {categories.map((category) => (
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
          <p className="eyebrow dark">积分与变现</p>
          <h2>先奖励内容，再开放商业化。</h2>
          <p>
            第一版已经能完成注册、发帖得积分、付积分看加精内容。现在用本地存储，正式版可以迁移到 PostgreSQL、Supabase 或自建后端。
          </p>
        </div>
        <div className="points-flow" aria-label="Points flow">
          <div>
            <Sparkles size={22} aria-hidden="true" />
            <span>发布真实经验</span>
          </div>
          <ArrowRight size={20} aria-hidden="true" />
          <div>
            <Coins size={22} aria-hidden="true" />
            <span>获得积分</span>
          </div>
          <ArrowRight size={20} aria-hidden="true" />
          <div>
            <MessageSquareText size={22} aria-hidden="true" />
            <span>解锁深度帖</span>
          </div>
        </div>
      </section>

      <section className="trust-section" id="trust">
        <div className="trust-panel">
          <ShieldCheck size={30} aria-hidden="true" />
          <h2>可信内容会是平台的护城河。</h2>
          <p>
            下一步可以把学校邮箱、Offer/在读证明打码认证、内容审核、举报处理接进后台。
          </p>
        </div>
        <div className="trust-list">
          <div>
            <GraduationCap size={22} aria-hidden="true" />
            <span>在读 / 毕业 / 已录取身份标签</span>
          </div>
          <div>
            <BadgeCheck size={22} aria-hidden="true" />
            <span>加精内容先审后付费</span>
          </div>
          <div>
            <ShieldCheck size={22} aria-hidden="true" />
            <span>教授评价结构化，减少人身攻击风险</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <p className="eyebrow dark">MVP 方向</p>
        <h2>现在已经有注册、发帖、积分和本地存储。</h2>
        <button className="primary-link dark-link" type="button" onClick={() => setPublishOpen(true)}>
          发布第一篇经验
          <Plus size={18} aria-hidden="true" />
        </button>
      </section>

      {authMode && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet" aria-label={authMode === 'login' ? '登录' : '注册'}>
            <button className="close-button" type="button" onClick={() => setAuthMode(null)}>
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">{authMode === 'login' ? '登录账号' : '创建账号'}</p>
            <h2>{authMode === 'login' ? '继续使用你的积分账户。' : '注册后即可发布经验。'}</h2>
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
                </>
              )}
              <label>
                邮箱
                <div className="inline-field">
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
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
                    onChange={(event) => setAuthForm({ ...authForm, emailCode: event.target.value })}
                    placeholder="请输入 6 位验证码"
                  />
                </label>
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
              <button type="submit">{authMode === 'login' ? '登录' : '注册并领取 80 积分'}</button>
            </form>
            <button
              className="text-switch"
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
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
            <h2>分享内容并获得积分。</h2>
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
                  学校 / 主题
                  <input
                    value={postForm.school}
                    onChange={(event) => setPostForm({ ...postForm, school: event.target.value })}
                    placeholder="例如：庆熙大学"
                  />
                </label>
                <label>
                  分类
                  <select
                    value={postForm.category}
                    onChange={(event) => setPostForm({ ...postForm, category: event.target.value })}
                  >
                    {categories.filter((category) => category !== '全部').map((category) => (
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
