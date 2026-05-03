export type SchoolQuestion = {
  title: string
  category: string
  rewardPoints: number
  answersCount: number
  views: number
  status: 'open' | 'solved'
  tags: string[]
  updatedAt: string
}

export type SchoolFeaturedPost = {
  title: string
  summary: string
  author: string
  views: number
  likes: number
  bookmarks: number
  isFeatured: boolean
  tags: string[]
  updatedAt: string
}

export type SchoolTopic = {
  id: string
  slug: string
  nameZh: string
  nameKo: string
  nameEn: string
  country: string
  city: string
  district: string
  tags: string[]
  seoTitle: string
  seoDescription: string
  heroTitle: string
  heroSubtitle: string
  quickEntries: string[]
  suitableContent: string[]
  hotQuestions: SchoolQuestion[]
  featuredPosts: SchoolFeaturedPost[]
}

export const schoolTopics: SchoolTopic[] = [
  {
    id: 'konkuk',
    slug: 'konkuk',
    nameZh: '建国大学',
    nameKo: '건국대학교',
    nameEn: 'Konkuk University',
    country: '韩国',
    city: '首尔',
    district: '广津区',
    tags: ['韩国', '首尔', '建国大学', '大学院', '本科', '语学院', '2026更新'],
    seoTitle: '建国大学留学生生活攻略 - 留学生首页',
    seoDescription:
      '建国大学留学生生活攻略，整理建国大学入学、选课、租房、签证、外国人登录证、打工、医院、银行卡和校园生活相关经验，帮助韩国留学生少走弯路。',
    heroTitle: '建国大学留学生生活攻略',
    heroSubtitle:
      '整理建国大学留学生在入学、选课、签证、租房、打工、生活和毕业过程中最常遇到的问题与真实经验。',
    quickEntries: [
      '入学与选课',
      '签证与外国人登录证',
      '租房与保证金',
      '银行卡与手机卡',
      '打工与劳动问题',
      '医院与保险',
      '毕业与论文',
      '周边生活攻略',
    ],
    suitableContent: ['语学院', '本科', '大学院', '租房', '生活', '打工', '毕业'],
    hotQuestions: [
      {
        title: '建国大学附近哪里租房比较方便？',
        category: '租房/搬家/保证金',
        rewardPoints: 80,
        answersCount: 12,
        views: 2380,
        status: 'open',
        tags: ['广津区', '保证金', '通勤'],
        updatedAt: '2026-05-03',
      },
      {
        title: '建国大学语学院转本科需要准备什么？',
        category: '语学院/本科/大学院',
        rewardPoints: 120,
        answersCount: 9,
        views: 1864,
        status: 'solved',
        tags: ['语学院', '本科申请', '材料'],
        updatedAt: '2026-05-02',
      },
      {
        title: '建国大学大学院选课有什么坑？',
        category: '入学/选课/学分',
        rewardPoints: 60,
        answersCount: 7,
        views: 1426,
        status: 'open',
        tags: ['大学院', '选课', '学分'],
        updatedAt: '2026-05-01',
      },
      {
        title: '建国大学附近保证金租房要注意什么？',
        category: '租房/搬家/保证金',
        rewardPoints: 100,
        answersCount: 14,
        views: 3120,
        status: 'solved',
        tags: ['保证金', '合同', '中介'],
        updatedAt: '2026-04-29',
      },
      {
        title: '建国大学留学生办理外国人登录证要多久？',
        category: '签证/滞留资格',
        rewardPoints: 70,
        answersCount: 8,
        views: 2105,
        status: 'open',
        tags: ['外国人登录证', 'HiKorea', '预约'],
        updatedAt: '2026-04-28',
      },
      {
        title: '建国大学附近哪个银行开户方便？',
        category: '银行卡/手机卡/保险',
        rewardPoints: 40,
        answersCount: 6,
        views: 1258,
        status: 'solved',
        tags: ['银行卡', '手机认证', '校园周边'],
        updatedAt: '2026-04-26',
      },
      {
        title: '建国大学学生可以在哪里打工？',
        category: '打工/劳动纠纷',
        rewardPoints: 90,
        answersCount: 11,
        views: 2676,
        status: 'open',
        tags: ['打工', '兼职', '校外'],
        updatedAt: '2026-04-24',
      },
      {
        title: '建国大学毕业论文流程怎么走？',
        category: '毕业/论文/延毕',
        rewardPoints: 150,
        answersCount: 5,
        views: 980,
        status: 'open',
        tags: ['毕业', '论文', '大学院'],
        updatedAt: '2026-04-22',
      },
    ],
    featuredPosts: [
      {
        title: '建国大学留学生新生入学 checklist',
        summary: '从到校前材料、宿舍和租房准备，到学生证、校园系统和银行卡办理，整理新生第一周常见事项。',
        author: 'Konkuk 研二学姐',
        views: 4210,
        likes: 286,
        bookmarks: 519,
        isFeatured: true,
        tags: ['新生', '入学', 'checklist'],
        updatedAt: '2026-05-02',
      },
      {
        title: '建国大学周边租房避坑指南',
        summary: '按通勤距离、保证金、管理费和合同注意事项拆解建大周边租房选择。',
        author: '广津区租房过来人',
        views: 5890,
        likes: 348,
        bookmarks: 760,
        isFeatured: true,
        tags: ['租房', '保证金', '合同'],
        updatedAt: '2026-05-01',
      },
      {
        title: '建国大学附近生活圈介绍',
        summary: '整理建大入口、儿童大公园、圣水和江边方向的生活便利度、餐饮和日常采购。',
        author: '首尔生活记录员',
        views: 3324,
        likes: 192,
        bookmarks: 405,
        isFeatured: true,
        tags: ['生活圈', '交通', '购物'],
        updatedAt: '2026-04-30',
      },
      {
        title: '建国大学大学院选课经验',
        summary: '从课程容量、教授沟通、学分安排和毕业计划角度，复盘大学院选课前需要确认的问题。',
        author: '人文社科在读',
        views: 2148,
        likes: 138,
        bookmarks: 260,
        isFeatured: false,
        tags: ['大学院', '选课', '教授'],
        updatedAt: '2026-04-28',
      },
      {
        title: '建国大学语学院生活经验',
        summary: '语学院上课节奏、分班、课后复习和转本科准备经验，适合刚来韩国的同学参考。',
        author: '语学院毕业生',
        views: 2760,
        likes: 171,
        bookmarks: 346,
        isFeatured: true,
        tags: ['语学院', '本科申请', '韩语'],
        updatedAt: '2026-04-27',
      },
      {
        title: '建国大学附近银行开户攻略',
        summary: '说明开户前要准备的信息、手机认证和银行卡使用中的常见问题，具体要求以银行窗口为准。',
        author: '建大本科生',
        views: 1966,
        likes: 104,
        bookmarks: 233,
        isFeatured: false,
        tags: ['银行卡', '手机卡', '认证'],
        updatedAt: '2026-04-25',
      },
      {
        title: '建国大学附近医院看病流程',
        summary: '整理预约、挂号、保险使用和药店取药的基础流程，医疗判断请以医院专业意见为准。',
        author: '在韩生活五年',
        views: 1830,
        likes: 96,
        bookmarks: 214,
        isFeatured: false,
        tags: ['医院', '保险', '药店'],
        updatedAt: '2026-04-23',
      },
      {
        title: '建国大学毕业论文流程整理',
        summary: '按时间线整理导师沟通、选题、开题、中期和提交前的常见节点，具体要求以院系公告为准。',
        author: '大学院毕业生',
        views: 1544,
        likes: 88,
        bookmarks: 201,
        isFeatured: true,
        tags: ['毕业', '论文', '时间线'],
        updatedAt: '2026-04-20',
      },
    ],
  },
]

export const getSchoolTopicBySlug = (slug: string) =>
  schoolTopics.find((school) => school.slug === slug || school.id === slug)
