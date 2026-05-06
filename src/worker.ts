type Env = {
  DB?: D1Database
  ASSETS: Fetcher
  ADMIN_USERNAME: string
  ADMIN_PASSWORD_HASH: string
  RESEND_API_KEY?: string
  MAIL_FROM?: string
  EMAIL_PROVIDER?: string
  SENDGRID_API_KEY?: string
  MAILGUN_API_KEY?: string
  MAILGUN_DOMAIN?: string
  WECHAT_MINIAPP_APP_ID?: string
  WECHAT_MINIAPP_APP_SECRET?: string
}

type UserStatus = 'active' | 'muted' | 'banned'
type VerificationStatus = 'pending' | 'approved' | 'rejected'

type CredentialDocument = {
  id: string
  name: string
  type: string
  status: VerificationStatus
  uploadedAt: string
}

type UserRecord = {
  id: string
  name: string
  email: string
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

type PartnerApplicationRecord = {
  id: string
  company: string
  type: string
  contact: string
  phone: string
  direction: string
  budget: string
  detail: string
  status: 'pending' | 'approved' | 'rejected' | 'contacted' | 'closed'
  createdAt: string
}

type MerchantLeadRecord = {
  id: string
  merchantId: string
  merchantTitle: string
  merchantType: string
  userId?: string
  userName: string
  userContact: string
  note: string
  assignedTo: string
  adminNote: string
  status: 'pending' | 'contacted' | 'closed'
  createdAt: string
  updatedAt: string
}

type QuestionBountyRecord = {
  questionId: string
  askerUserId?: string
  answerId?: string
  answererUserId?: string
  rewardPoints: number
  status: 'held' | 'settled' | 'refunded' | 'disputed'
  createdAt: string
  updatedAt: string
  settledAt?: string
}

type QuestionDisputeRecord = {
  id: string
  questionId: string
  answerId?: string
  reporterUserId?: string
  type: 'refund' | 'appeal' | 'abuse'
  reason: string
  detail: string
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected'
  adminNote: string
  createdAt: string
  updatedAt: string
}

type PointOrderRecord = {
  id: string
  userId: string
  userName: string
  type: 'recharge'
  amountYuan: number
  points: number
  status: 'pending' | 'paid' | 'canceled' | 'refunded'
  channel: 'manual' | 'wechat' | 'bank'
  outTradeNo: string
  adminNote: string
  createdAt: string
  updatedAt: string
  paidAt?: string
}

type WithdrawalRequestRecord = {
  id: string
  userId: string
  userName: string
  earningPoints: number
  amountYuan: number
  payoutMethod: string
  accountLabel: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  adminNote: string
  createdAt: string
  updatedAt: string
  paidAt?: string
}

type PointLedgerRecord = {
  id: string
  userId: string
  direction: 'credit' | 'debit'
  accountType: 'points' | 'earning_points'
  points: number
  category: string
  refType: string
  refId: string
  note: string
  createdAt: string
}

type ContentReportRecord = {
  id: string
  contentType: string
  contentId: string
  reason: string
  description: string
  reporterUserId?: string
  reporterContact: string
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected'
  adminNote: string
  createdAt: string
  updatedAt: string
}

type PostRecord = {
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

type QuestionStatus = 'open' | 'solved'

type CommunityQuestionRecord = {
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
  authorId?: string
  identity: string
  tags: string[]
  detail: string
}

type QuestionAnswerRecord = {
  id: string
  questionId: string
  author: string
  authorId?: string
  identity: string
  content: string
  likes: number
  accepted: boolean
  createdAt: string
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

const defaultSiteContent: SiteContentSettings = {
  heroEyebrow: '留学生经验分享与问题解决平台',
  heroTitle: '技能&经验变现平台',
  heroCopy: '签证、租房、入学、打工、保险、银行卡、毕业、就业，真实留学生经验帮你少走弯路。',
  heroSubcopy: '你可以在这里提问，也可以分享自己的留学经验，通过高质量回答和经验帖获得收益。',
  searchPlaceholder: '搜索：D-2签证、租房保证金、外国人登录证、打工、论文延期...',
  askButtonText: '我要提问/求助',
  shareButtonText: '我要分享经验/提供帮助赚钱',
  metricAskTitle: '提问/求助',
  metricAskCopy: '提出问题寻求帮助，或者直接悬赏解决问题',
  metricExperienceTitle: '分享与助人',
  metricExperienceCopy: '分享您的经验，或给人提供实质性帮助解决问题',
  metricRewardTitle: '收益',
  metricRewardCopy: '被采纳回答、完成悬赏问答、提供精华攻略、完成悬赏任务都可以获取收入',
  mobileLogoWidth: 82,
  mobileHeroTitleSize: 50,
  mobileHeroCopySize: 32,
  mobileSearchScale: 1.3,
}

const normalizeSiteContent = (content?: Partial<SiteContentSettings>): SiteContentSettings => {
  const mergedContent = { ...defaultSiteContent, ...(content ?? {}) }

  return {
    ...mergedContent,
    heroTitle:
      mergedContent.heroTitle === '技能与经验的变现平台' ? defaultSiteContent.heroTitle : mergedContent.heroTitle,
    askButtonText:
      mergedContent.askButtonText === '我要提问' ? defaultSiteContent.askButtonText : mergedContent.askButtonText,
    shareButtonText:
      mergedContent.shareButtonText === '我要分享经验赚钱'
        ? defaultSiteContent.shareButtonText
        : mergedContent.shareButtonText,
    metricAskTitle: mergedContent.metricAskTitle === '提问' ? defaultSiteContent.metricAskTitle : mergedContent.metricAskTitle,
    metricAskCopy:
      mergedContent.metricAskCopy === '把签证、租房、入学和生活问题讲清楚'
        ? defaultSiteContent.metricAskCopy
        : mergedContent.metricAskCopy,
    metricExperienceTitle:
      mergedContent.metricExperienceTitle === '经验'
        ? defaultSiteContent.metricExperienceTitle
        : mergedContent.metricExperienceTitle,
    metricExperienceCopy:
      mergedContent.metricExperienceCopy === '真实留学生复盘避坑、流程和材料细节'
        ? defaultSiteContent.metricExperienceCopy
        : mergedContent.metricExperienceCopy,
    metricRewardCopy:
      mergedContent.metricRewardCopy === '被采纳回答、悬赏问答和精华攻略获得回报'
        ? defaultSiteContent.metricRewardCopy
        : mergedContent.metricRewardCopy,
    mobileLogoWidth: Math.min(110, Math.max(48, Number(content?.mobileLogoWidth ?? defaultSiteContent.mobileLogoWidth))),
    mobileHeroTitleSize: Math.min(
      72,
      Math.max(34, Number(content?.mobileHeroTitleSize ?? defaultSiteContent.mobileHeroTitleSize)),
    ),
    mobileHeroCopySize: Math.min(48, Math.max(18, Number(content?.mobileHeroCopySize ?? defaultSiteContent.mobileHeroCopySize))),
    mobileSearchScale: Math.min(2.2, Math.max(0.9, Number(content?.mobileSearchScale ?? defaultSiteContent.mobileSearchScale))),
  }
}

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  })

const siteOrigin = 'https://shouye.fun'
const shareImageUrl = `${siteOrigin}/wechat-share-card.jpg?v=20260507`

const xml = (body: string, init: ResponseInit = {}) =>
  new Response(body, {
    ...init,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      ...init.headers,
    },
  })

const text = (body: string, init: ResponseInit = {}) =>
  new Response(body, {
    ...init,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      ...init.headers,
    },
  })

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

type PageMeta = {
  title: string
  description: string
  keywords?: string
}

const defaultKeywords =
  '留学生, 留学经验, 韩国留学, 留学生生活, 签证, 租房, 打工, 大学院, 外国人登录证, 留学问答'

const pageMeta = (pathname: string): PageMeta => {
  if (pathname === '/questions') {
    return {
      title: '留学生问答 - 签证租房打工生活问题解答',
      description:
        '留学生问答集中解答签证、租房、入学、打工、保险、银行卡、毕业、就业和韩国生活问题，帮助留学生用真实经验少走弯路。',
      keywords: defaultKeywords,
    }
  }

  if (pathname === '/posts') {
    return {
      title: '留学生经验分享 - 签证租房入学打工攻略',
      description:
        '留学生经验分享收录韩国留学签证、租房、入学、打工、银行卡、保险、论文、毕业和就业攻略，优先展示真实可执行经验。',
      keywords: defaultKeywords,
    }
  }

  const postSeoMap: Record<string, { title: string; description: string }> = {
    '/posts/korea-rent-deposit-guide': {
      title: '韩国租房保证金和合同避坑指南 - 留学生首页',
      description: '韩国留学生租房保证金、one-room 合同、看房、退租和地址申报检查清单。',
    },
    '/posts/d2-visa-extension-guide': {
      title: 'D-2 签证延长准备指南 - 留学生首页',
      description: '韩国 D-2 留学生签证延长材料、学校证明、HiKorea 预约和补件注意事项。',
    },
    '/posts/alien-registration-card-guide': {
      title: '外国人登录证办理与地址信息检查 - 留学生首页',
      description: '韩国外国人登录证办理、住所证明、领取核对、地址变更和后续认证注意事项。',
    },
    '/posts/korea-bank-account-guide': {
      title: '韩国银行卡开户与本人认证攻略 - 留学生首页',
      description: '韩国留学生银行卡开户、手机本人认证、转账限额和账户用途说明准备指南。',
    },
    '/posts/korea-part-time-work-guide': {
      title: '韩国留学生打工许可与工资留证指南 - 留学生首页',
      description: '韩国留学生时间制就业许可、学校同意、劳动合同、工资拖欠和证据保存指南。',
    },
  }

  if (postSeoMap[pathname]) {
    return {
      title: postSeoMap[pathname].title,
      description: postSeoMap[pathname].description,
      keywords: defaultKeywords,
    }
  }

  if (pathname === '/schools/konkuk' || pathname === '/school/konkuk') {
    return {
      title: '建国大学留学生生活攻略 - 留学生首页',
      description:
        '建国大学留学生生活攻略，整理建国大学入学、选课、租房、签证、外国人登录证、打工、医院、银行卡和校园生活相关经验。',
      keywords: `${defaultKeywords}, 建国大学, Konkuk University`,
    }
  }

  if (pathname === '/schools/chungang' || pathname === '/school/chungang') {
    return {
      title: '中央大学留学生生活攻略 - 留学生首页',
      description:
        '中央大学留学生生活攻略，整理中央大学入学、选课、租房、签证、打工、语学院、大学院、毕业和韩国生活经验。',
      keywords: `${defaultKeywords}, 中央大学, Chung-Ang University`,
    }
  }

  if (pathname === '/schools/korea' || pathname === '/school/korea') {
    return {
      title: '高丽大学留学生生活攻略 - 留学生首页',
      description:
        '高丽大学留学生生活攻略，整理高丽大学入学、选课、租房、签证、打工、大学院、毕业和首尔安岩生活经验。',
      keywords: `${defaultKeywords}, 高丽大学, Korea University`,
    }
  }

  if (pathname === '/schools/yonsei' || pathname === '/school/yonsei') {
    return {
      title: '延世大学留学生生活攻略 - 留学生首页',
      description:
        '延世大学留学生生活攻略，整理延世大学入学、选课、租房、签证、打工、语学堂、大学院和新村生活经验。',
      keywords: `${defaultKeywords}, 延世大学, Yonsei University`,
    }
  }

  if (pathname === '/rewards') {
    return {
      title: '留学生内容收益规则 - 问答悬赏与经验积分',
      description:
        '了解留学生首页的内容收益规则：回答悬赏问题、发布高质量经验帖、精华攻略奖励和积分机制。',
      keywords: defaultKeywords,
    }
  }

  if (pathname === '/how-it-works') {
    return {
      title: '平台如何运转 - 留学生问题解决社区与商家服务连接平台',
      description:
        '说明留学生首页如何连接提问、经验内容、学校专题、创作者积分激励、认证商家服务和未来商业收入来源。',
      keywords: defaultKeywords,
    }
  }

  if (pathname === '/categories') {
    return {
      title: '留学生问题分类 - 签证租房入学打工毕业就业',
      description:
        '按签证、租房、入学、打工、保险、银行卡、论文、毕业、就业和学校评价浏览留学生问题与经验。',
      keywords: defaultKeywords,
    }
  }

  return {
    title: '留学生首页 - 留学生经验分享与问题解决平台',
    description:
      '留学生首页是一个面向留学生的经验分享与问答社区，提供签证、租房、入学、打工、保险、银行卡、毕业和就业等真实经验，帮助留学生少走弯路。',
    keywords: defaultKeywords,
  }
}

const seoLinks = `
  <nav aria-label="SEO navigation">
    <a href="/questions">留学生问答</a>
    <a href="/posts">经验分享</a>
    <a href="/rewards">收益规则</a>
    <a href="/how-it-works">平台如何运转</a>
    <a href="/categories">分类导航</a>
    <a href="/schools/konkuk">建国大学</a>
    <a href="/schools/chungang">中央大学</a>
    <a href="/schools/korea">高丽大学</a>
    <a href="/schools/yonsei">延世大学</a>
  </nav>`

const homeSeoContent = `
  <noscript id="seo-prerender-home">
    <main>
      <h1>留学生的第一站</h1>
      <p>留学生经验分享与问题解决平台</p>
      <p>签证、租房、入学、打工、保险、银行卡、毕业、就业，真实留学生经验帮你少走弯路。</p>
      ${seoLinks}
      <section>
        <h2>热门问题</h2>
        <article><h3>韩国D-2签证延长需要哪些材料？</h3><p>韩国留学签证、外国人登录证、在学证明、住宿证明和银行材料。</p></article>
        <article><h3>韩国租房保证金怎么防止被骗？</h3><p>韩国租房、保证金、合同主体、登记簿和退租押金风险。</p></article>
        <article><h3>韩国留学生可以合法打工多少小时？</h3><p>韩国留学生打工、时间制就业许可、学期中和假期工时。</p></article>
      </section>
      <section>
        <h2>精华经验</h2>
        <article><h3>韩国留学生租房避坑指南</h3><p>保证金、管理费、合同主体、看房路线和退租时间线。</p></article>
        <article><h3>D-2签证延长完整流程</h3><p>预约、材料准备、学校证明、现场提交和补件风险。</p></article>
        <article><h3>韩国银行卡开户攻略</h3><p>外国人登录证、韩国手机号、学校证明和手机本人认证。</p></article>
      </section>
      <section>
        <h2>问题悬赏</h2>
        <p>用户发布问题时可以设置悬赏，被采纳的回答者获得积分奖励。</p>
      </section>
      <section>
        <h2>分享经验赚钱</h2>
        <p>平台奖励真实、有用、可验证的经验，不鼓励低质量灌水。</p>
      </section>
      <section>
        <h2>学校攻略</h2>
        <p>韩国留学学校入口：建国大学、中央大学、高丽大学、延世大学。</p>
        <ul>
          <li><a href="/schools/konkuk">建国大学留学生生活攻略</a></li>
          <li><a href="/schools/chungang">中央大学留学生生活攻略</a></li>
          <li><a href="/schools/korea">高丽大学留学生生活攻略</a></li>
          <li><a href="/schools/yonsei">延世大学留学生生活攻略</a></li>
        </ul>
      </section>
      <section>
        <h2>分类导航</h2>
        <p>签证/滞留资格、入学/选课/学分、语学院/本科/大学院、租房/搬家/保证金、银行卡/手机卡/保险、打工/劳动纠纷、毕业/论文/延毕、求职/实习/简历。</p>
      </section>
    </main>
  </noscript>`

const routeSeoContent = (pathname: string) => {
  if (pathname === '/questions') {
    return `
      <noscript id="seo-prerender-questions">
        <main>
          <h1>留学生问答</h1>
          <p>签证、租房、打工、入学、保险、银行卡、毕业和就业问题解答。</p>
          ${seoLinks}
          <ul>
            <li>韩国D-2签证延长需要哪些材料？</li>
            <li>韩国租房保证金怎么防止被骗？</li>
            <li>外国人登录证丢了怎么办？</li>
            <li>毕业后D-10求职签证怎么申请？</li>
          </ul>
        </main>
      </noscript>`
  }

  if (pathname === '/posts') {
    return `
      <noscript id="seo-prerender-posts">
        <main>
          <h1>留学生经验分享</h1>
          <p>韩国留学签证、租房、入学、打工、医院、论文、毕业和就业攻略。</p>
          ${seoLinks}
          <ul>
            <li>韩国留学生租房避坑指南</li>
            <li>D-2签证延长完整流程</li>
            <li>外国人登录证办理流程</li>
            <li>韩国毕业论文流程整理</li>
          </ul>
        </main>
      </noscript>`
  }

  if (pathname === '/rewards') {
    return `
      <noscript id="seo-prerender-rewards">
        <main>
          <h1>留学生内容收益规则</h1>
          <p>说明问答悬赏、经验帖奖励、精华内容积分和平台审核规则。平台奖励真实、有用、可验证的留学经验，不承诺发帖必赚钱。</p>
          ${seoLinks}
          <section>
            <h2>如何通过分享经验获得积分</h2>
            <ul>
              <li>回答悬赏问题，被提问者采纳后获得悬赏积分。</li>
              <li>发布高质量经验帖，被收藏、点赞或加精后可获得平台奖励积分。</li>
              <li>贡献签证、租房、打工、毕业等专题攻略，可参与平台奖励或合作分成。</li>
              <li>复制内容、AI水文、无效回答不会获得奖励，严重时会扣分或限制账号。</li>
            </ul>
          </section>
        </main>
      </noscript>`
  }

  if (pathname === '/categories') {
    return `
      <noscript id="seo-prerender-categories">
        <main>
          <h1>留学生问题分类</h1>
          <p>按签证、租房、入学、选课、打工、保险、银行卡、毕业、论文、就业和学校评价浏览留学生问题与经验。</p>
          ${seoLinks}
          <section>
            <h2>分类导航</h2>
            <ul>
              <li>签证/滞留资格</li>
              <li>入学/选课/学分</li>
              <li>语学院/本科/大学院</li>
              <li>租房/搬家/保证金</li>
              <li>银行卡/手机卡/保险</li>
              <li>打工/劳动纠纷</li>
              <li>毕业/论文/延毕</li>
              <li>求职/实习/简历</li>
              <li>学校评价</li>
              <li>城市生活攻略</li>
            </ul>
          </section>
        </main>
      </noscript>`
  }

  if (pathname === '/how-it-works') {
    return `
      <noscript id="seo-prerender-how-it-works">
        <main>
          <h1>平台如何运转？</h1>
          <p>留学生首页是留学生问题解决社区 + 商家服务连接平台。</p>
          ${seoLinks}
          <ol>
            <li>留学生可以提问、查攻略、浏览学校专题。</li>
            <li>创作者可以通过回答问题、发布经验帖、获得采纳和加精来积累积分。</li>
            <li>商家可以以认证商家身份提供租房、搬家、手机卡、保险、翻译、生活服务等信息。</li>
            <li>平台未来收入来源包括商家入驻、广告展示、悬赏问答服务费、会员权益、精选服务推荐。</li>
            <li>第一版只做积分激励，不承诺现金提现。</li>
          </ol>
        </main>
      </noscript>`
  }

  const schoolMatch = pathname.match(/^\/schools\/([^/]+)$/) ?? pathname.match(/^\/school\/([^/]+)$/)
  if (schoolMatch) {
    const schoolMap: Record<string, { zh: string; en: string; area: string }> = {
      konkuk: { zh: '建国大学', en: 'Konkuk University', area: '首尔广津区' },
      chungang: { zh: '中央大学', en: 'Chung-Ang University', area: '首尔黑石洞' },
      korea: { zh: '高丽大学', en: 'Korea University', area: '首尔安岩' },
      yonsei: { zh: '延世大学', en: 'Yonsei University', area: '首尔新村' },
    }
    const school = schoolMap[schoolMatch[1]] ?? { zh: '韩国大学', en: 'Korean University', area: '韩国' }
    return `
      <noscript id="seo-prerender-school">
        <main>
          <h1>${school.zh}留学生生活攻略</h1>
          <p>${school.zh} ${school.en} ${school.area} 韩国留学学校攻略，整理入学、选课、租房、签证、外国人登录证、打工、银行卡、医院、毕业和校园生活经验。</p>
          ${seoLinks}
          <section><h2>${school.zh}热门问题</h2><p>${school.zh}附近租房、语学院转本科、大学院选课、保证金风险、外国人登录证和毕业论文流程。</p></section>
          <section><h2>${school.zh}精华经验</h2><p>新生入学 checklist、周边租房避坑、生活圈介绍、银行卡开户和医院看病流程。</p></section>
        </main>
      </noscript>`
  }

  return `
    <noscript id="seo-prerender-page">
      <main>
        <h1>留学生经验分享与问题解决平台</h1>
        <p>这里是留学生问题、经验和学校攻略页面。请访问问答、经验、分类、收益规则或学校专题入口。</p>
        ${seoLinks}
      </main>
    </noscript>`
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteOrigin}/</loc></url>
  <url><loc>${siteOrigin}/questions</loc></url>
  <url><loc>${siteOrigin}/posts</loc></url>
  <url><loc>${siteOrigin}/rewards</loc></url>
  <url><loc>${siteOrigin}/how-it-works</loc></url>
  <url><loc>${siteOrigin}/categories</loc></url>
  <url><loc>${siteOrigin}/terms</loc></url>
  <url><loc>${siteOrigin}/privacy</loc></url>
  <url><loc>${siteOrigin}/minor-privacy</loc></url>
  <url><loc>${siteOrigin}/content-rules</loc></url>
  <url><loc>${siteOrigin}/schools/konkuk</loc></url>
  <url><loc>${siteOrigin}/schools/chungang</loc></url>
  <url><loc>${siteOrigin}/schools/korea</loc></url>
  <url><loc>${siteOrigin}/schools/yonsei</loc></url>
  <url><loc>${siteOrigin}/posts/korea-rent-deposit-guide</loc></url>
  <url><loc>${siteOrigin}/posts/d2-visa-extension-guide</loc></url>
  <url><loc>${siteOrigin}/posts/alien-registration-card-guide</loc></url>
  <url><loc>${siteOrigin}/posts/korea-bank-account-guide</loc></url>
  <url><loc>${siteOrigin}/posts/korea-part-time-work-guide</loc></url>
</urlset>`

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteOrigin}/sitemap.xml
`

const homepageSeoFallbackMarkers = [
  '留学生的第一站',
  '热门问题',
  '精华经验',
  '问题悬赏',
  '分享经验赚钱',
  '学校攻略',
]

const containsHomepageSeoFallback = (value: string) =>
  /seo-prerender-/i.test(value) || homepageSeoFallbackMarkers.some((marker) => value.includes(marker))

const stripLegacySeoFallbacks = (html: string) =>
  html
    .replace(/\s*<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, (block) =>
      containsHomepageSeoFallback(block) ? '' : block,
    )
    .replace(
      /\s*<(div|section|main)\b(?=[^>]*(?:id|class)=["'][^"']*(?:seo|fallback|prerender|static)[^"']*["'])[^>]*>[\s\S]*?<\/\1>/gi,
      (block) => (containsHomepageSeoFallback(block) ? '' : block),
    )

const unicodeEscapeText = (value: string) =>
  Array.from(value)
    .map((char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
    .join('')

const hideHomepageSeoTermsInInlineScripts = (html: string, pathname: string) => {
  if (pathname === '/') return html

  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (scriptBlock) =>
    homepageSeoFallbackMarkers.reduce(
      (nextBlock, marker) => nextBlock.split(marker).join(unicodeEscapeText(marker)),
      scriptBlock,
    ),
  )
}

const stripExistingSocialMeta = (html: string) =>
  html
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*\/?>/gi, '')
    .replace(/\s*<link\s+rel=["']image_src["'][^>]*\/?>/gi, '')
    .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*\/?>/gi, '')
    .replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*\/?>/gi, '')
    .replace(/\s*<meta\s+itemprop=["'](?:name|description|image)["'][^>]*\/?>/gi, '')
    .replace(/\s*<meta\s+name=["'](?:application-name|apple-mobile-web-app-title)["'][^>]*\/?>/gi, '')

const injectSeoHtml = (html: string, requestUrl: URL) => {
  const normalizedPath = requestUrl.pathname === '/' ? '/' : requestUrl.pathname.replace(/\/$/, '')
  const meta = pageMeta(normalizedPath)
  const canonicalPath = normalizedPath === '/' ? '/' : normalizedPath
  const canonicalUrl = `${siteOrigin}${canonicalPath}`
  const safeTitle = escapeHtml(meta.title)
  const safeDescription = escapeHtml(meta.description)
  const safeKeywords = escapeHtml(meta.keywords ?? defaultKeywords)
  const seoContent = normalizedPath === '/' ? homeSeoContent : routeSeoContent(normalizedPath)

  let nextHtml = stripExistingSocialMeta(stripLegacySeoFallbacks(html))
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="description" content="${safeDescription}" />`,
    )
    .replace(
      /<meta\s+name="keywords"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="keywords" content="${safeKeywords}" />`,
    )

  const socialMeta = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="售业" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${shareImageUrl}" />
    <meta property="og:image:secure_url" content="${shareImageUrl}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="600" />
    <meta property="og:image:height" content="600" />
    <meta itemprop="name" content="${safeTitle}" />
    <meta itemprop="description" content="${safeDescription}" />
    <meta itemprop="image" content="${shareImageUrl}" />
    <link rel="image_src" href="${shareImageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${shareImageUrl}" />
    <meta name="application-name" content="留学生首页" />
    <meta name="apple-mobile-web-app-title" content="留学生首页" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '留学生首页',
      url: siteOrigin,
      image: shareImageUrl,
      description: meta.description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteOrigin}/posts?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    })}</script>`

  nextHtml = nextHtml.replace('</head>', `${socialMeta}\n  </head>`)
  nextHtml = nextHtml.replace('<div id="root"></div>', `<div id="root"></div>\n    ${seoContent}`)
  return hideHomepageSeoTermsInInlineScripts(nextHtml, normalizedPath)
}

const serveHtmlWithSeo = async (request: Request, env: Env, requestUrl: URL, assetPath = requestUrl.pathname) => {
  const assetUrl = new URL(assetPath, request.url)
  const response = await env.ASSETS.fetch(new Request(assetUrl, request))
  if (!response.ok) return response
  const html = await response.text()
  return new Response(injectSeoHtml(html, requestUrl), {
    headers: {
      'cache-control': 'no-store, max-age=0',
      'content-type': 'text/html; charset=utf-8',
      'x-shouye-build': 'mobile-app-shell-2026-05-05',
    },
  })
}

const createId = (prefix: string) => `${prefix}-${Date.now()}-${crypto.randomUUID()}`

const hashText = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const emailCodeHash = (email: string, code: string) => hashText(`${email}:${code}`)

const rowToUser = (row: Record<string, unknown>, documents: CredentialDocument[] = []): UserRecord => ({
  id: String(row.id),
  name: String(row.name),
  email: String(row.email),
  identity: String(row.identity),
  school: String(row.school),
  points: Number(row.points),
  earningPoints: Number(row.earning_points ?? 0),
  joinedAt: String(row.joined_at),
  status: String(row.status) as UserStatus,
  verificationStatus: String(row.verification_status) as VerificationStatus,
  avatarUrl: String(row.avatar_url ?? ''),
  bio: String(row.bio ?? ''),
  documents,
})

const rowToPost = (row: Record<string, unknown>): PostRecord => ({
  id: String(row.id),
  title: String(row.title),
  school: String(row.school),
  category: String(row.category),
  author: String(row.author),
  authorId: row.author_id ? String(row.author_id) : undefined,
  price: Number(row.price),
  hot: String(row.hot),
  excerpt: String(row.excerpt),
  body: String(row.body),
  createdAt: String(row.created_at),
  featured: Boolean(row.featured),
})

const rowToDocument = (row: Record<string, unknown>): CredentialDocument => ({
  id: String(row.id),
  name: String(row.name),
  type: String(row.type),
  status: String(row.status) as VerificationStatus,
  uploadedAt: String(row.uploaded_at),
})

const rowToPartnerApplication = (row: Record<string, unknown>): PartnerApplicationRecord => ({
  id: String(row.id),
  company: String(row.company),
  type: String(row.type),
  contact: String(row.contact),
  phone: String(row.phone),
  direction: String(row.direction),
  budget: String(row.budget ?? ''),
  detail: String(row.detail ?? ''),
  status: String(row.status) as PartnerApplicationRecord['status'],
  createdAt: String(row.created_at),
})

const rowToMerchantLead = (row: Record<string, unknown>): MerchantLeadRecord => ({
  id: String(row.id),
  merchantId: String(row.merchant_id),
  merchantTitle: String(row.merchant_title),
  merchantType: String(row.merchant_type),
  userId: row.user_id ? String(row.user_id) : undefined,
  userName: String(row.user_name),
  userContact: String(row.user_contact ?? ''),
  note: String(row.note),
  assignedTo: String(row.assigned_to ?? ''),
  adminNote: String(row.admin_note ?? ''),
  status: String(row.status ?? 'pending') as MerchantLeadRecord['status'],
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at ?? row.created_at),
})

const rowToQuestionBounty = (row: Record<string, unknown>): QuestionBountyRecord => ({
  questionId: String(row.question_id),
  askerUserId: row.asker_user_id ? String(row.asker_user_id) : undefined,
  answerId: row.answer_id ? String(row.answer_id) : undefined,
  answererUserId: row.answerer_user_id ? String(row.answerer_user_id) : undefined,
  rewardPoints: Number(row.reward_points ?? 0),
  status: String(row.status ?? 'held') as QuestionBountyRecord['status'],
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at ?? row.created_at),
  settledAt: row.settled_at ? String(row.settled_at) : undefined,
})

const rowToQuestionDispute = (row: Record<string, unknown>): QuestionDisputeRecord => ({
  id: String(row.id),
  questionId: String(row.question_id),
  answerId: row.answer_id ? String(row.answer_id) : undefined,
  reporterUserId: row.reporter_user_id ? String(row.reporter_user_id) : undefined,
  type: String(row.type ?? 'appeal') as QuestionDisputeRecord['type'],
  reason: String(row.reason),
  detail: String(row.detail ?? ''),
  status: String(row.status ?? 'pending') as QuestionDisputeRecord['status'],
  adminNote: String(row.admin_note ?? ''),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at ?? row.created_at),
})

const rowToPointOrder = (row: Record<string, unknown>): PointOrderRecord => ({
  id: String(row.id),
  userId: String(row.user_id),
  userName: String(row.user_name ?? ''),
  type: String(row.type ?? 'recharge') as PointOrderRecord['type'],
  amountYuan: Number(row.amount_yuan ?? 0),
  points: Number(row.points ?? 0),
  status: String(row.status ?? 'pending') as PointOrderRecord['status'],
  channel: String(row.channel ?? 'manual') as PointOrderRecord['channel'],
  outTradeNo: String(row.out_trade_no ?? ''),
  adminNote: String(row.admin_note ?? ''),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at ?? row.created_at),
  paidAt: row.paid_at ? String(row.paid_at) : undefined,
})

const rowToWithdrawalRequest = (row: Record<string, unknown>): WithdrawalRequestRecord => ({
  id: String(row.id),
  userId: String(row.user_id),
  userName: String(row.user_name ?? ''),
  earningPoints: Number(row.earning_points ?? 0),
  amountYuan: Number(row.amount_yuan ?? 0),
  payoutMethod: String(row.payout_method ?? ''),
  accountLabel: String(row.account_label ?? ''),
  status: String(row.status ?? 'pending') as WithdrawalRequestRecord['status'],
  adminNote: String(row.admin_note ?? ''),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at ?? row.created_at),
  paidAt: row.paid_at ? String(row.paid_at) : undefined,
})

const rowToPointLedger = (row: Record<string, unknown>): PointLedgerRecord => ({
  id: String(row.id),
  userId: String(row.user_id),
  direction: String(row.direction ?? 'credit') as PointLedgerRecord['direction'],
  accountType: String(row.account_type ?? 'points') as PointLedgerRecord['accountType'],
  points: Number(row.points ?? 0),
  category: String(row.category ?? ''),
  refType: String(row.ref_type ?? ''),
  refId: String(row.ref_id ?? ''),
  note: String(row.note ?? ''),
  createdAt: String(row.created_at),
})

const rowToContentReport = (row: Record<string, unknown>): ContentReportRecord => ({
  id: String(row.id),
  contentType: String(row.content_type),
  contentId: String(row.content_id),
  reason: String(row.reason),
  description: String(row.description ?? ''),
  reporterUserId: row.reporter_user_id ? String(row.reporter_user_id) : undefined,
  reporterContact: String(row.reporter_contact ?? ''),
  status: String(row.status ?? 'pending') as ContentReportRecord['status'],
  adminNote: String(row.admin_note ?? ''),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at ?? row.created_at),
})

const parseTags = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  try {
    const parsed = JSON.parse(String(value || '[]')) as unknown
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
  } catch {
    return String(value || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
}

const rowToQuestion = (row: Record<string, unknown>): CommunityQuestionRecord => ({
  id: String(row.id),
  title: String(row.title),
  category: String(row.category),
  country: String(row.country ?? '韩国'),
  city: String(row.city ?? ''),
  school: String(row.school ?? '韩国留学'),
  rewardPoints: Number(row.reward_points ?? 0),
  answersCount: Number(row.answers_count ?? 0),
  views: Number(row.views ?? 0),
  status: String(row.status ?? 'open') as QuestionStatus,
  createdAt: String(row.created_at),
  author: String(row.author),
  authorId: row.author_id ? String(row.author_id) : undefined,
  identity: String(row.identity ?? ''),
  tags: parseTags(row.tags),
  detail: String(row.detail),
})

const rowToAnswer = (row: Record<string, unknown>): QuestionAnswerRecord => ({
  id: String(row.id),
  questionId: String(row.question_id),
  author: String(row.author),
  authorId: row.author_id ? String(row.author_id) : undefined,
  identity: String(row.identity ?? ''),
  content: String(row.content),
  likes: Number(row.likes ?? 0),
  accepted: Boolean(row.accepted),
  createdAt: String(row.created_at),
})

const readBody = async <T>(request: Request) => {
  try {
    return (await request.json()) as Partial<T>
  } catch {
    return {} as Partial<T>
  }
}

const ensureColumn = async (env: Env, tableName: string, columnName: string, definition: string) => {
  if (!env.DB) return
  const info = await env.DB.prepare(`PRAGMA table_info(${tableName})`).all<{ name: string }>()
  const exists = (info.results ?? []).some((column) => column.name === columnName)
  if (!exists) await env.DB.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`).run()
}

const hashShort = async (value: string) => (await hashText(value)).slice(0, 32)

const getRequestActorKey = async (request: Request, userId?: string, fallback?: string) => {
  if (userId) return `user:${userId}`
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown-ip'
  const raw = `${ip}:${fallback || request.headers.get('user-agent') || 'anonymous'}`
  return `anon:${await hashShort(raw)}`
}

const getRequestDeviceKey = async (request: Request) => {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown-ip'
  return `device:${await hashShort(`${ip}:${request.headers.get('user-agent') || ''}`)}`
}

const ensureRiskTables = async (env: Env) => {
  if (!env.DB) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS rate_limit_events (
      id TEXT PRIMARY KEY,
      actor_key TEXT NOT NULL,
      action TEXT NOT NULL,
      content_hash TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_rate_limit_events_actor_action ON rate_limit_events(actor_key, action, created_at)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_rate_limit_events_content ON rate_limit_events(actor_key, action, content_hash, created_at)').run()
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS content_reactions (
      id TEXT PRIMARY KEY,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      actor_key TEXT NOT NULL,
      user_id TEXT,
      created_at TEXT NOT NULL
    )`,
  ).run()
  await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_content_reactions_unique ON content_reactions(content_type, content_id, actor_key)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_content_reactions_content ON content_reactions(content_type, content_id)').run()
}

const enforceRateLimit = async (
  env: Env,
  input: { actorKey: string; action: string; maxCount: number; windowSeconds: number; content?: string; duplicateWindowSeconds?: number },
) => {
  if (!env.DB) return null
  await ensureRiskTables(env)
  const now = new Date()
  const cutoff = new Date(now.getTime() - input.windowSeconds * 1000).toISOString()
  await env.DB.prepare('DELETE FROM rate_limit_events WHERE created_at < ?')
    .bind(new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString())
    .run()
  const countRow = await env.DB.prepare(
    'SELECT COUNT(*) AS count FROM rate_limit_events WHERE actor_key = ? AND action = ? AND created_at >= ?',
  )
    .bind(input.actorKey, input.action, cutoff)
    .first<{ count: number }>()
  if (Number(countRow?.count ?? 0) >= input.maxCount) {
    return `操作太频繁，请稍后再试。`
  }

  const contentHash = input.content ? await hashShort(input.content.trim().replace(/\s+/g, ' ').toLowerCase()) : ''
  if (contentHash && input.duplicateWindowSeconds) {
    const duplicateCutoff = new Date(now.getTime() - input.duplicateWindowSeconds * 1000).toISOString()
    const duplicate = await env.DB.prepare(
      'SELECT id FROM rate_limit_events WHERE actor_key = ? AND action = ? AND content_hash = ? AND created_at >= ? LIMIT 1',
    )
      .bind(input.actorKey, input.action, contentHash, duplicateCutoff)
      .first()
    if (duplicate) return '检测到重复提交，请修改内容或稍后再试。'
  }

  await env.DB.prepare('INSERT INTO rate_limit_events (id, actor_key, action, content_hash, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(createId('risk'), input.actorKey, input.action, contentHash, now.toISOString())
    .run()
  return null
}

const complianceSensitiveRules = [
  { terms: ['私人换汇', '私下换汇', '换钱广告', '换米广告', '帮换钱', '帮换米', '代换汇'], reason: '平台禁止发布换钱/换米撮合、广告或帮助信息。' },
  { terms: ['代写论文', '代写作业', '代考', '替考', '替课', '买答案'], reason: '平台禁止代写、代考、替课和作弊类服务。' },
  { terms: ['假材料', '假证明', '伪造成绩单', '伪造offer', '伪造在学证明'], reason: '平台禁止伪造或买卖材料。' },
  { terms: ['裸聊', '约炮', '陪睡', '卖淫', '嫖娼'], reason: '平台禁止色情交易和相关引流。' },
  { terms: ['洗钱', '跑分', '银行卡出租', '银行卡出借', '收黑款'], reason: '平台禁止金融违法风险内容。' },
]

const findComplianceViolation = (values: unknown[]) => {
  const text = values
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value).toLowerCase())
    .join('\n')

  for (const rule of complianceSensitiveRules) {
    const matchedTerms = rule.terms.filter((term) => text.includes(term.toLowerCase()))
    if (matchedTerms.length) return { reason: rule.reason, matchedTerms }
  }

  return null
}

const ensureComplianceTables = async (env: Env) => {
  if (!env.DB) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS content_reports (
      id TEXT PRIMARY KEY,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      reporter_user_id TEXT,
      reporter_contact TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      admin_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run()
  await env.DB.prepare(
    'CREATE INDEX IF NOT EXISTS idx_content_reports_status_created_at ON content_reports(status, created_at DESC)',
  ).run()
  await env.DB.prepare(
    'CREATE INDEX IF NOT EXISTS idx_content_reports_content ON content_reports(content_type, content_id)',
  ).run()
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS moderation_events (
      id TEXT PRIMARY KEY,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL DEFAULT '',
      user_id TEXT,
      action TEXT NOT NULL,
      reason TEXT NOT NULL,
      matched_terms TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_moderation_events_created_at ON moderation_events(created_at DESC)').run()
}

const recordModerationEvent = async (
  env: Env,
  input: { contentType: string; contentId?: string; userId?: string; action: string; reason: string; matchedTerms?: string[] },
) => {
  if (!env.DB) return
  await ensureComplianceTables(env)
  await env.DB.prepare(
    `INSERT INTO moderation_events (id, content_type, content_id, user_id, action, reason, matched_terms, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      createId('mod'),
      input.contentType,
      input.contentId ?? '',
      input.userId ?? null,
      input.action,
      input.reason,
      JSON.stringify(input.matchedTerms ?? []),
      new Date().toISOString(),
    )
    .run()
}

const requireAdmin = async (request: Request, env: Env) => {
  if (!env.DB) return false
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return false

  const session = await env.DB.prepare('SELECT token FROM admin_sessions WHERE token = ? AND expires_at > ?')
    .bind(token, new Date().toISOString())
    .first()

  return Boolean(session)
}

const getAllUsers = async (env: Env) => {
  if (!env.DB) return []
  const userRows = await env.DB.prepare('SELECT * FROM users ORDER BY joined_at DESC').all<Record<string, unknown>>()
  const documentRows = await env.DB.prepare('SELECT * FROM user_documents ORDER BY uploaded_at DESC').all<
    Record<string, unknown>
  >()
  const documentsByUser = new Map<string, CredentialDocument[]>()

  for (const row of documentRows.results ?? []) {
    const userId = String(row.user_id)
    documentsByUser.set(userId, [...(documentsByUser.get(userId) ?? []), rowToDocument(row)])
  }

  return (userRows.results ?? []).map((row) => rowToUser(row, documentsByUser.get(String(row.id)) ?? []))
}

const getAllPosts = async (env: Env) => {
  if (!env.DB) return []
  const rows = await env.DB.prepare('SELECT * FROM posts ORDER BY created_at DESC').all<Record<string, unknown>>()
  return (rows.results ?? []).map(rowToPost)
}

const ensureQuestionTables = async (env: Env) => {
  if (!env.DB) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS community_questions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT '韩国',
      city TEXT NOT NULL DEFAULT '',
      school TEXT NOT NULL DEFAULT '韩国留学',
      reward_points INTEGER NOT NULL DEFAULT 0,
      answers_count INTEGER NOT NULL DEFAULT 0,
      views INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL,
      author TEXT NOT NULL,
      author_id TEXT,
      identity TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      detail TEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
  ).run()
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS question_answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      author TEXT NOT NULL,
      author_id TEXT,
      identity TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      accepted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES community_questions(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
  ).run()
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS question_bounties (
      question_id TEXT PRIMARY KEY,
      asker_user_id TEXT,
      answer_id TEXT,
      answerer_user_id TEXT,
      reward_points INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'held',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      settled_at TEXT,
      FOREIGN KEY (question_id) REFERENCES community_questions(id) ON DELETE CASCADE,
      FOREIGN KEY (asker_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (answer_id) REFERENCES question_answers(id) ON DELETE SET NULL,
      FOREIGN KEY (answerer_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
  ).run()
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS question_disputes (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      answer_id TEXT,
      reporter_user_id TEXT,
      type TEXT NOT NULL DEFAULT 'appeal',
      reason TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      admin_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES community_questions(id) ON DELETE CASCADE,
      FOREIGN KEY (answer_id) REFERENCES question_answers(id) ON DELETE SET NULL,
      FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_community_questions_created_at ON community_questions(created_at DESC)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_community_questions_category_status ON community_questions(category, status)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id, created_at DESC)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_question_bounties_status ON question_bounties(status, updated_at DESC)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_question_disputes_status ON question_disputes(status, created_at DESC)').run()
}

const getAllQuestions = async (env: Env) => {
  if (!env.DB) return { questions: [], answers: [] }
  await ensureQuestionTables(env)
  const questionRows = await env.DB.prepare('SELECT * FROM community_questions ORDER BY created_at DESC').all<
    Record<string, unknown>
  >()
  const answerRows = await env.DB.prepare('SELECT * FROM question_answers ORDER BY accepted DESC, likes DESC, created_at DESC').all<
    Record<string, unknown>
  >()

  return {
    questions: (questionRows.results ?? []).map(rowToQuestion),
    answers: (answerRows.results ?? []).map(rowToAnswer),
  }
}

const getQuestionDisputes = async (env: Env) => {
  if (!env.DB) return []
  await ensureQuestionTables(env)
  const rows = await env.DB.prepare('SELECT * FROM question_disputes ORDER BY created_at DESC').all<Record<string, unknown>>()
  return (rows.results ?? []).map(rowToQuestionDispute)
}

const getQuestionBounties = async (env: Env) => {
  if (!env.DB) return []
  await ensureQuestionTables(env)
  const rows = await env.DB.prepare('SELECT * FROM question_bounties ORDER BY updated_at DESC').all<Record<string, unknown>>()
  return (rows.results ?? []).map(rowToQuestionBounty)
}

const getQuestionDetail = async (env: Env, questionId: string) => {
  if (!env.DB) return null
  await ensureQuestionTables(env)
  await env.DB.prepare('UPDATE community_questions SET views = views + 1 WHERE id = ?').bind(questionId).run()
  const questionRow = await env.DB.prepare('SELECT * FROM community_questions WHERE id = ?')
    .bind(questionId)
    .first<Record<string, unknown>>()
  if (!questionRow) return null
  const answerRows = await env.DB.prepare(
    'SELECT * FROM question_answers WHERE question_id = ? ORDER BY accepted DESC, likes DESC, created_at DESC',
  )
    .bind(questionId)
    .all<Record<string, unknown>>()
  const bountyRow = await env.DB.prepare('SELECT * FROM question_bounties WHERE question_id = ?')
    .bind(questionId)
    .first<Record<string, unknown>>()

  return {
    question: rowToQuestion(questionRow),
    answers: (answerRows.results ?? []).map(rowToAnswer),
    bounty: bountyRow ? rowToQuestionBounty(bountyRow) : null,
  }
}

const getPartnerApplications = async (env: Env) => {
  if (!env.DB) return []
  const rows = await env.DB.prepare('SELECT * FROM partner_applications ORDER BY created_at DESC').all<
    Record<string, unknown>
  >()
  return (rows.results ?? []).map(rowToPartnerApplication)
}

const ensureMerchantLeadTables = async (env: Env) => {
  if (!env.DB) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS merchant_leads (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL DEFAULT '',
      merchant_title TEXT NOT NULL,
      merchant_type TEXT NOT NULL DEFAULT '',
      user_id TEXT,
      user_name TEXT NOT NULL DEFAULT '',
      user_contact TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      assigned_to TEXT NOT NULL DEFAULT '',
      admin_note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
  ).run()
  await ensureColumn(env, 'merchant_leads', 'assigned_to', "assigned_to TEXT NOT NULL DEFAULT ''")
  await ensureColumn(env, 'merchant_leads', 'admin_note', "admin_note TEXT NOT NULL DEFAULT ''")
  await ensureColumn(env, 'merchant_leads', 'updated_at', "updated_at TEXT NOT NULL DEFAULT ''")
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_merchant_leads_created_at ON merchant_leads(created_at DESC)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_merchant_leads_status ON merchant_leads(status, created_at DESC)').run()
}

const getMerchantLeads = async (env: Env) => {
  if (!env.DB) return []
  await ensureMerchantLeadTables(env)
  const rows = await env.DB.prepare('SELECT * FROM merchant_leads ORDER BY created_at DESC').all<Record<string, unknown>>()
  return (rows.results ?? []).map(rowToMerchantLead)
}

const ensureWalletTables = async (env: Env) => {
  if (!env.DB) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS point_orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'recharge',
      amount_yuan INTEGER NOT NULL DEFAULT 0,
      points INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      channel TEXT NOT NULL DEFAULT 'manual',
      out_trade_no TEXT NOT NULL DEFAULT '',
      admin_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      paid_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_point_orders_user ON point_orders(user_id, created_at DESC)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_point_orders_status ON point_orders(status, created_at DESC)').run()

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT '',
      earning_points INTEGER NOT NULL DEFAULT 0,
      amount_yuan INTEGER NOT NULL DEFAULT 0,
      payout_method TEXT NOT NULL DEFAULT '',
      account_label TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      admin_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      paid_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(user_id, created_at DESC)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status, created_at DESC)').run()

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS point_ledger (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      direction TEXT NOT NULL,
      account_type TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      ref_type TEXT NOT NULL DEFAULT '',
      ref_id TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_point_ledger_user ON point_ledger(user_id, created_at DESC)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_point_ledger_ref ON point_ledger(ref_type, ref_id)').run()
}

const insertPointLedger = async (
  env: Env,
  input: {
    userId: string
    direction: PointLedgerRecord['direction']
    accountType: PointLedgerRecord['accountType']
    points: number
    category: string
    refType?: string
    refId?: string
    note?: string
  },
) => {
  if (!env.DB) return
  await ensureWalletTables(env)
  await env.DB.prepare(
    `INSERT INTO point_ledger
      (id, user_id, direction, account_type, points, category, ref_type, ref_id, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      createId('ledger'),
      input.userId,
      input.direction,
      input.accountType,
      input.points,
      input.category,
      input.refType ?? '',
      input.refId ?? '',
      input.note ?? '',
      new Date().toISOString(),
    )
    .run()
}

const getPointOrders = async (env: Env) => {
  if (!env.DB) return []
  await ensureWalletTables(env)
  const rows = await env.DB.prepare('SELECT * FROM point_orders ORDER BY created_at DESC').all<Record<string, unknown>>()
  return (rows.results ?? []).map(rowToPointOrder)
}

const getWithdrawalRequests = async (env: Env) => {
  if (!env.DB) return []
  await ensureWalletTables(env)
  const rows = await env.DB.prepare('SELECT * FROM withdrawal_requests ORDER BY created_at DESC').all<Record<string, unknown>>()
  return (rows.results ?? []).map(rowToWithdrawalRequest)
}

const getPointLedger = async (env: Env) => {
  if (!env.DB) return []
  await ensureWalletTables(env)
  const rows = await env.DB.prepare('SELECT * FROM point_ledger ORDER BY created_at DESC LIMIT 300').all<Record<string, unknown>>()
  return (rows.results ?? []).map(rowToPointLedger)
}

const getContentReports = async (env: Env) => {
  if (!env.DB) return []
  await ensureComplianceTables(env)
  const rows = await env.DB.prepare('SELECT * FROM content_reports ORDER BY created_at DESC').all<Record<string, unknown>>()
  return (rows.results ?? []).map(rowToContentReport)
}

const ensureSiteSettingsTable = async (env: Env) => {
  if (!env.DB) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run()
}

const getSiteContent = async (env: Env) => {
  if (!env.DB) return defaultSiteContent
  try {
    await ensureSiteSettingsTable(env)
    const row = await env.DB.prepare('SELECT value FROM site_settings WHERE key = ?').bind('site_content').first<{
      value: string
    }>()
    if (!row?.value) return defaultSiteContent
    return normalizeSiteContent(JSON.parse(row.value) as Partial<SiteContentSettings>)
  } catch {
    return defaultSiteContent
  }
}

const saveSiteContent = async (env: Env, siteContent: Partial<SiteContentSettings>) => {
  if (!env.DB) return defaultSiteContent
  await ensureSiteSettingsTable(env)
  const nextContent = normalizeSiteContent(siteContent)
  await env.DB.prepare(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  )
    .bind('site_content', JSON.stringify(nextContent), new Date().toISOString())
    .run()
  return nextContent
}

const ensureEmailVerificationTables = async (env: Env) => {
  if (!env.DB) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS email_verifications (
      email TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
  ).run()
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS email_verification_logs (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_email_verification_logs_email_created ON email_verification_logs(email, created_at)').run()
}

const ensureWechatMiniappTables = async (env: Env) => {
  if (!env.DB) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS wechat_miniapp_users (
      openid TEXT PRIMARY KEY,
      unionid TEXT NOT NULL DEFAULT '',
      user_id TEXT NOT NULL,
      session_key TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wechat_miniapp_users_user_id ON wechat_miniapp_users(user_id)').run()
}

const sendVerificationEmail = async (env: Env, email: string, code: string) => {
  const provider = (env.EMAIL_PROVIDER || (env.RESEND_API_KEY ? 'resend' : '')).toLowerCase()
  const from = env.MAIL_FROM || '留学生经验分享与问题解决平台 <noreply@shouye.fun>'
  const subject = '留学生经验分享与问题解决平台验证码'
  const html = `<p>你的平台注册验证码是：</p><h2>${code}</h2><p>验证码 10 分钟内有效。如果不是你本人操作，请忽略这封邮件。</p>`

  if (provider === 'resend' && env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
      }),
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      return { ok: false, error: '验证码邮件发送失败，请检查发件域名和邮件服务配置。' }
    }

    return { ok: true }
  }

  if (provider === 'sendgrid' && env.SENDGRID_API_KEY) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: from.match(/<([^>]+)>/)?.[1] ?? from, name: from.includes('<') ? from.split('<')[0].trim() : undefined },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
      headers: {
        authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) return { ok: false, error: '验证码邮件发送失败，请检查 SendGrid 配置。' }
    return { ok: true }
  }

  if (provider === 'mailgun' && env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
    const form = new URLSearchParams()
    form.set('from', from)
    form.set('to', email)
    form.set('subject', subject)
    form.set('html', html)
    const response = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
      body: form,
      headers: { authorization: `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}` },
      method: 'POST',
    })
    if (!response.ok) return { ok: false, error: '验证码邮件发送失败，请检查 Mailgun 配置。' }
    return { ok: true }
  }

  return { ok: false, error: '邮件发送配置缺失，请联系管理员配置 RESEND_API_KEY、SendGrid 或 Mailgun。' }
}

const handleSendVerificationCode = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureEmailVerificationTables(env)
  const body = await readBody<{ email: string }>(request)
  const email = body.email?.trim().toLowerCase()

  if (!email) return json({ error: '请先填写邮箱。' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: '邮箱格式不正确。' }, { status: 400 })

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return json({ error: '这个邮箱已经注册过了，可以直接登录。' }, { status: 409 })

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 1000 * 60 * 60).toISOString()
  await env.DB.prepare('DELETE FROM email_verification_logs WHERE created_at < ?').bind(oneHourAgo).run()
  await env.DB.prepare('DELETE FROM email_verifications WHERE expires_at < ?').bind(now.toISOString()).run()

  const currentCode = await env.DB.prepare('SELECT created_at FROM email_verifications WHERE email = ?')
    .bind(email)
    .first<{ created_at: string }>()
  if (currentCode?.created_at && now.getTime() - new Date(currentCode.created_at).getTime() < 1000 * 60) {
    return json({ error: '验证码发送太频繁，请 60 秒后再试。' }, { status: 429 })
  }

  const recentCount = await env.DB.prepare(
    'SELECT COUNT(*) AS count FROM email_verification_logs WHERE email = ? AND created_at >= ?',
  )
    .bind(email, oneHourAgo)
    .first<{ count: number }>()
  if (Number(recentCount?.count ?? 0) >= 5) {
    return json({ error: '这个邮箱 1 小时内验证码发送次数已达上限，请稍后再试。' }, { status: 429 })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 10)
  const sent = await sendVerificationEmail(env, email, code)

  if (!sent.ok) return json({ error: sent.error }, { status: 503 })

  await env.DB.prepare(
    `INSERT OR REPLACE INTO email_verifications (email, code_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(email, await emailCodeHash(email, code), expiresAt.toISOString(), now.toISOString())
    .run()
  await env.DB.prepare('INSERT INTO email_verification_logs (id, email, created_at) VALUES (?, ?, ?)')
    .bind(createId('email-code'), email, now.toISOString())
    .run()

  return json({ success: true, message: '验证码已发送，请检查邮箱' })
}

const verifyEmailCode = async (env: Env, email: string, code: string) => {
  if (!env.DB) return false
  await ensureEmailVerificationTables(env)
  if (!/^\d{6}$/.test(code)) return false
  const row = await env.DB.prepare('SELECT * FROM email_verifications WHERE email = ?').bind(email).first<
    Record<string, unknown>
  >()
  if (!row) return false
  if (String(row.expires_at) < new Date().toISOString()) return false
  return String(row.code_hash) === (await emailCodeHash(email, code))
}

const handleRegister = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<{
    userType: 'student' | 'merchant'
    studentStage?: string
    nickname?: string
    businessName?: string
    businessCategory?: string
    country?: string
    city?: string
    name: string
    email: string
    password: string
    confirmPassword: string
    emailCode: string
    identity: string
    school: string
    avatarUrl: string
    bio: string
    documents: CredentialDocument[]
  }>(request)
  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const confirmPassword = body.confirmPassword ?? ''
  const userType = body.userType === 'merchant' ? 'merchant' : 'student'
  const validStudentStages = new Set(['preparing', 'admitted', 'language_school', 'undergraduate', 'graduate', 'graduated'])
  const studentStageLabels: Record<string, string> = {
    preparing: '准备申请',
    admitted: '已录取待入学',
    language_school: '语学院',
    undergraduate: '本科',
    graduate: '大学院',
    graduated: '已毕业',
  }

  if (!email || !password) return json({ error: '邮箱和密码不能为空。' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: '邮箱格式不正确。' }, { status: 400 })
  if (password.length < 6) return json({ error: '密码至少需要 6 位。' }, { status: 400 })
  if (password !== confirmPassword) return json({ error: '两次输入的密码不一致。' }, { status: 400 })
  if (userType === 'student' && (!body.studentStage || !validStudentStages.has(body.studentStage))) {
    return json({ error: '请选择学生阶段。' }, { status: 400 })
  }
  if (userType === 'merchant' && (!body.businessName?.trim() || !body.businessCategory?.trim())) {
    return json({ error: '请填写商家/机构名称和服务类型。' }, { status: 400 })
  }
  if (userType === 'merchant' && (!body.country?.trim() || !body.city?.trim())) {
    return json({ error: '请填写商家所在国家和城市。' }, { status: 400 })
  }
  if (!(await verifyEmailCode(env, email, body.emailCode ?? ''))) {
    return json({ error: '邮箱验证码不正确或已过期。' }, { status: 400 })
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return json({ error: '这个邮箱已经注册过了。' }, { status: 409 })

  const userId = createId('user')
  const joinedAt = new Date().toISOString()
  const displayName =
    userType === 'merchant'
      ? body.businessName?.trim() || '商家用户'
      : body.nickname?.trim() || body.name?.trim() || '韩国留学用户'
  const identity =
    userType === 'merchant'
      ? `商家 · ${body.businessCategory?.trim()}`
      : studentStageLabels[body.studentStage ?? 'preparing']
  const school =
    userType === 'merchant'
      ? `${body.country?.trim()} · ${body.city?.trim()}`
      : body.school?.trim() || '暂未填写'
  const bio =
    userType === 'merchant'
      ? JSON.stringify({
          userType,
          businessName: displayName,
          businessCategory: body.businessCategory?.trim(),
          country: body.country?.trim(),
          city: body.city?.trim(),
        })
      : body.bio?.trim() || ''

  await env.DB.prepare(
    `INSERT INTO users
      (id, name, email, password_hash, identity, school, points, earning_points, joined_at, status, verification_status, avatar_url, bio)
      VALUES (?, ?, ?, ?, ?, ?, 30, 0, ?, 'active', 'pending', ?, ?)`,
  )
    .bind(
      userId,
      displayName,
      email,
      await hashText(password),
      identity,
      school,
      joinedAt,
      body.avatarUrl?.trim() || '',
      bio,
    )
    .run()

  const user = rowToUser(
    {
      id: userId,
      name: displayName,
      email,
      identity,
      school,
      points: 30,
      earning_points: 0,
      joined_at: joinedAt,
      status: 'active',
      verification_status: 'pending',
      avatar_url: body.avatarUrl?.trim() || '',
      bio,
    },
    [],
  )

  await env.DB.prepare('DELETE FROM email_verifications WHERE email = ?').bind(email).run()

  return json({ user })
}

const handleLogin = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<{ email: string; password: string }>(request)
  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const row = email
    ? await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<Record<string, unknown>>()
    : null

  if (!row || String(row.password_hash) !== (await hashText(password))) {
    return json({ error: '没有找到这个账号，或密码不正确。' }, { status: 401 })
  }

  if (row.status === 'banned') {
    return json({ error: '这个账号已被封号，请联系平台管理员。' }, { status: 403 })
  }

  const documents = await env.DB.prepare('SELECT * FROM user_documents WHERE user_id = ? ORDER BY uploaded_at DESC')
    .bind(row.id)
    .all<Record<string, unknown>>()

  return json({ user: rowToUser(row, (documents.results ?? []).map(rowToDocument)) })
}

const exchangeWechatMiniappCode = async (env: Env, code: string) => {
  if (!env.WECHAT_MINIAPP_APP_ID || !env.WECHAT_MINIAPP_APP_SECRET) {
    return { error: '微信小程序登录服务还未配置 AppID/AppSecret。' }
  }

  const params = new URLSearchParams({
    appid: env.WECHAT_MINIAPP_APP_ID,
    secret: env.WECHAT_MINIAPP_APP_SECRET,
    js_code: code,
    grant_type: 'authorization_code',
  })
  const response = await fetch(`https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`)
  if (!response.ok) return { error: '微信登录服务暂时不可用。' }
  const data = (await response.json()) as {
    openid?: string
    unionid?: string
    session_key?: string
    errcode?: number
    errmsg?: string
  }
  if (!data.openid) return { error: data.errmsg || '微信登录校验失败。' }
  return {
    openid: data.openid,
    unionid: data.unionid || '',
    sessionKey: data.session_key || '',
  }
}

const handleWechatMiniappLogin = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureWechatMiniappTables(env)
  const body = await readBody<{ code: string; nickname: string; avatarUrl: string }>(request)
  const code = body.code?.trim()
  if (!code) return json({ error: '缺少微信登录凭证。' }, { status: 400 })

  const session = await exchangeWechatMiniappCode(env, code)
  if ('error' in session) return json({ error: session.error }, { status: 503 })

  const now = new Date().toISOString()
  const mapping = await env.DB.prepare('SELECT * FROM wechat_miniapp_users WHERE openid = ?')
    .bind(session.openid)
    .first<Record<string, unknown>>()

  let userRow = mapping?.user_id
    ? await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(String(mapping.user_id)).first<Record<string, unknown>>()
    : null

  const nickname = body.nickname?.trim() || '微信用户'
  const avatarUrl = body.avatarUrl?.trim() || ''

  if (!userRow) {
    const userId = createId('user')
    const emailHash = (await hashText(session.openid)).slice(0, 24)
    await env.DB.prepare(
      `INSERT INTO users
        (id, name, email, password_hash, identity, school, points, earning_points, joined_at, status, verification_status, avatar_url, bio)
        VALUES (?, ?, ?, '', '学生', '韩国留学', 30, 0, ?, 'active', 'pending', ?, ?)`,
    )
      .bind(userId, nickname, `wechat-${emailHash}@miniapp.shouye.local`, now, avatarUrl, '微信小程序用户')
      .run()
    userRow = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<Record<string, unknown>>()
  } else {
    await env.DB.prepare(
      `UPDATE users SET
        name = CASE WHEN name = '微信用户' OR name = '' THEN ? ELSE name END,
        avatar_url = CASE WHEN ? != '' THEN ? ELSE avatar_url END
       WHERE id = ?`,
    )
      .bind(nickname, avatarUrl, avatarUrl, String(userRow.id))
      .run()
    userRow = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(String(userRow.id)).first<Record<string, unknown>>()
  }

  if (!userRow) return json({ error: '微信账号创建失败，请稍后再试。' }, { status: 500 })
  if (userRow.status === 'banned') return json({ error: '这个账号已被封号，请联系平台管理员。' }, { status: 403 })

  await env.DB.prepare(
    `INSERT INTO wechat_miniapp_users (openid, unionid, user_id, session_key, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(openid) DO UPDATE SET
       unionid = excluded.unionid,
       user_id = excluded.user_id,
       session_key = excluded.session_key,
       updated_at = excluded.updated_at`,
  )
    .bind(session.openid, session.unionid, String(userRow.id), session.sessionKey, now, now)
    .run()

  const documents = await env.DB.prepare('SELECT * FROM user_documents WHERE user_id = ? ORDER BY uploaded_at DESC')
    .bind(userRow.id)
    .all<Record<string, unknown>>()

  return json({ user: rowToUser(userRow, (documents.results ?? []).map(rowToDocument)) })
}

const handleAdminLogin = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<{ username: string; password: string }>(request)
  const passwordHash = await hashText(body.password ?? '')

  if (body.username !== env.ADMIN_USERNAME || passwordHash !== env.ADMIN_PASSWORD_HASH) {
    return json({ error: '管理员账号或密码不正确。' }, { status: 401 })
  }

  const token = crypto.randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 12)
  await env.DB.prepare('INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)')
    .bind(token, now.toISOString(), expiresAt.toISOString())
    .run()

  return json({ token })
}

const handlePostCreate = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<PostRecord & { userId: string; authorName: string; source: string }>(request)
  const user = body.userId
    ? await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(body.userId).first<Record<string, unknown>>()
    : null

  if (body.userId && !user) return json({ error: '请先登录后再发布内容。' }, { status: 401 })
  if (!user && body.source !== 'miniapp') return json({ error: '请先登录后再发布内容。' }, { status: 401 })
  if (user && (user.status === 'muted' || user.status === 'banned')) {
    return json({ error: user.status === 'muted' ? '账号已被禁言。' : '账号已被封号。' }, { status: 403 })
  }

  const postActorKey = await getRequestActorKey(request, user ? String(user.id) : undefined, body.authorName)
  const postRateError = await enforceRateLimit(env, {
    actorKey: postActorKey,
    action: 'post:create',
    maxCount: 8,
    windowSeconds: 60 * 60,
    content: `${body.title || ''}\n${body.body || ''}`,
    duplicateWindowSeconds: 60 * 10,
  })
  if (postRateError) return json({ error: postRateError }, { status: 429 })
  const postDeviceRateError = await enforceRateLimit(env, {
    actorKey: await getRequestDeviceKey(request),
    action: 'post:create:device',
    maxCount: 20,
    windowSeconds: 60 * 60,
  })
  if (postDeviceRateError) return json({ error: postDeviceRateError }, { status: 429 })

  const postViolation = findComplianceViolation([body.title, body.school, body.category, body.excerpt, body.body])
  if (postViolation) {
    await recordModerationEvent(env, {
      contentType: 'post',
      userId: user ? String(user.id) : undefined,
      action: 'blocked',
      reason: postViolation.reason,
      matchedTerms: postViolation.matchedTerms,
    })
    return json({ error: postViolation.reason }, { status: 400 })
  }

  const post: PostRecord = {
    id: createId('post'),
    title: body.title?.trim() || '',
    school: body.school?.trim() || '韩国留学',
    category: body.category || '申请避坑',
    author: user ? String(user.name) : body.authorName?.trim() || '小程序用户',
    authorId: user ? String(user.id) : undefined,
    price: Math.max(0, Number(body.price) || 0),
    hot: '新发布',
    excerpt: body.excerpt?.trim() || body.body?.trim().slice(0, 58) || '',
    body: body.body?.trim() || '',
    createdAt: new Date().toISOString(),
    featured: Number(body.price) > 0,
  }

  if (!post.title || !post.body) return json({ error: '标题和正文不能为空。' }, { status: 400 })

  await env.DB.prepare(
    `INSERT INTO posts
      (id, title, school, category, author, author_id, price, hot, excerpt, body, created_at, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      post.id,
      post.title,
      post.school,
      post.category,
      post.author,
      post.authorId ?? null,
      post.price,
      post.hot,
      post.excerpt,
      post.body,
      post.createdAt,
      post.featured ? 1 : 0,
    )
    .run()

  if (user) await env.DB.prepare('UPDATE users SET points = points + 10 WHERE id = ?').bind(user.id).run()

  return json({ post })
}

const handleQuestionCreate = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureQuestionTables(env)
  const body = await readBody<CommunityQuestionRecord & { userId: string; authorName: string; identity: string; source: string }>(request)
  const user = body.userId
    ? await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(body.userId).first<Record<string, unknown>>()
    : null

  if (body.userId && !user) return json({ error: '请先登录后再发布问题。' }, { status: 401 })
  if (!user && body.source !== 'miniapp') return json({ error: '请先登录后再发布问题。' }, { status: 401 })
  if (user && (user.status === 'muted' || user.status === 'banned')) {
    return json({ error: user.status === 'muted' ? '账号已被禁言。' : '账号已被封号。' }, { status: 403 })
  }

  const questionActorKey = await getRequestActorKey(request, user ? String(user.id) : undefined, body.authorName)
  const questionRateError = await enforceRateLimit(env, {
    actorKey: questionActorKey,
    action: 'question:create',
    maxCount: 6,
    windowSeconds: 60 * 60,
    content: `${body.title || ''}\n${body.detail || ''}`,
    duplicateWindowSeconds: 60 * 10,
  })
  if (questionRateError) return json({ error: questionRateError }, { status: 429 })
  const questionDeviceRateError = await enforceRateLimit(env, {
    actorKey: await getRequestDeviceKey(request),
    action: 'question:create:device',
    maxCount: 15,
    windowSeconds: 60 * 60,
  })
  if (questionDeviceRateError) return json({ error: questionDeviceRateError }, { status: 429 })

  const questionViolation = findComplianceViolation([body.title, body.category, body.school, body.tags?.join(' '), body.detail])
  if (questionViolation) {
    await recordModerationEvent(env, {
      contentType: 'question',
      userId: user ? String(user.id) : undefined,
      action: 'blocked',
      reason: questionViolation.reason,
      matchedTerms: questionViolation.matchedTerms,
    })
    return json({ error: questionViolation.reason }, { status: 400 })
  }

  const question: CommunityQuestionRecord = {
    id: createId('question'),
    title: body.title?.trim() || '',
    category: body.category || '签证/滞留资格',
    country: body.country?.trim() || '韩国',
    city: body.city?.trim() || '',
    school: body.school?.trim() || '韩国留学',
    rewardPoints: Math.max(0, Number(body.rewardPoints) || 0),
    answersCount: 0,
    views: 0,
    status: 'open',
    createdAt: new Date().toISOString(),
    author: user ? String(user.name) : body.authorName?.trim() || '小程序用户',
    authorId: user ? String(user.id) : undefined,
    identity: user ? String(user.identity ?? '') : body.identity?.trim() || '小程序提问',
    tags: (body.tags ?? []).map(String).filter(Boolean).slice(0, 8),
    detail: body.detail?.trim() || '',
  }

  if (!question.title || !question.detail) return json({ error: '问题标题和详情不能为空。' }, { status: 400 })
  if (question.detail.length < 12) return json({ error: '问题详情请至少写 12 个字，方便别人判断背景。' }, { status: 400 })
  if (user && question.rewardPoints > Number(user.points ?? 0)) {
    return json({ error: `消费积分不足，最多可设置 ${Number(user.points ?? 0)} 积分悬赏。` }, { status: 400 })
  }

  await env.DB.prepare(
    `INSERT INTO community_questions
      (id, title, category, country, city, school, reward_points, answers_count, views, status, created_at, author, author_id, identity, tags, detail)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'open', ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      question.id,
      question.title,
      question.category,
      question.country,
      question.city,
      question.school,
      question.rewardPoints,
      question.createdAt,
      question.author,
      question.authorId ?? null,
      question.identity,
      JSON.stringify(question.tags),
      question.detail,
    )
    .run()

  if (user && question.rewardPoints > 0) {
    const now = new Date().toISOString()
    await env.DB.prepare('UPDATE users SET points = points - ? WHERE id = ?').bind(question.rewardPoints, String(user.id)).run()
    await insertPointLedger(env, {
      userId: String(user.id),
      direction: 'debit',
      accountType: 'points',
      points: question.rewardPoints,
      category: 'question_bounty_hold',
      refType: 'question',
      refId: question.id,
      note: '发布悬赏问题锁定消费积分',
    })
    await env.DB.prepare(
      `INSERT INTO question_bounties
        (question_id, asker_user_id, reward_points, status, created_at, updated_at)
        VALUES (?, ?, ?, 'held', ?, ?)`,
    )
      .bind(question.id, String(user.id), question.rewardPoints, now, now)
      .run()
  }

  return json({ question })
}

const handleAnswerCreate = async (request: Request, env: Env, questionId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureQuestionTables(env)
  const body = await readBody<{ userId: string; content: string; authorName: string; identity: string; source: string }>(request)
  const user = body.userId
    ? await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(body.userId).first<Record<string, unknown>>()
    : null

  if (body.userId && !user) return json({ error: '请先登录后再回答问题。' }, { status: 401 })
  if (!user && body.source !== 'miniapp') return json({ error: '请先登录后再回答问题。' }, { status: 401 })
  if (user && (user.status === 'muted' || user.status === 'banned')) {
    return json({ error: user.status === 'muted' ? '账号已被禁言。' : '账号已被封号。' }, { status: 403 })
  }

  const question = await env.DB.prepare('SELECT * FROM community_questions WHERE id = ?')
    .bind(questionId)
    .first<Record<string, unknown>>()
  if (!question) return json({ error: '问题不存在。' }, { status: 404 })
  if (String(question.status ?? 'open') === 'solved') return json({ error: '这个问题已经解决，不能继续提交回答。' }, { status: 400 })
  if (user && question.author_id && String(question.author_id) === String(user.id)) {
    return json({ error: '不能回答自己发布的悬赏问题。' }, { status: 400 })
  }

  const content = body.content?.trim() || ''
  if (content.length < 20) return json({ error: '回答请至少写 20 个字，说明材料、流程或经验边界。' }, { status: 400 })

  const answerActorKey = await getRequestActorKey(request, user ? String(user.id) : undefined, body.authorName)
  const answerRateError = await enforceRateLimit(env, {
    actorKey: answerActorKey,
    action: `answer:create:${questionId}`,
    maxCount: 5,
    windowSeconds: 60 * 60,
    content,
    duplicateWindowSeconds: 60 * 10,
  })
  if (answerRateError) return json({ error: answerRateError }, { status: 429 })
  const answerDeviceRateError = await enforceRateLimit(env, {
    actorKey: await getRequestDeviceKey(request),
    action: 'answer:create:device',
    maxCount: 40,
    windowSeconds: 60 * 60,
  })
  if (answerDeviceRateError) return json({ error: answerDeviceRateError }, { status: 429 })

  const answerViolation = findComplianceViolation([content])
  if (answerViolation) {
    await recordModerationEvent(env, {
      contentType: 'answer',
      contentId: questionId,
      userId: user ? String(user.id) : undefined,
      action: 'blocked',
      reason: answerViolation.reason,
      matchedTerms: answerViolation.matchedTerms,
    })
    return json({ error: answerViolation.reason }, { status: 400 })
  }

  const answer: QuestionAnswerRecord = {
    id: createId('answer'),
    questionId,
    author: user ? String(user.name) : body.authorName?.trim() || '小程序用户',
    authorId: user ? String(user.id) : undefined,
    identity: user ? String(user.identity ?? '') : body.identity?.trim() || '小程序助人',
    content,
    likes: 0,
    accepted: false,
    createdAt: new Date().toISOString(),
  }

  await env.DB.prepare(
    `INSERT INTO question_answers
      (id, question_id, author, author_id, identity, content, likes, accepted, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)`,
  )
    .bind(answer.id, answer.questionId, answer.author, answer.authorId ?? null, answer.identity, answer.content, answer.createdAt)
    .run()
  await env.DB.prepare('UPDATE community_questions SET answers_count = answers_count + 1 WHERE id = ?')
    .bind(questionId)
    .run()
  if (user) await env.DB.prepare('UPDATE users SET points = points + 5 WHERE id = ?').bind(user.id).run()

  const updatedQuestion = await env.DB.prepare('SELECT * FROM community_questions WHERE id = ?')
    .bind(questionId)
    .first<Record<string, unknown>>()

  return json({
    answer,
    question: updatedQuestion ? rowToQuestion(updatedQuestion) : null,
    users: await getAllUsers(env),
  })
}

const handleQuestionDetail = async (env: Env, questionId: string) => {
  const detail = await getQuestionDetail(env, questionId)
  if (!detail) return json({ error: '问题不存在。' }, { status: 404 })
  return json(detail)
}

const handleAnswerAccept = async (request: Request, env: Env, questionId: string, answerId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureQuestionTables(env)
  const body = await readBody<{ userId: string }>(request)
  const questionRow = await env.DB.prepare('SELECT * FROM community_questions WHERE id = ?')
    .bind(questionId)
    .first<Record<string, unknown>>()
  if (!questionRow) return json({ error: '问题不存在。' }, { status: 404 })
  if (String(questionRow.status ?? 'open') === 'solved') return json({ error: '这个问题已经结算，不能重复采纳。' }, { status: 400 })

  const requesterId = body.userId?.trim()
  const questionAuthorId = questionRow.author_id ? String(questionRow.author_id) : ''
  if (questionAuthorId && requesterId !== questionAuthorId) {
    return json({ error: '只有提问者可以采纳回答。' }, { status: 403 })
  }
  const acceptActorKey = await getRequestActorKey(request, requesterId, questionAuthorId || questionId)
  const acceptRateError = await enforceRateLimit(env, {
    actorKey: acceptActorKey,
    action: 'answer:accept',
    maxCount: 8,
    windowSeconds: 60 * 60 * 24,
  })
  if (acceptRateError) return json({ error: acceptRateError }, { status: 429 })

  const answerRow = await env.DB.prepare('SELECT * FROM question_answers WHERE id = ? AND question_id = ?')
    .bind(answerId, questionId)
    .first<Record<string, unknown>>()
  if (!answerRow) return json({ error: '回答不存在。' }, { status: 404 })
  if (answerRow.author_id && questionAuthorId && String(answerRow.author_id) === questionAuthorId) {
    return json({ error: '不能采纳自己的回答。' }, { status: 400 })
  }

  const existingAccepted = await env.DB.prepare('SELECT id FROM question_answers WHERE question_id = ? AND accepted = 1 LIMIT 1')
    .bind(questionId)
    .first<{ id: string }>()
  if (existingAccepted) return json({ error: '这个问题已经有采纳回答，不能重复结算。' }, { status: 400 })

  const rewardPoints = Math.max(0, Number(questionRow.reward_points ?? 0))
  const bountyRow = await env.DB.prepare('SELECT * FROM question_bounties WHERE question_id = ?')
    .bind(questionId)
    .first<Record<string, unknown>>()
  const bounty = bountyRow ? rowToQuestionBounty(bountyRow) : null
  if (bounty && bounty.status !== 'held') return json({ error: '这笔悬赏已经进入结算、退款或申诉流程。' }, { status: 400 })
  const settledPoints = bounty ? bounty.rewardPoints : rewardPoints > 0 ? Math.min(200, Math.max(50, rewardPoints)) : 50
  const now = new Date().toISOString()
  await env.DB.prepare('UPDATE question_answers SET accepted = 0 WHERE question_id = ?').bind(questionId).run()
  await env.DB.prepare('UPDATE question_answers SET accepted = 1 WHERE id = ? AND question_id = ?')
    .bind(answerId, questionId)
    .run()
  await env.DB.prepare('UPDATE community_questions SET status = ? WHERE id = ?').bind('solved', questionId).run()

  if (bounty) {
    await env.DB.prepare(
      `UPDATE question_bounties SET
        answer_id = ?,
        answerer_user_id = ?,
        status = 'settled',
        updated_at = ?,
        settled_at = ?
       WHERE question_id = ?`,
    )
      .bind(answerId, answerRow.author_id ? String(answerRow.author_id) : null, now, now, questionId)
      .run()
  }

  if (answerRow.author_id) {
    await env.DB.prepare('UPDATE users SET earning_points = earning_points + ? WHERE id = ?')
      .bind(settledPoints, String(answerRow.author_id))
      .run()
    await insertPointLedger(env, {
      userId: String(answerRow.author_id),
      direction: 'credit',
      accountType: 'earning_points',
      points: settledPoints,
      category: 'answer_accepted',
      refType: 'question_answer',
      refId: answerId,
      note: '回答被采纳获得可提现积分',
    })
  }

  const detail = await getQuestionDetail(env, questionId)
  const acceptedAnswer = detail?.answers.find((answer) => answer.id === answerId) ?? rowToAnswer({ ...answerRow, accepted: 1 })
  return json({
    question: detail?.question ?? rowToQuestion({ ...questionRow, status: 'solved' }),
    answer: acceptedAnswer,
    answers: detail?.answers ?? [acceptedAnswer],
    settledPoints,
    users: await getAllUsers(env),
  })
}

const handleQuestionRefund = async (request: Request, env: Env, questionId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureQuestionTables(env)
  const body = await readBody<{ userId: string }>(request)
  const questionRow = await env.DB.prepare('SELECT * FROM community_questions WHERE id = ?')
    .bind(questionId)
    .first<Record<string, unknown>>()
  if (!questionRow) return json({ error: '问题不存在。' }, { status: 404 })
  if (String(questionRow.status ?? 'open') === 'solved') return json({ error: '已解决的问题不能直接退款，请发起申诉。' }, { status: 400 })

  const bountyRow = await env.DB.prepare('SELECT * FROM question_bounties WHERE question_id = ?')
    .bind(questionId)
    .first<Record<string, unknown>>()
  if (!bountyRow) return json({ error: '这个问题没有锁定悬赏积分。' }, { status: 400 })
  const bounty = rowToQuestionBounty(bountyRow)
  if (bounty.status !== 'held') return json({ error: '这笔悬赏已经进入结算、退款或申诉流程。' }, { status: 400 })
  if (bounty.askerUserId && body.userId?.trim() !== bounty.askerUserId) {
    return json({ error: '只有提问者可以申请直接退款。' }, { status: 403 })
  }
  if (Number(questionRow.answers_count ?? 0) > 0) {
    return json({ error: '已有回答的问题不能直接退款，请发起申诉由管理员处理。' }, { status: 400 })
  }

  const now = new Date().toISOString()
  if (bounty.askerUserId) {
    await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?').bind(bounty.rewardPoints, bounty.askerUserId).run()
    await insertPointLedger(env, {
      userId: bounty.askerUserId,
      direction: 'credit',
      accountType: 'points',
      points: bounty.rewardPoints,
      category: 'question_bounty_refund',
      refType: 'question',
      refId: questionId,
      note: '悬赏未回答退款',
    })
  }
  await env.DB.prepare("UPDATE question_bounties SET status = 'refunded', updated_at = ? WHERE question_id = ?")
    .bind(now, questionId)
    .run()
  await env.DB.prepare('UPDATE community_questions SET reward_points = 0 WHERE id = ?').bind(questionId).run()

  return json({
    question: rowToQuestion({ ...questionRow, reward_points: 0 }),
    bounty: { ...bounty, status: 'refunded', updatedAt: now },
    users: await getAllUsers(env),
  })
}

const handleQuestionDisputeCreate = async (request: Request, env: Env, questionId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureQuestionTables(env)
  const body = await readBody<{
    answerId: string
    userId: string
    type: QuestionDisputeRecord['type']
    reason: string
    detail: string
    source: string
  }>(request)
  const questionRow = await env.DB.prepare('SELECT id FROM community_questions WHERE id = ?').bind(questionId).first()
  if (!questionRow) return json({ error: '问题不存在。' }, { status: 404 })

  const reason = body.reason?.trim() || ''
  const detail = body.detail?.trim() || ''
  if (!reason) return json({ error: '请填写申诉或退款原因。' }, { status: 400 })

  const actorKey = await getRequestActorKey(request, body.userId?.trim(), body.reason)
  const rateError = await enforceRateLimit(env, {
    actorKey,
    action: 'question:dispute',
    maxCount: 5,
    windowSeconds: 60 * 60,
    content: `${questionId}\n${body.answerId || ''}\n${reason}\n${detail}`,
    duplicateWindowSeconds: 60 * 10,
  })
  if (rateError) return json({ error: rateError }, { status: 429 })

  const violation = findComplianceViolation([reason, detail])
  if (violation) {
    await recordModerationEvent(env, {
      contentType: 'question-dispute',
      contentId: questionId,
      userId: body.userId,
      action: 'blocked',
      reason: violation.reason,
      matchedTerms: violation.matchedTerms,
    })
    return json({ error: violation.reason }, { status: 400 })
  }

  const now = new Date().toISOString()
  const dispute: QuestionDisputeRecord = {
    id: createId('dispute'),
    questionId,
    answerId: body.answerId?.trim() || undefined,
    reporterUserId: body.userId?.trim() || undefined,
    type: body.type || 'appeal',
    reason,
    detail,
    status: 'pending',
    adminNote: '',
    createdAt: now,
    updatedAt: now,
  }

  await env.DB.prepare(
    `INSERT INTO question_disputes
      (id, question_id, answer_id, reporter_user_id, type, reason, detail, status, admin_note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', '', ?, ?)`,
  )
    .bind(
      dispute.id,
      dispute.questionId,
      dispute.answerId ?? null,
      dispute.reporterUserId ?? null,
      dispute.type,
      dispute.reason,
      dispute.detail,
      dispute.createdAt,
      dispute.updatedAt,
    )
    .run()
  await env.DB.prepare("UPDATE question_bounties SET status = 'disputed', updated_at = ? WHERE question_id = ? AND status = 'held'")
    .bind(now, questionId)
    .run()

  return json({ dispute })
}

const handlePostUnlock = async (request: Request, env: Env, postId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<{ userId: string }>(request)
  const userId = body.userId?.trim()
  if (!userId) return json({ error: '请先登录后再解锁内容。' }, { status: 401 })

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<Record<string, unknown>>()
  if (!user) return json({ error: '请先登录后再解锁内容。' }, { status: 401 })
  if (user.status === 'banned') return json({ error: '账号已被封号，不能解锁内容。' }, { status: 403 })

  const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(postId).first<Record<string, unknown>>()
  if (!post) return json({ error: '帖子不存在。' }, { status: 404 })

  const price = Math.max(0, Number(post.price) || 0)
  if (price === 0) return json({ users: await getAllUsers(env) })

  const existingUnlock = await env.DB.prepare('SELECT post_id FROM post_unlocks WHERE user_id = ? AND post_id = ?')
    .bind(userId, postId)
    .first()
  if (existingUnlock) return json({ users: await getAllUsers(env) })

  if (Number(user.points) < price) {
    return json({ error: `消费积分不足，还差 ${price - Number(user.points)} 积分。` }, { status: 400 })
  }

  const now = new Date().toISOString()
  await env.DB.prepare('UPDATE users SET points = points - ? WHERE id = ?').bind(price, userId).run()
  if (post.author_id && String(post.author_id) !== userId) {
    await env.DB.prepare('UPDATE users SET earning_points = earning_points + ? WHERE id = ?')
      .bind(price, String(post.author_id))
      .run()
    await insertPointLedger(env, {
      userId: String(post.author_id),
      direction: 'credit',
      accountType: 'earning_points',
      points: price,
      category: 'paid_post_unlock',
      refType: 'post',
      refId: postId,
      note: '付费内容解锁收益',
    })
  }
  await env.DB.prepare('INSERT INTO post_unlocks (user_id, post_id, created_at) VALUES (?, ?, ?)')
    .bind(userId, postId, now)
    .run()

  return json({ users: await getAllUsers(env) })
}

const handlePartnerCreate = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<PartnerApplicationRecord>(request)

  if (!body.company?.trim() || !body.contact?.trim() || !body.phone?.trim()) {
    return json({ error: '请填写机构名称、联系人和联系方式。' }, { status: 400 })
  }

  const violation = findComplianceViolation([body.company, body.type, body.direction, body.detail])
  if (violation) {
    await recordModerationEvent(env, {
      contentType: 'partner',
      action: 'blocked',
      reason: violation.reason,
      matchedTerms: violation.matchedTerms,
    })
    return json({ error: violation.reason }, { status: 400 })
  }

  const application: PartnerApplicationRecord = {
    id: createId('partner'),
    company: body.company.trim(),
    type: body.type || '留学机构',
    contact: body.contact.trim(),
    phone: body.phone.trim(),
    direction: body.direction || '内容入驻',
    budget: body.budget?.trim() || '',
    detail: body.detail?.trim() || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  await env.DB.prepare(
    `INSERT INTO partner_applications
      (id, company, type, contact, phone, direction, budget, detail, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      application.id,
      application.company,
      application.type,
      application.contact,
      application.phone,
      application.direction,
      application.budget,
      application.detail,
      application.status,
      application.createdAt,
    )
    .run()

  return json({ application })
}

const handleMerchantLeadCreate = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureMerchantLeadTables(env)
  const body = await readBody<MerchantLeadRecord>(request)
  const merchantTitle = body.merchantTitle?.trim() || ''
  const merchantType = body.merchantType?.trim() || ''
  const note = body.note?.trim() || '想咨询这个服务'

  if (!merchantTitle) return json({ error: '缺少商家信息。' }, { status: 400 })

  const actorKey = await getRequestActorKey(request, body.userId, body.userName || body.userContact || merchantTitle)
  const leadRateError = await enforceRateLimit(env, {
    actorKey,
    action: 'merchant-lead:create',
    maxCount: 10,
    windowSeconds: 60 * 60,
    content: `${merchantTitle}\n${body.userContact || ''}\n${note}`,
    duplicateWindowSeconds: 60 * 10,
  })
  if (leadRateError) return json({ error: leadRateError }, { status: 429 })
  const leadDeviceRateError = await enforceRateLimit(env, {
    actorKey: await getRequestDeviceKey(request),
    action: 'merchant-lead:create:device',
    maxCount: 30,
    windowSeconds: 60 * 60,
  })
  if (leadDeviceRateError) return json({ error: leadDeviceRateError }, { status: 429 })

  const violation = findComplianceViolation([merchantTitle, merchantType, body.userName, body.userContact, note])
  if (violation) {
    await recordModerationEvent(env, {
      contentType: 'merchant-lead',
      contentId: body.merchantId || '',
      userId: body.userId,
      action: 'blocked',
      reason: violation.reason,
      matchedTerms: violation.matchedTerms,
    })
    return json({ error: violation.reason }, { status: 400 })
  }

  let userName = body.userName?.trim() || '小程序用户'
  let userContact = body.userContact?.trim() || ''
  let userId = body.userId?.trim() || ''
  if (userId) {
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<Record<string, unknown>>()
    if (user) {
      userName = String(user.name || userName)
      userContact = String(user.email || userContact)
    } else {
      userId = ''
    }
  }

  const lead: MerchantLeadRecord = {
    id: createId('merchant-lead'),
    merchantId: body.merchantId?.trim() || '',
    merchantTitle,
    merchantType,
    userId: userId || undefined,
    userName,
    userContact,
    note,
    assignedTo: body.assignedTo?.trim() || '',
    adminNote: '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await env.DB.prepare(
    `INSERT INTO merchant_leads
      (id, merchant_id, merchant_title, merchant_type, user_id, user_name, user_contact, note, assigned_to, admin_note, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      lead.id,
      lead.merchantId,
      lead.merchantTitle,
      lead.merchantType,
      lead.userId ?? null,
      lead.userName,
      lead.userContact,
      lead.note,
      lead.assignedTo,
      lead.adminNote,
      lead.status,
      lead.createdAt,
      lead.updatedAt,
    )
    .run()

  return json({ lead })
}

const updateMerchantLead = async (request: Request, env: Env, leadId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureMerchantLeadTables(env)
  const body = await readBody<Partial<MerchantLeadRecord>>(request)
  const now = new Date().toISOString()
  await env.DB.prepare(
    `UPDATE merchant_leads SET
      status = COALESCE(?, status),
      note = COALESCE(?, note),
      assigned_to = COALESCE(?, assigned_to),
      admin_note = COALESCE(?, admin_note),
      updated_at = ?
     WHERE id = ?`,
  )
    .bind(body.status ?? null, body.note ?? null, body.assignedTo ?? null, body.adminNote ?? null, now, leadId)
    .run()
  return json({ merchantLeads: await getMerchantLeads(env) })
}

const handleReportCreate = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureComplianceTables(env)
  const body = await readBody<ContentReportRecord>(request)
  const contentType = body.contentType?.trim()
  const contentId = body.contentId?.trim()
  const reason = body.reason?.trim()

  if (!contentType || !contentId || !reason) {
    return json({ error: '请填写举报对象和举报原因。' }, { status: 400 })
  }

  const reportActorKey = await getRequestActorKey(request, body.reporterUserId, body.reporterContact || contentId)
  const reportRateError = await enforceRateLimit(env, {
    actorKey: reportActorKey,
    action: 'report:create',
    maxCount: 10,
    windowSeconds: 60 * 60,
    content: `${contentType}\n${contentId}\n${reason}\n${body.description || ''}`,
    duplicateWindowSeconds: 60 * 10,
  })
  if (reportRateError) return json({ error: reportRateError }, { status: 429 })

  const now = new Date().toISOString()
  const report: ContentReportRecord = {
    id: createId('report'),
    contentType,
    contentId,
    reason,
    description: body.description?.trim() || '',
    reporterUserId: body.reporterUserId?.trim() || undefined,
    reporterContact: body.reporterContact?.trim() || '',
    status: 'pending',
    adminNote: '',
    createdAt: now,
    updatedAt: now,
  }

  await env.DB.prepare(
    `INSERT INTO content_reports
      (id, content_type, content_id, reason, description, reporter_user_id, reporter_contact, status, admin_note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      report.id,
      report.contentType,
      report.contentId,
      report.reason,
      report.description,
      report.reporterUserId ?? null,
      report.reporterContact,
      report.status,
      report.adminNote,
      report.createdAt,
      report.updatedAt,
    )
    .run()

  return json({ report })
}

const handleReactionLike = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureRiskTables(env)
  const body = await readBody<{ contentType: string; contentId: string; userId: string; actorName: string }>(request)
  const contentType = body.contentType?.trim()
  const contentId = body.contentId?.trim()
  if (!contentType || !contentId) return json({ error: '缺少点赞对象。' }, { status: 400 })

  const actorKey = await getRequestActorKey(request, body.userId?.trim(), body.actorName || contentId)
  const rateError = await enforceRateLimit(env, {
    actorKey,
    action: 'reaction:like',
    maxCount: 60,
    windowSeconds: 60 * 60,
  })
  if (rateError) return json({ error: rateError }, { status: 429 })

  const existing = await env.DB.prepare(
    'SELECT id FROM content_reactions WHERE content_type = ? AND content_id = ? AND actor_key = ?',
  )
    .bind(contentType, contentId, actorKey)
    .first<{ id: string }>()
  if (!existing) {
    await env.DB.prepare(
      'INSERT INTO content_reactions (id, content_type, content_id, actor_key, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(createId('like'), contentType, contentId, actorKey, body.userId?.trim() || null, new Date().toISOString())
      .run()
  }
  const countRow = await env.DB.prepare('SELECT COUNT(*) AS count FROM content_reactions WHERE content_type = ? AND content_id = ?')
    .bind(contentType, contentId)
    .first<{ count: number }>()

  return json({ liked: true, alreadyLiked: Boolean(existing), likes: Number(countRow?.count ?? 0) })
}

const handleRechargeOrderCreate = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureWalletTables(env)
  const body = await readBody<{ userId: string; amountYuan: number; channel: PointOrderRecord['channel'] }>(request)
  const userId = body.userId?.trim()
  const amountYuan = Math.max(0, Math.floor(Number(body.amountYuan) || 0))
  if (!userId) return json({ error: '请先登录后再充值。' }, { status: 401 })
  if (amountYuan < 10 || amountYuan > 2000) return json({ error: '单笔充值金额建议在 10～2000 元之间。' }, { status: 400 })

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<Record<string, unknown>>()
  if (!user) return json({ error: '账号不存在，请重新登录。' }, { status: 404 })
  const actorKey = await getRequestActorKey(request, userId)
  const rateError = await enforceRateLimit(env, {
    actorKey,
    action: 'wallet:recharge',
    maxCount: 8,
    windowSeconds: 60 * 60,
  })
  if (rateError) return json({ error: rateError }, { status: 429 })

  const now = new Date().toISOString()
  const order: PointOrderRecord = {
    id: createId('order'),
    userId,
    userName: String(user.name ?? ''),
    type: 'recharge',
    amountYuan,
    points: amountYuan * 10,
    status: 'pending',
    channel: body.channel === 'wechat' || body.channel === 'bank' ? body.channel : 'manual',
    outTradeNo: '',
    adminNote: '',
    createdAt: now,
    updatedAt: now,
  }
  await env.DB.prepare(
    `INSERT INTO point_orders
      (id, user_id, user_name, type, amount_yuan, points, status, channel, out_trade_no, admin_note, created_at, updated_at, paid_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      order.id,
      order.userId,
      order.userName,
      order.type,
      order.amountYuan,
      order.points,
      order.status,
      order.channel,
      order.outTradeNo,
      order.adminNote,
      order.createdAt,
      order.updatedAt,
      null,
    )
    .run()

  return json({ order, pointOrders: await getPointOrders(env) })
}

const handleWithdrawalCreate = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureWalletTables(env)
  const body = await readBody<{ userId: string; earningPoints: number; payoutMethod: string; accountLabel: string }>(request)
  const userId = body.userId?.trim()
  const earningPoints = Math.max(0, Math.floor(Number(body.earningPoints) || 0))
  const payoutMethod = body.payoutMethod?.trim() || '银行账户'
  const accountLabel = body.accountLabel?.trim() || ''
  if (!userId) return json({ error: '请先登录后再申请提现。' }, { status: 401 })
  if (earningPoints < 1700) return json({ error: '可提现积分满 1700 后再申请提现。' }, { status: 400 })
  if (!accountLabel) return json({ error: '请填写收款方式备注，方便后台核对。' }, { status: 400 })

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<Record<string, unknown>>()
  if (!user) return json({ error: '账号不存在，请重新登录。' }, { status: 404 })
  if (Number(user.earning_points ?? 0) < earningPoints) {
    return json({ error: `可提现积分不足，当前最多可申请 ${Number(user.earning_points ?? 0)} 积分。` }, { status: 400 })
  }

  const actorKey = await getRequestActorKey(request, userId)
  const rateError = await enforceRateLimit(env, {
    actorKey,
    action: 'wallet:withdraw',
    maxCount: 3,
    windowSeconds: 60 * 60 * 24,
  })
  if (rateError) return json({ error: rateError }, { status: 429 })

  const now = new Date().toISOString()
  const requestRecord: WithdrawalRequestRecord = {
    id: createId('withdraw'),
    userId,
    userName: String(user.name ?? ''),
    earningPoints,
    amountYuan: Math.floor((earningPoints * 8) / 100),
    payoutMethod,
    accountLabel,
    status: 'pending',
    adminNote: '',
    createdAt: now,
    updatedAt: now,
  }

  await env.DB.prepare('UPDATE users SET earning_points = earning_points - ? WHERE id = ?')
    .bind(earningPoints, userId)
    .run()
  await env.DB.prepare(
    `INSERT INTO withdrawal_requests
      (id, user_id, user_name, earning_points, amount_yuan, payout_method, account_label, status, admin_note, created_at, updated_at, paid_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      requestRecord.id,
      requestRecord.userId,
      requestRecord.userName,
      requestRecord.earningPoints,
      requestRecord.amountYuan,
      requestRecord.payoutMethod,
      requestRecord.accountLabel,
      requestRecord.status,
      requestRecord.adminNote,
      requestRecord.createdAt,
      requestRecord.updatedAt,
      null,
    )
    .run()
  await insertPointLedger(env, {
    userId,
    direction: 'debit',
    accountType: 'earning_points',
    points: earningPoints,
    category: 'withdrawal_hold',
    refType: 'withdrawal_request',
    refId: requestRecord.id,
    note: '提现申请冻结',
  })

  return json({
    withdrawal: requestRecord,
    withdrawalRequests: await getWithdrawalRequests(env),
    users: await getAllUsers(env),
  })
}

const updateProfile = async (request: Request, env: Env, userId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<Partial<UserRecord>>(request)
  const existing = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  if (!existing) return json({ error: '用户不存在。' }, { status: 404 })

  await env.DB.prepare(
    `UPDATE users SET
      name = COALESCE(?, name),
      identity = COALESCE(?, identity),
      school = COALESCE(?, school),
      avatar_url = COALESCE(?, avatar_url),
      bio = COALESCE(?, bio)
     WHERE id = ?`,
  )
    .bind(body.name ?? null, body.identity ?? null, body.school ?? null, body.avatarUrl ?? null, body.bio ?? null, userId)
    .run()

  for (const document of body.documents ?? []) {
    await env.DB.prepare(
      `INSERT INTO user_documents (id, user_id, name, type, status, uploaded_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
    )
      .bind(
        document.id || createId('doc'),
        userId,
        document.name || '认证材料',
        document.type || '身份/学校认证材料',
        document.uploadedAt || new Date().toISOString(),
      )
      .run()
  }

  const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<Record<string, unknown>>()
  const documents = await env.DB.prepare('SELECT * FROM user_documents WHERE user_id = ? ORDER BY uploaded_at DESC')
    .bind(userId)
    .all<Record<string, unknown>>()

  return json({ user: row ? rowToUser(row, (documents.results ?? []).map(rowToDocument)) : null })
}

const updateUser = async (request: Request, env: Env, userId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<Partial<UserRecord>>(request)
  const existing = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  if (!existing) return json({ error: '用户不存在。' }, { status: 404 })

  await env.DB.prepare(
    `UPDATE users SET
      name = COALESCE(?, name),
      identity = COALESCE(?, identity),
      school = COALESCE(?, school),
      points = COALESCE(?, points),
      earning_points = COALESCE(?, earning_points),
      status = COALESCE(?, status),
      verification_status = COALESCE(?, verification_status),
      avatar_url = COALESCE(?, avatar_url),
      bio = COALESCE(?, bio)
     WHERE id = ?`,
  )
    .bind(
      body.name ?? null,
      body.identity ?? null,
      body.school ?? null,
      typeof body.points === 'number' ? body.points : null,
      typeof body.earningPoints === 'number' ? body.earningPoints : null,
      body.status ?? null,
      body.verificationStatus ?? null,
      body.avatarUrl ?? null,
      body.bio ?? null,
      userId,
    )
    .run()

  if (body.documents?.length) {
    for (const document of body.documents) {
      await env.DB.prepare('UPDATE user_documents SET status = ? WHERE id = ? AND user_id = ?')
        .bind(document.status, document.id, userId)
        .run()
    }
  }

  return json({ users: await getAllUsers(env) })
}

const updatePost = async (request: Request, env: Env, postId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<Partial<PostRecord>>(request)
  await env.DB.prepare(
    `UPDATE posts SET
      title = COALESCE(?, title),
      category = COALESCE(?, category),
      price = COALESCE(?, price),
      featured = COALESCE(?, featured)
     WHERE id = ?`,
  )
    .bind(
      body.title ?? null,
      body.category ?? null,
      typeof body.price === 'number' ? body.price : null,
      typeof body.featured === 'boolean' ? (body.featured ? 1 : 0) : null,
      postId,
    )
    .run()

  return json({ posts: await getAllPosts(env) })
}

const updatePartnerApplication = async (request: Request, env: Env, partnerId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<Partial<PartnerApplicationRecord>>(request)
  await env.DB.prepare(
    `UPDATE partner_applications SET
      status = COALESCE(?, status),
      direction = COALESCE(?, direction),
      detail = COALESCE(?, detail)
     WHERE id = ?`,
  )
    .bind(body.status ?? null, body.direction ?? null, body.detail ?? null, partnerId)
    .run()

  return json({ partnerApplications: await getPartnerApplications(env) })
}

const updateContentReport = async (request: Request, env: Env, reportId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureComplianceTables(env)
  const body = await readBody<Partial<ContentReportRecord>>(request)
  await env.DB.prepare(
    `UPDATE content_reports SET
      status = COALESCE(?, status),
      admin_note = COALESCE(?, admin_note),
      updated_at = ?
     WHERE id = ?`,
  )
    .bind(body.status ?? null, body.adminNote ?? null, new Date().toISOString(), reportId)
    .run()

  return json({ reports: await getContentReports(env) })
}

const updateQuestionDispute = async (request: Request, env: Env, disputeId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureQuestionTables(env)
  const body = await readBody<Partial<QuestionDisputeRecord> & { adminAction: 'refund' | 'settle' | '' }>(request)
  const disputeRow = await env.DB.prepare('SELECT * FROM question_disputes WHERE id = ?')
    .bind(disputeId)
    .first<Record<string, unknown>>()
  if (!disputeRow) return json({ error: '申诉记录不存在。' }, { status: 404 })
  const dispute = rowToQuestionDispute(disputeRow)
  const now = new Date().toISOString()

  if (body.adminAction === 'refund') {
    const bountyRow = await env.DB.prepare('SELECT * FROM question_bounties WHERE question_id = ?')
      .bind(dispute.questionId)
      .first<Record<string, unknown>>()
    if (bountyRow) {
      const bounty = rowToQuestionBounty(bountyRow)
      if (bounty.answererUserId && bounty.status === 'settled') {
        await env.DB.prepare(
          `UPDATE users SET earning_points =
            CASE WHEN earning_points >= ? THEN earning_points - ? ELSE 0 END
           WHERE id = ?`,
        )
          .bind(bounty.rewardPoints, bounty.rewardPoints, bounty.answererUserId)
          .run()
        await insertPointLedger(env, {
          userId: bounty.answererUserId,
          direction: 'debit',
          accountType: 'earning_points',
          points: bounty.rewardPoints,
          category: 'bounty_dispute_clawback',
          refType: 'question_dispute',
          refId: disputeId,
          note: '申诉退款扣回已结算收益',
        })
      }
      if (bounty.askerUserId && (bounty.status === 'held' || bounty.status === 'disputed' || bounty.status === 'settled')) {
        await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?').bind(bounty.rewardPoints, bounty.askerUserId).run()
        await insertPointLedger(env, {
          userId: bounty.askerUserId,
          direction: 'credit',
          accountType: 'points',
          points: bounty.rewardPoints,
          category: 'bounty_dispute_refund',
          refType: 'question_dispute',
          refId: disputeId,
          note: '申诉成立退回悬赏积分',
        })
      }
      await env.DB.prepare("UPDATE question_bounties SET status = 'refunded', updated_at = ? WHERE question_id = ?")
        .bind(now, dispute.questionId)
        .run()
      await env.DB.prepare('UPDATE community_questions SET reward_points = 0 WHERE id = ?').bind(dispute.questionId).run()
    }
  }

  await env.DB.prepare(
    `UPDATE question_disputes SET
      status = COALESCE(?, status),
      admin_note = COALESCE(?, admin_note),
      updated_at = ?
     WHERE id = ?`,
  )
    .bind(body.status ?? null, body.adminNote ?? null, now, disputeId)
    .run()

  return json({
    questionDisputes: await getQuestionDisputes(env),
    questionBounties: await getQuestionBounties(env),
    users: await getAllUsers(env),
  })
}

const updatePointOrder = async (request: Request, env: Env, orderId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureWalletTables(env)
  const body = await readBody<Partial<PointOrderRecord>>(request)
  const orderRow = await env.DB.prepare('SELECT * FROM point_orders WHERE id = ?')
    .bind(orderId)
    .first<Record<string, unknown>>()
  if (!orderRow) return json({ error: '充值订单不存在。' }, { status: 404 })
  const order = rowToPointOrder(orderRow)
  const nextStatus = body.status ?? order.status
  const now = new Date().toISOString()

  if (nextStatus === 'paid' && order.status !== 'paid') {
    await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?').bind(order.points, order.userId).run()
    await insertPointLedger(env, {
      userId: order.userId,
      direction: 'credit',
      accountType: 'points',
      points: order.points,
      category: 'recharge_paid',
      refType: 'point_order',
      refId: order.id,
      note: '充值订单确认入账',
    })
  }

  if (nextStatus === 'refunded' && order.status === 'paid') {
    await env.DB.prepare(
      `UPDATE users SET points =
        CASE WHEN points >= ? THEN points - ? ELSE 0 END
       WHERE id = ?`,
    )
      .bind(order.points, order.points, order.userId)
      .run()
    await insertPointLedger(env, {
      userId: order.userId,
      direction: 'debit',
      accountType: 'points',
      points: order.points,
      category: 'recharge_refunded',
      refType: 'point_order',
      refId: order.id,
      note: '充值订单退款扣回',
    })
  }

  await env.DB.prepare(
    `UPDATE point_orders SET
      status = COALESCE(?, status),
      out_trade_no = COALESCE(?, out_trade_no),
      admin_note = COALESCE(?, admin_note),
      updated_at = ?,
      paid_at = CASE WHEN ? = 'paid' AND paid_at IS NULL THEN ? ELSE paid_at END
     WHERE id = ?`,
  )
    .bind(nextStatus, body.outTradeNo ?? null, body.adminNote ?? null, now, nextStatus, now, orderId)
    .run()

  return json({
    pointOrders: await getPointOrders(env),
    pointLedger: await getPointLedger(env),
    users: await getAllUsers(env),
  })
}

const updateWithdrawalRequest = async (request: Request, env: Env, withdrawalId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureWalletTables(env)
  const body = await readBody<Partial<WithdrawalRequestRecord>>(request)
  const withdrawalRow = await env.DB.prepare('SELECT * FROM withdrawal_requests WHERE id = ?')
    .bind(withdrawalId)
    .first<Record<string, unknown>>()
  if (!withdrawalRow) return json({ error: '提现申请不存在。' }, { status: 404 })
  const withdrawal = rowToWithdrawalRequest(withdrawalRow)
  const nextStatus = body.status ?? withdrawal.status
  const now = new Date().toISOString()

  if (withdrawal.status === 'paid' && nextStatus !== 'paid') {
    return json({ error: '已打款的提现申请不能改回其他状态。' }, { status: 400 })
  }

  if (nextStatus === 'rejected' && withdrawal.status !== 'rejected') {
    await env.DB.prepare('UPDATE users SET earning_points = earning_points + ? WHERE id = ?')
      .bind(withdrawal.earningPoints, withdrawal.userId)
      .run()
    await insertPointLedger(env, {
      userId: withdrawal.userId,
      direction: 'credit',
      accountType: 'earning_points',
      points: withdrawal.earningPoints,
      category: 'withdrawal_rejected',
      refType: 'withdrawal_request',
      refId: withdrawal.id,
      note: '提现驳回退回可提现积分',
    })
  }

  await env.DB.prepare(
    `UPDATE withdrawal_requests SET
      status = COALESCE(?, status),
      admin_note = COALESCE(?, admin_note),
      updated_at = ?,
      paid_at = CASE WHEN ? = 'paid' AND paid_at IS NULL THEN ? ELSE paid_at END
     WHERE id = ?`,
  )
    .bind(nextStatus, body.adminNote ?? null, now, nextStatus, now, withdrawalId)
    .run()

  return json({
    withdrawalRequests: await getWithdrawalRequests(env),
    pointLedger: await getPointLedger(env),
    users: await getAllUsers(env),
  })
}

const deleteQuestionByAdmin = async (env: Env, questionId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  await ensureQuestionTables(env)
  await env.DB.prepare('DELETE FROM question_answers WHERE question_id = ?').bind(questionId).run()
  await env.DB.prepare('DELETE FROM community_questions WHERE id = ?').bind(questionId).run()
  return json(await getAllQuestions(env))
}

const deleteOwnPost = async (request: Request, env: Env, postId: string) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<{ userId: string }>(request)
  const post = await env.DB.prepare('SELECT author_id FROM posts WHERE id = ?').bind(postId).first<
    Record<string, unknown>
  >()

  if (!post) return json({ error: '帖子不存在。' }, { status: 404 })
  if (!body.userId || String(post.author_id) !== body.userId) {
    return json({ error: '只能删除自己发布的帖子。' }, { status: 403 })
  }

  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run()
  return json({ posts: await getAllPosts(env) })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.hostname === 'www.shouye.fun') {
      url.hostname = 'shouye.fun'
      return Response.redirect(url.toString(), 301)
    }

    if (!url.pathname.startsWith('/api/')) {
      if (url.pathname === '/robots.txt') return text(robotsTxt)
      if (url.pathname === '/sitemap.xml') return xml(sitemapXml)

      const response = await env.ASSETS.fetch(request)
      if (response.status === 404 && !url.pathname.split('/').pop()?.includes('.')) {
        return serveHtmlWithSeo(request, env, url, '/')
      }

      const contentType = response.headers.get('content-type') ?? ''
      if (contentType.includes('text/html')) {
        const html = await response.text()
        return new Response(injectSeoHtml(html, url), {
          headers: {
            'cache-control': 'no-store, max-age=0',
            'content-type': 'text/html; charset=utf-8',
            'x-shouye-build': 'mobile-app-shell-2026-05-05',
          },
        })
      }

      return response
    }

    if (url.pathname === '/api/health') return json({ ok: true })
    if (url.pathname === '/api/site-content' && request.method === 'GET') {
      return json({ siteContent: await getSiteContent(env) })
    }
    if (url.pathname === '/api/posts' && request.method === 'GET') return json({ posts: await getAllPosts(env) })
    if (url.pathname === '/api/questions' && request.method === 'GET') return json(await getAllQuestions(env))
    if (
      (url.pathname === '/api/auth/send-code' || url.pathname === '/api/auth/send-email-code') &&
      request.method === 'POST'
    ) {
      return handleSendVerificationCode(request, env)
    }
    if (url.pathname === '/api/auth/register' && request.method === 'POST') return handleRegister(request, env)
    if (url.pathname === '/api/auth/login' && request.method === 'POST') return handleLogin(request, env)
    if (url.pathname === '/api/auth/wechat-miniapp' && request.method === 'POST') return handleWechatMiniappLogin(request, env)
    if (url.pathname === '/api/posts' && request.method === 'POST') return handlePostCreate(request, env)
    if (url.pathname === '/api/questions' && request.method === 'POST') return handleQuestionCreate(request, env)
    if (url.pathname === '/api/reports' && request.method === 'POST') return handleReportCreate(request, env)
    if (url.pathname === '/api/reactions/like' && request.method === 'POST') return handleReactionLike(request, env)
    if (url.pathname === '/api/wallet/recharge-orders' && request.method === 'POST') {
      return handleRechargeOrderCreate(request, env)
    }
    if (url.pathname === '/api/wallet/withdrawals' && request.method === 'POST') {
      return handleWithdrawalCreate(request, env)
    }
    const questionDetailMatch = url.pathname.match(/^\/api\/questions\/([^/]+)$/)
    if (questionDetailMatch && request.method === 'GET') {
      return handleQuestionDetail(env, decodeURIComponent(questionDetailMatch[1]))
    }
    const questionRefundMatch = url.pathname.match(/^\/api\/questions\/([^/]+)\/refund$/)
    if (questionRefundMatch && request.method === 'POST') {
      return handleQuestionRefund(request, env, decodeURIComponent(questionRefundMatch[1]))
    }
    const questionDisputeMatch = url.pathname.match(/^\/api\/questions\/([^/]+)\/disputes$/)
    if (questionDisputeMatch && request.method === 'POST') {
      return handleQuestionDisputeCreate(request, env, decodeURIComponent(questionDisputeMatch[1]))
    }
    const answerCreateMatch = url.pathname.match(/^\/api\/questions\/([^/]+)\/answers$/)
    if (answerCreateMatch && request.method === 'POST') {
      return handleAnswerCreate(request, env, decodeURIComponent(answerCreateMatch[1]))
    }
    const answerAcceptMatch = url.pathname.match(/^\/api\/questions\/([^/]+)\/answers\/([^/]+)\/accept$/)
    if (answerAcceptMatch && request.method === 'POST') {
      return handleAnswerAccept(
        request,
        env,
        decodeURIComponent(answerAcceptMatch[1]),
        decodeURIComponent(answerAcceptMatch[2]),
      )
    }
    const postUnlockMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/unlock$/)
    if (postUnlockMatch && request.method === 'POST') return handlePostUnlock(request, env, postUnlockMatch[1])
    const publicPostMatch = url.pathname.match(/^\/api\/posts\/([^/]+)$/)
    if (publicPostMatch && request.method === 'DELETE') return deleteOwnPost(request, env, publicPostMatch[1])
    if (url.pathname === '/api/partner-applications' && request.method === 'POST') {
      return handlePartnerCreate(request, env)
    }
    if (url.pathname === '/api/merchant-leads' && request.method === 'POST') return handleMerchantLeadCreate(request, env)
    if (url.pathname === '/api/admin/login' && request.method === 'POST') return handleAdminLogin(request, env)

    const publicUserMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/)
    if (publicUserMatch && request.method === 'PATCH') return updateProfile(request, env, publicUserMatch[1])

    if (url.pathname.startsWith('/api/admin/')) {
      if (!(await requireAdmin(request, env))) return json({ error: '未登录管理员。' }, { status: 401 })

      if (url.pathname === '/api/admin/state' && request.method === 'GET') {
        return json({
          users: await getAllUsers(env),
          posts: await getAllPosts(env),
          reports: await getContentReports(env),
          partnerApplications: await getPartnerApplications(env),
          merchantLeads: await getMerchantLeads(env),
          questionDisputes: await getQuestionDisputes(env),
          questionBounties: await getQuestionBounties(env),
          pointOrders: await getPointOrders(env),
          withdrawalRequests: await getWithdrawalRequests(env),
          pointLedger: await getPointLedger(env),
          siteContent: await getSiteContent(env),
        })
      }

      if (url.pathname === '/api/admin/site-content' && request.method === 'PUT') {
        const body = await readBody<{ siteContent: Partial<SiteContentSettings> }>(request)
        return json({ siteContent: await saveSiteContent(env, body.siteContent ?? {}) })
      }

      const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/)
      if (userMatch && request.method === 'PATCH') return updateUser(request, env, userMatch[1])
      if (userMatch && request.method === 'DELETE') {
        if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userMatch[1]).run()
        return json({ users: await getAllUsers(env) })
      }

      const postMatch = url.pathname.match(/^\/api\/admin\/posts\/([^/]+)$/)
      if (postMatch && request.method === 'PATCH') return updatePost(request, env, postMatch[1])
      if (postMatch && request.method === 'DELETE') {
        if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
        await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postMatch[1]).run()
        return json({ posts: await getAllPosts(env) })
      }

      const questionMatch = url.pathname.match(/^\/api\/admin\/questions\/([^/]+)$/)
      if (questionMatch && request.method === 'DELETE') return deleteQuestionByAdmin(env, questionMatch[1])

      const disputeMatch = url.pathname.match(/^\/api\/admin\/question-disputes\/([^/]+)$/)
      if (disputeMatch && request.method === 'PATCH') return updateQuestionDispute(request, env, disputeMatch[1])
      if (disputeMatch && request.method === 'DELETE') {
        if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
        await ensureQuestionTables(env)
        await env.DB.prepare('DELETE FROM question_disputes WHERE id = ?').bind(disputeMatch[1]).run()
        return json({ questionDisputes: await getQuestionDisputes(env) })
      }

      const pointOrderMatch = url.pathname.match(/^\/api\/admin\/point-orders\/([^/]+)$/)
      if (pointOrderMatch && request.method === 'PATCH') return updatePointOrder(request, env, pointOrderMatch[1])

      const withdrawalMatch = url.pathname.match(/^\/api\/admin\/withdrawals\/([^/]+)$/)
      if (withdrawalMatch && request.method === 'PATCH') return updateWithdrawalRequest(request, env, withdrawalMatch[1])

      const partnerMatch = url.pathname.match(/^\/api\/admin\/partners\/([^/]+)$/)
      if (partnerMatch && request.method === 'PATCH') return updatePartnerApplication(request, env, partnerMatch[1])
      if (partnerMatch && request.method === 'DELETE') {
        if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
        await env.DB.prepare('DELETE FROM partner_applications WHERE id = ?').bind(partnerMatch[1]).run()
        return json({ partnerApplications: await getPartnerApplications(env) })
      }

      const merchantLeadMatch = url.pathname.match(/^\/api\/admin\/merchant-leads\/([^/]+)$/)
      if (merchantLeadMatch && request.method === 'PATCH') return updateMerchantLead(request, env, merchantLeadMatch[1])
      if (merchantLeadMatch && request.method === 'DELETE') {
        if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
        await ensureMerchantLeadTables(env)
        await env.DB.prepare('DELETE FROM merchant_leads WHERE id = ?').bind(merchantLeadMatch[1]).run()
        return json({ merchantLeads: await getMerchantLeads(env) })
      }

      const reportMatch = url.pathname.match(/^\/api\/admin\/reports\/([^/]+)$/)
      if (reportMatch && request.method === 'PATCH') return updateContentReport(request, env, reportMatch[1])
      if (reportMatch && request.method === 'DELETE') {
        if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
        await ensureComplianceTables(env)
        await env.DB.prepare('DELETE FROM content_reports WHERE id = ?').bind(reportMatch[1]).run()
        return json({ reports: await getContentReports(env) })
      }
    }

    return json({ error: 'Not found' }, { status: 404 })
  },
}
