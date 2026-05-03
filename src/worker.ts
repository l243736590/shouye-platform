type Env = {
  DB?: D1Database
  ASSETS: Fetcher
  ADMIN_USERNAME: string
  ADMIN_PASSWORD_HASH: string
  RESEND_API_KEY?: string
  MAIL_FROM?: string
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
  status: 'pending' | 'contacted' | 'closed'
  createdAt: string
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

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  })

const siteOrigin = 'https://shouye.fun'

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
  <url><loc>${siteOrigin}/categories</loc></url>
  <url><loc>${siteOrigin}/schools/konkuk</loc></url>
  <url><loc>${siteOrigin}/schools/chungang</loc></url>
  <url><loc>${siteOrigin}/schools/korea</loc></url>
  <url><loc>${siteOrigin}/schools/yonsei</loc></url>
</urlset>`

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteOrigin}/sitemap.xml
`

const injectSeoHtml = (html: string, requestUrl: URL) => {
  const normalizedPath = requestUrl.pathname === '/' ? '/' : requestUrl.pathname.replace(/\/$/, '')
  const meta = pageMeta(normalizedPath)
  const canonicalPath = normalizedPath === '/' ? '/' : normalizedPath
  const canonicalUrl = `${siteOrigin}${canonicalPath}`
  const safeTitle = escapeHtml(meta.title)
  const safeDescription = escapeHtml(meta.description)
  const safeKeywords = escapeHtml(meta.keywords ?? defaultKeywords)
  const seoContent = normalizedPath === '/' ? homeSeoContent : routeSeoContent(normalizedPath)

  let nextHtml = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="description" content="${safeDescription}" />`,
    )
    .replace(
      /<meta\s+name="keywords"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="keywords" content="${safeKeywords}" />`,
    )
    .replace(/\s*<noscript\s+id="seo-prerender-[^"]*">[\s\S]*?<\/noscript>/gi, '')

  const socialMeta = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="application-name" content="留学生首页" />
    <meta name="apple-mobile-web-app-title" content="留学生首页" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '留学生首页',
      url: siteOrigin,
      description: meta.description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteOrigin}/posts?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    })}</script>`

  nextHtml = nextHtml.replace('</head>', `${socialMeta}\n  </head>`)
  nextHtml = nextHtml.replace('<div id="root"></div>', `<div id="root"></div>\n    ${seoContent}`)
  return nextHtml
}

const serveHtmlWithSeo = async (request: Request, env: Env, requestUrl: URL, assetPath = requestUrl.pathname) => {
  const assetUrl = new URL(assetPath, request.url)
  const response = await env.ASSETS.fetch(new Request(assetUrl, request))
  if (!response.ok) return response
  const html = await response.text()
  return new Response(injectSeoHtml(html, requestUrl), {
    headers: {
      'cache-control': 'public, max-age=300',
      'content-type': 'text/html; charset=utf-8',
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

const readBody = async <T>(request: Request) => {
  try {
    return (await request.json()) as Partial<T>
  } catch {
    return {} as Partial<T>
  }
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

const getPartnerApplications = async (env: Env) => {
  if (!env.DB) return []
  const rows = await env.DB.prepare('SELECT * FROM partner_applications ORDER BY created_at DESC').all<
    Record<string, unknown>
  >()
  return (rows.results ?? []).map(rowToPartnerApplication)
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

const sendVerificationEmail = async (env: Env, email: string, code: string) => {
  if (!env.RESEND_API_KEY) {
    return { ok: false, error: '邮件服务暂未开通，请稍后再试。' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: env.MAIL_FROM || '留学生经验分享与问题解决平台 <noreply@shouye.fun>',
      to: [email],
      subject: '留学生经验分享与问题解决平台验证码',
      html: `<p>你的平台注册验证码是：</p><h2>${code}</h2><p>验证码 10 分钟内有效。</p>`,
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

const handleSendVerificationCode = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<{ email: string }>(request)
  const email = body.email?.trim().toLowerCase()

  if (!email) return json({ error: '请先填写邮箱。' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: '邮箱格式不正确。' }, { status: 400 })

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return json({ error: '这个邮箱已经注册过了，可以直接登录。' }, { status: 409 })

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 10)
  const sent = await sendVerificationEmail(env, email, code)

  if (!sent.ok) return json({ error: sent.error }, { status: 503 })

  await env.DB.prepare(
    `INSERT OR REPLACE INTO email_verifications (email, code_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(email, await hashText(code), expiresAt.toISOString(), now.toISOString())
    .run()

  return json({ ok: true })
}

const verifyEmailCode = async (env: Env, email: string, code: string) => {
  if (!env.DB) return false
  const row = await env.DB.prepare('SELECT * FROM email_verifications WHERE email = ?').bind(email).first<
    Record<string, unknown>
  >()
  if (!row) return false
  if (String(row.expires_at) < new Date().toISOString()) return false
  return String(row.code_hash) === (await hashText(code))
}

const handleRegister = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: '数据服务暂时不可用。' }, { status: 503 })
  const body = await readBody<{
    name: string
    email: string
    password: string
    emailCode: string
    identity: string
    school: string
    avatarUrl: string
    bio: string
    documents: CredentialDocument[]
  }>(request)
  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''

  if (!email || !password) return json({ error: '邮箱和密码不能为空。' }, { status: 400 })
  if (!(await verifyEmailCode(env, email, body.emailCode ?? ''))) {
    return json({ error: '邮箱验证码不正确或已过期。' }, { status: 400 })
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return json({ error: '这个邮箱已经注册过了。' }, { status: 409 })

  const userId = createId('user')
  const joinedAt = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO users
      (id, name, email, password_hash, identity, school, points, earning_points, joined_at, status, verification_status, avatar_url, bio)
      VALUES (?, ?, ?, ?, ?, ?, 30, 0, ?, 'active', 'pending', ?, ?)`,
  )
    .bind(
      userId,
      body.name?.trim() || '韩国留学用户',
      email,
      await hashText(password),
      body.identity || '准备申请',
      body.school?.trim() || '暂未填写',
      joinedAt,
      body.avatarUrl?.trim() || '',
      body.bio?.trim() || '',
    )
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
        document.uploadedAt || joinedAt,
      )
      .run()
  }

  const user = rowToUser(
    {
      id: userId,
      name: body.name?.trim() || '韩国留学用户',
      email,
      identity: body.identity || '准备申请',
      school: body.school?.trim() || '暂未填写',
      points: 30,
      earning_points: 0,
      joined_at: joinedAt,
      status: 'active',
      verification_status: 'pending',
      avatar_url: body.avatarUrl?.trim() || '',
      bio: body.bio?.trim() || '',
    },
    body.documents ?? [],
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
  const body = await readBody<PostRecord & { userId: string }>(request)
  const user = body.userId
    ? await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(body.userId).first<Record<string, unknown>>()
    : null

  if (!user) return json({ error: '请先登录后再发布内容。' }, { status: 401 })
  if (user.status === 'muted' || user.status === 'banned') {
    return json({ error: user.status === 'muted' ? '账号已被禁言。' : '账号已被封号。' }, { status: 403 })
  }

  const post: PostRecord = {
    id: createId('post'),
    title: body.title?.trim() || '',
    school: body.school?.trim() || '韩国留学',
    category: body.category || '申请避坑',
    author: String(user.name),
    authorId: String(user.id),
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
      post.authorId,
      post.price,
      post.hot,
      post.excerpt,
      post.body,
      post.createdAt,
      post.featured ? 1 : 0,
    )
    .run()

  await env.DB.prepare('UPDATE users SET points = points + 10 WHERE id = ?').bind(user.id).run()

  return json({ post })
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
            'cache-control': 'public, max-age=300',
            'content-type': 'text/html; charset=utf-8',
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
    if (url.pathname === '/api/auth/send-code' && request.method === 'POST') {
      return handleSendVerificationCode(request, env)
    }
    if (url.pathname === '/api/auth/register' && request.method === 'POST') return handleRegister(request, env)
    if (url.pathname === '/api/auth/login' && request.method === 'POST') return handleLogin(request, env)
    if (url.pathname === '/api/posts' && request.method === 'POST') return handlePostCreate(request, env)
    const postUnlockMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/unlock$/)
    if (postUnlockMatch && request.method === 'POST') return handlePostUnlock(request, env, postUnlockMatch[1])
    const publicPostMatch = url.pathname.match(/^\/api\/posts\/([^/]+)$/)
    if (publicPostMatch && request.method === 'DELETE') return deleteOwnPost(request, env, publicPostMatch[1])
    if (url.pathname === '/api/partner-applications' && request.method === 'POST') {
      return handlePartnerCreate(request, env)
    }
    if (url.pathname === '/api/admin/login' && request.method === 'POST') return handleAdminLogin(request, env)

    const publicUserMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/)
    if (publicUserMatch && request.method === 'PATCH') return updateProfile(request, env, publicUserMatch[1])

    if (url.pathname.startsWith('/api/admin/')) {
      if (!(await requireAdmin(request, env))) return json({ error: '未登录管理员。' }, { status: 401 })

      if (url.pathname === '/api/admin/state' && request.method === 'GET') {
        return json({
          users: await getAllUsers(env),
          posts: await getAllPosts(env),
          partnerApplications: await getPartnerApplications(env),
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
    }

    return json({ error: 'Not found' }, { status: 404 })
  },
}
