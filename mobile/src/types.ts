export type Question = {
  id: string
  title: string
  detail?: string
  category?: string
  school?: string
  author?: string
  rewardPoints?: number
  answersCount?: number
  views?: number
  status?: string
  createdAt?: string
}

export type Post = {
  id: string
  slug?: string
  title: string
  summary?: string
  excerpt?: string
  body?: string
  school?: string
  category?: string
  country?: string
  city?: string
  author?: string
  identity?: string
  price?: number
  hot?: string
  views?: number
  likes?: number
  bookmarks?: number
  tags?: string[]
  featured?: boolean
  isFeatured?: boolean
  contentType?: string
  createdAt?: string
  updatedAt?: string
  image?: string
}

export type ManagedMerchant = {
  id: string
  category: string
  name: string
  logo?: string
  summary?: string
  description?: string
  tags?: string[]
  verified?: boolean
  location?: string
  detailTone?: string
  level?: 'normal' | 'pinned'
  logoImage?: string
  status?: 'active' | 'hidden'
  createdAt?: string
  updatedAt?: string
}

export type MerchantBrandDecoration = {
  brandId: string
  ownerUserId?: string
  badge?: string
  heroTitle?: string
  intro?: string
  contactCopy?: string
  panelLabel?: string
  panelTitle?: string
  sectionOneTitle?: string
  sectionOneText?: string
  sectionTwoTitle?: string
  sectionTwoText?: string
  sectionThreeTitle?: string
  sectionThreeText?: string
  logoImage?: string
  logoReviewStatus?: 'pending' | 'approved' | 'rejected'
  heroImage?: string
  serviceImage?: string
  updatedAt?: string
}

export type AppContent = {
  questions: Question[]
  posts: Post[]
  merchants: ManagedMerchant[]
  merchantBrandDecorations: MerchantBrandDecoration[]
  syncedAt: string
}

export type AuthUserType = 'student' | 'merchant'

export type AuthUser = {
  id: string
  name: string
  email: string
  identity: string
  school: string
  points: number
  earningPoints: number
  joinedAt: string
  status: 'active' | 'muted' | 'banned'
  verificationStatus: 'pending' | 'approved' | 'rejected'
  avatarUrl: string
  bio: string
}

export type PhoneRegisterPayload = {
  userType: AuthUserType
  phone: string
  phoneCode: string
  password: string
  confirmPassword: string
  realName: string
  identityNumber: string
  studentStage?: string
  nickname?: string
  businessName?: string
  businessCategory?: string
  country?: string
  city?: string
  school?: string
}

export type TabKey = 'home' | 'questions' | 'solve' | 'posts' | 'profile'

export type Screen =
  | { name: 'login' }
  | { name: 'entry' }
  | { name: 'tab'; tab: TabKey }
  | { name: 'post-detail'; post: Post }
  | { name: 'question-detail'; question: Question; role: 'reader' | 'helper' }
