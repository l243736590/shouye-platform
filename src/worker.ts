type Env = {
  DB?: D1Database
  ASSETS: Fetcher
  ADMIN_USERNAME: string
  ADMIN_PASSWORD_HASH: string
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
  joinedAt: string
  status: UserStatus
  verificationStatus: VerificationStatus
  documents: CredentialDocument[]
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
  joinedAt: String(row.joined_at),
  status: String(row.status) as UserStatus,
  verificationStatus: String(row.verification_status) as VerificationStatus,
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

const handleRegister = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: 'D1 数据库尚未绑定。' }, { status: 503 })
  const body = await readBody<{
    name: string
    email: string
    password: string
    identity: string
    school: string
    documents: CredentialDocument[]
  }>(request)
  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''

  if (!email || !password) return json({ error: '邮箱和密码不能为空。' }, { status: 400 })

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return json({ error: '这个邮箱已经注册过了。' }, { status: 409 })

  const userId = createId('user')
  const joinedAt = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO users
      (id, name, email, password_hash, identity, school, points, joined_at, status, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, 80, ?, 'active', 'pending')`,
  )
    .bind(
      userId,
      body.name?.trim() || '韩国留学用户',
      email,
      await hashText(password),
      body.identity || '准备申请',
      body.school?.trim() || '暂未填写',
      joinedAt,
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
      points: 80,
      joined_at: joinedAt,
      status: 'active',
      verification_status: 'pending',
    },
    body.documents ?? [],
  )

  return json({ user })
}

const handleLogin = async (request: Request, env: Env) => {
  if (!env.DB) return json({ error: 'D1 数据库尚未绑定。' }, { status: 503 })
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
  if (!env.DB) return json({ error: 'D1 数据库尚未绑定。' }, { status: 503 })
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
  if (!env.DB) return json({ error: 'D1 数据库尚未绑定。' }, { status: 503 })
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

  await env.DB.prepare('UPDATE users SET points = points + 30 WHERE id = ?').bind(user.id).run()

  return json({ post })
}

const updateUser = async (request: Request, env: Env, userId: string) => {
  if (!env.DB) return json({ error: 'D1 数据库尚未绑定。' }, { status: 503 })
  const body = await readBody<Partial<UserRecord>>(request)
  const existing = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  if (!existing) return json({ error: '用户不存在。' }, { status: 404 })

  await env.DB.prepare(
    `UPDATE users SET
      name = COALESCE(?, name),
      identity = COALESCE(?, identity),
      school = COALESCE(?, school),
      points = COALESCE(?, points),
      status = COALESCE(?, status),
      verification_status = COALESCE(?, verification_status)
     WHERE id = ?`,
  )
    .bind(
      body.name ?? null,
      body.identity ?? null,
      body.school ?? null,
      typeof body.points === 'number' ? body.points : null,
      body.status ?? null,
      body.verificationStatus ?? null,
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
  if (!env.DB) return json({ error: 'D1 数据库尚未绑定。' }, { status: 503 })
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request)
    }

    if (url.pathname === '/api/health') return json({ ok: true })
    if (url.pathname === '/api/posts' && request.method === 'GET') return json({ posts: await getAllPosts(env) })
    if (url.pathname === '/api/auth/register' && request.method === 'POST') return handleRegister(request, env)
    if (url.pathname === '/api/auth/login' && request.method === 'POST') return handleLogin(request, env)
    if (url.pathname === '/api/posts' && request.method === 'POST') return handlePostCreate(request, env)
    if (url.pathname === '/api/admin/login' && request.method === 'POST') return handleAdminLogin(request, env)

    if (url.pathname.startsWith('/api/admin/')) {
      if (!(await requireAdmin(request, env))) return json({ error: '未登录管理员。' }, { status: 401 })

      if (url.pathname === '/api/admin/state' && request.method === 'GET') {
        return json({ users: await getAllUsers(env), posts: await getAllPosts(env) })
      }

      const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/)
      if (userMatch && request.method === 'PATCH') return updateUser(request, env, userMatch[1])
      if (userMatch && request.method === 'DELETE') {
        if (!env.DB) return json({ error: 'D1 数据库尚未绑定。' }, { status: 503 })
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userMatch[1]).run()
        return json({ users: await getAllUsers(env) })
      }

      const postMatch = url.pathname.match(/^\/api\/admin\/posts\/([^/]+)$/)
      if (postMatch && request.method === 'PATCH') return updatePost(request, env, postMatch[1])
      if (postMatch && request.method === 'DELETE') {
        if (!env.DB) return json({ error: 'D1 数据库尚未绑定。' }, { status: 503 })
        await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postMatch[1]).run()
        return json({ posts: await getAllPosts(env) })
      }
    }

    return json({ error: 'Not found' }, { status: 404 })
  },
}
