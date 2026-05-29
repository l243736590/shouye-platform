import type { Post, Question } from './types'

export const feedImages = [
  'https://shouye.fun/schools/yonsei/1.jpg',
  'https://shouye.fun/schools/cau/1.jpg',
  'https://shouye.fun/schools/hongik/1.jpg',
  'https://shouye.fun/schools/korea/1.jpg',
  'https://shouye.fun/schools/konkuk/1.jpg'
]

export const siteSeedQuestions: Question[] = [
  {
    id: 'q-d2-extension',
    title: '韩国 D-2 签证延长需要哪些材料？',
    detail: '第一次延长 D-2，想确认在学证明、成绩单、住宿证明和银行余额证明是否都要准备，预约当天还需要注意什么。',
    category: '签证/滞留资格',
    school: '中央大学',
    author: '大学院新生',
    rewardPoints: 120,
    answersCount: 8,
    views: 2860,
    status: 'solved',
    createdAt: '2026-05-03'
  },
  {
    id: 'q-rent-deposit',
    title: '韩国租房保证金怎么防止被骗？',
    detail: '准备住新村附近，房东要求先转一部分保证金。想知道签合同前应该查哪些信息，哪些情况不能转账。',
    category: '租房/搬家/保证金',
    school: '延世大学',
    author: '准备申请中',
    rewardPoints: 160,
    answersCount: 14,
    views: 4210,
    status: 'solved',
    createdAt: '2026-05-02'
  },
  {
    id: 'q-arc-lost',
    title: '外国人登录证丢了怎么办？',
    detail: '钱包丢了，里面有外国人登录证。想知道要不要先报警、去哪里补办、补办期间能不能正常出入学校和银行。',
    category: '签证/滞留资格',
    school: '釜山大学',
    author: '语学院同学',
    rewardPoints: 80,
    answersCount: 6,
    views: 1520,
    status: 'open',
    createdAt: '2026-05-01'
  },
  {
    id: 'q-bank-account',
    title: '韩国银行卡开户需要什么？',
    detail: '刚拿到外国人登录证，想去学校附近银行开户。需要学生证、手机号或者学校证明吗？',
    category: '银行卡/手机卡/保险',
    school: '建国大学',
    author: '建大本科新生',
    rewardPoints: 60,
    answersCount: 7,
    views: 1986,
    status: 'solved',
    createdAt: '2026-04-30'
  },
  {
    id: 'q-legal-exchange-channel',
    title: '留学生怎么走合法渠道换钱和取钱？',
    detail: '准备给孩子在韩国生活费，想知道银行卡 ATM 提款、银行购汇和海外汇款分别要注意什么。',
    category: '银行卡/手机卡/保险',
    school: '韩国生活',
    author: '新生家长',
    rewardPoints: 190,
    answersCount: 5,
    views: 4520,
    status: 'solved',
    createdAt: '2026-05-05'
  },
  {
    id: 'q-private-exchange-frozen',
    title: '私人换钱收到黑钱，银行卡被冻结怎么办？',
    detail: '之前私下换钱后银行账户被冻结，说可能涉及黑钱或涉诈资金。现在该先联系银行、报警，还是找对方退款？',
    category: '银行卡/手机卡/保险',
    school: '韩国生活',
    author: '账户被冻结了',
    rewardPoints: 185,
    answersCount: 7,
    views: 4380,
    status: 'solved',
    createdAt: '2026-05-05'
  },
  {
    id: 'q-work-hours',
    title: '韩国留学生可以合法打工多少小时？',
    detail: '想确认 D-2 留学生打工许可、每周小时数和放假期间限制。希望有办过许可的人分享流程。',
    category: '打工/劳动纠纷',
    school: '高丽大学',
    author: '找兼职中',
    rewardPoints: 100,
    answersCount: 10,
    views: 3420,
    status: 'open',
    createdAt: '2026-04-29'
  },
  {
    id: 'q-thesis-delay',
    title: '韩国大学院论文延期怎么办？',
    detail: '论文进度慢，导师建议延期。想知道延期申请、学费、签证和毕业时间线会有什么影响。',
    category: '毕业/论文/延毕',
    school: '汉阳大学',
    author: '论文卡住了',
    rewardPoints: 180,
    answersCount: 11,
    views: 2670,
    status: 'solved',
    createdAt: '2026-04-27'
  },
  {
    id: 'q-d10',
    title: '毕业后 D-10 求职签证怎么申请？',
    detail: '硕士快毕业，想从 D-2 转 D-10，想提前确认材料、求职计划书和预约经验。',
    category: '求职/实习/简历',
    school: '西江大学',
    author: '同校求助',
    rewardPoints: 150,
    answersCount: 9,
    views: 2190,
    status: 'open',
    createdAt: '2026-04-24'
  },
  {
    id: 'q-secondhand',
    title: '韩国二手交易买电器怎么避坑？',
    detail: '想买二手冰箱和微波炉，担心坏机、搬运费和先转账被骗。',
    category: '韩国生活',
    school: '韩国生活',
    author: '刚到首尔',
    rewardPoints: 55,
    answersCount: 5
  },
  {
    id: 'q-rent',
    title: '中央大附近找房，押金和合同怎么核对？',
    detail: '第一次在黑石洞附近看 one-room，想知道合同主体、保证金和退租条款怎么查。',
    category: '找房',
    school: '中央大学',
    author: '准备入学',
    rewardPoints: 120,
    answersCount: 6
  }
]

export const siteSeedPosts: Post[] = [
  {
    id: 'korea-rent-deposit-guide',
    slug: 'korea-rent-deposit-guide',
    title: '韩国租房保证金和合同避坑指南',
    summary: '从找房、核对房东、看合同到退租返还保证金，整理留学生第一次租 one-room 前应该确认的事项。',
    body:
      '适用人群\n适合第一次在韩国租 one-room、考试院转租、宿舍落选后找房，或准备从学校周边搬到新区域的同学。\n\n准备材料/注意事项\n看房前准备护照或外国人登录证信息、学校证明或在学信息、可联系的韩国手机号、预算上限、通勤路线和入住日期。签约前要确认合同出租人、收款账户名、房屋登记信息和中介身份是否一致。\n\n步骤\n先按学校、地铁、夜路和坡度筛区域；现场看水压、排水、霉味、窗户、门锁和垃圾点；要求看合同草稿，确认保证金、月租、管理费、入住日、退租提前通知、维修责任和押金返还日期。\n\n常见坑\n照片很好看但现场潮湿阴暗；管理费便宜但水电气网另算；转租人催你先打定金但房东没有同意转租；合同、房东和收款账户不是同一人。\n\n检查清单\n合同主体一致、房东/中介信息可核对、管理费项目写清、退租通知期限写清、押金返还方式写清、房间瑕疵已拍照、地址申报材料可提供。',
    school: '韩国生活',
    category: '租房/搬家/保证金',
    author: '新村搬家三次的学姐',
    price: 0,
    hot: '7.1k',
    views: 7120,
    likes: 468,
    bookmarks: 980,
    tags: ['韩国', '租房', '保证金', 'one-room', '合同', '精华'],
    contentType: '完整经验',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06'
  },
  {
    id: 'd2-visa-extension-guide',
    slug: 'd2-visa-extension-guide',
    title: 'D-2 签证延长准备指南',
    summary: '把 D-2 延签拆成资格确认、学校材料、住宿证明、预约提交和补件跟进，帮助在读学生少漏材料。',
    body:
      '适用人群\n适合 D-2 本科、硕士、博士在读生准备延长滞留期限，也适合刚从语学院、本科或研究注册状态转入下一阶段的人做预检查。\n\n准备材料/注意事项\n常见会用到护照、外国人登录证、申请书、在学证明、成绩或出勤相关材料、学费缴纳或奖学金相关证明、住宿证明和资金能力相关证明。材料名称、格式和有效期会调整，先看学校国际处公告，再到 HiKorea 确认电子民愿或访问预约要求。\n\n步骤\n确认滞留期限、学籍状态和学校是否允许继续在读；向学校开具在学、成绩、学费等材料；整理住所证明；按 HiKorea 指引选择电子申请或访问预约；提交后保存回执并查看补件通知。\n\n常见坑\n临近到期才预约，学校材料开不出来；地址和外国人登录证登记地址不一致；研究注册、休学、超学期学生按普通在读生准备导致补件。\n\n提示\n本文只提供准备思路，最终以 HiKorea、出入境事务所、1345 咨询和学校国际处最新公告为准。',
    school: '中央大学',
    category: '签证/滞留资格',
    author: '大学院延签过来人',
    price: 0,
    hot: '6.8k',
    views: 6840,
    likes: 422,
    bookmarks: 910,
    tags: ['韩国', 'D-2', '签证延长', 'HiKorea', '以公告为准'],
    contentType: '办理流程',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06'
  },
  {
    id: 'alien-registration-card-guide',
    slug: 'alien-registration-card-guide',
    title: '外国人登录证办理与地址信息检查',
    summary: '整理入境后办理外国人登录证、住所证明、领取后核对和后续地址变更的常见注意事项。',
    body:
      '适用人群\n适合持长期留学签证入境韩国、准备办理外国人登录证，或已经换住所需要检查地址信息的同学。\n\n准备材料/注意事项\n常见会用到护照、申请书、证件照、学校入学或在学相关材料、住所证明和窗口要求的补充文件。住所证明尤其容易卡，宿舍、本人租房、借住、转租需要的材料可能不同。\n\n步骤\n参加学校团体办理说明会，或查看 HiKorea 预约入口；按学校国际处清单准备申请表、照片和学校材料；确认住所证明；到出入境提交材料并保存回执；领取后核对姓名、生日、国籍、滞留资格、期限和地址。\n\n常见坑\n临时住处写成长期地址后忘记变更；照片规格、姓名拼写或宿舍证明不符合要求；把登录证正反面随便发给陌生中介或群友。',
    school: '建国大学',
    category: '签证/滞留资格',
    author: '建大本科生',
    price: 0,
    hot: '6.5k',
    views: 6510,
    likes: 396,
    bookmarks: 865,
    tags: ['外国人登录证', 'ARC', '地址变更', 'HiKorea'],
    contentType: '办理流程',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06'
  },
  {
    id: 'korea-bank-account-guide',
    slug: 'korea-bank-account-guide',
    title: '韩国银行卡开户与本人认证攻略',
    summary: '开户前先准备外国人登录证、手机号、学校信息和账户用途说明，避免后续手机银行和支付认证出问题。',
    body:
      '适用人群\n适合刚拿到外国人登录证、准备办韩国银行卡和手机银行的同学，也适合需要网购、外卖、学费和房租转账的人。\n\n准备材料/注意事项\n常见会用到外国人登录证、护照、韩国手机号、学生证或在学证明、住址信息、账户用途说明。学校合作银行或学校附近外国人业务多的支行通常更熟悉流程。\n\n步骤\n确认外国人登录证姓名、生日和手机号本人认证是否一致；选择学校合作支行；说明账户用途；问清每日转账限额、手机银行、OTP 或安全卡、交通功能、海外转账和海外刷卡。\n\n常见坑\n姓名拼写、空格或顺序不一致，会影响 KakaoPay、Toss、网购和医院预约认证；拿到卡后没问限额，交房租时才发现转不出去。',
    school: '韩国生活',
    category: '银行卡/手机卡/保险',
    author: '首尔生活记录员',
    price: 0,
    hot: '5.9k',
    views: 5920,
    likes: 310,
    bookmarks: 730,
    tags: ['银行卡', '开户', '手机认证', '生活'],
    contentType: '生活攻略',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06'
  },
  {
    id: 'korea-part-time-work-guide',
    slug: 'korea-part-time-work-guide',
    title: '韩国留学生打工许可与工资留证指南',
    summary: '打工前先确认签证资格、学校同意、雇主信息和时间制就业许可，工资纠纷时保留可证明劳动关系的证据。',
    body:
      '适用人群\n适合 D-2、D-4 在读期间准备兼职，或已经遇到排班、工资、合同纠纷的同学。\n\n准备材料/注意事项\n常见会用到护照、外国人登录证、申请书、在学或出勤/成绩相关材料、时间制就业确认书、标准劳动合同、雇主营业执照和学校国际处确认材料。\n\n步骤\n确认自己是否有资格申请时间制就业；和雇主确认工资、地点、岗位、每周时间和结算日；签书面劳动合同；让学校国际处确认材料；通过 HiKorea 或出入境要求的方式申请许可；许可结果明确后再按许可范围工作。\n\n常见坑\n未许可先上班、许可地点和实际地点不一致、超出允许范围工作、换店不重新确认、工资现金结算没有记录。',
    school: '高丽大学',
    category: '打工/劳动纠纷',
    author: '安岩兼职过来人',
    price: 0,
    hot: '6.1k',
    views: 6140,
    likes: 355,
    bookmarks: 810,
    tags: ['打工', '兼职许可', '工资拖欠', 'HiKorea'],
    contentType: '避坑攻略',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06'
  },
  {
    id: 'korea-f2-f5-residency-guide',
    slug: 'korea-f2-f5-residency-guide',
    title: '韩国 F-2 / F-5 长期居留与永驻申请指南',
    summary: '从毕业、就业、F-2 居留到 F-5 永驻，拆解留学生长期留韩要提前积累的收入、纳税、韩语、住所和守法记录。',
    body:
      '适用人群\n适合已经在韩国读书、准备毕业求职，或已经从 D-2 / D-10 转到 E-7 等工作签证，正在规划 F-2 居留、F-5 永驻的人。\n\n先分清 F-2 和 F-5\nF-2 通常理解为居留资格/长期居留路径，比学生签和求职签稳定，但仍然要看细分资格、续签条件、收入和住所等要求。F-5 才是永驻资格，取得后活动范围和停留期限限制会明显减少，但仍要重视永驻卡有效期、再入境期限、地址变更、违法记录和撤销风险。\n\n常见路线\nD-2 学生签证 -> D-10 求职或直接就业 -> E-7 等专业工作签证 -> F-2 居留 -> F-5 永驻。关键是岗位、公司、工资、专业匹配和合法就业记录。\n\n提前积累\n合法连续滞留记录、收入和纳税记录、学历和工作匹配、TOPIK/KIIP 或韩国社会理解能力、住所连续性。\n\n提示\n长期居留和永驻材料会随政策、类别和个人情况变化，本文只做路线拆解，不替代出入境窗口、1345 或律师意见。',
    school: '韩国生活',
    category: '签证/滞留资格',
    author: '长期居留规划整理员',
    price: 0,
    hot: '7.4k',
    views: 7420,
    likes: 486,
    bookmarks: 1040,
    tags: ['F-2', 'F-5', '永驻', '长期居留', 'KIIP'],
    contentType: '长期规划',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-13',
    updatedAt: '2026-05-13'
  },
  {
    id: 'post-art',
    title: '韩国艺术类入学：作品集和学校选择怎么看',
    summary: '艺术、设计、传媒、戏剧影视方向不要只看排名，要同时看作品集、面试和课程方向。',
    body:
      '艺术类入学不要从“哪个学校排名高”开始，而要先确认自己申请的是纯艺、视觉设计、产业设计、影像、电影、戏剧、音乐、舞蹈、传媒还是文化内容方向。\n\n第一步是把目标院系的招生简章单独存下来。重点看作品集页数、文件大小、提交方式、链接权限、原创声明、语言成绩、面试或实技安排。\n\n第二步是做学校对比表。表格里至少放学校、专业、课程方向、教授或工作室、学费、语言要求、材料截止日、面试日期和作品集格式。',
    school: '韩国大学',
    category: '入学',
    author: '艺术专业申请过来人',
    price: 0,
    likes: 198,
    tags: ['艺术类', '作品集', '入学']
  },
  {
    id: 'post-rent',
    title: '韩国租房保证金和合同避坑指南',
    summary: '看房时别只看价格，先核对房东、合同主体、押金账户和退租条件。',
    body:
      '租房第一步是确认合同主体。房东、登记簿、收款账户和合同上的名字最好能对应。\n\n第二步看房屋状态。热水、水压、霉味、采光、门锁、垃圾点和夜路都要现场确认。\n\n第三步保存证据。聊天记录、转账记录、合同关键页和入住照片都要留存。',
    school: '韩国留学',
    category: '找房',
    author: '租房过来人',
    price: 0,
    likes: 321,
    tags: ['租房', '保证金']
  },
  {
    id: 'post-visa',
    title: 'D-2 签证延签材料怎么准备',
    summary: '在读、超学期、论文阶段延签，材料和时间线要提前拆开。',
    body:
      '延签先看学校国际处通知和 HiKorea 公告。材料可能因学校、阶段和住所变化而不同。\n\n常见材料包括申请表、护照、外国人登录证、在学证明、成绩、住所证明和财力相关文件。\n\n不要等到到期前几天才预约，系统名额和补材料都会影响节奏。',
    school: '韩国留学',
    category: '签证',
    author: '签证整理员',
    price: 30,
    likes: 244,
    tags: ['签证', 'D-2']
  }
]

export const fallbackQuestions = siteSeedQuestions
export const fallbackPosts = siteSeedPosts
