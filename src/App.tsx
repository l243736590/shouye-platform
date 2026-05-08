import type { ChangeEvent, CSSProperties, DragEvent, FormEvent, MouseEvent, PointerEvent } from 'react'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  BookOpenCheck,
  BookOpenText,
  CircleDollarSign,
  Coins,
  GraduationCap,
  LockKeyhole,
  LogIn,
  MapPin,
  MessageSquareText,
  MousePointer2,
  PenLine,
  Pipette,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  SquareDashedMousePointer,
  Trash2,
  TrendingUp,
  Type,
  UploadCloud,
  UserPlus,
  X,
} from 'lucide-react'
import './App.css'
import { getSchoolTopicBySlug, type SchoolTopic } from './data/schools'

type UserStatus = 'active' | 'muted' | 'banned'
type VerificationStatus = 'pending' | 'approved' | 'rejected'
type AuthUserType = 'student' | 'merchant'
type StudentStage = 'preparing' | 'admitted' | 'language_school' | 'undergraduate' | 'graduate' | 'graduated'
type PublishMode = 'knowledge' | 'skill'
type MerchantLevel = 'normal' | 'pinned'

type CredentialDocument = {
  id: string
  name: string
  type: string
  status: VerificationStatus
  uploadedAt: string
  dataUrl?: string
}

type User = {
  id: string
  name: string
  email: string
  password: string
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

type UserBioSettings = {
  userType?: AuthUserType
  businessName?: string
  businessCategory?: string
  country?: string
  city?: string
  managedBrandId?: string
  managedBrandName?: string
  managedBrandLevel?: MerchantLevel
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
  reviewNote: string
  status: 'pending' | 'approved' | 'rejected' | 'contacted' | 'closed'
  createdAt: string
}

type PartnerApplicationReviewDraft = {
  status: PartnerApplication['status']
  reviewNote: string
}

type PartnerMerchant = {
  id?: string
  name: string
  logo: string
  logoImage?: string
  summary: string
  description: string
  tags: string[]
  verified?: boolean
  location?: string
  detailTone?: string
  level?: MerchantLevel
  detailSections?: { title: string; text: string }[]
}

type PartnerShowcase = {
  type: string
  audience: string
  tone: string
  merchants: PartnerMerchant[]
}

type MerchantLead = {
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

type MerchantDesignZone = 'hero' | 'service' | 'showcase'
type MerchantStageLayerId = `text:${MerchantEditableTextField}` | `media:${'hero' | 'service'}` | `design:${string}`
type MerchantDesignItem = {
  id: string
  zone: MerchantDesignZone
  kind: 'bubble' | 'media'
  text: string
  mediaUrl: string
  mediaKind: 'image' | 'video'
  x: number
  y: number
  width: number
  height: number
  z: number
  opacity: number
  fontSize: number
  color: string
  background: string
}

type MerchantTextLayerStyle = {
  x: number
  y: number
  z: number
  fontSize: number
  color: string
}

type TextPopoverAnchor = {
  left: number
  top: number
  width: number
  fontSize: number
}

const MERCHANT_TEXT_FONT_SIZE_OPTIONS = [0, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96, 108, 120]

type MerchantBrandDecoration = {
  brandId: string
  ownerUserId?: string
  badge: string
  heroTitle: string
  intro: string
  contactCopy: string
  panelLabel: string
  panelTitle: string
  sectionOneTitle: string
  sectionOneText: string
  sectionTwoTitle: string
  sectionTwoText: string
  sectionThreeTitle: string
  sectionThreeText: string
  caseOne: string
  caseTwo: string
  showcaseArtTitle: string
  showcaseArtSubtitle: string
  logoImage: string
  pendingLogoImage: string
  logoReviewStatus: VerificationStatus
  fontFamily: string
  titleColor: string
  bodyColor: string
  accentColor: string
  heroImage: string
  heroImageX: number
  heroImageY: number
  heroImageScale: number
  serviceImage: string
  serviceImageX: number
  serviceImageY: number
  serviceImageScale: number
  textLayerStyles: Record<string, MerchantTextLayerStyle>
  designItems: MerchantDesignItem[]
  updatedAt: string
}

type QuestionBounty = {
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

type QuestionDispute = {
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

type PointOrder = {
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

type WithdrawalRequest = {
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

type PointLedger = {
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

type ContentReport = {
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

type Post = {
  id: string
  slug?: string
  title: string
  school: string
  category: string
  summary?: string
  author: string
  authorId?: string
  country?: string
  city?: string
  identity?: string
  views?: number
  likes?: number
  bookmarks?: number
  tags?: string[]
  contentType?: string
  price: number
  hot: string
  excerpt: string
  body: string
  createdAt: string
  updatedAt?: string
  featured: boolean
  isFeatured?: boolean
  sources?: ResourceLink[]
}

type QuestionStatus = 'open' | 'solved'

type CommunityQuestion = {
  id: string
  slug?: string
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
  identity: string
  tags: string[]
  detail: string
}

type QuestionAnswer = {
  id: string
  questionId: string
  author: string
  identity: string
  content: string
  likes: number
  accepted: boolean
  createdAt: string
}

type OfflineBountyTask = {
  id: string
  title: string
  category: string
  school: string
  city: string
  amountYuan: number
  deadline: string
  status: 'open' | 'matched'
  tags: string[]
  detail: string
}

type CityGuide = {
  id: string
  title: string
  category: string
  country: string
  city: string
  school: string
  summary: string
  tags: string[]
  updatedAt: string
}

type ResourceLink = {
  label: string
  url: string
  kind?: 'official' | 'download' | 'reference'
  download?: boolean
}

const officialLinks = {
  hiKoreaMain: 'https://www.hikorea.go.kr',
  hiKoreaElectronicApplicationGuide: 'https://www.hikorea.go.kr/cvlappl/CvlapplInfoPageR.pt',
  hiKoreaElectronicApplication: 'https://www.hikorea.go.kr/cvlappl/CvlapplStep1.pt',
  hiKoreaVisitReservation: 'https://www.hikorea.go.kr/resv/ResvIntroR.pt?locale=en',
  hiKoreaForms: 'https://www.hikorea.go.kr/board/BoardApplicationListR.pt',
  studyInKoreaMain: 'https://www.studyinkorea.go.kr/en_US/main.do',
  studyInKoreaVisaStay: 'https://www.studyinkorea.go.kr/en_US/plan/visaAndStay.do',
  studyInKoreaResidenceStay: 'https://www.studyinkorea.go.kr/eng/life/residenceAndStayInfo.do',
  koreaVisaPortal: 'https://www.visa.go.kr',
  seoulHousing: 'https://housing.seoul.go.kr',
  nhisEnglish: 'https://www.nhis.or.kr/english/',
}

const materialLinks = {
  studyApplicationChecklist: '/resources/korea-study-application-materials-checklist.txt',
  visaAdmissionChecklist: '/resources/korea-visa-admission-preflight-checklist.txt',
  hikoreaExtensionChecklist: '/resources/hikorea-d2-d4-extension-checklist.txt',
  arcAddressChecklist: '/resources/hikorea-arc-address-change-checklist.txt',
  partTimeWorkChecklist: '/resources/korea-part-time-work-permit-checklist.txt',
  d10JobSeekingChecklist: '/resources/korea-d10-job-seeking-plan-checklist.txt',
}

type JourneyTopic = {
  slug: string
  title: string
  shortTitle: string
  summary: string
  heroTitle: string
  heroCopy: string
  categories: string[]
  tags: string[]
  steps: { title: string; text: string }[]
  deepDives?: {
    title: string
    label: string
    text: string
    bullets: string[]
    sourceLabel?: string
    sourceUrl?: string
    sources?: ResourceLink[]
  }[]
}

type SearchSuggestion = {
  label: string
  title: string
  description: string
  actionText: string
  onClick: () => void
}

type LegalPolicyRoute = 'terms' | 'privacy' | 'content-rules' | 'minor-privacy'

type LegalPolicyPage = {
  eyebrow: string
  title: string
  intro: string
  sections: {
    heading: string
    paragraphs: string[]
  }[]
}

const legalPolicyPages: Record<LegalPolicyRoute, LegalPolicyPage> = {
  terms: {
    eyebrow: '用户协议',
    title: '售业用户协议',
    intro:
      '本协议适用于你访问、注册、登录和使用售业的问答求助、经验发布、悬赏助人、可提现积分、商家展示及相关服务。请在使用前认真阅读，尤其是账号安全、内容发布、积分收益、线下服务风险和平台处理条款。',
    sections: [
      {
        heading: '1. 协议范围与服务定位',
        paragraphs: [
          '售业是面向留学生和准留学生的经验分享、问题求助、悬赏解决、技能助人和商家信息展示平台。平台提供信息发布、检索、互动、积分记录、举报处理和商家展示等技术服务。',
          '平台不是留学中介、律师事务所、金融机构、支付机构或担保方。用户、回答者、技能提供者、商家和线下服务双方应对各自发布内容、服务承诺、交易判断和线下行为独立负责。',
        ],
      },
      {
        heading: '2. 账号注册与真实使用',
        paragraphs: [
          '用户应使用真实、有效、可接收通知的邮箱注册账号，并妥善保管密码、验证码和设备登录状态。因账号保管不当导致的内容发布、积分使用或损失，由账号使用者自行承担。',
          '学生用户可填写学校、目标学校和留学阶段；商家用户应填写真实机构名称、服务类型、所在国家和城市。不得冒用他人身份、学校、机构、商标或认证信息。',
        ],
      },
      {
        heading: '3. 内容发布与社区规范',
        paragraphs: [
          '用户发布的问题、回答、经验帖、技能服务、评论、图片、链接和商家资料，应当真实、合法、清楚，不得误导他人或隐瞒重要风险。',
          '禁止发布非法换汇换米、洗钱跑分、代写代考、替课作弊、伪造材料、虚假商家、色情低俗、诈骗引流、侵犯隐私、恶意辱骂、歧视攻击、垃圾广告和其他违法违规内容。',
        ],
      },
      {
        heading: '4. 经验帖、问答与悬赏',
        paragraphs: [
          '经验帖应尽量说明适用学校、城市、时间、材料、流程、费用、官方链接和个人经验边界，不应把个案包装成确定承诺。',
          '悬赏问答和线下帮助应以解决真实问题为目的。提问者应准确描述背景，回答者或接单者应按约定提供实质性帮助。委托人确认完成前，相关收益可能处于冻结或沉淀状态。',
        ],
      },
      {
        heading: '5. 积分与收益规则',
        paragraphs: [
          '平台积分分为消费积分和可提现积分。消费积分可用于提问、解锁内容或参与平台功能；可提现积分来自被采纳回答、完成悬赏问答、提供精华攻略、完成悬赏任务等平台认可的收益场景。',
          '通过悬赏赚取的可提现积分需要沉淀一周后才能申请提现，用于处理投诉、撤销、纠纷和风控。平台可根据违规行为扣回异常收益、暂停提现或关闭收益权限。',
        ],
      },
      {
        heading: '6. 商家入驻与广告展示',
        paragraphs: [
          '商家应提供真实主体、联系方式、服务范围、资质说明、价格区间、优惠信息和售后规则。商家内容应明确广告或服务属性，不得冒充平台官方推荐。',
          '用户与商家之间的咨询、购买、退款、售后和线下服务由双方自行确认。平台可对商家资料进行审核、下架、拒绝展示、要求补充材料或终止合作。',
        ],
      },
      {
        heading: '7. 用户授权与知识产权',
        paragraphs: [
          '用户保留其原创内容的合法权利。为实现展示、搜索、推荐、审核、分享和平台推广，用户授予平台在必要范围内使用、复制、展示、改编排版和传播相关内容的非独占授权。',
          '用户不得发布侵犯他人著作权、商标权、肖像权、名誉权、隐私权或商业秘密的内容。如收到权利人投诉，平台可先行限制展示并要求用户补充证明。',
        ],
      },
      {
        heading: '8. 平台治理与处理措施',
        paragraphs: [
          '平台可基于法律法规、用户协议、内容发布规范、举报证据和风控规则，对内容或账号采取提醒、限流、折叠、删除、下架、禁言、封号、拒绝商家入驻、冻结积分、暂停提现等措施。',
          '用户可以通过举报入口或平台联系方式提交申诉或补充材料。平台会根据可获得的信息进行处理，但不承诺每一次处理都能达到用户期待的结果。',
        ],
      },
      {
        heading: '9. 线下服务与风险提示',
        paragraphs: [
          '跑腿、排队、地陪、宠物照看、搬家、找房、陪同办事等线下服务存在人身、财产、交通、隐私和交易风险。双方应自行核验身份、地点、价格、边界和安全措施。',
          '平台严禁以线下服务名义从事违法交易、骚扰侵害、私下换汇、金融跑分、色情服务、代写代考或其他不当行为。',
        ],
      },
      {
        heading: '10. 未成年人使用',
        paragraphs: [
          '未成年人使用平台应取得监护人同意，并在发布个人信息、进行线下见面、参与悬赏任务、购买商家服务或上传认证材料前取得监护人知情和指导。',
          '平台鼓励监护人共同阅读《未成年人个人信息保护规则》，并可联系平台行使查询、更正、删除和撤回授权等权利。',
        ],
      },
      {
        heading: '11. 免责声明与责任限制',
        paragraphs: [
          '平台会努力维护社区秩序和信息质量，但无法保证所有用户内容、商家信息、经验结论和外部链接完全准确、持续有效或适用于每个人。',
          '因用户自行发布内容、私下交易、线下接触、违反法律法规或绕开平台流程产生的责任，由行为人自行承担；平台将依法配合必要的投诉、风控和监管要求。',
        ],
      },
      {
        heading: '12. 协议变更与通知',
        paragraphs: [
          '平台可根据业务调整、法律法规或审核要求更新本协议。重大变更会通过页面提示、站内提示或其他合理方式通知。用户继续使用平台即表示接受更新后的协议。',
        ],
      },
    ],
  },
  privacy: {
    eyebrow: '隐私政策',
    title: '售业隐私政策',
    intro:
      '本政策说明售业如何收集、使用、保存、共享和保护你的个人信息，以及你如何管理自己的信息。我们坚持最小必要原则，尤其避免在注册阶段收集学生证、Offer、护照、外国人登录证等敏感材料。',
    sections: [
      {
        heading: '1. 我们收集的信息',
        paragraphs: [
          '账号信息：邮箱、昵称、密码加密校验信息、身份类型、学生阶段、学校或目标学校、城市、头像、个人简介。',
          '内容信息：你发布的问题、回答、经验帖、技能服务、商家申请、举报内容、联系方式、图片或链接，以及与积分、收藏、浏览和互动相关的记录。',
        ],
      },
      {
        heading: '2. 敏感个人信息',
        paragraphs: [
          '学生证、Offer、护照、外国人登录证、金融账户、精确住址、行踪轨迹、健康信息等可能属于敏感个人信息。平台当前不在注册时要求上传这些材料。',
          '未来如开通认证中心，会在上传前单独说明处理目的、必要性、保存期限、可见范围、审核人员权限、删除方式和撤回授权方式，并取得单独同意。',
        ],
      },
      {
        heading: '3. 使用目的',
        paragraphs: [
          '我们会将信息用于账号注册登录、验证码发送、内容发布展示、搜索推荐、积分结算、悬赏任务处理、商家审核、举报处理、风控反作弊、客服沟通和法律合规。',
          '我们不会将你的个人信息用于与平台服务无关的目的。如确需改变使用目的，会再次征得你的同意或以法律允许的方式处理。',
        ],
      },
      {
        heading: '4. 邮件与通知',
        paragraphs: [
          '注册、登录、验证码、账号安全、举报处理、积分与提现、平台规则变更等事项，可能通过邮箱、站内提示或其他联系方式通知你。',
          '验证码仅用于身份校验，并设置有效期、发送冷却和频率限制。请勿将验证码提供给他人。',
        ],
      },
      {
        heading: '5. 信息展示与公开范围',
        paragraphs: [
          '你的昵称、学校或目标学校、身份阶段、发布内容、回答、经验帖、技能服务和商家资料可能在平台内展示。邮箱、密码、验证码和后台审核记录不会公开展示。',
          '在悬赏、线下帮助或商家服务场景中，如你主动留下微信、电话、地址或其他联系方式，可能被相应互动对象看到。请谨慎填写不必要的个人信息。',
        ],
      },
      {
        heading: '6. 共享、委托处理与第三方服务',
        paragraphs: [
          '为发送邮件验证码、托管服务、数据库存储、安全审计、支付提现或法律合规，我们可能使用云服务、邮件服务和其他必要服务商。我们会要求服务商仅在授权范围内处理信息。',
          '未经你同意，我们不会向无关第三方出售个人信息。根据法律法规、监管要求、司法机关或维护用户权益的必要情形除外。',
        ],
      },
      {
        heading: '7. 保存期限',
        paragraphs: [
          '账号信息一般在账号存续期间保存；内容、积分、举报、商家审核、交易风控和日志信息会在实现目的所需期限内保存。',
          '当你注销账号、删除内容或撤回授权后，平台会在合理期限内删除或匿名化处理相关信息；但依法需要留存或为处理争议、风控、审计而必要保存的信息除外。',
        ],
      },
      {
        heading: '8. 信息安全',
        paragraphs: [
          '平台采取访问控制、后台权限管理、必要字段隐藏、接口校验、内容审核和数据备份等措施保护个人信息。',
          '互联网服务无法保证绝对安全。如发现账号异常、信息泄露或被冒用，请尽快通过找回账号、举报入口或平台联系方式通知我们。',
        ],
      },
      {
        heading: '9. 你的权利',
        paragraphs: [
          '你可以查询、更正、补充、删除个人信息，撤回授权，注销账号，复制部分个人信息，或对自动化推荐、内容审核和平台处理提出说明请求。',
          '为了保护账号安全，平台可能要求你提供必要信息以核验身份。涉及他人权益、平台风控、法律义务或争议处理的信息，可能无法立即删除。',
        ],
      },
      {
        heading: '10. 未成年人信息',
        paragraphs: [
          '未成年人使用平台应取得监护人同意。平台不会主动要求未成年人公开真实姓名、证件号码、住址、学校班级、金融账户等高风险信息。',
          '监护人可依据《未成年人个人信息保护规则》联系平台查询、更正、删除相关信息或撤回授权。',
        ],
      },
      {
        heading: '11. Cookie 与本地存储',
        paragraphs: [
          '平台可能使用浏览器本地存储保存登录状态、界面设置、已解锁内容、筛选条件等，以提升使用体验。你可以通过浏览器设置清理本地数据，但部分功能可能受到影响。',
        ],
      },
      {
        heading: '12. 跨境与韩国场景提示',
        paragraphs: [
          '平台围绕韩国留学场景提供信息，但用户发布内容可能涉及境外学校、商家、房源、机构或服务。请避免公开护照、登陆证、银行卡、住址、联系方式等高风险信息。',
        ],
      },
    ],
  },
  'minor-privacy': {
    eyebrow: '未成年人个人信息保护规则',
    title: '售业未成年人个人信息保护规则',
    intro:
      '本规则用于说明未成年人，尤其是不满十四周岁的儿童，在使用售业时个人信息如何被保护。未成年人使用平台前，应由监护人共同阅读并同意本规则、用户协议和隐私政策。',
    sections: [
      {
        heading: '1. 监护人同意',
        paragraphs: [
          '未成年人注册、登录、发布内容、参与悬赏、购买商家服务、进行线下帮助或上传认证材料前，应取得监护人同意。不满十四周岁的儿童应由监护人代为或陪同完成相关操作。',
          '如果监护人不同意未成年人继续使用平台，可联系平台要求限制、删除或注销相关账号和信息。',
        ],
      },
      {
        heading: '2. 最小必要收集',
        paragraphs: [
          '平台默认只收集实现账号和社区功能所必需的信息，例如邮箱、昵称、学校或目标学校、身份阶段、发布内容和互动记录。',
          '平台不会在注册阶段要求上传学生证、Offer、护照、外国人登录证、银行卡、家庭住址等敏感信息。',
        ],
      },
      {
        heading: '3. 认证材料的单独规则',
        paragraphs: [
          '未来如上线认证中心，未成年人上传任何认证材料前，平台会单独说明上传目的、材料类型、保存期限、审核人员范围、是否公开、删除方式和撤回授权方式。',
          '认证材料仅用于核验身份或资质，不会作为普通帖子内容公开展示。平台会尽量采用遮挡、最小可见和限权审核方式降低风险。',
        ],
      },
      {
        heading: '4. 禁止公开的高风险信息',
        paragraphs: [
          '未成年人不应在帖子、回答、评论、私下沟通或商家咨询中公开真实姓名、证件号码、护照、外国人登录证、银行卡、具体住址、宿舍门牌、行踪安排、联系方式和家庭成员信息。',
          '如发现上述信息被公开，平台可先行隐藏、删除或限制展示，以保护未成年人安全。',
        ],
      },
      {
        heading: '5. 线下服务保护',
        paragraphs: [
          '未成年人参与跑腿、排队、地陪、宠物照看、搬家、找房、陪同办事等线下帮助前，应取得监护人知情同意，并确认时间、地点、人员、费用和安全边界。',
          '平台不鼓励未成年人单独赴陌生地点完成线下任务，也不允许任何人利用平台对未成年人进行骚扰、诱导、欺诈、胁迫或不当交易。',
        ],
      },
      {
        heading: '6. 内容与学习诚信',
        paragraphs: [
          '平台严禁面向未成年人发布代写、代考、替课、买卖答案、伪造材料、非法换汇、色情低俗、赌博、洗钱跑分、暴力危险或其他违法违规内容。',
          '学习相关帮助应限于资料整理、方法讲解、修改建议、学习规划和经验分享，不得替代未成年人完成应由本人完成的作业、考试或申请材料。',
        ],
      },
      {
        heading: '7. 监护人权利',
        paragraphs: [
          '监护人可以联系平台查询、更正、删除未成年人个人信息，撤回授权，注销账号，限制未成年人继续使用部分功能，或要求说明相关信息处理规则。',
          '为保护未成年人账号安全，平台可能要求监护人提供必要证明以确认身份和监护关系，并在合理期限内处理请求。',
        ],
      },
      {
        heading: '8. 保护措施',
        paragraphs: [
          '平台会通过内容审核、敏感词拦截、举报入口、后台封禁、商家审核、权限管理和必要的信息隐藏措施保护未成年人。',
          '对于明显涉及未成年人安全、隐私泄露、违法交易或诱导风险的内容，平台可优先采取临时限制措施，再根据证据补充处理。',
        ],
      },
      {
        heading: '9. 保存与删除',
        paragraphs: [
          '未成年人个人信息会在实现服务目的所需期限内保存。认证材料、举报证据、交易风控和安全日志等信息，会按法律要求和争议处理需要保存必要期限。',
          '当保存目的已经实现、监护人撤回授权或账号注销后，平台会在合理期限内删除或匿名化处理相关信息，法律法规另有要求的除外。',
        ],
      },
      {
        heading: '10. 联系与投诉',
        paragraphs: [
          '未成年人或监护人如发现信息泄露、账号冒用、商家诱导、违法内容或线下风险，可通过平台举报入口或找回账号入口提交处理请求。',
          '平台会根据紧急程度、证据材料和法律要求进行处理，并在必要时限制内容展示、封禁账号或配合有关部门处理。',
        ],
      },
    ],
  },
  'content-rules': {
    eyebrow: '内容发布规范',
    title: '售业内容发布规范',
    intro:
      '本规范适用于平台内的问题、回答、经验帖、技能服务、商家广告、评论和其他用户生成内容。目标是让留学生能找到真实、有用、可验证的信息，而不是低质量灌水或高风险交易。',
    sections: [
      {
        heading: '1. 鼓励内容',
        paragraphs: [
          '鼓励发布能直接解决问题的材料清单、流程、地点、时间线、官方链接、下载入口、注意事项、真实经验、合法渠道和风险提醒。',
        ],
      },
      {
        heading: '2. 禁止内容',
        paragraphs: [
          '严禁发布换钱换米求助、帮助和广告；严禁代写、代考、替课、买卖答案、伪造材料、色情交易、金融违法、诈骗引流和侵犯他人隐私。',
        ],
      },
      {
        heading: '3. 商家内容',
        paragraphs: [
          '商家需提交真实主体、联系方式、服务范围和资质信息。平台审核通过前不得以官方推荐名义展示，广告需清楚标识服务边界。',
        ],
      },
      {
        heading: '4. 举报处理',
        paragraphs: [
          '用户可以对帖子、问题、回答和商家内容发起举报。平台会根据证据采取处理措施，并在后台记录处理状态。',
        ],
      },
    ],
  },
}

type SearchIntentGroup = {
  id: string
  aliases: string[]
  postTerms: string[]
  schoolTerms: string[]
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
  questions: CommunityQuestion[]
  answers: QuestionAnswer[]
  partnerApplications: PartnerApplication[]
  merchantLeads: MerchantLead[]
  merchantBrandDecorations: MerchantBrandDecoration[]
  questionBounties: QuestionBounty[]
  questionDisputes: QuestionDispute[]
  pointOrders: PointOrder[]
  withdrawalRequests: WithdrawalRequest[]
  pointLedger: PointLedger[]
  reports: ContentReport[]
  currentUserId: string | null
  unlockedPostIds: Record<string, string[]>
  siteContent: SiteContentSettings
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
  merchantWalaBadge: string
  merchantWalaHeroTitle: string
  merchantWalaIntro: string
  merchantWalaContactCopy: string
  merchantWalaCaseOne: string
  merchantWalaCaseTwo: string
}

const heroImage =
  'https://images.unsplash.com/photo-1742747215638-0105cbcd2645?auto=format&fit=crop&q=80&w=2200'
const homeHeroImages = [
  { src: '/home-hero/1.png', alt: '韩国校园建筑' },
  { src: '/home-hero/2.jpg', alt: '韩国梨花女子大学校园建筑' },
  { src: '/home-hero/3.jpg', alt: '韩国世宗大学校园全景' },
]

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
  merchantWalaBadge: '认证商家展示页',
  merchantWalaHeroTitle: '韩国留学申请、签证续签、语学院和大学院规划',
  merchantWalaIntro:
    '瓦剌留学专注韩国院校申请与在韩升学规划，适合准备申请、语学院转本科、本科申请大学院，以及需要核对签证续签材料的学生先做对比咨询。',
  merchantWalaContactCopy: '咨询前建议先整理目标学校、当前阶段、语言成绩、预算和预计入学时间，方便商家判断服务边界。',
  merchantWalaCaseOne: '本科/大学院申请：择校评估、材料节奏、文书修改范围、面试准备和入学后续提醒。',
  merchantWalaCaseTwo: '签证与在韩升学：D-2/D-4续签材料核对、语学院升本科、研究计划书节奏和窗口风险提示。',
}

const defaultMerchantBrandDecorations: MerchantBrandDecoration[] = [
  {
    brandId: 'tuzhuren-thesis',
    badge: '认证商家展示页',
    heroTitle: '韩国论文流程、毕业审查、韩文发表和延毕节点支持',
    intro:
      '土著人面向在韩本科、大学院和毕业阶段学生，展示论文流程说明、毕业材料检查、韩文表达校对和发表准备等合规学业支持服务。',
    contactCopy: '咨询前建议先整理学校、专业、毕业要求、论文阶段、导师反馈、提交节点和目前遇到的具体卡点。',
    panelLabel: '土著人品牌的管理商家',
    panelTitle: '论文流程・毕业审查・韩文发表',
    sectionOneTitle: '适合咨询的人',
    sectionOneText: '正在准备论文、毕业材料、发表稿、延毕申请或学院窗口材料的本科、大学院和毕业阶段学生。',
    sectionTwoTitle: '咨询前先准备',
    sectionTwoText: '学校、专业、毕业要求、论文阶段、导师反馈、提交截止日、已写材料和目前最卡的具体问题。',
    sectionThreeTitle: '平台提醒',
    sectionThreeText: '只展示合规学业支持边界，不提供代写、代投、替考、伪造材料等服务；毕业要求以学校和学院最新通知为准。',
    caseOne: '论文与毕业：论文格式检查、引用规范提醒、毕业材料节点梳理、延毕风险和学校窗口沟通准备。',
    caseTwo: '韩文发表与表达：摘要、发表稿、课堂发表和教授沟通表达优化；不提供代写、代投或替考类服务。',
    showcaseArtTitle: '土著人',
    showcaseArtSubtitle: '开启世界视野 · 成就未来可能',
    logoImage: '',
    pendingLogoImage: '',
    logoReviewStatus: 'approved',
    fontFamily: '',
    titleColor: '',
    bodyColor: '',
    accentColor: '',
    heroImage: '',
    heroImageX: 50,
    heroImageY: 50,
    heroImageScale: 1,
    serviceImage: '',
    serviceImageX: 50,
    serviceImageY: 50,
    serviceImageScale: 1,
    textLayerStyles: {},
    designItems: [],
    updatedAt: '2026-05-07',
  },
]

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

const normalizeMerchantBrandDecoration = (
  decoration: Partial<MerchantBrandDecoration>,
  fallback?: MerchantBrandDecoration,
): MerchantBrandDecoration => {
  const now = new Date().toISOString()
  const normalizeDesignItems = (
    items?: Partial<MerchantDesignItem>[],
    fallbackItems?: MerchantDesignItem[],
  ): MerchantDesignItem[] => {
    const source = Array.isArray(items) ? items : fallbackItems ?? []
    return source
      .filter((item) => item && typeof item === 'object')
      .map((item, index): MerchantDesignItem => ({
        id: typeof item.id === 'string' && item.id ? item.id : createId('merchant-item'),
        zone: item.zone === 'service' ? 'service' : item.zone === 'showcase' ? 'showcase' : 'hero',
        kind: item.kind === 'media' ? 'media' : 'bubble',
        text: typeof item.text === 'string' ? item.text : '新内容',
        mediaUrl: typeof item.mediaUrl === 'string' ? item.mediaUrl : '',
        mediaKind: item.mediaKind === 'video' ? 'video' : 'image',
        x: Math.min(92, Math.max(0, Number.isFinite(Number(item.x)) ? Number(item.x) : 10 + index * 4)),
        y: Math.min(92, Math.max(0, Number.isFinite(Number(item.y)) ? Number(item.y) : 12 + index * 4)),
        width: Math.min(90, Math.max(10, Number.isFinite(Number(item.width)) ? Number(item.width) : 28)),
        height: Math.min(90, Math.max(8, Number.isFinite(Number(item.height)) ? Number(item.height) : 16)),
        z: Math.min(80, Math.max(1, Number.isFinite(Number(item.z)) ? Number(item.z) : 10 + index)),
        opacity: Math.min(1, Math.max(0.08, Number.isFinite(Number(item.opacity)) ? Number(item.opacity) : 0.92)),
        fontSize: Math.min(72, Math.max(12, Number.isFinite(Number(item.fontSize)) ? Number(item.fontSize) : 18)),
        color: typeof item.color === 'string' && item.color ? item.color : '#10201d',
        background: typeof item.background === 'string' && item.background ? item.background : 'rgba(255, 253, 247, 0.84)',
      }))
      .slice(0, 30)
  }
  const normalizeTextLayerStyles = (
    styles?: Record<string, Partial<MerchantTextLayerStyle>>,
    fallbackStyles?: Record<string, MerchantTextLayerStyle>,
  ): Record<string, MerchantTextLayerStyle> => {
    const source = styles && typeof styles === 'object' ? styles : fallbackStyles ?? {}
    return Object.fromEntries(
      Object.entries(source).map(([field, style]) => [
        field,
        {
          x: Math.min(800, Math.max(-800, Number.isFinite(Number(style?.x)) ? Number(style?.x) : 0)),
          y: Math.min(800, Math.max(-800, Number.isFinite(Number(style?.y)) ? Number(style?.y) : 0)),
          z: Math.min(120, Math.max(1, Number.isFinite(Number(style?.z)) ? Number(style?.z) : 20)),
          fontSize: Math.min(120, Math.max(0, Number.isFinite(Number(style?.fontSize)) ? Number(style?.fontSize) : 0)),
          color: typeof style?.color === 'string' ? style.color : '',
        },
      ]),
    )
  }
  return {
    brandId: decoration.brandId ?? fallback?.brandId ?? '',
    ownerUserId: decoration.ownerUserId ?? fallback?.ownerUserId,
    badge: decoration.badge ?? fallback?.badge ?? '认证商家展示页',
    heroTitle: decoration.heroTitle ?? fallback?.heroTitle ?? '',
    intro: decoration.intro ?? fallback?.intro ?? '',
    contactCopy: decoration.contactCopy ?? fallback?.contactCopy ?? '',
    panelLabel: decoration.panelLabel || fallback?.panelLabel || '认证商家展示',
    panelTitle: decoration.panelTitle || fallback?.panelTitle || '',
    sectionOneTitle: decoration.sectionOneTitle ?? fallback?.sectionOneTitle ?? '服务说明',
    sectionOneText: decoration.sectionOneText ?? fallback?.sectionOneText ?? '',
    sectionTwoTitle: decoration.sectionTwoTitle ?? fallback?.sectionTwoTitle ?? '对比建议',
    sectionTwoText: decoration.sectionTwoText ?? fallback?.sectionTwoText ?? '',
    sectionThreeTitle: decoration.sectionThreeTitle ?? fallback?.sectionThreeTitle ?? '平台提醒',
    sectionThreeText: decoration.sectionThreeText ?? fallback?.sectionThreeText ?? '',
    caseOne: decoration.caseOne ?? fallback?.caseOne ?? '',
    caseTwo: decoration.caseTwo ?? fallback?.caseTwo ?? '',
    showcaseArtTitle: decoration.showcaseArtTitle ?? fallback?.showcaseArtTitle ?? '',
    showcaseArtSubtitle: decoration.showcaseArtSubtitle ?? fallback?.showcaseArtSubtitle ?? '',
    logoImage: decoration.logoImage ?? fallback?.logoImage ?? '',
    pendingLogoImage: decoration.pendingLogoImage ?? fallback?.pendingLogoImage ?? '',
    logoReviewStatus: decoration.logoReviewStatus ?? fallback?.logoReviewStatus ?? 'approved',
    fontFamily: decoration.fontFamily ?? fallback?.fontFamily ?? '',
    titleColor: decoration.titleColor ?? fallback?.titleColor ?? '',
    bodyColor: decoration.bodyColor ?? fallback?.bodyColor ?? '',
    accentColor: decoration.accentColor ?? fallback?.accentColor ?? '',
    heroImage: decoration.heroImage ?? fallback?.heroImage ?? '',
    heroImageX: Number.isFinite(Number(decoration.heroImageX ?? fallback?.heroImageX))
      ? Number(decoration.heroImageX ?? fallback?.heroImageX)
      : 50,
    heroImageY: Number.isFinite(Number(decoration.heroImageY ?? fallback?.heroImageY))
      ? Number(decoration.heroImageY ?? fallback?.heroImageY)
      : 50,
    heroImageScale: Math.min(
      2.4,
      Math.max(0.35, Number.isFinite(Number(decoration.heroImageScale ?? fallback?.heroImageScale)) ? Number(decoration.heroImageScale ?? fallback?.heroImageScale) : 1),
    ),
    serviceImage: decoration.serviceImage ?? fallback?.serviceImage ?? '',
    serviceImageX: Number.isFinite(Number(decoration.serviceImageX ?? fallback?.serviceImageX))
      ? Number(decoration.serviceImageX ?? fallback?.serviceImageX)
      : 50,
    serviceImageY: Number.isFinite(Number(decoration.serviceImageY ?? fallback?.serviceImageY))
      ? Number(decoration.serviceImageY ?? fallback?.serviceImageY)
      : 50,
    serviceImageScale: Math.min(
      2.4,
      Math.max(
        0.35,
        Number.isFinite(Number(decoration.serviceImageScale ?? fallback?.serviceImageScale))
          ? Number(decoration.serviceImageScale ?? fallback?.serviceImageScale)
          : 1,
      ),
    ),
    textLayerStyles: normalizeTextLayerStyles(decoration.textLayerStyles, fallback?.textLayerStyles),
    designItems: normalizeDesignItems(decoration.designItems, fallback?.designItems),
    updatedAt: decoration.updatedAt ?? fallback?.updatedAt ?? now,
  }
}

const mergeMerchantBrandDecorations = (decorations?: Partial<MerchantBrandDecoration>[]) => {
  const decorationMap = new Map(
    defaultMerchantBrandDecorations.map((decoration) => [decoration.brandId, normalizeMerchantBrandDecoration(decoration)]),
  )
  for (const decoration of decorations ?? []) {
    if (!decoration.brandId) continue
    decorationMap.set(
      decoration.brandId,
      normalizeMerchantBrandDecoration(decoration, decorationMap.get(decoration.brandId)),
    )
  }
  return Array.from(decorationMap.values())
}

const parseUserBioSettings = (bio?: string): UserBioSettings => {
  if (!bio?.trim()) return {}
  try {
    const parsed = JSON.parse(bio) as UserBioSettings
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const serializeUserBrandAccess = (
  bio: string,
  brandId: string,
  brandName: string,
  brandLevel: MerchantLevel = 'normal',
) => {
  const settings = parseUserBioSettings(bio)
  if (!brandId) {
    const {
      managedBrandId: _managedBrandId,
      managedBrandName: _managedBrandName,
      managedBrandLevel: _managedBrandLevel,
      ...rest
    } = settings
    return Object.keys(rest).length ? JSON.stringify(rest) : ''
  }
  return JSON.stringify({ ...settings, managedBrandId: brandId, managedBrandName: brandName, managedBrandLevel: brandLevel })
}

const storageKey = 'shouye-platform-mvp-v1'
const adminSessionKey = 'shouye-platform-admin-session'
const registerBonusPoints = 30
const studentStageOptions: { label: string; value: StudentStage }[] = [
  { label: '准备申请', value: 'preparing' },
  { label: '已录取待入学', value: 'admitted' },
  { label: '语学院', value: 'language_school' },
  { label: '本科', value: 'undergraduate' },
  { label: '大学院', value: 'graduate' },
  { label: '已毕业', value: 'graduated' },
]

const studentStageLabels: Record<StudentStage, string> = {
  preparing: '准备申请',
  admitted: '已录取待入学',
  language_school: '语学院',
  undergraduate: '本科',
  graduate: '大学院',
  graduated: '已毕业',
}

const businessCategoryOptions = [
  '留学咨询',
  '论文与毕业',
  '韩语培训',
  '艺术类培训',
  '作品集辅导',
  '餐饮相关',
  '物流快递',
  '通信',
  '家政搬家',
  '不动产',
]
const normalizeBusinessCategory = (category?: string, company?: string) => {
  const categoryText = category?.trim() ?? ''
  const searchable = `${company ?? ''} ${categoryText}`
  if (searchable.includes('傻呱兔') || searchable.includes('作品集')) return '作品集辅导'
  return businessCategoryOptions.includes(categoryText) ? categoryText : businessCategoryOptions[0]
}
const skillServiceCategories = [
  '宠物照看/遛狗喂猫',
  '跑腿/排队/代办',
  '地陪/陪同/翻译',
  '学习辅导/资料整理',
  '搬家/取送/寄件',
  '同校生活帮忙',
  '其他技能服务',
]
const postApprovedBonusPoints = 10
const rechargePointsPerYuan = 10
const cashoutPointsPerYuan = 100 / 8
const minimumCashoutPoints = 1700
const categories = [
  '签证/滞留资格',
  '入学/选课/学分',
  '语学院/本科/大学院',
  '租房/搬家/保证金',
  '银行卡/手机卡/保险',
  '打工/劳动纠纷',
  '医院/看病/药店',
  '毕业/论文/延毕',
  '求职/实习/简历',
  '二手交易/搬家处理',
  '学校评价',
  '城市生活攻略',
]
const allCategoryLabel = '全部'
const categoryFilters = [allCategoryLabel, ...categories]
const schoolPageSize = 8
const currencyExchangePolicyNotice =
  '本平台严禁发布换钱、换米相关求助、帮助和广告。私下换汇属于违法行为；用户如因本平台信息媒介自行接洽换汇，均属于个人行为，本平台不承担法律责任。'

const schoolCampusImage = (schoolId: string, index = 1) => `/schools/${schoolId}/${index}.jpg`
const schoolCampusImages = (schoolId: string) => [1, 2, 3].map((index) => schoolCampusImage(schoolId, index))

const schoolRegions: { region: string; summary: string; schools: SchoolProfile[] }[] = [
  {
    region: '首尔',
    summary: '优先展示 QS 2026 排名前列院校，并覆盖艺术、女子大学、理工类和高频申请院校。',
    schools: [
      {
        id: 'snu',
        name: '首尔大学',
        englishName: 'Seoul National University',
        region: '首尔',
        city: '冠岳区',
        landmark: '冠岳校区正门与主轴线',
        image: schoolCampusImage('snu'),
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
        image: schoolCampusImage('yonsei'),
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
        image: schoolCampusImage('korea'),
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
        image: schoolCampusImage('skku-seoul'),
        description: '韩国传统名校之一，人文社科在首尔、理工自然科学多在水原，半导体、经营、传媒和工科方向关注度高。',
        programs: ['半导体', '经营', '传媒', '人文社科'],
        strengths: ['QS前列', '三星背景', '双校区'],
        source: 'https://commons.wikimedia.org/wiki/File:Sungkyunkwan_University_Bicheondang_and_600th_Anniversary_Hall.jpg',
      },
      {
        id: 'hanyang',
        name: '汉阳大学',
        englishName: 'Hanyang University',
        region: '首尔',
        city: '城东区 · 往十里',
        landmark: '工科与都市型校区',
        image: schoolCampusImage('hanyang'),
        description: '工科、产业合作和实用型专业优势明显，首尔校区交通方便，ERICA 校区也适合工科方向。',
        programs: ['工科', '建筑', '经营', '艺术'],
        strengths: ['工科强', '实习机会多', '交通便利'],
        source: 'https://commons.wikimedia.org/wiki/File:Hanyang_University_008.JPG',
      },
      {
        id: 'kyunghee',
        name: '庆熙大学',
        englishName: 'Kyung Hee University',
        region: '首尔',
        city: '东大门区',
        landmark: '首尔校区本馆',
        image: schoolCampusImage('kyunghee'),
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
        image: schoolCampusImage('sejong'),
        description: '酒店观光、经营、动画、AI与软件方向热度高，位置靠近儿童大公园，生活交通方便。',
        programs: ['酒店观光', 'AI', '软件', '动画'],
        strengths: ['QS上升快', '文理兼顾', '交通便利'],
        source: 'https://commons.wikimedia.org/wiki/File:SejongCampus.jpg',
      },
      {
        id: 'cau',
        name: '中央大学',
        englishName: 'Chung-Ang University',
        region: '首尔',
        city: '铜雀区 · 黑石',
        landmark: '310馆百周年纪念馆',
        image: schoolCampusImage('cau'),
        description: '影像、戏剧、传媒、艺术和商科方向很受中国学生关注，首尔校区坡度较大，选课动线要提前看。',
        programs: ['传媒', '戏剧影视', '艺术', '经营'],
        strengths: ['艺术传媒强', '地铁可达', '申请热度高'],
        source: 'https://commons.wikimedia.org/wiki/File:Chung-Ang_University_Building_310_(100th_Anniversary_Hall).jpg',
      },
      {
        id: 'ewha',
        name: '梨花女子大学',
        englishName: 'Ewha Womans University',
        region: '首尔',
        city: '西大门区',
        landmark: 'ECC 与梨花校园谷',
        image: schoolCampusImage('ewha'),
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
        image: schoolCampusImage('sogang'),
        description: '小而精的私立名校，经营、传媒、国际学、韩国语教育和人文社科方向适合重点比较。',
        programs: ['经营', '传媒', '国际学', '韩国语教育'],
        strengths: ['新村生活圈', '课堂强度高', '文商科关注度高'],
        source: 'https://sogang.ac.kr/ko/detail/545183',
      },
      {
        id: 'dongguk',
        name: '东国大学',
        englishName: 'Dongguk University',
        region: '首尔',
        city: '中区',
        landmark: '南山脚下首尔校区',
        image: schoolCampusImage('dongguk'),
        description: '传媒、电影影像、佛教文化、警察行政和经营方向常被咨询，校区靠近忠武路和南山。',
        programs: ['电影影像', '传媒', '经营', '警察行政'],
        strengths: ['传媒影像强', '市中心位置', '生活便利'],
        source: 'https://commons.wikimedia.org/wiki/File:DONGGUK_UNIVERSITY_%EB%8F%99%EA%B5%AD%EC%9D%98_%EC%95%BC%EA%B2%BD.jpg',
      },
      {
        id: 'konkuk',
        name: '建国大学',
        englishName: 'Konkuk University',
        region: '首尔',
        city: '广津区',
        landmark: '一鉴湖与首尔校区',
        image: schoolCampusImage('konkuk'),
        description: '商科、传媒、设计、兽医、房地产和生命科学方向讨论度高，周边商圈成熟。',
        programs: ['经营', '传媒', '设计', '生命科学'],
        strengths: ['校园生活强', '专业覆盖广', '商圈成熟'],
        source: 'https://commons.wikimedia.org/wiki/File:Seoul_Campus.jpg',
      },
      {
        id: 'hufs',
        name: '韩国外国语大学',
        englishName: 'Hankuk University of Foreign Studies',
        region: '首尔',
        city: '东大门区',
        landmark: '外大前校园',
        image: schoolCampusImage('hufs'),
        description: '外语、翻译、国际地域、国际通商和韩国语教育方向代表性强，适合语言和国际事务路线。',
        programs: ['外语', '翻译', '国际地域', '韩国语教育'],
        strengths: ['外语强校', '国际化', '专业辨识度高'],
        source: 'https://commons.wikimedia.org/wiki/File:Hankuk_University_of_Foreign_Studies_Seoul_campus_20180914_090938.jpg',
      },
      {
        id: 'uos',
        name: '首尔市立大学',
        englishName: 'University of Seoul',
        region: '首尔',
        city: '东大门区',
        landmark: '市立大学校园',
        image: schoolCampusImage('uos'),
        description: '公立大学属性明显，城市科学、税务、行政、建筑、环境和经营方向适合关注性价比。',
        programs: ['城市科学', '税务', '行政', '建筑'],
        strengths: ['公立性价比', '城市研究强', '首尔位置'],
        source: 'https://www.uos.ac.kr/korEventPhoto/view.do?identified=anonymous&list_id=AE9&seq=17',
      },
      {
        id: 'dankook-seoul',
        name: '檀国大学',
        englishName: 'Dankook University',
        region: '首都圈',
        city: '竹田 / 天安',
        landmark: '竹田校区',
        image: schoolCampusImage('dankook-seoul'),
        description: '虽主校区不在首尔市内，但常被首都圈申请者一起比较，设计、传媒、经营、音乐和医学相关方向值得纳入择校清单。',
        programs: ['设计', '传媒', '经营', '音乐'],
        strengths: ['首都圈备选', '专业多', '生活成本可控'],
        source: 'https://commons.wikimedia.org/wiki/File:0_DankookU_h.jpg',
      },
      {
        id: 'seoultech',
        name: '首尔科技大学',
        englishName: 'Seoul National University of Science and Technology',
        region: '首尔',
        city: '芦原区',
        landmark: '孔陵校区',
        image: schoolCampusImage('seoultech'),
        description: '国立理工取向明显，工科、设计、建筑、IT和产业技术方向适合重视就业和费用的学生。',
        programs: ['工科', '设计', '建筑', 'IT'],
        strengths: ['国立理工', '费用友好', '实践导向'],
        source: 'https://commons.wikimedia.org/wiki/File:Campus_of_Seoul_National_University_of_Technology._Seoultech._Snut..jpg',
      },
      {
        id: 'kookmin',
        name: '国民大学',
        englishName: 'Kookmin University',
        region: '首尔',
        city: '城北区',
        landmark: '北岳山下校园',
        image: schoolCampusImage('kookmin'),
        description: '汽车、设计、经营、AI和软件方向有特色，适合看作品集、实践课程和就业合作。',
        programs: ['汽车', '设计', '经营', 'AI'],
        strengths: ['设计汽车强', '实践导向', '北首尔生活圈'],
        source: 'https://www.kookmin.ac.kr/comm/board/user/7ebd3b81f7cf60ae9b0cfd0d11c841dd/view.do?dataSeq=1060578',
      },
      {
        id: 'soongsil',
        name: '崇实大学',
        englishName: 'Soongsil University',
        region: '首尔',
        city: '铜雀区',
        landmark: '崇实大入口校园',
        image: schoolCampusImage('soongsil'),
        description: 'IT、软件、经营、社会科学和创业方向常见，地铁通勤便利，适合务实型申请者。',
        programs: ['软件', 'IT', '经营', '创业'],
        strengths: ['IT传统', '交通方便', '就业导向'],
        source: 'https://commons.wikimedia.org/wiki/File:Soongsil_University.jpg',
      },
      {
        id: 'sookmyung',
        name: '淑明女子大学',
        englishName: "Sookmyung Women's University",
        region: '首尔',
        city: '龙山区',
        landmark: '龙山校区',
        image: schoolCampusImage('sookmyung'),
        description: '女子大学代表之一，教育、传媒、经营、国际学、食品营养和艺术方向适合比较。',
        programs: ['教育', '传媒', '经营', '国际学'],
        strengths: ['龙山位置', '女性教育传统', '生活便利'],
        source: 'https://commons.wikimedia.org/wiki/File:%EC%88%99%EB%AA%85%EC%97%AC%EC%9E%90%EB%8C%80%ED%95%99%EA%B5%90_001.jpg',
      },
      {
        id: 'kwangwoon',
        name: '光云大学',
        englishName: 'Kwangwoon University',
        region: '首尔',
        city: '芦原区',
        landmark: '光云大站附近校园',
        image: schoolCampusImage('kwangwoon'),
        description: '电子、电气、信息通信、机器人和软件方向有辨识度，适合理工方向备选。',
        programs: ['电子', '信息通信', '机器人', '软件'],
        strengths: ['电子通信强', '理工取向', '首尔北部'],
        source: 'https://commons.wikimedia.org/wiki/File:Kwangwoon_University.jpg',
      },
      {
        id: 'myongji',
        name: '明知大学',
        englishName: 'Myongji University',
        region: '首尔 / 京畿道',
        city: '西大门区 / 龙仁',
        landmark: '人文校区与自然校区',
        image: schoolCampusImage('myongji'),
        description: '人文、经营、建筑、工程和艺术方向常见，申请前要确认专业所在校区。',
        programs: ['人文', '经营', '建筑', '工程'],
        strengths: ['双校区', '专业覆盖广', '适合备选'],
        source: 'https://commons.wikimedia.org/wiki/File:20100831_myongji_university.jpg',
      },
      {
        id: 'sangmyung',
        name: '祥明大学',
        englishName: 'Sangmyung University',
        region: '首尔 / 忠清',
        city: '钟路区 / 天安',
        landmark: '首尔校区',
        image: schoolCampusImage('sangmyung'),
        description: '艺术、设计、动漫、教育和文化内容方向常见，适合关注作品集和实践课程。',
        programs: ['设计', '动漫', '艺术', '教育'],
        strengths: ['艺术设计', '首尔校区小而集中', '作品集重要'],
        source: 'https://commons.wikimedia.org/wiki/File:Sangmyung_University_4.JPG',
      },
      {
        id: 'hansung',
        name: '汉城大学',
        englishName: 'Hansung University',
        region: '首尔',
        city: '城北区',
        landmark: '汉城大入口校区',
        image: schoolCampusImage('hansung'),
        description: '设计、IT、经营、人文社科和美容时尚方向可作为首尔私立校备选。',
        programs: ['设计', 'IT', '经营', '时尚'],
        strengths: ['首尔位置', '实践专业', '申请灵活'],
        source: 'https://www.hansung.ac.kr/bbs/hansung/2158/186664/artclView.do',
      },
      {
        id: 'sungshin',
        name: '诚信女子大学',
        englishName: "Sungshin Women's University",
        region: '首尔',
        city: '城北区',
        landmark: '敦岩校区',
        image: schoolCampusImage('sungshin'),
        description: '设计、美术、音乐、教育、护理和生活科学方向常见，女生申请者关注度高。',
        programs: ['设计', '美术', '教育', '护理'],
        strengths: ['女子大学', '艺术教育', '生活圈成熟'],
        source: 'https://commons.wikimedia.org/wiki/File:%EB%8F%88%EC%95%94%EC%88%98%EC%A0%95%EC%BA%A0%ED%8D%BC%EC%8A%A4_%EC%A0%84%EA%B2%BD.jpg',
      },
      {
        id: 'dongduk',
        name: '同德女子大学',
        englishName: "Dongduk Women's University",
        region: '首尔',
        city: '城北区',
        landmark: '月谷校区',
        image: schoolCampusImage('dongduk'),
        description: '设计、表演艺术、时尚、音乐和人文社科方向常见，适合看作品集与面试要求。',
        programs: ['设计', '表演艺术', '时尚', '音乐'],
        strengths: ['艺术时尚', '女子大学', '面试重要'],
        source: 'https://www.archdaily.com/867750/dongduk-womens-university-centennial-memorial-hall-hyundai-architects-and-engineers',
      },
      {
        id: 'duksung',
        name: '德成女子大学',
        englishName: "Duksung Women's University",
        region: '首尔',
        city: '道峰区',
        landmark: '双门洞校园',
        image: schoolCampusImage('duksung'),
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
        image: schoolCampusImage('swu'),
        description: '教育、心理、传媒、经营、食品营养和人文社科方向常见，适合比较奖学金和通勤。',
        programs: ['教育', '心理', '传媒', '经营'],
        strengths: ['女子大学', '北首尔', '校园环境安静'],
        source: 'https://commons.wikimedia.org/wiki/File:SWU-maincampus-gates-daytime.jpg',
      },
      {
        id: 'knua',
        name: '韩国艺术综合学校',
        englishName: 'Korea National University of Arts',
        region: '首尔',
        city: '城北区 / 瑞草区',
        landmark: '石串洞与瑞草校区',
        image: schoolCampusImage('knua'),
        description: '韩国顶尖艺术类国立院校，音乐、舞蹈、戏剧、电影、视觉艺术方向适合专业型申请者。',
        programs: ['音乐', '舞蹈', '戏剧', '电影'],
        strengths: ['艺术顶尖', '专业门槛高', '作品集核心'],
        source: 'https://commons.wikimedia.org/wiki/File:%ED%95%9C%EA%B5%AD%EC%98%88%EC%88%A0%EC%A2%85%ED%95%A9%ED%95%99%EA%B5%90.jpg',
      },
      {
        id: 'knsu',
        name: '韩国体育大学',
        englishName: 'Korea National Sport University',
        region: '首尔',
        city: '松坡区',
        landmark: '奥林匹克公园旁校园',
        image: schoolCampusImage('knsu'),
        description: '体育、运动科学、教练、康复和体育产业方向代表学校，适合体育专业路线。',
        programs: ['体育', '运动科学', '康复', '体育产业'],
        strengths: ['体育国立', '专业性强', '奥林匹克园区'],
        source: 'https://commons.wikimedia.org/wiki/File:Knsu.jpg',
      },
      {
        id: 'sahmyook',
        name: '三育大学',
        englishName: 'Sahmyook University',
        region: '首尔',
        city: '芦原区',
        landmark: '绿色校园',
        image: schoolCampusImage('sahmyook'),
        description: '护理、保健、食品营养、经营和语言方向常见，校园环境安静，适合看专业匹配度。',
        programs: ['护理', '保健', '食品营养', '经营'],
        strengths: ['保健护理', '校园安静', '首尔北部'],
        source: 'https://commons.wikimedia.org/wiki/File:%27100th_Anniversary_Memorial_Hall%27_of_Sahmyook_University.jpg',
      },
      {
        id: 'hongik',
        name: '弘益大学',
        englishName: 'Hongik University',
        region: '首尔',
        city: '麻浦区 · 弘大',
        landmark: '弘大正门与艺术街区',
        image: schoolCampusImage('hongik'),
        description: '美术、设计、建筑、视觉传达方向代表学校，周边文化商业氛围强。',
        programs: ['美术', '设计', '建筑', '视觉传达'],
        strengths: ['艺术设计强', '弘大商圈', '作品集重要'],
        source: 'https://commons.wikimedia.org/wiki/File:Hongik_University_Gate.jpg',
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
        image: schoolCampusImage('skku'),
        description: '三星背景和理工科资源关注度高，人文社科在首尔，理工自然科学多在水原。',
        programs: ['半导体', '工科', '经营', '人文社科'],
        strengths: ['理工资源强', '双校区', '就业关注度高'],
        source: 'https://commons.wikimedia.org/wiki/File:Sungkyunkwan_University_Bicheondang_and_600th_Anniversary_Hall.jpg',
      },
      {
        id: 'ajou',
        name: '亚洲大学',
        englishName: 'Ajou University',
        region: '京畿道',
        city: '水原',
        landmark: '水原校园全景',
        image: schoolCampusImage('ajou'),
        description: '工科、医学、国际大学院和交换项目有一定优势，适合想在首都圈但避开首尔高生活成本的学生。',
        programs: ['工科', '医学', '国际学', '经营'],
        strengths: ['首都圈', '理工医学', '性价比突出'],
        source: 'https://commons.wikimedia.org/wiki/File:0-campus-sm-Ajou.jpg',
      },
      {
        id: 'inha',
        name: '仁荷大学',
        englishName: 'Inha University',
        region: '仁川',
        city: '弥邹忽区',
        landmark: '龙岘校区',
        image: schoolCampusImage('inha'),
        description: '工科、物流、航空和产学合作辨识度高，适合想把仁川产业资源和首都圈通勤一起比较的学生。',
        programs: ['工科', '物流', '航空', '经营'],
        strengths: ['仁川核心校区', '工科传统强', '产学合作多'],
        source: 'https://commons.wikimedia.org/wiki/File:%EC%9D%B8%ED%95%98%EB%8C%80%ED%95%99%EA%B5%90_%EB%B3%B8%EA%B4%80.jpg',
      },
      {
        id: 'inu',
        name: '仁川大学',
        englishName: 'Incheon National University',
        region: '仁川',
        city: '松岛',
        landmark: '松岛校区',
        image: schoolCampusImage('inu'),
        description: '位于松岛国际城，国立大学属性、国际都市环境和生活便利度适合重点比较。',
        programs: ['经营', '工科', '国际通商', '城市科学'],
        strengths: ['国立大学', '松岛国际城', '生活便利'],
        source: 'https://commons.wikimedia.org/wiki/File:Songdocampus.jpg',
      },
      {
        id: 'hanyang-erica',
        name: '汉阳大学 ERICA',
        englishName: 'Hanyang University ERICA',
        region: '京畿道',
        city: '安山',
        landmark: 'ERICA 校区喷泉',
        image: schoolCampusImage('hanyang-erica'),
        description: 'ERICA 强调产业合作和实践型教育，工科、设计、软件、融合专业适合重点比较。',
        programs: ['工科', '软件', '设计', '融合专业'],
        strengths: ['产业合作', '校园空间大', '实践导向'],
        source: 'https://commons.wikimedia.org/wiki/File:Hanyang_University_Erica_Campus_Fountain_(South_Korea)_-_2024.jpg',
      },
      {
        id: 'cau-anseong',
        name: '中央大学 安城校区',
        englishName: 'Chung-Ang University Anseong',
        region: '京畿道',
        city: '安城',
        landmark: '安城主楼',
        image: schoolCampusImage('cau-anseong'),
        description: '安城校区常见于艺术、体育、生命资源等方向，申请前要确认专业所在校区和通勤生活。',
        programs: ['艺术', '体育', '生命资源', '实践专业'],
        strengths: ['校区空间大', '实践类专业', '生活成本较低'],
        source: 'https://commons.wikimedia.org/wiki/File:Chung-ang_Univ.Ansung_main_building.jpg',
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
        image: schoolCampusImage('pnu'),
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
        image: schoolCampusImage('donga'),
        description: '釜山地区常见申请选择，适合将生活成本、奖学金和专业录取难度一起比较。',
        programs: ['经营', '设计', '国际学', '韩语课程'],
        strengths: ['釜山生活圈', '申请灵活', '适合备选'],
        source: 'https://commons.wikimedia.org/wiki/File:Dong-A_Univ_Bumin_Campus.JPG',
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
        image: schoolCampusImage('knu'),
        description: '地方国立代表之一，工科、IT、经营、自然科学和奖学金政策适合详细比较。',
        programs: ['IT', '工科', '经营', '自然科学'],
        strengths: ['国立背景', '生活成本低', '奖学金友好'],
        source: 'https://commons.wikimedia.org/wiki/File:Kyungpook_National_University_in_Daegu.jpg',
      },
      {
        id: 'keimyung',
        name: '启明大学',
        englishName: 'Keimyung University',
        region: '大邱',
        city: '达西区',
        landmark: '欧式校园建筑',
        image: schoolCampusImage('keimyung'),
        description: '校园建筑辨识度强，语学堂、艺术、经营、人文方向可作为地方私立校选择。',
        programs: ['语学堂', '艺术', '经营', '人文'],
        strengths: ['校园漂亮', '地方生活成本', '文化体验强'],
        source: 'https://commons.wikimedia.org/wiki/File:Main_building_of_KMU.jpg',
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
        image: schoolCampusImage('kaist'),
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
        image: schoolCampusImage('chungnam'),
        description: '中部国立大学代表，适合比较学费、奖学金、专业录取难度和大田生活成本。',
        programs: ['工科', '经营', '农生命', '韩语教育'],
        strengths: ['国立大学', '大田生活圈', '性价比'],
        source: 'https://commons.wikimedia.org/wiki/File:Chungnam_National_University_Law_School_Building_N12.jpg',
      },
    ],
  },
]

const allSchoolProfiles = schoolRegions.flatMap((group) => group.schools)

const schoolTopicQuickEntries = [
  '入学须知',
  '签证与外国人登录证',
  '找房与转租',
  '同好与交友',
  '找兼职与代兼职',
  '医院与保险',
  '作业与论文',
  '周边生活攻略',
  '跳蚤市场',
  '八卦与吃瓜',
  '抱团选课',
  '各种吐槽',
]

const schoolTopicExtraQuickEntries = ['跳蚤市场', '八卦与吃瓜', '抱团选课', '各种吐槽']

const schoolTopicQuickEntryLabels: Record<string, string> = {
  入学与选课: '入学须知',
  租房与保证金: '找房与转租',
  银行卡与手机卡: '同好与交友',
  打工与劳动问题: '找兼职与代兼职',
  毕业与论文: '作业与论文',
}

const getSchoolTopicQuickEntries = (entries: string[]) => {
  const normalizedEntries = entries.map((entry) => schoolTopicQuickEntryLabels[entry] ?? entry)
  return [...new Set([...normalizedEntries, ...schoolTopicExtraQuickEntries])]
}

const schoolKoreanNames: Record<string, string> = {
  snu: '서울대학교',
  yonsei: '연세대학교',
  korea: '고려대학교',
  'skku-seoul': '성균관대학교',
  hanyang: '한양대학교',
  kyunghee: '경희대학교',
  sejong: '세종대학교',
  cau: '중앙대학교',
  ewha: '이화여자대학교',
  sogang: '서강대학교',
  dongguk: '동국대학교',
  konkuk: '건국대학교',
  hufs: '한국외국어대학교',
  uos: '서울시립대학교',
  'dankook-seoul': '단국대학교',
  seoultech: '서울과학기술대학교',
  kookmin: '국민대학교',
  soongsil: '숭실대학교',
  sookmyung: '숙명여자대학교',
  kwangwoon: '광운대학교',
  myongji: '명지대학교',
  sangmyung: '상명대학교',
  hansung: '한성대학교',
  sungshin: '성신여자대학교',
  dongduk: '동덕여자대학교',
  duksung: '덕성여자대학교',
  swu: '서울여자대학교',
  knua: '한국예술종합학교',
  knsu: '한국체육대학교',
  sahmyook: '삼육대학교',
  hongik: '홍익대학교',
  skku: '성균관대학교',
  ajou: '아주대학교',
  inha: '인하대학교',
  inu: '인천대학교',
  'hanyang-erica': '한양대학교 ERICA',
  'cau-anseong': '중앙대학교 안성캠퍼스',
  pnu: '부산대학교',
  donga: '동아대학교',
  knu: '경북대학교',
  keimyung: '계명대학교',
  kaist: '한국과학기술원',
  chungnam: '충남대학교',
}

const getSchoolTopicSeed = (school: SchoolProfile) =>
  school.id.split('').reduce((total, char) => total + char.charCodeAt(0), school.name.length * 97)

const makeGenericSchoolTopic = (school: SchoolProfile): SchoolTopic => {
  const seed = getSchoolTopicSeed(school)
  const schoolName = school.name
  const location = school.city.replace(/\s*·\s*/g, ' · ').replace(/\s+/g, ' ').trim()
  const city = school.region.split('/')[0].trim()
  const topPrograms = school.programs.slice(0, 3)
  const programText = topPrograms.join('、')
  const campusText = school.landmark.replace(/\s+/g, ' ').trim()
  const schoolShortName = schoolName.replace('大学', '')
  const baseViews = 900 + (seed % 1700)
  const topicTags = [
    '韩国',
    city,
    schoolName,
    '大学院',
    '本科',
    '语学院',
    '2026更新',
    ...school.programs.slice(0, 2),
  ]

  return {
    id: school.id,
    slug: school.id,
    nameZh: schoolName,
    nameKo: schoolKoreanNames[school.id] ?? '학교명 확인 예정',
    nameEn: school.englishName,
    country: '韩国',
    city,
    district: location,
    tags: [...new Set(topicTags)],
    seoTitle: `${schoolName}留学生生活攻略 - 留学生首页`,
    seoDescription: `${schoolName}留学生生活攻略，整理${schoolName}入学、选课、租房、签证、外国人登录证、打工、医院、银行卡、毕业和校园生活相关经验，帮助韩国留学生少走弯路。`,
    heroTitle: `${schoolName}留学生生活攻略`,
    heroSubtitle: `整理${schoolName}留学生在${location}学习和生活时最常遇到的问题：入学选课、签证滞留、租房保证金、打工许可、医院保险、毕业论文和周边生活。${programText ? `${programText}方向` : '本科、大学院和语学院'}同学可以按专题快速查找经验。`,
    quickEntries: schoolTopicQuickEntries,
    suitableContent: [...new Set(['语学院', '本科', '大学院', '租房', '生活', '打工', '毕业', ...school.programs])],
    hotQuestions: [
      {
        title: `${schoolName}${campusText}附近租房选哪里更方便？`,
        category: '租房/搬家/保证金',
        rewardPoints: 80 + (seed % 5) * 20,
        answersCount: 8 + (seed % 7),
        views: baseViews + 820,
        status: 'open',
        tags: [location, '保证金', '通勤', '亲身经历'],
        updatedAt: '2026-05-03',
      },
      {
        title: `${schoolName}新生入学第一周要先办哪些事？`,
        category: '语学院/本科/大学院',
        rewardPoints: 100 + (seed % 4) * 20,
        answersCount: 6 + (seed % 6),
        views: baseViews + 540,
        status: 'solved',
        tags: ['新生', '学生证', '银行开户', '已解决'],
        updatedAt: '2026-05-02',
      },
      {
        title: `${schoolName}选课和学分确认有哪些容易漏掉的点？`,
        category: '入学/选课/学分',
        rewardPoints: 60 + (seed % 3) * 30,
        answersCount: 5 + (seed % 8),
        views: baseViews + 260,
        status: 'open',
        tags: ['选课', '学分', topPrograms[0] ?? '大学院'],
        updatedAt: '2026-05-01',
      },
      {
        title: `${schoolName}附近保证金租房怎么查风险？`,
        category: '租房/搬家/保证金',
        rewardPoints: 100,
        answersCount: 10 + (seed % 5),
        views: baseViews + 980,
        status: 'solved',
        tags: ['保证金', '合同', '中介', '已解决'],
        updatedAt: '2026-04-29',
      },
      {
        title: `${schoolName}留学生办理外国人登录证要提前准备什么？`,
        category: '签证/滞留资格',
        rewardPoints: 70,
        answersCount: 5 + (seed % 5),
        views: baseViews + 620,
        status: 'open',
        tags: ['外国人登录证', 'HiKorea', '预约', '2026更新'],
        updatedAt: '2026-04-28',
      },
      {
        title: `${schoolName}附近银行开户和手机认证怎么安排？`,
        category: '银行卡/手机卡/保险',
        rewardPoints: 40 + (seed % 3) * 10,
        answersCount: 4 + (seed % 5),
        views: baseViews + 330,
        status: 'solved',
        tags: ['银行卡', '手机认证', '校园周边'],
        updatedAt: '2026-04-26',
      },
      {
        title: `${schoolName}学生兼职申请时间制就业许可怎么走？`,
        category: '打工/劳动纠纷',
        rewardPoints: 90,
        answersCount: 8 + (seed % 6),
        views: baseViews + 760,
        status: 'open',
        tags: ['打工', '兼职', '时间制就业', '学校确认'],
        updatedAt: '2026-04-24',
      },
      {
        title: `${schoolName}大学院论文和毕业节点要提前确认什么？`,
        category: '毕业/论文/延毕',
        rewardPoints: 150,
        answersCount: 4 + (seed % 4),
        views: baseViews + 180,
        status: 'open',
        tags: ['毕业', '论文', '大学院'],
        updatedAt: '2026-04-22',
      },
    ],
    featuredPosts: [
      {
        title: `${schoolName}留学生新生入学 checklist`,
        summary: `从入境前材料、宿舍/租房、学生证、校园系统、银行卡、手机卡到外国人登录证预约，按到校时间线整理${schoolName}新生最容易漏掉的事项。`,
        author: `${schoolShortName}在读前辈`,
        views: baseViews + 1800,
        likes: 160 + (seed % 90),
        bookmarks: 260 + (seed % 180),
        isFeatured: true,
        tags: ['新生', '入学', 'checklist', '精华'],
        updatedAt: '2026-05-02',
      },
      {
        title: `${schoolName}周边租房与通勤避坑指南`,
        summary: `按通勤距离、保证金、管理费、采光隔音、房东/中介沟通和合同确认顺序拆解${schoolName}周边租房选择，避免只看照片就交定金。`,
        author: `${location}租房过来人`,
        views: baseViews + 2500,
        likes: 190 + (seed % 120),
        bookmarks: 340 + (seed % 260),
        isFeatured: true,
        tags: ['租房', '保证金', '合同'],
        updatedAt: '2026-05-01',
      },
      {
        title: `${schoolName}${city}生活圈介绍`,
        summary: `整理${schoolName}周边餐饮、超市、交通、银行、医院、打印店和日常采购动线，适合刚到韩国的同学快速熟悉${location}生活节奏。`,
        author: `${city}生活记录员`,
        views: baseViews + 1320,
        likes: 110 + (seed % 80),
        bookmarks: 220 + (seed % 160),
        isFeatured: true,
        tags: ['生活圈', '交通', '购物'],
        updatedAt: '2026-04-30',
      },
      {
        title: `${schoolName}${topPrograms[0] ?? '大学院'}方向选课经验`,
        summary: `从课程容量、教授沟通、学分安排、发表/论文要求和毕业计划角度，复盘${schoolName}选课前需要确认的问题。具体要求以院系公告和导师意见为准。`,
        author: `${schoolShortName}大学院在读`,
        views: baseViews + 860,
        likes: 88 + (seed % 70),
        bookmarks: 150 + (seed % 110),
        isFeatured: false,
        tags: ['大学院', '选课', topPrograms[0] ?? '教授'],
        updatedAt: '2026-04-28',
      },
      {
        title: `${schoolName}语学院/本科/大学院申请节点整理`,
        summary: `整理语学院上课节奏、分班、语言成绩、本科/大学院申请材料和时间线。不同项目要求差异很大，最终以学校最新募集要项为准。`,
        author: '语学院毕业生',
        views: baseViews + 970,
        likes: 92 + (seed % 60),
        bookmarks: 170 + (seed % 130),
        isFeatured: true,
        tags: ['语学院', '本科申请', '韩语'],
        updatedAt: '2026-04-27',
      },
      {
        title: `${schoolName}银行卡、手机卡和本人认证攻略`,
        summary: `说明开户前要准备的身份信息、手机认证、转账限额、银行卡使用和本人认证中的常见问题。窗口要求会变化，具体以银行和运营商现场说明为准。`,
        author: `${schoolShortName}本科生`,
        views: baseViews + 650,
        likes: 72 + (seed % 40),
        bookmarks: 120 + (seed % 80),
        isFeatured: false,
        tags: ['银行卡', '手机卡', '认证'],
        updatedAt: '2026-04-25',
      },
      {
        title: `${schoolName}医院看病与保险使用流程`,
        summary: `整理预约、挂号、诊疗费、保险使用、处方和药店取药的基础流程。医疗判断请以医院专业意见为准，紧急情况优先联系急救或学校国际处。`,
        author: '在韩生活五年',
        views: baseViews + 520,
        likes: 66 + (seed % 40),
        bookmarks: 118 + (seed % 80),
        isFeatured: false,
        tags: ['医院', '保险', '药店'],
        updatedAt: '2026-04-23',
      },
      {
        title: `${schoolName}毕业论文和延毕风险整理`,
        summary: `按时间线整理导师沟通、选题、开题、中期、查重、提交和毕业审查节点，也提醒延毕、学分和签证衔接风险。具体要求以院系公告为准。`,
        author: '大学院毕业生',
        views: baseViews + 430,
        likes: 58 + (seed % 40),
        bookmarks: 110 + (seed % 70),
        isFeatured: true,
        tags: ['毕业', '论文', '时间线'],
        updatedAt: '2026-04-20',
      },
    ],
  }
}

const getSchoolTopicForSlug = (slug: string) => {
  const savedTopic = getSchoolTopicBySlug(slug)
  if (savedTopic) return savedTopic

  const school = allSchoolProfiles.find((profile) => profile.id === slug)
  return school ? makeGenericSchoolTopic(school) : undefined
}

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
  konkuk: 'https://www.konkuk.ac.kr/',
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
  inha: 'https://www.inha.ac.kr/',
  inu: 'https://www.inu.ac.kr/inuengl/index.do',
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
  konkuk: 'https://kli.konkuk.ac.kr/',
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
  inha: 'https://internationalcenter.inha.ac.kr/',
  inu: 'https://www.inu.ac.kr/inukli/index.do',
  'hanyang-erica': 'https://iie.hanyang.ac.kr/',
  'cau-anseong': 'https://korean.cau.ac.kr/',
  pnu: 'https://lei.pusan.ac.kr/',
  donga: 'https://global.donga.ac.kr/',
  knu: 'https://korean.knu.ac.kr/',
  keimyung: 'https://kli.kmu.ac.kr/',
  chungnam: 'https://plus.cnu.ac.kr/html/en/',
}

const campusLinksBySchool: Record<string, CampusLink[]> = {
  konkuk: [
    { label: '首尔校区官网 · 广津区', url: 'https://www.konkuk.ac.kr/', icon: 'pin' },
    { label: '外国人招生 · CISS', url: 'https://ciss.konkuk.ac.kr/', icon: 'building' },
  ],
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
  inha: [
    { label: '龙岘校区官网 · 仁川', url: 'https://www.inha.ac.kr/', icon: 'pin' },
    { label: '国际中心入口', url: 'https://internationalcenter.inha.ac.kr/', icon: 'building' },
  ],
  inu: [
    { label: '松岛校区官网 · 仁川', url: 'https://www.inu.ac.kr/inuengl/index.do', icon: 'pin' },
    { label: '国际招生入口', url: 'https://www.inu.ac.kr/sites/global/International.html', icon: 'building' },
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
  inha: 'https://internationalcenter.inha.ac.kr/',
  inu: 'https://www.inu.ac.kr/sites/global/International.html',
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

const schoolLogoUrls: Record<string, string> = {
  ajou: '/school-logos/seal/ajou.png',
  cau: '/school-logos/seal/cau.png',
  'cau-anseong': '/school-logos/seal/cau-anseong.png',
  chungnam: '/school-logos/seal/chungnam.png',
  'dankook-seoul': '/school-logos/seal/dankook-seoul.png',
  donga: '/school-logos/seal/donga.png',
  dongduk: '/school-logos/seal/dongduk.png',
  dongguk: '/school-logos/seal/dongguk.png',
  duksung: '/school-logos/seal/duksung.png',
  ewha: '/school-logos/seal/ewha.png',
  hansung: '/school-logos/seal/hansung.png',
  hanyang: '/school-logos/seal/hanyang.png',
  'hanyang-erica': '/school-logos/seal/hanyang-erica.png',
  inha: '/school-logos/seal/inha.png',
  inu: '/school-logos/seal/inu.png',
  hongik: '/school-logos/seal/hongik.png',
  hufs: '/school-logos/seal/hufs.png',
  kaist: '/school-logos/seal/kaist.png',
  keimyung: '/school-logos/seal/keimyung.png',
  knsu: '/school-logos/seal/knsu.png',
  knu: '/school-logos/seal/knu.png',
  knua: '/school-logos/seal/knua.png',
  konkuk: '/school-logos/seal/konkuk.png',
  kookmin: '/school-logos/seal/kookmin.png',
  korea: '/school-logos/seal/korea.png',
  kwangwoon: '/school-logos/seal/kwangwoon.png',
  kyunghee: '/school-logos/seal/kyunghee.png',
  myongji: '/school-logos/seal/myongji.png',
  pnu: '/school-logos/seal/pnu.png',
  sahmyook: '/school-logos/seal/sahmyook.png',
  sangmyung: '/school-logos/seal/sangmyung.png',
  sejong: '/school-logos/seal/sejong.png',
  seoultech: '/school-logos/seal/seoultech.png',
  skku: '/school-logos/seal/skku.png',
  'skku-seoul': '/school-logos/seal/skku-seoul.png',
  snu: '/school-logos/seal/snu.png',
  sogang: '/school-logos/seal/sogang.png',
  soongsil: '/school-logos/seal/soongsil.png',
  sookmyung: '/school-logos/seal/sookmyung.png',
  sungshin: '/school-logos/seal/sungshin.png',
  swu: '/school-logos/seal/swu.png',
  uos: '/school-logos/seal/uos.png',
  yonsei: '/school-logos/seal/yonsei.png',
}

const getSchoolLogoUrl = (school: SchoolProfile) => schoolLogoUrls[school.id] ?? ''

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

const partnerShowcases: PartnerShowcase[] = [
  {
    type: '留学咨询',
    audience: '择校、材料、签证、语学院和大学院申请',
    tone: 'consulting',
    merchants: [
      {
        id: 'wala-study',
        name: '瓦剌留学',
        logo: '瓦剌',
        logoImage: '/merchant-logos/wala-study.png',
        summary: '韩国留学申请、签证续签、语学院和大学院规划',
        description: '瓦剌留学专注韩国院校申请与在韩升学规划，提供择校评估、材料核对、文书节奏、签证指导和入学后续服务，适合准备申请或已经在韩转阶段的学生对比咨询。',
        tags: ['院校规划', '材料审核', '签证指导', '全程陪伴'],
        verified: true,
        location: '韩国 · 首尔',
        detailTone: '专业留学规划与服务',
        detailSections: [
          {
            title: '适合咨询的人',
            text: '准备韩国本科、大学院、语学院申请，或者已经在韩读书但要换阶段、换学校、续签材料的学生。',
          },
          {
            title: '咨询前先准备',
            text: '目标专业、当前学历、语言成绩、成绩单、预算、预计入学时间和目前滞留资格，信息越清楚越容易判断服务范围。',
          },
          {
            title: '平台提醒',
            text: '商家展示页用于信息对比，不代表平台承诺录取、签证结果或具体政策结论；最终以学校、HiKorea 和出入境最新公告为准。',
          },
        ],
      },
      {
        name: '大学院申请规划',
        logo: '大学院',
        summary: '研究计划书、教授套磁、作品集和面试准备',
        description: '展示可服务专业、过往录取学校、文书修改范围和时间节点，适合准备硕博申请的学生对比。',
        tags: ['大学院', '研究计划', '面试'],
      },
      {
        name: '语学院报名代办',
        logo: '语学院',
        summary: '语学院择校、报名材料、缴费流程和宿舍信息',
        description: '适合新生先了解入学批次、学费区间、宿舍名额和后续升学路径，再决定是否委托办理。',
        tags: ['语学院', '报名', '宿舍'],
      },
      {
        name: '签证续签材料核对',
        logo: '续签',
        summary: 'D-2、D-4、登录证、滞留资格和材料补正',
        description: '展示窗口经验、材料清单、预约提醒和补交风险，帮助学生在咨询前先明确自己的情况。',
        tags: ['D-2', 'D-4', '登录证'],
      },
    ],
  },
  {
    type: '论文与毕业',
    audience: '论文流程、发表准备、延毕材料和毕业审查',
    tone: 'academic',
    merchants: [
      {
        id: 'tuzhuren-thesis',
        name: '土著人',
        logo: '土著人',
        logoImage: '/merchant-logos/native-education.png',
        summary: '韩国论文流程、毕业审查、韩文发表和延毕节点支持',
        description:
          '土著人品牌展示韩国论文流程、毕业材料、韩文表达、发表准备和延毕节点提醒等合规学业支持，适合本科、大学院和毕业阶段学生对比咨询。',
        tags: ['论文流程', '毕业审查', '韩文发表'],
        verified: true,
        location: '韩国 · 线上/首尔',
        detailTone: '土著人品牌的管理商家',
        detailSections: [
          {
            title: '适合咨询的人',
            text: '正在准备论文、毕业材料、发表稿、延毕申请或学院窗口材料的本科、大学院和毕业阶段学生。',
          },
          {
            title: '咨询前先准备',
            text: '学校、专业、毕业要求、论文阶段、导师反馈、提交截止日、已写材料和目前最卡的具体问题。',
          },
          {
            title: '平台提醒',
            text: '只展示合规学业支持边界，不提供代写、代投、替考、伪造材料等服务；毕业要求以学校和学院最新通知为准。',
          },
        ],
      },
      {
        name: '论文流程与毕业审查支持',
        logo: '论文',
        summary: '论文流程、发表准备、延毕材料和毕业审查',
        description: '展示可合法合规提供的论文流程说明、格式检查、发表准备和毕业节点提醒，重点写清服务边界。',
        tags: ['论文流程', '格式检查', '毕业审查'],
      },
      {
        name: '发表准备与韩文校对',
        logo: '发表',
        summary: '发表格式、韩文表达、引用规范和提交节点',
        description: '适合展示老师背景、可服务专业、修改范围、交付方式和引用规范提醒，避免学生误解成代写代投。',
        tags: ['发表', '韩文校对', '引用规范'],
      },
      {
        name: '延毕与毕业材料咨询',
        logo: '毕业',
        summary: '毕业条件、延毕材料、论文审查和学校窗口提醒',
        description: '展示常见材料节点、学院沟通方式和风险提醒，帮助学生先确认自己是否卡在学分、论文或行政流程上。',
        tags: ['延毕', '毕业材料', '审查节点'],
      },
    ],
  },
  {
    type: '韩语培训',
    audience: 'TOPIK、韩语写作、口语面试和语学院衔接',
    tone: 'academic',
    merchants: [
      {
        name: 'TOPIK 写作训练',
        logo: 'TOPIK',
        summary: '写作批改、语法纠错、备考规划和口语练习',
        description: '适合展示老师资质、课程节奏、批改样例和适合人群，让学生先对比是否符合自己的水平。',
        tags: ['TOPIK', '写作批改', '备考'],
      },
      {
        name: '韩语口语与面试培训',
        logo: '口语',
        summary: '大学面试、课堂发表、教授沟通和生活口语',
        description: '展示课程形式、适合阶段、模拟面试方式和反馈周期，帮助申请生和在校生提高表达稳定性。',
        tags: ['口语', '面试', '发表'],
      },
      {
        name: '语学院升学韩语辅导',
        logo: '韩语',
        summary: '语学院升本科、分班考试、写作表达和听说训练',
        description: '适合展示分班考试经验、课程频率、作业反馈和升学语言目标，方便学生按阶段选择。',
        tags: ['语学院', '升学', '分班考试'],
      },
    ],
  },
  {
    type: '艺术类培训',
    audience: '作品集、面试准备、设计/传媒/音乐/表演方向',
    tone: 'academic',
    merchants: [
      {
        name: '艺术作品集辅导',
        logo: '作品集',
        summary: '作品集规划、排版表达、项目梳理和提交检查',
        description: '展示可服务方向、老师背景、作品集修改边界和面试准备方式，适合艺术、设计和传媒申请者对比。',
        tags: ['作品集', '设计', '传媒'],
      },
      {
        name: '艺术院校面试准备',
        logo: '面试',
        summary: '自我介绍、作品阐述、韩语问答和模拟面试',
        description: '适合展示模拟面试流程、反馈方式、可服务学校和语言要求，帮助学生提前练习表达。',
        tags: ['面试', '作品阐述', '韩语问答'],
      },
      {
        name: '音乐/表演方向申请训练',
        logo: '艺考',
        summary: '专业方向定位、曲目/片段准备、面试节奏和材料检查',
        description: '展示可覆盖专业、训练周期、试演反馈和材料要求提醒，方便艺术类学生按专业筛选服务。',
        tags: ['音乐', '表演', '申请训练'],
      },
    ],
  },
  {
    type: '作品集辅导',
    audience: '艺术、设计、传媒、建筑和影像方向作品集规划与修改',
    tone: 'academic',
    merchants: [
      {
        name: '作品集规划与排版辅导',
        logo: '作品集',
        summary: '项目梳理、作品集结构、视觉排版和提交前检查',
        description: '展示可辅导方向、老师背景、修改轮次、交付边界和作品集原创要求，适合准备艺术、设计、传媒和建筑类申请的学生对比。',
        tags: ['作品集', '排版', '项目梳理'],
      },
      {
        name: '设计类作品集项目辅导',
        logo: '设计',
        summary: '平面、视觉传达、产品、空间和交互方向项目表达',
        description: '适合展示项目拆解方式、调研呈现、过程页整理、成品图表达和面试阐述准备，帮助学生先判断服务是否匹配专业方向。',
        tags: ['设计', '视觉传达', '交互'],
      },
      {
        name: '传媒影像作品集辅导',
        logo: '影像',
        summary: '视频、摄影、导演、动画和媒体艺术作品集整理',
        description: '展示可服务方向、作品筛选方式、链接提交规范、韩语/英语阐述准备和面试前检查清单，适合传媒与影像方向学生。',
        tags: ['传媒', '影像', '面试阐述'],
      },
    ],
  },
  {
    type: '餐饮相关',
    audience: '中餐、外卖、夜宵、聚餐和校区团购',
    tone: 'food',
    merchants: [
      {
        name: '校区餐饮与团购优惠',
        logo: '餐饮',
        summary: '中餐、外卖、夜宵、聚餐和校区团购',
        description: '适合做菜单曝光、优惠券、同乡聚餐和考试周套餐展示，按学校和地区触达附近学生。',
        tags: ['中餐', '外卖', '团购'],
      },
      {
        name: '新村中餐套餐',
        logo: '中餐',
        summary: '单人套餐、寝室拼单、考试周夜宵和到店优惠',
        description: '展示菜单、营业时间、配送范围和学生专属券，方便附近学生先比价再下单。',
        tags: ['新村', '套餐', '夜宵'],
      },
      {
        name: '弘大聚餐预订',
        logo: '聚餐',
        summary: '生日聚餐、同乡会、社团饭局和包间预约',
        description: '适合展示人均价格、包间数量、可预约时间和真实评价，帮助学生减少踩雷。',
        tags: ['聚餐', '包间', '预约'],
      },
    ],
  },
  {
    type: '物流快递',
    audience: '行李托运、海运、转运、同城配送和文件快递',
    tone: 'delivery',
    merchants: [
      {
        name: '跨境物流与韩国快递',
        logo: '物流',
        summary: '行李托运、海运、转运、同城配送和文件快递',
        description: '展示价格区间、时效、可寄物品、校区上门范围和售后规则，减少学生反复问价成本。',
        tags: ['行李托运', '海运', '同城配送'],
      },
      {
        name: '毕业行李回国',
        logo: '回国',
        summary: '毕业季箱子打包、上门取件、海运和空运选择',
        description: '适合展示计费方式、禁寄物品、保险赔付和预计时效，方便毕业生货比三家。',
        tags: ['毕业', '海运', '上门'],
      },
      {
        name: '文件快递加急',
        logo: '文件',
        summary: '成绩单、公证件、合同、材料原件和加急寄送',
        description: '展示可寄国家、预计到达时间、追踪方式和丢件处理规则，减少关键材料延误风险。',
        tags: ['文件', '加急', '追踪'],
      },
    ],
  },
  {
    type: '通信',
    audience: '电话卡、流量卡、宽带、Wi-Fi 和号码实名',
    tone: 'telecom',
    merchants: [
      {
        name: '手机卡与网络套餐',
        logo: '通信',
        summary: '电话卡、流量卡、宽带、Wi-Fi 和号码实名',
        description: '适合面向新生展示套餐差异、办理材料、解约规则和校园附近可办理网点。',
        tags: ['手机卡', '宽带', '实名办理'],
      },
      {
        name: '新生手机卡办理',
        logo: '手机卡',
        summary: '落地临时卡、实名卡、流量套餐和号码保留',
        description: '展示套餐价格、合约期限、解约规则和所需材料，帮助新生避免办错套餐。',
        tags: ['新生', '流量', '实名'],
      },
      {
        name: '宿舍宽带安装',
        logo: '宽带',
        summary: '宽带、路由器、上门安装和短租网络方案',
        description: '适合展示安装时间、覆盖区域、押金和解约费用，方便学生入住后快速联网。',
        tags: ['宽带', '路由器', '安装'],
      },
    ],
  },
  {
    type: '家政搬家',
    audience: '搬家、退租清洁、家具处理、维修和上门安装',
    tone: 'home',
    merchants: [
      {
        name: '搬家清洁与家政维修',
        logo: '搬家',
        summary: '搬家、退租清洁、家具处理、维修和上门安装',
        description: '展示服务范围、可预约时间、费用计算方式和真实评价，适合围绕开学季与退租季投放。',
        tags: ['搬家', '清洁', '维修'],
      },
      {
        name: '退租清洁预约',
        logo: '清洁',
        summary: '退租深度清洁、垃圾处理、霉斑处理和拍照留证',
        description: '展示服务项目、收费方式、可服务地区和押金争议常见注意点，适合毕业季集中投放。',
        tags: ['退租', '清洁', '押金'],
      },
      {
        name: '家具搬运与安装',
        logo: '家具',
        summary: '二手家具搬运、床架安装、桌椅拆装和电器处理',
        description: '适合展示车型、搬运楼层、预约时间和额外费用，方便学生提前估价。',
        tags: ['家具', '搬运', '安装'],
      },
    ],
  },
  {
    type: '不动产',
    audience: '找房、转租、保证金、合同审查和周边房源',
    tone: 'estate',
    merchants: [
      {
        name: '找房转租与不动产中介',
        logo: '房产',
        summary: '找房、转租、保证金、合同审查和周边房源',
        description: '展示房源区域、合同注意事项、可带看的语言和中介资质，帮助学生避开押金和转租风险。',
        tags: ['找房', '转租', '合同审查'],
      },
      {
        name: '学校周边找房',
        logo: '找房',
        summary: '新村、黑石、建大、弘大等校区周边房源',
        description: '展示可带看语言、房源类型、保证金区间和合同注意事项，适合刚来韩国的学生。',
        tags: ['校区', '带看', '保证金'],
      },
      {
        name: '转租合同核对',
        logo: '转租',
        summary: '转租许可、押金转接、退租节点和合同风险',
        description: '适合展示审核流程、可协助沟通范围和常见风险提醒，帮助学生少踩转租坑。',
        tags: ['转租', '合同', '风险'],
      },
    ],
  },
]

const getPartnerLogoImage = (merchant: unknown) => {
  if (!merchant || typeof merchant !== 'object' || !('logoImage' in merchant)) return ''
  const logoImage = (merchant as { logoImage?: unknown }).logoImage
  return typeof logoImage === 'string' ? logoImage : ''
}

const resizeImageFileToDataUrl = (file: File, maxSize = 420, quality = 0.82) =>
  new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件。'))
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      reject(new Error('图片不能超过 6MB。'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败。'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('图片解析失败。'))
      image.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * ratio))
        const height = Math.max(1, Math.round(image.height * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('图片处理失败。'))
          return
        }
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      image.src = String(reader.result ?? '')
    }
    reader.readAsDataURL(file)
  })

const resizeTransparentImageFileToDataUrl = (file: File, maxSize = 520) =>
  new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件。'))
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      reject(new Error('图片不能超过 6MB。'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败。'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('图片解析失败。'))
      image.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * ratio))
        const height = Math.max(1, Math.round(image.height * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('图片处理失败。'))
          return
        }
        context.clearRect(0, 0, width, height)
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/png'))
      }
      image.src = String(reader.result ?? '')
    }
    reader.readAsDataURL(file)
  })

const readVideoFileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('请上传视频文件。'))
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error('视频不能超过 8MB，请先压缩后再拖入。'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('视频读取失败。'))
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.readAsDataURL(file)
  })

const readCredentialFileToDataUrl = async (file: File) => {
  if (file.type.startsWith('image/')) return resizeImageFileToDataUrl(file, 1600, 0.9)
  if (file.size > 5 * 1024 * 1024) throw new Error('认证材料不能超过 5MB，请压缩后重新上传。')
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('认证材料读取失败。'))
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.readAsDataURL(file)
  })
}

const isVideoDataUrl = (value?: string) => Boolean(value?.startsWith('data:video/'))

const seedQuestions: CommunityQuestion[] = [
  {
    id: 'q-d2-extension',
    title: '韩国D-2签证延长需要哪些材料？',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    school: '中央大学',
    rewardPoints: 120,
    answersCount: 8,
    views: 2860,
    status: 'solved',
    createdAt: '2026-05-03',
    author: '大学院新生',
    identity: '大学院',
    tags: ['韩国', '首尔', '中央大学', '签证', '2026更新', '已解决'],
    detail: '第一次延长 D-2，想确认在学证明、成绩单、住宿证明和银行余额证明是否都要准备，预约当天还需要注意什么。',
  },
  {
    id: 'q-rent-deposit',
    title: '韩国租房保证金怎么防止被骗？',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    school: '延世大学',
    rewardPoints: 160,
    answersCount: 14,
    views: 4210,
    status: 'solved',
    createdAt: '2026-05-02',
    author: '准备申请中',
    identity: '准留学生',
    tags: ['韩国', '首尔', '租房', '保证金', '亲身经历', '已解决'],
    detail: '准备住新村附近，房东要求先转一部分保证金。想知道签合同前应该查哪些信息，哪些情况不能转账。',
  },
  {
    id: 'q-arc-lost',
    title: '外国人登录证丢了怎么办？',
    category: '签证/滞留资格',
    country: '韩国',
    city: '釜山',
    school: '釜山大学',
    rewardPoints: 80,
    answersCount: 6,
    views: 1520,
    status: 'open',
    createdAt: '2026-05-01',
    author: '语学院同学',
    identity: '语学院',
    tags: ['韩国', '釜山', '外国人登录证', '补办', '待回答'],
    detail: '钱包丢了，里面有外国人登录证。想知道要不要先报警、去哪里补办、补办期间能不能正常出入学校和银行。',
  },
  {
    id: 'q-bank-account',
    title: '韩国银行卡开户需要什么？',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    school: '建国大学',
    rewardPoints: 60,
    answersCount: 7,
    views: 1986,
    status: 'solved',
    createdAt: '2026-04-30',
    author: '建大本科新生',
    identity: '本科',
    tags: ['韩国', '首尔', '建国大学', '银行卡', '已解决'],
    detail: '刚拿到外国人登录证，想去学校附近银行开户。需要学生证、手机号或者学校证明吗？',
  },
  {
    id: 'q-legal-exchange-channel',
    title: '留学生怎么走合法渠道换钱和取钱？',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    rewardPoints: 190,
    answersCount: 5,
    views: 4520,
    status: 'solved',
    createdAt: '2026-05-05',
    author: '新生家长',
    identity: '准备申请',
    tags: ['韩国', '银行卡', '汇款', 'ATM', '合规渠道', '已解决'],
    detail: '准备给孩子在韩国生活费，想知道除了找人换钱，还有哪些相对稳妥、合法、可留痕的方式。比如银行卡 ATM 提款、银行购汇和海外汇款分别要注意什么。',
  },
  {
    id: 'q-private-exchange-frozen',
    title: '私人换钱收到黑钱，银行卡被冻结怎么办？',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    rewardPoints: 185,
    answersCount: 7,
    views: 4380,
    status: 'solved',
    createdAt: '2026-05-05',
    author: '账户被冻结了',
    identity: '在读生',
    tags: ['韩国', '银行卡', '私下换汇', '账户冻结', '风险提示', '已解决'],
    detail: '之前私下换钱，对方打款后银行账户被冻结，说可能涉及黑钱或涉诈资金。现在该先联系银行、报警，还是找对方退款？需要保留什么证据？',
  },
  {
    id: 'q-work-hours',
    title: '韩国留学生可以合法打工多少小时？',
    category: '打工/劳动纠纷',
    country: '韩国',
    city: '首尔',
    school: '高丽大学',
    rewardPoints: 100,
    answersCount: 10,
    views: 3420,
    status: 'open',
    createdAt: '2026-04-29',
    author: '找兼职中',
    identity: '本科',
    tags: ['韩国', '首尔', '打工', '兼职', '以公告为准'],
    detail: '想确认 D-2 留学生打工许可、每周小时数和放假期间限制。希望有办过许可的人分享流程。',
  },
  {
    id: 'q-language-to-undergrad',
    title: '语学院转本科需要什么流程？',
    category: '语学院/本科/大学院',
    country: '韩国',
    city: '首尔',
    school: '庆熙大学',
    rewardPoints: 90,
    answersCount: 5,
    views: 1760,
    status: 'open',
    createdAt: '2026-04-28',
    author: '语学院4级',
    identity: '语学院',
    tags: ['韩国', '语学院', '本科申请', '材料'],
    detail: '目前语学院 4 级，想申请同校本科。想知道语言成绩、出勤、推荐信和材料时间线怎么安排。',
  },
  {
    id: 'q-thesis-delay',
    title: '韩国大学院论文延期怎么办？',
    category: '毕业/论文/延毕',
    country: '韩国',
    city: '首尔',
    school: '汉阳大学',
    rewardPoints: 180,
    answersCount: 11,
    views: 2670,
    status: 'solved',
    createdAt: '2026-04-27',
    author: '论文卡住了',
    identity: '大学院',
    tags: ['韩国', '大学院', '论文', '延毕', '已解决'],
    detail: '论文进度慢，导师建议延期。想知道延期申请、学费、签证和毕业时间线会有什么影响。',
  },
  {
    id: 'q-phone-plan',
    title: '韩国手机卡怎么选？',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    school: '弘益大学',
    rewardPoints: 50,
    answersCount: 4,
    views: 1320,
    status: 'open',
    createdAt: '2026-04-26',
    author: '刚到韩国',
    identity: '准留学生',
    tags: ['韩国', '手机卡', '认证', '生活'],
    detail: '想知道预付卡、合约机、알뜰폰 怎么选，主要需要韩国手机号认证和日常流量。',
  },
  {
    id: 'q-hospital-insurance',
    title: '韩国看病怎么用保险？',
    category: '医院/看病/药店',
    country: '韩国',
    city: '大田',
    school: '忠南大学',
    rewardPoints: 70,
    answersCount: 6,
    views: 1588,
    status: 'solved',
    createdAt: '2026-04-25',
    author: '第一次看病',
    identity: '大学院',
    tags: ['韩国', '医院', '保险', '药店', '已解决'],
    detail: '想知道国民健康保险怎么用，去医院挂号、缴费、拿药分别怎么做。',
  },
  {
    id: 'q-d10-jobseeker',
    slug: 'q-d10-jobseeker',
    title: '毕业后D-10求职签证怎么申请？',
    category: '求职/实习/简历',
    country: '韩国',
    city: '首尔',
    school: '西江大学',
    rewardPoints: 150,
    answersCount: 9,
    views: 2190,
    status: 'open',
    createdAt: '2026-04-24',
    author: '即将毕业',
    identity: '大学院',
    tags: ['韩国', 'D-10', '求职', '毕业', '以公告为准'],
    detail: '硕士快毕业，想从 D-2 转 D-10。希望了解准备材料、积分、求职计划书和预约经验。',
  },
  {
    id: 'q-one-room-contract',
    slug: 'q-one-room-contract',
    title: '韩国 one-room 合同签之前要看哪些条款？',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    school: '建国大学',
    rewardPoints: 110,
    answersCount: 6,
    views: 2210,
    status: 'open',
    createdAt: '2026-04-23',
    author: '第一次租房',
    identity: '本科',
    tags: ['韩国', 'one-room', '合同', '保证金', '建大入口'],
    detail: '准备在 건대입구역 附近签 one-room，想知道合同主体、管理费、退租、维修和保证金返还这些内容应该怎么逐条确认。',
  },
  {
    id: 'q-wage-arrears',
    slug: 'q-wage-arrears',
    title: '韩国兼职工资被拖欠，留学生应该怎么留证据？',
    category: '打工/劳动纠纷',
    country: '韩国',
    city: '首尔',
    school: '高丽大学',
    rewardPoints: 140,
    answersCount: 9,
    views: 3140,
    status: 'open',
    createdAt: '2026-04-22',
    author: '兼职被拖欠',
    identity: '在读生',
    tags: ['韩国', '工资拖欠', '兼职', '劳动纠纷', '1345'],
    detail: '店里一直说下周给工资，但没有按时结算。想知道排班表、聊天记录、转账记录和劳动合同怎么整理，能找哪些窗口咨询。',
  },
  {
    id: 'q-grad-course-registration',
    slug: 'q-grad-course-registration',
    title: '韩国大学院第一学期选课怎么避免选错？',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    school: '汉阳大学',
    rewardPoints: 90,
    answersCount: 5,
    views: 1680,
    status: 'solved',
    createdAt: '2026-04-21',
    author: '研一新生',
    identity: '大学院',
    tags: ['韩国', '大学院', '选课', '学分', '导师'],
    detail: '刚进大学院，不确定专业必修、研究学分、导师推荐课和毕业学分怎么一起看。想听听第一学期选课经验。',
  },
  {
    id: 'q-graduation-documents',
    slug: 'q-graduation-documents',
    title: '韩国大学毕业材料一般要提前准备什么？',
    category: '毕业/论文/延毕',
    country: '韩国',
    city: '首尔',
    school: '西江大学',
    rewardPoints: 75,
    answersCount: 4,
    views: 1280,
    status: 'open',
    createdAt: '2026-04-20',
    author: '准备毕业',
    identity: '本科',
    tags: ['韩国', '毕业材料', '成绩单', '学位证明', '认证'],
    detail: '想提前准备毕业证明、成绩单、学位证明、学信相关材料和回国认证材料。哪些文件需要学校办公室开，哪些要等毕业后才能拿？',
  },
  {
    id: 'q-moving-process',
    slug: 'q-moving-process',
    title: '首尔搬家流程和地址变更怎么安排？',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    school: '延世大学',
    rewardPoints: 65,
    answersCount: 5,
    views: 1460,
    status: 'solved',
    createdAt: '2026-04-19',
    author: '新村搬家中',
    identity: '语学院',
    tags: ['韩国', '搬家', '地址变更', '退租', '新村'],
    detail: '准备从新村搬到弘大附近，想知道搬家公司、家具处理、水电气网结算、押金返还和外国人登录证地址变更的顺序。',
  },
  {
    id: 'q-trash-sorting',
    slug: 'q-trash-sorting',
    title: '韩国垃圾分类和大型废弃物到底怎么扔？',
    category: '周边生活攻略',
    country: '韩国',
    city: '首尔',
    school: '中央大学',
    rewardPoints: 40,
    answersCount: 6,
    views: 1850,
    status: 'open',
    createdAt: '2026-04-18',
    author: '黑石洞新住户',
    identity: '本科',
    tags: ['韩国', '垃圾分类', '大型废弃物', '生活', '黑石洞'],
    detail: '搬进 one-room 后不知道 음식물쓰레기、一般垃圾、回收和旧家具分别怎么扔。不同区是不是规则不一样？',
  },
  {
    id: 'q-secondhand-trade',
    slug: 'q-secondhand-trade',
    title: '韩国二手交易买电器怎么避坑？',
    category: '二手交易/搬家处理',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    rewardPoints: 55,
    answersCount: 7,
    views: 1730,
    status: 'solved',
    createdAt: '2026-04-17',
    author: '搬家买家具',
    identity: '在读生',
    tags: ['韩国', '二手交易', '电器', '当근', '面交'],
    detail: '想买二手冰箱和微波炉，担心坏机、搬运费和先转账被骗。希望有经验的人说说面交检查清单。',
  },
  {
    id: 'q-school-dorm',
    slug: 'q-school-dorm',
    title: '韩国学校宿舍申请失败后怎么找过渡住处？',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    school: '延世大学',
    rewardPoints: 85,
    answersCount: 6,
    views: 1920,
    status: 'open',
    createdAt: '2026-04-16',
    author: '宿舍落选',
    identity: '准留学生',
    tags: ['韩国', '学校宿舍', '考试院', '短租', '新村'],
    detail: '宿舍没申请上，离入学只剩一段时间。想知道考试院、短租、guesthouse 和 one-room 哪种适合作为过渡。',
  },
]

const seedAnswers: QuestionAnswer[] = [
  {
    id: 'a-d2-extension-accepted',
    questionId: 'q-d2-extension',
    author: '中央大学博士在读',
    identity: '大学院',
    content: `建议按“先确认期限，再预约，再开学校材料，再补资金/住宿证明”的顺序做。

1. 先看外国人登录证背面的滞留期限，不要等到最后一周。HiKorea 预约位经常满，延签最好提前 4-8 周开始看预约。
2. 基础材料通常包括：护照、外国人登录证、申请书、手续费、在学证明、成绩单、学费缴纳证明或注册确认、住宿证明。住宿证明可以是本人名义租房合同、宿舍入住证明，或者房东/朋友提供的居住确认材料。
3. 资金证明要特别注意。部分学校国际处说明里会要求本人韩国银行余额证明，金额和是否必须提交会因学校、出入境办事处、成绩/出勤、延期原因而变化。不要只按同学去年材料准备，提交前打 1345 或问学校国际处。
4. 如果是论文阶段、休学复学、超学期、成绩偏低或出勤异常，可能会被要求提交导师确认、论文计划、学业计划、说明书等补充材料。
5. 当天带原件和复印件，所有英文/韩文以外材料可能需要翻译。线上 e-Application 能办时费用和速度通常更友好，但文件要提前扫描成 PDF/JPG。

避坑：延签不是“材料越少越好”，而是要证明你仍然是正常在学、住所明确、能负担韩国生活。政策和窗口口径会变，最终以 HiKorea、1345、学校国际处最新说明为准。`,
    likes: 42,
    accepted: true,
    createdAt: '2026-05-03',
  },
  {
    id: 'a-rent-deposit-accepted',
    questionId: 'q-rent-deposit',
    author: '首尔租房过来人',
    identity: '毕业生',
    content: `押金被骗通常不是因为“房子不好看”，而是合同主体、登记、债务和转账对象没查清。签约前按这个顺序做：

1. 先确认房东是不是房屋所有人。让中介出示登记簿誊本/등기부등본，核对所有人姓名、地址、抵押权、查封、전세권 等记录。房东、合同上的出租人、收款账户名最好一致。
2. 查中介是否合法。通过正规持证中介签约，确认 중개사무소 名称、등록번호、공인중개사 信息。不要把大额定金打给“室长、管理员、朋友、代管人”的个人账户。
3. 合同里写清：保证金、月租、管理费包含项目、水电气网费谁承担、入住日、退租通知期限、押金返还日、维修责任、违约金。口头承诺必须写进合同。
4. 入住后尽快做地址变更申报，并拿租赁合同去做 확정일자/固定日期。外国人地址变更通常有期限要求，学校宿舍、考试院、朋友家借住的材料也要提前问清能不能作为住所证明。
5. 如果是高保证金、전세 或半전세，优先考虑 전세보증금 반환보증/押金返还保证，确认房子类型和合同是否符合条件。不要因为月租便宜就接受“不能申报地址、不能做固定日期”的房子。
6. 付款留痕：定金、保证金、月租全部银行转账，备注写房屋地址和用途。看房时拍水压、墙面、地板、门锁、霉斑、家电状态，入住当天发给房东/中介留证。

红线：没看房先转大额定金、收款人不是合同主体、房东拒绝登记/拒绝固定日期、合同不让你保留原件、保证金明显低价诱导、管理费只写“另计”但不列明项目。这些情况宁可换房。`,
    likes: 68,
    accepted: true,
    createdAt: '2026-05-02',
  },
  {
    id: 'a-arc-lost-accepted',
    questionId: 'q-arc-lost',
    author: '釜山大学语学院前辈',
    identity: '语学院',
    content: `先别慌，外国人登录证丢失后重点是“防止被冒用 + 尽快补办”。

1. 先确认是否真的丢了：钱包、宿舍、教室、银行、便利店、公交/地铁遗失物中心都查一遍。银行卡同时丢失的话，先打银行客服电话挂失。
2. 通过 HiKorea 的居留卡遗失申报/补办说明确认流程。通常需要预约后到管辖出入境事务所申请再发行。部分情况可以先做遗失申报，避免证件被他人滥用。
3. 补办常见材料：护照、申请书、照片、手续费；如果有警察遗失申报或学校证明，也可以带上。窗口可能要求补充材料，所以当天不要只带手机照片。
4. 时间线：很多学校国际处提醒，Residence Card/ARC 丢失后要在规定期限内到出入境补办，常见口径是 14 天内处理。不要拖到签证延长或银行业务时才补。
5. 补办期间，如果银行、手机、学校需要身份确认，可以问出入境能否开相关证明，或者先使用护照和学校证明过渡。

避坑：不要把外国人登录证号码、正反面照片随便发给租房中介或陌生代办。证件丢失后，银行卡、手机实名认证、网购海关号等都可能受影响，先挂失金融账户，再处理补办。`,
    likes: 31,
    accepted: true,
    createdAt: '2026-05-01',
  },
  {
    id: 'a-bank-account-accepted',
    questionId: 'q-bank-account',
    author: '建大附近开户过来人',
    identity: '本科',
    content: `韩国开户最稳的做法是去学校合作银行或外国人业务多的支行，不要随便挑一个小网点。

1. 常见材料：护照、外国人登录证/Residence Card、韩国手机号、在学证明或学生证、住所信息。Study in Korea 的生活指南也提到开户会需要身份证件、签名/印章和金融交易目的证明。
2. 先问学校国际处有没有“团体开户”或合作银行。很多大学附近的 Hana/Woori/Shinhan/KB 支行更熟悉留学生材料。
3. 如果刚到韩国还没拿到 ARC，有些银行可能只能开受限账户，或要求之后拿 ARC 再补办银行卡、网银、转账限额。不要期待第一天就能完整开通所有功能。
4. 开户时顺便确认：银行卡是否能刷交通卡、是否能海外支付、手机银行能否登录、每日转账限额、是否需要 OTP/보안카드。
5. 韩国手机号和银行账户最好用同一份身份信息登记。名字拼写、空格、护照名和 ARC 名不一致，后面手机认证、网购、Toss/KakaoPay 都容易失败。

建议顺序：先办 ARC 预约和学校证明；拿到 ARC 后去学校合作银行开户；再用本人名义手机号和银行账户做实名认证。`,
    likes: 29,
    accepted: true,
    createdAt: '2026-04-30',
  },
  {
    id: 'a-legal-exchange-channel-accepted',
    questionId: 'q-legal-exchange-channel',
    author: '银行渠道用过的人',
    identity: '毕业生',
    content: `不要在群里找陌生人“换钱/换米”。留学生生活费最稳的是走银行和持牌金融机构渠道，重点是本人实名、资金来源清楚、交易可追溯。

1. 境外银行卡在韩国 ATM 取现：如果你有支持海外取现的银行卡，可以在韩国 ATM 按银联/Visa/Mastercard 等通道取韩币。优点是快、留痕清楚；缺点是有汇率、手续费、单笔和每日限额。取现前先问发卡银行是否开通境外取现、每日限额、手续费和风控规则。
2. 银行购汇后海外汇款：在本人银行账户按银行要求购汇，再通过银行柜台、手机银行或网银做跨境汇款。用途、额度、收款人信息、学校/租房/生活费说明要真实，保留购汇、汇款和到账记录。
3. 韩国本地银行收款：到韩国后用本人名义开户，尽量让生活费从家人实名账户或本人账户汇入本人韩国账户。收款人姓名拼写要和韩国银行账户一致，避免因为姓名不一致被退汇或风控。
4. 正规换汇/汇款服务：如果使用第三方汇款机构，也要确认它是否持牌、是否实名、是否能出具交易记录。不要使用只在群聊收款、不给合同和凭证的个人。

建议保留：付款人和收款人身份、银行回单、汇款用途、聊天记录、学校缴费或租房用途证明。遇到大额资金、频繁转账、他人代收代付时，先问银行，不要靠群友口径做决定。

平台规则：本平台严禁发布换钱、换米相关求助、帮助和广告。私下换汇属于违法行为；因私下接洽产生的资金冻结、涉诈、洗钱或税务风险，由个人自行承担。`,
    likes: 54,
    accepted: true,
    createdAt: '2026-05-05',
  },
  {
    id: 'a-private-exchange-frozen-accepted',
    questionId: 'q-private-exchange-frozen',
    author: '处理过冻结的人',
    identity: '毕业生',
    content: `先停止继续转账，不要再找对方“再换一笔解冻”，也不要把账户里的钱转给第三个人。账户冻结通常意味着银行或执法机关认为这笔资金存在异常，需要按正规流程说明来源。

1. 立刻联系开户银行：问清楚是银行风控冻结、司法冻结，还是配合反诈/反洗钱调查。记录客服或柜台给你的冻结原因、冻结机关、联系电话和需要提交的材料。
2. 保留全部证据：聊天记录、对方账号、转账回单、收付款时间、金额、汇率承诺、对方联系方式、群聊信息、平台页面截图都保存。不要删除聊天，不要只截一两张图。
3. 如涉及涉诈资金或黑钱，尽快报警或按银行指引联系冻结机关：说明自己是通过私下换汇收到款，提供完整交易链路。不要编造“借款、还款、买卖商品”等理由，前后口径不一致会更麻烦。
4. 不要私下退款给对方：如果这笔钱本身是涉诈资金，你再退给对方可能让资金链更复杂。是否退还、退到哪里、如何处理，要听银行、警方或律师意见。
5. 必要时找律师：如果冻结金额大、影响学费房租、银行要求补充说明或涉及跨境资金，建议尽快咨询熟悉金融、反诈或出入境问题的律师。

以后避坑：只走银行、ATM、持牌汇款机构等可实名留痕渠道。不要相信“高汇率、秒到账、留学生互助、无手续费”的个人换钱广告。

平台规则：本平台严禁发布换钱、换米相关求助、帮助和广告。用户私下换汇、接单、撮合或广告引流均属于个人行为，本平台不承担法律责任，并会对相关内容做删除、禁言或封号处理。`,
    likes: 61,
    accepted: true,
    createdAt: '2026-05-05',
  },
  {
    id: 'a-work-hours-accepted',
    questionId: 'q-work-hours',
    author: '高丽大学兼职申请过',
    identity: '本科',
    content: `先给结论：D-2/D-4 不是“自动可以打工”。正式上班前，通常要先拿学校确认，再向出入境申请“时间制就业许可”。没有许可就开工，风险不是只扣工资，而是会影响签证、延签和后续滞留记录。

先看小时数这张表，别只听群里一句“D-2 可以 40 小时”：
1. D-2 本科/交换/访问学生：很多学校口径是学期中平日每周 20-30 小时；认证大学、语言能力达标等条件下，部分学校可给到更高上限。周末、公休日和寒暑假通常不计入平日上限，但仍然必须在许可范围内工作。
2. D-2 硕士/博士：常见是学期中平日每周 30-35 小时，有些学校或旧版资料会写研究生最多 40 小时。寒暑假、周末和公休日通常不限时，但以学校国际处表格和出入境许可书为准。
3. D-4 语学院：通常要入境/入学满 6 个月后才能申请，学期中多见每周 20 小时以内；语言能力、出勤不达标时可能被降到 10 小时或不能申请。
4. 수료生/论文准备生/超学期学生：不要默认还能按在读生标准打工。很多学校会把这类学生单独处理，可能限制更严，甚至不给兼职确认。
5. 假期“不限”不是无证随便干：假期不限通常指“已经获得许可的兼职，在学校正式假期/周末/公休日不按平日小时上限计算”，不是不用申请，也不是任何行业都能做。

申请流程：
找雇主 → 签标准劳动合同 → 填“外国人留学生时间制就业确认书” → 雇主确认 → 学校国际处确认 → HiKorea 电子民愿或预约出入境提交 → 许可后再开工。

常见材料：
护照、外国人登录证、申请书、在学证明、成绩/出勤材料、时间制就业确认书、标准劳动合同、雇主营业执照、雇主身份证明、TOPIK/KIIP/英语课程证明等。制造业、研究活动、校外专业实习可能会追加材料。

最容易出事的细节：
1. 许可通常绑定雇主、地点、工作内容和期间。换店、换分店、换老板、加一个新兼职，都可能要重新申请或变更。
2. 工资要走可证明的记录，最好银行转账；排班表、聊天记录、打卡截图、合同和工资明细都要留。
3. 最低时薪、夜间/周末加班、休息时间、退职金等属于劳动法问题，不会因为你是留学生就自动放弃。
4. 如果老板说“别人都没申请”“先干几天试试”，不要信。真正出事时，承担签证风险的是你。

不能碰的高风险工作：
未获许可直接工作、合同外地点工作、超出许可时间、配送/代驾、上门销售、个人家教/未成年人外语教育、娱乐行业、建设业、部分制造业、派遣/外包型用工、和学生身份明显不符的工作。具体禁限行业每年会调整，以出入境和学校最新公告为准。

实操建议：申请前直接问学校国际处三个问题：你这个签证/年级/语言成绩本学期能批多少小时？周末和寒暑假怎么计算？换工作地点要不要重新申报？把这三个答案留邮件或截图，比听中介和群聊靠谱。`,
    likes: 44,
    accepted: true,
    createdAt: '2026-04-29',
  },
  {
    id: 'a-language-to-undergrad-accepted',
    questionId: 'q-language-to-undergrad',
    author: '语学院转本科成功',
    identity: '本科',
    content: `语学院转本科不是“读完语学院自动升本科”，本质上还是一次外国人本科入学申请。

1. 先确认目标学校的外国人招生简章：申请资格、父母国籍条件、学历认证、语言要求、材料提交方式、面试/作品集/专业限制。不同学校差异很大。
2. 语言材料：TOPIK、学校语学院等级结业证明、英语成绩、校内韩语考试，学校认可哪个就准备哪个。只读到语学院 4 级不一定等于满足本科入学。
3. 学历材料：高中毕业证、成绩单、亲属关系/国籍材料、护照、外国人登录证、财政证明等。中国学历常见还会涉及学信网/领事认证/翻译公证，按简章来。
4. 时间线：提前 6 个月看简章，提前 3-4 个月准备学历认证和翻译公证，网申前确认名字拼写和生日一致。材料错一个字，后面签证和学籍都可能麻烦。
5. 如果申请同校本科，问语学院办公室有没有推荐流程、语言成绩减免、校内面试说明，但不要默认有内部名额。

避坑：不要只听中介说“语学院读完就能进本科”。真正决定录取的是招生简章、材料完整度、语言成绩、面试和专业竞争。`,
    likes: 26,
    accepted: true,
    createdAt: '2026-04-28',
  },
  {
    id: 'a-thesis-delay-accepted',
    questionId: 'q-thesis-delay',
    author: '汉阳大学院毕业生',
    identity: '毕业生',
    content: `论文延期要分清楚三件事：学籍、论文审查、签证。很多人只问导师，结果漏掉行政节点。

1. 先问导师：是本学期不提交论文，还是已经提交但审查延期？是需要继续实验/写作，还是只等答辩？这会影响学费和材料。
2. 问院系办公室：是否要申请 수료/研究注册/论文指导注册，是否要交研究注册费或部分学费，论文审查申请和答辩申请下一轮什么时候开始。
3. 问国际处/出入境：D-2 是否还能延长、需要在学证明还是 수료证明、是否需要导师签字的论文计划/研究计划。部分学校材料里会把 thesis schedule/导师确认列为超期延签补充材料。
4. 如果已经超过标准修业年限，要准备一份合理说明：论文题目、目前进度、剩余实验/调查/写作计划、预计提交时间、导师确认。不要写“还没写完”这种空话。
5. 学费和保险别断。延期期间如果学籍状态变化，医保、宿舍、奖学金、TA/RA、打工资格都可能受影响。

实操顺序：导师确认 → 院系办公室确认学籍和论文节点 → 国际处确认签证材料 → HiKorea 预约/线上申请。任何政策结论都以学校和出入境最新答复为准。`,
    likes: 37,
    accepted: true,
    createdAt: '2026-04-27',
  },
  {
    id: 'a-phone-plan-accepted',
    questionId: 'q-phone-plan',
    author: '弘大生活圈老留学生',
    identity: '毕业生',
    content: `手机卡按你的停留时间和“需不需要本人认证”来选。

1. 刚落地：可以先用机场/便利店预付卡或 eSIM 解决导航、联系房东、收验证码的问题。缺点是很多预付卡不能完整做韩国本人认证。
2. 长期留学：拿到外国人登录证后，建议办本人名义手机号。韩国很多服务要 휴대폰 본인인증，银行、外卖、网购、医院预约、海关通关号都会用到。
3. 运营商选择：SKT/KT/LG U+ 稳定但贵；알뜰폰/MVNO 便宜，适合流量需求明确的人。先确认是否支持外国人 ARC、是否能做本人认证、能否线上改套餐。
4. 合约机谨慎。没有稳定收入和长期签证前，不建议签高额 24 个月合约。回国、换签证、换号码都会麻烦。
5. 银行和手机信息要一致：英文名、生日、外国人登录号码、手机号登记人都要对应，否则手机认证会失败。

建议：短期先预付卡过渡，拿 ARC 后办本人名义号码；如果主要需求是认证和流量，优先看无合约 알뜰폰。`,
    likes: 19,
    accepted: true,
    createdAt: '2026-04-26',
  },
  {
    id: 'a-hospital-insurance-accepted',
    questionId: 'q-hospital-insurance',
    author: '大田大学院在读',
    identity: '大学院',
    content: `韩国看病流程其实很固定：先确认医保状态，再选诊所/医院，最后凭处方去药店。

1. 留学生通常在外国人登录后自动纳入国民健康保险体系，保险通知会寄到登记住址。是否已经生效、保费是否欠缴，可以查 NHIS/국민건강보험 或打客服确认。
2. 小病先去 동네의원/内科/耳鼻喉科/皮肤科，带外国人登录证。大医院通常需要转诊或预约，急诊另算。
3. 到前台说症状，出示身份证件。看完医生后在医院缴费，医保适用部分会直接反映在账单上，不是你先全额付再报销。
4. 医生开 처방전/处方后，拿处方去附近 약국/药店买药。医院费和药费分开结算。
5. 学校或私人保险可能覆盖 NHIS 不报的部分，比如牙科、意外、住院差额等，记得保留诊断书、收据、药费明细。

避坑：地址没更新会收不到保险通知；欠缴医保可能影响使用；整形、部分牙科、体检、非必要项目不一定报。急症直接去急诊，普通小病不要一上来冲大学医院，费用和等待都更高。`,
    likes: 24,
    accepted: true,
    createdAt: '2026-04-25',
  },
  {
    id: 'a-d10-jobseeker-accepted',
    questionId: 'q-d10-jobseeker',
    author: 'D-2转D-10办过',
    identity: '毕业生',
    content: `D-10 是给毕业后在韩国合法求职的人用的，不是毕业后自动延长。

1. 先确认时间：毕业、结业、D-2 到期日三者哪个先到。不要等学校学籍状态已经变更、预约又排不到时才开始。
2. 常见对象：韩国大学取得专科/本科/硕博学位后求职的人，或符合求职签证条件的人。中央大学等国际处资料也把 D-2 持有者转 D-10 作为毕业求职路径之一。
3. 常见材料：护照、外国人登录证、申请书、手续费、毕业/预毕业证明、成绩单、求职活动计划书、住所证明、照片、资金证明或豁免证明、TOPIK/KIIP/经历等加分或资格材料。具体以出入境最新清单为准。
4. 求职计划书不要空泛。写清目标岗位、目标行业、时间表、准备材料、投递渠道、面试计划、从 D-10 转 E-7 或其他工作签证的路径。
5. 如果已经有公司意向，不一定只看 D-10，也要同步确认 E-7 等工作签证可能性。D-10 期间能做什么实习/活动，也要按许可范围来。

避坑：毕业后身份变化很快，学校证明开具时间和出入境预约经常撞车。至少提前 1-2 个月问学校国际处和 1345，材料宁可多准备，不要把 Reddit/群聊当最终规则。`,
    likes: 33,
    accepted: true,
    createdAt: '2026-04-24',
  },
]

const questionResourceLinks: Record<string, ResourceLink[]> = {
  'q-d2-extension': [
    { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
    { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
    { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
    { label: 'D-2/D-4 延签材料清单', url: materialLinks.hikoreaExtensionChecklist, kind: 'download', download: true },
  ],
  'q-arc-lost': [
    { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
    { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
    { label: '外国人登录证/地址变更材料清单', url: materialLinks.arcAddressChecklist, kind: 'download', download: true },
  ],
  'q-bank-account': [
    { label: 'Study in Korea 滞留/生活信息', url: officialLinks.studyInKoreaResidenceStay, kind: 'official' },
    { label: '外国人登录证/地址变更材料清单', url: materialLinks.arcAddressChecklist, kind: 'download', download: true },
  ],
  'q-work-hours': [
    { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
    { label: 'HiKorea 电子民愿入口', url: officialLinks.hiKoreaElectronicApplication, kind: 'official' },
    { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
    { label: '时间制就业许可材料清单', url: materialLinks.partTimeWorkChecklist, kind: 'download', download: true },
  ],
  'q-language-to-undergrad': [
    { label: 'Study in Korea 官方留学入口', url: officialLinks.studyInKoreaMain, kind: 'official' },
    { label: '韩国签证门户 Korea Visa Portal', url: officialLinks.koreaVisaPortal, kind: 'official' },
    { label: '语学院/本科/大学院申请材料清单', url: materialLinks.studyApplicationChecklist, kind: 'download', download: true },
  ],
  'q-thesis-delay': [
    { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
    { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
    { label: 'D-2/D-4 延签材料清单', url: materialLinks.hikoreaExtensionChecklist, kind: 'download', download: true },
  ],
  'q-hospital-insurance': [
    { label: '韩国国民健康保险公团英文入口', url: officialLinks.nhisEnglish, kind: 'official' },
    { label: 'Study in Korea 滞留/生活信息', url: officialLinks.studyInKoreaResidenceStay, kind: 'official' },
  ],
  'q-d10-jobseeker': [
    { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
    { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
    { label: 'Korea Visa Portal 签证类型查询', url: officialLinks.koreaVisaPortal, kind: 'official' },
    { label: 'D-10 求职计划书与材料清单', url: materialLinks.d10JobSeekingChecklist, kind: 'download', download: true },
  ],
}

const seedPosts: Post[] = [
  {
    id: 'korea-rent-deposit-guide',
    slug: 'korea-rent-deposit-guide',
    title: '韩国租房保证金和合同避坑指南',
    summary: '从找房、核对房东、看合同到退租返还保证金，整理留学生第一次租 one-room 前应该确认的事项。',
    school: '韩国生活',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    author: '新村搬家三次的学姐',
    identity: '毕业生',
    price: 0,
    hot: '7.1k',
    views: 7120,
    likes: 468,
    bookmarks: 980,
    tags: ['韩国', '租房', '保证金', 'one-room', '合同', '退租', '精华'],
    contentType: '完整经验',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06',
    excerpt: '第一次在韩国租房，先把保证金、合同主体、管理费、退租和地址申报看清楚，再决定要不要交定金。',
    body: `适用人群
适合第一次在韩国租 one-room、考试院转租、宿舍落选后找房，或准备从学校周边搬到新区域的同学。重点不是告诉你某个房子一定安全，而是给你一套签约前能逐项核对的思路。

准备材料/注意事项
看房前准备护照或外国人登录证信息、学校证明或在学信息、可联系的韩国手机号、预算上限、通勤路线和入住日期。签约前要确认合同出租人、收款账户名、房屋登记信息和中介身份是否一致。保证金越高，越不能只相信群友截图或中介一句“没问题”。

步骤
第一步，按学校、地铁、夜路和坡度筛区域。不要只看距离，黑石洞、新村、建大、安岩这类学生区都要实际走一遍。第二步，现场看水压、排水、霉味、窗户、门锁、楼道、垃圾点和采光。第三步，要求看合同草稿，确认保证金、月租、管理费项目、入住日、退租提前通知、维修责任、家具清单和押金返还日期。第四步，付款尽量走本人账户并保存记录。第五步，入住后保存合同、付款凭证和房间现状照片，按要求办理地址相关手续。

常见坑
最常见的是“照片很好看，现场潮湿阴暗”；“管理费便宜，但水电气网另算”；“转租人催你先打定金，但房东没有同意转租”；“合同写的是别人名字，收款账户又是第三个人”。这些都不要急着签。口头承诺如果没写进合同，后面很难证明。

实操建议
看房当天可以把同一条路线安排三到四间房，按“到学校时间、夜路安全、房间状态、押金风险、生活便利”打分，不要看完第一间就被催着定。和中介或房东沟通时，尽量用文字确认重点：管理费包含项目、退租通知期限、押金返还日期、坏掉的家电谁修、是否允许地址申报。转租房尤其要确认原租客有没有权利转租，最好让房东、原租客和你三方把押金流向写清。入住后第一天把墙面、地板、冰箱、洗衣机、空调、门锁和卫生间全部拍照，发给对方留痕，退租时能少很多争议。
如果语言不够熟，提前把合同条款翻译成中文表格，逐条问清再签，不要因为对方态度好就跳过核对。

检查清单
合同主体一致、房东/中介信息可核对、管理费项目写清、退租通知期限写清、押金返还方式写清、房间瑕疵已拍照、钥匙数量确认、水电气网结算方式确认、地址申报材料可提供。

免责声明
本文只提供租房经验和风险检查思路，不构成法律意见。韩国各区房屋登记、租赁保护和地址申报细节可能变化，具体以当地政府、学校国际处、正规中介和官方窗口最新说明为准。`,
  },
  {
    id: 'd2-visa-extension-guide',
    slug: 'd2-visa-extension-guide',
    title: 'D-2 签证延长准备指南',
    summary: '把 D-2 延签拆成资格确认、学校材料、住宿证明、预约提交和补件跟进，帮助在读学生少漏材料。',
    school: '中央大学',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    author: '大学院延签过来人',
    identity: '大学院',
    price: 0,
    hot: '6.8k',
    views: 6840,
    likes: 422,
    bookmarks: 910,
    tags: ['韩国', 'D-2', '签证延长', 'HiKorea', '在学证明', '以公告为准'],
    contentType: '办理流程',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06',
    excerpt: 'D-2 延签不要只背材料名，先确认自己的在学状态、成绩/出勤、住所和学校国际处要求。',
    body: `适用人群
适合 D-2 本科、硕士、博士在读生准备延长滞留期限，也适合刚从语学院、本科或研究注册状态转入下一阶段的人做预检查。不同学校、学位阶段和个人状态会影响材料，所以不要把同学上一学期的清单直接照搬。

准备材料/注意事项
常见会用到护照、外国人登录证、申请书、在学证明、成绩或出勤相关材料、学费缴纳或奖学金相关证明、住宿证明、资金能力相关证明，以及学校或出入境要求的补充材料。材料名称、格式和有效期会调整，建议先看学校国际处公告，再到 HiKorea 确认电子民愿或访问预约要求。

步骤
第一步，确认自己的滞留期限、学籍状态和学校是否允许继续在读。第二步，向学校开具在学、成绩、学费等材料，并核对英文/韩文姓名是否和外国人登录证一致。第三步，整理住所证明，宿舍、租房、借住的材料形式不同。第四步，按 HiKorea 指引选择电子申请或访问预约。第五步，提交后保存回执，及时查看补件通知。第六步，拿到结果后核对外国人登录证背面的期限或电子结果。

常见坑
最常见的是临近到期才预约，学校材料开不出来；地址和外国人登录证登记地址不一致；成绩、出勤或学籍状态没有提前问；研究注册、休学、超学期学生按普通在读生准备导致补件。还有人把银行材料、奖学金证明或住宿证明的姓名拼写弄错，现场才发现。

实操建议
建议把延签当成一个月度项目，而不是到期前几天的临时任务。先做一张表：材料名称、开具地点、是否收费、能否线上开、有效期、韩文/英文姓名是否一致、是否需要原件。学校材料通常要经过院系办公室、国际处或自动证明机，不同学校速度不一样。住宿证明要和你现在实际住址一致，如果刚搬家，要先确认地址变更和延签材料能否衔接。提交前把所有 PDF 或照片按窗口要求命名，手机和邮箱保持可联系，补件通知不要漏看。
如果你处在休学、研究注册、超学期、换学校或换滞留资格的边界状态，更要先让学校国际处帮你确认口径。

检查清单
滞留期限已确认、学校材料已开、住宿证明能对应当前地址、姓名拼写一致、预约日期留有余量、补件联系方式可用、提交回执已保存、学校国际处和 HiKorea 最新公告已核对。

免责声明
提示：签证、打工、滞留资格和外国人登录证相关要求会调整，本文只提供准备思路，最终以 HiKorea、出入境事务所、1345 咨询和学校国际处最新公告为准，不写死费用、期限或政策结论。`,
    sources: [
      { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
      { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
      { label: 'D-2/D-4 延签材料预检清单', url: materialLinks.hikoreaExtensionChecklist, kind: 'download', download: true },
    ],
  },
  {
    id: 'alien-registration-card-guide',
    slug: 'alien-registration-card-guide',
    title: '外国人登录证办理与地址信息检查',
    summary: '整理入境后办理外国人登录证、住所证明、领取后核对和后续地址变更的常见注意事项。',
    school: '建国大学',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    author: '建大本科生',
    identity: '本科',
    price: 0,
    hot: '6.5k',
    views: 6510,
    likes: 396,
    bookmarks: 865,
    tags: ['韩国', '外国人登录证', 'ARC', '地址变更', 'HiKorea', '以公告为准'],
    contentType: '办理流程',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06',
    excerpt: '外国人登录证关系到银行、手机号、医保和后续签证，办理前先把住所证明和学校材料准备好。',
    body: `适用人群
适合持长期留学签证入境韩国、准备办理外国人登录证，或已经换住所需要检查地址信息的同学。刚到韩国时事情很多，但登录证会影响后续银行、手机、医保、网购认证和签证业务，建议把它当成第一批核心事项。

准备材料/注意事项
常见会用到护照、申请书、证件照、学校入学或在学相关材料、住所证明、手续费相关材料，以及出入境或学校要求的补充文件。住所证明尤其容易卡：宿舍、本人租房、借住、转租需要的材料可能不同，地址要和实际居住地一致。

步骤
第一步，参加学校团体办理说明会，或自行查看 HiKorea 预约入口。第二步，按学校国际处清单准备申请表、照片和学校材料。第三步，确认住所证明，避免用过期合同或无法证明本人居住的材料。第四步，到出入境提交材料并保存回执。第五步，领取后核对姓名、生日、国籍、滞留资格、期限和地址。第六步，拿到证后再去补全银行、手机号和医保地址信息。

常见坑
有人把临时住处写成长期地址，之后搬家忘记变更；有人照片规格、姓名拼写或宿舍证明不符合窗口要求；还有人把登录证正反面随便发给陌生中介或群友，增加身份信息风险。登录证丢失时也不要拖，先保护可能被关联的银行和账号，再按官方要求补办。

实操建议
刚入境时可以把“学校说明会、HiKorea 账号、预约时间、证件照、住所证明”放到同一个清单里。住所证明最容易因为住宿形式不同而变化：宿舍看学校证明，自己租房看租赁合同，借住可能要房主确认材料。领取登录证后不要只拍照留底，还要立刻检查银行、手机号、学校系统和医保通知地址是否需要更新。搬家后也不要只告诉房东或学校，涉及滞留资格的信息要按官方要求处理，避免后续延签、保险或银行认证出现地址不一致。
如果学校提供团体办理，尽量跟着学校走；自行预约时要预留补件时间，不要把航班、搬家和预约都压在同一天。
重要证件办理完后，把扫描件存到只有自己能访问的位置，别放在公开网盘或聊天群文件里。

检查清单
预约方式已确认、学校材料有效、住所证明对应当前住处、证件照符合要求、护照和申请书信息一致、回执已保存、领取后信息逐项核对、后续地址变化能及时处理。

免责声明
提示：签证、打工、滞留资格和外国人登录证相关要求会调整，本文只提供准备思路，最终以 HiKorea、出入境事务所、1345 咨询和学校国际处最新公告为准。不要把本文当成窗口最终材料清单。`,
    sources: [
      { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
      { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
      { label: '外国人登录证/地址变更材料清单', url: materialLinks.arcAddressChecklist, kind: 'download', download: true },
    ],
  },
  {
    id: 'korea-bank-account-guide',
    slug: 'korea-bank-account-guide',
    title: '韩国银行卡开户与本人认证攻略',
    summary: '开户前先准备外国人登录证、手机号、学校信息和账户用途说明，避免后续手机银行和支付认证出问题。',
    school: '韩国生活',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    author: '首尔生活记录员',
    identity: '在读生',
    price: 0,
    hot: '5.9k',
    views: 5920,
    likes: 310,
    bookmarks: 730,
    tags: ['韩国', '银行卡', '开户', '手机认证', '生活', '精华'],
    contentType: '生活攻略',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06',
    excerpt: '韩国开户不是只拿护照就能办，重点看外国人登录证、手机号、住址、账户用途和姓名录入。',
    body: `适用人群
适合刚拿到外国人登录证、准备办韩国银行卡和手机银行的同学，也适合之前只用现金或家人转账、现在需要网购、外卖、学费和房租转账的人。

准备材料/注意事项
常见会用到外国人登录证、护照、韩国手机号、学生证或在学证明、住址信息、账户用途说明。不同银行、不同支行对留学生材料理解不完全一样，学校合作银行或学校附近外国人业务多的支行通常更熟悉流程。

步骤
第一步，确认外国人登录证姓名、生日和手机号本人认证是否一致。第二步，选择学校合作支行或常办外国人业务的银行。第三步，说明账户用途，比如收生活费、交房租、缴学费、日常消费。第四步，开户时问清每日转账限额、手机银行、OTP 或安全卡、银行卡是否支持交通功能、海外转账和海外刷卡是否开通。第五步，回家后马上测试手机银行登录和小额转账，发现姓名或认证问题尽快回银行修正。

常见坑
最麻烦的是姓名拼写不一致：银行、手机号、外国人登录证只差一个空格或顺序，后面 KakaoPay、Toss、网购、医院预约都可能认证失败。还有人拿到卡后没问限额，交房租时才发现转不出去；或用朋友手机号开户，之后找回账号非常麻烦。

实操建议
开户当天不要只问“能不能开卡”，要把后续会用到的场景一起问清：房租转账、学费缴纳、海外汇款、手机银行、交通卡、小额支付和网上购物。如果韩语不够，可以提前写好韩文关键词或请学校国际处确认合作银行。拿到卡后当天就测试手机银行登录、余额查询和小额转账，确认验证码能到自己的手机号。不要把银行卡、手机认证和支付账号借给别人使用，也不要为了方便参与私下换汇，账户被冻结后解释成本会非常高。
如果柜台只给受限账户，可以问清解除限制需要什么材料和多久后能再申请，不要反复盲目换网点。
账户开好后也要定期查看通知和限额变化，尤其是长期不用、频繁收款或大额转账前先确认风险。

检查清单
外国人登录证已领取、手机号为本人名义、姓名录入与证件一致、手机银行可登录、转账限额已确认、银行卡功能已确认、账户用途说明能讲清、银行回执和卡片资料已保存。

免责声明
本文是生活经验，不构成金融建议。银行开户标准、反洗钱审查和账户限制可能随银行政策调整，最终以银行窗口、官方客服和学校合作银行最新要求为准。平台严禁发布换钱换米、私下换汇广告或求助；私下换汇存在违法和账户冻结风险。`,
    sources: [
      { label: 'Study in Korea 滞留/生活信息', url: officialLinks.studyInKoreaResidenceStay, kind: 'official' },
      { label: '外国人登录证/地址变更材料清单', url: materialLinks.arcAddressChecklist, kind: 'download', download: true },
    ],
  },
  {
    id: 'korea-part-time-work-guide',
    slug: 'korea-part-time-work-guide',
    title: '韩国留学生打工许可与工资留证指南',
    summary: '打工前先确认签证资格、学校同意、雇主信息和时间制就业许可，工资纠纷时保留可证明劳动关系的证据。',
    school: '高丽大学',
    category: '打工/劳动纠纷',
    country: '韩国',
    city: '首尔',
    author: '安岩兼职过来人',
    identity: '本科',
    price: 0,
    hot: '6.1k',
    views: 6140,
    likes: 355,
    bookmarks: 810,
    tags: ['韩国', '打工', '兼职许可', '工资拖欠', 'HiKorea', '以公告为准'],
    contentType: '避坑攻略',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06',
    excerpt: '留学生打工不要先上班再补手续，先确认许可范围、雇主地点、合同和工资记录。',
    body: `适用人群
适合 D-2、D-4 在读期间准备兼职，或已经遇到排班、工资、合同纠纷的同学。打工的核心不是“别人都在做”，而是你的滞留资格、学校状态和雇主岗位是否能被允许。

准备材料/注意事项
常见会用到护照、外国人登录证、申请书、在学或出勤/成绩相关材料、时间制就业确认书、标准劳动合同、雇主营业执照或相关证明、学校国际处确认材料。不同签证、学历阶段、语言能力、出勤和学校认证状态会影响要求，务必先问学校国际处和官方窗口。

步骤
第一步，确认自己是否有资格申请时间制就业。第二步，和雇主确认工资、地点、岗位、每周时间和结算日。第三步，签书面劳动合同，不要只用口头约定。第四步，让学校国际处确认材料。第五步，通过 HiKorea 或出入境要求的方式申请许可。第六步，许可结果明确后再按许可范围工作。第七步，每次上班保存排班、打卡、聊天和工资记录。

常见坑
最危险的是未许可先上班、许可地点和实际地点不一致、超出允许范围工作、换店不重新确认、工资现金结算没有记录。工资拖欠时，不要只靠一句“老板说会给”，要整理劳动合同、排班表、聊天记录、转账记录、店铺信息和同事证言。

实操建议
找兼职时先把岗位名称、实际地点、营业执照主体和老板联系方式记下来，再判断能不能申请许可。合同里要写清时薪、结算日、工作内容、休息时间和加班规则；排班最好每周截图保存。工资如果现金给，也要要求对方写明日期和金额，或者至少保留聊天确认。出现拖欠时先冷静收证据，不要删聊天，不要只在群里吐槽。可以先找学校国际处、1345 或劳动咨询渠道问下一步怎么走，再决定是否正式投诉。
如果店长说“大家都这么做”，也要回到自己的签证、学校状态和许可范围确认，别把别人的经验当成自己的合法依据。
真正开始工作后，每周固定整理一次排班和工资记录，拖到纠纷发生后再补证据通常会漏很多细节。

检查清单
资格已确认、学校同意已取得、雇主信息真实、合同写清工资和时间、许可范围与实际工作一致、排班和工资记录保存、换店/加班前重新确认、出现纠纷时先保护证据。

免责声明
提示：签证、打工、滞留资格和外国人登录证相关要求会调整，本文只提供准备思路，最终以 HiKorea、出入境事务所、1345 咨询、雇佣劳动部和学校国际处最新公告为准。不要把本文当成固定工时或法律结论。`,
    sources: [
      { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
      { label: 'HiKorea 电子民愿入口', url: officialLinks.hiKoreaElectronicApplication, kind: 'official' },
      { label: '时间制就业许可材料清单', url: materialLinks.partTimeWorkChecklist, kind: 'download', download: true },
    ],
  },
  {
    id: 'd10-job-seeking-visa-guide',
    slug: 'd10-job-seeking-visa-guide',
    title: '毕业后 D-10 求职准备清单',
    summary: '从毕业状态、求职计划、学校材料和预约节点整理 D-10 准备思路。',
    school: '西江大学',
    category: '求职/实习/简历',
    country: '韩国',
    city: '首尔',
    author: '毕业求职中',
    identity: '毕业生',
    price: 0,
    hot: '3.8k',
    views: 3820,
    likes: 188,
    bookmarks: 430,
    tags: ['韩国', 'D-10', '求职', '毕业', '以公告为准'],
    contentType: '流程攻略',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-05',
    updatedAt: '2026-05-05',
    excerpt: 'D-10 准备重点是毕业状态、求职计划、材料一致性和时间衔接，别等 D-2 快到期才开始问。',
    body: `D-10 适合毕业后在韩国继续求职、实习或准备就业转换的人做规划参考。先确认自己当前 D-2 到期日、毕业/预毕业状态、学校能开哪些材料、求职计划是否能说明清楚。常见准备包括护照、外国人登录证、申请书、毕业或预毕业相关证明、求职计划、履历、学历或成绩材料、住所证明和官方要求的补充材料。步骤上建议先问学校国际处，再看 HiKorea 和 Korea Visa Portal 的说明，最后预约或电子申请。常见坑是时间衔接太紧、求职计划写得空泛、地址证明过期、毕业状态和材料日期对不上。检查清单：滞留期限、毕业材料、求职计划、住所证明、联系方式、预约时间、补件渠道都要确认。提示：签证、滞留资格和求职相关要求会调整，最终以 HiKorea、Korea Visa Portal、出入境事务所、1345 和学校最新公告为准。`,
    sources: [
      { label: 'Korea Visa Portal', url: officialLinks.koreaVisaPortal, kind: 'official' },
      { label: 'D-10 求职计划材料清单', url: materialLinks.d10JobSeekingChecklist, kind: 'download', download: true },
    ],
  },
  {
    id: 'korea-moving-trash-guide',
    slug: 'korea-moving-trash-guide',
    title: '韩国搬家、垃圾分类和大型废弃物流程',
    summary: '搬家前后把退租、家具处理、地址变更、普通垃圾、厨余和大型废弃物分开处理。',
    school: '韩国生活',
    category: '周边生活攻略',
    country: '韩国',
    city: '首尔',
    author: '搬家三次的学姐',
    identity: '毕业生',
    price: 0,
    hot: '2.9k',
    views: 2920,
    likes: 126,
    bookmarks: 290,
    tags: ['韩国', '搬家', '垃圾分类', '大型废弃物', '地址变更'],
    contentType: '生活攻略',
    featured: false,
    isFeatured: false,
    createdAt: '2026-05-05',
    updatedAt: '2026-05-05',
    excerpt: '搬家不是只叫车，退租结算、家具处理、垃圾分类和地址变更最好按时间线一起排。',
    body: `搬家前两周先确认退租通知、押金返还、清洁要求、水电气网结算和家具处理。大件家具不要拖到最后一天，先问房东能不能留，不能留就走二手平台或按区厅规则申请大型废弃物贴纸。普通垃圾、回收、厨余和衣物回收分开处理，不同区规则会有差异，楼下公告和区厅页面比网上经验更可靠。搬家当天拍空房照片，保存钥匙交接和结算记录。搬入新住处后，确认合同、门锁、网络、水电气和垃圾投放点，并按要求更新外国人登录证地址、银行和学校系统地址。检查清单：退租通知、押金、结算、家具、电器、垃圾袋、搬家公司、钥匙、地址变更。`,
  },
  {
    id: 'korea-new-student-checklist',
    slug: 'korea-new-student-checklist',
    title: '韩国留学生新生 checklist：到校第一周',
    summary: '把新生最容易漏的手机卡、银行卡、交通卡、学校系统、保险、常用网站和奖学金公告放到一张清单里。',
    school: '韩国生活',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    author: '新生带路学长',
    identity: '大学院',
    price: 0,
    hot: '4.4k',
    views: 4410,
    likes: 230,
    bookmarks: 620,
    tags: ['韩国', '新生', 'checklist', '交通卡', '奖学金', '常用网站'],
    contentType: '新生攻略',
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-05',
    updatedAt: '2026-05-05',
    excerpt: '刚到韩国先按顺序处理住处、手机号、学校系统、银行卡、交通卡、保险和常用网站账号。',
    body: `到校第一周不要被群消息带乱。先确认住处和学校报到，再处理手机号、外国人登录证预约、银行卡、交通卡和学校门户。手机卡先解决导航和验证码，拿到外国人登录证后再补本人认证。银行卡优先问学校合作支行。交通卡可以先用便利店卡或支持交通功能的银行卡。常用网站建议关注学校国际处、HiKorea、Study in Korea、Korea Visa Portal、国民健康保险、学校图书馆和选课系统。奖学金不要只看入学前公告，入学后院系、国际处、教授项目和成绩奖学金都可能有不同窗口。检查清单：报到、学生证、学校邮箱、门户登录、选课日期、保险通知、住址、手机号、银行卡、交通卡、奖学金日历。具体行政要求以学校最新公告为准。`,
    sources: [
      { label: 'Study in Korea 官方留学入口', url: officialLinks.studyInKoreaMain, kind: 'official' },
      { label: '韩国签证门户 Korea Visa Portal', url: officialLinks.koreaVisaPortal, kind: 'official' },
      { label: '入学材料预检清单', url: materialLinks.studyApplicationChecklist, kind: 'download', download: true },
    ],
  },
  {
    id: 'post-rent-guide',
    title: '韩国留学生租房避坑指南',
    school: '首尔生活',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    author: '新村住了6年',
    identity: '毕业生',
    price: 0,
    hot: '6.2k',
    views: 6240,
    likes: 386,
    bookmarks: 820,
    tags: ['韩国', '首尔', '租房', '保证金', '亲身经历', '精华'],
    contentType: '经验帖',
    featured: true,
    createdAt: '2026-05-03',
    excerpt: '从保证金、管理费、合同主体、看房路线和退租时间线拆解第一套房怎么避坑。',
    body: `第一次在韩国租房，最容易踩坑的不是房子丑，而是保证金、合同主体和退租规则没看清。

一、看房前先筛掉高风险房源
1. 明显低于周边价格的房源先警惕。新村、建大、弘大、安岩、黑石洞这种学生区，价格差异不会离谱到“又新又大又便宜”。
2. 不要只看小红书/群聊图片。至少要视频看房，最好线下看房。房间要看水压、排水、霉味、窗户密封、采光、楼道、门锁、垃圾点、夜路安全。
3. 先问清管理费包含什么。관리비 只写 10 万但不说水电气网暖是否包含，后面容易变成每月额外支出。

二、签约前一定核对三件事
1. 房东身份：合同出租人、登记簿所有人、收款账户名最好一致。如果是代理人，必须看委托书和身份证明。
2. 登记簿誊本/등기부등본：看抵押、查封、债权、所有人信息。押金越高越要查，전세/半전세尤其不能省。
3. 中介资格：正规 공인중개사 有登记信息。不要把大额定金打给“室长、管理员、朋友、代管人”。

三、合同里要写清楚
保证金、月租、管理费项目、入住日、退租提前通知期限、押金返还日期、维修责任、违约金、家具家电清单。口头承诺没有写进合同，就当不存在。

四、入住后马上做保护动作
1. 地址变更申报：外国人住址变更有期限要求，关系到签证、保险、银行和后续证明。
2. 确定日期/확정일자：拿租赁合同办理固定日期，保留合同原件和付款记录。
3. 入住当天拍照：墙面、地板、家电、门锁、水槽、卫生间、窗户都拍，发给房东或中介留痕。

五、退租前的时间线
提前按合同约定通知退租，最好文字通知。退租前确认水电气网结算、清洁要求、钥匙交接、押金返还日期。押金没有到账前，不要把所有聊天记录和合同资料删掉。

红线：不能申报地址、不能做固定日期、拒绝给合同原件、收款人和合同主体不一致、要求大额现金、催你马上转定金。这些情况宁可放弃。`,
  },
  {
    id: 'post-d2-extension',
    title: 'D-2签证延长完整流程',
    school: '中央大学',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    author: '中央大学博士在读',
    identity: '大学院',
    price: 12,
    hot: '4.8k',
    views: 4820,
    likes: 241,
    bookmarks: 560,
    tags: ['韩国', '中央大学', 'D-2', '签证', '2026更新', '精华'],
    contentType: '流程攻略',
    featured: true,
    createdAt: '2026-05-02',
    excerpt: '按预约、材料准备、学校证明、现场提交和补件风险整理 D-2 延签步骤。',
    body: `D-2 延签不要等到到期前才准备。真正麻烦的地方不是填申请表，而是预约、学校证明、住宿证明、资金证明和补件时间。

一、建议时间线
到期前 6-8 周：查看外国人登录证背面滞留期限，登录 HiKorea 看可预约日期。
到期前 4-6 周：向学校开在学证明、成绩单、学费缴纳证明或注册确认。
到期前 2-4 周：整理住宿证明、银行材料、补充说明，确认是否能线上申请。
到期前 1-2 周：去出入境或提交线上申请，避免补件时来不及。

二、常见基础材料
1. 护照
2. 外国人登录证
3. 申请书
4. 手续费
5. 在学证明
6. 成绩单
7. 学费缴纳证明或注册确认
8. 住宿证明
9. 证件照或系统要求的照片文件

三、住宿证明怎么准备
本人租房：租赁合同。
宿舍：宿舍入住证明。
住朋友/亲属家：居住确认书、对方身份证明、房屋合同等，具体以出入境要求为准。
重点是地址要和你在出入境登记的地址一致，不一致要先处理地址变更。

四、资金证明和补件风险
银行余额证明是否需要、金额多少、是否必须韩国银行开具，会因学校、出入境办事处和个人情况不同而变化。成绩低、出勤异常、超学期、论文阶段、休复学、频繁换学校的人，更容易被要求补充学业计划、导师确认、资金证明或说明书。

五、当天办理注意事项
1. 原件和复印件都带。
2. 学校证明尽量开近期版本。
3. 银行证明注意开具日期。
4. 现场如果被要求补件，先问清补件截止时间和提交方式。
5. 留好受付证/申请回执。

六、论文阶段或超学期
如果已经进入论文阶段，提前问导师和院系办公室能否开论文进度、研究计划、导师确认。不要只拿一张在学证明就去碰运气。

结论：D-2 延签的核心是证明你仍然正常在学、有明确住所、有能力负担在韩生活。政策会变，最终以 HiKorea、1345 和学校国际处最新公告为准。`,
    sources: [
      { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
      { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
      { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
      {
        label: 'D-2/D-4 延签材料清单',
        url: materialLinks.hikoreaExtensionChecklist,
        kind: 'download',
        download: true,
      },
    ],
  },
  {
    id: 'post-cau-heukseok-rent',
    title: '中央大学黑石洞找房与转租避坑',
    school: '中央大学',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    author: '黑石洞租房过来人',
    identity: '在读生',
    price: 0,
    hot: '3.7k',
    views: 3740,
    likes: 206,
    bookmarks: 488,
    tags: ['韩国', '中央大学', '中央大', '黑石洞', '找房', '租房', '转租', '保证金', '精华'],
    contentType: '租房攻略',
    featured: true,
    createdAt: '2026-05-04',
    excerpt: '按黑石洞、上道、鹭梁津和9号线通勤，把中央大学周边找房、转租和保证金风险拆清楚。',
    body: `中央大学首尔校区找房，先不要只盯“离正门近”。黑石洞坡多、房源差异大，靠近9号线、公交动线和夜路安全都要一起看。

一、先按通勤圈筛
黑石洞步行圈适合早八多、经常去图书馆或学院楼的人，但房龄、坡度和采光要现场看。上道、鹭梁津、铜雀一带通勤更灵活，价格和房型选择可能更多。艺术、传媒方向如果经常带器材或晚归，更要看夜路、公交末班和楼梯。

二、转租要核对三件事
1. 原合同是否允许转租，房东是否书面同意。
2. 保证金到底退给谁，转给谁，收款账户名和合同主体是否一致。
3. 管理费、水电气网、家具损坏、提前退租责任有没有写清楚。

三、看房现场别漏
水压、热水、霉味、窗户密封、采光、垃圾点、门禁、楼道和坡度都要确认。照片里的“离学校很近”可能意味着每天爬坡十几分钟。

四、保证金风险
保证金越高越要查登记簿和出租人身份。不要因为对方是中文中介、同校前辈或群友介绍就省掉合同核对。押金、定金、月租都尽量走本人账户并保留记录。

五、新生建议
刚来韩国可以先短租或宿舍过渡，熟悉黑石洞和上道生活圈后再签长期房。不要在没视频看房、没合同、没房东信息的情况下远程打大额定金。`,
  },
  {
    id: 'post-art-admission-portfolio',
    title: '韩国艺术类入学：作品集和学校选择怎么看',
    school: '韩国大学',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    author: '艺术专业申请过来人',
    identity: '大学院',
    price: 0,
    hot: '3.3k',
    views: 3310,
    likes: 198,
    bookmarks: 450,
    tags: ['韩国', '艺术类', '设计', '传媒', '作品集', '弘益大学', '中央大学', '韩国艺术综合学校', '入学'],
    contentType: '申请攻略',
    featured: true,
    createdAt: '2026-05-04',
    excerpt: '艺术、设计、传媒、戏剧影视方向不要只看综合排名，要同时看作品集、面试、院系位置和课程方向。',
    body: `韩国艺术类入学，第一步不是只问哪所学校排名高，而是确认专业方向和作品集要求。

一、先分清方向
美术、视觉设计、产业设计、影像、电影、戏剧、音乐、舞蹈、传媒和文化内容的招生逻辑不一样。弘益大学、中央大学、韩国艺术综合学校、国民大学、祥明大学、同德女子大学等常被艺术类申请者拿来比较，但每个院系要求不同。

二、作品集要按简章做
页数、文件格式、链接有效期、是否需要原创声明、是否要面试或实技考试，都以当季外国人招生简章为准。不要把国内艺考作品集直接原封不动上传。

三、学校选择看四件事
1. 院系课程是否贴近你的作品方向。
2. 授课语言和韩语要求能不能承受。
3. 校区位置、通勤、材料制作和打样是否方便。
4. 教授研究方向或工作室是否能接住你的作品主题。

四、申请前准备
把目标学校简章、作品集要求、推荐信、语言成绩、学历材料和面试节点做成表格。艺术类最怕临近截止才发现格式、页数或链接权限不符合要求。`,
    sources: [
      { label: 'Study in Korea 官方留学入口', url: officialLinks.studyInKoreaMain, kind: 'official' },
      { label: '韩国签证门户 Korea Visa Portal', url: officialLinks.koreaVisaPortal, kind: 'official' },
      {
        label: '艺术/设计类申请材料清单',
        url: materialLinks.studyApplicationChecklist,
        kind: 'download',
        download: true,
      },
    ],
  },
  {
    id: 'post-arc-process',
    title: '外国人登录证办理流程',
    school: '建国大学',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    author: '建大本科生',
    identity: '本科',
    price: 0,
    hot: '3.9k',
    views: 3920,
    likes: 188,
    bookmarks: 430,
    tags: ['韩国', '首尔', '建国大学', '外国人登录证', '流程'],
    contentType: '办理流程',
    featured: true,
    createdAt: '2026-05-01',
    excerpt: '从入境后预约、照片、申请表、学校材料到领取登录证的基础流程。',
    body: `外国人登录证是你在韩国生活的核心证件。银行、手机号、医保、签证延长、网购认证，基本都会用到它。

一、什么时候办
长期签证入境后通常需要在规定期限内办理外国人登录。学校一般会在新生说明会上提醒团体办理时间。如果错过学校团体办理，就要自己预约出入境。

二、常见材料
1. 护照
2. 申请书
3. 证件照
4. 在学证明或标准入学许可相关材料
5. 住所证明
6. 手续费
7. 学校或出入境额外要求的材料

三、住所证明很重要
租房合同、宿舍证明、居住确认书都可能用到。地址要真实可联系，因为医保通知、银行资料、出入境通知都可能寄到这个地址。

四、办理流程
1. HiKorea 预约，或按学校国际处安排参加团体办理。
2. 到出入境提交材料。
3. 拿申请回执。
4. 等待制卡。
5. 领取后核对姓名、生日、签证类型、滞留期限、地址。

五、拿到证后马上做什么
1. 办韩国手机号本人认证。
2. 开银行账户或补全银行资料。
3. 确认国民健康保险通知地址。
4. 保存正反面照片，但不要随便发给陌生人。

六、丢失怎么办
先挂失银行卡和可能被冒用的账户，再按 HiKorea/出入境要求补办。很多学校提醒 Residence Card 丢失后要尽快处理，不要拖到延签时才发现不能办业务。`,
    sources: [
      { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
      { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
      {
        label: '外国人登录证/地址变更材料清单',
        url: materialLinks.arcAddressChecklist,
        kind: 'download',
        download: true,
      },
    ],
  },
  {
    id: 'post-bank-account',
    title: '韩国银行卡开户攻略',
    school: '建国大学',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    author: '建大本科生',
    identity: '本科',
    price: 0,
    hot: '3.1k',
    views: 3180,
    likes: 142,
    bookmarks: 310,
    tags: ['韩国', '银行卡', '手机认证', '生活', '亲身经历'],
    contentType: '经验帖',
    featured: true,
    createdAt: '2026-04-30',
    excerpt: '开户前先准备外国人登录证、手机号、学校信息和本人能解释清楚的使用目的。',
    body: `韩国银行卡开户不是只拿护照就一定能办。银行会看身份、手机号、住所、账户用途和风险等级。

一、建议优先去哪里
优先去学校合作银行，或者学校附近外国人业务多的支行。大学附近的 Hana、Woori、Shinhan、KB 等网点通常更熟悉留学生材料。

二、常见材料
1. 外国人登录证
2. 护照
3. 韩国手机号
4. 学生证或在学证明
5. 住所信息
6. 金融交易目的证明：比如学生身份、学费/生活费收支说明

三、刚到韩国还没 ARC 怎么办
有些银行可能不给开，有些只给受限账户。可以先问学校是否有新生团体开户。没有 ARC 时，不要期待网银、转账限额、银行卡功能一次全开。

四、开户时一定问清楚
1. 每日转账限额
2. 是否能开手机银行
3. 是否需要 OTP 或 보안카드
4. 银行卡是否支持交通卡
5. 海外转账和海外刷卡是否开通
6. 名字拼写是否和 ARC 完全一致

五、最常见问题
手机实名、银行实名、外国人登录证姓名不一致，会导致 Toss、KakaoPay、网购、外卖、医院预约认证失败。开户时就让柜员按 ARC 信息录入。

建议：拿到 ARC 后再正式开户；如果被一家银行拒绝，可以去学校合作支行或让国际处开说明。`,
    sources: [
      { label: 'Study in Korea 滞留/生活信息', url: officialLinks.studyInKoreaResidenceStay, kind: 'official' },
      { label: '外国人登录证/地址变更材料清单', url: materialLinks.arcAddressChecklist, kind: 'download', download: true },
    ],
  },
  {
    id: 'post-phone-card',
    title: '韩国手机卡办理攻略',
    school: '韩国生活',
    category: '银行卡/手机卡/保险',
    country: '韩国',
    city: '首尔',
    author: '首尔生活记录员',
    identity: '在读生',
    price: 0,
    hot: '2.7k',
    views: 2710,
    likes: 124,
    bookmarks: 280,
    tags: ['韩国', '手机卡', '认证', '生活'],
    contentType: '生活攻略',
    featured: false,
    createdAt: '2026-04-29',
    excerpt: '预付卡、알뜰폰、合约套餐怎么选，重点看认证、流量和解约成本。',
    body: `手机卡要按阶段选，不要刚落地就签贵的长期合约。

一、刚到韩国
先用预付卡或 eSIM 解决导航、联系房东、收验证码。这个阶段重点是能上网、能接电话，不要追求一步到位。

二、拿到外国人登录证后
建议办本人名义手机号。韩国很多服务需要 휴대폰 본인인증：银行、网购、外卖、医院预约、快递通关、租房平台都会用到。

三、三种常见选择
1. 预付卡：办理快，适合刚落地，但认证能力可能有限。
2. 알뜰폰/MVNO：便宜，适合长期留学，先确认是否支持外国人 ARC 和本人认证。
3. 三大运营商合约：稳定，线下门店多，但月租和违约成本更高。

四、签约前问清楚
是否有合约期、解约费、能否本人认证、流量限速规则、是否能线上改套餐、客服语言、回国停机怎么处理。

五、避坑
不要用别人名义手机号长期认证你的银行和账号。后面换号、找回账号、办金融业务都会非常麻烦。`,
  },
  {
    id: 'post-work-notes',
    title: '韩国留学生打工注意事项',
    school: '高丽大学',
    category: '打工/劳动纠纷',
    country: '韩国',
    city: '首尔',
    author: '安岩兼职过来人',
    identity: '本科',
    price: 15,
    hot: '3.4k',
    views: 3440,
    likes: 201,
    bookmarks: 490,
    tags: ['韩国', '打工', '兼职', '劳动纠纷', '以公告为准'],
    contentType: '避坑攻略',
    featured: true,
    createdAt: '2026-04-28',
    excerpt: '打工前先确认许可、合同、工资结算和工时记录，别只听店长口头承诺。',
    body: `留学生打工最重要的不是先找店，而是先确认自己能不能合法工作、能做多少小时、许可书写了哪个雇主和地点。

一、先确认资格
D-2、D-4 学生通常不是自动无限制打工。需要看签证类型、入境时间、成绩、出勤、韩语能力、是否超学期，以及学校是否同意。语学院 D-4 通常要入境/入学满 6 个月后才有资格申请。

二、先把小时数问清楚
1. D-2 本科常见是学期中平日每周 20-30 小时，认证大学、语言能力达标等条件下可能有更高上限。
2. D-2 硕博常见是学期中平日每周 30-35 小时，部分学校资料或特定条件会写到 40 小时。
3. 周末、公休日、寒暑假通常不按平日小时上限计算，也就是很多人说的“假期不限”。但前提是你已经拿到时间制就业许可，并且工作在许可的雇主、地点和行业范围内。
4. D-4 语学院多见每周 20 小时以内；韩语能力或出勤不达标时可能降到 10 小时，甚至不能申请。
5. 수료生、论文准备生、超学期学生不要默认还能打工，很多学校会单独限制。

三、一般流程
1. 找到雇主。
2. 签标准劳动合同，写清工资、地点、时间、工作内容。
3. 填外国人留学生时间制就业确认书。
4. 雇主盖章/签字。
5. 学校国际处或负责老师确认。
6. 向 HiKorea/出入境申请时间制就业许可。
7. 许可下来后再正式开始工作。

四、常见材料
护照、外国人登录证、申请书、在学证明、成绩或出勤材料、时间制就业确认书、标准劳动合同、雇主营业执照、雇主身份证明、学校确认书、TOPIK/KIIP 或授课语言证明等。不同学校和窗口要求会变化。

五、合同要写清
工资、工作地点、工作内容、每周工时、结算日、休息时间、试用期、加班规则、工资支付方式。口头说“到时候给你”最危险。

六、拖欠工资怎么办
保留排班表、打卡记录、聊天记录、工资转账、店铺信息、同事证言。不要只靠一句“老板答应我了”。必要时可以咨询学校国际处、劳动咨询机构、雇佣劳动部或外国人综合咨询中心 1345。

七、不要碰高风险工作
未获许可直接上班、许可外地点工作、超时工作、配送/代驾、上门销售、娱乐场所、建设业、部分制造业、派遣/外包型用工、给未成年人做外语私教，都可能影响签证。具体允许行业和工时以出入境最新公告和学校国际处说明为准。

最后一句实话：打工前问清“我能批多少小时、假期怎么算、换店要不要重报”，比问工资还重要。工资可以追，签证记录很难补。`,
    sources: [
      { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
      { label: 'HiKorea 电子民愿入口', url: officialLinks.hiKoreaElectronicApplication, kind: 'official' },
      { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
      {
        label: '时间制就业许可材料清单',
        url: materialLinks.partTimeWorkChecklist,
        kind: 'download',
        download: true,
      },
    ],
  },
  {
    id: 'post-hospital',
    title: '韩国医院看病流程',
    school: '忠南大学',
    category: '医院/看病/药店',
    country: '韩国',
    city: '大田',
    author: '在韩生活五年',
    identity: '毕业生',
    price: 0,
    hot: '2.2k',
    views: 2260,
    likes: 116,
    bookmarks: 260,
    tags: ['韩国', '医院', '保险', '药店'],
    contentType: '流程攻略',
    featured: false,
    createdAt: '2026-04-27',
    excerpt: '挂号、问诊、缴费、拿药和保险使用的基础流程，医疗判断以医生意见为准。',
    body: `韩国看病流程和国内不太一样，医院费和药费通常分开。

一、先确认保险
留学生通常会纳入国民健康保险体系，但要确认是否已经生效、是否欠费、登记地址是否正确。保险通知经常寄到外国人登录证登记地址。

二、小病先去诊所
感冒、皮肤、肠胃、耳鼻喉这类问题，先去 동네의원 比直接去大学医院更快。大医院可能需要预约或转诊。

三、看病流程
1. 到前台挂号，出示外国人登录证。
2. 说明症状，不会韩语可以提前写好关键词。
3. 医生问诊。
4. 前台缴费，医保适用部分会体现在账单里。
5. 拿处方。
6. 去附近药店买药。

四、需要保留什么
诊断书、收据、药费明细、处方记录。如果你还有学校保险或私人保险，后续报销可能需要这些文件。

五、避坑
急症直接去急诊，不要硬扛。普通小病不要一上来去大型综合医院，等待久、费用高。牙科、体检、整形、部分非必要项目不一定能报销。`,
    sources: [
      { label: '韩国国民健康保险公团英文入口', url: officialLinks.nhisEnglish, kind: 'official' },
      { label: 'Study in Korea 滞留/生活信息', url: officialLinks.studyInKoreaResidenceStay, kind: 'official' },
    ],
  },
  {
    id: 'post-grad-course',
    title: '大学院选课避坑',
    school: '汉阳大学',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    author: '工科博士在读',
    identity: '大学院',
    price: 18,
    hot: '2.9k',
    views: 2910,
    likes: 168,
    bookmarks: 352,
    tags: ['韩国', '大学院', '选课', '教授', '精华'],
    contentType: '经验帖',
    featured: true,
    createdAt: '2026-04-26',
    excerpt: '第一学期别只看课程名，要把授课语言、评价方式、教授风格和毕业要求一起看。',
    body: `大学院选课不能只看课程名，尤其是第一学期。

一、先看毕业要求
确认总学分、专业必修、选修、研究学分、论文资格考试、外语/综合考试要求。有些课看起来有用，但不能算入毕业学分。

二、选课前问四件事
1. 授课语言：韩语、英语还是混合。
2. 评价方式：考试、报告、发表、项目、出勤。
3. 作业密度：每周 reading、presentation、team project 是否很重。
4. 教授风格：是否点名、是否要求课堂讨论、是否和你研究方向相关。

三、和导师沟通
如果你已经进实验室或研究室，先问导师推荐课程。有些课和研究方向、毕业论文、项目经费有关，不建议自己盲选。

四、第一学期建议
不要一口气选太满。先适应组会、研究室、韩语行政、论文阅读和生活节奏。留一门相对稳的课做缓冲。

五、退课和改课
记住 수강정정 和 철회 时间。韩国大学选课窗口很严格，错过时间不一定能特殊处理。`,
  },
  {
    id: 'post-secondhand',
    title: '韩国二手交易避坑',
    school: '韩国生活',
    category: '二手交易/搬家处理',
    country: '韩国',
    city: '首尔',
    author: '搬家三次的学姐',
    identity: '毕业生',
    price: 0,
    hot: '2.0k',
    views: 2040,
    likes: 93,
    bookmarks: 210,
    tags: ['韩国', '二手交易', '搬家', '生活'],
    contentType: '避坑攻略',
    featured: false,
    createdAt: '2026-04-25',
    excerpt: '家具、电器、教材和搬家处理时，重点确认面交、付款和瑕疵记录。',
    body: `韩国二手交易常见平台有 당근마켓、学校群、微信群和二手论坛。便宜是好事，但别为了省几万韩元丢大钱。

一、尽量面交
教材、小家电、家具都建议面交。电器现场通电，家具现场看尺寸、破损、螺丝、抽屉、轮子。

二、付款前保留证据
聊天记录、商品照片、对方账号、约定价格、瑕疵说明都保存。不要只看卖家一句“没问题”。

三、家具要提前量
桌子、床垫、柜子要量房间、电梯、楼梯、门框。很多留学生买了才发现搬不进房间，或者搬运费比家具还贵。

四、搬家处理时间线
大件家具至少提前 2-3 周挂。临走前一天才卖，基本只能低价处理甚至付费丢弃。

五、红线
要求先全款邮寄贵重物、拒绝视频确认、价格离谱低、账号刚注册、催你马上转账，这些都不要碰。`,
  },
  {
    id: 'post-thesis-process',
    title: '韩国毕业论文流程整理',
    school: '汉阳大学',
    category: '毕业/论文/延毕',
    country: '韩国',
    city: '首尔',
    author: '大学院毕业生',
    identity: '毕业生',
    price: 20,
    hot: '3.6k',
    views: 3660,
    likes: 220,
    bookmarks: 540,
    tags: ['韩国', '大学院', '毕业', '论文', '精华'],
    contentType: '流程攻略',
    featured: true,
    createdAt: '2026-04-24',
    excerpt: '按导师沟通、选题、开题、中期、审查和提交节点整理论文时间线。',
    body: `韩国大学院论文流程要提前倒排，不然很容易卡在行政节点。

一、先确认毕业条件
总学分、平均绩点、外语考试、综合考试、论文资格、伦理教育、查重标准、发表要求，每个院系都可能不一样。

二、时间线建议
毕业前 2-3 学期：确定研究方向和导师沟通。
毕业前 1-2 学期：完成资格考试、外语要求、论文计划。
毕业学期前半段：提交论文审查申请、缴审查费、确认审查委员。
毕业学期中后段：预答辩、查重、修改、正式答辩。
答辩后：提交最终论文、印刷本或电子版、图书馆系统上传。

三、导师沟通
不要只问“老师我能毕业吗”。要带着目录、研究问题、数据、进度表去沟通。每次会后把修改意见整理成文字，避免口头理解偏差。

四、行政节点
论文审查申请、查重提交、答辩时间、最终上传都有截止日。办公室公告比同学经验更重要。

五、延期风险
如果错过论文窗口，可能要延到下学期，涉及研究注册费、签证延长、医保、奖学金和宿舍资格。论文不是写完就毕业，行政流程也要完成。`,
  },
]

const mergeSeedPosts = (posts?: Post[]) => {
  if (!posts?.length) return seedPosts

  const savedById = new Map(posts.map((post) => [post.id, post]))
  const seedIds = new Set(seedPosts.map((post) => post.id))
  return [
    ...seedPosts.map((post) => savedById.get(post.id) ?? post),
    ...posts.filter((post) => !seedIds.has(post.id)),
  ]
}

const offlineBountyTasks: OfflineBountyTask[] = [
  {
    id: 'offline-arc-appointment',
    title: '陪同去出入境补办外国人登录证并确认材料',
    category: '线下求助',
    school: '延世大学',
    city: '首尔',
    amountYuan: 180,
    deadline: '2026-05-08',
    status: 'open',
    tags: ['出入境', '陪同', '材料确认'],
    detail: '需要熟悉 HiKorea 预约和出入境窗口流程的人，帮忙确认材料、陪同到场并解释窗口要求。',
  },
  {
    id: 'offline-rent-check',
    title: '帮忙看新村附近转租合同和押金风险',
    category: '线下求助',
    school: '西江大学',
    city: '首尔',
    amountYuan: 260,
    deadline: '2026-05-10',
    status: 'open',
    tags: ['转租', '合同', '押金'],
    detail: '希望有租房经验的人一起核对合同主体、保证金、管理费、退租条款和房东/中介信息。',
  },
  {
    id: 'offline-course-group',
    title: '一起核对下学期选课和毕业学分要求',
    category: '线下求助',
    school: '中央大学',
    city: '首尔',
    amountYuan: 120,
    deadline: '2026-05-12',
    status: 'open',
    tags: ['抱团选课', '学分', '毕业要求'],
    detail: '需要同校或同专业前辈帮忙看课程表、必修/选修、毕业学分和教授评价，最好能线下面谈一次。',
  },
  {
    id: 'offline-phone-bank',
    title: '到校第一周手机卡、银行卡和本人认证陪跑',
    category: '线下求助',
    school: '建国大学',
    city: '首尔',
    amountYuan: 200,
    deadline: '2026-05-15',
    status: 'open',
    tags: ['手机卡', '银行卡', '本人认证'],
    detail: '刚到韩国，需要熟悉周边银行、手机卡和本人认证流程的人，帮忙规划顺序并陪同办理。',
  },
]

const cityGuides: CityGuide[] = [
  {
    id: 'guide-cau-life',
    title: '中央大学留学生生活攻略',
    category: '学校评价',
    country: '韩国',
    city: '首尔',
    school: '中央大学',
    summary: '黑石洞通勤、坡度、周边餐饮、艺术传媒专业生活节奏和租房选择。',
    tags: ['中央大学', '首尔', '学校生活'],
    updatedAt: '2026-05-03',
  },
  {
    id: 'guide-seoul-rent-area',
    title: '首尔租房区域推荐',
    category: '租房/搬家/保证金',
    country: '韩国',
    city: '首尔',
    school: '首尔生活',
    summary: '新村、弘大、往十里、建大入口、安岩等区域的通勤和生活成本比较。',
    tags: ['首尔', '租房', '通勤'],
    updatedAt: '2026-05-02',
  },
  {
    id: 'guide-anseong-life',
    title: '安城留学生生活攻略',
    category: '城市生活攻略',
    country: '韩国',
    city: '安城',
    school: '中央大学安城校区',
    summary: '安城校区周边交通、住宿、采购和回首尔的实际体验。',
    tags: ['安城', '校区生活', '交通'],
    updatedAt: '2026-05-01',
  },
  {
    id: 'guide-grad-checklist',
    title: '韩国大学院新生入学 checklist',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    school: '韩国大学院',
    summary: '从入境、住宿、学生证、选课、银行卡到保险，把第一周事项列清楚。',
    tags: ['大学院', '新生', 'checklist'],
    updatedAt: '2026-04-30',
  },
  {
    id: 'guide-mart-saving',
    title: '韩国便利店/超市省钱攻略',
    category: '城市生活攻略',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    summary: '便利店活动、超市打折时间、会员积分和日用品采购经验。',
    tags: ['生活', '省钱', '超市'],
    updatedAt: '2026-04-29',
  },
  {
    id: 'guide-moving',
    title: '韩国搬家流程',
    category: '二手交易/搬家处理',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    summary: '退租、清洁、搬家公司、废弃物贴纸和地址变更的基础流程。',
    tags: ['搬家', '退租', '生活'],
    updatedAt: '2026-04-28',
  },
  {
    id: 'guide-trash',
    title: '韩国垃圾分类指南',
    category: '城市生活攻略',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    summary: '一般垃圾、厨余、回收和大件废弃物的常见处理方式。',
    tags: ['生活', '垃圾分类', '租房'],
    updatedAt: '2026-04-27',
  },
  {
    id: 'guide-transport-card',
    title: '韩国交通卡使用指南',
    category: '城市生活攻略',
    country: '韩国',
    city: '首尔',
    school: '韩国生活',
    summary: 'T-money、换乘、充值、机场交通和通勤路线选择。',
    tags: ['交通', 'T-money', '生活'],
    updatedAt: '2026-04-26',
  },
  {
    id: 'guide-scholarship',
    title: '韩国奖学金申请经验',
    category: '入学/选课/学分',
    country: '韩国',
    city: '首尔',
    school: '韩国大学',
    summary: '入学奖学金、成绩奖学金、教授项目和校内申请窗口的注意事项。',
    tags: ['奖学金', '申请', '大学院'],
    updatedAt: '2026-04-25',
  },
  {
    id: 'guide-useful-sites',
    title: '韩国留学生常用网站整理',
    category: '城市生活攻略',
    country: '韩国',
    city: '全国',
    school: '韩国生活',
    summary: 'HiKorea、学校门户、租房、地图、二手交易和求职网站入口。',
    tags: ['网站', '工具', '生活'],
    updatedAt: '2026-04-24',
  },
]

const featuredExperiences = seedPosts.filter((post) => post.featured)
const latestPosts = [...seedPosts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

const journeyTopics: JourneyTopic[] = [
  {
    slug: 'admission',
    title: '语学院/本科/硕博入学相关',
    shortTitle: '入学相关',
    summary: '申请材料、入学流程、选课和学分确认',
    heroTitle: '从申请到入学，把材料和流程一次看清。',
    heroCopy:
      '集中整理语学院、本科、大学院申请、入学材料、选课、学分确认和新生到校流程，适合准备申请和刚入学的学生先看。',
    categories: ['入学/选课/学分', '语学院/本科/大学院', '学校评价'],
    tags: ['申请材料', '入学流程', '选课', '学分确认', '语学院', '大学院'],
    steps: [
      { title: '申请前', text: '确认招生简章、语言要求、学历材料、财产证明和公证认证时间。' },
      { title: '录取后', text: '核对学费缴纳、标准入学许可书、住宿、保险和入境时间线。' },
      { title: '到校后', text: '处理学生证、门户系统、选课、学分承认和院系办公室确认。' },
    ],
    deepDives: [
      {
        title: '申请材料总清单：语学院、本科、大学院不要混着准备',
        label: '材料样本',
        text:
          '韩国学校申请最容易出错的地方，不是少交一张表，而是把语学院、本科和大学院当成同一套材料。语学院更看重护照、学历、财力和学习计划能不能证明你来韩国学习韩语；本科会看高中/专科/本科阶段学历、成绩、语言成绩、作品或面试；大学院会更重视研究计划、推荐信、教授匹配、前置专业和毕业论文/作品。真正稳的做法是先把目标学校的外国人招生简章打印出来，再按“身份材料、学历材料、财力材料、语言材料、专业材料、签证衔接材料”六类做文件夹。',
        bullets: [
          '第一层：身份材料。护照首页、证件照、申请表、本人联系方式、父母或经费支付人信息先统一拼写。中文姓名、英文拼音、出生日期、国籍、护照号要和所有公证件、银行材料、网申系统一致。只要一个字母错，后面签证、入学许可书和外国人登录证都可能跟着出问题。',
          '第二层：学历材料。语学院一般需要最终学历毕业证明/在读证明和成绩单；本科申请要按高中、会考/高考、转学、专科等身份分开看；大学院通常需要本科毕业证明、学位证明、成绩单，有些学校还要毕业预定证明、学位授予预定证明、GPA换算说明。中国材料常见处理顺序是：学校开具原件或中英文件 -> 公证/认证/学信网或学校系统验证 -> 扫描上传 -> 纸质件邮寄。不要等网申最后一天才开证明。',
          '第三层：财力材料。常见是本人或父母名下存款证明、银行余额证明、亲属关系证明、经费支付承诺。重点不是金额越高越好，而是资金来源、账户名、冻结/开具日期、币种、英文信息和学校要求一致。很多学校要求“申请日前一定期限内开具”，太早开会失效。',
          '第四层：语言材料。TOPIK、IELTS、TOEFL、韩国大学语学院结业证明、英文授课项目语言豁免都要看项目要求。不要只看专业页面宣传，要看当季外国人招生简章。语学院升本科/大学院时，学校内部语学院结业等级不一定等于 TOPIK，有些院系仍然要求正式成绩或面试。',
          '第五层：专业材料。大学院研究计划不能写成“我喜欢韩国文化”。建议按“研究题目 -> 为什么重要 -> 你过去做过什么 -> 准备跟哪类教授/课程衔接 -> 入学后一年内怎么做”写。艺术、传媒、设计类作品集要单独看格式、页数、链接有效期和是否需要面试。',
          '可复制邮件样本：안녕하세요. 저는 2026학년도 외국인 전형 지원 예정자인 ○○○입니다. 모집요강에서 확인한 제출서류 중 ○○증명서의 발급 기준일과 원본 제출 여부를 확인하고 싶습니다. 중국 소재 학교에서 발급한 영문 성적증명서와 공증본 중 어떤 서류가 인정되는지 안내 부탁드립니다. 감사합니다.',
        ],
        sources: [
          { label: 'Study in Korea 官方留学入口', url: officialLinks.studyInKoreaMain, kind: 'official' },
          { label: '韩国签证门户 Korea Visa Portal', url: officialLinks.koreaVisaPortal, kind: 'official' },
          {
            label: '语学院/本科/大学院申请材料清单',
            url: materialLinks.studyApplicationChecklist,
            kind: 'download',
            download: true,
          },
        ],
      },
      {
        title: '录取后到入境：标准入学许可书、签证和到校报到时间线',
        label: '入境流程',
        text:
          '拿到录取不等于可以直接买机票。韩国留学真正的入境链条通常是：学校录取 -> 缴纳学费或确认注册 -> 学校开具标准入学许可书/事业者登录证等签证材料 -> 申请 D-2 或 D-4 签证 -> 入境 -> 到校报到 -> 预约外国人登录证。任何一个节点延误，都会影响宿舍、选课、银行卡、手机卡和后续打工许可。',
        bullets: [
          '第一步：确认录取类型。语学院多为 D-4-1，正规本科/硕博多为 D-2。交换、研究、短期课程可能是其他细分类型。不要用群聊里的“都是留学签”来判断，签证类型不同，允许停留、打工、延签和转签规则都不一样。',
          '第二步：检查学校发的签证材料。常见包括标准入学许可书、学校事业者登录证、学费缴纳证明、录取通知、住宿或校方说明。标准入学许可书上的姓名、生日、国籍、学校、课程、学习期间必须和护照、申请表一致。发现错误要立刻让学校重发，不要带错件去领馆碰运气。',
          '第三步：签证申请材料按领区确认。常见材料包括签证申请表、护照、照片、身份证明、学历证明、财力证明、标准入学许可书、结核检查或健康材料等。不同国家/领区、不同年度要求会变化，最终以韩国签证门户、驻外使领馆和学校国际处通知为准。',
          '第四步：入境后 90 天内处理外国人登录证预约。很多新生会卡在 HiKorea 预约满、宿舍地址还没确定、学校证明没开出来。建议入境前就问学校是否有团体办理，若自己办理，提前准备护照、签证页、照片、在学证明、住所证明、手续费和申请表。',
          '第五步：到校后先激活学校门户。选课、学费确认、学生证、邮箱、图书馆、奖学金、保险和宿舍都可能挂在门户系统上。新生最稳的顺序是：国际处报到 -> 院系办公室确认 -> 门户账号 -> 选课/学分承认 -> 保险/银行卡/手机号。',
          '新生核对表样本：1. 护照有效期超过预计学习期；2. 标准入学许可书信息正确；3. 学费缴纳凭证保存 PDF；4. 签证申请回执拍照；5. 住宿地址韩文版准备好；6. 入境后 7 天内确认外国人登录证预约；7. 选课开放时间写进日历；8. 所有学校邮件转发到常用邮箱。',
        ],
        sources: [
          { label: 'Study in Korea 签证与滞留信息', url: officialLinks.studyInKoreaVisaStay, kind: 'official' },
          { label: '韩国签证门户 Korea Visa Portal', url: officialLinks.koreaVisaPortal, kind: 'official' },
          { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
          { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
          {
            label: '录取后签证/入境/登录证预检表',
            url: materialLinks.visaAdmissionChecklist,
            kind: 'download',
            download: true,
          },
        ],
      },
    ],
  },
  {
    slug: 'student-life',
    title: '在学期间相关',
    shortTitle: '在学生活',
    summary: '签证、租房、打工、保险、银行卡和校园生活',
    heroTitle: '在韩国读书期间，先解决生活里的硬问题。',
    heroCopy:
      '覆盖 D-2/D-4 延签、外国人登录证、租房保证金、银行卡、手机卡、医保、打工许可和校园生活，优先整理可执行的步骤。',
    categories: ['签证/滞留资格', '租房/搬家/保证金', '银行卡/手机卡/保险', '打工/劳动纠纷', '医院/看病/药店', '城市生活攻略'],
    tags: ['签证', '租房', '保证金', '打工', '保险', '银行卡', '手机卡'],
    steps: [
      { title: '证件优先', text: '确认外国人登录证、滞留期限、HiKorea 预约和学校材料窗口。' },
      { title: '生活落地', text: '按租房、手机号、银行卡、医保、医院和交通卡顺序补齐基础生活能力。' },
      { title: '合规打工', text: '打工前先确认签证类型、学校确认、时间制就业许可和工作限制。' },
    ],
    deepDives: [
      {
        title: 'D-2/D-4 打工许可：先拿许可，再谈排班和工资',
        label: '合规打工',
        text:
          '韩国留学生打工不是“找到店就能上班”。D-2、D-4 持有人原则上要先确认自己是否符合时间制就业资格，再通过学校负责老师/国际处确认，最后向出入境申请许可。最危险的不是少赚工资，而是无许可打工、超时打工、去限制行业或工作地点变更没申报，最终影响延签、转签甚至再入境。',
        bullets: [
          '第一步：确认自己是否有资格。通常要看签证类型、入境/在学时间、出勤率、成绩、韩语能力、是否超学期、学校是否认可。D-4 语学院、D-2 本科、硕博、研究课程的要求可能不同；部分学校会明确提示，出勤或成绩不达标、超学期、毕业条件未满足的学生不能申请或很难通过。',
          '第二步：确认工时。不要只记一句“学期中 40 小时、假期不限”。韩国官方表格会按学历阶段、韩语能力、认证大学、平日/周末/假期区分，且政策会调整。有些 D-2 本科/大学院在满足语言或学校条件时可有较高平日上限，假期或周末规则也可能不同。正确做法是以 Study in Korea/HiKorea 当季表格和学校国际处最新通知为准，把自己的签证细分类型、年级、TOPIK/KIIP、学校认证状态一起核对。',
          '第三步：申请材料。常见材料包括申请书、护照、外国人登录证、在学证明、成绩/出勤证明、韩语能力材料、雇佣合同、营业执照、学校确认书或负责老师确认文件。合同里要写工作地点、岗位内容、工资、每周小时、雇主信息。只写“帮忙”“兼职”这种模糊岗位，后续很难解释。',
          '第四步：换老板、换地点、加班要重新核对。许可通常绑定工作地点和雇主，不是拿到一次就可以随便换店。便利店换分店、餐厅换法人、同一老板不同营业场所，都可能需要重新申报或变更确认。',
          '第五步：工资和安全。最低工资、夜间/周末/加班、休息时间、工资支付日、四大保险和退职金要提前问清。高风险工作包括娱乐酒吧、配送代驾、上门销售、成人相关行业、与学生身份不符或安全风险高的工作。有人说“我们店留学生都这么干”不等于合法。',
          '可复制给老板的确认模板：저는 외국인 유학생이라 시간제 취업 허가가 필요합니다. 근무 시작 전 고용계약서, 사업자등록증, 근무시간표를 받아 학교 확인과 출입국 허가를 먼저 진행해야 합니다. 허가 전에는 근무를 시작할 수 없고, 근무 장소나 시간이 바뀌면 다시 확인해야 합니다.',
        ],
        sources: [
          { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
          { label: 'HiKorea 电子民愿入口', url: officialLinks.hiKoreaElectronicApplication, kind: 'official' },
          { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
          { label: 'Study in Korea 滞留/生活信息', url: officialLinks.studyInKoreaResidenceStay, kind: 'official' },
          {
            label: '留学生时间制就业许可材料清单',
            url: materialLinks.partTimeWorkChecklist,
            kind: 'download',
            download: true,
          },
        ],
      },
      {
        title: '租房、保证金、医保、银行卡：在学生活四件套怎么排顺序',
        label: '生活落地',
        text:
          '新生到韩国最容易同时被四件事卡住：没有外国人登录证办不了完整手机号和银行卡；没有手机号收不到认证；没有稳定住址不好办登录证；没有医保和银行卡，看病、缴费、退押金都麻烦。不要按“谁先催我就先办谁”的方式处理，而是按证件、住所、通信、金融、保险的依赖关系排顺序。',
        bullets: [
          '租房先查三件事：合同主体、登记簿和保证金风险。签约前要确认房东是否有处分权、房屋是否有抵押/查封/优先债权、保证金相对房价是否过高。전세/月세/고시원/원룸/오피스텔 风险不同。中文中介或学长介绍不等于安全，合同、转账、房东身份和登记簿才是核心。',
          '住所证明要提前规划。外国人登录证、延签、银行开户、手机实名、医保通知都可能用到住址。宿舍要确认能不能开住宿确认书；租房要保存合同、房东信息和地址韩文写法；短租或朋友家借住要提前问出入境是否接受相应证明。',
          '银行卡开户不要只问“哪家容易”。银行会看外国人登录证、手机号、学校证明、地址、在学状态和用途。建议准备 ARC、护照、在学证明、学生证、韩国手机号、住所证明和学费缴纳/奖学金证明。开户时顺便问清网银、 체크카드、海外汇款、限额解除和手机认证。',
          '医保要看身份和缴费节点。长期滞留外国人可能被纳入韩国国民健康保险，学校也可能有团体保险或补充保险。看病前先确认自己是国民健康保险、学校保险、旅行险还是商业险，报销材料、医院级别和药店结算方式完全不同。',
          '手机卡建议先解决本人认证。短期游客卡能上网，但很多银行、外卖、二手交易、政府网站和医院预约需要本人认证。长期在学建议用 ARC 后办理能实名认证的号码；更换号码后要同步银行、学校系统、HiKorea 和常用 App。',
          '租房避坑样本清单：1. 房东身份证/法人信息；2. 등기부등본 最新版；3. 合同韩文原件；4. 保证金和月租转账账户名；5. 管理费包含项目；6. 退租通知期限；7. 维修责任；8. 入住前拍照视频；9. 전입신고/확정일자 是否可行；10. 所有聊天记录和收据保存。',
        ],
        sources: [
          { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
          { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
          { label: '首尔住房综合门户', url: officialLinks.seoulHousing, kind: 'official' },
          { label: '韩国国民健康保险公团英文入口', url: officialLinks.nhisEnglish, kind: 'official' },
          {
            label: '外国人登录证/地址变更材料清单',
            url: materialLinks.arcAddressChecklist,
            kind: 'download',
            download: true,
          },
        ],
      },
    ],
  },
  {
    slug: 'graduation',
    title: '毕业问题相关',
    shortTitle: '毕业问题',
    summary: '论文、延毕、毕业审查和材料节点',
    heroTitle: '毕业不是只写完论文，还要踩准学校流程。',
    heroCopy:
      '围绕论文、延毕、毕业审查、材料节点、研究注册、答辩窗口和签证衔接，整理最容易被忽略的毕业问题。',
    categories: ['毕业/论文/延毕', '入学/选课/学分', '学校评价'],
    tags: ['论文', '延毕', '毕业审查', '答辩', '研究注册', '材料节点'],
    steps: [
      { title: '毕业条件', text: '先确认学分、外语、综合考试、论文资格和院系特殊要求。' },
      { title: '论文节点', text: '盯住指导教授确认、审查申请、答辩、修改提交和图书馆上传时间。' },
      { title: '延毕风险', text: '提前问清研究注册费、签证延长、宿舍、医保和奖学金影响。' },
    ],
    deepDives: [
      {
        title: '大学院毕业论文时间线：从选题到图书馆上传',
        label: '论文流程',
        text:
          '韩国大学院毕业不是“论文写完就能毕业”。真正的流程一般包括：确认毕业资格、通过外语/综合考试、确定指导教授、提交论文计划或审查申请、预审/中期、正式答辩、修改、相似度检查、最终签字、电子版上传、纸质本或确认文件提交。每个学校、学院甚至专业都有自己的表格和截止日期，最容易翻车的是把院系截止日期当成学校最终截止日期。',
        bullets: [
          '第一步：倒推时间。建议从预计毕业月往前倒推 6 个月。先问院系办公室四个日期：论文审查申请截止、答辩截止、最终论文提交截止、学位授予/毕业审查结果公布。再问指导教授三件事：选题是否可行、什么时候看初稿、答辩委员如何确定。',
          '第二步：确认毕业资格。学分、必修课、平均绩点、外语考试、综合考试、伦理教育、研究方法课、论文发表要求、学术会议要求都可能是毕业门槛。很多学生不是论文不行，而是答辩前才发现少一门必修课或综合考试没过。',
          '第三步：论文计划和题目管理。题目变更、导师变更、研究方向变更都可能需要表格。中文学生常见问题是题目翻译不统一：韩文题目、英文题目、摘要、系统登记、最终封面必须一致。建议从开题开始就维护一个“题目版本表”。',
          '第四步：答辩材料。常见包括论文审查申请书、指导教授确认、成绩证明、缴费证明、相似度报告、论文初稿、摘要、发表证明、研究伦理确认等。答辩 PPT 不要只讲背景，要讲研究问题、方法、数据、结论、贡献、限制和修改计划。',
          '第五步：答辩后不是结束。委员修改意见、最终签字页、图书馆上传格式、PDF 权限、封面格式、摘要语言、参考文献格式、纸质本装订都可能卡。建议答辩当天就整理修改清单，和导师确认哪些必须改、哪些可以解释。',
          '可复制给导师的邮件样本：교수님 안녕하세요. 이번 학기 학위논문 심사를 준비하고 있는 ○○○입니다. 학과 논문심사 신청 마감일이 ○월 ○일이라, 초안 검토 일정과 심사위원 구성 가능 여부를 여쭙고 싶습니다. 첨부한 목차와 연구계획을 확인해 주시면 수정 후 본문 초안을 ○월 ○일까지 전달드리겠습니다. 감사합니다.',
        ],
        sources: [
          { label: '首尔大学大学院学事/论文相关入口', url: 'https://en.snu.ac.kr/academics/graduate' },
          { label: '延世大学大学院论文/学位相关入口', url: 'https://graduate.yonsei.ac.kr' },
        ],
      },
      {
        title: '延毕和毕业审查：签证、研究注册费、宿舍和奖学金一起算',
        label: '延毕风险',
        text:
          '延毕不是简单“多读一学期”。对留学生来说，延毕会同时影响 D-2 延签、研究注册费、宿舍资格、医保缴费、奖学金、助教岗位、毕业后 D-10 时间线和回国校招窗口。真正要做的是在确认延毕可能出现时，立刻把学校流程和出入境流程并行处理。',
        bullets: [
          '先判断延毕原因。是学分不够、论文没过、导师不同意答辩、综合考试没过、外语要求没满足，还是毕业审查材料错过截止？原因不同，解决路径不同。学分问题看加课/季学期/替代课程；论文问题看研究注册和答辩窗口；材料问题看院系是否允许补交。',
          '问学校三个办公室：院系办公室、国际处、宿舍/学生支援。院系管毕业资格和论文节点，国际处管在学证明、签证材料和出入境口径，宿舍管延毕后能否继续住。不要只问一个老师，因为老师可能只知道学术流程，不知道签证后果。',
          '签证延长要提前准备。延毕期间可能需要在学证明、学费或研究注册缴费证明、成绩单、指导教授确认、论文进度说明、住所证明、银行材料等。若已经超过标准修业年限，出入境可能更关注为什么延毕、是否真实在学、是否有毕业计划。',
          '研究注册费和奖学金要算清。部分学校论文阶段需要缴纳研究注册费或论文审查费；奖学金可能因超学期、GPA、学分或毕业延期而停止。延毕前要做一张预算表：注册费、房租、医保、生活费、签证材料、机票改签和机会成本。',
          '回国和就业窗口也会受影响。国内企业可能看毕业时间、认证时间、是否应届；韩国 D-10 或 E-7 也看毕业和求职时间线。延毕确定后，简历、认证、校招投递和签证计划都要重排。',
          '延毕说明样本文案：本人因论文数据补充/实验进度/答辩委员修改意见，预计需延长一学期完成毕业论文。当前已完成课程学分和综合考试，剩余事项为论文最终修改、答辩及图书馆提交。计划于 ○年 ○月完成答辩，并按学校要求完成毕业审查。相关证明包括指导教授确认、论文进度表、缴费证明和在学证明。',
        ],
        sources: [
          { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
          { label: 'HiKorea 访问预约', url: officialLinks.hiKoreaVisitReservation, kind: 'official' },
          { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
          { label: 'Study in Korea 签证与滞留信息', url: officialLinks.studyInKoreaVisaStay, kind: 'official' },
          {
            label: 'D-2/D-4 延签材料清单',
            url: materialLinks.hikoreaExtensionChecklist,
            kind: 'download',
            download: true,
          },
        ],
      },
    ],
  },
  {
    slug: 'career',
    title: '毕业后签证/就业相关',
    shortTitle: '毕业后就业',
    summary: 'D-10、永驻、求职、回国认证、落户和人才政策',
    heroTitle: '毕业后怎么留下、回国和拿政策红利，先把路径想清楚。',
    heroCopy:
      '整理 D-10 求职签证、韩国永驻路径、找工作、回国学历认证、校招身份、免税车、北上广深落户和人才补贴，帮助毕业生少走弯路。',
    categories: ['求职/实习/简历', '签证/滞留资格', '打工/劳动纠纷'],
    tags: ['D-10', '永驻', '求职', '学历认证', '应届生', '免税车', '落户', '人才补贴'],
    steps: [
      { title: '毕业前', text: '准备成绩、毕业证明、作品/简历、求职计划和签证衔接材料。' },
      { title: '求职中', text: '记录投递、面试、实习和求职活动证明，避免签证材料断档。' },
      { title: '录用后', text: '确认雇主资质、岗位匹配、合同、工资和后续转签要求。' },
    ],
    deepDives: [
      {
        title: '换 D-10 求职签证',
        label: '韩国留下来',
        text:
          'D-10 适合毕业后还没有正式入职、但准备在韩国找工作的阶段。它不是毕业自动续签，也不是无限期缓冲，而是用材料证明你有真实求职计划、基本生活能力、住所连续性和合法滞留记录。毕业前如果已经知道暂时拿不到 E-7 或其他工作签，就要把 D-10 当成一个项目管理：学校材料、出入境预约、求职计划、投递记录和住所证明同时推进。',
        bullets: [
          '时间线：毕业前 2 个月查 HiKorea 预约，毕业前 1 个月问学校能否开毕业预定证明、成绩单、在学/修了证明，毕业前 2 周写好求职活动计划书，签证到期前至少预留补件时间。不要等拿到毕业证才开始，因为学校开证明、出入境预约和房屋合同可能会撞车。',
          '常见材料：护照、外国人登录证、申请书、证件照、手续费、毕业/预毕业/修了证明、成绩单、求职活动计划书、住所证明、银行余额或生活能力材料。部分窗口可能要求学校推荐、韩语能力、就业活动证明或其他补充材料。材料清单每年可能调整，最终以 HiKorea 和管辖出入境窗口为准。',
          '求职计划书不要写空话。建议按“目标行业、目标岗位、为什么与专业相关、未来 6 个月每月计划、已投递公司、准备参加的招聘会/面试/作品集修改计划”来写。比如传媒专业可以写内容运营、广告策划、视频制作；工科可以写研发、数据、设备、质量管理；经营可以写海外营业、市场、贸易、财务。',
          '求职证据要持续保存。投递记录、邮件回执、招聘平台截图、面试邀请、招聘会报名、作品集链接、实习洽谈、企业说明会、导师推荐邮件都可以整理进一个 PDF 文件夹。不要等续签或转签时才回头找证据。',
          'D-10 之后的真正目标通常是 E-7、创业、继续升学或回国。若准备转 E-7，要提前看岗位代码、专业匹配、薪资、公司规模、雇佣理由书和合同。很多人不是 D-10 拿不到，而是拿到后没有规划下一签，时间耗完仍然无法转工作签。',
          '求职计划书样本段落：本人于 ○○大学 ○○专业毕业，计划在韩国从事与专业相关的 ○○岗位。未来 6 个月将每周投递 5-8 家企业，重点关注 ○○、○○、○○行业；同时完善韩文简历、作品集和面试材料。已投递企业包括 ○○、○○，并计划参加 ○月 ○日的招聘说明会。本人目前住所为 ○○，具备基本生活资金，并将持续保留求职活动证明。',
        ],
        sources: [
          { label: 'HiKorea 电子民愿指南', url: officialLinks.hiKoreaElectronicApplicationGuide, kind: 'official' },
          { label: 'HiKorea 民愿表格下载页', url: officialLinks.hiKoreaForms, kind: 'official' },
          { label: 'Korea Visa Portal 签证类型查询', url: officialLinks.koreaVisaPortal, kind: 'official' },
          {
            label: 'D-10 求职计划书与材料清单',
            url: materialLinks.d10JobSeekingChecklist,
            kind: 'download',
            download: true,
          },
        ],
      },
      {
        title: '韩国永驻/长期居留路径',
        label: '长期规划',
        text: '永驻通常不是毕业后立刻办理，而是从 D-10、E-7、F-2 等长期路径慢慢积累收入、居住年限、纳税、韩语和守法记录。',
        bullets: [
          '先判断你适合就业签证路线、积分制居留路线，还是高学历/高收入/专业人才路线。',
          '提前保存纳税、收入、雇佣合同、居住地址、学历、TOPIK/KIIP、犯罪记录等长期材料。',
          '不要只看“几年能永驻”，还要看最近收入、资产、韩语、社会统合课程、离境天数和违法记录。',
          '永驻条件变化较多，建议把它作为 3-5 年规划，而不是毕业当下的一次性申请。',
        ],
        sourceLabel: 'Korea Visa Portal',
        sourceUrl: 'https://www.visa.go.kr',
      },
      {
        title: '韩国找工作',
        label: '求职执行',
        text: '韩国求职要同时准备韩文简历、英文/中文简历、作品集和可证明的实习/项目经历。留学生最常见的卡点是签证可转、岗位匹配和语言表达。',
        bullets: [
          '优先整理：目标行业、可转签岗位、公司是否有外籍雇佣经验、薪资是否满足签证要求。',
          '简历里把韩国经历写成结果：负责什么、做到什么、用什么工具、给团队带来什么变化。',
          '面试前准备韩语自我介绍、毕业论文/项目说明、签证状态说明和可入职时间。',
          '收到 offer 后先确认合同、岗位、薪资、四大保险、试用期和签证办理责任，不要口头入职。',
        ],
        sourceLabel: 'Work in Korea',
        sourceUrl: 'https://www.work.go.kr',
      },
      {
        title: '回国换学历学位认证',
        label: '回国第一步',
        text:
          '回国求职、落户、考编、人才政策和部分企业背调通常会看中留服认证。认证不是“回国后随便传个毕业证”，而是把境外学习经历、学位授予、出入境记录、身份信息和学校材料放到同一套逻辑里核验。毕业后如果还想冲校招、落户、人才补贴或免税车，学历认证要尽早排进计划。',
        bullets: [
          '第一步：确认学位已经正式授予。韩国学校常见有毕业预定证明、毕业证明、学位授予证明、成绩单、学位证书等不同文件。留服认证通常看最终学位授予结果，只有预毕业或临时证明时不要盲目提交，先问学校什么时候可以开最终证明。',
          '第二步：整理身份和学习轨迹。护照、旧护照、外国人登录证、签证页、出入境记录、学习期间的在学/成绩/毕业材料要能互相印证。若有转学、休学、延毕、换护照、姓名拼写变化、线上课程比例较高等情况，要提前准备解释材料。',
          '第三步：核对所有名称。学校英文名、韩文名、专业英文名、学位名称、入学和毕业日期、出生日期、护照姓名必须尽量一致。韩国学校系统里常见 Given name/Surname 顺序写反，毕业证和护照不一致时，后续落户或企业背调会更麻烦。',
          '第四步：认证结果如何使用。校招入职通常用它证明海外学历；落户会用它判断学历层次和毕业时间；人才补贴可能要求认证、劳动合同、社保个税同时满足；免税车和部分考试也可能需要留学回国人员身份或学历材料。',
          '第五步：卡应届生窗口。不要伪造应届身份，而是合规问清企业口径：看毕业证日期、认证日期、回国日期、是否缴纳社保、是否签过正式劳动合同。有些企业给海外毕业生单独批次，有些按毕业一年或两年内认定，有些只看当年毕业。投递前把 HR 的口径记录下来。',
          '材料夹命名样本：01_护照及出入境记录；02_外国人登录证；03_毕业证明和学位证明；04_成绩单；05_学校官方说明；06_认证系统截图；07_劳动合同社保个税；08_落户或补贴申请材料。所有 PDF 文件名加日期，方便企业和窗口补件。',
        ],
        sources: [
          { label: '中国留学网学历学位认证服务', url: 'https://zwfw.cscse.edu.cn' },
          { label: '教育部留学服务中心', url: 'https://www.cscse.edu.cn' },
        ],
      },
      {
        title: '回国找工作和校招身份',
        label: '应届窗口',
        text: '所谓“卡应届生 BUG”不要理解成造假，而是合规利用国内校招时间窗口：毕业时间、认证时间、是否缴纳社保、是否签过劳动合同，都会影响企业对应届身份的判断。',
        bullets: [
          '毕业前就开始投递秋招/春招，不要等认证完成后才开始准备简历。',
          '不同企业对应届生判断不同：有的看毕业时间，有的看认证时间，有的看是否有社保或正式劳动合同记录。',
          '回国前先准备中文简历、项目经历、成绩单、认证进度截图、毕业证明和可入职时间说明。',
          '不要伪造毕业时间、社保记录或空白经历；真正要做的是提前问 HR 口径，把材料和投递批次卡准。',
        ],
        sourceLabel: '教育部留学服务中心',
        sourceUrl: 'https://www.cscse.edu.cn',
      },
      {
        title: '留学生免税车',
        label: '回国福利',
        text: '留学回国人员购买免税国产车通常有时间窗口和留学时长要求。它不是所有车都能买，也不是直接少交全部费用，关键看资格、车型目录和办理时限。',
        bullets: [
          '先确认自己是否符合留学回国人员身份、在外学习时间、毕业回国时间和首次入境后办理期限。',
          '一般流程是准备留学证明/认证、护照出入境记录、身份证明等材料，通过指定渠道办理购车申请和海关手续。',
          '重点比较裸车价、购置税减免、车型选择、提车城市、售后和等待周期，不要只看“免税”两个字。',
          '各地海关和中介办理口径可能不同，购买前先确认当地最新要求。',
        ],
        sourceLabel: '中国海关',
        sourceUrl: 'https://www.customs.gov.cn',
      },
      {
        title: '北上广深落户',
        label: '城市选择',
        text: '一线城市落户规则差异很大，通常会看学历层次、学校排名或认可名单、年龄、社保、劳动合同、单位资质、回国时间和档案材料。',
        bullets: [
          '北京更强调单位指标、学历层次、回国时间、劳动关系和用人单位申报资格。',
          '上海通常看学历背景、境外学习时间、回国后首份工作/社保个税、单位资质和社保基数等条件。',
          '广州、深圳路径相对多一些，但也要看年龄、学历认证、社保、单位和人才引进系统要求。',
          '先选城市再选 offer：有些岗位工资不错，但单位没有落户资质或社保口径不符合，会影响后续申报。',
        ],
        sourceLabel: '各地人社/政务服务网',
        sourceUrl: 'https://www.gov.cn/fuwu/bumendifangdating.htm',
      },
      {
        title: '人才招引补助款',
        label: '补贴申请',
        text: '人才补贴常见于区级、园区、产业专项或重点企业引才政策。能不能拿，通常取决于城市、学历、年龄、社保个税、单位类型和申请窗口。',
        bullets: [
          '入职前问清公司所在区、纳税地、社保缴纳地和是否配合人才补贴申报。',
          '常见材料包括学历认证、劳动合同、社保/个税、身份证明、银行卡、人才认定或企业推荐材料。',
          '补贴经常有申请期限、连续缴纳社保月份、离职追回或分期发放规则，签 offer 前就要问。',
          '不要只看城市级政策，也要看区级、开发区、产业园和企业内部人才政策。',
        ],
        sourceLabel: '各地人社局/人才服务局',
        sourceUrl: 'https://www.gov.cn/fuwu/bumendifangdating.htm',
      },
    ],
  },
]

const getJourneyTopicBySlug = (slug: string) => journeyTopics.find((topic) => topic.slug === slug)

const getResourcePrefix = (source: ResourceLink, sourceIndex: number) => {
  if (source.kind === 'download') return '材料下载'
  if (source.kind === 'reference') return '参考'
  return sourceIndex === 0 ? '官方入口' : '官方链接'
}

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[（）()·\-_/]/g, '')

const schoolSearchAliases: Record<string, string[]> = {
  snu: ['首尔大学', '首尔大', '서울대', 'snu', 'seoulnational'],
  yonsei: ['延世大学', '延世大', '연세대', 'yonsei'],
  korea: ['高丽大学', '高丽大', '고려대', 'koreauniversity'],
  'skku-seoul': ['成均馆大学', '成均馆大', '성균관대', 'skku', 'sungkyunkwan'],
  skku: ['成均馆大学', '成均馆大', '성균관대', 'skku', 'sungkyunkwan'],
  hanyang: ['汉阳大学', '汉阳大', '한양대', 'hanyang'],
  kyunghee: ['庆熙大学', '庆熙大', '경희대', 'kyunghee'],
  sejong: ['世宗大学', '世宗大', '세종대', 'sejong'],
  cau: ['中央大学', '中央大', '中大', '중앙대', 'cau', 'chungang', 'chunganguniversity'],
  ewha: ['梨花女子大学', '梨花女大', '梨大', '이화여대', 'ewha'],
  sogang: ['西江大学', '西江大', '서강대', 'sogang'],
  konkuk: ['建国大学', '建国大', '건국대', 'konkuk'],
  dongguk: ['东国大学', '东国大', '동국대', 'dongguk'],
  hongik: ['弘益大学', '弘益大', '弘大', '홍익대', 'hongik'],
  knua: ['韩国艺术综合学校', '韩艺综', '한국예술종합학교', 'karts', 'knua'],
  kookmin: ['国民大学', '国民大', '국민대', 'kookmin'],
  sangmyung: ['祥明大学', '祥明大', '상명대', 'sangmyung'],
  dongduk: ['同德女子大学', '同德女大', '동덕여대', 'dongduk'],
  'cau-anseong': ['中央大学安城校区', '中央大安城', '中央安城', '중앙대안성', 'cauanseong'],
}

const schoolRouteAliases: Record<string, string> = {
  chungang: 'cau',
  'chung-ang': 'cau',
  sungkyunkwan: 'skku-seoul',
}

const journeySearchAliases: Record<string, string[]> = {
  admission: ['入学', '申请', '本科', '硕博', '硕士', '博士', '大学院', '语学院', '选课', '学分', '新生'],
  'student-life': ['在学', '生活', '签证', '租房', '找房', '转租', '房源', '保证金', '打工', '兼职', '保险', '银行卡', '手机卡', '医院'],
  graduation: ['毕业', '论文', '延毕', '答辩', '毕业审查', '研究注册'],
  career: ['就业', '求职', 'd10', 'd-10', '永驻', '落户', '免税车', '补贴', '回国', '认证'],
}

const searchIntentGroups: SearchIntentGroup[] = [
  {
    id: 'housing',
    aliases: ['找房', '租房', '转租', '房源', '房子', '宿舍', '住宿', '保证金', '押金', '月租', '合同', '黑石洞', '新村', '원룸', '월세', '전세'],
    postTerms: ['找房', '租房', '转租', '房源', '宿舍', '住宿', '保证金', '押金', '月租', '合同', '房东', '中介', '看房', '通勤', '黑石洞', '新村'],
    schoolTerms: ['租房', '住宿', '生活圈', '通勤', '地铁', '校区'],
  },
  {
    id: 'admission',
    aliases: ['入学', '申请', '新生', '材料', '本科', '大学院', '语学院', '作品集', '面试', '学分'],
    postTerms: ['入学', '申请', '新生', '材料', '本科', '大学院', '语学院', '作品集', '面试', '学分', '选课'],
    schoolTerms: ['申请', '入学', '作品集', '面试', '专业', '语学堂'],
  },
  {
    id: 'art',
    aliases: ['艺术类', '艺术', '美术', '设计', '传媒', '戏剧', '影视', '电影', '音乐', '舞蹈', '表演', '作品集', '动漫', '时尚'],
    postTerms: ['艺术', '艺术类', '美术', '设计', '传媒', '戏剧', '影视', '电影', '音乐', '舞蹈', '表演', '作品集', '动漫', '时尚'],
    schoolTerms: ['艺术', '美术', '设计', '传媒', '戏剧', '影视', '电影', '音乐', '舞蹈', '表演', '作品集', '动漫', '时尚'],
  },
]

const artSchoolPriority: Record<string, number> = {
  knua: 70,
  hongik: 64,
  cau: 58,
  kookmin: 52,
  sangmyung: 46,
  dongduk: 40,
  ewha: 34,
  sejong: 30,
  'cau-anseong': 28,
  kyunghee: 22,
}

const getSchoolSearchTerms = (school: SchoolProfile) => {
  const compactName = school.name.replace(/\s+/g, '')
  const shortName = compactName.replace('大学', '大')
  return [
    ...(schoolSearchAliases[school.id] ?? []),
    school.name,
    compactName,
    shortName,
    school.englishName,
    school.englishName.replace(/\s+/g, ''),
  ]
}

const getMatchedIntentGroups = (normalizedQuery: string) =>
  searchIntentGroups.filter((group) =>
    group.aliases.some((alias) => normalizedQuery.includes(normalizeSearchText(alias))),
  )

const getMatchedSchoolIds = (normalizedQuery: string) =>
  allSchoolProfiles
    .filter((school) =>
      getSchoolSearchTerms(school).some((term) => normalizedQuery.includes(normalizeSearchText(term))),
    )
    .map((school) => school.id)

const scoreSchoolForQuery = (school: SchoolProfile, normalizedQuery: string) => {
  const schoolText = normalizeSearchText(
    `${school.name}${school.englishName}${school.city}${school.landmark}${school.description}${school.programs.join('')}${school.strengths.join('')}`,
  )
  const intentGroups = getMatchedIntentGroups(normalizedQuery)
  const hasArtIntent = intentGroups.some((group) => group.id === 'art')
  let score = getSchoolSearchTerms(school).some((term) => normalizedQuery.includes(normalizeSearchText(term))) ? 80 : 0

  for (const group of intentGroups) {
    for (const term of group.schoolTerms) {
      if (schoolText.includes(normalizeSearchText(term))) score += group.id === 'art' ? 18 : 10
    }
  }

  if (hasArtIntent && school.strengths.some((strength) => normalizeSearchText(strength).includes('艺术'))) score += 20
  if (hasArtIntent && school.programs.some((program) => normalizeSearchText(program).includes('艺术'))) score += 18
  if (hasArtIntent) score += artSchoolPriority[school.id] ?? 0
  return score
}

const scorePostForQuery = (post: Post, normalizedQuery: string) => {
  if (!normalizedQuery) return 1

  const text = normalizeSearchText(
    `${post.title}${post.school}${post.category}${post.excerpt}${post.author}${post.city ?? ''}${post.country ?? ''}${post.identity ?? ''}${post.contentType ?? ''}${(
      post.tags ?? []
    ).join('')}${post.body}`,
  )
  const matchedSchoolIds = getMatchedSchoolIds(normalizedQuery)
  const matchedSchools = matchedSchoolIds
    .map((schoolId) => allSchoolProfiles.find((school) => school.id === schoolId))
    .filter((school): school is SchoolProfile => Boolean(school))
  const matchedJourneyTopics = journeyTopics.filter((topic) => {
    const aliases = journeySearchAliases[topic.slug] ?? [topic.title, topic.shortTitle]
    return aliases.some((alias) => normalizedQuery.includes(normalizeSearchText(alias)))
  })
  const intentGroups = getMatchedIntentGroups(normalizedQuery)
  let score = text.includes(normalizedQuery) ? 120 : 0

  for (const school of matchedSchools) {
    if (post.school === school.name || text.includes(normalizeSearchText(school.name))) score += 70
  }

  for (const topic of matchedJourneyTopics) {
    if (topic.categories.includes(post.category)) score += 30
    if (topic.tags.some((tag) => text.includes(normalizeSearchText(tag)))) score += 10
  }

  for (const group of intentGroups) {
    for (const term of group.postTerms) {
      if (text.includes(normalizeSearchText(term))) score += group.id === 'housing' ? 14 : 10
    }
  }

  if (matchedSchools.length && intentGroups.length) score += Math.min(score, 30)
  return score
}

const getRecommendedSchoolsForQuery = (normalizedQuery: string) =>
  allSchoolProfiles
    .map((school) => ({ school, score: scoreSchoolForQuery(school, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.school.name.localeCompare(b.school.name, 'zh-Hans-CN'))
    .map(({ school }) => school)

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
  earningPoints: user.earningPoints ?? 0,
  joinedAt: user.joinedAt ?? new Date().toISOString(),
  status: user.status ?? 'active',
  verificationStatus: user.verificationStatus ?? (user.documents?.length ? 'pending' : 'pending'),
  avatarUrl: user.avatarUrl ?? '',
  bio: user.bio ?? '',
  documents: user.documents ?? [],
})

const openCredentialDocument = (document: CredentialDocument, setMessage: (message: string) => void) => {
  if (!document.dataUrl) {
    setMessage('这份材料是旧记录，之前没有保存文件内容；请让用户重新上传后再查看。')
    return
  }
  const preview = window.open(document.dataUrl, '_blank', 'noopener,noreferrer')
  if (!preview) setMessage('浏览器拦截了预览窗口，请允许弹窗后重试。')
}

const normalizePartnerApplication = (application: Partial<PartnerApplication>): PartnerApplication => ({
  id: application.id ?? createId('partner'),
  company: application.company ?? '',
  type: normalizeBusinessCategory(application.type, application.company),
  contact: application.contact ?? '',
  phone: application.phone ?? '',
  direction: application.direction ?? '内容入驻',
  budget: application.budget ?? '',
  detail: application.detail ?? '',
  reviewNote: application.reviewNote ?? '',
  status: application.status ?? 'pending',
  createdAt: application.createdAt ?? new Date().toISOString(),
})

const initialState = (): StoredState => {
  if (typeof window === 'undefined') {
    return {
      users: [],
      posts: seedPosts,
      questions: seedQuestions,
      answers: seedAnswers,
      partnerApplications: [],
      merchantLeads: [],
      merchantBrandDecorations: defaultMerchantBrandDecorations,
      questionBounties: [],
      questionDisputes: [],
      pointOrders: [],
      withdrawalRequests: [],
      pointLedger: [],
      reports: [],
      currentUserId: null,
      unlockedPostIds: {},
      siteContent: defaultSiteContent,
    }
  }

  const saved = window.localStorage.getItem(storageKey)
  if (!saved) {
    return {
      users: [],
      posts: seedPosts,
      questions: seedQuestions,
      answers: seedAnswers,
      partnerApplications: [],
      merchantLeads: [],
      merchantBrandDecorations: defaultMerchantBrandDecorations,
      questionBounties: [],
      questionDisputes: [],
      pointOrders: [],
      withdrawalRequests: [],
      pointLedger: [],
      reports: [],
      currentUserId: null,
      unlockedPostIds: {},
      siteContent: defaultSiteContent,
    }
  }

  try {
    const parsed = JSON.parse(saved) as StoredState
    return {
      users: (parsed.users ?? []).map(normalizeUser),
      posts: mergeSeedPosts(parsed.posts),
      questions: parsed.questions?.length ? parsed.questions : seedQuestions,
      answers: parsed.answers?.length ? parsed.answers : seedAnswers,
      partnerApplications: (parsed.partnerApplications ?? []).map(normalizePartnerApplication),
      merchantLeads: parsed.merchantLeads ?? [],
      merchantBrandDecorations: mergeMerchantBrandDecorations(parsed.merchantBrandDecorations),
      questionBounties: parsed.questionBounties ?? [],
      questionDisputes: parsed.questionDisputes ?? [],
      pointOrders: parsed.pointOrders ?? [],
      withdrawalRequests: parsed.withdrawalRequests ?? [],
      pointLedger: parsed.pointLedger ?? [],
      reports: parsed.reports ?? [],
      currentUserId: parsed.currentUserId ?? null,
      unlockedPostIds: parsed.unlockedPostIds ?? {},
      siteContent: normalizeSiteContent(parsed.siteContent),
    }
  } catch {
    return {
      users: [],
      posts: seedPosts,
      questions: seedQuestions,
      answers: seedAnswers,
      partnerApplications: [],
      merchantLeads: [],
      merchantBrandDecorations: defaultMerchantBrandDecorations,
      questionBounties: [],
      questionDisputes: [],
      pointOrders: [],
      withdrawalRequests: [],
      pointLedger: [],
      reports: [],
      currentUserId: null,
      unlockedPostIds: {},
      siteContent: defaultSiteContent,
    }
  }
}

type EditableTextProps = {
  as?: 'p' | 'h1' | 'span' | 'strong'
  className?: string
  value: string
  onChange: (value: string) => void
}

type MerchantEditableTextField =
  | 'badge'
  | 'heroTitle'
  | 'intro'
  | 'contactCopy'
  | 'panelLabel'
  | 'panelTitle'
  | 'sectionOneTitle'
  | 'sectionOneText'
  | 'sectionTwoTitle'
  | 'sectionTwoText'
  | 'sectionThreeTitle'
  | 'sectionThreeText'
  | 'caseOne'
  | 'caseTwo'
  | 'showcaseArtTitle'
  | 'showcaseArtSubtitle'
  | 'titleColor'
  | 'bodyColor'
  | 'accentColor'

const EditableText = ({ as = 'span', className, value, onChange }: EditableTextProps) => {
  const Tag = as

  return (
    <Tag
      className={className ? `inline-editable ${className}` : 'inline-editable'}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(event) => {
        const nextValue = event.currentTarget.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''
        flushSync(() => onChange(nextValue))
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && as !== 'p') {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
    >
      {value}
    </Tag>
  )
}

function App() {
  const brandClickCountRef = useRef(0)
  const brandClickResetTimerRef = useRef<number | null>(null)
  const [currentPath, setCurrentPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'))
  const isAdminRoute = currentPath === '/admin'
  const isProfileRoute = currentPath === '/me'
  const isPostsRoute = currentPath === '/posts'
  const isQuestionsRoute = currentPath === '/questions'
  const isSolveRoute = currentPath === '/solve'
  const isWalletRoute = currentPath === '/wallet'
  const questionRouteId =
    typeof window !== 'undefined' ? currentPath.match(/^\/questions\/([^/]+)$/)?.[1] : undefined
  const postRouteId = typeof window !== 'undefined' ? currentPath.match(/^\/posts\/([^/]+)$/)?.[1] : undefined
  const isQuestionDetailRoute = Boolean(questionRouteId)
  const isPostDetailRoute = Boolean(postRouteId)
  const isRewardsRoute = currentPath === '/rewards'
  const isCategoriesRoute = currentPath === '/categories'
  const isAboutRoute = currentPath === '/about'
  const isHowItWorksRoute = currentPath === '/how-it-works'
  const partnerRouteSlug = typeof window !== 'undefined' ? currentPath.match(/^\/partners\/([^/]+)$/)?.[1] : undefined
  const isPartnerDetailRoute = Boolean(partnerRouteSlug)
  const policyRoute = currentPath.match(/^\/(terms|privacy|content-rules|minor-privacy)$/)?.[1] as
    | LegalPolicyRoute
    | undefined
  const topicRouteSlug = typeof window !== 'undefined' ? currentPath.match(/^\/topics\/([^/]+)$/)?.[1] : undefined
  const isTopicRoute = Boolean(topicRouteSlug)
  const isInfoRoute =
    isQuestionsRoute ||
    isSolveRoute ||
    isWalletRoute ||
    isQuestionDetailRoute ||
    isPostDetailRoute ||
    isRewardsRoute ||
    isCategoriesRoute ||
    isAboutRoute ||
    isHowItWorksRoute ||
    isPartnerDetailRoute ||
    Boolean(policyRoute) ||
    isTopicRoute
  const schoolRouteId =
    typeof window !== 'undefined'
      ? currentPath.match(/^\/schools\/([^/]+)$/)?.[1] ?? currentPath.match(/^\/school\/([^/]+)$/)?.[1]
      : undefined
  const initialAdminToken = typeof window !== 'undefined' ? window.sessionStorage.getItem(adminSessionKey) ?? '' : ''
  const [appState, setAppState] = useState<StoredState>(() => initialState())
  const currentUser = appState.users.find((user) => user.id === appState.currentUserId) ?? null
  const [selectedCategory, setSelectedCategory] = useState(allCategoryLabel)
  const [selectedPartnerType, setSelectedPartnerType] = useState(partnerShowcases[0].type)
  const [selectedPartnerMerchantIndex, setSelectedPartnerMerchantIndex] = useState(0)
  const [partnerAutoFlip, setPartnerAutoFlip] = useState(true)
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState(allCategoryLabel)
  const [questionStatusFilter, setQuestionStatusFilter] = useState<'all' | QuestionStatus>('all')
  const [questionSort, setQuestionSort] = useState<'reward' | 'views' | 'latest'>('reward')
  const [homeQuestionStart, setHomeQuestionStart] = useState(0)
  const [homeQuestionAutoScroll, setHomeQuestionAutoScroll] = useState(true)
  const [homeExperienceStart, setHomeExperienceStart] = useState(0)
  const [homeExperienceAutoScroll, setHomeExperienceAutoScroll] = useState(true)
  const [query, setQuery] = useState(() =>
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') ?? '' : '',
  )
  const [postSchoolFilter, setPostSchoolFilter] = useState('全部学校')
  const [postCityFilter, setPostCityFilter] = useState('全部城市')
  const [postFeaturedFilter, setPostFeaturedFilter] = useState<'all' | 'featured'>('all')
  const [selectedSchoolId, setSelectedSchoolId] = useState(() => getInitialSchoolId())
  const [openRegion, setOpenRegion] = useState(
    () => getParentRegion(getInitialSchoolId()) ?? schoolRegions[0].region,
  )
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishMode, setPublishMode] = useState<PublishMode | null>(null)
  const [partnerOpen, setPartnerOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(() => isAdminRoute && Boolean(initialAdminToken))
  const [adminLoginOpen, setAdminLoginOpen] = useState(() => isAdminRoute && !initialAdminToken)
  const [adminToken, setAdminToken] = useState(initialAdminToken)
  const [adminTab, setAdminTab] = useState<
    'users' | 'posts' | 'reports' | 'partners' | 'leads' | 'settlement' | 'payments' | 'content'
  >('users')
  const [leadSearch, setLeadSearch] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | MerchantLead['status']>('all')
  const [leadAssigneeFilter, setLeadAssigneeFilter] = useState('全部')
  const [contentDraft, setContentDraft] = useState<SiteContentSettings>(() => normalizeSiteContent(appState.siteContent))
  const [partnerReviewDrafts, setPartnerReviewDrafts] = useState<Record<string, PartnerApplicationReviewDraft>>({})
  const [merchantDecorationDrafts, setMerchantDecorationDrafts] = useState<Record<string, MerchantBrandDecoration>>({})
  const [merchantDecorationNotice, setMerchantDecorationNotice] = useState('')
  const [partnerShowcaseSaving, setPartnerShowcaseSaving] = useState(false)
  const [partnerShowcaseEditMode, setPartnerShowcaseEditMode] = useState(false)
  const [activePartnerShowcaseTextEditor, setActivePartnerShowcaseTextEditor] = useState<MerchantEditableTextField | null>(null)
  const [partnerShowcaseTextPopoverAnchor, setPartnerShowcaseTextPopoverAnchor] = useState<TextPopoverAnchor | null>(null)
  const [activePartnerShowcaseDesignItemId, setActivePartnerShowcaseDesignItemId] = useState<string | null>(null)
  const [merchantDesignEditMode, setMerchantDesignEditMode] = useState(false)
  const [activeMerchantTextEditor, setActiveMerchantTextEditor] = useState<MerchantEditableTextField | null>(null)
  const [merchantTextPopoverAnchor, setMerchantTextPopoverAnchor] = useState<TextPopoverAnchor | null>(null)
  const [activeMerchantMediaZone, setActiveMerchantMediaZone] = useState<'hero' | 'service' | null>(null)
  const [activeMerchantDesignItemId, setActiveMerchantDesignItemId] = useState<string | null>(null)
  const [activeMerchantStageLayerId, setActiveMerchantStageLayerId] = useState<MerchantStageLayerId | null>(null)
  const merchantImageDragRef = useRef<{
    zone: 'hero' | 'service'
    startX: number
    startY: number
    originX: number
    originY: number
    stageWidth: number
    stageHeight: number
  } | null>(null)
  const merchantDesignItemDragRef = useRef<{
    id: string
    mode: 'move' | 'resize'
    startX: number
    startY: number
    originX: number
    originY: number
    originWidth: number
    originHeight: number
    stageWidth: number
    stageHeight: number
  } | null>(null)
  const merchantTextLayerDragRef = useRef<{
    brandId: string
    field: MerchantEditableTextField
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const partnerShowcaseFileInputRef = useRef<HTMLInputElement | null>(null)
  const partnerShowcaseItemDragRef = useRef<{
    id: string
    mode: 'move' | 'resize'
    startX: number
    startY: number
    originX: number
    originY: number
    originWidth: number
    originHeight: number
    aspectRatio: number
    stageWidth: number
    stageHeight: number
  } | null>(null)
  const partnerShowcaseTextLayerDragRef = useRef<{
    brandId: string
    field: MerchantEditableTextField
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const partnerCategoryRailDragRef = useRef<{
    pointerId: number
    startX: number
    scrollLeft: number
    dragged: boolean
  } | null>(null)
  const suppressPartnerCategoryClickRef = useRef(false)
  const [partnerCategoryDragging, setPartnerCategoryDragging] = useState(false)
  const [inlineEditMode, setInlineEditMode] = useState(false)
  const [selectedAdminUserId, setSelectedAdminUserId] = useState<string | null>(null)
  const [openVerificationBubbleUserId, setOpenVerificationBubbleUserId] = useState<string | null>(null)
  const [activePost, setActivePost] = useState<Post | null>(null)
  const [reportTarget, setReportTarget] = useState<{ contentType: string; contentId: string; title: string } | null>(null)
  const [reportForm, setReportForm] = useState({ reason: '违法违规内容', description: '', contact: '' })
  const [, setMessage] = useState('')
  const [schoolPages, setSchoolPages] = useState<Record<string, number>>({})
  const [authNotice, setAuthNotice] = useState('')
  const [openJourneyDetail, setOpenJourneyDetail] = useState<{ slug?: string; title: string } | null>(null)

  const [authForm, setAuthForm] = useState({
    userType: 'student' as AuthUserType,
    studentStage: 'preparing' as StudentStage,
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    emailCode: '',
    school: '',
    businessName: '',
    businessCategory: businessCategoryOptions[0],
    country: '韩国',
    city: '',
    avatarUrl: '',
    bio: '',
    agreementAccepted: false,
  })
  const [accountRecoveryOpen, setAccountRecoveryOpen] = useState(false)
  const [accountRecoveryForm, setAccountRecoveryForm] = useState({ email: '', contact: '', description: '' })
  const [accountRecoveryNotice, setAccountRecoveryNotice] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [emailCodeSending, setEmailCodeSending] = useState(false)
  const [emailCodeCooldown, setEmailCodeCooldown] = useState(0)
  const [pointDrafts, setPointDrafts] = useState<Record<string, string>>({})
  const [earningPointDrafts, setEarningPointDrafts] = useState<Record<string, string>>({})
  const [rechargeAmount, setRechargeAmount] = useState('50')
  const [withdrawalForm, setWithdrawalForm] = useState({
    earningPoints: String(minimumCashoutPoints),
    payoutMethod: '银行账户',
    accountLabel: '',
  })
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [failedSchoolImageUrls, setFailedSchoolImageUrls] = useState<Record<string, boolean>>({})
  const [schoolHeroSlideIndex, setSchoolHeroSlideIndex] = useState(0)

  const [postForm, setPostForm] = useState({
    title: '',
    school: allSchoolProfiles[0].name,
    category: '签证/滞留资格',
    skillCategory: skillServiceCategories[0],
    serviceArea: '',
    availability: '',
    excerpt: '',
    body: '',
    price: '0',
  })
  const [askQuestionOpen, setAskQuestionOpen] = useState(false)
  const [questionForm, setQuestionForm] = useState({
    title: '',
    category: '签证/滞留资格',
    country: '韩国',
    city: '首尔',
    school: allSchoolProfiles[0].name,
    rewardPoints: '0',
    detail: '',
  })
  const [answerForm, setAnswerForm] = useState({ content: '' })
  const [partnerForm, setPartnerForm] = useState({
    company: '',
    type: '留学咨询',
    contact: '',
    phone: '',
    direction: '内容入驻',
    budget: '',
    detail: '',
  })

  const resetPostForm = () =>
    setPostForm({
      title: '',
      school: allSchoolProfiles[0].name,
      category: '签证/滞留资格',
      skillCategory: skillServiceCategories[0],
      serviceArea: '',
      availability: '',
      excerpt: '',
      body: '',
      price: '0',
    })

  const openPublishModal = (mode: PublishMode | null = null) => {
    setPublishMode(mode)
    setPublishOpen(true)
  }

  const closePublishModal = () => {
    setPublishOpen(false)
    setPublishMode(null)
  }
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

  const handleMerchantStudioMediaInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = Array.from(event.target.files ?? []).find((item) => item.type.startsWith('image/') || item.type.startsWith('video/'))
    event.target.value = ''
    if (!file) return
    if (activeMerchantDesignItem) {
      try {
        const mediaUrl = file.type.startsWith('video/')
          ? await readVideoFileToDataUrl(file)
          : await resizeImageFileToDataUrl(file, 1100, 0.86)
        updateMerchantDesignItem(activeMerchantDesignItem.id, {
          kind: 'media',
          mediaUrl,
          mediaKind: file.type.startsWith('video/') ? 'video' : 'image',
          background: 'transparent',
        })
        setActiveMerchantDesignItemId(activeMerchantDesignItem.id)
        setActiveMerchantStageLayerId(`design:${activeMerchantDesignItem.id}`)
        setMerchantDecorationNotice('素材已放入选中框，可拖动、缩放，保存后展示。')
      } catch (error) {
        setMerchantDecorationNotice(error instanceof Error ? error.message : '素材上传失败，请换一个文件重试。')
      }
      return
    }
    await updateMerchantDecorationImage(activeMerchantMediaZone ?? 'service', file)
  }

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(appState))
  }, [appState])

  useEffect(() => {
    fetch('/api/site-content')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { siteContent?: Partial<SiteContentSettings> } | null) => {
        if (!data?.siteContent) return
        const nextContent = normalizeSiteContent(data.siteContent)
        setAppState((state) => ({ ...state, siteContent: nextContent }))
        setContentDraft(nextContent)
      })
      .catch(() => {
        // Local saved content keeps the page editable when the API is unavailable.
      })
  }, [])

  useEffect(() => {
    fetch('/api/merchant-brand-decorations')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { merchantBrandDecorations?: Partial<MerchantBrandDecoration>[] } | null) => {
        if (!data?.merchantBrandDecorations) return
        const nextDecorations = mergeMerchantBrandDecorations(data.merchantBrandDecorations)
        setAppState((state) => ({ ...state, merchantBrandDecorations: nextDecorations }))
      })
      .catch(() => {
        // Default brand decorations keep merchant pages usable when the API is unavailable.
      })
  }, [])

  useEffect(() => {
    if (!appState.currentUserId) return
    let ignore = false
    fetch(`/api/users/${encodeURIComponent(appState.currentUserId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { user?: Partial<User> } | null) => {
        if (ignore || !data?.user) return
        const freshUser = normalizeUser(data.user)
        setAppState((state) => ({
          ...state,
          users: state.users.some((user) => user.id === freshUser.id)
            ? state.users.map((user) => (user.id === freshUser.id ? { ...user, ...freshUser } : user))
            : [...state.users, freshUser],
          currentUserId: state.currentUserId === freshUser.id ? state.currentUserId : state.currentUserId,
        }))
      })
      .catch(() => {
        // Keep the saved local user when the API is temporarily unavailable.
      })
    return () => {
      ignore = true
    }
  }, [appState.currentUserId])

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
    if (typeof document === 'undefined') return

    const defaultTitle = '留学生首页 - 留学生经验分享与问题解决平台'
    const defaultDescription =
      '留学生首页是一个面向留学生的经验分享与问答社区，提供签证、租房、入学、打工、保险、银行卡、毕业和就业等真实经验，帮助留学生少走弯路。'
    const routeSlug =
      currentPath.match(/^\/schools\/([^/]+)$/)?.[1] ?? currentPath.match(/^\/school\/([^/]+)$/)?.[1] ?? ''
    const currentSchoolTopic = routeSlug ? getSchoolTopicForSlug(decodeURIComponent(routeSlug)) : undefined
    const currentJourneyTopic = currentPath.match(/^\/topics\/([^/]+)$/)?.[1]
      ? getJourneyTopicBySlug(decodeURIComponent(currentPath.match(/^\/topics\/([^/]+)$/)?.[1] ?? ''))
      : undefined

    document.title = currentSchoolTopic?.seoTitle ?? (currentJourneyTopic ? `${currentJourneyTopic.title} - 留学生首页` : defaultTitle)
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', currentSchoolTopic?.seoDescription ?? currentJourneyTopic?.heroCopy ?? defaultDescription)
  }, [currentPath])

  useEffect(() => {
    fetch('/api/posts')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { posts?: Post[] } | null) => {
        if (data?.posts?.length) {
          setAppState((state) => {
            const remotePosts = data.posts ?? []
            const seedIds = new Set(seedPosts.map((post) => post.id))
            const mergedRemotePosts = remotePosts.filter((post) => !seedIds.has(post.id))
            return { ...state, posts: [...seedPosts, ...mergedRemotePosts] }
          })
        }
      })
      .catch(() => {
        // Keep the local demo data when the Cloudflare API is not bound yet.
      })
  }, [])

  useEffect(() => {
    fetch('/api/questions')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { questions?: CommunityQuestion[]; answers?: QuestionAnswer[] } | null) => {
        if (!data?.questions) return
        setAppState((state) => {
          const seedQuestionIds = new Set(seedQuestions.map((question) => question.id))
          const seedAnswerIds = new Set(seedAnswers.map((answer) => answer.id))
          const remoteQuestions = data.questions?.filter((question) => !seedQuestionIds.has(question.id)) ?? []
          const remoteAnswers = data.answers?.filter((answer) => !seedAnswerIds.has(answer.id)) ?? []
          return {
            ...state,
            questions: [...seedQuestions, ...remoteQuestions],
            answers: [...seedAnswers, ...remoteAnswers],
          }
        })
      })
      .catch(() => {
        // Keep the local question bank when the API is unavailable.
      })
  }, [])

  const selectedAdminUser = appState.users.find((user) => user.id === selectedAdminUserId) ?? null
  const selectedAdminUserBioSettings = parseUserBioSettings(selectedAdminUser?.bio)
  const leadAssignees = ['全部', ...Array.from(new Set(appState.merchantLeads.map((lead) => lead.assignedTo).filter(Boolean)))]
  const filteredMerchantLeads = appState.merchantLeads.filter((lead) => {
    const normalizedLeadSearch = leadSearch.trim().toLowerCase()
    const searchable = `${lead.merchantTitle} ${lead.merchantType} ${lead.userName} ${lead.userContact} ${lead.note} ${lead.assignedTo} ${lead.adminNote}`.toLowerCase()
    const matchesSearch = !normalizedLeadSearch || searchable.includes(normalizedLeadSearch)
    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter
    const matchesAssignee = leadAssigneeFilter === '全部' || lead.assignedTo === leadAssigneeFilter
    return matchesSearch && matchesStatus && matchesAssignee
  })
  const currentUserPointOrders = currentUser
    ? appState.pointOrders.filter((order) => order.userId === currentUser.id).slice(0, 5)
    : []
  const currentUserWithdrawals = currentUser
    ? appState.withdrawalRequests.filter((withdrawal) => withdrawal.userId === currentUser.id).slice(0, 5)
    : []
  const currentUnlocks = currentUser ? appState.unlockedPostIds[currentUser.id] ?? [] : []
  const decodedSchoolRouteId = schoolRouteId ? decodeURIComponent(schoolRouteId) : ''
  const resolvedSchoolRouteId = decodedSchoolRouteId
    ? schoolRouteAliases[decodedSchoolRouteId] ?? decodedSchoolRouteId
    : ''
  const schoolTopic = resolvedSchoolRouteId ? getSchoolTopicForSlug(resolvedSchoolRouteId) : undefined
  const routeSchool = resolvedSchoolRouteId
    ? allSchoolProfiles.find((school) => school.id === resolvedSchoolRouteId)
    : null
  const selectedSchool =
    routeSchool ?? allSchoolProfiles.find((school) => school.id === selectedSchoolId) ?? allSchoolProfiles[0]
  const approvedPartnerApplications = appState.partnerApplications.filter(
    (application) => application.status === 'approved' && application.company.trim(),
  )
  const merchantLevelByBrandId = new Map(
    appState.users
      .map((user) => parseUserBioSettings(user.bio))
      .filter((settings) => settings.managedBrandId)
      .map((settings) => [settings.managedBrandId!, settings.managedBrandLevel ?? 'normal'] as const),
  )
  const getPartnerMerchantSlug = (merchant: PartnerMerchant) =>
    'id' in merchant && merchant.id ? merchant.id : encodeURIComponent(merchant.name)
  const sortPartnerMerchants = (merchants: PartnerMerchant[]) =>
    [...merchants].sort((first, second) => {
      const firstPinned = first.level === 'pinned' ? 1 : 0
      const secondPinned = second.level === 'pinned' ? 1 : 0
      return secondPinned - firstPinned
    })
  const partnerShowcasesWithApproved = approvedPartnerApplications.reduce<PartnerShowcase[]>(
    (showcases, application) => {
      const brandId = `partner-${application.id.replace(/[^a-zA-Z0-9_-]/g, '') || encodeURIComponent(application.company)}`
      const merchantLevel = merchantLevelByBrandId.get(brandId) ?? 'normal'
      const showcaseType = normalizeBusinessCategory(application.type, application.company)
      const merchant: PartnerMerchant = {
        id: brandId,
        name: application.company.trim(),
        logo: application.company.trim().slice(0, 3) || '商家',
        summary: application.direction || `${showcaseType}服务展示`,
        description:
          application.detail ||
          `${application.company.trim()}已通过售业合作审核，可展示服务范围、联系方式、优惠和咨询边界。`,
        tags: [
          showcaseType,
          application.direction || '合作商家',
          merchantLevel === 'pinned' ? '置顶商家' : application.budget || '已审核',
        ].filter(Boolean),
        verified: true,
        location: '认证商家',
        detailTone: `${showcaseType}服务展示`,
        level: merchantLevel,
      }
      const index = showcases.findIndex((showcase) => showcase.type === showcaseType)
      if (index >= 0) {
        if (showcases[index].merchants.some((entry) => getPartnerMerchantSlug(entry) === brandId)) {
          return showcases
        }
        return showcases.map((showcase, showcaseIndex) =>
          showcaseIndex === index ? { ...showcase, merchants: sortPartnerMerchants([...showcase.merchants, merchant]) } : showcase,
        )
      }
      return [
        ...showcases,
        {
          type: showcaseType,
          audience: application.direction || '已审核合作商家',
          tone: 'consulting',
          merchants: [merchant],
        },
      ]
    },
    partnerShowcases.map((showcase) => ({
      ...showcase,
      merchants: sortPartnerMerchants(
        showcase.merchants.map((merchant) => ({
          ...merchant,
          level: merchantLevelByBrandId.get(getPartnerMerchantSlug(merchant)) ?? merchant.level ?? 'normal',
        })),
      ),
    })),
  )
  const partnerMerchantEntries = partnerShowcasesWithApproved.flatMap((showcase) =>
    showcase.merchants.map((merchant) => ({
      showcase,
      merchant,
      slug: getPartnerMerchantSlug(merchant),
    })),
  )
  const manageablePartnerBrands = partnerMerchantEntries.map((entry) => ({
    id: entry.slug,
    name: entry.merchant.name,
    type: entry.showcase.type,
  }))
  const selectedPartnerShowcase =
    partnerShowcasesWithApproved.find((partner) => partner.type === selectedPartnerType) ?? partnerShowcasesWithApproved[0]
  const selectedPartnerMerchantCount = selectedPartnerShowcase.merchants.length
  const activePartnerMerchantIndex = selectedPartnerMerchantCount
    ? ((selectedPartnerMerchantIndex % selectedPartnerMerchantCount) + selectedPartnerMerchantCount) % selectedPartnerMerchantCount
    : 0
  const activePartnerMerchant =
    selectedPartnerShowcase.merchants[activePartnerMerchantIndex] ??
    selectedPartnerShowcase.merchants[0]
  const activePartnerMerchantSlug =
    'id' in activePartnerMerchant && activePartnerMerchant.id
      ? activePartnerMerchant.id
      : encodeURIComponent(activePartnerMerchant.name)
  const activePartnerAutoFlipDelay = activePartnerMerchant?.level === 'pinned' ? 10000 : 5000

  useEffect(() => {
    if (!partnerAutoFlip || partnerShowcaseEditMode || selectedPartnerMerchantCount < 2) return
    const timer = window.setTimeout(() => {
      setSelectedPartnerMerchantIndex((index) => (index + 1) % selectedPartnerMerchantCount)
    }, activePartnerAutoFlipDelay)
    return () => window.clearTimeout(timer)
  }, [
    activePartnerAutoFlipDelay,
    partnerAutoFlip,
    partnerShowcaseEditMode,
    selectedPartnerMerchantCount,
    selectedPartnerMerchantIndex,
  ])

  const activePartnerMerchantDecoration = appState.merchantBrandDecorations.find(
    (decoration) => decoration.brandId === activePartnerMerchantSlug,
  )
  const activePartnerMerchantDecorationDraft =
    merchantDecorationDrafts[activePartnerMerchantSlug] ??
    activePartnerMerchantDecoration ??
    normalizeMerchantBrandDecoration({
      brandId: activePartnerMerchantSlug,
      badge: '认证商家展示页',
      heroTitle: activePartnerMerchant.summary,
      intro: activePartnerMerchant.description,
      contactCopy: '联系前请先确认服务范围、价格区间、交付方式和售后规则。',
      caseOne: activePartnerMerchant.tags[0]
        ? `${activePartnerMerchant.tags[0]}：展示服务范围、交付方式和适合人群。`
        : '服务范围：展示商家能提供的具体帮助和边界。',
      caseTwo: activePartnerMerchant.tags[1]
        ? `${activePartnerMerchant.tags[1]}：展示咨询前需要准备的信息。`
        : '咨询准备：整理需求、预算、时间节点和联系方式。',
      showcaseArtTitle: selectedPartnerShowcase.type === '留学咨询' ? '留学' : activePartnerMerchant.logo,
      showcaseArtSubtitle: '开启世界视野 · 成就未来可能',
    })
  const showcaseUserBioSettings = parseUserBioSettings(currentUser?.bio)
  const canManageActivePartnerMerchant =
    Boolean(currentUser) &&
    currentUser?.status === 'active' &&
    currentUser?.verificationStatus === 'approved' &&
    showcaseUserBioSettings.managedBrandId === activePartnerMerchantSlug
  const activePartnerMerchantPreviewDecoration =
    canManageActivePartnerMerchant && partnerShowcaseEditMode
      ? activePartnerMerchantDecorationDraft
      : activePartnerMerchantDecoration
  const activePartnerShowcaseBadge =
    activePartnerMerchantPreviewDecoration?.badge ??
    (activePartnerMerchant.name === '瓦剌留学' ? 'WALA STUDY · 留学生服务展示' : 'SHOUYE PARTNER · 商家广告展示')
  const activePartnerShowcaseTitle = activePartnerMerchantPreviewDecoration?.heroTitle ?? activePartnerMerchant.summary
  const activePartnerShowcaseDescription = activePartnerMerchantPreviewDecoration?.intro ?? activePartnerMerchant.description
  const activePartnerShowcaseArtTitle =
    activePartnerMerchantPreviewDecoration?.showcaseArtTitle ||
    (selectedPartnerShowcase.type === '留学咨询' ? '留学' : activePartnerMerchant.logo)
  const activePartnerShowcaseArtSubtitle =
    activePartnerMerchantPreviewDecoration?.showcaseArtSubtitle || '开启世界视野 · 成就未来可能'
  const activePartnerShowcaseFontStyle: CSSProperties = activePartnerMerchantPreviewDecoration?.fontFamily
    ? { fontFamily: activePartnerMerchantPreviewDecoration.fontFamily }
    : {}
  const activePartnerShowcaseTitleStyle: CSSProperties = {
    ...activePartnerShowcaseFontStyle,
    ...(activePartnerMerchantPreviewDecoration?.titleColor ? { color: activePartnerMerchantPreviewDecoration.titleColor } : {}),
  }
  const activePartnerShowcaseBodyStyle: CSSProperties = {
    ...activePartnerShowcaseFontStyle,
    ...(activePartnerMerchantPreviewDecoration?.bodyColor ? { color: activePartnerMerchantPreviewDecoration.bodyColor } : {}),
  }
  const activePartnerShowcaseAccentStyle: CSSProperties = {
    ...activePartnerShowcaseFontStyle,
    ...(activePartnerMerchantPreviewDecoration?.accentColor ? { color: activePartnerMerchantPreviewDecoration.accentColor } : {}),
  }
  const activePartnerMerchantApprovedLogoImage =
    activePartnerMerchantDecoration?.logoReviewStatus === 'approved' ? activePartnerMerchantDecoration.logoImage : ''
  const decodedPartnerRouteSlug = partnerRouteSlug ? decodeURIComponent(partnerRouteSlug) : ''
  const activePartnerDetail =
    partnerMerchantEntries.find(
      (entry) =>
        entry.slug === decodedPartnerRouteSlug ||
        entry.merchant.name === decodedPartnerRouteSlug ||
        encodeURIComponent(entry.merchant.name) === partnerRouteSlug,
    ) ?? partnerMerchantEntries[0]
  const activePartnerMerchantLogoImage =
    activePartnerMerchantSlug === 'tuzhuren-thesis'
      ? getPartnerLogoImage(activePartnerMerchant) || activePartnerMerchantApprovedLogoImage
      : activePartnerMerchantApprovedLogoImage || getPartnerLogoImage(activePartnerMerchant)
  const selectedSchoolGallery = schoolCampusImages(selectedSchool.id)
  const selectedSchoolGalleryKey = selectedSchoolGallery.join('|')
  const selectedSchoolBaseHeroImage = selectedSchoolGallery[0] ?? selectedSchool.image
  const activeSchoolHeroImage = selectedSchoolGallery[schoolHeroSlideIndex % selectedSchoolGallery.length] ?? selectedSchoolBaseHeroImage
  const schoolTopicBaseHeroImage = selectedSchoolBaseHeroImage
  const resolveSchoolImage = (imageUrl: string) => (failedSchoolImageUrls[imageUrl] ? heroImage : imageUrl)
  const markSchoolImageFailed = useCallback((imageUrl: string) => {
    if (!imageUrl || imageUrl === heroImage || failedSchoolImageUrls[imageUrl]) return
    setFailedSchoolImageUrls((failedUrls) => ({ ...failedUrls, [imageUrl]: true }))
  }, [failedSchoolImageUrls])
  const schoolTopicHeroImage = resolveSchoolImage(activeSchoolHeroImage)
  const selectedSchoolHeroImage = resolveSchoolImage(activeSchoolHeroImage)
  const selectedCampusLinks = getCampusLinks(selectedSchool)
  const normalizedAuthEmail = authForm.email.trim().toLowerCase()
  const isEmailCodeVerified =
    authMode === 'register' &&
    Boolean(pendingEmail) &&
    pendingEmail === normalizedAuthEmail &&
    authForm.emailCode.trim().length === 6
  const canSendEmailCode =
    authMode === 'register' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedAuthEmail) &&
    !emailCodeSending &&
    emailCodeCooldown === 0

  useEffect(() => {
    if (emailCodeCooldown <= 0) return
    const timer = window.setTimeout(() => setEmailCodeCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [emailCodeCooldown])

  useEffect(() => {
    if (selectedSchoolGallery.length <= 1) return
    const timer = window.setInterval(() => {
      setSchoolHeroSlideIndex((index) => (index + 1) % selectedSchoolGallery.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [selectedSchoolGallery.length, selectedSchoolGalleryKey])

  useEffect(() => {
    const galleryImages = selectedSchoolGalleryKey ? selectedSchoolGalleryKey.split('|') : []
    const urls = [...new Set([selectedSchoolBaseHeroImage, schoolTopicBaseHeroImage, ...galleryImages])]

    urls.forEach((imageUrl) => {
      if (!imageUrl || imageUrl === heroImage || failedSchoolImageUrls[imageUrl]) return

      const image = new Image()
      image.onerror = () => markSchoolImageFailed(imageUrl)
      image.src = imageUrl
    })
  }, [failedSchoolImageUrls, markSchoolImageFailed, schoolTopicBaseHeroImage, selectedSchoolBaseHeroImage, selectedSchoolGalleryKey])

  const activePolicyPage = policyRoute ? legalPolicyPages[policyRoute] : undefined

  const filteredPosts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query)
    return appState.posts
      .map((post) => ({ post, searchScore: scorePostForQuery(post, normalizedQuery) }))
      .filter(({ post, searchScore }) => {
        const matchesCategory = selectedCategory === allCategoryLabel || post.category === selectedCategory
        const matchesSchool = postSchoolFilter === '全部学校' || post.school === postSchoolFilter
        const matchesCity = postCityFilter === '全部城市' || post.city === postCityFilter
        const matchesFeatured = postFeaturedFilter === 'all' || post.featured
        const matchesQuery = !normalizedQuery || searchScore > 0
        return matchesCategory && matchesSchool && matchesCity && matchesFeatured && matchesQuery
      })
      .sort((a, b) => b.searchScore - a.searchScore || (b.post.views ?? 0) - (a.post.views ?? 0))
      .map(({ post }) => post)
  }, [appState.posts, postCityFilter, postFeaturedFilter, postSchoolFilter, selectedCategory, query])
  const postCityOptions = useMemo(
    () => ['全部城市', ...Array.from(new Set(appState.posts.map((post) => post.city).filter(Boolean)))],
    [appState.posts],
  )
  const hotQuestions = useMemo(
    () => [...appState.questions].sort((a, b) => b.rewardPoints - a.rewardPoints || b.views - a.views),
    [appState.questions],
  )
  const homeQuestionCards = useMemo(() => {
    if (!hotQuestions.length) return []
    const visibleCount = Math.min(5, hotQuestions.length)
    return Array.from({ length: visibleCount }, (_, index) => hotQuestions[(homeQuestionStart + index) % hotQuestions.length])
  }, [homeQuestionStart, hotQuestions])
  const homeExperienceCards = useMemo(() => {
    if (!featuredExperiences.length) return []
    const visibleCount = Math.min(5, featuredExperiences.length)
    return Array.from(
      { length: visibleCount },
      (_, index) => featuredExperiences[(homeExperienceStart + index) % featuredExperiences.length],
    )
  }, [homeExperienceStart])

  useEffect(() => {
    if (!homeQuestionAutoScroll || hotQuestions.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setHomeQuestionStart((start) => (start + 1) % hotQuestions.length)
    }, 3200)

    return () => window.clearInterval(timer)
  }, [homeQuestionAutoScroll, hotQuestions.length])

  useEffect(() => {
    if (!homeExperienceAutoScroll || featuredExperiences.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setHomeExperienceStart((start) => (start + 1) % featuredExperiences.length)
    }, 3400)

    return () => window.clearInterval(timer)
  }, [homeExperienceAutoScroll])

  const moveHomeQuestionCarousel = (direction: -1 | 1) => {
    if (!hotQuestions.length) return
    setHomeQuestionAutoScroll(false)
    setHomeQuestionStart((start) => (start + direction + hotQuestions.length) % hotQuestions.length)
  }

  const moveHomeExperienceCarousel = (direction: -1 | 1) => {
    if (!featuredExperiences.length) return
    setHomeExperienceAutoScroll(false)
    setHomeExperienceStart((start) => (start + direction + featuredExperiences.length) % featuredExperiences.length)
  }

  const solveBountyItems = useMemo(() => {
    const questionBounties = appState.questions
      .filter((question) => question.rewardPoints > 0 && question.status === 'open')
      .map((question) => ({
        id: question.id,
        type: '线上悬赏问答',
        title: question.title,
        category: question.category,
        school: question.school,
        city: question.city,
        detail: question.detail,
        tags: question.tags,
        points: question.rewardPoints,
        earningPoints: question.rewardPoints,
        meta: `${question.answersCount} 个回答 · ${question.views} 浏览`,
        cta: '去回答',
        onClick: () => navigateToPath(`/questions/${question.id}`),
      }))

    const offlineBounties = offlineBountyTasks
      .filter((task) => task.status === 'open')
      .map((task) => ({
        id: task.id,
        type: '线下悬赏任务',
        title: task.title,
        category: task.category,
        school: task.school,
        city: task.city,
        detail: task.detail,
        tags: task.tags,
        earningPoints: Math.round(task.amountYuan * cashoutPointsPerYuan),
        meta: `截止 ${task.deadline}`,
        cta: '联系接单',
        onClick: () => setAuthMode(currentUser ? null : 'login'),
      }))

    return [...questionBounties, ...offlineBounties].sort((a, b) => b.earningPoints - a.earningPoints)
  }, [appState.questions, currentUser])
  const filteredQuestions = useMemo(() => {
    const questions = appState.questions.filter((question) => {
      const matchesCategory = questionCategoryFilter === allCategoryLabel || question.category === questionCategoryFilter
      const matchesStatus = questionStatusFilter === 'all' || question.status === questionStatusFilter
      return matchesCategory && matchesStatus
    })

    return [...questions].sort((a, b) => {
      if (questionSort === 'views') return b.views - a.views
      if (questionSort === 'latest') return b.createdAt.localeCompare(a.createdAt)
      return b.rewardPoints - a.rewardPoints
    })
  }, [appState.questions, questionCategoryFilter, questionSort, questionStatusFilter])
  const selectedQuestion = questionRouteId
    ? appState.questions.find((question) => question.id === decodeURIComponent(questionRouteId))
    : undefined
  const selectedQuestionAnswers = selectedQuestion
    ? appState.answers
        .filter((answer) => answer.questionId === selectedQuestion.id)
        .sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.likes - a.likes)
    : []
  const selectedQuestionResources = selectedQuestion ? questionResourceLinks[selectedQuestion.id] ?? [] : []
  const selectedPost = postRouteId
    ? appState.posts.find((post) => post.id === decodeURIComponent(postRouteId)) ??
      seedPosts.find((post) => post.id === decodeURIComponent(postRouteId))
    : undefined
  const selectedJourneyTopic = topicRouteSlug ? getJourneyTopicBySlug(decodeURIComponent(topicRouteSlug)) : undefined
  const selectedJourneyHighlights = selectedJourneyTopic
    ? selectedJourneyTopic.steps.map((step) => `${step.title}：${step.text}`)
    : []
  const openSchoolProfileFromSuggestion = (school: SchoolProfile) => {
    const parentRegion = schoolRegions.find((group) =>
      group.schools.some((item) => item.id === school.id),
    )
    setSelectedSchoolId(school.id)
    setOpenRegion(parentRegion?.region ?? school.region)
    setSchoolHeroSlideIndex(0)
    window.history.pushState(null, '', `/#school-${school.id}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
    window.setTimeout(() => {
      document.getElementById('school-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }
  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const normalizedQuery = normalizeSearchText(query)
    if (!normalizedQuery) return []

    const suggestions: SearchSuggestion[] = []
    const matchedSchools = allSchoolProfiles.filter((school) => {
      return getSchoolSearchTerms(school).some((term) => normalizedQuery.includes(normalizeSearchText(term)))
    })
    const schoolRecommendations = matchedSchools.length
      ? matchedSchools
      : getRecommendedSchoolsForQuery(normalizedQuery).slice(0, 6)
    const matchedTopics = journeyTopics.filter((topic) => {
      const aliases = journeySearchAliases[topic.slug] ?? [topic.title, topic.shortTitle]
      return aliases.some((alias) => normalizedQuery.includes(normalizeSearchText(alias)))
    })
    const relatedPosts = appState.posts
      .map((post) => ({ post, score: scorePostForQuery(post, normalizedQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || (b.post.views ?? 0) - (a.post.views ?? 0))
      .slice(0, 3)
      .map(({ post }) => post)

    for (const school of schoolRecommendations.slice(0, 5)) {
      const topic = matchedTopics[0]
      const schoolFocus = [...school.programs, ...school.strengths].slice(0, 4).join('、')
      suggestions.push({
        label: matchedSchools.includes(school) ? '学校专题' : '学校推荐',
        title: topic ? `${school.name} · ${topic.shortTitle}` : `${school.name}专题页`,
        description: topic
          ? `已识别到你在找${school.name}的${topic.summary}，先进入学校页看校区、专业和学校相关入口。`
          : `${schoolFocus || school.description}，先进入${school.name}学校页看入学、租房、签证、选课和生活经验。`,
        actionText: `进入${school.name}学校页`,
        onClick: () => openSchoolProfileFromSuggestion(school),
      })
    }

    if (!schoolRecommendations.length) {
      for (const topic of matchedTopics.slice(0, 2)) {
        suggestions.push({
          label: '专项入口',
          title: topic.title,
          description: `这里集中整理${topic.summary}，适合先看阶段攻略，再回到帖子页找具体经验。`,
          actionText: `查看${topic.shortTitle}`,
          onClick: () => navigateToPath(`/topics/${topic.slug}`),
        })
      }
    }

    for (const post of relatedPosts) {
      if (!suggestions.some((suggestion) => suggestion.title === post.title)) {
        suggestions.push({
          label: '相关帖子',
          title: post.title,
          description: `${post.school} · ${post.category} · ${post.excerpt}`,
          actionText: '查看帖子',
          onClick: () => navigateToPath(`/posts/${post.id}`),
        })
      }
    }

    return suggestions
  }, [appState.posts, query])
  const siteContent = normalizeSiteContent(appState.siteContent)
  const activeSiteContent = inlineEditMode ? contentDraft : siteContent
  const activePartnerDetailSlug = activePartnerDetail.slug ?? encodeURIComponent(activePartnerDetail.merchant.name)
  const isWalaPartnerDetail = activePartnerDetailSlug === 'wala-study'
  const activeMerchantDecoration = appState.merchantBrandDecorations.find(
    (decoration) => decoration.brandId === activePartnerDetailSlug,
  )
  const activeMerchantApprovedLogoImage =
    activeMerchantDecoration?.logoReviewStatus === 'approved' ? activeMerchantDecoration.logoImage : ''
  const activePartnerDetailLogoImage =
    activePartnerDetailSlug === 'tuzhuren-thesis'
      ? getPartnerLogoImage(activePartnerDetail.merchant) || activeMerchantApprovedLogoImage
      : activeMerchantApprovedLogoImage || getPartnerLogoImage(activePartnerDetail.merchant)
  const currentUserBioSettings = parseUserBioSettings(currentUser?.bio)
  const canManageActivePartnerBrand =
    Boolean(currentUser) &&
    currentUser?.status === 'active' &&
    currentUser?.verificationStatus === 'approved' &&
    currentUserBioSettings.managedBrandId === activePartnerDetailSlug
  const activeMerchantDecorationDraft =
    merchantDecorationDrafts[activePartnerDetailSlug] ??
    activeMerchantDecoration ??
    normalizeMerchantBrandDecoration(
      {
        brandId: activePartnerDetailSlug,
        badge: '认证商家展示页',
        heroTitle: activePartnerDetail.merchant.summary,
        intro: activePartnerDetail.merchant.description,
        contactCopy: '联系前请先确认服务范围、价格区间、交付方式和售后规则。',
        panelLabel:
          'detailTone' in activePartnerDetail.merchant
            ? activePartnerDetail.merchant.detailTone
            : `${activePartnerDetail.showcase.type}服务展示`,
        panelTitle: activePartnerDetail.merchant.tags.join(' · '),
        sectionOneTitle: '服务说明',
        sectionOneText: activePartnerDetail.merchant.description,
        sectionTwoTitle: '对比建议',
        sectionTwoText: '建议先比较服务范围、价格区间、交付方式、售后规则和真实评价，再决定是否咨询或下单。',
        sectionThreeTitle: '平台提醒',
        sectionThreeText: '商家展示页用于信息对比，不代表平台担保服务结果；线下交易、付款和售后由用户与商家自行确认。',
        caseOne: activePartnerDetail.merchant.tags[0]
          ? `${activePartnerDetail.merchant.tags[0]}：展示服务范围、交付方式和适合人群。`
          : '服务范围：展示商家能提供的具体帮助和边界。',
        caseTwo: activePartnerDetail.merchant.tags[1]
          ? `${activePartnerDetail.merchant.tags[1]}：展示咨询前需要准备的信息。`
          : '咨询准备：整理需求、预算、时间节点和联系方式。',
      },
    )
  const activeMerchantPreviewDecoration =
    canManageActivePartnerBrand && merchantDesignEditMode ? activeMerchantDecorationDraft : activeMerchantDecoration
  const activeMerchantDesignItem = activeMerchantDecorationDraft.designItems.find((item) => item.id === activeMerchantDesignItemId) ?? null
  const selectMerchantTextLayer = (field: MerchantEditableTextField, openEditor = false) => {
    setActiveMerchantStageLayerId(`text:${field}`)
    setActiveMerchantDesignItemId(null)
    setActiveMerchantMediaZone(null)
    if (openEditor) setActiveMerchantTextEditor(field)
  }
  const selectMerchantMediaLayer = (zone: 'hero' | 'service') => {
    setActiveMerchantStageLayerId(`media:${zone}`)
    setActiveMerchantDesignItemId(null)
    setActiveMerchantTextEditor(null)
    setActiveMerchantMediaZone(zone)
  }
  const selectMerchantDesignLayer = (itemId: string) => {
    setActiveMerchantStageLayerId(`design:${itemId}`)
    setActiveMerchantTextEditor(null)
    setActiveMerchantMediaZone(null)
    setActiveMerchantDesignItemId(itemId)
  }
  const fallbackPartnerDetailSections = [
    {
      title: '服务说明',
      text: activePartnerDetail.merchant.description,
    },
    {
      title: '对比建议',
      text: '建议先比较服务范围、价格区间、交付方式、售后规则和真实评价，再决定是否咨询或下单。',
    },
    {
      title: '平台提醒',
      text: '商家展示页用于信息对比，不代表平台担保服务结果；线下交易、付款和售后由用户与商家自行确认。',
    },
  ]
  const partnerDetailSections =
    !isWalaPartnerDetail && activeMerchantPreviewDecoration
      ? [
          { title: activeMerchantPreviewDecoration.sectionOneTitle, text: activeMerchantPreviewDecoration.sectionOneText },
          { title: activeMerchantPreviewDecoration.sectionTwoTitle, text: activeMerchantPreviewDecoration.sectionTwoText },
          { title: activeMerchantPreviewDecoration.sectionThreeTitle, text: activeMerchantPreviewDecoration.sectionThreeText },
        ]
      : 'detailSections' in activePartnerDetail.merchant
      ? activePartnerDetail.merchant.detailSections ?? fallbackPartnerDetailSections
      : fallbackPartnerDetailSections
  const partnerDetailHeroTitle = isWalaPartnerDetail
    ? activeSiteContent.merchantWalaHeroTitle
    : activeMerchantPreviewDecoration?.heroTitle ?? activePartnerDetail.merchant.summary
  const partnerDetailIntro = isWalaPartnerDetail
    ? activeSiteContent.merchantWalaIntro
    : activeMerchantPreviewDecoration?.intro ?? activePartnerDetail.merchant.description
  const partnerDetailBadge = isWalaPartnerDetail
    ? activeSiteContent.merchantWalaBadge
    : activeMerchantPreviewDecoration?.badge ?? '认证商家展示页'
  const partnerDetailCases = isWalaPartnerDetail
    ? [activeSiteContent.merchantWalaCaseOne, activeSiteContent.merchantWalaCaseTwo]
    : activeMerchantPreviewDecoration
      ? [activeMerchantPreviewDecoration.caseOne, activeMerchantPreviewDecoration.caseTwo]
      : activePartnerDetail.merchant.tags.map((tag) => `${tag}：查看服务边界、价格区间、交付方式和售后规则。`)
  const activeMerchantFontStyle: CSSProperties = activeMerchantPreviewDecoration?.fontFamily
    ? { fontFamily: activeMerchantPreviewDecoration.fontFamily }
    : {}
  const activeMerchantTitleStyle: CSSProperties = {
    ...activeMerchantFontStyle,
    ...(activeMerchantPreviewDecoration?.titleColor ? { color: activeMerchantPreviewDecoration.titleColor } : {}),
  }
  const activeMerchantBodyStyle: CSSProperties = {
    ...activeMerchantFontStyle,
    ...(activeMerchantPreviewDecoration?.bodyColor ? { color: activeMerchantPreviewDecoration.bodyColor } : {}),
  }
  const activeMerchantAccentStyle: CSSProperties = {
    ...activeMerchantFontStyle,
    ...(activeMerchantPreviewDecoration?.accentColor ? { color: activeMerchantPreviewDecoration.accentColor } : {}),
  }
  const activeMerchantDisplayName =
    activeMerchantPreviewDecoration?.showcaseArtTitle || activePartnerDetail.merchant.name
  const getTextLayerState = (
    decoration: MerchantBrandDecoration | undefined,
    field: MerchantEditableTextField,
  ): MerchantTextLayerStyle => decoration?.textLayerStyles?.[field] ?? { x: 0, y: 0, z: 20, fontSize: 0, color: '' }
  const getTextLayerStyle = (
    decoration: MerchantBrandDecoration | undefined,
    field: MerchantEditableTextField,
  ): CSSProperties => {
    const layer = getTextLayerState(decoration, field)
    return {
      position: 'relative',
      transform: `translate(${layer.x}px, ${layer.y}px)`,
      zIndex: layer.z,
    }
  }
  const getTextContentStyle = (
    decoration: MerchantBrandDecoration | undefined,
    field: MerchantEditableTextField,
    baseStyle: CSSProperties,
  ): CSSProperties => {
    const layer = getTextLayerState(decoration, field)
    return {
      ...baseStyle,
      ...(layer.color ? { color: layer.color } : {}),
      ...(layer.fontSize ? { fontSize: layer.fontSize } : {}),
    }
  }
  const getTextPopoverAnchor = (element: HTMLElement): TextPopoverAnchor => {
    const rect = element.getBoundingClientRect()
    const nextWidth = Math.max(360, Math.min(680, rect.width + 96, window.innerWidth - 32))
    const computedFontSize = Number.parseFloat(window.getComputedStyle(element).fontSize)
    return {
      left: Math.min(window.innerWidth - nextWidth / 2 - 16, Math.max(nextWidth / 2 + 16, rect.left + rect.width / 2)),
      top: rect.top - 10,
      width: nextWidth,
      fontSize: Number.isFinite(computedFontSize) ? Math.round(computedFontSize) : 0,
    }
  }
  const getMerchantDecorationImageStyle = (
    decoration: MerchantBrandDecoration | undefined,
    zone: 'hero' | 'service',
  ): CSSProperties => {
    if (!decoration) return {}
    const x = zone === 'hero' ? decoration.heroImageX : decoration.serviceImageX
    const y = zone === 'hero' ? decoration.heroImageY : decoration.serviceImageY
    const scale = zone === 'hero' ? decoration.heroImageScale : decoration.serviceImageScale
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%) scale(${scale})`,
    }
  }
  const heroStyle = {
    '--mobile-logo-width': `${activeSiteContent.mobileLogoWidth}vw`,
    '--mobile-hero-title-size': `${activeSiteContent.mobileHeroTitleSize}px`,
    '--mobile-hero-copy-size': `${activeSiteContent.mobileHeroCopySize}px`,
    '--mobile-search-scale': activeSiteContent.mobileSearchScale,
  } as CSSProperties
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

  const navigateToPath = (path: string) => {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  const navigateToSchoolBrowser = () => {
    if (currentPath !== '/') {
      window.history.pushState(null, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
    window.setTimeout(() => {
      document.getElementById('school-browser')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
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
      }).catch(() => setMessage('积分更新失败，请稍后重试。'))
    }
  }

  const updateUserEarningPoints = (userId: string, nextEarningPoints: number) => {
    const normalizedEarningPoints = Math.max(0, Number.isFinite(nextEarningPoints) ? nextEarningPoints : 0)
    setAppState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === userId ? { ...user, earningPoints: normalizedEarningPoints } : user,
      ),
    }))
    setEarningPointDrafts((drafts) => ({ ...drafts, [userId]: String(normalizedEarningPoints) }))
    if (adminToken) {
      fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        body: JSON.stringify({ earningPoints: normalizedEarningPoints }),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }).catch(() => setMessage('可提现积分更新失败，请稍后重试。'))
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
      }).catch(() => setMessage('账号状态更新失败，请稍后重试。'))
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
      }).catch(() => setMessage('材料审核状态更新失败，请稍后重试。'))
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
      }).catch(() => setMessage('账号删除失败，请稍后重试。'))
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
      }).catch(() => setMessage('帖子更新失败，请稍后重试。'))
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
      }).catch(() => setMessage('帖子删除失败，请稍后重试。'))
    }
    setMessage('后台已删除帖子。')
  }

  const updateReport = (reportId: string, patch: Partial<ContentReport>) => {
    setAppState((state) => ({
      ...state,
      reports: state.reports.map((report) =>
        report.id === reportId ? { ...report, ...patch, updatedAt: new Date().toISOString() } : report,
      ),
    }))
    if (adminToken) {
      fetch(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }).catch(() => setMessage('举报处理状态保存失败，请稍后重试。'))
    }
  }

  const removeReport = (reportId: string) => {
    setAppState((state) => ({ ...state, reports: state.reports.filter((report) => report.id !== reportId) }))
    if (adminToken) {
      fetch(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
        headers: { authorization: `Bearer ${adminToken}` },
        method: 'DELETE',
      }).catch(() => setMessage('举报删除失败，请稍后重试。'))
    }
  }

  const getPartnerReviewDraft = (application: PartnerApplication): PartnerApplicationReviewDraft =>
    partnerReviewDrafts[application.id] ?? {
      status: application.status,
      reviewNote: application.reviewNote ?? '',
    }

  const updatePartnerReviewDraft = (
    application: PartnerApplication,
    patch: Partial<PartnerApplicationReviewDraft>,
  ) => {
    setPartnerReviewDrafts((drafts) => ({
      ...drafts,
      [application.id]: {
        status: drafts[application.id]?.status ?? application.status,
        reviewNote: drafts[application.id]?.reviewNote ?? application.reviewNote ?? '',
        ...patch,
      },
    }))
  }

  const updatePartnerApplication = (partnerId: string, patch: Partial<PartnerApplication>) => {
    setAppState((state) => ({
      ...state,
      partnerApplications: state.partnerApplications.map((application) =>
        application.id === partnerId ? { ...application, ...patch } : application,
      ),
    }))
    if (adminToken) {
      fetch(`/api/admin/partners/${encodeURIComponent(partnerId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      })
        .then(async (response) => {
          const data = (await response.json()) as { partnerApplications?: PartnerApplication[]; error?: string }
          if (!response.ok) throw new Error(data.error ?? '商家审核状态保存失败，请稍后重试。')
          if (data.partnerApplications) {
            setAppState((state) => ({
              ...state,
              partnerApplications: data.partnerApplications!.map(normalizePartnerApplication),
            }))
          }
        })
        .catch((error) => setMessage(error instanceof Error ? error.message : '商家审核状态保存失败，请稍后重试。'))
    }
  }

  const submitPartnerApplicationReview = (application: PartnerApplication) => {
    const draft = getPartnerReviewDraft(application)
    const reviewNote = draft.reviewNote.trim()
    if (draft.status === 'rejected' && !reviewNote) {
      setMessage('审核不通过时请填写理由，方便商家查看并修改。')
      return
    }
    updatePartnerApplication(application.id, {
      status: draft.status,
      reviewNote: draft.status === 'rejected' ? reviewNote : reviewNote,
    })
    setPartnerReviewDrafts((drafts) => {
      const nextDrafts = { ...drafts }
      delete nextDrafts[application.id]
      return nextDrafts
    })
    setMessage('合作申请审核结果已提交。')
  }

  const updateMerchantLead = (leadId: string, patch: Partial<MerchantLead>) => {
    setAppState((state) => ({
      ...state,
      merchantLeads: state.merchantLeads.map((lead) => (lead.id === leadId ? { ...lead, ...patch } : lead)),
    }))
    if (adminToken) {
      fetch(`/api/admin/merchant-leads/${encodeURIComponent(leadId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      }).catch(() => setMessage('咨询线索状态保存失败，请稍后重试。'))
    }
  }

  const removeMerchantLead = (leadId: string) => {
    setAppState((state) => ({ ...state, merchantLeads: state.merchantLeads.filter((lead) => lead.id !== leadId) }))
    if (adminToken) {
      fetch(`/api/admin/merchant-leads/${encodeURIComponent(leadId)}`, {
        headers: { authorization: `Bearer ${adminToken}` },
        method: 'DELETE',
      }).catch(() => setMessage('咨询线索删除失败，请稍后重试。'))
    }
  }

  const exportMerchantLeads = () => {
    const rows = filteredMerchantLeads.map((lead) => [
      lead.id,
      lead.merchantTitle,
      lead.merchantType,
      lead.userName,
      lead.userContact,
      lead.note,
      lead.assignedTo,
      lead.adminNote,
      lead.status,
      lead.createdAt,
    ])
    const csv = [
      ['线索ID', '商家', '类型', '咨询人', '联系方式', '咨询内容', '负责人', '后台备注', '状态', '创建时间'],
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `shouye-merchant-leads-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const updateQuestionDispute = (disputeId: string, patch: Partial<QuestionDispute> & { adminAction?: 'refund' | 'settle' | '' }) => {
    setAppState((state) => ({
      ...state,
      questionDisputes: state.questionDisputes.map((dispute) =>
        dispute.id === disputeId ? { ...dispute, ...patch, updatedAt: new Date().toISOString() } : dispute,
      ),
    }))
    if (adminToken) {
      fetch(`/api/admin/question-disputes/${encodeURIComponent(disputeId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { questionDisputes?: QuestionDispute[]; questionBounties?: QuestionBounty[]; users?: User[] } | null) => {
          if (!data) return
          setAppState((state) => ({
            ...state,
            questionDisputes: data.questionDisputes ?? state.questionDisputes,
            questionBounties: data.questionBounties ?? state.questionBounties,
            users: data.users ?? state.users,
          }))
        })
        .catch(() => setMessage('申诉处理状态保存失败，请稍后重试。'))
    }
  }

  const updatePointOrder = (orderId: string, patch: Partial<PointOrder>) => {
    setAppState((state) => ({
      ...state,
      pointOrders: state.pointOrders.map((order) =>
        order.id === orderId ? { ...order, ...patch, updatedAt: new Date().toISOString() } : order,
      ),
    }))
    if (adminToken) {
      fetch(`/api/admin/point-orders/${encodeURIComponent(orderId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      })
        .then((response) => (response.ok ? response.json() : null))
        .then(
          (data: { pointOrders?: PointOrder[]; pointLedger?: PointLedger[]; users?: User[] } | null) => {
            if (!data) return
            setAppState((state) => ({
              ...state,
              pointOrders: data.pointOrders ?? state.pointOrders,
              pointLedger: data.pointLedger ?? state.pointLedger,
              users: data.users ?? state.users,
            }))
          },
        )
        .catch(() => setMessage('充值订单状态保存失败，请稍后重试。'))
    }
  }

  const updateWithdrawalRequest = (withdrawalId: string, patch: Partial<WithdrawalRequest>) => {
    setAppState((state) => ({
      ...state,
      withdrawalRequests: state.withdrawalRequests.map((withdrawal) =>
        withdrawal.id === withdrawalId ? { ...withdrawal, ...patch, updatedAt: new Date().toISOString() } : withdrawal,
      ),
    }))
    if (adminToken) {
      fetch(`/api/admin/withdrawals/${encodeURIComponent(withdrawalId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      })
        .then((response) => (response.ok ? response.json() : null))
        .then(
          (data: { withdrawalRequests?: WithdrawalRequest[]; pointLedger?: PointLedger[]; users?: User[] } | null) => {
            if (!data) return
            setAppState((state) => ({
              ...state,
              withdrawalRequests: data.withdrawalRequests ?? state.withdrawalRequests,
              pointLedger: data.pointLedger ?? state.pointLedger,
              users: data.users ?? state.users,
            }))
          },
        )
        .catch(() => setMessage('提现申请状态保存失败，请稍后重试。'))
    }
  }

  const removeQuestionDispute = (disputeId: string) => {
    setAppState((state) => ({
      ...state,
      questionDisputes: state.questionDisputes.filter((dispute) => dispute.id !== disputeId),
    }))
    if (adminToken) {
      fetch(`/api/admin/question-disputes/${encodeURIComponent(disputeId)}`, {
        headers: { authorization: `Bearer ${adminToken}` },
        method: 'DELETE',
      }).catch(() => setMessage('申诉记录删除失败，请稍后重试。'))
    }
  }

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reportTarget) return
    const now = new Date().toISOString()
    const report: ContentReport = {
      id: createId('report'),
      contentType: reportTarget.contentType,
      contentId: reportTarget.contentId,
      reason: reportForm.reason,
      description: reportForm.description.trim(),
      reporterUserId: currentUser?.id,
      reporterContact: reportForm.contact.trim(),
      status: 'pending',
      adminNote: '',
      createdAt: now,
      updatedAt: now,
    }

    try {
      const response = await fetch('/api/reports', {
        body: JSON.stringify(report),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { report?: ContentReport; error?: string }
      if (!response.ok) throw new Error(data.error)
      setAppState((state) => ({ ...state, reports: [data.report ?? report, ...state.reports] }))
      setMessage('举报已提交，平台会尽快处理。')
    } catch {
      setAppState((state) => ({ ...state, reports: [report, ...state.reports] }))
      setMessage('举报已保存到当前浏览器，线上接口可用后会统一处理。')
    } finally {
      setReportTarget(null)
      setReportForm({ reason: '违法违规内容', description: '', contact: '' })
    }
  }

  const submitAccountRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = accountRecoveryForm.email.trim().toLowerCase()
    const contact = accountRecoveryForm.contact.trim() || email
    const detail = accountRecoveryForm.description.trim()

    if (!email && !contact) {
      setAccountRecoveryNotice('请至少填写注册邮箱或一个可联系到你的方式。')
      return
    }

    const now = new Date().toISOString()
    const report: ContentReport = {
      id: createId('report'),
      contentType: 'account-recovery',
      contentId: email || contact,
      reason: '找回账号',
      description: [`注册邮箱/账号线索：${email || '未填写'}`, `补充说明：${detail || '用户在登录页提交找回账号请求。'}`].join('\n'),
      reporterUserId: currentUser?.id,
      reporterContact: contact,
      status: 'pending',
      adminNote: '',
      createdAt: now,
      updatedAt: now,
    }

    try {
      const response = await fetch('/api/reports', {
        body: JSON.stringify(report),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { report?: ContentReport; error?: string }
      if (!response.ok) throw new Error(data.error)
      setAppState((state) => ({ ...state, reports: [data.report ?? report, ...state.reports] }))
      setAccountRecoveryNotice('找回账号申请已提交，管理员会根据邮箱和联系方式核对。')
    } catch {
      setAppState((state) => ({ ...state, reports: [report, ...state.reports] }))
      setAccountRecoveryNotice('找回账号申请已保存，线上接口恢复后管理员可继续处理。')
    }
    setAccountRecoveryForm({ email: '', contact: '', description: '' })
  }

  const updateContentDraft = <Key extends keyof SiteContentSettings>(key: Key, value: SiteContentSettings[Key]) => {
    setContentDraft((draft) => normalizeSiteContent({ ...draft, [key]: value }))
  }

  const updateMerchantDecorationDraft = <Key extends keyof MerchantBrandDecoration>(
    brandId: string,
    key: Key,
    value: MerchantBrandDecoration[Key],
  ) => {
    setMerchantDecorationDrafts((drafts) => {
      const fallback =
        drafts[brandId] ??
        appState.merchantBrandDecorations.find((decoration) => decoration.brandId === brandId) ??
        normalizeMerchantBrandDecoration({ brandId })
      return {
        ...drafts,
        [brandId]: normalizeMerchantBrandDecoration({ ...fallback, [key]: value }),
      }
    })
  }

  const handleMerchantLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!canManageActivePartnerBrand) {
      setMerchantDecorationNotice('当前账号还没有这个品牌详情页的装饰权限。')
      return
    }

    try {
      const pendingLogoImage = await resizeTransparentImageFileToDataUrl(file)
      setMerchantDecorationDrafts((drafts) => {
        const fallback =
          drafts[activePartnerDetailSlug] ??
          appState.merchantBrandDecorations.find((decoration) => decoration.brandId === activePartnerDetailSlug) ??
          normalizeMerchantBrandDecoration({ brandId: activePartnerDetailSlug })
        return {
          ...drafts,
          [activePartnerDetailSlug]: normalizeMerchantBrandDecoration({
            ...fallback,
            pendingLogoImage,
            logoReviewStatus: 'pending',
          }),
        }
      })
      setMerchantDecorationNotice('头像已上传到草稿，点保存后进入后台审核；审核通过前不会对外展示。')
    } catch (error) {
      setMerchantDecorationNotice(error instanceof Error ? error.message : '头像上传失败，请换一张图片重试。')
    }
  }

  const updateMerchantDecorationImage = async (zone: 'hero' | 'service', file: File) => {
    if (!canManageActivePartnerBrand) {
      setMerchantDecorationNotice('当前账号还没有这个品牌详情页的装饰权限。')
      return
    }
    const isSupportedMedia = file.type.startsWith('image/') || file.type.startsWith('video/')
    if (!isSupportedMedia) {
      setMerchantDecorationNotice('请上传图片或视频文件。')
      return
    }

    try {
      const media = file.type.startsWith('video/')
        ? await readVideoFileToDataUrl(file)
        : await resizeImageFileToDataUrl(file, 1280, 0.86)
      if (zone === 'hero') {
        updateMerchantDecorationDraft(activePartnerDetailSlug, 'heroImage', media)
        updateMerchantDecorationDraft(activePartnerDetailSlug, 'heroImageX', 72)
        updateMerchantDecorationDraft(activePartnerDetailSlug, 'heroImageY', 48)
        updateMerchantDecorationDraft(activePartnerDetailSlug, 'heroImageScale', 1)
      } else {
        updateMerchantDecorationDraft(activePartnerDetailSlug, 'serviceImage', media)
        updateMerchantDecorationDraft(activePartnerDetailSlug, 'serviceImageX', 50)
        updateMerchantDecorationDraft(activePartnerDetailSlug, 'serviceImageY', 50)
        updateMerchantDecorationDraft(activePartnerDetailSlug, 'serviceImageScale', 1)
      }
      setActiveMerchantMediaZone(zone)
      setMerchantDecorationNotice('素材已加入草稿，可在展示区拖动位置、调整大小，保存后展示。')
    } catch (error) {
      setMerchantDecorationNotice(error instanceof Error ? error.message : '素材上传失败，请换一个文件重试。')
    }
  }

  const handleMerchantDecorationImageInput = async (
    zone: 'hero' | 'service',
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      selectMerchantMediaLayer(zone)
      await updateMerchantDecorationImage(zone, file)
    }
  }

  const handleMerchantDecorationImageDrop = async (zone: 'hero' | 'service', event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith('image/') || item.type.startsWith('video/'))
    if (file) {
      selectMerchantMediaLayer(zone)
      await updateMerchantDecorationImage(zone, file)
    }
  }

  const startMerchantDecorationImageDrag = (zone: 'hero' | 'service', event: PointerEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveMerchantStageLayerId(`media:${zone}`)
    setActiveMerchantDesignItemId(null)
    setActiveMerchantTextEditor(null)
    setActiveMerchantMediaZone(zone)
    event.currentTarget.setPointerCapture(event.pointerId)
    const stageElement =
      event.currentTarget.closest<HTMLElement>('[data-merchant-design-stage]') ??
      event.currentTarget.parentElement ??
      event.currentTarget
    const stageRect = stageElement.getBoundingClientRect()
    merchantImageDragRef.current = {
      zone,
      startX: event.clientX,
      startY: event.clientY,
      originX: zone === 'hero' ? activeMerchantDecorationDraft.heroImageX : activeMerchantDecorationDraft.serviceImageX,
      originY: zone === 'hero' ? activeMerchantDecorationDraft.heroImageY : activeMerchantDecorationDraft.serviceImageY,
      stageWidth: Math.max(1, stageRect.width),
      stageHeight: Math.max(1, stageRect.height),
    }
  }

  const moveMerchantDecorationImageDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = merchantImageDragRef.current
    if (!drag) return
    const nextX = Math.min(100, Math.max(0, drag.originX + ((event.clientX - drag.startX) / drag.stageWidth) * 100))
    const nextY = Math.min(100, Math.max(0, drag.originY + ((event.clientY - drag.startY) / drag.stageHeight) * 100))
    if (drag.zone === 'hero') {
      updateMerchantDecorationDraft(activePartnerDetailSlug, 'heroImageX', Number(nextX.toFixed(1)))
      updateMerchantDecorationDraft(activePartnerDetailSlug, 'heroImageY', Number(nextY.toFixed(1)))
    } else {
      updateMerchantDecorationDraft(activePartnerDetailSlug, 'serviceImageX', Number(nextX.toFixed(1)))
      updateMerchantDecorationDraft(activePartnerDetailSlug, 'serviceImageY', Number(nextY.toFixed(1)))
    }
  }

  const endMerchantDecorationImageDrag = () => {
    merchantImageDragRef.current = null
  }

  const updateMerchantDesignItem = (itemId: string, patch: Partial<MerchantDesignItem>) => {
    updateMerchantDecorationDraft(activePartnerDetailSlug, 'designItems', activeMerchantDecorationDraft.designItems.map((item) =>
      item.id === itemId ? { ...item, ...patch } : item,
    ))
  }

  const addMerchantDesignBubble = (zone: MerchantDesignZone) => {
    const maxZ = Math.max(10, ...activeMerchantDecorationDraft.designItems.map((item) => item.z))
    const item: MerchantDesignItem = {
      id: createId('merchant-item'),
      zone,
      kind: 'bubble',
      text: '双击修改文字',
      mediaUrl: '',
      mediaKind: 'image',
      x: zone === 'hero' ? 58 : 8,
      y: zone === 'hero' ? 16 : 18,
      width: zone === 'hero' ? 30 : 28,
      height: zone === 'hero' ? 18 : 20,
      z: maxZ + 1,
      opacity: 0.92,
      fontSize: 18,
      color: '#10201d',
      background: 'rgba(255, 253, 247, 0.88)',
    }
    updateMerchantDecorationDraft(activePartnerDetailSlug, 'designItems', [...activeMerchantDecorationDraft.designItems, item])
    setActiveMerchantDesignItemId(item.id)
    setActiveMerchantStageLayerId(`design:${item.id}`)
  }

  const deleteMerchantDesignItem = (itemId: string) => {
    updateMerchantDecorationDraft(
      activePartnerDetailSlug,
      'designItems',
      activeMerchantDecorationDraft.designItems.filter((item) => item.id !== itemId),
    )
    setActiveMerchantDesignItemId((selectedId) => (selectedId === itemId ? null : selectedId))
    setActiveMerchantStageLayerId((selectedId) => (selectedId === `design:${itemId}` ? null : selectedId))
  }

  const moveMerchantDesignItemLayer = (itemId: string, direction: 1 | -1) => {
    const item = activeMerchantDecorationDraft.designItems.find((entry) => entry.id === itemId)
    if (!item) return
    const maxZ = Math.max(20, ...activeMerchantDecorationDraft.designItems.map((entry) => entry.z))
    updateMerchantDesignItem(itemId, { z: direction > 0 ? Math.min(120, maxZ + 10) : 0 })
  }

  const updateTextLayerStyle = (
    brandId: string,
    decoration: MerchantBrandDecoration,
    field: MerchantEditableTextField,
    patch: Partial<MerchantTextLayerStyle>,
  ) => {
    const currentLayer = getTextLayerState(decoration, field)
    updateMerchantDecorationDraft(brandId, 'textLayerStyles', {
      ...decoration.textLayerStyles,
      [field]: {
        ...currentLayer,
        ...patch,
      },
    })
  }

  const moveTextLayer = (
    brandId: string,
    decoration: MerchantBrandDecoration,
    field: MerchantEditableTextField,
    direction: 1 | -1,
  ) => {
    const textLayers = Object.values(decoration.textLayerStyles ?? {}).map((layer) => layer.z)
    const designLayers = (decoration.designItems ?? []).map((item) => item.z)
    const maxLayer = Math.max(20, ...textLayers, ...designLayers)
    updateTextLayerStyle(brandId, decoration, field, { z: direction > 0 ? Math.min(160, maxLayer + 10) : 0 })
  }

  const startMerchantTextLayerDrag = (field: MerchantEditableTextField, event: PointerEvent<HTMLElement>) => {
    if (!merchantDesignEditMode || !canManageActivePartnerBrand) return
    if (event.detail > 1) {
      event.preventDefault()
      event.stopPropagation()
      openMerchantTextEditor(field, event.currentTarget)
      return
    }
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    selectMerchantTextLayer(field)
    const layer = getTextLayerState(activeMerchantDecorationDraft, field)
    merchantTextLayerDragRef.current = {
      brandId: activePartnerDetailSlug,
      field,
      startX: event.clientX,
      startY: event.clientY,
      originX: layer.x,
      originY: layer.y,
    }
  }

  const moveMerchantTextLayerDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = merchantTextLayerDragRef.current
    if (!drag) return
    updateTextLayerStyle(drag.brandId, activeMerchantDecorationDraft, drag.field, {
      x: Math.min(800, Math.max(-800, Math.round(drag.originX + event.clientX - drag.startX))),
      y: Math.min(800, Math.max(-800, Math.round(drag.originY + event.clientY - drag.startY))),
    })
    setMerchantTextPopoverAnchor(null)
  }

  const endMerchantTextLayerDrag = () => {
    merchantTextLayerDragRef.current = null
  }

  const openMerchantTextEditor = (field: MerchantEditableTextField, element: HTMLElement) => {
    selectMerchantTextLayer(field, true)
    setMerchantTextPopoverAnchor(getTextPopoverAnchor(element))
  }

  const startMerchantDesignItemDrag = (
    item: MerchantDesignItem,
    mode: 'move' | 'resize',
    event: PointerEvent<HTMLElement>,
  ) => {
    if (!merchantDesignEditMode || !canManageActivePartnerBrand) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const stageElement =
      event.currentTarget.closest<HTMLElement>('[data-merchant-design-stage]') ??
      event.currentTarget.parentElement ??
      event.currentTarget
    const stageRect = stageElement.getBoundingClientRect()
    setActiveMerchantDesignItemId(item.id)
    setActiveMerchantStageLayerId(`design:${item.id}`)
    merchantDesignItemDragRef.current = {
      id: item.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      originWidth: item.width,
      originHeight: item.height,
      stageWidth: Math.max(1, stageRect.width),
      stageHeight: Math.max(1, stageRect.height),
    }
  }

  const moveMerchantDesignItemDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = merchantDesignItemDragRef.current
    if (!drag) return
    const deltaX = ((event.clientX - drag.startX) / drag.stageWidth) * 100
    const deltaY = ((event.clientY - drag.startY) / drag.stageHeight) * 100
    if (drag.mode === 'resize') {
      updateMerchantDesignItem(drag.id, {
        width: Number(Math.min(92, Math.max(10, drag.originWidth + deltaX)).toFixed(1)),
        height: Number(Math.min(92, Math.max(8, drag.originHeight + deltaY)).toFixed(1)),
      })
      return
    }
    updateMerchantDesignItem(drag.id, {
      x: Number(Math.min(96, Math.max(0, drag.originX + deltaX)).toFixed(1)),
      y: Number(Math.min(96, Math.max(0, drag.originY + deltaY)).toFixed(1)),
    })
  }

  const endMerchantDesignItemDrag = () => {
    merchantDesignItemDragRef.current = null
  }

  const handleMerchantDesignItemDrop = async (itemId: string, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith('image/') || item.type.startsWith('video/'))
    if (!file) return
    try {
      const mediaUrl = file.type.startsWith('video/')
        ? await readVideoFileToDataUrl(file)
        : await resizeImageFileToDataUrl(file, 1100, 0.86)
      updateMerchantDesignItem(itemId, {
        kind: 'media',
        mediaUrl,
        mediaKind: file.type.startsWith('video/') ? 'video' : 'image',
      })
      setActiveMerchantDesignItemId(itemId)
      setActiveMerchantStageLayerId(`design:${itemId}`)
    } catch (error) {
      setMerchantDecorationNotice(error instanceof Error ? error.message : '素材上传失败，请换一个文件重试。')
    }
  }

  const updatePartnerShowcaseDesignItem = (itemId: string, patch: Partial<MerchantDesignItem>) => {
    updateMerchantDecorationDraft(
      activePartnerMerchantSlug,
      'designItems',
      activePartnerMerchantDecorationDraft.designItems.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    )
  }

  const addPartnerShowcaseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = Array.from(event.target.files ?? []).find((item) => item.type.startsWith('image/') || item.type.startsWith('video/'))
    event.target.value = ''
    if (!file || !canManageActivePartnerMerchant) return
    try {
      const mediaUrl = file.type.startsWith('video/')
        ? await readVideoFileToDataUrl(file)
        : await resizeTransparentImageFileToDataUrl(file)
      const maxZ = Math.max(20, ...activePartnerMerchantDecorationDraft.designItems.map((item) => item.z))
      const item: MerchantDesignItem = {
        id: createId('showcase-image'),
        zone: 'showcase',
        kind: 'media',
        text: '',
        mediaUrl,
        mediaKind: file.type.startsWith('video/') ? 'video' : 'image',
        x: 64,
        y: 20,
        width: 22,
        height: 22,
        z: maxZ + 1,
        opacity: 1,
        fontSize: 18,
        color: '#10201d',
        background: 'transparent',
      }
      updateMerchantDecorationDraft(activePartnerMerchantSlug, 'designItems', [
        ...activePartnerMerchantDecorationDraft.designItems,
        item,
      ])
      setActivePartnerShowcaseDesignItemId(item.id)
      setMerchantDecorationNotice('图片已添加到展示卡，拖动调整位置，右下角可拉伸大小。')
    } catch (error) {
      setMerchantDecorationNotice(error instanceof Error ? error.message : '图片添加失败，请换一张图片重试。')
    }
  }

  const addPartnerShowcaseTextBox = () => {
    if (!canManageActivePartnerMerchant) return
    const maxZ = Math.max(20, ...activePartnerMerchantDecorationDraft.designItems.map((item) => item.z))
    const item: MerchantDesignItem = {
      id: createId('showcase-text'),
      zone: 'showcase',
      kind: 'bubble',
      text: '双击修改文字',
      mediaUrl: '',
      mediaKind: 'image',
      x: 36,
      y: 42,
      width: 24,
      height: 12,
      z: maxZ + 1,
      opacity: 0.94,
      fontSize: 20,
      color: '#10201d',
      background: 'rgba(255, 253, 247, 0.86)',
    }
    updateMerchantDecorationDraft(activePartnerMerchantSlug, 'designItems', [
      ...activePartnerMerchantDecorationDraft.designItems,
      item,
    ])
    setActivePartnerShowcaseDesignItemId(item.id)
    setMerchantDecorationNotice('文本框已添加到展示卡，拖动调整位置，双击可修改文字。')
  }

  const deletePartnerShowcaseDesignItem = (itemId: string) => {
    updateMerchantDecorationDraft(
      activePartnerMerchantSlug,
      'designItems',
      activePartnerMerchantDecorationDraft.designItems.filter((item) => item.id !== itemId),
    )
    setActivePartnerShowcaseDesignItemId((selectedId) => (selectedId === itemId ? null : selectedId))
  }

  const movePartnerShowcaseDesignItemLayer = (itemId: string, direction: 1 | -1) => {
    const item = activePartnerMerchantDecorationDraft.designItems.find((entry) => entry.id === itemId)
    if (!item) return
    const maxZ = Math.max(20, ...activePartnerMerchantDecorationDraft.designItems.map((entry) => entry.z))
    updatePartnerShowcaseDesignItem(itemId, { z: direction > 0 ? Math.min(120, maxZ + 10) : 0 })
  }

  const startPartnerShowcaseTextLayerDrag = (field: MerchantEditableTextField, event: PointerEvent<HTMLElement>) => {
    if (!partnerShowcaseEditMode || !canManageActivePartnerMerchant) return
    if (event.detail > 1) {
      event.preventDefault()
      event.stopPropagation()
      openPartnerShowcaseTextEditor(field, event.currentTarget)
      return
    }
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setActivePartnerShowcaseTextEditor(null)
    const layer = getTextLayerState(activePartnerMerchantDecorationDraft, field)
    partnerShowcaseTextLayerDragRef.current = {
      brandId: activePartnerMerchantSlug,
      field,
      startX: event.clientX,
      startY: event.clientY,
      originX: layer.x,
      originY: layer.y,
    }
  }

  const movePartnerShowcaseTextLayerDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = partnerShowcaseTextLayerDragRef.current
    if (!drag) return
    updateTextLayerStyle(drag.brandId, activePartnerMerchantDecorationDraft, drag.field, {
      x: Math.min(800, Math.max(-800, Math.round(drag.originX + event.clientX - drag.startX))),
      y: Math.min(800, Math.max(-800, Math.round(drag.originY + event.clientY - drag.startY))),
    })
    setPartnerShowcaseTextPopoverAnchor(null)
  }

  const endPartnerShowcaseTextLayerDrag = () => {
    partnerShowcaseTextLayerDragRef.current = null
  }

  const openPartnerShowcaseTextEditor = (field: MerchantEditableTextField, element: HTMLElement) => {
    setActivePartnerShowcaseTextEditor(field)
    setPartnerShowcaseTextPopoverAnchor(getTextPopoverAnchor(element))
  }

  const findMerchantTextLayerAtPoint = (clientX: number, clientY: number) => {
    const element = document
      .elementsFromPoint(clientX, clientY)
      .map((entry) => entry.closest<HTMLElement>('[data-merchant-text-field]'))
      .find((entry): entry is HTMLElement => Boolean(entry))
    const field = element?.dataset.merchantTextField as MerchantEditableTextField | undefined
    return element && field ? { element, field } : null
  }

  const findPartnerShowcaseTextLayerAtPoint = (clientX: number, clientY: number) => {
    const element = document
      .elementsFromPoint(clientX, clientY)
      .map((entry) => entry.closest<HTMLElement>('[data-partner-showcase-text-field]'))
      .find((entry): entry is HTMLElement => Boolean(entry))
    const field = element?.dataset.partnerShowcaseTextField as MerchantEditableTextField | undefined
    return element && field ? { element, field } : null
  }

  const startPartnerShowcaseDesignItemDrag = (
    item: MerchantDesignItem,
    mode: 'move' | 'resize',
    event: PointerEvent<HTMLElement>,
  ) => {
    if (!partnerShowcaseEditMode || !canManageActivePartnerMerchant) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const stageElement =
      event.currentTarget.closest<HTMLElement>('[data-partner-showcase-stage]') ??
      event.currentTarget.parentElement ??
      event.currentTarget
    const stageRect = stageElement.getBoundingClientRect()
    setActivePartnerShowcaseDesignItemId(item.id)
    partnerShowcaseItemDragRef.current = {
      id: item.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      originWidth: item.width,
      originHeight: item.height,
      aspectRatio: item.width / Math.max(1, item.height),
      stageWidth: Math.max(1, stageRect.width),
      stageHeight: Math.max(1, stageRect.height),
    }
  }

  const movePartnerShowcaseDesignItemDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = partnerShowcaseItemDragRef.current
    if (!drag) return
    const deltaX = ((event.clientX - drag.startX) / drag.stageWidth) * 100
    const deltaY = ((event.clientY - drag.startY) / drag.stageHeight) * 100
    if (drag.mode === 'resize') {
      const nextWidth = Math.min(88, Math.max(8, drag.originWidth + deltaX))
      const nextHeight = event.shiftKey
        ? Math.min(88, Math.max(8, nextWidth / Math.max(0.1, drag.aspectRatio)))
        : Math.min(88, Math.max(8, drag.originHeight + deltaY))
      updatePartnerShowcaseDesignItem(drag.id, {
        width: Number(nextWidth.toFixed(1)),
        height: Number(nextHeight.toFixed(1)),
      })
      return
    }
    updatePartnerShowcaseDesignItem(drag.id, {
      x: Number(Math.min(96, Math.max(0, drag.originX + deltaX)).toFixed(1)),
      y: Number(Math.min(96, Math.max(0, drag.originY + deltaY)).toFixed(1)),
    })
  }

  const endPartnerShowcaseDesignItemDrag = () => {
    partnerShowcaseItemDragRef.current = null
  }

  useEffect(() => {
    if (!merchantDesignEditMode || (!activeMerchantDesignItemId && !activeMerchantMediaZone)) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select')) return
      event.preventDefault()
      if (activeMerchantDesignItemId) {
        deleteMerchantDesignItem(activeMerchantDesignItemId)
        return
      }
      if (activeMerchantMediaZone) {
        updateMerchantDecorationDraft(activePartnerDetailSlug, activeMerchantMediaZone === 'hero' ? 'heroImage' : 'serviceImage', '')
        setActiveMerchantMediaZone(null)
        setActiveMerchantStageLayerId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [merchantDesignEditMode, activeMerchantDesignItemId, activeMerchantMediaZone, activeMerchantDecorationDraft.designItems])

  useEffect(() => {
    if (!partnerShowcaseEditMode || !activePartnerShowcaseDesignItemId) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select')) return
      event.preventDefault()
      deletePartnerShowcaseDesignItem(activePartnerShowcaseDesignItemId)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [partnerShowcaseEditMode, activePartnerShowcaseDesignItemId, activePartnerMerchantDecorationDraft.designItems])

  const renderMerchantDecorationImageEditor = (zone: 'hero' | 'service', title: string, description: string) => {
    const image = zone === 'hero' ? activeMerchantDecorationDraft.heroImage : activeMerchantDecorationDraft.serviceImage
    const scale = zone === 'hero' ? activeMerchantDecorationDraft.heroImageScale : activeMerchantDecorationDraft.serviceImageScale
    return (
      <div className="merchant-image-editor">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <div
          className={`merchant-image-dropzone ${image ? 'has-image' : ''}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleMerchantDecorationImageDrop(zone, event)}
          onPointerMove={moveMerchantDecorationImageDrag}
          onPointerUp={endMerchantDecorationImageDrag}
          onPointerCancel={endMerchantDecorationImageDrag}
          onPointerLeave={endMerchantDecorationImageDrag}
        >
          {image ? (
            isVideoDataUrl(image) ? (
              <video
                controls
                draggable={false}
                muted
                src={image}
                style={
                  zone === 'hero'
                    ? getMerchantDecorationImageStyle(activeMerchantDecorationDraft, 'hero')
                    : getMerchantDecorationImageStyle(activeMerchantDecorationDraft, 'service')
                }
                onPointerDown={(event) => startMerchantDecorationImageDrag(zone, event)}
              />
            ) : (
              <img
                alt=""
                draggable={false}
                src={image}
                style={
                  zone === 'hero'
                    ? getMerchantDecorationImageStyle(activeMerchantDecorationDraft, 'hero')
                    : getMerchantDecorationImageStyle(activeMerchantDecorationDraft, 'service')
                }
                onPointerDown={(event) => startMerchantDecorationImageDrag(zone, event)}
              />
            )
          ) : (
            <span>拖入图片/视频或点击上传</span>
          )}
        </div>
        <div className="merchant-image-editor-controls">
          <label className="merchant-logo-upload-button">
            上传图片
            <input accept="image/*,video/*" type="file" onChange={(event) => handleMerchantDecorationImageInput(zone, event)} />
          </label>
          <label>
            缩放
            <input
              max="2.4"
              min="0.35"
              step="0.05"
              type="range"
              value={scale}
              onChange={(event) =>
                updateMerchantDecorationDraft(
                  activePartnerDetailSlug,
                  zone === 'hero' ? 'heroImageScale' : 'serviceImageScale',
                  Number(event.target.value),
                )
              }
            />
          </label>
          {image && (
            <button
              type="button"
              onClick={() =>
                updateMerchantDecorationDraft(activePartnerDetailSlug, zone === 'hero' ? 'heroImage' : 'serviceImage', '')
              }
            >
              移除图片
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderMerchantDesignItems = (zone: MerchantDesignZone, decoration?: MerchantBrandDecoration) => {
    const editable = canManageActivePartnerBrand && merchantDesignEditMode
    const items = (decoration?.designItems ?? []).filter((item) => item.zone === zone)
    if (!items.length && !editable) return null
    return (
      <div className="merchant-design-layer" aria-hidden={!editable}>
        {items.map((item) => {
          const selected = editable && activeMerchantStageLayerId === `design:${item.id}`
          const itemStyle: CSSProperties = {
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.width}%`,
            minHeight: `${item.height}%`,
            zIndex: item.z,
            opacity: item.opacity,
            color: item.color,
            background: item.background,
            fontSize: item.fontSize,
          }
          return (
            <Fragment key={item.id}>
              <div
                className={`merchant-design-item ${item.kind === 'media' ? 'is-media' : 'is-bubble'} ${selected ? 'is-selected' : ''}`}
                style={itemStyle}
              >
                {item.kind === 'media' && item.mediaUrl ? (
                  item.mediaKind === 'video' || isVideoDataUrl(item.mediaUrl) ? (
                    <video draggable={false} muted playsInline src={item.mediaUrl} />
                  ) : (
                    <img alt="" draggable={false} src={item.mediaUrl} />
                  )
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
              {editable && (
                <div
                  className={`merchant-design-hitbox ${selected ? 'is-selected' : ''}`}
                  style={{ ...itemStyle, background: 'transparent', color: undefined, fontSize: undefined, opacity: 1, zIndex: 190 }}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    selectMerchantDesignLayer(item.id)
                  }}
                  onDoubleClick={(event) => {
                    if (item.kind === 'media') return
                    event.preventDefault()
                    event.stopPropagation()
                    const nextText = window.prompt('修改泡泡框文字', item.text)
                    if (nextText !== null) updateMerchantDesignItem(item.id, { text: nextText })
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleMerchantDesignItemDrop(item.id, event)}
                  onPointerDown={(event) => {
                    if (event.detail > 1) {
                      const textLayer = findMerchantTextLayerAtPoint(event.clientX, event.clientY)
                      if (textLayer) {
                        event.preventDefault()
                        event.stopPropagation()
                        openMerchantTextEditor(textLayer.field, textLayer.element)
                        return
                      }
                    }
                    startMerchantDesignItemDrag(item, 'move', event)
                  }}
                  onPointerMove={(event) => moveMerchantDesignItemDrag(event)}
                  onPointerUp={endMerchantDesignItemDrag}
                  onPointerCancel={endMerchantDesignItemDrag}
                >
                  {selected && (
                    <>
                      <button
                        className="merchant-design-delete"
                        type="button"
                        onPointerDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          deleteMerchantDesignItem(item.id)
                        }}
                      >
                        ×
                      </button>
                      <span
                        className="merchant-design-resize"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => startMerchantDesignItemDrag(item, 'resize', event)}
                      />
                    </>
                  )}
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    )
  }

  const renderMerchantDecorationMedia = (zone: 'hero' | 'service', decoration?: MerchantBrandDecoration) => {
    const media = zone === 'hero' ? decoration?.heroImage : decoration?.serviceImage
    if (!media) return null
    const className =
      zone === 'hero'
        ? 'partner-detail-floating-image partner-detail-floating-image-hero'
        : 'partner-detail-floating-image partner-detail-floating-image-service'
    const style = getMerchantDecorationImageStyle(decoration, zone)
    const editable = canManageActivePartnerBrand && merchantDesignEditMode
    const sharedProps = {
      className: editable && activeMerchantStageLayerId === `media:${zone}` ? `${className} is-selected` : className,
      draggable: false,
      style,
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (!editable) return
        event.preventDefault()
        event.stopPropagation()
        selectMerchantMediaLayer(zone)
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (editable) startMerchantDecorationImageDrag(zone, event)
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (editable) moveMerchantDecorationImageDrag(event)
      },
      onPointerUp: () => {
        if (editable) endMerchantDecorationImageDrag()
      },
      onPointerCancel: () => {
        if (editable) endMerchantDecorationImageDrag()
      },
    }

    return isVideoDataUrl(media) ? (
      <video {...sharedProps} controls muted src={media} />
    ) : (
      <img {...sharedProps} alt="" src={media} />
    )
  }

  const renderMerchantTextEditor = (field: MerchantEditableTextField) => {
    if (!merchantDesignEditMode || activeMerchantTextEditor !== field) return null
    const isTextField = [
      'badge',
      'heroTitle',
      'intro',
      'contactCopy',
      'panelLabel',
      'panelTitle',
      'sectionOneTitle',
      'sectionOneText',
      'sectionTwoTitle',
      'sectionTwoText',
      'sectionThreeTitle',
      'sectionThreeText',
      'caseOne',
      'caseTwo',
      'showcaseArtTitle',
      'showcaseArtSubtitle',
    ].includes(field)
    const popoverStyle: CSSProperties | undefined = merchantTextPopoverAnchor
      ? {
          bottom: 'auto',
          left: merchantTextPopoverAnchor.left,
          position: 'fixed',
          top: merchantTextPopoverAnchor.top,
          transform: 'translate(-50%, calc(-100% - 12px))',
          width: merchantTextPopoverAnchor.width,
          zIndex: 2147483000,
        }
      : undefined
    const activeTextLayerState = getTextLayerState(activeMerchantDecorationDraft, field)
    const explicitFontSize = activeTextLayerState.fontSize || 0
    const displayedFontSize = explicitFontSize || merchantTextPopoverAnchor?.fontSize || 0
    const fontSizeOptions = Array.from(
      new Set([...MERCHANT_TEXT_FONT_SIZE_OPTIONS, explicitFontSize].filter((size) => Number.isFinite(size) && size >= 0)),
    ).sort((a, b) => a - b)
    const editor = (
      <div
        className="merchant-inline-edit-popover"
        style={popoverStyle}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {isTextField && (
          <textarea
            value={String(activeMerchantDecorationDraft[field] ?? '')}
            onChange={(event) =>
              updateMerchantDecorationDraft(activePartnerDetailSlug, field as keyof MerchantBrandDecoration, event.target.value)
            }
          />
        )}
        <div className="merchant-inline-edit-controls">
          <label>
            字体
            <select
              value={activeMerchantDecorationDraft.fontFamily}
              onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'fontFamily', event.target.value)}
            >
              <option value="">默认</option>
              <option value={'"Noto Sans SC", "Microsoft YaHei", sans-serif'}>现代黑体</option>
              <option value={'"Songti SC", "SimSun", serif'}>宋体/衬线</option>
              <option value={'Arial, sans-serif'}>Arial</option>
            </select>
          </label>
          <label>
            字号
            <select
              value={explicitFontSize}
              onChange={(event) =>
                updateTextLayerStyle(activePartnerDetailSlug, activeMerchantDecorationDraft, field, {
                  fontSize: Number(event.target.value),
                })
              }
            >
              {fontSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size === 0 ? `默认${displayedFontSize ? `（当前 ${displayedFontSize}px）` : ''}` : `${size}px`}
                </option>
              ))}
            </select>
          </label>
          <label>
            当前字色
            <input
              type="color"
              value={activeTextLayerState.color || '#10201d'}
              onChange={(event) =>
                updateTextLayerStyle(activePartnerDetailSlug, activeMerchantDecorationDraft, field, {
                  color: event.target.value,
                })
              }
            />
          </label>
          <button type="button" onClick={() => {
            setActiveMerchantTextEditor(null)
            setMerchantTextPopoverAnchor(null)
          }}>
            完成
          </button>
          <button type="button" onClick={() => moveTextLayer(activePartnerDetailSlug, activeMerchantDecorationDraft, field, 1)}>
            图层上移
          </button>
          <button type="button" onClick={() => moveTextLayer(activePartnerDetailSlug, activeMerchantDecorationDraft, field, -1)}>
            图层下移
          </button>
        </div>
      </div>
    )
    return createPortal(editor, document.body)
  }

  const getMerchantEditableTextProps = (field: MerchantEditableTextField) =>
    merchantDesignEditMode && canManageActivePartnerBrand
      ? {
          'data-merchant-inline-edit': 'true',
          'data-merchant-layer-active': activeMerchantStageLayerId === `text:${field}` ? 'true' : undefined,
          'data-merchant-text-field': field,
          onClick: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault()
            event.stopPropagation()
            selectMerchantTextLayer(field)
          },
          onDoubleClick: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault()
            event.stopPropagation()
            openMerchantTextEditor(field, event.currentTarget)
          },
          onPointerDown: (event: PointerEvent<HTMLElement>) => {
            startMerchantTextLayerDrag(field, event)
          },
        }
      : {}

  const getPartnerShowcaseEditableTextProps = (field: MerchantEditableTextField) =>
    partnerShowcaseEditMode && canManageActivePartnerMerchant
      ? {
          'data-partner-showcase-editable': 'true',
          'data-partner-showcase-active': activePartnerShowcaseTextEditor === field ? 'true' : undefined,
          'data-partner-showcase-text-field': field,
          onClick: (event: MouseEvent<HTMLElement>) => {
            event.stopPropagation()
          },
          onDoubleClick: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault()
            event.stopPropagation()
            openPartnerShowcaseTextEditor(field, event.currentTarget)
          },
                  onPointerDown: (event: PointerEvent<HTMLElement>) => {
            startPartnerShowcaseTextLayerDrag(field, event)
          },
        }
      : {}

  const renderPartnerShowcaseTextEditor = (field: MerchantEditableTextField) => {
    if (!partnerShowcaseEditMode || activePartnerShowcaseTextEditor !== field) return null
    const fieldLabel =
      field === 'badge'
        ? '展示标识'
        : field === 'heroTitle'
          ? '展示标题'
          : field === 'intro'
            ? '展示说明'
            : field === 'showcaseArtTitle'
              ? '右侧大字'
              : field === 'showcaseArtSubtitle'
                ? '右侧副标题'
                : '展示文字'
    const popoverStyle: CSSProperties | undefined = partnerShowcaseTextPopoverAnchor
      ? {
          bottom: 'auto',
          left: partnerShowcaseTextPopoverAnchor.left,
          position: 'fixed',
          top: partnerShowcaseTextPopoverAnchor.top,
          transform: 'translate(-50%, calc(-100% - 12px))',
          width: partnerShowcaseTextPopoverAnchor.width,
          zIndex: 2147483000,
        }
      : undefined
    const activeTextLayerState = getTextLayerState(activePartnerMerchantDecorationDraft, field)
    const explicitFontSize = activeTextLayerState.fontSize || 0
    const displayedFontSize = explicitFontSize || partnerShowcaseTextPopoverAnchor?.fontSize || 0
    const fontSizeOptions = Array.from(
      new Set([...MERCHANT_TEXT_FONT_SIZE_OPTIONS, explicitFontSize].filter((size) => Number.isFinite(size) && size >= 0)),
    ).sort((a, b) => a - b)
    const editor = (
      <div
        className="partner-showcase-text-popover"
        style={popoverStyle}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <label>
          {fieldLabel}
          <textarea
            value={String(activePartnerMerchantDecorationDraft[field] ?? '')}
            onChange={(event) =>
              updateMerchantDecorationDraft(activePartnerMerchantSlug, field as keyof MerchantBrandDecoration, event.target.value)
            }
          />
        </label>
        <div className="partner-showcase-popover-controls">
          <label>
            字体
            <select
              value={activePartnerMerchantDecorationDraft.fontFamily}
              onChange={(event) => updateMerchantDecorationDraft(activePartnerMerchantSlug, 'fontFamily', event.target.value)}
            >
              <option value="">默认</option>
              <option value={'"Noto Sans SC", "Microsoft YaHei", sans-serif'}>现代黑体</option>
              <option value={'"Songti SC", "SimSun", serif'}>宋体/衬线</option>
              <option value={'Arial, sans-serif'}>Arial</option>
            </select>
          </label>
          <label>
            字号
            <select
              value={explicitFontSize}
              onChange={(event) =>
                updateTextLayerStyle(activePartnerMerchantSlug, activePartnerMerchantDecorationDraft, field, {
                  fontSize: Number(event.target.value),
                })
              }
            >
              {fontSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size === 0 ? `默认${displayedFontSize ? `（当前 ${displayedFontSize}px）` : ''}` : `${size}px`}
                </option>
              ))}
            </select>
          </label>
          <label>
            当前字色
            <input
              type="color"
              value={activeTextLayerState.color || '#10201d'}
              onChange={(event) =>
                updateTextLayerStyle(activePartnerMerchantSlug, activePartnerMerchantDecorationDraft, field, {
                  color: event.target.value,
                })
              }
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setActivePartnerShowcaseTextEditor(null)
              setPartnerShowcaseTextPopoverAnchor(null)
              savePartnerShowcaseDecoration(false)
            }}
          >
            完成
          </button>
          <button
            type="button"
            onClick={() => moveTextLayer(activePartnerMerchantSlug, activePartnerMerchantDecorationDraft, field, 1)}
          >
            图层上移
          </button>
          <button
            type="button"
            onClick={() => moveTextLayer(activePartnerMerchantSlug, activePartnerMerchantDecorationDraft, field, -1)}
          >
            图层下移
          </button>
        </div>
      </div>
    )
    return createPortal(editor, document.body)
  }

  const renderPartnerShowcaseDesignItems = () => {
    const editable = canManageActivePartnerMerchant && partnerShowcaseEditMode
    const items = (activePartnerMerchantPreviewDecoration?.designItems ?? []).filter((item) => item.zone === 'showcase')
    if (!items.length && !editable) return null
    return (
      <div className="partner-showcase-design-layer" aria-hidden={!editable}>
        {items.map((item) => {
          const selected = editable && activePartnerShowcaseDesignItemId === item.id
          const itemStyle: CSSProperties = {
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.width}%`,
            minHeight: `${item.height}%`,
            zIndex: item.z,
            opacity: item.opacity,
            color: item.color,
            background: item.kind === 'media' ? 'transparent' : item.background,
            fontSize: item.fontSize,
          }
          return (
            <Fragment key={item.id}>
              <div
                className={`partner-showcase-design-item ${item.kind === 'media' ? 'is-media' : 'is-bubble'} ${selected ? 'is-selected' : ''}`}
                style={itemStyle}
              >
                {item.kind === 'media' && item.mediaUrl ? (
                  item.mediaKind === 'video' || isVideoDataUrl(item.mediaUrl) ? (
                    <video draggable={false} muted playsInline src={item.mediaUrl} />
                  ) : (
                    <img alt="" draggable={false} src={item.mediaUrl} />
                  )
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
              {editable && (
                <div
                  className={`partner-showcase-design-hitbox ${selected ? 'is-selected' : ''}`}
                  style={{ ...itemStyle, opacity: 1, zIndex: 190 }}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setActivePartnerShowcaseDesignItemId(item.id)
                  }}
                  onDoubleClick={(event) => {
                    if (item.kind === 'media') return
                    event.preventDefault()
                    event.stopPropagation()
                    const nextText = window.prompt('修改文本框文字', item.text)
                    if (nextText !== null) updatePartnerShowcaseDesignItem(item.id, { text: nextText })
                  }}
                  onPointerDown={(event) => {
                    if (event.detail > 1) {
                      const textLayer = findPartnerShowcaseTextLayerAtPoint(event.clientX, event.clientY)
                      if (textLayer) {
                        event.preventDefault()
                        event.stopPropagation()
                        openPartnerShowcaseTextEditor(textLayer.field, textLayer.element)
                        return
                      }
                    }
                    startPartnerShowcaseDesignItemDrag(item, 'move', event)
                  }}
                  onPointerMove={(event) => movePartnerShowcaseDesignItemDrag(event)}
                  onPointerUp={endPartnerShowcaseDesignItemDrag}
                  onPointerCancel={endPartnerShowcaseDesignItemDrag}
                >
                  {selected && (
                    <>
                      <div className="partner-showcase-layer-controls">
                        <button type="button" onPointerDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }} onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          movePartnerShowcaseDesignItemLayer(item.id, 1)
                        }}>↑</button>
                        <button type="button" onPointerDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }} onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          movePartnerShowcaseDesignItemLayer(item.id, -1)
                        }}>↓</button>
                        <button type="button" onPointerDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }} onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          deletePartnerShowcaseDesignItem(item.id)
                        }}>×</button>
                      </div>
                      {item.kind === 'bubble' && (
                        <div
                          className="partner-showcase-item-controls"
                          onPointerDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <label>
                            字号
                            <input
                              max="96"
                              min="12"
                              type="range"
                              value={item.fontSize}
                              onChange={(event) => updatePartnerShowcaseDesignItem(item.id, { fontSize: Number(event.target.value) })}
                            />
                          </label>
                          <label>
                            字色
                            <input
                              type="color"
                              value={item.color || '#10201d'}
                              onChange={(event) => updatePartnerShowcaseDesignItem(item.id, { color: event.target.value })}
                            />
                          </label>
                          <label>
                            透明
                            <input
                              max="1"
                              min="0.1"
                              step="0.05"
                              type="range"
                              value={item.opacity}
                              onChange={(event) => updatePartnerShowcaseDesignItem(item.id, { opacity: Number(event.target.value) })}
                            />
                          </label>
                        </div>
                      )}
                      <span
                        className="partner-showcase-design-resize"
                        title="拖动缩放，按住 Shift 保持比例"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => startPartnerShowcaseDesignItemDrag(item, 'resize', event)}
                      />
                    </>
                  )}
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    )
  }

  const renderMerchantMediaControls = (zone: 'hero' | 'service') => {
    if (!merchantDesignEditMode || activeMerchantMediaZone !== zone) return null
    const scale = zone === 'hero' ? activeMerchantDecorationDraft.heroImageScale : activeMerchantDecorationDraft.serviceImageScale
    return (
      <div className="merchant-media-inline-controls">
        <span>{zone === 'hero' ? '主视觉素材' : '服务展示素材'}</span>
        <label>
          大小
          <input
            max="2.4"
            min="0.35"
            step="0.05"
            type="range"
            value={scale}
            onChange={(event) =>
              updateMerchantDecorationDraft(
                activePartnerDetailSlug,
                zone === 'hero' ? 'heroImageScale' : 'serviceImageScale',
                Number(event.target.value),
              )
            }
          />
        </label>
        <button
          type="button"
          onClick={() => updateMerchantDecorationDraft(activePartnerDetailSlug, zone === 'hero' ? 'heroImage' : 'serviceImage', '')}
        >
          删除
        </button>
      </div>
    )
  }

  const renderMerchantStudioTools = () => {
    if (!canManageActivePartnerBrand || !merchantDesignEditMode) return null
    return (
      <aside className="merchant-studio-panel merchant-studio-tools" aria-label="商家编辑工具栏">
        <div className="merchant-studio-heading">
          <strong>工具</strong>
          <span>编辑模式</span>
        </div>
        <div className="merchant-studio-avatar-mini">
          <div
            className={`partner-logo-mark ${activePartnerDetail.showcase.tone} ${
              activeMerchantDecorationDraft.pendingLogoImage || activePartnerDetailLogoImage ? 'has-image' : ''
            }`}
          >
            {activeMerchantDecorationDraft.pendingLogoImage ? (
              <img src={activeMerchantDecorationDraft.pendingLogoImage} alt="" />
            ) : activePartnerDetailLogoImage ? (
              <img src={activePartnerDetailLogoImage} alt="" />
            ) : (
              <span>{activePartnerDetail.merchant.logo}</span>
            )}
          </div>
          <label className="merchant-studio-file-button">
            <UploadCloud size={16} aria-hidden="true" />
            上传头像
            <input accept="image/*" type="file" onChange={handleMerchantLogoUpload} />
          </label>
        </div>
        <div className="merchant-studio-tool-grid">
          <button className="is-active" type="button">
            <MousePointer2 size={18} aria-hidden="true" />
            移动
          </button>
          <button type="button" onClick={() => addMerchantDesignBubble('hero')}>
            <Type size={18} aria-hidden="true" />
            主视觉文本
          </button>
          <button type="button" onClick={() => addMerchantDesignBubble('service')}>
            <SquareDashedMousePointer size={18} aria-hidden="true" />
            服务区文本
          </button>
          <button type="button" onClick={() => setActiveMerchantTextEditor(null)}>
            <Pipette size={18} aria-hidden="true" />
            吸管
          </button>
        </div>
        <label className="merchant-studio-file-button">
          <UploadCloud size={16} aria-hidden="true" />
          {activeMerchantDesignItem ? '上传到选中框' : activeMerchantMediaZone === 'hero' ? '上传到主视觉' : '上传到服务区'}
          <input
            accept="image/*,video/*"
            type="file"
            onChange={handleMerchantStudioMediaInput}
          />
        </label>
        <p className="merchant-studio-tip">双击原有文字可改文案；选中泡泡框后可拖动、拉伸、调色、换图或删除。</p>
        <div className="merchant-studio-actions">
          <button type="button" onClick={saveMerchantDecoration}>保存</button>
          <button type="button" onClick={() => setMerchantDesignEditMode(false)}>退出</button>
        </div>
        {merchantDecorationNotice && <p className="merchant-studio-notice">{merchantDecorationNotice}</p>}
      </aside>
    )
  }

  const renderMerchantStudioInspector = () => {
    if (!canManageActivePartnerBrand || !merchantDesignEditMode) return null
    type MerchantStudioLayer =
      | {
          id: MerchantStageLayerId
          kind: 'text'
          field: MerchantEditableTextField
          group: string
          title: string
          preview: string
        }
      | {
          id: MerchantStageLayerId
          kind: 'media'
          zone: 'hero' | 'service'
          group: string
          title: string
          preview: string
        }
      | {
          id: MerchantStageLayerId
          kind: 'design'
          item: MerchantDesignItem
          group: string
          title: string
          preview: string
        }
    const textLayers: MerchantStudioLayer[] = [
      { id: 'text:badge', kind: 'text', field: 'badge', group: '主视觉', title: '页面标识', preview: activeMerchantDecorationDraft.badge },
      { id: 'text:showcaseArtTitle', kind: 'text', field: 'showcaseArtTitle', group: '主视觉', title: '品牌大字', preview: activeMerchantDecorationDraft.showcaseArtTitle },
      { id: 'text:heroTitle', kind: 'text', field: 'heroTitle', group: '主视觉', title: '主标题', preview: activeMerchantDecorationDraft.heroTitle },
      { id: 'text:intro', kind: 'text', field: 'intro', group: '主视觉', title: '品牌介绍', preview: activeMerchantDecorationDraft.intro },
      { id: 'text:panelLabel', kind: 'text', field: 'panelLabel', group: '右侧卡片', title: '右侧标识', preview: activeMerchantDecorationDraft.panelLabel },
      { id: 'text:panelTitle', kind: 'text', field: 'panelTitle', group: '右侧卡片', title: '右侧标题', preview: activeMerchantDecorationDraft.panelTitle },
      { id: 'text:contactCopy', kind: 'text', field: 'contactCopy', group: '右侧卡片', title: '咨询提示', preview: activeMerchantDecorationDraft.contactCopy },
      { id: 'text:sectionOneTitle', kind: 'text', field: 'sectionOneTitle', group: '说明卡片', title: '卡片 1 标题', preview: activeMerchantDecorationDraft.sectionOneTitle },
      { id: 'text:sectionOneText', kind: 'text', field: 'sectionOneText', group: '说明卡片', title: '卡片 1 内容', preview: activeMerchantDecorationDraft.sectionOneText },
      { id: 'text:sectionTwoTitle', kind: 'text', field: 'sectionTwoTitle', group: '说明卡片', title: '卡片 2 标题', preview: activeMerchantDecorationDraft.sectionTwoTitle },
      { id: 'text:sectionTwoText', kind: 'text', field: 'sectionTwoText', group: '说明卡片', title: '卡片 2 内容', preview: activeMerchantDecorationDraft.sectionTwoText },
      { id: 'text:sectionThreeTitle', kind: 'text', field: 'sectionThreeTitle', group: '说明卡片', title: '卡片 3 标题', preview: activeMerchantDecorationDraft.sectionThreeTitle },
      { id: 'text:sectionThreeText', kind: 'text', field: 'sectionThreeText', group: '说明卡片', title: '卡片 3 内容', preview: activeMerchantDecorationDraft.sectionThreeText },
      { id: 'text:caseOne', kind: 'text', field: 'caseOne', group: '服务区', title: '服务展示 1', preview: activeMerchantDecorationDraft.caseOne },
      { id: 'text:caseTwo', kind: 'text', field: 'caseTwo', group: '服务区', title: '服务展示 2', preview: activeMerchantDecorationDraft.caseTwo },
    ]
    const mediaLayers: MerchantStudioLayer[] = [
      activeMerchantDecorationDraft.heroImage
        ? {
            id: 'media:hero',
            kind: 'media',
            zone: 'hero',
            group: '素材',
            title: '主视觉图片/视频',
            preview: isVideoDataUrl(activeMerchantDecorationDraft.heroImage) ? '视频素材' : '图片素材',
          }
        : null,
      activeMerchantDecorationDraft.serviceImage
        ? {
            id: 'media:service',
            kind: 'media',
            zone: 'service',
            group: '素材',
            title: '服务区图片/视频',
            preview: isVideoDataUrl(activeMerchantDecorationDraft.serviceImage) ? '视频素材' : '图片素材',
          }
        : null,
    ].filter(Boolean) as MerchantStudioLayer[]
    const designLayers: MerchantStudioLayer[] = [...activeMerchantDecorationDraft.designItems]
      .sort((a, b) => b.z - a.z)
      .map((item) => ({
        id: `design:${item.id}`,
        kind: 'design',
        item,
        group: item.zone === 'hero' ? '主视觉自定义' : '服务区自定义',
        title: item.kind === 'media' ? `${item.mediaKind === 'video' ? '视频' : '图片'}图层` : '文本泡泡',
        preview: item.kind === 'media' ? `位置 ${Math.round(item.x)}%, ${Math.round(item.y)}%` : item.text || '空文本框',
      }))
    const stageLayers = [...textLayers, ...mediaLayers, ...designLayers]
    const selectedStageLayer = stageLayers.find((layer) => layer.id === activeMerchantStageLayerId)
    const selectMerchantStudioLayer = (layer: MerchantStudioLayer) => {
      if (layer.kind === 'text') selectMerchantTextLayer(layer.field)
      if (layer.kind === 'media') selectMerchantMediaLayer(layer.zone)
      if (layer.kind === 'design') selectMerchantDesignLayer(layer.item.id)
    }
    return (
      <aside className="merchant-studio-panel merchant-studio-inspector" aria-label="商家编辑属性面板">
        <div className="merchant-studio-heading">
          <strong>调色盘</strong>
          <span>{selectedStageLayer ? selectedStageLayer.title : '未选中元素'}</span>
        </div>
        <div className="merchant-studio-section">
          <label>
            全局字体
            <select
              value={activeMerchantDecorationDraft.fontFamily}
              onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'fontFamily', event.target.value)}
            >
              <option value="">跟随平台默认</option>
              <option value={'"Noto Sans SC", "Microsoft YaHei", sans-serif'}>现代黑体</option>
              <option value={'"Songti SC", "SimSun", serif'}>宋体/衬线</option>
              <option value={'Arial, sans-serif'}>Arial</option>
            </select>
          </label>
          <div className="merchant-studio-color-grid">
            <label>
              标题色
              <input
                type="color"
                value={activeMerchantDecorationDraft.titleColor || '#10201d'}
                onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'titleColor', event.target.value)}
              />
            </label>
            <label>
              正文色
              <input
                type="color"
                value={activeMerchantDecorationDraft.bodyColor || '#4d5d58'}
                onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'bodyColor', event.target.value)}
              />
            </label>
            <label>
              重点色
              <input
                type="color"
                value={activeMerchantDecorationDraft.accentColor || '#ef5a3c'}
                onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'accentColor', event.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="merchant-studio-section">
          <div className="merchant-studio-heading is-small">
            <strong>选中对象</strong>
            <span>{activeMerchantDesignItem ? activeMerchantDesignItem.kind === 'media' ? '图片/视频' : '文本泡泡' : '请选择舞台元素'}</span>
          </div>
          {activeMerchantDesignItem ? (
            <div className="merchant-studio-controls">
              <label>
                字号
                <input
                  max="72"
                  min="12"
                  type="range"
                  value={activeMerchantDesignItem.fontSize}
                  onChange={(event) => updateMerchantDesignItem(activeMerchantDesignItem.id, { fontSize: Number(event.target.value) })}
                />
              </label>
              <label>
                透明度
                <input
                  max="1"
                  min="0.08"
                  step="0.02"
                  type="range"
                  value={activeMerchantDesignItem.opacity}
                  onChange={(event) => updateMerchantDesignItem(activeMerchantDesignItem.id, { opacity: Number(event.target.value) })}
                />
              </label>
              <div className="merchant-studio-color-grid">
                <label>
                  字色
                  <input
                    type="color"
                    value={activeMerchantDesignItem.color}
                    onChange={(event) => updateMerchantDesignItem(activeMerchantDesignItem.id, { color: event.target.value })}
                  />
                </label>
                <label>
                  底色
                  <input
                    type="color"
                    value={activeMerchantDesignItem.background.startsWith('#') ? activeMerchantDesignItem.background : '#fffdf7'}
                    onChange={(event) => updateMerchantDesignItem(activeMerchantDesignItem.id, { background: event.target.value })}
                  />
                </label>
              </div>
              <div className="merchant-studio-actions is-grid">
                <button type="button" onClick={() => moveMerchantDesignItemLayer(activeMerchantDesignItem.id, 1)}>上移</button>
                <button type="button" onClick={() => moveMerchantDesignItemLayer(activeMerchantDesignItem.id, -1)}>下移</button>
                <button type="button" onClick={() => deleteMerchantDesignItem(activeMerchantDesignItem.id)}>
                  <Trash2 size={15} aria-hidden="true" />
                  删除
                </button>
              </div>
            </div>
          ) : (
            <p className="merchant-studio-tip">点选中间舞台里的泡泡框或素材后，这里会显示大小、颜色、透明度和图层设置。</p>
          )}
        </div>
        <div className="merchant-studio-section merchant-studio-layers">
          <div className="merchant-studio-heading is-small">
            <strong>图层</strong>
            <span>{stageLayers.length} 个对象</span>
          </div>
          <div className="merchant-studio-layer-list">
            {stageLayers.length ? (
              stageLayers.map((layer) => (
                <button
                  className={activeMerchantStageLayerId === layer.id ? 'is-selected' : ''}
                  key={layer.id}
                  type="button"
                  onClick={() => selectMerchantStudioLayer(layer)}
                >
                  <span>{layer.group}</span>
                  <strong>{layer.title}</strong>
                  <small>{layer.preview}</small>
                </button>
              ))
            ) : (
              <p className="merchant-studio-tip">舞台上还没有可选择对象。</p>
            )}
          </div>
        </div>
      </aside>
    )
  }

  const saveMerchantDecoration = async () => {
    if (!currentUser) {
      setAuthMode('login')
      setMerchantDecorationNotice('请先登录商家账号。')
      return
    }
    if (!canManageActivePartnerBrand) {
      setMerchantDecorationNotice('当前账号还没有这个品牌详情页的装饰权限。')
      return
    }
    const nextDecoration = normalizeMerchantBrandDecoration({
      ...activeMerchantDecorationDraft,
      brandId: activePartnerDetailSlug,
      ownerUserId: currentUser.id,
      updatedAt: new Date().toISOString(),
    })
    setAppState((state) => ({
      ...state,
      merchantBrandDecorations: mergeMerchantBrandDecorations([
        ...state.merchantBrandDecorations.filter((decoration) => decoration.brandId !== nextDecoration.brandId),
        nextDecoration,
      ]),
    }))

    try {
      const response = await fetch(`/api/merchant-brand-decorations/${encodeURIComponent(nextDecoration.brandId)}`, {
        body: JSON.stringify({ userId: currentUser.id, decoration: nextDecoration }),
        headers: { 'content-type': 'application/json' },
        method: 'PUT',
      })
      const data = (await response.json()) as {
        merchantBrandDecoration?: MerchantBrandDecoration
        merchantBrandDecorations?: MerchantBrandDecoration[]
        error?: string
      }
      if (!response.ok) throw new Error(data.error)
      setAppState((state) => ({
        ...state,
        merchantBrandDecorations: mergeMerchantBrandDecorations(data.merchantBrandDecorations ?? [data.merchantBrandDecoration ?? nextDecoration]),
      }))
      setMerchantDecorationDrafts((drafts) => {
        const { [nextDecoration.brandId]: _saved, ...rest } = drafts
        return rest
      })
      setMerchantDecorationNotice('品牌详情页装饰已保存。')
    } catch (error) {
      setMerchantDecorationNotice(error instanceof Error && error.message ? error.message : '保存失败，请稍后重试。')
    }
  }

  const savePartnerShowcaseDecoration = async (closeEditor = true) => {
    if (!currentUser) {
      setAuthMode('login')
      setMerchantDecorationNotice('请先登录商家账号。')
      return
    }
    if (!canManageActivePartnerMerchant) {
      setMerchantDecorationNotice('当前账号还没有这个商家展示卡的编辑权限。')
      return
    }
    const nextDecoration = normalizeMerchantBrandDecoration({
      ...activePartnerMerchantDecorationDraft,
      brandId: activePartnerMerchantSlug,
      ownerUserId: currentUser.id,
      updatedAt: new Date().toISOString(),
    })
    setPartnerShowcaseSaving(true)
    setMerchantDecorationNotice('正在保存商家展示卡...')
    setAppState((state) => ({
      ...state,
      merchantBrandDecorations: mergeMerchantBrandDecorations([
        ...state.merchantBrandDecorations.filter((decoration) => decoration.brandId !== nextDecoration.brandId),
        nextDecoration,
      ]),
    }))

    try {
      const response = await fetch(`/api/merchant-brand-decorations/${encodeURIComponent(nextDecoration.brandId)}`, {
        body: JSON.stringify({ userId: currentUser.id, decoration: nextDecoration }),
        headers: { 'content-type': 'application/json' },
        method: 'PUT',
      })
      const data = (await response.json()) as {
        merchantBrandDecoration?: MerchantBrandDecoration
        merchantBrandDecorations?: MerchantBrandDecoration[]
        error?: string
      }
      if (!response.ok) throw new Error(data.error)
      setAppState((state) => ({
        ...state,
        merchantBrandDecorations: mergeMerchantBrandDecorations(data.merchantBrandDecorations ?? [data.merchantBrandDecoration ?? nextDecoration]),
      }))
      setMerchantDecorationDrafts((drafts) => {
        const { [nextDecoration.brandId]: _saved, ...rest } = drafts
        return rest
      })
      if (closeEditor) setPartnerShowcaseEditMode(false)
      setMerchantDecorationNotice('商家展示卡已保存。')
    } catch (error) {
      setMerchantDecorationNotice(error instanceof Error && error.message ? error.message : '保存失败，请稍后重试。')
    } finally {
      setPartnerShowcaseSaving(false)
    }
  }

  const updateMerchantBrandDecoration = (brandId: string, patch: Partial<MerchantBrandDecoration>) => {
    const previousDecoration =
      appState.merchantBrandDecorations.find((decoration) => decoration.brandId === brandId) ??
      normalizeMerchantBrandDecoration({ brandId })
    const nextDecoration = normalizeMerchantBrandDecoration({
      ...previousDecoration,
      ...patch,
      brandId,
      updatedAt: new Date().toISOString(),
    })
    setAppState((state) => ({
      ...state,
      merchantBrandDecorations: mergeMerchantBrandDecorations([
        ...state.merchantBrandDecorations.filter((decoration) => decoration.brandId !== brandId),
        nextDecoration,
      ]),
    }))
    if (adminToken) {
      fetch(`/api/admin/merchant-brand-decorations/${encodeURIComponent(brandId)}`, {
        body: JSON.stringify(patch),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PATCH',
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { merchantBrandDecorations?: Partial<MerchantBrandDecoration>[] } | null) => {
          if (!data?.merchantBrandDecorations) return
          setAppState((state) => ({
            ...state,
            merchantBrandDecorations: mergeMerchantBrandDecorations(data.merchantBrandDecorations),
          }))
        })
        .catch(() => setMessage('商家头像审核状态保存失败，请稍后重试。'))
    }
  }

  const saveSiteContent = async () => {
    const nextContent = normalizeSiteContent(contentDraft)
    setAppState((state) => ({ ...state, siteContent: nextContent }))

    if (!adminToken) {
      setMessage('内容已保存到当前浏览器。登录后台后可保存到线上数据库。')
      return
    }

    try {
      const response = await fetch('/api/admin/site-content', {
        body: JSON.stringify({ siteContent: nextContent }),
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'application/json',
        },
        method: 'PUT',
      })
      if (!response.ok) throw new Error('site-content-save-failed')
      const data = (await response.json()) as { siteContent?: Partial<SiteContentSettings> }
      const savedContent = normalizeSiteContent(data.siteContent ?? nextContent)
      setContentDraft(savedContent)
      setAppState((state) => ({ ...state, siteContent: savedContent }))
      setMessage('网站内容设置已保存，刷新后仍然生效。')
    } catch {
      setMessage('内容已先保存到当前浏览器，线上保存失败，请稍后重试。')
    }
  }

  const resetSiteContentDraft = () => {
    setContentDraft(defaultSiteContent)
    setMessage('已恢复默认草稿，点保存后才会生效。')
  }

  const startInlineEditing = () => {
    setContentDraft(siteContent)
    setInlineEditMode(true)
    if (currentPath !== '/') {
      navigateToPath('/')
    }
  }

  const cancelInlineEditing = () => {
    setContentDraft(siteContent)
    setInlineEditMode(false)
  }

  const saveInlineEditing = async () => {
    await saveSiteContent()
    setInlineEditMode(false)
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
    navigateToSchoolBrowser()
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
    const data = (await response.json()) as {
      users: User[]
      posts: Post[]
      reports?: ContentReport[]
      partnerApplications?: PartnerApplication[]
      merchantLeads?: MerchantLead[]
      merchantBrandDecorations?: Partial<MerchantBrandDecoration>[]
      questionBounties?: QuestionBounty[]
      questionDisputes?: QuestionDispute[]
      pointOrders?: PointOrder[]
      withdrawalRequests?: WithdrawalRequest[]
      pointLedger?: PointLedger[]
      siteContent?: Partial<SiteContentSettings>
    }
    const nextSiteContent = normalizeSiteContent(data.siteContent ?? appState.siteContent)
    setAppState((state) => ({
      ...state,
      users: data.users ?? state.users,
      posts: data.posts?.length ? data.posts : state.posts,
      reports: data.reports ?? state.reports,
      partnerApplications: data.partnerApplications?.map(normalizePartnerApplication) ?? state.partnerApplications,
      merchantLeads: data.merchantLeads ?? state.merchantLeads,
      merchantBrandDecorations: mergeMerchantBrandDecorations(data.merchantBrandDecorations ?? state.merchantBrandDecorations),
      questionBounties: data.questionBounties ?? state.questionBounties,
      questionDisputes: data.questionDisputes ?? state.questionDisputes,
      pointOrders: data.pointOrders ?? state.pointOrders,
      withdrawalRequests: data.withdrawalRequests ?? state.withdrawalRequests,
      pointLedger: data.pointLedger ?? state.pointLedger,
      siteContent: nextSiteContent,
    }))
    setContentDraft(nextSiteContent)
  }

  const submitRechargeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) {
      setAuthMode('login')
      setMessage('请先登录后再提交充值申请。')
      return
    }
    const amountYuan = Math.max(0, Math.floor(Number(rechargeAmount) || 0))
    try {
      const response = await fetch('/api/wallet/recharge-orders', {
        body: JSON.stringify({ userId: currentUser.id, amountYuan, channel: 'manual' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { order?: PointOrder; pointOrders?: PointOrder[]; error?: string }
      if (!response.ok || !data.order) {
        setMessage(data.error ?? '充值申请提交失败，请稍后重试。')
        return
      }
      setAppState((state) => ({
        ...state,
        pointOrders: data.pointOrders ?? [data.order!, ...state.pointOrders],
      }))
      setMessage(`充值申请已提交：${data.order.amountYuan} 元 / ${data.order.points} 消费积分，后台确认后入账。`)
    } catch {
      setMessage('网络连接不稳定，充值申请提交失败。')
    }
  }

  const submitWithdrawalRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) {
      setAuthMode('login')
      setMessage('请先登录后再申请提现。')
      return
    }
    try {
      const response = await fetch('/api/wallet/withdrawals', {
        body: JSON.stringify({
          userId: currentUser.id,
          earningPoints: Number(withdrawalForm.earningPoints) || 0,
          payoutMethod: withdrawalForm.payoutMethod,
          accountLabel: withdrawalForm.accountLabel,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as {
        withdrawal?: WithdrawalRequest
        withdrawalRequests?: WithdrawalRequest[]
        users?: User[]
        error?: string
      }
      if (!response.ok || !data.withdrawal) {
        setMessage(data.error ?? '提现申请提交失败，请稍后重试。')
        return
      }
      setAppState((state) => ({
        ...state,
        users: data.users ?? state.users,
        withdrawalRequests: data.withdrawalRequests ?? [data.withdrawal!, ...state.withdrawalRequests],
      }))
      setMessage(`提现申请已提交：${data.withdrawal.earningPoints} 可提现积分，进入后台审核。`)
      setWithdrawalForm((form) => ({ ...form, accountLabel: '' }))
    } catch {
      setMessage('网络连接不稳定，提现申请提交失败。')
    }
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

    if (!authForm.agreementAccepted) {
      setMessage('请先阅读并勾选同意用户协议、隐私政策和未成年人个人信息保护规则。')
      setAuthNotice('请先勾选同意《用户协议》《隐私政策》《未成年人个人信息保护规则》。')
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

    if (!/^\d{6}$/.test(authForm.emailCode.trim())) {
      setMessage('请先完成邮箱验证码校验。')
      setAuthNotice('请发送验证码，并输入邮箱收到的 6 位数字。')
      return
    }

    if (authForm.userType === 'student' && !authForm.studentStage) {
      setMessage('请选择学生阶段。')
      setAuthNotice('请选择学生阶段。')
      return
    }

    if (authForm.userType === 'merchant' && (!authForm.businessName.trim() || !authForm.businessCategory)) {
      setMessage('请填写商家/机构名称和服务类型。')
      setAuthNotice('请填写商家/机构名称和服务类型。')
      return
    }

    if (authForm.userType === 'merchant' && (!authForm.country.trim() || !authForm.city.trim())) {
      setMessage('请填写商家所在国家和城市。')
      setAuthNotice('请填写商家所在国家和城市。')
      return
    }

    if (appState.users.some((user) => user.email === email)) {
      setMessage('这个邮箱已经注册过了，可以直接登录。')
      setAuthNotice('这个邮箱已经注册过了，可以直接登录。')
      return
    }

    const userName =
      authForm.userType === 'merchant'
        ? authForm.businessName.trim()
        : authForm.name.trim() || '韩国留学用户'
    const identity =
      authForm.userType === 'merchant'
        ? `商家 · ${authForm.businessCategory}`
        : studentStageLabels[authForm.studentStage]
    const school =
      authForm.userType === 'merchant'
        ? `${authForm.country.trim()} · ${authForm.city.trim()}`
        : authForm.school.trim() || '暂未填写'

    const user: User = {
      id: createId('user'),
      name: userName,
      email,
      password,
      identity,
      school,
      points: registerBonusPoints,
      earningPoints: 0,
      joinedAt: new Date().toISOString(),
      status: 'active',
      verificationStatus: 'pending',
      avatarUrl: authForm.avatarUrl.trim(),
      bio: authForm.bio.trim(),
      documents: [],
    }

    try {
      const response = await fetch('/api/auth/register', {
        body: JSON.stringify({
          userType: authForm.userType,
          studentStage: authForm.userType === 'student' ? authForm.studentStage : undefined,
          nickname: authForm.userType === 'student' ? userName : undefined,
          businessName: authForm.userType === 'merchant' ? authForm.businessName.trim() : undefined,
          businessCategory: authForm.userType === 'merchant' ? authForm.businessCategory : undefined,
          country: authForm.userType === 'merchant' ? authForm.country.trim() : undefined,
          city: authForm.userType === 'merchant' ? authForm.city.trim() : undefined,
          school: authForm.userType === 'student' ? authForm.school.trim() : undefined,
          email,
          password,
          confirmPassword,
          emailCode: authForm.emailCode.trim(),
        }),
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
      setMessage('注册需要完成邮箱验证码校验，请稍后重试。')
      setAuthNotice('注册需要通过邮箱验证码接口验证，当前网络连接不稳定，请稍后重试。')
      return
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
      userType: 'student',
      studentStage: 'preparing',
      school: '',
      businessName: '',
      businessCategory: businessCategoryOptions[0],
      country: '韩国',
      city: '',
      avatarUrl: '',
      bio: '',
      agreementAccepted: false,
    })
    setMessage(`注册成功，已获得 ${registerBonusPoints} 消费积分，可用于解锁加精内容。`)
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
    setEmailCodeSending(true)
    try {
      const response = await fetch('/api/auth/send-email-code', {
        body: JSON.stringify({ email }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) {
        setAuthNotice(data.error ?? '验证码邮件发送失败。')
        setMessage(data.error ?? '验证码邮件发送失败。')
        return
      }
      setPendingEmail(email)
      setAuthForm((form) => ({ ...form, emailCode: '' }))
      setEmailCodeCooldown(60)
      setAuthNotice(data.message ?? `验证码已发送到 ${email}，请在 10 分钟内填写。`)
      setMessage(`验证码已发送到 ${email}。`)
    } catch {
      setAuthNotice('验证码邮件发送失败，请稍后再试。')
      setMessage('验证码邮件发送失败，请稍后再试。')
    } finally {
      setEmailCodeSending(false)
    }
  }

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) {
      setAuthMode('register')
      setMessage('请先注册或登录，再发布内容。')
      return
    }
    if (currentUser.status === 'muted' || currentUser.status === 'banned') {
      setMessage(currentUser.status === 'banned' ? '账号已被封号，不能发布内容。' : '账号已被禁言，暂时不能发布内容。')
      return
    }
    if (!publishMode) {
      setMessage('请先选择“我知道”或“我能做”。')
      return
    }

    const price = Math.max(0, Number.parseInt(postForm.price, 10) || 0)
    if (!postForm.title.trim() || !postForm.body.trim()) {
      setMessage(publishMode === 'skill' ? '技能标题和服务说明是必填项。' : '标题和正文是必填项。')
      return
    }
    if (publishMode === 'skill' && (!postForm.serviceArea.trim() || !postForm.availability.trim())) {
      setMessage('发布技能服务时，请写清可服务区域和可接时间。')
      return
    }

    const serviceMeta =
      publishMode === 'skill'
        ? [
            `服务分类：${postForm.skillCategory}`,
            `服务区域：${postForm.serviceArea.trim()}`,
            `可接时间：${postForm.availability.trim()}`,
          ].join('\n')
        : ''
    const body = publishMode === 'skill' ? `${serviceMeta}\n\n${postForm.body.trim()}` : postForm.body.trim()
    const excerpt =
      postForm.excerpt.trim() ||
      (publishMode === 'skill'
        ? `${postForm.serviceArea.trim()} · ${postForm.availability.trim()}`
        : postForm.body.trim().slice(0, 58))
    const post: Post = {
      id: createId('post'),
      title: postForm.title.trim(),
      school: postForm.school.trim() || '韩国留学',
      category: publishMode === 'skill' ? postForm.skillCategory : postForm.category,
      author: currentUser.name,
      authorId: currentUser.id,
      price,
      hot: '新发布',
      excerpt,
      body,
      createdAt: new Date().toISOString(),
      contentType: publishMode === 'skill' ? '技能服务' : '经验帖',
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
        setMessage(data.error ?? '发布失败，请稍后再试。')
        return
      }
      post.id = data.post.id
      post.createdAt = data.post.createdAt
      post.author = data.post.author
      post.authorId = data.post.authorId
    } catch {
      setMessage('网络连接不稳定，本次内容已暂存，请稍后刷新确认。')
    }

    setAppState((state) => ({
      ...state,
      posts: [post, ...state.posts],
      users: state.users.map((user) =>
        user.id === currentUser.id ? { ...user, points: user.points + postApprovedBonusPoints } : user,
      ),
    }))
    resetPostForm()
    closePublishModal()
    setMessage(
      publishMode === 'skill'
        ? `技能服务发布成功，系统已奖励 ${postApprovedBonusPoints} 消费积分。后续接悬赏任务并获认可后可获得可提现积分。`
        : `发布成功，系统已奖励 ${postApprovedBonusPoints} 消费积分。被付费解锁后会进入可提现积分。`,
    )
  }

  const handleQuestionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) {
      setAuthMode('login')
      setMessage('请先登录后再发布问题。')
      return
    }
    if (currentUser.status === 'muted' || currentUser.status === 'banned') {
      setMessage(currentUser.status === 'banned' ? '账号已被封号，不能发布问题。' : '账号已被禁言，暂时不能发布问题。')
      return
    }

    const rewardPoints = Math.max(0, Number.parseInt(questionForm.rewardPoints, 10) || 0)
    if (!questionForm.title.trim() || !questionForm.detail.trim()) {
      setMessage('问题标题和详情是必填项。')
      return
    }
    if (questionForm.detail.trim().length < 12) {
      setMessage('问题详情请至少写 12 个字，方便别人判断背景。')
      return
    }
    if (rewardPoints > currentUser.points) {
      setMessage(`消费积分不足，最多可设置 ${currentUser.points} 积分悬赏。`)
      return
    }

    const question: CommunityQuestion = {
      id: createId('question'),
      title: questionForm.title.trim(),
      category: questionForm.category,
      country: questionForm.country.trim() || '韩国',
      city: questionForm.city.trim(),
      school: questionForm.school.trim() || '韩国留学',
      rewardPoints,
      answersCount: 0,
      views: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
      author: currentUser.name,
      identity: currentUser.identity,
      tags: [questionForm.country.trim(), questionForm.city.trim(), questionForm.school.trim(), questionForm.category]
        .filter(Boolean)
        .slice(0, 6),
      detail: questionForm.detail.trim(),
    }

    try {
      const response = await fetch('/api/questions', {
        body: JSON.stringify({ ...question, userId: currentUser.id }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as { question?: CommunityQuestion; error?: string }
      if (!response.ok || !data.question) {
        setMessage(data.error ?? '问题发布失败，请稍后再试。')
        return
      }
      Object.assign(question, data.question)
    } catch {
      setMessage('网络连接不稳定，本次问题已暂存，请稍后刷新确认。')
    }

    setAppState((state) => ({
      ...state,
      questions: [question, ...state.questions],
    }))
    setQuestionForm({
      title: '',
      category: '签证/滞留资格',
      country: '韩国',
      city: '首尔',
      school: allSchoolProfiles[0].name,
      rewardPoints: '0',
      detail: '',
    })
    setAskQuestionOpen(false)
    setMessage('问题已发布，等待同校或同城有经验的人来回答。')
    navigateToPath(`/questions/${question.id}`)
  }

  const handleAnswerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedQuestion) return
    if (!currentUser) {
      setAuthMode('login')
      setMessage('请先登录后回答问题。')
      return
    }
    if (currentUser.status === 'muted' || currentUser.status === 'banned') {
      setMessage(currentUser.status === 'banned' ? '账号已被封号，不能回答问题。' : '账号已被禁言，暂时不能回答问题。')
      return
    }
    const content = answerForm.content.trim()
    if (content.length < 20) {
      setMessage('回答请至少写 20 个字，说明材料、流程或经验边界。')
      return
    }

    const answer: QuestionAnswer = {
      id: createId('answer'),
      questionId: selectedQuestion.id,
      author: currentUser.name,
      identity: currentUser.identity,
      content,
      likes: 0,
      accepted: false,
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch(`/api/questions/${encodeURIComponent(selectedQuestion.id)}/answers`, {
        body: JSON.stringify({ userId: currentUser.id, content }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const data = (await response.json()) as {
        answer?: QuestionAnswer
        question?: CommunityQuestion
        users?: User[]
        error?: string
      }
      if (!response.ok || !data.answer) {
        setMessage(data.error ?? '回答提交失败，请稍后再试。')
        return
      }
      Object.assign(answer, data.answer)
      setAppState((state) => ({
        ...state,
        users: data.users ?? state.users.map((user) => (user.id === currentUser.id ? { ...user, points: user.points + 5 } : user)),
        questions: state.questions.map((question) =>
          question.id === selectedQuestion.id
            ? data.question ?? { ...question, answersCount: question.answersCount + 1 }
            : question,
        ),
        answers: [answer, ...state.answers],
      }))
    } catch {
      setAppState((state) => ({
        ...state,
        users: state.users.map((user) => (user.id === currentUser.id ? { ...user, points: user.points + 5 } : user)),
        questions: state.questions.map((question) =>
          question.id === selectedQuestion.id ? { ...question, answersCount: question.answersCount + 1 } : question,
        ),
        answers: [answer, ...state.answers],
      }))
      setMessage('网络连接不稳定，本次回答已暂存，请稍后刷新确认。')
      setAnswerForm({ content: '' })
      return
    }

    setAnswerForm({ content: '' })
    setMessage('回答已提交，系统已奖励 5 消费积分。')
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
      const nextApplication = normalizePartnerApplication(data.application!)
      setAppState((state) => ({
        ...state,
        partnerApplications: [nextApplication, ...state.partnerApplications],
      }))
    } catch {
      const localApplication: PartnerApplication = {
        id: createId('partner'),
        ...partnerForm,
        reviewNote: '',
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
    setMessage('合作申请已提交，团队会在后台跟进。')
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
      setMessage('个人信息已保存。')
    }
  }

  const handleProfileAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const image = await resizeImageFileToDataUrl(file, 420, 0.84)
      setProfileForm((form) => ({ ...form, avatarUrl: image }))
      setMessage('头像已上传到表单，点击保存个人信息后生效。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '头像上传失败，请换一张图片重试。')
    } finally {
      event.target.value = ''
    }
  }

  const removeOwnPost = (postId: string) => {
    if (currentUser) {
      fetch(`/api/posts/${encodeURIComponent(postId)}`, {
        body: JSON.stringify({ userId: currentUser.id }),
        headers: { 'content-type': 'application/json' },
        method: 'DELETE',
      }).catch(() => setMessage('帖子已从当前列表移除，稍后将同步最新状态。'))
    }
    setAppState((state) => ({
      ...state,
      posts: state.posts.filter((post) => post.id !== postId),
    }))
    removePost(postId)
  }

  const openPost = (post: Post) => {
    navigateToPath(`/posts/${post.id}`)
  }

  const scrollToPartnerSection = () => {
    document.getElementById('partner-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const selectPartnerType = (type: string) => {
    setSelectedPartnerType(type)
    setSelectedPartnerMerchantIndex(0)
    setPartnerAutoFlip(true)
    setPartnerShowcaseEditMode(false)
  }

  const startPartnerCategoryRailDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    partnerCategoryRailDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      dragged: false,
    }
    setPartnerCategoryDragging(true)
  }

  const movePartnerCategoryRailDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = partnerCategoryRailDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const deltaX = event.clientX - drag.startX
    if (Math.abs(deltaX) > 4) {
      drag.dragged = true
      suppressPartnerCategoryClickRef.current = true
      event.preventDefault()
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
    }
    event.currentTarget.scrollLeft = drag.scrollLeft - deltaX
  }

  const endPartnerCategoryRailDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = partnerCategoryRailDragRef.current
    if (drag?.pointerId === event.pointerId) {
      if (drag.dragged) {
        suppressPartnerCategoryClickRef.current = true
        window.setTimeout(() => {
          suppressPartnerCategoryClickRef.current = false
        }, 160)
      }
      partnerCategoryRailDragRef.current = null
    }
    setPartnerCategoryDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const showNextPartnerCards = (manual = true) => {
    if (manual) setPartnerAutoFlip(false)
    setSelectedPartnerMerchantIndex((index) => (index + 1) % selectedPartnerMerchantCount)
    setPartnerShowcaseEditMode(false)
  }

  const showPreviousPartnerCards = () => {
    setPartnerAutoFlip(false)
    setSelectedPartnerMerchantIndex((index) => (index - 1 + selectedPartnerMerchantCount) % selectedPartnerMerchantCount)
    setPartnerShowcaseEditMode(false)
  }

  const openAdminEntry = () => {
    if (adminToken) {
      setAdminOpen(true)
      refreshAdminState().catch(() => setMessage('后台数据同步失败，请稍后重试。'))
      return
    }
    setAdminLoginOpen(true)
  }

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    setMegaMenuOpen(false)
    window.history.pushState(null, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)

    if (brandClickResetTimerRef.current) {
      window.clearTimeout(brandClickResetTimerRef.current)
    }

    brandClickCountRef.current += 1
    brandClickResetTimerRef.current = window.setTimeout(() => {
      brandClickCountRef.current = 0
      brandClickResetTimerRef.current = null
    }, 3000)

    if (brandClickCountRef.current >= 9) {
      brandClickCountRef.current = 0
      if (brandClickResetTimerRef.current) {
        window.clearTimeout(brandClickResetTimerRef.current)
        brandClickResetTimerRef.current = null
      }
      openAdminEntry()
    }
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
        error: data?.error ?? '管理员登录失败，请确认账号或密码是否正确。',
      }))
      return
    }

    window.sessionStorage.setItem(adminSessionKey, data.token)
    setAdminToken(data.token)
    setAdminLoginOpen(false)
    setAdminOpen(true)
    setAdminLoginForm({ username: '', password: '', error: '' })
    refreshAdminState(data.token).catch(() => setMessage('后台已登录，数据同步失败，请刷新后重试。'))
  }

  const logoutAdmin = () => {
    window.sessionStorage.removeItem(adminSessionKey)
    setAdminToken('')
    setAdminOpen(false)
    setInlineEditMode(false)
    setSelectedAdminUserId(null)
  }

  const mainClassName = isAdminRoute
    ? 'admin-route'
    : isProfileRoute
      ? 'profile-route'
      : isPostsRoute
        ? 'posts-route'
        : isInfoRoute
          ? 'info-route'
          : schoolRouteId
            ? 'school-route'
            : undefined

  return (
    <main className={mainClassName}>
      <header className="site-header" aria-label="Main navigation">
        <a
          className="brand"
          href="/"
          aria-label="留学生经验分享与问题解决平台首页"
          onClick={handleBrandClick}
        >
          <span className="brand-mark">
            <img className="brand-logo-image brand-logo-dark" src="/brand/shouye-logo-text-dark.png" alt="" aria-hidden="true" />
            <img className="brand-logo-image brand-logo-light" src="/brand/shouye-logo-text-light.png" alt="" aria-hidden="true" />
          </span>
          <span className="brand-tagline">留学生经验分享与问题解决平台</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <div
            className={megaMenuOpen ? 'nav-dropdown is-open' : 'nav-dropdown'}
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
            onFocus={() => setMegaMenuOpen(true)}
            onBlur={() => setMegaMenuOpen(false)}
          >
            <a
              href="/#school-browser"
              onClick={(event) => {
                event.preventDefault()
                setMegaMenuOpen(false)
                navigateToSchoolBrowser()
              }}
            >
              院校入口
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
            href="/questions"
            onClick={(event) => {
              event.preventDefault()
              navigateToPath('/questions')
            }}
          >
            我要提问/发布悬赏
          </a>
          <a
            href="/solve"
            onClick={(event) => {
              event.preventDefault()
              navigateToPath('/solve')
            }}
          >
            我来解决问题
          </a>
          <a
            href="/posts"
            onClick={(event) => {
              event.preventDefault()
              openPostsPage('')
            }}
          >
            经验分享
          </a>
          <a
            href="/rewards"
            onClick={(event) => {
              event.preventDefault()
              navigateToPath('/rewards')
            }}
          >
            收益规则
          </a>
          <a
            href="/categories"
            onClick={(event) => {
              event.preventDefault()
              navigateToPath('/categories')
            }}
          >
            问题分类
          </a>
        </nav>
        {currentUser ? (
          <div className="user-session-actions">
            <button
              className="wallet-entry-button"
              type="button"
              onClick={() => navigateToPath('/wallet')}
            >
              积分充值/提现
            </button>
            <div className="user-pill">
              <span>{currentUser.name}</span>
              <strong>{currentUser.points} 消费积分</strong>
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

      <nav className="mobile-app-nav" aria-label="Mobile primary navigation">
        <button
          className={currentPath === '/' || currentPath.startsWith('/school') ? 'active' : ''}
          type="button"
          onClick={() => {
            window.history.pushState(null, '', '/')
            window.dispatchEvent(new PopStateEvent('popstate'))
            window.setTimeout(() => {
              document.getElementById('school-browser')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 0)
          }}
        >
          <GraduationCap size={20} aria-hidden="true" />
          <span>院校</span>
        </button>
        <button
          className={isQuestionsRoute || isQuestionDetailRoute ? 'active' : ''}
          type="button"
          onClick={() => navigateToPath('/questions')}
        >
          <MessageSquareText size={20} aria-hidden="true" />
          <span>提问</span>
        </button>
        <button
          className={isSolveRoute ? 'mobile-solve-tab active' : 'mobile-solve-tab'}
          type="button"
          onClick={() => navigateToPath('/solve')}
        >
          <CircleDollarSign size={21} aria-hidden="true" />
          <span>解决</span>
        </button>
        <button
          className={isPostsRoute || isPostDetailRoute ? 'active' : ''}
          type="button"
          onClick={() => openPostsPage('')}
        >
          <BookOpenText size={20} aria-hidden="true" />
          <span>经验</span>
        </button>
        <button
          className={isCategoriesRoute ? 'active' : ''}
          type="button"
          onClick={() => navigateToPath('/categories')}
        >
          <BookOpenCheck size={20} aria-hidden="true" />
          <span>分类</span>
        </button>
      </nav>

      {adminToken && !isAdminRoute && (
        <div className={inlineEditMode ? 'inline-editor-bar active' : 'inline-editor-bar'}>
          <div>
            <strong>{inlineEditMode ? '网页编辑模式' : '管理员工具'}</strong>
            <span>{inlineEditMode ? '直接点首页文字修改，改完点保存。' : '可以在当前页面直接改首页内容。'}</span>
          </div>
          <div className="inline-editor-actions">
            {inlineEditMode ? (
              <>
                <button type="button" onClick={cancelInlineEditing}>
                  取消
                </button>
                <button className="save-inline-button" type="button" onClick={saveInlineEditing}>
                  保存
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={openAdminEntry}>
                  后台
                </button>
                <button className="save-inline-button" type="button" onClick={startInlineEditing}>
                  进入编辑模式
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <section className={inlineEditMode ? 'hero-section inline-editing' : 'hero-section'} id="top" style={heroStyle}>
        {homeHeroImages.map((image, index) => (
          <img
            className={`hero-image hero-image-${index + 1}`}
            src={image.src}
            alt={image.alt}
            key={image.src}
          />
        ))}
        <div className="hero-overlay" />
        <img
          className="hero-side-wordmark"
          src="/brand/shouye-logo-mobile-light-text.png"
          alt="售业"
          aria-hidden="true"
        />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <img
            className="hero-mobile-wordmark"
            src="/brand/shouye-logo-mobile-light-text.png"
            alt="售业"
            aria-hidden="true"
          />
          <div className="hero-message-group">
            {inlineEditMode ? (
              <EditableText
                as="p"
                className="eyebrow hero-eyebrow"
                value={activeSiteContent.heroEyebrow}
                onChange={(value) => updateContentDraft('heroEyebrow', value)}
              />
            ) : (
              <p className="eyebrow hero-eyebrow">{activeSiteContent.heroEyebrow}</p>
            )}
            {inlineEditMode ? (
              <EditableText
                as="h1"
                value={activeSiteContent.heroTitle}
                onChange={(value) => updateContentDraft('heroTitle', value)}
              />
            ) : (
              <h1>{activeSiteContent.heroTitle}</h1>
            )}
            {inlineEditMode ? (
              <EditableText
                as="p"
                className="hero-copy"
                value={activeSiteContent.heroCopy}
                onChange={(value) => updateContentDraft('heroCopy', value)}
              />
            ) : (
              <p className="hero-copy">{activeSiteContent.heroCopy}</p>
            )}
          </div>
          {inlineEditMode ? (
            <EditableText
              as="p"
              className="hero-subcopy hero-subcopy-top"
              value={activeSiteContent.heroSubcopy}
              onChange={(value) => updateContentDraft('heroSubcopy', value)}
            />
          ) : (
            <p className="hero-subcopy hero-subcopy-top">{activeSiteContent.heroSubcopy}</p>
          )}

          <form
            className="search-shell"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              if (inlineEditMode) return
              openPostsPage(query)
            }}
          >
            <Search size={20} aria-hidden="true" />
            {inlineEditMode ? (
              <EditableText
                className="editable-placeholder"
                value={activeSiteContent.searchPlaceholder}
                onChange={(value) => updateContentDraft('searchPlaceholder', value)}
              />
            ) : (
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={activeSiteContent.searchPlaceholder}
                aria-label="搜索留学问题、经验和分类"
              />
            )}
            <button type="submit">搜索</button>
          </form>

          <div className="hero-actions" aria-label="Quick actions">
            <button
              className="primary-link"
              type="button"
              onClick={() => {
                if (!inlineEditMode) navigateToPath('/questions')
              }}
            >
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.askButtonText}
                  onChange={(value) => updateContentDraft('askButtonText', value)}
                />
              ) : (
                <>
                  <span className="desktop-action-label">{activeSiteContent.askButtonText}</span>
                  <span className="mobile-action-label">提问求助</span>
                </>
              )}
              <MessageSquareText size={18} aria-hidden="true" />
            </button>
            <button
              className="secondary-link"
              type="button"
              onClick={() => {
                if (!inlineEditMode) openPublishModal()
              }}
            >
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.shareButtonText}
                  onChange={(value) => updateContentDraft('shareButtonText', value)}
                />
              ) : (
                <>
                  <span className="desktop-action-label">{activeSiteContent.shareButtonText}</span>
                  <span className="mobile-action-label">分享助人</span>
                </>
              )}
              <PenLine size={18} aria-hidden="true" />
            </button>
            <button
              className="merchant-benefit-link"
              type="button"
              onClick={() => {
                if (!inlineEditMode) document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              <span className="desktop-action-label">我要找商家要福利</span>
              <span className="mobile-action-label">商家福利</span>
              <Sparkles size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="hero-metrics" aria-label="平台能力概览">
            <div>
              {inlineEditMode ? (
                <EditableText
                  as="strong"
                  value={activeSiteContent.metricAskTitle}
                  onChange={(value) => updateContentDraft('metricAskTitle', value)}
                />
              ) : (
                <strong>{activeSiteContent.metricAskTitle}</strong>
              )}
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.metricAskCopy}
                  onChange={(value) => updateContentDraft('metricAskCopy', value)}
                />
              ) : (
                <span>{activeSiteContent.metricAskCopy}</span>
              )}
            </div>
            <div className="metric-stacked">
              {inlineEditMode ? (
                <EditableText
                  as="strong"
                  value={activeSiteContent.metricExperienceTitle}
                  onChange={(value) => updateContentDraft('metricExperienceTitle', value)}
                />
              ) : (
                <strong>{activeSiteContent.metricExperienceTitle}</strong>
              )}
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.metricExperienceCopy}
                  onChange={(value) => updateContentDraft('metricExperienceCopy', value)}
                />
              ) : (
                <span>{activeSiteContent.metricExperienceCopy}</span>
              )}
            </div>
            <div>
              {inlineEditMode ? (
                <EditableText
                  as="strong"
                  value={activeSiteContent.metricRewardTitle}
                  onChange={(value) => updateContentDraft('metricRewardTitle', value)}
                />
              ) : (
                <strong>{activeSiteContent.metricRewardTitle}</strong>
              )}
              {inlineEditMode ? (
                <EditableText
                  value={activeSiteContent.metricRewardCopy}
                  onChange={(value) => updateContentDraft('metricRewardCopy', value)}
                />
              ) : (
                <span>{activeSiteContent.metricRewardCopy}</span>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="proof-band" aria-label="留学生问题阶段导航">
        {journeyTopics.map((topic) => (
          <button key={topic.slug} type="button" onClick={() => navigateToPath(`/topics/${topic.slug}`)}>
            <strong>{topic.title}</strong>
            <span>{topic.summary}</span>
          </button>
        ))}
      </section>

      <section className="community-home-section" id="questions">
        <div className="section-heading section-heading-action">
          <div>
            <p className="eyebrow dark">常见问题免费贴</p>
            <h2>留学生最常遇到的问题。</h2>
          </div>
          <button className="text-arrow-button" type="button" onClick={() => navigateToPath('/questions')}>
            查看全部
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="home-question-carousel" aria-label="常见问题循环滚动">
          <button
            className="carousel-arrow carousel-arrow-left"
            type="button"
            aria-label="上一组常见问题"
            onClick={() => moveHomeQuestionCarousel(-1)}
          >
            <ChevronDown size={24} aria-hidden="true" />
          </button>
          <motion.div className="question-card-grid home-question-track" key={homeQuestionStart}>
            {homeQuestionCards.map((question, index) => (
              <article
                className="question-card clickable-card"
                key={`${question.id}-${index}`}
                onClick={() => navigateToPath(`/questions/${question.id}`)}
              >
                <div className="tag-line">
                  <span>{question.category}</span>
                  <span>{question.school}</span>
                  {question.status === 'solved' && <span className="solved-tag">已解决</span>}
                  {question.rewardPoints > 0 && <span className="bounty-tag">悬赏 {question.rewardPoints} 积分</span>}
                </div>
                <h3>{question.title}</h3>
                <div className="question-stats">
                  <span>{question.views.toLocaleString()} 浏览</span>
                  <span>{question.answersCount} 个回答</span>
                  <span>{question.createdAt}</span>
                </div>
              </article>
            ))}
          </motion.div>
          <button
            className="carousel-arrow carousel-arrow-right"
            type="button"
            aria-label="下一组常见问题"
            onClick={() => moveHomeQuestionCarousel(1)}
          >
            <ChevronDown size={24} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="community-home-section featured-experience-section" id="featured-experience">
        <div className="section-heading section-heading-action">
          <div>
            <p className="eyebrow dark">付费精华经验</p>
            <h2>真人真实经验分享。</h2>
          </div>
          <button className="text-arrow-button" type="button" onClick={() => navigateToPath('/posts')}>
            查看全部
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="home-question-carousel home-experience-carousel" aria-label="真实经验循环滚动">
          <button
            className="carousel-arrow carousel-arrow-left"
            type="button"
            aria-label="上一组真实经验"
            onClick={() => moveHomeExperienceCarousel(-1)}
          >
            <ChevronDown size={24} aria-hidden="true" />
          </button>
          <motion.div className="experience-card-grid home-question-track" key={homeExperienceStart}>
            {homeExperienceCards.map((experience, index) => (
              <article
                className="experience-card clickable-card"
                key={`${experience.id}-${index}`}
                onClick={() => navigateToPath(`/posts/${experience.id}`)}
              >
                <div className="tag-line">
                  <span>{experience.category}</span>
                  <span>{experience.city}</span>
                  {experience.featured && <span className="featured-tag">精华</span>}
                  {experience.price > 0 && <span className="paid-tag">{experience.price} 积分</span>}
                </div>
                <h3>{experience.title}</h3>
                <p>{experience.excerpt}</p>
                <div className="question-stats">
                  <span>{experience.author}</span>
                  <span>{(experience.views ?? 0).toLocaleString()} 阅读</span>
                  <span>{experience.bookmarks ?? 0} 收藏</span>
                </div>
              </article>
            ))}
          </motion.div>
          <button
            className="carousel-arrow carousel-arrow-right"
            type="button"
            aria-label="下一组真实经验"
            onClick={() => moveHomeExperienceCarousel(1)}
          >
            <ChevronDown size={24} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="community-home-section latest-posts-section">
        <div className="section-heading section-heading-action">
          <div>
            <p className="eyebrow dark">最新帖子</p>
            <h2>最近更新的留学经验和问题记录。</h2>
          </div>
          <button className="text-arrow-button" type="button" onClick={() => navigateToPath('/posts')}>
            进入帖子页
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="latest-post-list">
          {latestPosts.slice(0, 6).map((post) => (
            <article
              className="latest-post-row clickable-card"
              key={post.id}
              onClick={() => navigateToPath(`/posts/${post.id}`)}
            >
              <div>
                <div className="tag-line">
                  <span>{post.category}</span>
                  <span>{post.school}</span>
                  {post.featured && <span className="featured-tag">精华</span>}
                  {post.price > 0 && <span className="paid-tag">{post.price} 积分</span>}
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
              <div className="latest-post-meta">
                <strong>{post.author}</strong>
                <span>{post.createdAt}</span>
                <span>{(post.views ?? 0).toLocaleString()} 阅读</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="community-home-section solved-home-section">
        <div className="section-heading">
          <p className="eyebrow dark">已解决问题</p>
          <h2>先看被采纳的回答，再决定要不要继续提问。</h2>
        </div>
        <div className="question-card-grid compact-grid">
          {hotQuestions
            .filter((question) => question.status === 'solved')
            .slice(0, 4)
            .map((question) => (
              <article
                className="question-card clickable-card"
                key={question.id}
                onClick={() => navigateToPath(`/questions/${question.id}`)}
              >
                <div className="tag-line">
                  <span>{question.category}</span>
                  <span className="solved-tag">已解决</span>
                </div>
                <h3>{question.title}</h3>
                <div className="question-stats">
                  <span>采纳奖励 {question.rewardPoints} 积分</span>
                  <span>{question.answersCount} 个回答</span>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="community-home-section reward-mechanism-section">
        <div className="reward-mechanism-copy">
          <p className="eyebrow dark">问题悬赏</p>
          <h2>不是发帖就赚钱，而是帮助别人解决真实问题才有收益。</h2>
          <p>
            平台以积分模拟内容激励闭环：用户发布问题时可以设置悬赏，被采纳的回答者获得积分奖励。积分用于站内身份、内容激励和创作者等级，不承诺现金提现。
          </p>
          <button className="primary-link" type="button" onClick={() => navigateToPath('/questions')}>
            查看悬赏问题
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="reward-mechanism-list">
          <div>
            <span>1</span>
            <strong>提问者设置悬赏</strong>
            <p>把问题、学校、时间线和材料背景写清楚。</p>
          </div>
          <div>
            <span>2</span>
            <strong>回答者给出解决方案</strong>
            <p>回答要可执行，尽量附流程、材料、窗口和注意事项。</p>
          </div>
          <div>
            <span>3</span>
            <strong>答案被采纳后结算</strong>
            <p>收益进入创作者积分账户，用于站内等级、内容权益和后续合作激励；当前不做真实支付和提现。</p>
          </div>
        </div>
      </section>

      <section className="community-home-section creator-income-section">
        <div className="section-heading">
          <p className="eyebrow dark">分享赚钱</p>
          <h2>平台奖励真实、有用、可验证的经验。</h2>
        </div>
        <div className="income-rule-grid">
          <article>
            <BadgeCheck size={22} aria-hidden="true" />
            <h3>被采纳回答获得悬赏收益</h3>
            <p>解决提问者的具体问题后，收益归入创作者账户。</p>
          </article>
          <article>
            <Sparkles size={22} aria-hidden="true" />
            <h3>高质量经验帖获得平台奖励</h3>
            <p>被收藏、点赞、加精的内容会获得更多曝光和激励。</p>
          </article>
          <article>
            <BookOpenCheck size={22} aria-hidden="true" />
            <h3>精华攻略可分成或买断</h3>
            <p>签证、租房、打工、毕业等专题内容可以进入平台专题库。</p>
          </article>
          <article>
            <TrendingUp size={22} aria-hidden="true" />
            <h3>作者等级越高，曝光越高</h3>
            <p>持续贡献有效答案和真实经验，会提升内容推荐权重。</p>
          </article>
        </div>
      </section>

      <section className="community-home-section category-navigation-section">
        <div className="section-heading">
          <p className="eyebrow dark">分类导航</p>
          <h2>按问题场景进入，不用在群聊里反复翻记录。</h2>
        </div>
        <div className="category-navigation-grid">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => openPostsPage(category)}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="community-home-section guide-home-section">
        <div className="section-heading">
          <p className="eyebrow dark">城市与学校攻略</p>
          <h2>把生活落地、学校周边和常用流程整理成可复用清单。</h2>
        </div>
        <div className="guide-grid">
          {cityGuides.map((guide) => (
            <article className="guide-card clickable-card" key={guide.id} onClick={() => openPostsPage(guide.title)}>
              <div className="tag-line">
                <span>{guide.city}</span>
                <span>{guide.school}</span>
                <span>{guide.category}</span>
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.summary}</p>
              <div className="school-card-tags">
                {guide.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {isQuestionsRoute && (
        <section className="info-page questions-page">
          <div className="posts-page-head">
            <div>
              <p className="eyebrow dark">问题悬赏</p>
              <h1>把留学问题讲清楚，让有经验的人来解决。</h1>
              <p>签证、租房、入学、打工、保险、毕业和就业问题都可以在这里提问。先按分类找到相近问题，再补充自己的学校、时间线和材料背景。</p>
            </div>
            <div className="question-page-actions">
              <button
                className="secondary-link question-bounty-button"
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    setAuthMode('login')
                    setMessage('请先登录后再发布悬赏。')
                    return
                  }
                  setQuestionForm((form) => ({ ...form, rewardPoints: form.rewardPoints === '0' ? '100' : form.rewardPoints }))
                  setAskQuestionOpen(true)
                }}
              >
                我要悬赏
                <Plus size={18} aria-hidden="true" />
              </button>
              <button
                className="primary-link"
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    setAuthMode('login')
                    setMessage('请先登录后再发布问题。')
                    return
                  }
                  setAskQuestionOpen((open) => !open)
                }}
              >
                我要提问
                <Plus size={18} aria-hidden="true" />
              </button>
              <button className="secondary-link-button" type="button" onClick={() => navigateToPath('/categories')}>
                按分类找问题
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="platform-policy-note">
            <strong>平台声明</strong>
            <p>{currencyExchangePolicyNotice}</p>
          </div>
          {askQuestionOpen && (
            <form className="answer-entry form-stack question-submit-form" onSubmit={handleQuestionSubmit}>
              <h3>发布留学问题</h3>
              <div className="form-grid question-form-grid">
                <label>
                  问题标题
                  <input
                    value={questionForm.title}
                    onChange={(event) => setQuestionForm({ ...questionForm, title: event.target.value })}
                    placeholder="例如：D-2 延签住宿证明怎么准备？"
                  />
                </label>
                <label>
                  分类
                  <select
                    value={questionForm.category}
                    onChange={(event) => setQuestionForm({ ...questionForm, category: event.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  悬赏积分
                  <input
                    min="0"
                    type="number"
                    value={questionForm.rewardPoints}
                    onChange={(event) => setQuestionForm({ ...questionForm, rewardPoints: event.target.value })}
                  />
                </label>
              </div>
              <div className="form-grid question-form-grid">
                <label>
                  国家
                  <input
                    value={questionForm.country}
                    onChange={(event) => setQuestionForm({ ...questionForm, country: event.target.value })}
                  />
                </label>
                <label>
                  城市
                  <input
                    value={questionForm.city}
                    onChange={(event) => setQuestionForm({ ...questionForm, city: event.target.value })}
                    placeholder="首尔 / 釜山 / 大田"
                  />
                </label>
                <label>
                  学校
                  <select
                    value={questionForm.school}
                    onChange={(event) => setQuestionForm({ ...questionForm, school: event.target.value })}
                  >
                    {allSchoolProfiles.map((school) => (
                      <option key={school.id} value={school.name}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                问题详情
                <textarea
                  value={questionForm.detail}
                  onChange={(event) => setQuestionForm({ ...questionForm, detail: event.target.value })}
                  placeholder="写清你的阶段、学校、时间线、已准备材料和卡住的点。"
                />
              </label>
              <button type="submit">发布问题</button>
            </form>
          )}
          <div className="list-control-bar">
            <label>
              分类
              <select value={questionCategoryFilter} onChange={(event) => setQuestionCategoryFilter(event.target.value)}>
                {categoryFilters.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              状态
              <select
                value={questionStatusFilter}
                onChange={(event) => setQuestionStatusFilter(event.target.value as 'all' | QuestionStatus)}
              >
                <option value="all">全部状态</option>
                <option value="open">待回答</option>
                <option value="solved">已解决</option>
              </select>
            </label>
            <label>
              排序
              <select
                value={questionSort}
                onChange={(event) => setQuestionSort(event.target.value as 'reward' | 'views' | 'latest')}
              >
                <option value="reward">悬赏最高</option>
                <option value="views">浏览最多</option>
                <option value="latest">最新发布</option>
              </select>
            </label>
          </div>
          <div className="question-card-grid info-grid">
            {filteredQuestions.map((question) => (
              <article
                className="question-card clickable-card"
                key={question.id}
                onClick={() => navigateToPath(`/questions/${question.id}`)}
              >
                <div className="tag-line">
                  <span>{question.category}</span>
                  <span>{question.country}</span>
                  <span>{question.city}</span>
                  <span>{question.school}</span>
                  {question.status === 'solved' && <span className="solved-tag">已解决</span>}
                  {question.rewardPoints > 0 && <span className="bounty-tag">悬赏 {question.rewardPoints} 积分</span>}
                </div>
                <h3>{question.title}</h3>
                <p>{question.detail}</p>
                <div className="question-stats">
                  <span>{question.views.toLocaleString()} 浏览</span>
                  <span>{question.answersCount} 个回答</span>
                  <span>{question.author}</span>
                  <span>{question.createdAt}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {isQuestionDetailRoute && selectedQuestion && (
        <section className="info-page content-detail-page">
          <div className="detail-hero-block">
            <p className="eyebrow dark">问题详情</p>
            <div className="tag-line">
              <span>{selectedQuestion.country}</span>
              <span>{selectedQuestion.city}</span>
              <span>{selectedQuestion.school}</span>
              <span>{selectedQuestion.identity}</span>
              <span>{selectedQuestion.createdAt}</span>
              <span className={selectedQuestion.status === 'solved' ? 'solved-tag' : 'bounty-tag'}>
                {selectedQuestion.status === 'solved' ? '已解决' : '待回答'}
              </span>
            </div>
            <h1>{selectedQuestion.title}</h1>
            <p>{selectedQuestion.detail}</p>
            <div className="detail-stat-row">
              <span>悬赏 {selectedQuestion.rewardPoints} 积分</span>
              <span>{selectedQuestion.answersCount} 个回答</span>
              <span>{selectedQuestion.views.toLocaleString()} 浏览</span>
            </div>
            <button
              className="quiet-button report-button"
              type="button"
              onClick={() =>
                setReportTarget({ contentType: 'question', contentId: selectedQuestion.id, title: selectedQuestion.title })
              }
            >
              举报
            </button>
            <button
              className="primary-link"
              type="button"
              onClick={() => {
                if (!currentUser) {
                  setAuthMode('login')
                  setMessage('请先登录后回答问题。')
                  return
                }
                document.getElementById('answer-entry')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              回答问题
              <MessageSquareText size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="answer-list">
            <div className="section-heading">
              <p className="eyebrow dark">回答列表</p>
              <h2>{selectedQuestion.status === 'solved' ? '已采纳答案优先展示。' : '等待更多同校或同城经验。'}</h2>
            </div>
            {(selectedQuestionAnswers.length
              ? selectedQuestionAnswers
              : [
                  {
                    id: 'placeholder',
                    questionId: selectedQuestion.id,
                    author: '平台提示',
                    identity: '内容审核',
                    content: '这条问题还在等待更完整的回答。回答需要给出材料、时间线、办理地点和注意事项，复制内容和无效回答不会获得积分。',
                    likes: 0,
                    accepted: false,
                    createdAt: selectedQuestion.createdAt,
                  },
                ]).map((answer) => (
              <article className={answer.accepted ? 'answer-card accepted' : 'answer-card'} key={answer.id}>
                <div className="tag-line">
                  <span>{answer.author}</span>
                  <span>{answer.identity}</span>
                  {answer.accepted && <span className="solved-tag">已采纳</span>}
                </div>
                <p>{answer.content}</p>
                {answer.accepted && selectedQuestionResources.length ? (
                  <div className="content-resource-links" aria-label="官方入口和材料下载">
                    {selectedQuestionResources.map((source, sourceIndex) => (
                      <a
                        data-kind={source.kind ?? 'official'}
                        download={source.download ? true : undefined}
                        href={source.url}
                        key={`${answer.id}-${source.label}`}
                        rel="noreferrer"
                        target={source.download ? undefined : '_blank'}
                      >
                        {getResourcePrefix(source, sourceIndex)}：{source.label}
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className="question-stats">
                  <span>{answer.likes} 赞</span>
                  <span>{answer.createdAt}</span>
                  {answer.accepted && <span>回答者获得 {selectedQuestion.rewardPoints} 积分</span>}
                </div>
              </article>
            ))}
          </div>
          <form className="answer-entry form-stack" id="answer-entry" onSubmit={handleAnswerSubmit}>
            <h3>回答前请确认</h3>
            <p>平台奖励真实、有用、可验证的经验。请尽量写清材料、地点、时间线和你亲身经历的边界，政策类内容以官方最新公告为准。</p>
            <label>
              回答内容
              <textarea
                value={answerForm.content}
                onChange={(event) => setAnswerForm({ content: event.target.value })}
                placeholder="建议按材料、办理地点、时间线、风险提醒来写。"
              />
            </label>
            <button type="submit">{currentUser ? '提交回答并获得 5 积分' : '登录后回答'}</button>
          </form>
        </section>
      )}

      {isSolveRoute && (
        <section className="info-page solve-page">
          <div className="section-heading rewards-heading solve-heading">
            <p className="eyebrow dark">我来解决问题</p>
            <h1>接悬赏问答和线下求助任务。</h1>
            <p>
              这里集中展示别人用充值积分发布的悬赏问题，以及需要线下协助解决的任务。左侧看问题和要求，右侧直接看悬赏金额。
            </p>
          </div>

          <div className="solve-summary-grid">
            <article>
              <span>线上悬赏</span>
              <strong>{solveBountyItems.filter((item) => item.type === '线上悬赏问答').length}</strong>
              <p>回答被采纳后获得对应悬赏积分。</p>
            </article>
            <article>
              <span>线下任务</span>
              <strong>{solveBountyItems.filter((item) => item.type === '线下悬赏任务').length}</strong>
              <p>陪同办理、合同核对、选课协助等实质性帮助。</p>
            </article>
            <article>
              <span>最高悬赏</span>
              <strong>{Math.max(...solveBountyItems.map((item) => item.earningPoints), 0)} 可提现积分</strong>
              <p>统一按可提现积分展示。</p>
            </article>
          </div>

          <div className="solve-bounty-list">
            {solveBountyItems.map((item) => (
              <article className="solve-bounty-row" key={`${item.type}-${item.id}`}>
                <div className="solve-bounty-main">
                  <div className="tag-line">
                    <span>{item.type}</span>
                    <span>{item.category}</span>
                    <span>{item.school}</span>
                    <span>{item.city}</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.detail}</p>
                  <div className="solve-bounty-tags">
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <small>{item.meta}</small>
                </div>
                <aside className="solve-bounty-award" aria-label={`${item.title}悬赏金额`}>
                  <span>悬赏金额</span>
                  <strong>{item.earningPoints} 可提现积分</strong>
                  <em>{'points' in item ? `${item.points} 悬赏积分` : '线下任务折算'}</em>
                  <button type="button" onClick={item.onClick}>
                    {item.cta}
                  </button>
                </aside>
              </article>
            ))}
          </div>
        </section>
      )}

      {isPartnerDetailRoute && (
        <section
          className={`info-page partner-detail-page ${
            merchantDesignEditMode && canManageActivePartnerBrand ? 'is-studio-editing' : ''
          }`}
        >
          {renderMerchantStudioTools()}
          {renderMerchantStudioInspector()}
          <div className={`partner-detail-hero ${merchantDesignEditMode && canManageActivePartnerBrand ? 'is-direct-editing' : ''}`}>
            <div
              className="partner-detail-copy"
              data-merchant-design-stage="true"
              onDragOver={(event) => merchantDesignEditMode && event.preventDefault()}
              onDrop={(event) => merchantDesignEditMode && handleMerchantDecorationImageDrop('hero', event)}
              onPointerMove={(event) => {
                moveMerchantDecorationImageDrag(event)
                moveMerchantDesignItemDrag(event)
                moveMerchantTextLayerDrag(event)
              }}
              onPointerUp={() => {
                endMerchantDecorationImageDrag()
                endMerchantDesignItemDrag()
                endMerchantTextLayerDrag()
              }}
              onPointerCancel={() => {
                endMerchantDecorationImageDrag()
                endMerchantDesignItemDrag()
                endMerchantTextLayerDrag()
              }}
            >
              {renderMerchantDecorationMedia('hero', activeMerchantPreviewDecoration)}
              {renderMerchantMediaControls('hero')}
              {renderMerchantDesignItems('hero', activeMerchantPreviewDecoration)}
              {merchantDesignEditMode && canManageActivePartnerBrand && !activeMerchantPreviewDecoration?.heroImage && (
                <span className="merchant-direct-drop-hint">拖入图片/视频到主视觉区</span>
              )}
              <div className="merchant-inline-edit-wrap" style={getTextLayerStyle(activeMerchantPreviewDecoration, 'badge')}>
                <p
                  className="eyebrow dark"
                  style={activeMerchantAccentStyle}
                  {...getMerchantEditableTextProps('badge')}
                >
                  {partnerDetailBadge}
                </p>
                {renderMerchantTextEditor('badge')}
              </div>
              <div className="partner-brand-lockup partner-detail-lockup">
                <div
                  className={`partner-logo-mark ${activePartnerDetail.showcase.tone} ${
                    activePartnerDetailLogoImage ? 'has-image' : ''
                  }`}
                >
                  {activePartnerDetailLogoImage ? (
                    <img src={activePartnerDetailLogoImage} alt={`${activePartnerDetail.merchant.name} Logo`} />
                  ) : (
                    <span>{activePartnerDetail.merchant.logo}</span>
                  )}
                </div>
                <div>
                  <span>{activePartnerDetail.showcase.type}</span>
                  <div
                    className="merchant-inline-edit-wrap partner-detail-name-edit-wrap"
                    style={getTextLayerStyle(activeMerchantPreviewDecoration, 'showcaseArtTitle')}
                    {...getMerchantEditableTextProps('showcaseArtTitle')}
                  >
                    <strong style={activeMerchantTitleStyle}>
                      {activeMerchantDisplayName}
                    </strong>
                    {renderMerchantTextEditor('showcaseArtTitle')}
                  </div>
                  <small>
                    {'location' in activePartnerDetail.merchant ? activePartnerDetail.merchant.location : '售业认证商家展示'}
                  </small>
                </div>
              </div>
              <div className="merchant-inline-edit-wrap" style={getTextLayerStyle(activeMerchantPreviewDecoration, 'heroTitle')}>
                <h1
                  style={activeMerchantTitleStyle}
                  {...getMerchantEditableTextProps('heroTitle')}
                >
                  {partnerDetailHeroTitle}
                </h1>
                {renderMerchantTextEditor('heroTitle')}
              </div>
              <div className="merchant-inline-edit-wrap" style={getTextLayerStyle(activeMerchantPreviewDecoration, 'intro')}>
                <p
                  style={activeMerchantBodyStyle}
                  {...getMerchantEditableTextProps('intro')}
                >
                  {partnerDetailIntro}
                </p>
                {renderMerchantTextEditor('intro')}
              </div>
              <a
                className="partner-detail-link partner-detail-back"
                href="/#partners"
                onClick={(event) => {
                  event.preventDefault()
                  navigateToPath('/')
                  window.setTimeout(() => {
                    document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 0)
                }}
              >
                返回商家展示区
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className="partner-detail-panel" aria-label={`${activePartnerDetail.merchant.name}服务标签`}>
              <div className="merchant-inline-edit-wrap" style={getTextLayerStyle(activeMerchantPreviewDecoration, 'panelLabel')}>
                <span
                  style={activeMerchantAccentStyle}
                  {...getMerchantEditableTextProps('panelLabel')}
                >
                  {activeMerchantPreviewDecoration?.panelLabel ||
                    ('detailTone' in activePartnerDetail.merchant
                      ? activePartnerDetail.merchant.detailTone
                      : `${activePartnerDetail.showcase.type}服务展示`)}
                </span>
                {renderMerchantTextEditor('panelLabel')}
              </div>
              <div className="merchant-inline-edit-wrap" style={getTextLayerStyle(activeMerchantPreviewDecoration, 'panelTitle')}>
                <strong
                  style={activeMerchantTitleStyle}
                  {...getMerchantEditableTextProps('panelTitle')}
                >
                  {activeMerchantPreviewDecoration?.panelTitle || activePartnerDetail.merchant.tags.join(' · ')}
                </strong>
                {renderMerchantTextEditor('panelTitle')}
              </div>
              <div className="merchant-inline-edit-wrap" style={getTextLayerStyle(activeMerchantPreviewDecoration, 'contactCopy')}>
              <p
                style={activeMerchantBodyStyle}
                {...getMerchantEditableTextProps('contactCopy')}
              >
                {isWalaPartnerDetail
                  ? activeSiteContent.merchantWalaContactCopy
                  : activeMerchantPreviewDecoration?.contactCopy ?? '联系前请先确认服务范围、价格区间、交付方式和售后规则。'}
              </p>
              {renderMerchantTextEditor('contactCopy')}
              </div>
            </div>
          </div>

          <div className="partner-detail-grid">
            {partnerDetailSections.map((section, index) => {
              const titleField = (index === 0
                ? 'sectionOneTitle'
                : index === 1
                  ? 'sectionTwoTitle'
                  : 'sectionThreeTitle') as MerchantEditableTextField
              const textField = (index === 0
                ? 'sectionOneText'
                : index === 1
                  ? 'sectionTwoText'
                  : 'sectionThreeText') as MerchantEditableTextField
              return (
              <article key={section.title}>
                <div className="merchant-inline-edit-wrap" style={getTextLayerStyle(activeMerchantPreviewDecoration, titleField)}>
                  <span
                    style={activeMerchantAccentStyle}
                    {...getMerchantEditableTextProps(titleField)}
                  >
                    {section.title}
                  </span>
                  {renderMerchantTextEditor(titleField)}
                </div>
                <div className="merchant-inline-edit-wrap" style={getTextLayerStyle(activeMerchantPreviewDecoration, textField)}>
                  <p
                    style={activeMerchantBodyStyle}
                    {...getMerchantEditableTextProps(textField)}
                  >
                    {section.text}
                  </p>
                  {renderMerchantTextEditor(textField)}
                </div>
              </article>
              )
            })}
          </div>

          <div
            className={`partner-detail-cases ${merchantDesignEditMode && canManageActivePartnerBrand ? 'is-direct-editing' : ''}`}
            data-merchant-design-stage="true"
            onDragOver={(event) => merchantDesignEditMode && event.preventDefault()}
            onDrop={(event) => merchantDesignEditMode && handleMerchantDecorationImageDrop('service', event)}
            onPointerMove={(event) => {
              moveMerchantDecorationImageDrag(event)
              moveMerchantDesignItemDrag(event)
              moveMerchantTextLayerDrag(event)
            }}
            onPointerUp={() => {
              endMerchantDecorationImageDrag()
              endMerchantDesignItemDrag()
              endMerchantTextLayerDrag()
            }}
            onPointerCancel={() => {
              endMerchantDecorationImageDrag()
              endMerchantDesignItemDrag()
              endMerchantTextLayerDrag()
            }}
          >
            {renderMerchantDecorationMedia('service', activeMerchantPreviewDecoration)}
            {renderMerchantMediaControls('service')}
            {renderMerchantDesignItems('service', activeMerchantPreviewDecoration)}
            {merchantDesignEditMode && canManageActivePartnerBrand && !activeMerchantPreviewDecoration?.serviceImage && (
              <span className="merchant-direct-drop-hint">拖入图片/视频到服务展示区</span>
            )}
            <div>
              <p className="eyebrow dark" style={activeMerchantAccentStyle}>服务展示</p>
              <h2 style={activeMerchantTitleStyle}>先看服务边界，再决定是否咨询。</h2>
            </div>
            {partnerDetailCases.map((item, index) => (
              <article key={`${index}-${item}`} style={activeMerchantBodyStyle}>
                <div
                  className="merchant-inline-edit-wrap"
                  style={getTextLayerStyle(activeMerchantPreviewDecoration, index === 0 ? 'caseOne' : 'caseTwo')}
                >
                  <span
                    {...getMerchantEditableTextProps(index === 0 ? 'caseOne' : 'caseTwo')}
                  >
                    {item}
                  </span>
                  {renderMerchantTextEditor(index === 0 ? 'caseOne' : 'caseTwo')}
                </div>
              </article>
            ))}
          </div>

          {canManageActivePartnerBrand && !merchantDesignEditMode && (
            <section className="partner-brand-manager-panel">
              <div>
                <p className="eyebrow dark">品牌装饰权限</p>
                <h2>{activePartnerDetail.merchant.name}品牌的管理商家</h2>
                <p>你可以编辑这个商家详情页的标题、介绍、咨询提示、字体颜色和图片展示，保存后只影响当前品牌。</p>
              </div>
              <div className="partner-brand-avatar-row">
                <div
                  className={`partner-logo-mark ${activePartnerDetail.showcase.tone} ${
                    activeMerchantDecorationDraft.pendingLogoImage || activePartnerDetailLogoImage ? 'has-image' : ''
                  }`}
                >
                  {activeMerchantDecorationDraft.pendingLogoImage ? (
                    <img src={activeMerchantDecorationDraft.pendingLogoImage} alt="待审核品牌头像预览" />
                  ) : activePartnerDetailLogoImage ? (
                    <img src={activePartnerDetailLogoImage} alt={`${activePartnerDetail.merchant.name} Logo`} />
                  ) : (
                    <span>{activePartnerDetail.merchant.logo}</span>
                  )}
                </div>
                <div>
                  <strong>品牌头像</strong>
                  <p>
                    点击上传头像，保存后进入后台审核；审核通过后才会展示在商家详情页。建议使用正方形头像或品牌 LOGO。
                  </p>
                  <label className="merchant-logo-upload-button">
                    上传头像
                    <input accept="image/*" type="file" onChange={handleMerchantLogoUpload} />
                  </label>
                  {activeMerchantDecorationDraft.logoReviewStatus === 'pending' && (
                    <small>当前有头像正在等待平台审核。</small>
                  )}
                  {activeMerchantDecorationDraft.logoReviewStatus === 'rejected' && (
                    <small>上次头像未通过审核，可以重新上传。</small>
                  )}
                </div>
              </div>
              <div className="partner-brand-manager-actions">
                <button type="button" onClick={() => setMerchantDesignEditMode((enabled) => !enabled)}>
                  {merchantDesignEditMode ? '关闭编辑模式' : '开启编辑模式'}
                </button>
                <span>编辑模式只对当前品牌管理账号显示。</span>
              </div>
              {merchantDesignEditMode && (
                <div className="partner-brand-design-editor">
                  <div className="admin-content-grid">
                    <label>
                      字体
                      <select
                        value={activeMerchantDecorationDraft.fontFamily}
                        onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'fontFamily', event.target.value)}
                      >
                        <option value="">跟随平台默认</option>
                        <option value={'"Noto Sans SC", "Microsoft YaHei", sans-serif'}>现代黑体</option>
                        <option value={'"Songti SC", "SimSun", serif'}>宋体/衬线</option>
                        <option value={'Arial, sans-serif'}>Arial</option>
                      </select>
                    </label>
                    <label>
                      标题字颜色
                      <input
                        type="color"
                        value={activeMerchantDecorationDraft.titleColor || '#10201d'}
                        onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'titleColor', event.target.value)}
                      />
                    </label>
                    <label>
                      正文字颜色
                      <input
                        type="color"
                        value={activeMerchantDecorationDraft.bodyColor || '#4d5d58'}
                        onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'bodyColor', event.target.value)}
                      />
                    </label>
                    <label>
                      重点字颜色
                      <input
                        type="color"
                        value={activeMerchantDecorationDraft.accentColor || '#ef5a3c'}
                        onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'accentColor', event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="merchant-image-editor-grid">
                    {renderMerchantDecorationImageEditor('hero', '主视觉图片区', '拖入图片或点击上传，按住图片可自由拉动位置。')}
                    {renderMerchantDecorationImageEditor('service', '服务展示图片区', '用于下方服务展示区域，保存后对外展示。')}
                  </div>
                  <div className="merchant-design-item-panel">
                    <div>
                      <strong>泡泡框和素材框</strong>
                      <p>在展示区点击泡泡框后，可拖动、拉伸、调透明度、调层级或删除；也可以直接把图片/视频拖进泡泡框。</p>
                    </div>
                    <div className="partner-brand-manager-actions">
                      <button type="button" onClick={() => addMerchantDesignBubble('hero')}>添加主视觉泡泡</button>
                      <button type="button" onClick={() => addMerchantDesignBubble('service')}>添加服务区泡泡</button>
                    </div>
                    {activeMerchantDesignItem ? (
                      <div className="merchant-design-item-controls">
                        <label>
                          字号
                          <input
                            max="72"
                            min="12"
                            type="range"
                            value={activeMerchantDesignItem.fontSize}
                            onChange={(event) => updateMerchantDesignItem(activeMerchantDesignItem.id, { fontSize: Number(event.target.value) })}
                          />
                        </label>
                        <label>
                          透明度
                          <input
                            max="1"
                            min="0.08"
                            step="0.02"
                            type="range"
                            value={activeMerchantDesignItem.opacity}
                            onChange={(event) => updateMerchantDesignItem(activeMerchantDesignItem.id, { opacity: Number(event.target.value) })}
                          />
                        </label>
                        <label>
                          字色
                          <input
                            type="color"
                            value={activeMerchantDesignItem.color}
                            onChange={(event) => updateMerchantDesignItem(activeMerchantDesignItem.id, { color: event.target.value })}
                          />
                        </label>
                        <label>
                          底色
                          <input
                            type="color"
                            value={activeMerchantDesignItem.background.startsWith('#') ? activeMerchantDesignItem.background : '#fffdf7'}
                            onChange={(event) => updateMerchantDesignItem(activeMerchantDesignItem.id, { background: event.target.value })}
                          />
                        </label>
                        <button type="button" onClick={() => moveMerchantDesignItemLayer(activeMerchantDesignItem.id, 1)}>图层上移</button>
                        <button type="button" onClick={() => moveMerchantDesignItemLayer(activeMerchantDesignItem.id, -1)}>图层下移</button>
                        <button type="button" onClick={() => deleteMerchantDesignItem(activeMerchantDesignItem.id)}>删除</button>
                      </div>
                    ) : (
                      <p className="merchant-design-empty-tip">还没有选中泡泡框。点击展示区里的泡泡框后，这里会显示调节项。</p>
                    )}
                  </div>
                </div>
              )}
              <div className="admin-content-grid">
                <label>
                  页面标识
                  <input
                    value={activeMerchantDecorationDraft.badge}
                    onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'badge', event.target.value)}
                  />
                </label>
                <label className="wide-field">
                  详情页标题
                  <textarea
                    rows={2}
                    value={activeMerchantDecorationDraft.heroTitle}
                    onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'heroTitle', event.target.value)}
                  />
                </label>
                <label className="wide-field">
                  品牌介绍
                  <textarea
                    rows={3}
                    value={activeMerchantDecorationDraft.intro}
                    onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'intro', event.target.value)}
                  />
                </label>
                <label className="wide-field">
                  咨询前提示
                  <textarea
                    rows={2}
                    value={activeMerchantDecorationDraft.contactCopy}
                    onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'contactCopy', event.target.value)}
                  />
                </label>
                <label className="wide-field">
                  服务展示 1
                  <textarea
                    rows={2}
                    value={activeMerchantDecorationDraft.caseOne}
                    onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'caseOne', event.target.value)}
                  />
                </label>
                <label className="wide-field">
                  服务展示 2
                  <textarea
                    rows={2}
                    value={activeMerchantDecorationDraft.caseTwo}
                    onChange={(event) => updateMerchantDecorationDraft(activePartnerDetailSlug, 'caseTwo', event.target.value)}
                  />
                </label>
              </div>
              <div className="partner-brand-manager-actions">
                <button type="button" onClick={saveMerchantDecoration}>
                  保存品牌详情页装饰
                </button>
                {merchantDecorationNotice && <span>{merchantDecorationNotice}</span>}
              </div>
            </section>
          )}
        </section>
      )}

      {isWalletRoute && (
        <section className="info-page wallet-page">
          <div className="section-heading rewards-heading wallet-heading">
            <p className="eyebrow dark">积分充值/提现</p>
            <h1>消费积分用来提问和解锁，可提现积分来自真实帮助。</h1>
            <p>
              平台把站内消费和创作者收益分开计算：充值得到消费积分；回答被采纳、完成悬赏、发布有效干货后，进入可提现积分。
            </p>
          </div>

          <div className="wallet-balance-strip" aria-label="当前积分余额">
            <article>
              <span>消费积分</span>
              <strong>{currentUser?.points ?? 0}</strong>
              <p>用于提问、发布悬赏、解锁干货帖和资料。</p>
            </article>
            <article>
              <span>可提现积分</span>
              <strong>{currentUser?.earningPoints ?? 0}</strong>
              <p>由被认可的回答、悬赏任务和付费内容产生。</p>
            </article>
            <article className="wallet-settlement-note">
              <span>提现沉淀期</span>
              <strong>7 天</strong>
              <p>通过悬赏赚取的可提现积分，需要沉淀一周后再申请提现，避免后期纠纷或退款问题。</p>
            </article>
          </div>

          <div className="reward-rule-list">
            <article>
              <span>充值</span>
              <h3>提交消费积分充值申请</h3>
              <p>当前 MVP 先记录充值订单，后台核对收款后入账；接入微信支付后会替换为自动回调入账。</p>
              <form className="form-stack" onSubmit={submitRechargeOrder}>
                <label>
                  充值金额
                  <input
                    min="10"
                    max="2000"
                    type="number"
                    value={rechargeAmount}
                    onChange={(event) => setRechargeAmount(event.target.value)}
                  />
                </label>
                <button type="submit">{currentUser ? '提交充值申请' : '登录后充值'}</button>
              </form>
              {currentUserPointOrders.length > 0 && (
                <p>
                  最近订单：
                  {currentUserPointOrders
                    .map((order) => `${order.amountYuan}元/${order.points}积分/${order.status}`)
                    .join('；')}
                </p>
              )}
            </article>
            <article>
              <span>提现</span>
              <h3>申请可提现积分结算</h3>
              <p>提现申请会先冻结对应可提现积分，经 7 天沉淀、争议检查和人工审核后处理。</p>
              <form className="form-stack" onSubmit={submitWithdrawalRequest}>
                <label>
                  可提现积分
                  <input
                    min={minimumCashoutPoints}
                    type="number"
                    value={withdrawalForm.earningPoints}
                    onChange={(event) => setWithdrawalForm({ ...withdrawalForm, earningPoints: event.target.value })}
                  />
                </label>
                <label>
                  收款方式备注
                  <input
                    value={withdrawalForm.accountLabel}
                    onChange={(event) => setWithdrawalForm({ ...withdrawalForm, accountLabel: event.target.value })}
                    placeholder="例如：韩国银行卡尾号/支付宝备注，仅后台可见"
                  />
                </label>
                <button type="submit">{currentUser ? '提交提现申请' : '登录后提现'}</button>
              </form>
              {currentUserWithdrawals.length > 0 && (
                <p>
                  最近申请：
                  {currentUserWithdrawals
                    .map((withdrawal) => `${withdrawal.earningPoints}积分/${withdrawal.status}`)
                    .join('；')}
                </p>
              )}
            </article>
          </div>

          <section className="points-section wallet-points-section" id="wallet-points">
            <div className="points-copy">
              <p className="eyebrow dark">Business Model</p>
              <h2>收益来自解决真实问题，而不是制造低质量内容。</h2>
              <p>
                用户可以用消费积分解锁深度经验或发布悬赏问题，回答者和经验作者通过被采纳答案、精华内容和专题攻略获得可提现积分。
              </p>
            </div>
            <div className="points-economy" aria-label="积分经济系统">
              <article>
                <Coins size={22} aria-hidden="true" />
                <span>消费积分</span>
                <strong>¥1 = {rechargePointsPerYuan} 积分</strong>
                <p>消费积分只能在站内使用，用于解锁加精帖、资料和问答悬赏。</p>
              </article>
              <article>
                <Sparkles size={22} aria-hidden="true" />
                <span>可提现积分</span>
                <strong>100 可提现积分 ≈ ¥8</strong>
                <p>读者解锁深度内容，作者获得可提现积分；无效回答和复制内容不会获得收益。</p>
              </article>
              <article>
                <MessageSquareText size={22} aria-hidden="true" />
                <span>提现规则</span>
                <strong>{minimumCashoutPoints} 可提现积分起提</strong>
                <p>注册送分、活动分和充值分不能提现，只有内容收益产生的可提现积分可以申请提现。</p>
              </article>
            </div>
          </section>

          <div className="wallet-rule-note">
            <strong>提现说明</strong>
            <p>
              发布悬赏的人确认满意后，积分先进入可提现积分余额；悬赏类收益进入 7 天沉淀期，期满且无争议后再开放提现申请。
            </p>
          </div>
        </section>
      )}

      {isRewardsRoute && (
        <section className="info-page">
          <div className="section-heading rewards-heading">
            <p className="eyebrow dark">收益规则</p>
            <h1>如何通过分享经验获得收益？</h1>
            <p>平台奖励的是“真实、有用、可验证的经验”，不是单纯发帖数量。</p>
          </div>
          <div className="reward-rule-list">
            <article>
              <span>1</span>
              <h3>回答悬赏问题</h3>
              <p>回答被提问者采纳后，按问题难度和有效程度获得 +50～200 积分；无效回答、答非所问或无法验证的信息记 0 积分。</p>
            </article>
            <article>
              <span>2</span>
              <h3>发布高质量经验帖</h3>
              <p>经验帖被审核为精华内容后可获得 +100～500 积分；收藏每满 10 次额外 +20 积分，点赞每满 20 次额外 +10 积分。</p>
            </article>
            <article>
              <span>3</span>
              <h3>贡献专题攻略</h3>
              <p>签证、租房、打工、毕业等专题内容进入学校或分类专题库后，可获得额外积分奖励，并优先获得内容曝光。</p>
            </article>
            <article>
              <span>4</span>
              <h3>防止垃圾内容</h3>
              <p>抄袭、AI水文、批量搬运、虚假经历或误导性答案会扣 50～200 积分，严重时可禁言、下架内容或封号。</p>
            </article>
            <article>
              <span>5</span>
              <h3>商家内容标注</h3>
              <p>商家广告帖、软广、带联系方式的合作内容必须标注商家身份；未标注或伪装成普通经验帖的平台可下架。</p>
            </article>
            <article>
              <span>6</span>
              <h3>第一版积分激励</h3>
              <p>当前 MVP 第一版优先验证积分激励和人工审核闭环；可提现积分需满足沉淀期、争议检查和后台审核后才进入结算，不承诺所有积分都可提现。</p>
            </article>
          </div>
        </section>
      )}

      {isCategoriesRoute && (
        <section className="info-page">
          <div className="section-heading rewards-heading">
            <p className="eyebrow dark">分类</p>
            <h1>按留学问题场景查找经验。</h1>
            <p>从签证到就业，从租房到医院，把零散经验整理成可检索的问题分类。</p>
          </div>
          <div className="category-navigation-grid category-page-grid">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => openPostsPage(category)}>
                {category}
              </button>
            ))}
          </div>
        </section>
      )}

      {isAboutRoute && (
        <section className="info-page">
          <div className="section-heading rewards-heading">
            <p className="eyebrow dark">平台介绍</p>
            <h1>留学生经验分享与问题解决平台</h1>
            <p>
              留学生的第一站，真实经验帮你少走弯路。这里不是普通论坛，而是把签证、入学、租房、打工、生活和就业经验沉淀成可搜索、可验证、可解决问题的社区。
            </p>
          </div>
          <div className="income-rule-grid">
            <article>
              <Search size={22} aria-hidden="true" />
              <h3>先解决真实问题</h3>
              <p>每条内容都围绕具体场景：要办什么、去哪办、准备什么、怎么避坑。</p>
            </article>
            <article>
              <ShieldCheck size={22} aria-hidden="true" />
              <h3>保护分享者隐私</h3>
              <p>平台会继续完善匿名展示、身份审核和敏感信息保护。</p>
            </article>
            <article>
              <Coins size={22} aria-hidden="true" />
              <h3>让有用经验获得回报</h3>
              <p>高质量回答、被采纳答案和精华攻略会进入收益体系。</p>
            </article>
          </div>
        </section>
      )}

      {isHowItWorksRoute && (
        <section className="info-page">
          <div className="section-heading rewards-heading">
            <p className="eyebrow dark">商业闭环</p>
            <h1>平台如何运转？</h1>
            <p>这是留学生问题解决社区 + 商家服务连接平台，第一版先验证真实问题、内容沉淀和供需连接。</p>
          </div>
          <div className="reward-rule-list">
            <article>
              <span>1</span>
              <h3>学生使用</h3>
              <p>留学生可以提问、查攻略、浏览学校专题，先找到同场景问题，再看完整经验和可执行清单。</p>
            </article>
            <article>
              <span>2</span>
              <h3>内容供给</h3>
              <p>创作者通过回答问题、发布经验帖、获得采纳和加精来积累积分，平台优先奖励真实、有用、可验证内容。</p>
            </article>
            <article>
              <span>3</span>
              <h3>商家连接</h3>
              <p>商家以认证身份提供租房、搬家、手机卡、保险、翻译、生活服务等信息，广告和服务内容必须标注商家身份。</p>
            </article>
            <article>
              <span>4</span>
              <h3>收入来源</h3>
              <p>未来收入包括商家入驻、广告展示、悬赏问答服务费、会员权益和精选服务推荐，不把平台包装成返利或赚钱项目。</p>
            </article>
            <article>
              <span>5</span>
              <h3>第一版边界</h3>
              <p>MVP 第一版优先做积分激励、人工审核和支付提现申请闭环；正式自动支付以支付通道、风控和合规配置完成后为准。</p>
            </article>
          </div>
        </section>
      )}

      {activePolicyPage && (
        <section className="info-page compliance-page">
          <div className="section-heading rewards-heading">
            <p className="eyebrow dark">{activePolicyPage.eyebrow}</p>
            <h1>{activePolicyPage.title}</h1>
            <p>{activePolicyPage.intro}</p>
            <p>本页面为平台合规基础版本，正式上线前仍建议由律师结合运营主体、业务范围和小程序审核要求复核。</p>
          </div>
          <div className="compliance-copy">
            {activePolicyPage.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.heading}-${index}`}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </section>
      )}

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
                  <div className="profile-avatar-upload-copy">
                    <strong>个人头像</strong>
                    <span>点击上传头像，保存后会展示在个人中心和你发布的内容旁。</span>
                    <label className="merchant-logo-upload-button">
                      上传头像
                      <input accept="image/*" type="file" onChange={handleProfileAvatarUpload} />
                    </label>
                  </div>
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
                      <option>已录取待入学</option>
                      <option>语学院</option>
                      <option>本科</option>
                      <option>大学院</option>
                      <option>已毕业</option>
                      <option>商家</option>
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
                  认证材料
                  <input
                    multiple
                    type="file"
                    onChange={async (event) => {
                      const files = Array.from(event.target.files ?? [])
                      event.target.value = ''
                      try {
                        const documents = await Promise.all(
                          files.map(async (file) => ({
                          id: createId('doc'),
                          name: file.name,
                          type: file.type || '身份/学校认证材料',
                          status: 'pending' as VerificationStatus,
                          uploadedAt: new Date().toISOString(),
                            dataUrl: await readCredentialFileToDataUrl(file),
                        })),
                        )
                        setProfileForm({
                          ...profileForm,
                          documents,
                        })
                      } catch (error) {
                        setMessage(error instanceof Error ? error.message : '认证材料读取失败，请换一个文件重试。')
                      }
                    }}
                  />
                  <small className="field-help">材料会进入后台审核；提交前建议遮挡证件号码等非必要敏感信息。</small>
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
                      <div className="credential-actions">
                        <button type="button" onClick={() => openCredentialDocument(document, setMessage)}>
                          查看材料
                        </button>
                        <span className={`account-badge ${document.status}`}>
                          {verificationStatusLabel[document.status]}
                        </span>
                      </div>
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
              <p className="eyebrow dark">经验分享</p>
              <h1>真实经验帖</h1>
              <p>集中浏览签证、租房、入学、打工、保险、毕业和就业经验，优先展示能解决具体问题的内容。</p>
            </div>
            <button className="primary-link" type="button" onClick={() => openPublishModal('knowledge')}>
              发布经验
              <PenLine size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="platform-policy-note">
            <strong>平台声明</strong>
            <p>{currencyExchangePolicyNotice}</p>
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

          {query.trim() && searchSuggestions.length ? (
            <div className="smart-search-banner" aria-label="关联搜索推荐">
              <div>
                <p className="eyebrow dark">智能推荐</p>
                <h3>先看这些更接近的学校、专题和帖子</h3>
              </div>
              <div className="search-suggestion-list compact">
                {searchSuggestions.slice(0, 4).map((suggestion) => (
                  <button key={`${suggestion.label}-${suggestion.title}`} type="button" onClick={suggestion.onClick}>
                    <span>{suggestion.label}</span>
                    <em>
                      {suggestion.actionText}
                      <ArrowRight size={16} aria-hidden="true" />
                    </em>
                    <strong>{suggestion.title}</strong>
                    <small>{suggestion.description}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

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
              <label>
                城市
                <select value={postCityFilter} onChange={(event) => setPostCityFilter(event.target.value)}>
                  {postCityOptions.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
              <label>
                精华
                <select
                  value={postFeaturedFilter}
                  onChange={(event) => setPostFeaturedFilter(event.target.value as 'all' | 'featured')}
                >
                  <option value="all">全部内容</option>
                  <option value="featured">只看精华</option>
                </select>
              </label>
              <div>
                <span>分类</span>
                <div className="posts-filter-tabs">
                  {categoryFilters.map((category) => (
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
                          {post.featured && <span className="featured-tag">精华</span>}
                          <span className={post.price === 0 ? 'free' : 'locked'}>
                            {post.price === 0 ? '免费' : unlocked ? '已解锁' : `${post.price} 积分`}
                          </span>
                        </div>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <div className="tag-line">
                          <span>{post.country ?? '韩国'}</span>
                          <span>{post.city ?? '首尔'}</span>
                          <span>{post.school}</span>
                          <span>{post.identity ?? '亲身经历'}</span>
                        </div>
                        <div className="post-footer">
                          <span>{post.author}</span>
                          <span>
                            <TrendingUp size={15} aria-hidden="true" />
                            {post.hot}
                          </span>
                          <span>{post.bookmarks ?? 0} 收藏</span>
                        </div>
                        <button className="read-button" type="button" onClick={() => navigateToPath(`/posts/${post.id}`)}>
                          {post.price > 0 && !unlocked ? '积分解锁' : '查看全文'}
                        </button>
                      </div>
                    </motion.article>
                  )
                })
              ) : (
                <div className="posts-empty-state smart-empty-state">
                  <div>
                    <p className="eyebrow dark">关联推荐</p>
                    <h3>暂时没有完全匹配的帖子</h3>
                    <p>我根据你的关键词找到了更接近的学校、专题和帖子，可以先从这些入口继续看。</p>
                  </div>
                  {searchSuggestions.length ? (
                    <div className="search-suggestion-list">
                      {searchSuggestions.map((suggestion) => (
                        <button key={`${suggestion.label}-${suggestion.title}`} type="button" onClick={suggestion.onClick}>
                          <span>{suggestion.label}</span>
                          <em>
                            {suggestion.actionText}
                            <ArrowRight size={16} aria-hidden="true" />
                          </em>
                          <strong>{suggestion.title}</strong>
                          <small>{suggestion.description}</small>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="empty-action-row">
                    <button type="button" onClick={() => navigateToPath('/questions')}>
                      去提问
                    </button>
                    <button type="button" onClick={() => openPublishModal('knowledge')}>
                      发布经验
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {isPostDetailRoute && selectedPost && (
        <section className="info-page content-detail-page">
          <div className="detail-hero-block post-detail-hero">
            <p className="eyebrow dark">经验帖详情</p>
            <div className="tag-line">
              <span>{selectedPost.country ?? '韩国'}</span>
              <span>{selectedPost.city ?? '首尔'}</span>
              <span>{selectedPost.school}</span>
              <span>{selectedPost.identity ?? '亲身经历'}</span>
              <span>{selectedPost.contentType ?? '经验帖'}</span>
              {selectedPost.featured && <span className="featured-tag">精华</span>}
            </div>
            <h1>{selectedPost.title}</h1>
            <p>{selectedPost.excerpt}</p>
            <div className="detail-stat-row">
              <span>{selectedPost.author}</span>
              <span>{selectedPost.createdAt}</span>
              <span>{(selectedPost.views ?? 0).toLocaleString()} 阅读</span>
              <span>{selectedPost.likes ?? 0} 点赞</span>
              <span>{selectedPost.bookmarks ?? 0} 收藏</span>
            </div>
            <button
              className="quiet-button report-button"
              type="button"
              onClick={() => setReportTarget({ contentType: 'post', contentId: selectedPost.id, title: selectedPost.title })}
            >
              举报
            </button>
          </div>
          <article className="post-detail-body">
            <p>{selectedPost.body}</p>
            {selectedPost.sources?.length ? (
              <div className="content-resource-links" aria-label="官方入口和材料下载">
                {selectedPost.sources.map((source, sourceIndex) => (
                  <a
                    data-kind={source.kind ?? 'official'}
                    download={source.download ? true : undefined}
                    href={source.url}
                    key={`${selectedPost.id}-${source.label}`}
                    rel="noreferrer"
                    target={source.download ? undefined : '_blank'}
                  >
                    {getResourcePrefix(source, sourceIndex)}：{source.label}
                  </a>
                ))}
              </div>
            ) : null}
            <div className="school-card-tags">
              {(selectedPost.tags ?? [selectedPost.category, selectedPost.school]).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
          <section className="answer-entry">
            <h3>这篇内容为什么能获得积分？</h3>
            <p>
              内容围绕真实留学问题，提供可执行步骤、材料提醒和亲身经历边界。平台会优先奖励被收藏、点赞、加精和能解决问题的经验帖，抄袭和无效内容不奖励。
            </p>
          </section>
        </section>
      )}

      {isTopicRoute && selectedJourneyTopic && (
        <section className="info-page journey-topic-page">
          <div className="journey-topic-hero">
            <div className="journey-topic-title-block">
              <p className="eyebrow dark">专项标题</p>
              <h1>{selectedJourneyTopic.title}</h1>
              <p>{selectedJourneyTopic.heroCopy}</p>
            </div>
            <div className="journey-highlight-list" aria-label={`${selectedJourneyTopic.title}重点内容`}>
              <strong>重点内容</strong>
              <ul>
                {selectedJourneyHighlights.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">★</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            {selectedJourneyTopic.deepDives?.length ? (
              <div className="journey-detail-accordion" aria-label={`${selectedJourneyTopic.title}详细内容`}>
                <strong>详细内容</strong>
                {selectedJourneyTopic.deepDives.map((item) => {
                  const isOpen =
                    openJourneyDetail !== null &&
                    openJourneyDetail.slug === topicRouteSlug &&
                    openJourneyDetail.title === item.title
                  return (
                    <div className="journey-detail-item" data-open={isOpen} key={item.title}>
                      <button
                        aria-expanded={isOpen}
                        className="journey-detail-trigger"
                        onClick={() => setOpenJourneyDetail(isOpen ? null : { slug: topicRouteSlug, title: item.title })}
                        type="button"
                      >
                        <span aria-hidden="true">★</span>
                        <em>{item.label}</em>
                        <strong>{item.title}</strong>
                        <ChevronDown size={18} aria-hidden="true" />
                      </button>
                      {isOpen ? (
                        <div className="journey-detail-body">
                          <p>{item.text}</p>
                          <ul>
                            {item.bullets.map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                          <div className="journey-detail-links">
                            {(item.sources ??
                              (item.sourceLabel && item.sourceUrl
                                ? [{ label: item.sourceLabel, url: item.sourceUrl, kind: 'reference' as const }]
                                : [])
                            ).map((source, sourceIndex) => (
                              <a
                                data-kind={source.kind ?? 'official'}
                                download={source.download ? true : undefined}
                                href={source.url}
                                key={`${item.title}-${source.label}`}
                                rel="noreferrer"
                                target={source.download ? undefined : '_blank'}
                              >
                                {getResourcePrefix(source, sourceIndex)}：{source.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </section>
      )}

      {isTopicRoute && !selectedJourneyTopic && (
        <section className="info-page">
          <div className="posts-page-head">
            <div>
              <p className="eyebrow dark">专项页面</p>
              <h1>这个专题还没有开通。</h1>
              <p>可以先从入学、在学、毕业和就业四个阶段进入。</p>
            </div>
          </div>
        </section>
      )}

      {schoolRouteId && schoolTopic && (
        <section className="school-posts-page school-topic-page">
          <div
            className="school-topic-hero"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(18, 23, 25, 0.9), rgba(18, 23, 25, 0.62), rgba(18, 23, 25, 0.18)), url("${schoolTopicHeroImage}")`,
            }}
          >
            <div className="school-topic-hero-content">
              <p className="eyebrow">韩国学校专题</p>
              <h1>{schoolTopic.heroTitle}</h1>
              <p>{schoolTopic.heroSubtitle}</p>
              <div className="school-topic-tags">
                {schoolTopic.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="school-topic-actions">
                <button className="primary-link" type="button" onClick={() => navigateToPath('/questions')}>
                  我要提问
                  <MessageSquareText size={18} aria-hidden="true" />
                </button>
                <button
                  className="secondary-link"
                  type="button"
                  onClick={() => {
                    setPostForm((form) => ({ ...form, school: schoolTopic.nameZh, category: '学校评价' }))
                    openPublishModal('knowledge')
                  }}
                >
                  分享{schoolTopic.nameZh}经验
                  <PenLine size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <section className="school-topic-section school-topic-quick">
            <div className="section-heading">
              <p className="eyebrow dark">快速入口</p>
              <h2>按问题类型进入{schoolTopic.nameZh}专题。</h2>
            </div>
            <div className="school-topic-entry-grid">
              {getSchoolTopicQuickEntries(schoolTopic.quickEntries).map((entry) => (
                <button key={entry} type="button" onClick={() => openPostsPage(`${schoolTopic.nameZh} ${entry}`)}>
                  <span>{entry}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="school-topic-section">
            <div className="section-heading">
              <p className="eyebrow dark">热门问题</p>
              <h2>{schoolTopic.nameZh}留学生正在问什么。</h2>
            </div>
            <div className="school-question-grid">
              {schoolTopic.hotQuestions.map((question) => (
                <article className="school-question-card" key={question.title}>
                  <div className="tag-line">
                    <span>{question.category}</span>
                    <span className={question.status === 'solved' ? 'solved-tag' : 'bounty-tag'}>
                      {question.status === 'solved' ? '已解决' : '待回答'}
                    </span>
                  </div>
                  <h3>{question.title}</h3>
                  <div className="school-card-tags">
                    {question.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="school-question-stats">
                    <span>悬赏 {question.rewardPoints} 积分</span>
                    <span>{question.answersCount} 个回答</span>
                    <span>{question.views} 浏览</span>
                    <span>{question.updatedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="school-topic-section school-topic-featured">
            <div className="section-heading">
              <p className="eyebrow dark">精华经验</p>
              <h2>能直接拿来参考的{schoolTopic.nameZh}经验帖。</h2>
            </div>
            <div className="school-featured-grid">
              {schoolTopic.featuredPosts.map((post) => (
                <article className="school-featured-card" key={post.title}>
                  <div className="tag-line">
                    <span>{post.tags[0]}</span>
                    {post.isFeatured && <span className="featured-tag">精华</span>}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <div className="school-card-tags">
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="school-question-stats">
                    <span>{post.author}</span>
                    <span>{post.views} 阅读</span>
                    <span>{post.likes} 赞</span>
                    <span>{post.bookmarks} 收藏</span>
                    <span>{post.updatedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="school-topic-section school-info-section">
            <div className="school-info-panel">
              <div>
                <p className="eyebrow dark">学校信息</p>
                <h2>{schoolTopic.nameZh}</h2>
                <p className="school-policy-note">
                  涉及签证、滞留资格、打工时间、毕业流程等内容，请以出入境和学校最新公告为准。
                </p>
              </div>
              <dl>
                <div>
                  <dt>学校名称</dt>
                  <dd>{schoolTopic.nameZh}</dd>
                </div>
                <div>
                  <dt>韩文名</dt>
                  <dd>{schoolTopic.nameKo}</dd>
                </div>
                <div>
                  <dt>英文名</dt>
                  <dd>{schoolTopic.nameEn}</dd>
                </div>
                <div>
                  <dt>国家</dt>
                  <dd>{schoolTopic.country}</dd>
                </div>
                <div>
                  <dt>城市</dt>
                  <dd>{schoolTopic.city}</dd>
                </div>
                <div>
                  <dt>区域</dt>
                  <dd>{schoolTopic.district}</dd>
                </div>
                <div>
                  <dt>适合内容</dt>
                  <dd>{schoolTopic.suitableContent.join('、')}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="school-topic-section school-topic-cta">
            <div>
              <p className="eyebrow">没有找到你的问题？</p>
              <h2>发布{schoolTopic.nameZh}相关问题，让同校或同地区的留学生回答。</h2>
              <p>高质量回答被采纳后可以获得积分奖励，平台会继续完善身份审核和内容风控。</p>
            </div>
            <button className="primary-link" type="button" onClick={() => navigateToPath('/questions')}>
              发布{schoolTopic.nameZh}问题
              <MessageSquareText size={18} aria-hidden="true" />
            </button>
          </section>
        </section>
      )}

      {schoolRouteId && !schoolTopic && (
        <section className="school-posts-page">
          <div
            className="school-posts-hero"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(18, 23, 25, 0.9), rgba(18, 23, 25, 0.58), rgba(18, 23, 25, 0.14)), url("${selectedSchoolHeroImage}")`,
            }}
          >
            <div className="school-gallery-strip" aria-hidden="true">
              {selectedSchoolGallery.map((image, index) => (
                <img
                  className={index === schoolHeroSlideIndex % selectedSchoolGallery.length ? 'active' : undefined}
                  key={`${selectedSchool.id}-${image}`}
                  src={resolveSchoolImage(image)}
                  onError={() => markSchoolImageFailed(image)}
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
                <button type="button" onClick={() => openPublishModal('knowledge')}>
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
            <h2>{selectedSchool.name} 相关经验</h2>
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
              <p className="admin-empty">这所学校暂时还没有经验内容，欢迎发布第一篇。</p>
            )}
          </div>
        </section>
      )}

      <section className="school-browser-section" id="school-browser">
        <div className="section-heading">
          <p className="eyebrow dark">韩国主流院校导航</p>
          <h2>按地区浏览院校，选择学校进入专属内容页。</h2>
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
                    <span>{group.schools.length} 所院校 · 按 QS 2026 与申请热度排序</span>
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
                      <div className="school-menu-copy">
                        <em>#{startIndex + schoolIndex + 1}</em>
                        <span>{school.name}</span>
                        <small>{school.city} · {school.landmark}</small>
                      </div>
                      <div className="school-logo-mark" aria-hidden="true">
                        <span>{school.name.slice(0, 1)}</span>
                        {getSchoolLogoUrl(school) && (
                          <img
                            src={getSchoolLogoUrl(school)}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                      </div>
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
        style={{ backgroundImage: `linear-gradient(90deg, rgba(18, 23, 25, 0.86), rgba(18, 23, 25, 0.48), rgba(18, 23, 25, 0.12)), url("${selectedSchoolHeroImage}")` }}
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
            <button type="button" className="primary-link school-share-link" onClick={() => openPublishModal('knowledge')}>
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
          <button
            type="button"
            className="school-topic-link"
            onClick={() => navigateToPath(`/schools/${selectedSchool.id}`)}
          >
            {selectedSchool.name}专题贴
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="partner-showcase-section" id="partners">
        <div className="section-heading partner-showcase-heading">
          <p className="eyebrow dark">入驻商家</p>
          <h2>把留学常用商家列举在此，方便货比三家。</h2>
          <p>
            按服务类型查看广告、资质、优惠和联系方式，先比较再咨询。
          </p>
          <button className="partner-apply-link" type="button" onClick={scrollToPartnerSection}>
            商家申请入驻
            <Plus size={18} aria-hidden="true" />
          </button>
        </div>
        <div
          className={`partner-category-rail ${partnerCategoryDragging ? 'is-dragging' : ''}`}
          aria-label="入驻商家分类横向导航"
          onPointerDown={startPartnerCategoryRailDrag}
          onPointerMove={movePartnerCategoryRailDrag}
          onPointerUp={endPartnerCategoryRailDrag}
          onPointerCancel={endPartnerCategoryRailDrag}
          onPointerLeave={endPartnerCategoryRailDrag}
        >
          {partnerShowcasesWithApproved.map((partner) => (
            <button
              className={selectedPartnerType === partner.type ? 'partner-category-tab active' : 'partner-category-tab'}
              key={partner.type}
              onClick={(event) => {
                if (suppressPartnerCategoryClickRef.current) {
                  event.preventDefault()
                  event.stopPropagation()
                  suppressPartnerCategoryClickRef.current = false
                  return
                }
                selectPartnerType(partner.type)
              }}
              type="button"
            >
              <span>{partner.type}</span>
              <small>{partner.audience}</small>
            </button>
          ))}
        </div>
        <div className="partner-showcase-window">
          <div className="partner-looseleaf-rings" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <motion.article
            className={`partner-showcase-card partner-looseleaf-card partner-tone-${selectedPartnerShowcase.tone} ${
              partnerShowcaseEditMode && canManageActivePartnerMerchant ? 'is-showcase-editing' : ''
            }`}
            data-partner-showcase-stage="true"
            key={`${selectedPartnerShowcase.type}-${activePartnerMerchant.name}`}
            initial={{ opacity: 0, rotateX: -7, y: 18 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            onPointerMove={(event) => {
              movePartnerShowcaseDesignItemDrag(event)
              movePartnerShowcaseTextLayerDrag(event)
            }}
            onPointerUp={() => {
              endPartnerShowcaseDesignItemDrag()
              endPartnerShowcaseTextLayerDrag()
            }}
            onPointerCancel={() => {
              endPartnerShowcaseDesignItemDrag()
              endPartnerShowcaseTextLayerDrag()
            }}
            onPointerLeave={() => {
              endPartnerShowcaseDesignItemDrag()
              endPartnerShowcaseTextLayerDrag()
            }}
          >
            {canManageActivePartnerMerchant && (
              <div className="partner-showcase-edit-toolbar">
                <button
                  type="button"
                  disabled={partnerShowcaseSaving}
                  onClick={async () => {
                    if (partnerShowcaseEditMode) {
                      await savePartnerShowcaseDecoration(true)
                      setActivePartnerShowcaseTextEditor(null)
                      setActivePartnerShowcaseDesignItemId(null)
                      return
                    }
                    setPartnerShowcaseEditMode(true)
                  }}
                >
                  {partnerShowcaseSaving ? '保存中...' : partnerShowcaseEditMode ? '完成编辑' : '编辑'}
                </button>
                {partnerShowcaseEditMode && (
                  <>
                    <button type="button" onClick={() => partnerShowcaseFileInputRef.current?.click()}>
                      添加图片
                    </button>
                    <button type="button" onClick={addPartnerShowcaseTextBox}>
                      添加文本框
                    </button>
                    <input
                      accept="image/*,video/*"
                      ref={partnerShowcaseFileInputRef}
                      type="file"
                      onChange={addPartnerShowcaseImage}
                    />
                  </>
                )}
              </div>
            )}
            {renderPartnerShowcaseDesignItems()}
            <div className="partner-looseleaf-main">
              <div className="partner-looseleaf-copy">
                <div className="partner-brand-lockup">
                  <div
                    className={`partner-logo-mark ${selectedPartnerShowcase.tone} ${
                      activePartnerMerchantLogoImage ? 'has-image' : ''
                    }`}
                  >
                    {activePartnerMerchantLogoImage ? (
                      <img src={activePartnerMerchantLogoImage} alt={`${activePartnerMerchant.name} Logo`} />
                    ) : (
                      <span>{activePartnerMerchant.logo}</span>
                    )}
                  </div>
                  <div>
                    <span>{selectedPartnerShowcase.type}</span>
                    <strong>{activePartnerMerchant.name}</strong>
                    <span
                      className="partner-showcase-text-wrap"
                      style={getTextLayerStyle(activePartnerMerchantPreviewDecoration, 'badge')}
                    >
                      <small
                        style={getTextContentStyle(activePartnerMerchantPreviewDecoration, 'badge', activePartnerShowcaseAccentStyle)}
                        {...getPartnerShowcaseEditableTextProps('badge')}
                      >
                        {activePartnerShowcaseBadge}
                      </small>
                      {renderPartnerShowcaseTextEditor('badge')}
                    </span>
                  </div>
                </div>
                <div className="partner-showcase-copy">
                  <div
                    className="partner-showcase-text-wrap"
                    style={getTextLayerStyle(activePartnerMerchantPreviewDecoration, 'heroTitle')}
                  >
                    <h3
                      style={getTextContentStyle(activePartnerMerchantPreviewDecoration, 'heroTitle', activePartnerShowcaseTitleStyle)}
                      {...getPartnerShowcaseEditableTextProps('heroTitle')}
                    >
                      {activePartnerShowcaseTitle}
                    </h3>
                    {renderPartnerShowcaseTextEditor('heroTitle')}
                  </div>
                  <div
                    className="partner-showcase-text-wrap"
                    style={getTextLayerStyle(activePartnerMerchantPreviewDecoration, 'intro')}
                  >
                    <p
                      style={getTextContentStyle(activePartnerMerchantPreviewDecoration, 'intro', activePartnerShowcaseBodyStyle)}
                      {...getPartnerShowcaseEditableTextProps('intro')}
                    >
                      {activePartnerShowcaseDescription}
                    </p>
                    {renderPartnerShowcaseTextEditor('intro')}
                  </div>
                  <a
                    className="partner-detail-link"
                    href={`/partners/${activePartnerMerchantSlug}`}
                    onClick={(event) => {
                      event.preventDefault()
                      navigateToPath(`/partners/${activePartnerMerchantSlug}`)
                    }}
                  >
                    进入商家详情页
                    <ArrowRight size={18} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="partner-looseleaf-art">
                <span className="partner-art-map" />
                <span className="partner-art-plane" />
                <span
                  className="partner-showcase-text-wrap partner-showcase-art-text"
                  style={getTextLayerStyle(activePartnerMerchantPreviewDecoration, 'showcaseArtTitle')}
                  {...getPartnerShowcaseEditableTextProps('showcaseArtTitle')}
                >
                  <strong style={getTextContentStyle(activePartnerMerchantPreviewDecoration, 'showcaseArtTitle', activePartnerShowcaseTitleStyle)}>
                    {activePartnerShowcaseArtTitle}
                  </strong>
                  {renderPartnerShowcaseTextEditor('showcaseArtTitle')}
                </span>
                <span
                  className="partner-showcase-text-wrap partner-showcase-art-text"
                  style={getTextLayerStyle(activePartnerMerchantPreviewDecoration, 'showcaseArtSubtitle')}
                  {...getPartnerShowcaseEditableTextProps('showcaseArtSubtitle')}
                >
                  <small style={getTextContentStyle(activePartnerMerchantPreviewDecoration, 'showcaseArtSubtitle', activePartnerShowcaseTitleStyle)}>
                    {activePartnerShowcaseArtSubtitle}
                  </small>
                  {renderPartnerShowcaseTextEditor('showcaseArtSubtitle')}
                </span>
              </div>
            </div>
            <div className="partner-service-strip">
              <div className="partner-service-title">
                <span>{selectedPartnerShowcase.type === '留学咨询' ? '专业留学规划与服务' : `${selectedPartnerShowcase.type}服务展示`}</span>
                <strong>{activePartnerMerchant.name}</strong>
              </div>
              <div className="partner-service-items">
                {activePartnerMerchant.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </motion.article>
          <div className="partner-page-stack" aria-hidden="true" />
          {selectedPartnerMerchantCount > 1 && activePartnerMerchantIndex > 0 && (
            <button
              className="partner-card-prev"
              type="button"
              onClick={showPreviousPartnerCards}
              aria-label={`翻到上一家${selectedPartnerShowcase.type}商家`}
            >
              <ChevronUp size={24} aria-hidden="true" />
            </button>
          )}
          <button
            className="partner-card-next"
            type="button"
            onClick={() => showNextPartnerCards()}
            aria-label={`翻到下一家${selectedPartnerShowcase.type}商家`}
          >
            <ChevronDown size={24} aria-hidden="true" />
          </button>
        </div>
        {selectedPartnerShowcase.merchants.length > 1 && (
          <div className="partner-page-dots" aria-label={`${selectedPartnerShowcase.type}商家页码`}>
            {selectedPartnerShowcase.merchants.map((merchant, index) => (
              <button
                className={index === activePartnerMerchantIndex ? 'active' : ''}
                key={merchant.name}
                type="button"
                onClick={() => {
                  setPartnerAutoFlip(false)
                  setSelectedPartnerMerchantIndex(index)
                }}
              >
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="workspace-section" id="workspace">
        <div className="section-heading">
          <p className="eyebrow dark">Community Account</p>
          <h2>{currentUser ? `${currentUser.name}，管理你的提问、经验和认证。` : '为留学生设计清晰的提问、分享和认证入口。'}</h2>
        </div>
        <div className="workspace-grid">
          <article className="workspace-panel">
            <LogIn size={24} aria-hidden="true" />
            <h3>{currentUser ? '社区账户' : '留学生账号'}</h3>
            {currentUser ? (
              <>
                <p>{currentUser.identity} · {currentUser.school}</p>
                <strong>{currentUser.points} 消费积分 · {currentUser.earningPoints} 可提现积分</strong>
                <small>
                  充值比例 1 元 = {rechargePointsPerYuan} 积分；收益满 {minimumCashoutPoints} 积分可申请提现，约 ¥
                  {Math.floor(minimumCashoutPoints / cashoutPointsPerYuan)} 起。
                </small>
                <button type="button" onClick={() => navigateToPath('/wallet')}>
                  充值/提现
                </button>
                {currentUserBioSettings.managedBrandId && (
                  <button
                    className="merchant-profile-entry-button"
                    type="button"
                    onClick={() => navigateToPath(`/partners/${currentUserBioSettings.managedBrandId}`)}
                  >
                    进入我的商家展示页
                  </button>
                )}
              </>
            ) : (
              <>
                <p>学生完成认证后，可提问、回答悬赏问题、匿名分享经验，并通过高质量内容获得收益。</p>
                <button type="button" onClick={() => setAuthMode('register')}>创建社区账号</button>
              </>
            )}
          </article>
          <article className="workspace-panel">
            <PenLine size={24} aria-hidden="true" />
            <h3>机构合作申请</h3>
            <p>留学机构、语学院、论文辅导、政府部门和职业规划机构可提交合作表单，由后台统一跟进。</p>
            <button type="button" onClick={scrollToPartnerSection}>提交合作表单</button>
          </article>
          <article className="workspace-panel">
            <Coins size={24} aria-hidden="true" />
            <h3>资源与人才合作</h3>
            <p>认证用户积累后，可为教育机构、跨境企业和韩企提供实习、招聘与校园服务入口。</p>
            <button type="button" onClick={scrollToPartnerSection}>查看机构合作</button>
          </article>
        </div>
      </section>

      <section className="posts-section" id="posts">
        <div className="posts-topline">
          <div className="section-heading">
            <p className="eyebrow dark">Content Samples</p>
            <h2>每篇经验都对应真实的择校、申请和服务转化场景。</h2>
          </div>
          <div className="category-tabs" aria-label="Post categories">
                  {categoryFilters.map((category) => (
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
          <h2>收益来自解决真实问题，而不是制造低质量内容。</h2>
          <p>
            用户可以用消费积分解锁深度经验或发布悬赏问题，回答者和经验作者通过被采纳答案、精华内容和专题攻略获得可提现积分。
          </p>
        </div>
        <div className="points-economy" aria-label="积分经济系统">
          <article>
            <Coins size={22} aria-hidden="true" />
            <span>充值积分</span>
            <strong>¥1 = {rechargePointsPerYuan} 积分</strong>
            <p>充值积分只能消费，用于解锁加精帖、资料和问答。</p>
          </article>
          <article>
            <Sparkles size={22} aria-hidden="true" />
            <span>内容收益</span>
            <strong>100 可提现积分 ≈ ¥8</strong>
            <p>读者解锁深度内容，作者获得可提现积分；无效回答和复制内容不会获得收益。</p>
          </article>
          <article>
            <MessageSquareText size={22} aria-hidden="true" />
            <span>提现规则</span>
            <strong>{minimumCashoutPoints} 积分起提</strong>
            <p>注册送分、活动分和充值分不能提现，只有内容收益产生的可提现积分可以申请提现。</p>
          </article>
        </div>
      </section>

      <section className="trust-section" id="trust">
        <div className="trust-panel">
          <img
            className="trust-brand-logo"
            src="/brand/shouye-logo-text-light.png"
            alt="留学生经验分享与问题解决平台"
          />
          <ShieldCheck size={30} aria-hidden="true" />
          <h2>真实、匿名、可验证，是留学生敢分享的前提。</h2>
          <p>
            平台采用后台认证、前台匿名、材料审核、同校交叉验证、小样本保护和人工审核，让内容可信，也让提问者和分享者更安全。
          </p>
        </div>
        <div className="trust-list">
          <div>
            <GraduationCap size={22} aria-hidden="true" />
            <span>学校邮箱、Offer、在读和毕业材料认证</span>
          </div>
          <div>
            <BadgeCheck size={22} aria-hidden="true" />
            <span>付费加精内容审核后展示</span>
          </div>
          <div>
            <ShieldCheck size={22} aria-hidden="true" />
            <span>匿名展示与小样本保护，降低身份暴露风险</span>
          </div>
        </div>
      </section>

      <section className="cta-section" id="partner-apply">
        <p className="eyebrow dark">Partner Application</p>
        <h2>欢迎能解决留学生真实问题的机构和服务方申请合作。</h2>
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
            <p className="eyebrow dark">管理员登录</p>
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
              <p className="admin-login-note">后台仅限管理员访问，请妥善保管账号信息。</p>
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
            <p className="eyebrow dark">后台管理</p>
            <h2>后台管理用户、内容和商家线索。</h2>
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
              <div>
                <span>咨询线索</span>
                <strong>{appState.merchantLeads.filter((lead) => lead.status === 'pending').length}</strong>
              </div>
              <div>
                <span>待处理申诉</span>
                <strong>{appState.questionDisputes.filter((dispute) => dispute.status === 'pending').length}</strong>
              </div>
              <div>
                <span>待处理举报</span>
                <strong>{appState.reports.filter((report) => report.status === 'pending').length}</strong>
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
              <button
                className={adminTab === 'leads' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('leads')}
              >
                咨询线索
              </button>
              <button
                className={adminTab === 'settlement' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('settlement')}
              >
                申诉退款
              </button>
              <button
                className={adminTab === 'payments' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('payments')}
              >
                支付提现
              </button>
              <button
                className={adminTab === 'reports' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('reports')}
              >
                举报处理
              </button>
              <button
                className={adminTab === 'content' ? 'active' : ''}
                type="button"
                onClick={() => setAdminTab('content')}
              >
                内容设置
              </button>
            </div>

            {adminTab === 'users' ? (
              <div className="admin-users-layout">
                <div className="admin-table admin-user-table">
                  <div className="admin-row admin-row-head">
                    <span>注册账号</span>
                    <span>状态</span>
                    <span>认证</span>
                    <span>消费积分</span>
                    <span>可提现积分</span>
                    <span>操作</span>
                  </div>
                  {appState.users.length === 0 ? (
                    <p className="admin-empty">暂无注册用户。新用户注册后会进入账号列表。</p>
                  ) : (
                    appState.users.map((user) => (
                      <div className="admin-row" key={user.id}>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                          <small>{user.identity} · {user.school}</small>
                        </div>
                        <span className={`account-badge ${user.status}`}>{userStatusLabel[user.status]}</span>
                        <div className="verification-bubble-wrap">
                          <button
                            className={`account-badge verification-badge ${user.verificationStatus}`}
                            type="button"
                            onClick={() =>
                              setOpenVerificationBubbleUserId((openUserId) => (openUserId === user.id ? null : user.id))
                            }
                          >
                            {verificationStatusLabel[user.verificationStatus]}
                          </button>
                          {openVerificationBubbleUserId === user.id && (
                            <div className="verification-popover" role="dialog" aria-label={`${user.name}认证审核`}>
                              <button
                                className="approve"
                                type="button"
                                onClick={() => {
                                  updateUserAccount(user.id, { verificationStatus: 'approved' })
                                  setOpenVerificationBubbleUserId(null)
                                }}
                              >
                                通过
                              </button>
                              <button
                                className="reject"
                                type="button"
                                onClick={() => {
                                  updateUserAccount(user.id, { verificationStatus: 'rejected' })
                                  setOpenVerificationBubbleUserId(null)
                                }}
                              >
                                不通过
                              </button>
                            </div>
                          )}
                        </div>
                        <input
                          aria-label={`${user.name} 消费积分`}
                          min="0"
                          type="number"
                          value={pointDrafts[user.id] ?? String(user.points)}
                          onChange={(event) =>
                            setPointDrafts((drafts) => ({ ...drafts, [user.id]: event.target.value }))
                          }
                        />
                        <input
                          aria-label={`${user.name} 可提现积分`}
                          min="0"
                          type="number"
                          value={earningPointDrafts[user.id] ?? String(user.earningPoints)}
                          onChange={(event) =>
                            setEarningPointDrafts((drafts) => ({ ...drafts, [user.id]: event.target.value }))
                          }
                        />
                        <div className="admin-actions">
                          <button type="button" onClick={() => setSelectedAdminUserId(user.id)}>
                            查看账号
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateUserPoints(user.id, Number.parseInt(pointDrafts[user.id] ?? String(user.points), 10) || 0)
                              updateUserEarningPoints(
                                user.id,
                                Number.parseInt(earningPointDrafts[user.id] ?? String(user.earningPoints), 10) || 0,
                              )
                            }}
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
                          <span>消费积分</span>
                          <strong>{selectedAdminUser.points}</strong>
                        </div>
                        <div>
                          <span>可提现积分</span>
                          <strong>{selectedAdminUser.earningPoints}</strong>
                        </div>
                        <div>
                          <span>预计可提现</span>
                          <strong>¥{Math.floor(selectedAdminUser.earningPoints / cashoutPointsPerYuan)}</strong>
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
                      <div className="admin-control-row">
                        <label>
                          商家品牌装饰权限
                          <select
                            value={selectedAdminUserBioSettings.managedBrandId ?? ''}
                            onChange={(event) => {
                              const brand = manageablePartnerBrands.find((item) => item.id === event.target.value)
                              updateUserAccount(selectedAdminUser.id, {
                                bio: serializeUserBrandAccess(
                                  selectedAdminUser.bio,
                                  brand?.id ?? '',
                                  brand?.name ?? '',
                                  selectedAdminUserBioSettings.managedBrandLevel ?? 'normal',
                                ),
                              })
                            }}
                          >
                            <option value="">不分配品牌</option>
                            {manageablePartnerBrands.map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.name}品牌的管理商家 · {brand.type}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          商家级别
                          <select
                            value={selectedAdminUserBioSettings.managedBrandLevel ?? 'normal'}
                            onChange={(event) => {
                              updateUserAccount(selectedAdminUser.id, {
                                bio: serializeUserBrandAccess(
                                  selectedAdminUser.bio,
                                  selectedAdminUserBioSettings.managedBrandId ?? '',
                                  selectedAdminUserBioSettings.managedBrandName ?? '',
                                  event.target.value as MerchantLevel,
                                ),
                              })
                            }}
                            disabled={!selectedAdminUserBioSettings.managedBrandId}
                          >
                            <option value="normal">普通</option>
                            <option value="pinned">置顶</option>
                          </select>
                        </label>
                        <div className="admin-brand-access-note">
                          <span>当前权限</span>
                          <strong>
                            {selectedAdminUserBioSettings.managedBrandName
                              ? `${selectedAdminUserBioSettings.managedBrandName}品牌的管理商家 · ${
                                  selectedAdminUserBioSettings.managedBrandLevel === 'pinned' ? '置顶商家' : '普通商家'
                                }`
                              : '未分配'}
                          </strong>
                          <small>
                            账号认证状态为“已通过”后，商家才能在对应详情页装饰自己的品牌；置顶商家会优先显示。
                          </small>
                        </div>
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
                              <div className="credential-actions">
                                <button type="button" onClick={() => openCredentialDocument(document, setMessage)}>
                                  查看材料
                                </button>
                                <span className={`account-badge ${document.status}`}>
                                  {verificationStatusLabel[document.status]}
                                </span>
                              </div>
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
                    <p className="admin-empty">选择账号后，可审核材料、调整认证状态、禁言或封号。</p>
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
                      {categories.map((category) => (
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
            ) : adminTab === 'leads' ? (
              <div className="admin-table admin-partner-table">
                <div className="admin-content-actions">
                  <input
                    aria-label="搜索咨询线索"
                    placeholder="搜索商家、咨询人、内容、负责人"
                    value={leadSearch}
                    onChange={(event) => setLeadSearch(event.target.value)}
                  />
                  <select
                    aria-label="线索状态筛选"
                    value={leadStatusFilter}
                    onChange={(event) => setLeadStatusFilter(event.target.value as typeof leadStatusFilter)}
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待联系</option>
                    <option value="contacted">已联系</option>
                    <option value="closed">已关闭</option>
                  </select>
                  <select
                    aria-label="负责人筛选"
                    value={leadAssigneeFilter}
                    onChange={(event) => setLeadAssigneeFilter(event.target.value)}
                  >
                    {leadAssignees.map((assignee) => (
                      <option key={assignee}>{assignee}</option>
                    ))}
                  </select>
                  <button type="button" onClick={exportMerchantLeads}>
                    导出 CSV
                  </button>
                </div>
                <div className="admin-row admin-row-head">
                  <span>商家</span>
                  <span>类型</span>
                  <span>咨询人</span>
                  <span>内容</span>
                  <span>状态</span>
                </div>
                {filteredMerchantLeads.length === 0 ? (
                  <p className="admin-empty">暂无咨询线索。小程序商家详情页提交后会进入这里。</p>
                ) : (
                  filteredMerchantLeads.map((lead) => (
                    <div className="admin-row" key={lead.id}>
                      <div>
                        <strong>{lead.merchantTitle}</strong>
                        <small>{lead.merchantId || '未记录商家 ID'}</small>
                        <small>{new Date(lead.createdAt).toLocaleString('zh-CN')}</small>
                        {lead.updatedAt && <small>更新 {new Date(lead.updatedAt).toLocaleString('zh-CN')}</small>}
                      </div>
                      <span>{lead.merchantType || '未分类'}</span>
                      <div>
                        <strong>{lead.userName || '小程序用户'}</strong>
                        <small>{lead.userContact || '未留联系方式'}</small>
                        <input
                          aria-label={`${lead.userName || lead.id} 负责人`}
                          defaultValue={lead.assignedTo}
                          placeholder="负责人"
                          onBlur={(event) => updateMerchantLead(lead.id, { assignedTo: event.currentTarget.value })}
                        />
                      </div>
                      <div>
                        <p className="admin-partner-detail">{lead.note || '未填写咨询内容'}</p>
                        <input
                          aria-label={`${lead.id} 后台备注`}
                          defaultValue={lead.adminNote}
                          placeholder="后台备注"
                          onBlur={(event) => updateMerchantLead(lead.id, { adminNote: event.currentTarget.value })}
                        />
                      </div>
                      <div className="admin-actions">
                        <select
                          value={lead.status}
                          onChange={(event) =>
                            updateMerchantLead(lead.id, { status: event.target.value as MerchantLead['status'] })
                          }
                        >
                          <option value="pending">待联系</option>
                          <option value="contacted">已联系</option>
                          <option value="closed">已关闭</option>
                        </select>
                        <button type="button" onClick={() => updateMerchantLead(lead.id, { status: 'contacted' })}>
                          标记已联系
                        </button>
                        <button className="danger-button" type="button" onClick={() => removeMerchantLead(lead.id)}>
                          删除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : adminTab === 'settlement' ? (
              <div className="admin-table admin-report-table">
                <div className="admin-row admin-row-head">
                  <span>问题</span>
                  <span>类型</span>
                  <span>原因</span>
                  <span>状态</span>
                  <span>操作</span>
                </div>
                {appState.questionDisputes.length === 0 ? (
                  <p className="admin-empty">暂无悬赏申诉或退款记录。</p>
                ) : (
                  appState.questionDisputes.map((dispute) => {
                    const bounty = appState.questionBounties.find((item) => item.questionId === dispute.questionId)
                    return (
                      <div className="admin-row" key={dispute.id}>
                        <div>
                          <strong>{dispute.questionId}</strong>
                          {dispute.answerId && <small>回答：{dispute.answerId}</small>}
                          <small>{new Date(dispute.createdAt).toLocaleString('zh-CN')}</small>
                          {bounty && <small>悬赏：{bounty.rewardPoints} 积分 · {bounty.status}</small>}
                        </div>
                        <span>{dispute.type === 'refund' ? '退款' : dispute.type === 'abuse' ? '恶意采纳' : '申诉'}</span>
                        <div>
                          <strong>{dispute.reason}</strong>
                          <p className="admin-partner-detail">{dispute.detail || '未填写补充说明'}</p>
                          <input
                            aria-label={`${dispute.id} 管理员备注`}
                            defaultValue={dispute.adminNote}
                            placeholder="处理备注"
                            onBlur={(event) => updateQuestionDispute(dispute.id, { adminNote: event.currentTarget.value })}
                          />
                        </div>
                        <select
                          value={dispute.status}
                          onChange={(event) =>
                            updateQuestionDispute(dispute.id, { status: event.target.value as QuestionDispute['status'] })
                          }
                        >
                          <option value="pending">待处理</option>
                          <option value="reviewing">处理中</option>
                          <option value="resolved">已处理</option>
                          <option value="rejected">不成立</option>
                        </select>
                        <div className="admin-actions">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuestionDispute(dispute.id, {
                                status: 'resolved',
                                adminAction: 'refund',
                                adminNote: dispute.adminNote || '管理员判定退款',
                              })
                            }
                          >
                            退款
                          </button>
                          <button type="button" onClick={() => updateQuestionDispute(dispute.id, { status: 'resolved' })}>
                            标记处理
                          </button>
                          <button className="danger-button" type="button" onClick={() => removeQuestionDispute(dispute.id)}>
                            删除
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ) : adminTab === 'payments' ? (
              <div className="admin-table admin-report-table">
                <div className="admin-row admin-row-head">
                  <span>类型</span>
                  <span>用户</span>
                  <span>金额/积分</span>
                  <span>状态</span>
                  <span>操作</span>
                </div>
                {appState.pointOrders.length === 0 && appState.withdrawalRequests.length === 0 ? (
                  <p className="admin-empty">暂无充值订单或提现申请。</p>
                ) : (
                  <>
                    {appState.pointOrders.map((order) => (
                      <div className="admin-row" key={order.id}>
                        <div>
                          <strong>充值订单</strong>
                          <small>{order.id}</small>
                          <small>{new Date(order.createdAt).toLocaleString('zh-CN')}</small>
                        </div>
                        <div>
                          <strong>{order.userName || order.userId}</strong>
                          <small>{order.channel}</small>
                        </div>
                        <div>
                          <strong>{order.amountYuan} 元</strong>
                          <small>{order.points} 消费积分</small>
                        </div>
                        <select
                          value={order.status}
                          onChange={(event) => updatePointOrder(order.id, { status: event.target.value as PointOrder['status'] })}
                        >
                          <option value="pending">待确认</option>
                          <option value="paid">已入账</option>
                          <option value="canceled">已取消</option>
                          <option value="refunded">已退款</option>
                        </select>
                        <div className="admin-actions">
                          <input
                            aria-label={`${order.id} 支付流水号`}
                            defaultValue={order.outTradeNo}
                            placeholder="支付流水号"
                            onBlur={(event) => updatePointOrder(order.id, { outTradeNo: event.currentTarget.value })}
                          />
                          <input
                            aria-label={`${order.id} 管理员备注`}
                            defaultValue={order.adminNote}
                            placeholder="后台备注"
                            onBlur={(event) => updatePointOrder(order.id, { adminNote: event.currentTarget.value })}
                          />
                        </div>
                      </div>
                    ))}
                    {appState.withdrawalRequests.map((withdrawal) => (
                      <div className="admin-row" key={withdrawal.id}>
                        <div>
                          <strong>提现申请</strong>
                          <small>{withdrawal.id}</small>
                          <small>{new Date(withdrawal.createdAt).toLocaleString('zh-CN')}</small>
                        </div>
                        <div>
                          <strong>{withdrawal.userName || withdrawal.userId}</strong>
                          <small>{withdrawal.payoutMethod}</small>
                          <small>{withdrawal.accountLabel}</small>
                        </div>
                        <div>
                          <strong>{withdrawal.earningPoints} 可提现积分</strong>
                          <small>约 {withdrawal.amountYuan} 元</small>
                        </div>
                        <select
                          value={withdrawal.status}
                          onChange={(event) =>
                            updateWithdrawalRequest(withdrawal.id, {
                              status: event.target.value as WithdrawalRequest['status'],
                            })
                          }
                        >
                          <option value="pending">待审核</option>
                          <option value="approved">已通过</option>
                          <option value="rejected">已驳回</option>
                          <option value="paid">已打款</option>
                        </select>
                        <div className="admin-actions">
                          <input
                            aria-label={`${withdrawal.id} 管理员备注`}
                            defaultValue={withdrawal.adminNote}
                            placeholder="审核备注"
                            onBlur={(event) =>
                              updateWithdrawalRequest(withdrawal.id, { adminNote: event.currentTarget.value })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : adminTab === 'reports' ? (
              <div className="admin-table admin-report-table">
                <div className="admin-row admin-row-head">
                  <span>举报对象</span>
                  <span>原因</span>
                  <span>说明</span>
                  <span>状态</span>
                  <span>操作</span>
                </div>
                {appState.reports.length === 0 ? (
                  <p className="admin-empty">暂无举报记录。</p>
                ) : (
                  appState.reports.map((report) => (
                    <div className="admin-row" key={report.id}>
                      <div>
                        <strong>{report.contentType} · {report.contentId}</strong>
                        <small>{new Date(report.createdAt).toLocaleString('zh-CN')}</small>
                        {report.reporterContact && <small>{report.reporterContact}</small>}
                      </div>
                      <span>{report.reason}</span>
                      <p className="admin-partner-detail">{report.description || '未填写补充说明'}</p>
                      <select
                        value={report.status}
                        onChange={(event) => updateReport(report.id, { status: event.target.value as ContentReport['status'] })}
                      >
                        <option value="pending">待处理</option>
                        <option value="reviewing">处理中</option>
                        <option value="resolved">已处理</option>
                        <option value="rejected">不成立</option>
                      </select>
                      <div className="admin-actions">
                        <button type="button" onClick={() => updateReport(report.id, { status: 'resolved', adminNote: '已处理' })}>
                          标记处理
                        </button>
                        <button className="danger-button" type="button" onClick={() => removeReport(report.id)}>
                          删除记录
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : adminTab === 'partners' ? (
              <div className="admin-table admin-partner-table">
                <div className="admin-row admin-row-head">
                  <span>机构</span>
                  <span>类型</span>
                  <span>方向</span>
                  <span>联系人</span>
                  <span>需求</span>
                  <span>审核</span>
                </div>
                {appState.partnerApplications.length === 0 ? (
                  <p className="admin-empty">暂无合作申请。</p>
                ) : (
                  appState.partnerApplications.map((application) => {
                    const reviewDraft = getPartnerReviewDraft(application)
                    return (
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
                        <div>
                          <p className="admin-partner-detail">{application.detail || '未填写详细需求'}</p>
                          {application.reviewNote ? (
                            <small className="admin-review-note-text">审核留言：{application.reviewNote}</small>
                          ) : null}
                        </div>
                        <div className="admin-actions">
                          <select
                            value={reviewDraft.status}
                            onChange={(event) =>
                              updatePartnerReviewDraft(application, {
                                status: event.target.value as PartnerApplication['status'],
                              })
                            }
                          >
                            <option value="pending">待审核</option>
                            <option value="approved">审核通过</option>
                            <option value="rejected">审核拒绝</option>
                            <option value="contacted">已联系</option>
                            <option value="closed">已关闭</option>
                          </select>
                          {reviewDraft.status === 'rejected' ? (
                            <textarea
                              className="admin-review-note"
                              value={reviewDraft.reviewNote}
                              onChange={(event) =>
                                updatePartnerReviewDraft(application, { reviewNote: event.target.value })
                              }
                              placeholder="填写审核不通过理由，商家可据此修改资料后重新提交。"
                            />
                          ) : null}
                          <button type="button" onClick={() => submitPartnerApplicationReview(application)}>
                            提交审核
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
                <div className="admin-content-head merchant-logo-review-head">
                  <div>
                    <p className="eyebrow dark">商家头像审核</p>
                    <h3>审核品牌头像后才对外展示。</h3>
                  </div>
                </div>
                <div className="admin-row admin-row-head">
                  <span>品牌</span>
                  <span>待审核头像</span>
                  <span>状态</span>
                  <span>操作</span>
                  <span>说明</span>
                </div>
                {appState.merchantBrandDecorations.filter(
                  (decoration) => decoration.pendingLogoImage && decoration.logoReviewStatus === 'pending',
                ).length === 0 ? (
                  <p className="admin-empty">暂无待审核商家头像。</p>
                ) : (
                  appState.merchantBrandDecorations
                    .filter((decoration) => decoration.pendingLogoImage && decoration.logoReviewStatus === 'pending')
                    .map((decoration) => {
                      const brand = manageablePartnerBrands.find((item) => item.id === decoration.brandId)
                      return (
                        <div className="admin-row" key={`${decoration.brandId}-logo-review`}>
                          <div>
                            <strong>{brand?.name ?? decoration.brandId}</strong>
                            <small>{decoration.brandId}</small>
                          </div>
                          <img className="admin-merchant-logo-preview" src={decoration.pendingLogoImage} alt="待审核商家头像" />
                          <span className="account-badge pending">待审核</span>
                          <div className="admin-actions">
                            <button
                              type="button"
                              onClick={() =>
                                updateMerchantBrandDecoration(decoration.brandId, {
                                  logoImage: decoration.pendingLogoImage,
                                  pendingLogoImage: '',
                                  logoReviewStatus: 'approved',
                                })
                              }
                            >
                              通过
                            </button>
                            <button
                              className="danger-button"
                              type="button"
                              onClick={() =>
                                updateMerchantBrandDecoration(decoration.brandId, {
                                  pendingLogoImage: '',
                                  logoReviewStatus: 'rejected',
                                })
                              }
                            >
                              不通过
                            </button>
                          </div>
                          <p className="admin-partner-detail">通过后会替换该商家详情页头像；不通过则要求商家重新上传。</p>
                        </div>
                      )
                    })
                )}
              </div>
            ) : (
              <div className="admin-content-panel">
                <div className="admin-content-head">
                  <div>
                    <p className="eyebrow dark">可视化改网站</p>
                    <h3>首页文案和手机端尺寸</h3>
                  </div>
                  <div className="admin-content-actions">
                    <button type="button" onClick={resetSiteContentDraft}>
                      恢复默认
                    </button>
                    <button className="primary-admin-button" type="button" onClick={saveSiteContent}>
                      保存到网站
                    </button>
                  </div>
                </div>
                <p className="admin-content-note">
                  这里保存后会写入线上数据库。以后你想改首页大标题、按钮文字、搜索提示、手机端字号和搜索框大小，直接在这里改，不需要碰 TSX。
                </p>

                <div className="admin-content-grid">
                  <label>
                    顶部小字
                    <input
                      value={contentDraft.heroEyebrow}
                      onChange={(event) => updateContentDraft('heroEyebrow', event.target.value)}
                    />
                  </label>
                  <label>
                    首页大标题
                    <input
                      value={contentDraft.heroTitle}
                      onChange={(event) => updateContentDraft('heroTitle', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    主标题下面的大字
                    <textarea
                      rows={3}
                      value={contentDraft.heroCopy}
                      onChange={(event) => updateContentDraft('heroCopy', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    搜索框上方说明
                    <textarea
                      rows={2}
                      value={contentDraft.heroSubcopy}
                      onChange={(event) => updateContentDraft('heroSubcopy', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    搜索框提示文字
                    <input
                      value={contentDraft.searchPlaceholder}
                      onChange={(event) => updateContentDraft('searchPlaceholder', event.target.value)}
                    />
                  </label>
                  <label>
                    蓝色按钮
                    <input
                      value={contentDraft.askButtonText}
                      onChange={(event) => updateContentDraft('askButtonText', event.target.value)}
                    />
                  </label>
                  <label>
                    红色按钮
                    <input
                      value={contentDraft.shareButtonText}
                      onChange={(event) => updateContentDraft('shareButtonText', event.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-content-grid">
                  <label>
                    第一组大字
                    <input
                      value={contentDraft.metricAskTitle}
                      onChange={(event) => updateContentDraft('metricAskTitle', event.target.value)}
                    />
                  </label>
                  <label>
                    第一组小字
                    <input
                      value={contentDraft.metricAskCopy}
                      onChange={(event) => updateContentDraft('metricAskCopy', event.target.value)}
                    />
                  </label>
                  <label>
                    第二组大字
                    <input
                      value={contentDraft.metricExperienceTitle}
                      onChange={(event) => updateContentDraft('metricExperienceTitle', event.target.value)}
                    />
                  </label>
                  <label>
                    第二组小字
                    <input
                      value={contentDraft.metricExperienceCopy}
                      onChange={(event) => updateContentDraft('metricExperienceCopy', event.target.value)}
                    />
                  </label>
                  <label>
                    第三组大字
                    <input
                      value={contentDraft.metricRewardTitle}
                      onChange={(event) => updateContentDraft('metricRewardTitle', event.target.value)}
                    />
                  </label>
                  <label>
                    第三组小字
                    <input
                      value={contentDraft.metricRewardCopy}
                      onChange={(event) => updateContentDraft('metricRewardCopy', event.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-content-grid">
                  <label>
                    瓦剌详情页标识
                    <input
                      value={contentDraft.merchantWalaBadge}
                      onChange={(event) => updateContentDraft('merchantWalaBadge', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    瓦剌详情页标题
                    <textarea
                      rows={2}
                      value={contentDraft.merchantWalaHeroTitle}
                      onChange={(event) => updateContentDraft('merchantWalaHeroTitle', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    瓦剌详情页介绍
                    <textarea
                      rows={3}
                      value={contentDraft.merchantWalaIntro}
                      onChange={(event) => updateContentDraft('merchantWalaIntro', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    咨询前提示
                    <textarea
                      rows={2}
                      value={contentDraft.merchantWalaContactCopy}
                      onChange={(event) => updateContentDraft('merchantWalaContactCopy', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    服务展示 1
                    <textarea
                      rows={2}
                      value={contentDraft.merchantWalaCaseOne}
                      onChange={(event) => updateContentDraft('merchantWalaCaseOne', event.target.value)}
                    />
                  </label>
                  <label className="wide-field">
                    服务展示 2
                    <textarea
                      rows={2}
                      value={contentDraft.merchantWalaCaseTwo}
                      onChange={(event) => updateContentDraft('merchantWalaCaseTwo', event.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-content-grid admin-slider-grid">
                  <label>
                    手机 LOGO 宽度：{contentDraft.mobileLogoWidth}vw
                    <input
                      max="110"
                      min="48"
                      type="range"
                      value={contentDraft.mobileLogoWidth}
                      onChange={(event) => updateContentDraft('mobileLogoWidth', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    手机标题字号：{contentDraft.mobileHeroTitleSize}px
                    <input
                      max="72"
                      min="34"
                      type="range"
                      value={contentDraft.mobileHeroTitleSize}
                      onChange={(event) => updateContentDraft('mobileHeroTitleSize', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    手机副标题字号：{contentDraft.mobileHeroCopySize}px
                    <input
                      max="48"
                      min="18"
                      type="range"
                      value={contentDraft.mobileHeroCopySize}
                      onChange={(event) => updateContentDraft('mobileHeroCopySize', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    手机搜索框大小：{contentDraft.mobileSearchScale.toFixed(1)} 倍
                    <input
                      max="2.2"
                      min="0.9"
                      step="0.1"
                      type="range"
                      value={contentDraft.mobileSearchScale}
                      onChange={(event) => updateContentDraft('mobileSearchScale', Number(event.target.value))}
                    />
                  </label>
                </div>
              </div>
            )}
            <p className="admin-footnote">注册账号、合作申请、积分和帖子管理会统一保存，方便后续审核和运营。</p>
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
                setAccountRecoveryOpen(false)
                setAccountRecoveryNotice('')
                setAuthForm((form) => ({ ...form, agreementAccepted: false }))
              }}
            >
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">{authMode === 'login' ? '登录账号' : '创建账号'}</p>
            <h2>{authMode === 'login' ? '继续使用你的积分账户。' : '注册后即可提问、分享经验并获得积分。'}</h2>
            <form className="form-stack" onSubmit={handleAuth}>
              {authMode === 'register' && (
                <>
                  <label>
                    身份
                    <select
                      value={authForm.userType}
                      onChange={(event) =>
                        setAuthForm({ ...authForm, userType: event.target.value as AuthUserType, emailCode: '' })
                      }
                    >
                      <option value="student">学生</option>
                      <option value="merchant">商家</option>
                    </select>
                  </label>
                  {authForm.userType === 'student' ? (
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
                        学生阶段
                        <select
                          value={authForm.studentStage}
                          onChange={(event) =>
                            setAuthForm({ ...authForm, studentStage: event.target.value as StudentStage })
                          }
                        >
                          {studentStageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
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
                  ) : (
                    <>
                      <label>
                        商家/机构名称
                        <input
                          value={authForm.businessName}
                          onChange={(event) => setAuthForm({ ...authForm, businessName: event.target.value })}
                          placeholder="例如：首尔租房服务"
                        />
                      </label>
                      <label>
                        服务类型
                        <select
                          value={authForm.businessCategory}
                          onChange={(event) => setAuthForm({ ...authForm, businessCategory: event.target.value })}
                        >
                          {businessCategoryOptions.map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        所在国家
                        <input
                          value={authForm.country}
                          onChange={(event) => setAuthForm({ ...authForm, country: event.target.value })}
                          placeholder="例如：韩国"
                        />
                      </label>
                      <label>
                        所在城市
                        <input
                          value={authForm.city}
                          onChange={(event) => setAuthForm({ ...authForm, city: event.target.value })}
                          placeholder="例如：首尔"
                        />
                      </label>
                    </>
                  )}
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
                    <button type="button" onClick={sendEmailCode} disabled={!canSendEmailCode}>
                      {emailCodeSending ? '发送中...' : emailCodeCooldown > 0 ? `${emailCodeCooldown} 秒后重发` : '发送验证码'}
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
              <label className="agreement-check">
                <span className="agreement-copy">
                  <span className="agreement-copy-line">
                    <input
                      type="checkbox"
                      checked={authForm.agreementAccepted}
                      onChange={(event) => setAuthForm({ ...authForm, agreementAccepted: event.target.checked })}
                    />
                    <span>我已阅读并同意</span>
                    <a
                      href="/terms"
                      onClick={(event) => {
                        event.preventDefault()
                        setAuthMode(null)
                        setAccountRecoveryOpen(false)
                        navigateToPath('/terms')
                      }}
                    >
                      《用户协议》
                    </a>
                    <a
                      href="/privacy"
                      onClick={(event) => {
                        event.preventDefault()
                        setAuthMode(null)
                        setAccountRecoveryOpen(false)
                        navigateToPath('/privacy')
                      }}
                    >
                      《隐私政策》
                    </a>
                    <a
                      href="/minor-privacy"
                      onClick={(event) => {
                        event.preventDefault()
                        setAuthMode(null)
                        setAccountRecoveryOpen(false)
                        navigateToPath('/minor-privacy')
                      }}
                    >
                      《未成年人个人信息保护规则》
                    </a>
                  </span>
                </span>
              </label>
              <button type="submit">{authMode === 'login' ? '登录' : '注册并领取初始积分'}</button>
            </form>
            {authMode === 'login' && (
              <div className="account-recovery-wrap">
                <button
                  className="account-recovery-toggle"
                  type="button"
                  onClick={() => {
                    setAccountRecoveryOpen((open) => !open)
                    setAccountRecoveryNotice('')
                  }}
                >
                  找回账号
                </button>
                {accountRecoveryOpen && (
                  <form className="form-stack account-recovery-panel" onSubmit={submitAccountRecovery}>
                    <label>
                      注册邮箱或账号线索
                      <input
                        value={accountRecoveryForm.email}
                        onChange={(event) => setAccountRecoveryForm({ ...accountRecoveryForm, email: event.target.value })}
                        placeholder="尽量填写注册邮箱"
                      />
                    </label>
                    <label>
                      联系方式
                      <input
                        value={accountRecoveryForm.contact}
                        onChange={(event) => setAccountRecoveryForm({ ...accountRecoveryForm, contact: event.target.value })}
                        placeholder="邮箱、微信或电话"
                      />
                    </label>
                    <label>
                      补充说明
                      <textarea
                        rows={3}
                        value={accountRecoveryForm.description}
                        onChange={(event) => setAccountRecoveryForm({ ...accountRecoveryForm, description: event.target.value })}
                        placeholder="例如：记得昵称、学校、注册时间或无法登录的原因"
                      />
                    </label>
                    {accountRecoveryNotice && (
                      <p className="form-success" role="status">
                        {accountRecoveryNotice}
                      </p>
                    )}
                    <button type="submit">提交找回申请</button>
                  </form>
                )}
              </div>
            )}
            <button
              className="text-switch"
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login')
                setAuthNotice('')
                setAccountRecoveryOpen(false)
                setAccountRecoveryNotice('')
                setAuthForm((form) => ({ ...form, agreementAccepted: false }))
              }}
            >
              {authMode === 'login' ? '还没有账号？去注册' : '已有账号？去登录'}
            </button>
          </section>
        </div>
      )}

      {publishOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet wide-modal publish-modal" aria-label="发布内容">
            <button className="close-button" type="button" onClick={closePublishModal}>
              <X size={20} aria-hidden="true" />
            </button>
            {!publishMode ? (
              <div className="publish-choice">
                <p className="eyebrow dark">发布内容</p>
                <h2>你要发布“我知道”，还是“我能做”？</h2>
                <div className="publish-choice-grid">
                  <button type="button" onClick={() => setPublishMode('knowledge')}>
                    <strong>我知道</strong>
                    <span>发布经验、流程、材料清单、避坑攻略和学校生活复盘。</span>
                  </button>
                  <button type="button" onClick={() => setPublishMode('skill')}>
                    <strong>我能做</strong>
                    <span>发布可接的技能服务：跑腿、排队、地陪、宠物照看、同校辅导等。</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="publish-modal-head">
                  <button className="publish-back-button" type="button" onClick={() => setPublishMode(null)}>
                    重新选择
                  </button>
                  <p className="eyebrow dark">{publishMode === 'skill' ? '发布技能' : '发布经验'}</p>
                  <h2>
                    {publishMode === 'skill'
                      ? '发布你能提供的技能和帮助。'
                      : '发布可检索、可审核、可加精的留学经验。'}
                  </h2>
                </div>
                <form className="form-stack" onSubmit={handlePublish}>
                  <label>
                    {publishMode === 'skill' ? '技能标题' : '标题'}
                    <input
                      value={postForm.title}
                      onChange={(event) => setPostForm({ ...postForm, title: event.target.value })}
                      placeholder={
                        publishMode === 'skill'
                          ? '例如：新村/弘大附近可帮忙遛狗、喂猫、排队'
                          : '例如：庆熙大学传媒研究生真实体验'
                      }
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      {publishMode === 'skill' ? '关联学校/区域' : '学校'}
                      <select
                        value={postForm.school}
                        onChange={(event) => setPostForm({ ...postForm, school: event.target.value })}
                      >
                        {allSchoolProfiles.map((school) => (
                          <option key={school.id} value={school.name}>
                            {school.name}
                          </option>
                        ))}
                        <option value="韩国生活">韩国生活</option>
                      </select>
                    </label>
                    <label>
                      {publishMode === 'skill' ? '技能分类' : '分类'}
                      <select
                        value={publishMode === 'skill' ? postForm.skillCategory : postForm.category}
                        onChange={(event) =>
                          publishMode === 'skill'
                            ? setPostForm({ ...postForm, skillCategory: event.target.value })
                            : setPostForm({ ...postForm, category: event.target.value })
                        }
                      >
                        {(publishMode === 'skill' ? skillServiceCategories : categories).map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {publishMode === 'skill' ? '查看/联系积分' : '解锁积分'}
                      <input
                        type="number"
                        min="0"
                        value={postForm.price}
                        onChange={(event) => setPostForm({ ...postForm, price: event.target.value })}
                      />
                    </label>
                  </div>
                  {publishMode === 'skill' ? (
                    <>
                      <div className="form-grid skill-extra-grid">
                        <label>
                          服务区域
                          <input
                            value={postForm.serviceArea}
                            onChange={(event) => setPostForm({ ...postForm, serviceArea: event.target.value })}
                            placeholder="例如：新村、弘大、黑石洞、建大附近"
                          />
                        </label>
                        <label>
                          可接时间
                          <input
                            value={postForm.availability}
                            onChange={(event) => setPostForm({ ...postForm, availability: event.target.value })}
                            placeholder="例如：周末白天 / 平日晚上 / 可提前一天约"
                          />
                        </label>
                      </div>
                      <p className="form-notice">
                        学习类服务只能发布讲题、资料整理、修改建议和方法辅导；不能发布代写、代考、替课、作弊类服务。
                      </p>
                    </>
                  ) : null}
                  <label>
                    {publishMode === 'skill' ? '简介' : '摘要'}
                    <input
                      value={postForm.excerpt}
                      onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })}
                      placeholder={
                        publishMode === 'skill'
                          ? '一句话说明你能帮什么、适合谁、在哪个区域'
                          : '一句话说明这篇经验解决什么问题'
                      }
                    />
                  </label>
                  <label>
                    {publishMode === 'skill' ? '服务说明' : '正文'}
                    <textarea
                      value={postForm.body}
                      onChange={(event) => setPostForm({ ...postForm, body: event.target.value })}
                      placeholder={
                        publishMode === 'skill'
                          ? '写清你能做什么、服务边界、价格/积分、是否可线下、注意事项和不接的情况...'
                          : '写下申请过程、课程体验、教授风格、毕业要求、避坑建议...'
                      }
                    />
                  </label>
                  <button type="submit">{publishMode === 'skill' ? '保存并发布技能' : '保存并发布'}</button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {partnerOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet wide-modal" aria-label="机构合作申请">
            <button className="close-button" type="button" onClick={() => setPartnerOpen(false)}>
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">机构合作申请</p>
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
                    {businessCategoryOptions.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
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

      {reportTarget && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-sheet" aria-label="举报内容">
            <button className="close-button" type="button" onClick={() => setReportTarget(null)}>
              <X size={20} aria-hidden="true" />
            </button>
            <p className="eyebrow dark">举报入口</p>
            <h2>举报：{reportTarget.title}</h2>
            <form className="form-stack" onSubmit={submitReport}>
              <label>
                举报原因
                <select value={reportForm.reason} onChange={(event) => setReportForm({ ...reportForm, reason: event.target.value })}>
                  <option>违法违规内容</option>
                  <option>非法换汇/换米</option>
                  <option>代写代考/作弊</option>
                  <option>虚假商家/诈骗</option>
                  <option>侵犯隐私</option>
                  <option>垃圾广告</option>
                  <option>其他</option>
                </select>
              </label>
              <label>
                补充说明
                <textarea
                  rows={4}
                  value={reportForm.description}
                  onChange={(event) => setReportForm({ ...reportForm, description: event.target.value })}
                  placeholder="请补充截图线索、联系方式、违规点或受影响情况。"
                />
              </label>
              <label>
                联系方式（选填）
                <input
                  value={reportForm.contact}
                  onChange={(event) => setReportForm({ ...reportForm, contact: event.target.value })}
                  placeholder="邮箱、微信或电话，便于平台核实"
                />
              </label>
              <button type="submit">提交举报</button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
