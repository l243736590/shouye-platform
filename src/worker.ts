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

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  })

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

const defaultSeo = {
  title: '留学生首页 - 留学生经验分享与问题解决平台',
  description:
    '留学生首页是一个面向留学生的经验分享与问答社区，提供签证、租房、入学、打工、保险、银行卡、毕业和就业等真实经验，帮助留学生少走弯路。',
  keywords: '留学生, 留学经验, 韩国留学, 留学生生活, 签证, 租房, 打工, 大学院, 外国人登录证, 留学问答',
  canonical: 'https://shouye.fun',
}

const getSeoForPath = (pathname: string) => {
  if (pathname === '/schools/konkuk') {
    return {
      ...defaultSeo,
      title: '建国大学留学生生活攻略 - 留学生首页',
      description:
        '建国大学留学生生活攻略，整理建国大学入学、选课、租房、签证、外国人登录证、打工、医院、银行卡和校园生活相关经验，帮助韩国留学生少走弯路。',
      canonical: 'https://shouye.fun/schools/konkuk',
    }
  }

  return defaultSeo
}

const replaceTag = (html: string, pattern: RegExp, replacement: string) =>
  pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`)

const injectSeo = async (response: Response, pathname: string) => {
  const seo = getSeoForPath(pathname)
  let html = await response.text()

  html = replaceTag(html, /<title>.*?<\/title>/i, `<title>${seo.title}</title>`)
  html = replaceTag(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${seo.description}" />`)
  html = replaceTag(html, /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${seo.keywords}" />`)
  html = replaceTag(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${seo.title}" />`)
  html = replaceTag(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${seo.description}" />`)
  html = replaceTag(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${seo.canonical}" />`)
  html = replaceTag(html, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${seo.title}" />`)
  html = replaceTag(html, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${seo.description}" />`)
  html = replaceTag(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${seo.canonical}" />`)

  const headers = new Headers(response.headers)
  headers.set('content-type', 'text/html; charset=utf-8')
  headers.delete('content-length')

  return new Response(html, { status: response.status, statusText: response.statusText, headers })
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

    const legacySchoolMatch = url.pathname.match(/^\/school\/([^/]+)$/)
    if (legacySchoolMatch) {
      url.pathname = `/schools/${legacySchoolMatch[1]}`
      return Response.redirect(url.toString(), 301)
    }

    if (!url.pathname.startsWith('/api/')) {
      let response = await env.ASSETS.fetch(request)
      if (response.status === 404 && !url.pathname.split('/').pop()?.includes('.')) {
        response = await env.ASSETS.fetch(new Request(new URL('/', request.url), request))
      }

      if (response.headers.get('content-type')?.includes('text/html')) {
        return injectSeo(response, url.pathname)
      }

      return response
    }

    if (url.pathname === '/api/health') return json({ ok: true })
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
        })
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
