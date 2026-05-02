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
}

const heroImage =
  'https://images.unsplash.com/photo-1742747215638-0105cbcd2645?auto=format&fit=crop&q=80&w=2200'

const storageKey = 'shouye-platform-mvp-v1'
const adminSessionKey = 'shouye-platform-admin-session'
const categories = ['全部', '申请避坑', '学校评价', '教授课程', '毕业就业', '生活落地']
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
    summary: '按 QS 2026 顺序优先展示，再补艺术、女子大、理工和常见申请院校。',
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
        description: '虽主校区不在首尔市内，但常被首都圈申请者一起比较，设计、传媒、经营、音乐和医学相关方向可看。',
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
  joinedAt: user.joinedAt ?? new Date().toISOString(),
  status: user.status ?? 'active',
  verificationStatus: user.verificationStatus ?? (user.documents?.length ? 'pending' : 'pending'),
  avatarUrl: user.avatarUrl ?? '',
  bio: user.bio ?? '',
  documents: user.documents ?? [],
})

const initialState = (): StoredState => {
  if (typeof window === 'undefined') {
    return { users: [], posts: seedPosts, partnerApplications: [], currentUserId: null, unlockedPostIds: {} }
  }

  const saved = window.localStorage.getItem(storageKey)
  if (!saved) {
    return { users: [], posts: seedPosts, partnerApplications: [], currentUserId: null, unlockedPostIds: {} }
  }

  try {
    const parsed = JSON.parse(saved) as StoredState
    return {
      users: (parsed.users ?? []).map(normalizeUser),
      posts: parsed.posts?.length ? parsed.posts : seedPosts,
      partnerApplications: parsed.partnerApplications ?? [],
      currentUserId: parsed.currentUserId ?? null,
      unlockedPostIds: parsed.unlockedPostIds ?? {},
    }
  } catch {
    return { users: [], posts: seedPosts, partnerApplications: [], currentUserId: null, unlockedPostIds: {} }
  }
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'))
  const isAdminRoute = currentPath === '/admin'
  const isProfileRoute = currentPath === '/me'
  const isPostsRoute = currentPath === '/posts'
  const schoolRouteId =
    typeof window !== 'undefined' ? currentPath.match(/^\/school\/([^/]+)$/)?.[1] : undefined
  const initialAdminToken = typeof window !== 'undefined' ? window.sessionStorage.getItem(adminSessionKey) ?? '' : ''
  const [appState, setAppState] = useState<StoredState>(() => initialState())
  const currentUser = appState.users.find((user) => user.id === appState.currentUserId) ?? null
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [query, setQuery] = useState(() =>
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') ?? '' : '',
  )
  const [postSchoolFilter, setPostSchoolFilter] = useState('全部学校')
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
  const [adminTab, setAdminTab] = useState<'users' | 'posts' | 'partners'>('users')
  const [selectedAdminUserId, setSelectedAdminUserId] = useState<string | null>(null)
  const [activePost, setActivePost] = useState<Post | null>(null)
  const [message, setMessage] = useState('面向韩国留学人群的经验内容、机构入驻与人才连接平台。')
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
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [schoolGalleries, setSchoolGalleries] = useState<Record<string, string[]>>({})

  const [postForm, setPostForm] = useState({
    title: '',
    school: allSchoolProfiles[0].name,
    category: '申请避坑',
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
    fetch('/api/posts')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { posts?: Post[] } | null) => {
        if (data?.posts?.length) {
          setAppState((state) => ({ ...state, posts: data.posts ?? state.posts }))
        }
      })
      .catch(() => {
        // Keep the local demo data when the Cloudflare API is not bound yet.
      })
  }, [])

  const selectedAdminUser = appState.users.find((user) => user.id === selectedAdminUserId) ?? null
  const currentUnlocks = currentUser ? appState.unlockedPostIds[currentUser.id] ?? [] : []
  const routeSchool = schoolRouteId
    ? allSchoolProfiles.find((school) => school.id === decodeURIComponent(schoolRouteId))
    : null
  const selectedSchool =
    routeSchool ?? allSchoolProfiles.find((school) => school.id === selectedSchoolId) ?? allSchoolProfiles[0]
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
      const matchesCategory = selectedCategory === '全部' || post.category === selectedCategory
      const matchesSchool = postSchoolFilter === '全部学校' || post.school === postSchoolFilter
      const text = `${post.title}${post.school}${post.category}${post.excerpt}${post.author}`
      const matchesQuery = text.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesSchool && matchesQuery
    })
  }, [appState.posts, postSchoolFilter, selectedCategory, query])
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
      }).catch(() => setMessage('云端积分更新失败，请检查 D1 绑定。'))
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
      }).catch(() => setMessage('云端账号状态更新失败，请检查 D1 绑定。'))
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
      }).catch(() => setMessage('云端材料审核更新失败，请检查 D1 绑定。'))
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
      }).catch(() => setMessage('云端删除用户失败，请检查 D1 绑定。'))
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
      }).catch(() => setMessage('云端帖子更新失败，请检查 D1 绑定。'))
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
      }).catch(() => setMessage('云端删除帖子失败，请检查 D1 绑定。'))
    }
    setMessage('后台已删除帖子。')
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
    const data = (await response.json()) as { users: User[]; posts: Post[]; partnerApplications?: PartnerApplication[] }
    setAppState((state) => ({
      ...state,
      users: data.users ?? state.users,
      posts: data.posts?.length ? data.posts : state.posts,
      partnerApplications: data.partnerApplications ?? state.partnerApplications,
    }))
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
      setAuthNotice('请先点击发送验证码，并输入当前邮箱收到的 6 位验证码。')
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
      points: 80,
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
      setMessage('云端数据库暂未连接，已保存到本地演示数据。')
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
    setMessage('注册成功，已获得 80 初始积分，可用于解锁加精内容。')
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
        setMessage(data.error ?? '云端发布失败，请稍后再试。')
        return
      }
      post.id = data.post.id
      post.createdAt = data.post.createdAt
      post.author = data.post.author
      post.authorId = data.post.authorId
    } catch {
      setMessage('云端数据库暂未连接，已保存到本地演示数据。')
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
      school: allSchoolProfiles[0].name,
      category: '申请避坑',
      excerpt: '',
      body: '',
      price: '0',
    })
    setPublishOpen(false)
    setMessage('发布成功，系统已奖励 30 积分。')
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
    setMessage('合作申请已提交，后台可以查看。')
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
      setMessage('个人信息已保存到本地。')
    }
  }

  const removeOwnPost = (postId: string) => {
    if (currentUser) {
      fetch(`/api/posts/${encodeURIComponent(postId)}`, {
        body: JSON.stringify({ userId: currentUser.id }),
        headers: { 'content-type': 'application/json' },
        method: 'DELETE',
      }).catch(() => setMessage('云端删除帖子失败，已先从本地列表移除。'))
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
      setMessage(`积分不足，还差 ${post.price - currentUser.points} 积分。可以先发布经验或充值积分。`)
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

  const scrollToPartnerSection = () => {
    document.getElementById('partner-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openAdminEntry = () => {
    if (adminToken) {
      setAdminOpen(true)
      refreshAdminState().catch(() => setMessage('后台云端数据同步失败，请检查 D1 绑定。'))
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
        error: data?.error ?? '管理员登录失败，请确认 D1 数据库和 Worker API 已部署。',
      }))
      return
    }

    window.sessionStorage.setItem(adminSessionKey, data.token)
    setAdminToken(data.token)
    setAdminLoginOpen(false)
    setAdminOpen(true)
    setAdminLoginForm({ username: '', password: '', error: '' })
    refreshAdminState(data.token).catch(() => setMessage('后台已登录，但云端数据同步失败。'))
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
        : schoolRouteId
          ? 'school-route'
          : undefined

  return (
    <main className={mainClassName}>
      <header className="site-header" aria-label="Main navigation">
        <a
          className="brand"
          href="/"
          aria-label="售业 Sell UR skills 首页"
          onClick={(event) => {
            event.preventDefault()
            setMegaMenuOpen(false)
            window.history.pushState(null, '', '/')
            window.dispatchEvent(new PopStateEvent('popstate'))
            window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
          }}
        >
          <span className="brand-mark">
            售
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
          <span>售业 Sell UR skills</span>
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
              韩国院校
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
            href="/posts"
            onClick={(event) => {
              event.preventDefault()
              openPostsPage('')
            }}
          >
            经验库
          </a>
          <a href="#workspace">合作入口</a>
          <a href="#points">积分</a>
        </nav>
        {currentUser ? (
          <div className="user-pill">
            <span>{currentUser.name}</span>
            <strong>{currentUser.points} 积分</strong>
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

      <section className="hero-section" id="top">
        <img className="hero-image" src={heroImage} alt="韩国延世大学校园建筑" />
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="eyebrow">Sell UR skills · Korea Study Intelligence Platform</p>
          <h1>售业</h1>
          <p className="hero-copy">
            面向韩国留学人群的真实经验库、机构合作入口和留学生人才连接平台。
          </p>

          <form
            className="search-shell"
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
              placeholder="搜索：延世大学、经营学、教授、毕业论文、签证..."
              aria-label="搜索学校、专业、教授和经验"
            />
            <button type="submit">搜索</button>
          </form>

          <div className="hero-actions" aria-label="Quick actions">
            <button className="primary-link" type="button" onClick={() => setPublishOpen(true)}>
              申请入驻 / 发布经验
              <PenLine size={18} aria-hidden="true" />
            </button>
            <button className="secondary-link" type="button" onClick={scrollToPartnerSection}>
              商家合作申请
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="hero-metrics" aria-label="平台能力概览">
            <div>
              <strong>{allSchoolProfiles.length}+</strong>
              <span>韩国主流院校入口</span>
            </div>
            <div>
              <strong>D1</strong>
              <span>注册、帖子和合作申请云端存储</span>
            </div>
            <div>
              <strong>Admin</strong>
              <span>后台审核、积分和账号管理</span>
            </div>
          </div>
          <p className="status-line">{message}</p>
        </motion.div>
      </section>

      <section className="proof-band" aria-label="Platform highlights">
        <div>
          <strong>KR</strong>
          <span>垂直聚焦韩国院校、专业和申请链路</span>
        </div>
        <div>
          <strong>{allSchoolProfiles.length}+</strong>
          <span>首批主流院校内容入口</span>
        </div>
        <div>
          <strong>Verify</strong>
          <span>邮箱验证、材料审核和后台风控</span>
        </div>
        <div>
          <strong>B2B</strong>
          <span>机构内容入驻与企业人才合作</span>
        </div>
      </section>

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
                  补充认证材料
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
                  <small className="field-help">演示版保存文件名；正式版下一步接 R2 保存文件。</small>
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
              <p className="eyebrow dark">Experience Feed</p>
              <h1>经验库</h1>
              <p>像刷小红书一样看韩国院校、教授、课程、申请和生活经验。</p>
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
              <div>
                <span>分类</span>
                <div className="posts-filter-tabs">
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
                          <span className={post.price === 0 ? 'free' : 'locked'}>
                            {post.price === 0 ? '免费' : unlocked ? '已解锁' : `${post.price} 积分`}
                          </span>
                        </div>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <div className="post-footer">
                          <span>{post.author}</span>
                          <span>
                            <TrendingUp size={15} aria-hidden="true" />
                            {post.hot}
                          </span>
                        </div>
                        <button className="read-button" type="button" onClick={() => openPost(post)}>
                          {post.price > 0 && !unlocked ? '积分解锁' : '查看全文'}
                        </button>
                      </div>
                    </motion.article>
                  )
                })
              ) : (
                <div className="posts-empty-state">
                  <h3>没有找到相关帖子</h3>
                  <p>可以换个关键词，或者发布第一篇相关经验。</p>
                  <button type="button" onClick={() => setPublishOpen(true)}>
                    发布经验
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {schoolRouteId && (
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
            <h2>{selectedSchool.name} 相关经验帖子。</h2>
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
              <p className="admin-empty">这所学校暂时还没有帖子，可以先发布第一篇经验。</p>
            )}
          </div>
        </section>
      )}

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
                    <span>{group.schools.length} 所院校 · QS 2026 优先，后接常见申请院校</span>
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
                      <em>#{startIndex + schoolIndex + 1}</em>
                      <span>{school.name}</span>
                      <small>{school.city} · {school.landmark}</small>
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
            <button type="button" className="primary-link" onClick={() => setPublishOpen(true)}>
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
          <h2>先用韩国院校库建立用户入口，再围绕学校沉淀内容、服务和商业合作。</h2>
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
          <p className="eyebrow dark">Partner OS</p>
          <h2>{currentUser ? `${currentUser.name}，这里是你的创作者中心。` : '为学生、留学服务商和企业设计清晰的合作入口。'}</h2>
        </div>
        <div className="workspace-grid">
          <article className="workspace-panel">
            <LogIn size={24} aria-hidden="true" />
            <h3>{currentUser ? '创作者账户' : '学生创作者'}</h3>
            {currentUser ? (
              <>
                <p>{currentUser.identity} · {currentUser.school}</p>
                <strong>{currentUser.points} 积分</strong>
                <button type="button" onClick={() => updateUserPoints(currentUser.id, currentUser.points + 100)}>
                  模拟积分充值
                </button>
              </>
            ) : (
              <>
                <p>认证学生可以匿名分享学校、教授、课程和申请经验，通过积分获得内容收益。</p>
                <button type="button" onClick={() => setAuthMode('register')}>创建创作者账号</button>
              </>
            )}
          </article>
          <article className="workspace-panel">
            <PenLine size={24} aria-hidden="true" />
            <h3>商家合作申请</h3>
            <p>留学机构、语学院、论文辅导、政府部门和职业规划机构可提交合作表单，由后台统一跟进。</p>
            <button type="button" onClick={scrollToPartnerSection}>提交合作表单</button>
          </article>
          <article className="workspace-panel">
            <Coins size={24} aria-hidden="true" />
            <h3>企业人才合作</h3>
            <p>当注册用户和认证材料积累后，可为跨境企业、韩企和教育品牌提供实习、招聘与校园推广入口。</p>
            <button type="button" onClick={scrollToPartnerSection}>查看合作入口</button>
          </article>
        </div>
      </section>

      <section className="posts-section" id="posts">
        <div className="posts-topline">
          <div className="section-heading">
            <p className="eyebrow dark">Content Samples</p>
            <h2>内容不是普通帖子，而是能影响择校、申请和服务转化的决策节点。</h2>
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
          <p className="eyebrow dark">Business Model</p>
          <h2>内容积分负责增长与激励，机构合作和人才连接负责商业化。</h2>
          <p>
            平台通过加精内容解锁、机构认证号、专题内容页、精准线索和韩国留学生人才库形成多层收入结构，适合先从韩国垂直市场验证。
          </p>
        </div>
        <div className="points-flow" aria-label="Points flow">
          <div>
            <Sparkles size={22} aria-hidden="true" />
            <span>真实经验内容</span>
          </div>
          <ArrowRight size={20} aria-hidden="true" />
          <div>
            <Coins size={22} aria-hidden="true" />
            <span>积分与加精</span>
          </div>
          <ArrowRight size={20} aria-hidden="true" />
          <div>
            <MessageSquareText size={22} aria-hidden="true" />
            <span>B端合作转化</span>
          </div>
        </div>
      </section>

      <section className="trust-section" id="trust">
        <div className="trust-panel">
          <ShieldCheck size={30} aria-hidden="true" />
          <h2>真实性审核和匿名保护，是商家愿意合作的前提。</h2>
          <p>
            平台采用后台认证、前台匿名、材料审核、同校交叉验证、小样本保护和加精人工审核，既保证内容可信，也保护发帖人安全。
          </p>
        </div>
        <div className="trust-list">
          <div>
            <GraduationCap size={22} aria-hidden="true" />
            <span>学校邮箱、Offer、在读和毕业材料认证</span>
          </div>
          <div>
            <BadgeCheck size={22} aria-hidden="true" />
            <span>付费加精内容先审后展示</span>
          </div>
          <div>
            <ShieldCheck size={22} aria-hidden="true" />
            <span>匿名展示与小样本保护，降低身份暴露风险</span>
          </div>
        </div>
      </section>

      <section className="cta-section" id="partner-apply">
        <p className="eyebrow dark">Partner Application</p>
        <h2>欢迎留学机构、语学院、论文辅导、政府部门和招聘方申请成为首批合作方。</h2>
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
            <p className="eyebrow dark">Admin Login</p>
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
              <p className="admin-login-note">当前为前端演示登录，正式上线后应接入服务端权限校验。</p>
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
            <p className="eyebrow dark">Admin Console</p>
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
            </div>

            {adminTab === 'users' ? (
              <div className="admin-users-layout">
                <div className="admin-table admin-user-table">
                  <div className="admin-row admin-row-head">
                    <span>注册账号</span>
                    <span>状态</span>
                    <span>认证</span>
                    <span>积分</span>
                    <span>操作</span>
                  </div>
                  {appState.users.length === 0 ? (
                    <p className="admin-empty">暂无注册用户。你可以先用注册入口创建测试账号。</p>
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
                          aria-label={`${user.name} 积分`}
                          min="0"
                          type="number"
                          value={pointDrafts[user.id] ?? String(user.points)}
                          onChange={(event) =>
                            setPointDrafts((drafts) => ({ ...drafts, [user.id]: event.target.value }))
                          }
                        />
                        <div className="admin-actions">
                          <button type="button" onClick={() => setSelectedAdminUserId(user.id)}>
                            查看账号
                          </button>
                          <button
                            type="button"
                            onClick={() => updateUserPoints(user.id, Number.parseInt(pointDrafts[user.id] ?? String(user.points), 10) || 0)}
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
                          <span>当前积分</span>
                          <strong>{selectedAdminUser.points}</strong>
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
                    <p className="admin-empty">点击左侧“查看账号”，即可审核证件、调整认证状态、禁言或封号。</p>
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
                      {categories.filter((category) => category !== '全部').map((category) => (
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
            ) : (
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
            )}
            <p className="admin-footnote">后台已接入 Cloudflare D1；注册账号、合作申请、积分和帖子管理会保存到云端数据库。</p>
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
                    <small className="field-help">可上传学生证、在读证明、Offer、毕业证明等。演示版只保存文件名。</small>
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
            <h2>发布可被审核、加精和变现的经验内容。</h2>
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

      {partnerOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet wide-modal" aria-label="商家合作申请">
            <button className="close-button" type="button" onClick={() => setPartnerOpen(false)}>
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">商家合作申请</p>
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
