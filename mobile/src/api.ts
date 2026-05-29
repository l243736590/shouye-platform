import { siteSeedPosts, siteSeedQuestions } from './data'
import type { AppContent, AuthUser, ManagedMerchant, MerchantBrandDecoration, PhoneRegisterPayload, Post, Question } from './types'

const API_BASE = 'https://shouye.fun'

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
}

function mergeById<T extends { id: string }>(seedRows: T[], remoteRows: T[] = []) {
  const seedIds = new Set(seedRows.map((row) => row.id))
  return [...seedRows, ...remoteRows.filter((row) => row?.id && !seedIds.has(row.id))]
}

function resolveAssetUrl(value?: string) {
  if (!value) return value
  if (/^(https?:|data:|file:)/.test(value)) return value
  return `${API_BASE}${value.startsWith('/') ? value : `/${value}`}`
}

function normalizePost(post: Post): Post {
  return {
    ...post,
    summary: post.summary || post.excerpt || post.body?.slice(0, 120) || '',
    price: Number(post.price || 0),
    likes: Number(post.likes || 0),
    views: Number(post.views || 0),
    tags: Array.isArray(post.tags) ? post.tags : [],
    featured: Boolean(post.featured || post.isFeatured),
    isFeatured: Boolean(post.isFeatured || post.featured),
    image: resolveAssetUrl(post.image)
  }
}

function normalizeQuestion(question: Question): Question {
  return {
    ...question,
    rewardPoints: Number(question.rewardPoints || 0),
    answersCount: Number(question.answersCount || 0),
    views: Number(question.views || 0)
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'content-type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const data = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) {
    throw new Error(data.error || `请求失败：${response.status}`)
  }
  return data as T
}

export async function fetchQuestions(): Promise<Question[]> {
  try {
    const data = await request<{ questions?: Question[] }>('/api/questions')
    return mergeById(siteSeedQuestions, data.questions ?? []).map(normalizeQuestion)
  } catch {
    return siteSeedQuestions.map(normalizeQuestion)
  }
}

export async function fetchPosts(): Promise<Post[]> {
  try {
    const data = await request<{ posts?: Post[] }>('/api/posts')
    return mergeById(siteSeedPosts, data.posts ?? []).map(normalizePost)
  } catch {
    return siteSeedPosts.map(normalizePost)
  }
}

export async function fetchAppContent(): Promise<AppContent> {
  const [questions, posts, merchantsData, decorationsData] = await Promise.all([
    fetchQuestions(),
    fetchPosts(),
    request<{ managedMerchants?: ManagedMerchant[] }>('/api/managed-merchants').catch(() => ({ managedMerchants: [] })),
    request<{ merchantBrandDecorations?: MerchantBrandDecoration[] }>('/api/merchant-brand-decorations').catch(() => ({ merchantBrandDecorations: [] }))
  ])

  const merchants = (merchantsData.managedMerchants ?? [])
    .filter((merchant) => merchant.status !== 'hidden')
    .map((merchant) => ({
      ...merchant,
      logoImage: resolveAssetUrl(merchant.logoImage)
    }))
    .sort((first, second) => {
      const pinnedDelta = Number(second.level === 'pinned') - Number(first.level === 'pinned')
      if (pinnedDelta) return pinnedDelta
      return (second.updatedAt || '').localeCompare(first.updatedAt || '')
    })

  return {
    questions,
    posts,
    merchants,
    merchantBrandDecorations: (decorationsData.merchantBrandDecorations ?? []).map((decoration) => ({
      ...decoration,
      logoImage: resolveAssetUrl(decoration.logoImage),
      heroImage: resolveAssetUrl(decoration.heroImage),
      serviceImage: resolveAssetUrl(decoration.serviceImage)
    })),
    syncedAt: new Date().toISOString()
  }
}

export async function login(account: string, password: string): Promise<AuthUser> {
  const normalizedAccount = account.trim()
  const normalizedEmail = normalizedAccount.includes('@') ? normalizedAccount.toLowerCase() : undefined
  const normalizedPhone = normalizedEmail ? undefined : normalizedAccount

  const data = await request<{ user?: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: {
      account: normalizedAccount,
      email: normalizedEmail,
      phone: normalizedPhone,
      password
    }
  })
  if (!data.user) throw new Error('登录失败，请稍后再试。')
  return data.user
}

export async function sendPhoneCode(phone: string): Promise<string> {
  const data = await request<{ message?: string }>('/api/auth/send-phone-code', {
    method: 'POST',
    body: { phone }
  })
  return data.message || '验证码已发送，请检查手机短信。'
}

export async function registerPhoneAccount(payload: PhoneRegisterPayload): Promise<AuthUser> {
  const data = await request<{ user?: AuthUser }>('/api/auth/register-phone', {
    method: 'POST',
    body: payload
  })
  if (!data.user) throw new Error('注册失败，请稍后再试。')
  return data.user
}
