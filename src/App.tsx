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
const schoolPageSize = 8

const fileImage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1800`

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

const schoolBrochureUrls: Record<string, string> = {
  snu: 'https://en.snu.ac.kr/admission',
  yonsei: 'https://admission.yonsei.ac.kr',
  korea: 'https://oia.korea.ac.kr',
  'skku-seoul': 'https://admission-global.skku.edu/eng/',
  hanyang: 'https://www.hanyang.ac.kr/web/eng/admissions',
  kyunghee: 'https://ipsi.khu.ac.kr',
  sejong: 'https://eng.sejong.ac.kr/eng/admission.do',
  cau: 'https://admission.cau.ac.kr',
  ewha: 'https://admission.ewha.ac.kr',
  sogang: 'https://admission.sogang.ac.kr',
  dongguk: 'https://ipsi.dongguk.edu',
  konkuk: 'https://enter.konkuk.ac.kr',
  hufs: 'https://adms.hufs.ac.kr',
  uos: 'https://admission.uos.ac.kr',
  'dankook-seoul': 'https://ipsi.dankook.ac.kr',
  seoultech: 'https://admission.seoultech.ac.kr',
  kookmin: 'https://admission.kookmin.ac.kr',
  soongsil: 'https://iphak.ssu.ac.kr',
  sookmyung: 'https://admission.sookmyung.ac.kr',
  kwangwoon: 'https://iphak.kw.ac.kr',
  myongji: 'https://iphak.mju.ac.kr',
  sangmyung: 'https://admission.smu.ac.kr',
  hansung: 'https://enter.hansung.ac.kr',
  sungshin: 'https://ipsi.sungshin.ac.kr',
  dongduk: 'https://ipsi.dongduk.ac.kr',
  duksung: 'https://enter.duksung.ac.kr',
  swu: 'https://admission.swu.ac.kr',
  knua: 'https://www.karts.ac.kr/en/admission/',
  knsu: 'https://www.knsu.ac.kr/web/eng/admission',
  sahmyook: 'https://ipsi.syu.ac.kr',
  hongik: 'https://admission.hongik.ac.kr',
  skku: 'https://admission-global.skku.edu/eng/',
  ajou: 'https://www.ajou.ac.kr/en/admission/',
  'hanyang-erica': 'https://www.hanyang.ac.kr/web/eng/admissions',
  'cau-anseong': 'https://admission.cau.ac.kr',
  pnu: 'https://go.pusan.ac.kr',
  donga: 'https://ent.donga.ac.kr',
  knu: 'https://ipsi.knu.ac.kr',
  keimyung: 'https://www.kmu.ac.kr/uni/eng/main.jsp',
  kaist: 'https://admission.kaist.ac.kr/intl-undergraduate/',
  chungnam: 'https://ipsi.cnu.ac.kr',
}

const getBrochureUrl = (school: SchoolProfile) =>
  schoolBrochureUrls[school.id] ?? `https://www.google.com/search?q=${encodeURIComponent(`${school.englishName} admissions`)}`

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
  const [message, setMessage] = useState('面向韩国留学人群的经验内容、机构入驻与人才连接平台。')
  const [schoolPages, setSchoolPages] = useState<Record<string, number>>({})

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
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)

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
      setMessage('请先完成邮箱验证码校验。')
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
    setMessage('注册成功，已获得 80 初始积分，可用于解锁加精内容。')
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
    setMessage(`验证码已生成：${code}。上线后将通过邮件发送到 ${email}。`)
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
    setMessage('发布成功，系统已奖励 30 积分。')
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

  const resetLocalData = () => {
    const nextState = { users: [], posts: seedPosts, currentUserId: null, unlockedPostIds: {} }
    setAppState(nextState)
    setMessage('页面数据已重置。')
  }

  return (
    <main>
      <header className="site-header" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="售业平台首页">
          <span className="brand-mark">售</span>
          <span>售业平台</span>
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
          <a href="#posts">经验库</a>
          <a href="#workspace">合作入口</a>
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
          <p className="eyebrow">Sell Your Skills · 韩国留学内容社区 · 机构入驻 · 人才连接</p>
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
              申请入驻 / 发布经验
              <PenLine size={18} aria-hidden="true" />
            </button>
            <button className="secondary-link" type="button" onClick={() => setAuthMode('register')}>
              查看合作入口
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="status-line">{message}</p>
        </motion.div>
      </section>

      <section className="proof-band" aria-label="Platform highlights">
        <div>
          <strong>韩国</strong>
          <span>垂直聚焦韩国院校与专业</span>
        </div>
        <div>
          <strong>{allSchoolProfiles.length}+</strong>
          <span>首批主流院校内容入口</span>
        </div>
        <div>
          <strong>B2B</strong>
          <span>机构内容入驻与企业人才合作</span>
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
            <a
              className="school-brochure-chip"
              href={getBrochureUrl(selectedSchool)}
              target="_blank"
              rel="noreferrer"
            >
              获取招生简章
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
          <p className="eyebrow dark">平台价值</p>
          <h2>把零散经验变成可检索、可验证、可商业化的留学决策资产。</h2>
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
          <h2>以学校为入口沉淀申请、课程、教授、就业和生活信息。</h2>
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
          <p className="eyebrow dark">合作入口</p>
          <h2>{currentUser ? `${currentUser.name}，这里是你的创作者中心。` : '学生、机构和企业都可以在这里找到合作位置。'}</h2>
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
            <h3>机构入驻</h3>
            <p>留学机构、语学堂、论文辅导和职业规划机构可发布审核后的专题内容，获取精准线索。</p>
            <button type="button" onClick={() => setPublishOpen(true)}>申请内容入驻</button>
          </article>
          <article className="workspace-panel">
            <Coins size={24} aria-hidden="true" />
            <h3>企业人才合作</h3>
            <p>沉淀韩国院校学生画像后，可为跨境企业、韩企和教育品牌提供实习、招聘与校园推广入口。</p>
            <button type="button" onClick={resetLocalData}>查看合作模型</button>
          </article>
        </div>
      </section>

      <section className="posts-section" id="posts">
        <div className="posts-topline">
          <div className="section-heading">
            <p className="eyebrow dark">精选内容样例</p>
            <h2>把学生最关心的问题做成可交易的经验资产。</h2>
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
          <p className="eyebrow dark">商业化路径</p>
          <h2>内容积分是增长入口，机构入驻和人才合作是商业出口。</h2>
          <p>
            平台通过加精内容解锁、机构认证号、专题内容页、精准线索和韩国留学生人才库形成多层收入结构。
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
          <h2>真实性和匿名保护是平台的护城河。</h2>
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

      <section className="cta-section">
        <p className="eyebrow dark">合作提案</p>
        <h2>先聚焦韩国留学内容，再扩展机构服务和留学生人才连接。</h2>
        <button className="primary-link dark-link" type="button" onClick={() => setPublishOpen(true)}>
          申请成为首批合作方
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
              <button type="submit">{authMode === 'login' ? '登录' : '注册并领取初始积分'}</button>
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
