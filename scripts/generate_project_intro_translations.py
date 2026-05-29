from __future__ import annotations

from pathlib import Path
from typing import Iterable

import fitz


ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "tmp" / "pdfs" / "translate-editions"
OUT = ROOT / "output" / "pdf"
SOURCE = TMP / "source.pdf"
IMG_DIR = TMP / "images"
OUT.mkdir(parents=True, exist_ok=True)
IMG_DIR.mkdir(parents=True, exist_ok=True)

PAGE_W = 960
PAGE_H = 540

BG = (0x06 / 255, 0x15 / 255, 0x12 / 255)
PANEL = (0x0B / 255, 0x24 / 255, 0x1D / 255)
PANEL_2 = (0x0E / 255, 0x32 / 255, 0x29 / 255)
PANEL_3 = (0x12 / 255, 0x42 / 255, 0x38 / 255)
WHITE = (0xF3 / 255, 0xF8 / 255, 0xF4 / 255)
MUTED = (0xB8 / 255, 0xC9 / 255, 0xC1 / 255)
DIM = (0x8D / 255, 0xA3 / 255, 0x99 / 255)
GOLD = (0xF2 / 255, 0xC7 / 255, 0x5B / 255)
RED = (0xEF / 255, 0x3F / 255, 0x3A / 255)
RED_DARK = (0xB9 / 255, 0x25 / 255, 0x22 / 255)
LINE = (0x2C / 255, 0x5A / 255, 0x50 / 255)
TABLE = (0x10 / 255, 0x3B / 255, 0x32 / 255)

FONT_REG = Path("C:/Windows/Fonts/msyh.ttc")
FONT_BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")
FONT_EN_REG = Path("C:/Windows/Fonts/segoeui.ttf")
FONT_EN_BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")
FONT_KR = Path("C:/Windows/Fonts/NotoSansKR-VF.ttf")
if not FONT_REG.exists():
    FONT_REG = Path("C:/Windows/Fonts/NotoSansSC-VF.ttf")
if not FONT_BOLD.exists():
    FONT_BOLD = FONT_REG
if not FONT_EN_REG.exists():
    FONT_EN_REG = FONT_REG
if not FONT_EN_BOLD.exists():
    FONT_EN_BOLD = FONT_BOLD
if not FONT_KR.exists():
    FONT_KR = FONT_REG


def ensure_assets() -> dict[str, Path]:
    """Extract reusable images from the user's PDF."""
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    doc = fitz.open(SOURCE)
    assets = {
        "cover_bg": IMG_DIR / "cover-bg.jpeg",
        "logo": IMG_DIR / "logo.png",
        "founder": IMG_DIR / "founder.png",
    }
    if not all(path.exists() for path in assets.values()):
        for page_no, page in enumerate(doc, 1):
            for index, image in enumerate(page.get_images(full=True), 1):
                xref = image[0]
                smask = image[1]
                extracted = doc.extract_image(xref)
                data = extracted["image"]
                ext = extracted["ext"]
                if smask:
                    pix = fitz.Pixmap(doc, xref)
                    mask = fitz.Pixmap(doc, smask)
                    pix = fitz.Pixmap(pix, mask)
                    data = pix.tobytes("png")
                    ext = "png"
                if page_no == 1 and index == 1:
                    assets["cover_bg"].write_bytes(data)
                elif page_no == 1 and index == 2:
                    assets["logo"].write_bytes(data)
                elif page_no == 2 and index == 1:
                    assets["founder"].write_bytes(data)
                else:
                    (IMG_DIR / f"p{page_no}_img{index}.{ext}").write_bytes(data)
    return assets


def font_for(lang: str, weight: str = "reg") -> Path:
    if lang == "en":
        return FONT_EN_BOLD if weight == "bold" else FONT_EN_REG
    if lang == "ko":
        return FONT_KR
    return FONT_BOLD if weight == "bold" else FONT_REG


def font_name(lang: str, weight: str = "reg") -> str:
    return f"{lang}_{weight}"


def measure(text: str, size: float, fontfile: Path) -> float:
    return fitz.Font(fontfile=str(fontfile)).text_length(text, fontsize=size)


def wrap_text(text: str, max_width: float, size: float, fontfile: Path, lang: str) -> list[str]:
    if "\n" in text:
        lines: list[str] = []
        for part in text.split("\n"):
            if not part:
                lines.append("")
            else:
                lines.extend(wrap_text(part, max_width, size, fontfile, lang))
        return lines
    if lang in {"en", "ko"}:
        tokens = text.split(" ")
        lines: list[str] = []
        line = ""
        for token in tokens:
            trial = token if not line else f"{line} {token}"
            if measure(trial, size, fontfile) <= max_width:
                line = trial
                continue
            if line:
                lines.append(line)
            if measure(token, size, fontfile) <= max_width:
                line = token
            else:
                line = ""
                for ch in token:
                    trial_ch = line + ch
                    if measure(trial_ch, size, fontfile) <= max_width or not line:
                        line = trial_ch
                    else:
                        lines.append(line)
                        line = ch
        if line:
            lines.append(line)
        return lines
    lines = []
    line = ""
    for ch in text:
        trial = line + ch
        if measure(trial, size, fontfile) <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = ch
    if line:
        lines.append(line)
    return lines


def text(
    page: fitz.Page,
    lang: str,
    x: float,
    y: float,
    value: str,
    size: float,
    color=WHITE,
    weight: str = "reg",
    max_width: float | None = None,
    line_gap: float = 1.28,
) -> float:
    fontfile = font_for(lang, weight)
    f_name = font_name(lang, weight)
    lines = wrap_text(value, max_width, size, fontfile, lang) if max_width else value.split("\n")
    cursor = y
    for line in lines:
        if line:
            page.insert_text(
                (x, cursor),
                line,
                fontsize=size,
                fontname=f_name,
                fontfile=str(fontfile),
                color=color,
            )
        cursor += size * line_gap
    return cursor


def textbox(
    page: fitz.Page,
    lang: str,
    rect: fitz.Rect,
    value: str,
    size: float,
    color=WHITE,
    weight: str = "reg",
    align: int = fitz.TEXT_ALIGN_LEFT,
) -> None:
    page.insert_textbox(
        rect,
        value,
        fontsize=size,
        fontname=font_name(lang, weight),
        fontfile=str(font_for(lang, weight)),
        color=color,
        align=align,
    )


def poly(page: fitz.Page, points: Iterable[tuple[float, float]], fill) -> None:
    shape = page.new_shape()
    shape.draw_polyline([fitz.Point(x, y) for x, y in points])
    shape.finish(color=None, fill=fill, closePath=True)
    shape.commit()


def base_page(doc: fitz.Document, lang: str, page_no: str, section: str) -> fitz.Page:
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    page.draw_rect(page.rect, fill=BG, color=None)
    poly(page, [(0, 0), (250, 0), (210, 26), (0, 26)], RED)
    poly(page, [(960, 540), (760, 540), (805, 505), (960, 505)], RED_DARK)
    page.draw_line((42, 58), (918, 58), color=LINE, width=1.1)
    page.draw_line((42, 492), (918, 492), color=LINE, width=1.0)
    text(page, lang, 43, 520, f"SHOUYE PROJECT INTRODUCTION · {page_no}", 7.5, DIM)
    text(page, lang, 42, 45, section, 7.8, GOLD, "bold")
    return page


def card(page: fitz.Page, rect: tuple[float, float, float, float], fill=PANEL, stroke=LINE, width=0.7) -> fitz.Rect:
    r = fitz.Rect(*rect)
    page.draw_rect(r, color=stroke, fill=fill, width=width)
    return r


def chip(page: fitz.Page, lang: str, x: float, y: float, label: str, w: float) -> None:
    page.draw_rect(fitz.Rect(x, y, x + w, y + 24), color=LINE, fill=PANEL_2, width=0.8)
    textbox(page, lang, fitz.Rect(x + 6, y + 6, x + w - 6, y + 21), label, 8.3, WHITE, "bold", fitz.TEXT_ALIGN_CENTER)


DATA = {
    "tc": {
        "suffix": "繁体中文",
        "cover": {
            "edition": "PROJECT INTRODUCTION · 2026 試營運版",
            "title": "售業項目介紹",
            "subtitle": "售業讓你的經驗和技能得到變現",
            "body": "圍繞留學生真實痛點，把個人經驗、技能服務、商家服務和快速求助匹配放在同一個平台",
            "chips": ["C2C 個人經驗", "快速匹配", "論壇沉澱", "商家服務"],
        },
        "founder": {
            "label": "創辦人簡介  /  FOUNDER PROFILE",
            "title": "創辦人簡介",
            "name": "呂澤宇",
            "name_secondary": "여택우",
            "subtitle": "就讀於中央大學體育產業經營專業，博士在讀",
            "body": [
                "擁有十一年韓國留學與生活經驗，長期關注中國留學生在申請、語言學習、生活服務和本地資源對接中遇到的真實問題。",
                "曾參與創建番茄教育品牌，積累了留學申請、韓語培訓和學生服務方面的實操經驗。售業公司註冊於中國大陸，主要服務留學生群體。",
                "未來三年計劃逐步開設美國、義大利、英國、澳大利亞分部，繼續圍繞留學生群體拓展服務網絡。",
            ],
            "tags": [("EXP", "11年韓國經驗"), ("CAU", "中央大學博士在讀"), ("EDU", "大量教育品牌經驗"), ("GLOBAL", "四國分部規劃")],
        },
        "contents": [
            ("01", "項目定位", "個人經驗與技能服務撮合平台"),
            ("02", "為什麼需要售業", "比普通內容平台更聚焦留學細問題"),
            ("03", "核心模式", "論壇式沉澱 + 快速匹配式對接"),
            ("04", "角色與流轉", "求助者、助人者、商家和後台規則"),
            ("05", "商家生態", "入駐、認證、置頂和活動合作"),
            ("06", "長期文化", "真實、互助、邊界、長期"),
        ],
        "position": {
            "title": "售業不是普通論壇",
            "body": "更準確地說，售業是一個圍繞留學生問題的個人經驗與技能服務撮合平台。會的人可以把經驗和技能發出來；需要的人可以付費看、付費問，也可以直接發需求等待對接。",
            "highlight": ("C2C", "個人經驗 / 技能對接", "不是二手交易，是把懂的人和需要的人接上。"),
            "cards": [
                ("個人對個人", "材料、選課、簽證、作品集、租房避坑，知道的人可以收費答疑。"),
                ("個人對商家", "線下服務、長期服務、專業服務進入同一套展示和評價規則。"),
                ("快速匹配", "輸入需求，平台把問題推給可能懂的人或商家，盡快接住。"),
            ],
        },
        "why": {
            "title": "小紅書適合看方向，售業負責解決細問題",
            "body": "留學裡的很多問題太細，不一定有流量，但會有人願意為準確答案付費。售業把這些細需求從群聊、筆記和廣告裡拎出來，讓它們變成可被搜索、可被付費、可被評價的服務。",
            "rows": [
                ("小紅書", "內容多、熱度高", "細需求容易被流量淹沒"),
                ("群聊 / 朋友圈", "問得快、熟人感強", "消息沉得快，後面的人難復用"),
                ("普通商家廣告", "服務能落地", "缺少評價、範圍和投訴記錄"),
                ("售業", "提問、付費看帖、付費答疑、商家服務在一起", "答案留下來，後來的人還能繼續用"),
            ],
            "example": "例子：D-2 續簽缺證明、某校專業材料、租房合同避坑、作品集面試、搬家清潔維修翻譯",
        },
        "model": {
            "title": "論壇式沉澱 + 快速匹配式對接",
            "body": "能復用的問題，留下來；需要馬上解決的問題，推給合適的人。售業不讓用戶在信息海裡慢慢撈，而是讓需求主動流向可能解決它的人。",
            "left": ("論壇式沉澱", "適合經驗帖、攻略、學校專題和可復用問題。內容可以被搜索、收藏、追問和評價。"),
            "right": ("快速匹配式對接", "適合急需幫助、個案很細、需要人跟進的問題。發布需求後，由達人或商家接單。"),
            "steps": ["發布需求", "標籤匹配", "達人/商家接單", "完成評價"],
        },
        "roles": {
            "title": "三類角色，同一個交易和信任場",
            "roles": [
                ("求助者", "把問題說清楚", "發布求助、懸賞、退款申訴、材料問題；不再到處問人，快速解決問題。"),
                ("助人者", "把經驗變成收入", "懂學校、懂流程、懂材料、懂本地生活的人，可以賣經驗、接諮詢、接幫助。"),
                ("商家", "把服務邊界講明白", "搬家、清潔、維修、升學、作品集、通信等服務按類別展示，被評價和管理。"),
            ],
            "platform": ("平台做什麼？", "把需求分發出去，把答案留下來，把商家的服務邊界管住，把評價、投訴、認證和積分沉澱成信任系統。"),
        },
        "merchant": {
            "title": "商家合作要賺錢，但不能壓過用戶信任",
            "body": "商家是售業生態的一部分。平台可以給商家曝光、認證、置頂和活動資源，但服務範圍、收費、風險和售後邊界必須清楚。",
            "headers": ["合作項", "標準價", "前期邀請優惠"],
            "rows": [
                ("普通入駐", "199 元/月\n1,980 元/年", "首批 90 天免費\n年付 980 元"),
                ("認證商家", "399 元/月\n3,980 元/年", "首月免費\n試營運 199 元/月"),
                ("類目置頂", "699 元/月/類目", "首批 299 元/月/類目"),
                ("首頁魚缸置頂", "1,299 元/月", "首批 699 元/月\n限 10 個名額"),
                ("聯合活動包", "999 元/次", "首批 399 元/次"),
            ],
            "boundary_title": "合作底線",
            "boundary": "拒絕虛假宣傳、灰產服務、換錢換匯、論文代寫等高風險業務。\n試營運價以正式協議和後台訂單為準。",
            "activity": "聯合活動包含：全平台的商家展示頁以及商家標籤頁裝飾，一次為期一週的用戶登錄後彈窗展示（適合促銷活動），一次售業用戶調查，方便商家做針對性調整。",
        },
        "culture": {
            "title": "不是信息差生意，是留學生互助和服務的基礎設施",
            "body": "售業希望讓學生敢問、有人願答、商家把話說清楚、平台把規則守住。一個問題解決完，不應該只剩下一次聊天記錄；它應該變成後來的人能繼續使用的經驗。",
            "cards": [
                ("真實", "講清時間、學校、身份階段和限制條件。"),
                ("互助", "讓走過的人幫助後來的人，也獲得合理回報。"),
                ("邊界", "商家寫清服務範圍、價格、風險和售後。"),
                ("長期", "把內容、評價和規則沉澱成平台資產。"),
            ],
            "site": "官網：shouye.fun",
            "email": "信箱：l243736590@gmail.com",
        },
    },
    "en": {
        "suffix": "English",
        "cover": {
            "edition": "PROJECT INTRODUCTION · 2026 PILOT VERSION",
            "title": "Shouye Project Introduction",
            "subtitle": "Turn your experience and skills into income",
            "body": "Built around real pain points for overseas students, bringing peer experience, skill services, merchant services and urgent help matching into one platform.",
            "chips": ["C2C Peer Experience", "Fast Matching", "Forum Knowledge Base", "Merchant Services"],
        },
        "founder": {
            "label": "FOUNDER PROFILE",
            "title": "Founder Profile",
            "name": "Lu Zeyu",
            "name_secondary": "여택우",
            "subtitle": "PhD candidate in Sports Industry Management, Chung-Ang University",
            "body": [
                "Lu Zeyu has eleven years of study and life experience in Korea, with long-term attention to the real problems Chinese students face in applications, language learning, local services and resource matching.",
                "He participated in building the Tomato Education brand and accumulated practical experience in study-abroad applications, Korean language training and student services.",
                "Shouye is registered in mainland China and primarily serves overseas students. Over the next three years, the platform plans to open branches in the United States, Italy, the United Kingdom and Australia.",
            ],
            "tags": [("EXP", "11 years in Korea"), ("CAU", "Chung-Ang PhD candidate"), ("EDU", "Education brand experience"), ("GLOBAL", "Four-country branch plan")],
        },
        "contents": [
            ("01", "Positioning", "A peer experience and skill-service matching platform"),
            ("02", "Why Shouye", "More focused on detailed overseas-study problems"),
            ("03", "Core Model", "Forum knowledge base + fast matching"),
            ("04", "Roles and Flow", "Help seekers, helpers, merchants and rules"),
            ("05", "Merchant Ecosystem", "Onboarding, verification, top placement and campaigns"),
            ("06", "Long-term Culture", "Truth, mutual help, boundaries and long-term trust"),
        ],
        "position": {
            "title": "Shouye is not a general forum",
            "body": "More precisely, Shouye is a matching platform for overseas students' questions, peer experience and skill-based services. People who know can publish their experience and skills; people who need help can pay to read, pay to ask, or post a request and wait for a match.",
            "highlight": ("C2C", "Peer experience / skill matching", "Not second-hand trading. It connects people who know with people who need help."),
            "cards": [
                ("Person to Person", "Applications, course selection, visas, portfolios and housing risks can become paid answers."),
                ("Person to Merchant", "Offline, long-term and professional services enter one display and review system."),
                ("Fast Matching", "Users submit a need; the platform pushes it to likely helpers or merchants so it is picked up quickly."),
            ],
        },
        "why": {
            "title": "Xiaohongshu gives direction; Shouye solves details",
            "body": "Many overseas-study problems are too specific to get traffic, but someone will pay for an accurate answer. Shouye pulls these detailed needs out of group chats, posts and ads, turning them into searchable, paid and reviewable services.",
            "rows": [
                ("Xiaohongshu", "Lots of content, high traffic", "Detailed needs are easily buried by algorithms"),
                ("Group chats / Moments", "Fast to ask, familiar feeling", "Messages sink quickly and are hard to reuse"),
                ("Ordinary merchant ads", "Services can be delivered", "Often lack reviews, service scope and complaint records"),
                ("Shouye", "Questions, paid posts, paid Q&A and merchant services in one place", "Answers stay and can help later students"),
            ],
            "example": "Examples: D-2 extension proof, school-specific application materials, lease risks, portfolio interviews, moving, cleaning, repair and translation.",
        },
        "model": {
            "title": "Forum knowledge base + fast matching",
            "body": "Reusable questions should stay; urgent problems should be routed to suitable people. Shouye does not leave users searching through an ocean of information. It lets needs flow toward those who can solve them.",
            "left": ("Forum Knowledge Base", "For guides, experience posts, school topics and reusable questions. Content can be searched, saved, followed up and reviewed."),
            "right": ("Fast Matching", "For urgent help, detailed cases and problems needing follow-up. After a request is posted, helpers or merchants can take it."),
            "steps": ["Post request", "Tag matching", "Helper/Merchant accepts", "Complete & review"],
        },
        "roles": {
            "title": "Three roles, one trust and transaction field",
            "roles": [
                ("Help Seeker", "Make the problem clear", "Post requests, rewards, refund claims or document issues. Stop asking everywhere and solve the problem faster."),
                ("Helper", "Turn experience into income", "People who understand schools, procedures, documents or local life can sell experience, provide consultation and help."),
                ("Merchant", "Make service boundaries clear", "Moving, cleaning, repair, admissions, portfolios and telecom services are displayed by category, reviewed and managed."),
            ],
            "platform": ("What does the platform do?", "Distribute needs, preserve answers, manage merchant boundaries, and turn reviews, complaints, verification and points into a trust system."),
        },
        "merchant": {
            "title": "Merchant cooperation should earn revenue without weakening user trust",
            "body": "Merchants are part of the Shouye ecosystem. The platform can provide exposure, verification, top placement and campaign resources, but service scope, pricing, risks and after-sales boundaries must be clear.",
            "headers": ["Cooperation Item", "Standard Price", "Early Invitation Offer"],
            "rows": [
                ("Regular Onboarding", "¥199 / month\n¥1,980 / year", "First 90 days free\nAnnual ¥980"),
                ("Verified Merchant", "¥399 / month\n¥3,980 / year", "First month free\nPilot ¥199 / month"),
                ("Category Top Placement", "¥699 / month / category", "First batch ¥299 / month / category"),
                ("Home Fish Tank Top Placement", "¥1,299 / month", "First batch ¥699 / month\nLimited to 10 slots"),
                ("Joint Campaign Package", "¥999 / campaign", "First batch ¥399 / campaign"),
            ],
            "boundary_title": "Cooperation Boundary",
            "boundary": "No false advertising, gray-market services, currency exchange, ghostwriting or other high-risk services.\nPilot prices are subject to official agreements and backend orders.",
            "activity": "The joint campaign package includes platform-wide merchant showcase/category decoration, a one-week pop-up shown after user login for promotions, and one Shouye user survey to help merchants adjust their offer.",
        },
        "culture": {
            "title": "Not an information-gap business, but infrastructure for overseas-student mutual help and services",
            "body": "Shouye wants students to dare to ask, helpers to be willing to answer, merchants to explain services clearly, and the platform to keep rules. Once a problem is solved, it should not disappear as a chat log; it should become reusable experience for later students.",
            "cards": [
                ("Truth", "Clarify time, school, identity stage and limitations."),
                ("Mutual Help", "Let those who have been through it help later students and earn fair returns."),
                ("Boundaries", "Merchants clearly state scope, price, risks and after-sales terms."),
                ("Long-term", "Turn content, reviews and rules into platform assets."),
            ],
            "site": "Website: shouye.fun",
            "email": "Email: l243736590@gmail.com",
        },
    },
    "ko": {
        "suffix": "한국어",
        "cover": {
            "edition": "PROJECT INTRODUCTION · 2026 시범 운영판",
            "title": "Shouye 프로젝트 소개",
            "subtitle": "당신의 경험과 기술이 수익이 되도록",
            "body": "유학생의 실제 문제를 중심으로 개인 경험, 스킬 서비스, 업체 서비스, 빠른 도움 매칭을 한 플랫폼에 모았습니다.",
            "chips": ["C2C 개인 경험", "빠른 매칭", "포럼식 축적", "업체 서비스"],
        },
        "founder": {
            "label": "창업자 소개  /  FOUNDER PROFILE",
            "title": "창업자 소개",
            "name": "여택우",
            "name_secondary": "Lu Zeyu",
            "subtitle": "중앙대학교 스포츠산업경영 전공 박사과정 재학",
            "body": [
                "여택우는 11년간 한국 유학 및 생활 경험을 바탕으로, 중국 유학생이 입시, 언어 학습, 생활 서비스와 현지 자원 연결 과정에서 겪는 실제 문제를 꾸준히 관찰해 왔습니다.",
                "토마토교육 브랜드 창업에 참여했으며, 유학 신청, 한국어 교육, 학생 서비스 운영에서 실무 경험을 쌓았습니다.",
                "Shouye 회사는 중국 대륙에 등록되어 있으며 유학생을 주요 고객으로 합니다. 향후 3년 안에 미국, 이탈리아, 영국, 호주 지부 개설을 계획하고 있습니다.",
            ],
            "tags": [("EXP", "한국 경험 11년"), ("CAU", "중앙대 박사과정"), ("EDU", "교육 브랜드 경험"), ("GLOBAL", "4개국 지부 계획")],
        },
        "contents": [
            ("01", "프로젝트 포지셔닝", "개인 경험과 스킬 서비스를 연결하는 플랫폼"),
            ("02", "왜 Shouye인가", "일반 콘텐츠 플랫폼보다 유학의 세부 문제에 집중"),
            ("03", "핵심 모델", "포럼식 지식 축적 + 빠른 매칭"),
            ("04", "역할과 흐름", "도움 요청자, 조력자, 업체와 플랫폼 규칙"),
            ("05", "업체 생태계", "입점, 인증, 상단 노출과 공동 캠페인"),
            ("06", "장기 문화", "진실성, 상호 도움, 경계, 장기 신뢰"),
        ],
        "position": {
            "title": "Shouye는 일반 포럼이 아닙니다",
            "body": "더 정확히 말하면 Shouye는 유학생 문제를 중심으로 개인 경험과 스킬 서비스를 연결하는 매칭 플랫폼입니다. 아는 사람은 경험과 기술을 올리고, 필요한 사람은 유료로 읽거나 질문하거나 직접 요청을 올려 매칭을 기다릴 수 있습니다.",
            "highlight": ("C2C", "개인 경험 / 스킬 매칭", "중고거래가 아니라, 아는 사람과 필요한 사람을 연결합니다."),
            "cards": [
                ("개인 대 개인", "서류, 수강신청, 비자, 포트폴리오, 집 계약 리스크 등 경험자가 유료로 답할 수 있습니다."),
                ("개인 대 업체", "오프라인 서비스, 장기 서비스, 전문 서비스가 하나의 전시와 평가 규칙 안에 들어옵니다."),
                ("빠른 매칭", "요청을 입력하면 플랫폼이 이해할 가능성이 높은 사람이나 업체에 전달해 빠르게 연결합니다."),
            ],
        },
        "why": {
            "title": "샤오홍슈는 방향을 보기 좋고, Shouye는 세부 문제를 해결합니다",
            "body": "유학 문제 중에는 너무 세부적이라 조회수는 낮지만, 정확한 답에는 비용을 지불할 사람이 있습니다. Shouye는 이런 수요를 단체 채팅, 게시물, 광고에서 꺼내 검색 가능하고 유료화 가능하며 평가 가능한 서비스로 만듭니다.",
            "rows": [
                ("샤오홍슈", "콘텐츠가 많고 유입이 큼", "세부 수요는 알고리즘 속에 묻히기 쉬움"),
                ("단체 채팅 / 친구圈", "빠르게 물어보고 친근함", "메시지가 금방 묻혀 재사용이 어려움"),
                ("일반 업체 광고", "서비스 실행 가능", "평가, 범위, 신고 기록이 부족한 경우가 많음"),
                ("Shouye", "질문, 유료 글, 유료 답변, 업체 서비스를 한곳에", "답이 남아 다음 학생도 계속 활용 가능"),
            ],
            "example": "예: D-2 연장 증빙 부족, 학교별 전공 서류, 집 계약 리스크, 포트폴리오 면접, 이사·청소·수리·번역.",
        },
        "model": {
            "title": "포럼식 축적 + 빠른 매칭식 연결",
            "body": "재사용 가능한 문제는 남기고, 바로 해결해야 하는 문제는 적합한 사람에게 보냅니다. Shouye는 사용자가 정보의 바다에서 헤매게 하지 않고, 수요가 해결 가능한 사람에게 흐르도록 합니다.",
            "left": ("포럼식 축적", "경험 글, 가이드, 학교 특집, 반복되는 질문에 적합합니다. 검색, 저장, 추가 질문, 평가가 가능합니다."),
            "right": ("빠른 매칭식 연결", "급한 도움, 아주 세부적인 사례, 사람이 따라가야 하는 문제에 적합합니다. 요청 후 조력자나 업체가 맡을 수 있습니다."),
            "steps": ["요청 등록", "태그 매칭", "조력자/업체 수락", "완료 및 평가"],
        },
        "roles": {
            "title": "세 가지 역할, 하나의 거래와 신뢰 공간",
            "roles": [
                ("도움 요청자", "문제를 명확히 설명", "도움 요청, 보상, 환불 신청, 서류 문제를 올리고 여기저기 묻지 않아도 빠르게 해결합니다."),
                ("조력자", "경험을 수익으로 전환", "학교, 절차, 서류, 현지 생활을 아는 사람이 경험 판매, 상담, 도움 제공을 할 수 있습니다."),
                ("업체", "서비스 범위를 명확히", "이사, 청소, 수리, 진학, 포트폴리오, 통신 서비스가 카테고리별로 전시되고 평가·관리됩니다."),
            ],
            "platform": ("플랫폼은 무엇을 하나요?", "수요를 분배하고 답변을 남기며, 업체 서비스 범위를 관리합니다. 평가, 신고, 인증, 포인트를 신뢰 시스템으로 축적합니다."),
        },
        "merchant": {
            "title": "업체 협력은 수익이 필요하지만 사용자 신뢰를 해치면 안 됩니다",
            "body": "업체는 Shouye 생태계의 일부입니다. 플랫폼은 노출, 인증, 상단 배치, 캠페인 자원을 제공할 수 있지만 서비스 범위, 요금, 위험, 사후처리 경계는 반드시 명확해야 합니다.",
            "headers": ["협력 항목", "표준가", "초기 초청 혜택"],
            "rows": [
                ("일반 입점", "월 199위안\n연 1,980위안", "첫 90일 무료\n연 980위안"),
                ("인증 업체", "월 399위안\n연 3,980위안", "첫 달 무료\n시범 운영 월 199위안"),
                ("카테고리 상단 노출", "월 699위안/카테고리", "초기 월 299위안/카테고리"),
                ("홈 피시탱크 상단", "월 1,299위안", "초기 월 699위안\n10개 한정"),
                ("공동 캠페인 패키지", "회당 999위안", "초기 회당 399위안"),
            ],
            "boundary_title": "협력 기준",
            "boundary": "허위 홍보, 회색지대 서비스, 환전, 대필 등 고위험 업무는 거절합니다.\n시범 운영 가격은 공식 계약과 백엔드 주문을 기준으로 합니다.",
            "activity": "공동 캠페인 패키지에는 플랫폼 전체의 업체 전시 페이지와 카테고리 장식, 1주일간 로그인 후 팝업 노출, 업체가 제안을 조정할 수 있도록 돕는 Shouye 사용자 설문 1회가 포함됩니다.",
        },
        "culture": {
            "title": "정보 격차 장사가 아니라, 유학생 상호 도움과 서비스의 기반입니다",
            "body": "Shouye는 학생이 편하게 질문하고, 아는 사람이 답하고, 업체가 서비스를 명확히 설명하며, 플랫폼이 규칙을 지키는 공간을 만들고자 합니다. 해결된 문제는 채팅 기록으로 끝나는 것이 아니라 다음 학생이 계속 사용할 수 있는 경험이 되어야 합니다.",
            "cards": [
                ("진실성", "시간, 학교, 신분 단계와 제한 조건을 명확히 합니다."),
                ("상호 도움", "먼저 겪은 사람이 뒤에 오는 사람을 돕고 합리적 보상을 받습니다."),
                ("경계", "업체는 범위, 가격, 위험, 사후처리를 명확히 씁니다."),
                ("장기성", "콘텐츠, 평가, 규칙을 플랫폼 자산으로 축적합니다."),
            ],
            "site": "공식 사이트: shouye.fun",
            "email": "이메일: l243736590@gmail.com",
        },
    },
}


def page_cover(doc: fitz.Document, lang: str, assets: dict[str, Path]) -> None:
    data = DATA[lang]["cover"]
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    page.insert_image(page.rect, filename=str(assets["cover_bg"]))
    poly(page, [(0, 0), (435, 0), (320, 540), (0, 540)], BG)
    poly(page, [(0, 0), (260, 0), (218, 26), (0, 26)], RED)
    poly(page, [(960, 540), (765, 540), (812, 505), (960, 505)], RED_DARK)
    page.insert_image(fitz.Rect(42, 40, 226, 118), filename=str(assets["logo"]), keep_proportion=True)
    text(page, lang, 42, 146, data["edition"], 7.5, GOLD, "bold")
    title_size = 25 if lang != "en" else 23
    text(page, lang, 42, 188, data["title"], title_size, WHITE, "bold")
    text(page, lang, 42, 214, data["subtitle"], 12.5 if lang != "en" else 11.5, WHITE, "bold", max_width=270)
    text(page, lang, 42, 334, data["body"], 8.5 if lang != "en" else 8.0, MUTED, max_width=330)
    x = 42
    for label in data["chips"]:
        w = 67 if lang == "tc" else 92 if lang == "en" else 73
        chip(page, lang, x, 402, label, w)
        x += w + 10
    text(page, lang, 875, 510, "shouye.fun", 7.5, GOLD, "bold")


def page_founder(doc: fitz.Document, lang: str, assets: dict[str, Path]) -> None:
    data = DATA[lang]["founder"]
    page = base_page(doc, lang, "01", data["label"])
    text(page, lang, 58, 138, data["title"], 38 if lang != "en" else 34, WHITE, "bold")
    text(page, lang, 58, 205, data["name"], 28 if lang != "en" else 25, WHITE, "bold")
    secondary = data.get("name_secondary", "여택우")
    secondary_lang = "ko" if lang in {"tc", "en"} else "en"
    secondary_x = 210 if lang == "tc" else 170 if lang == "en" else 190
    text(page, secondary_lang, secondary_x, 205, "/  " + secondary, 20, GOLD, "reg")
    text(page, lang, 58, 232, data["subtitle"], 12.2 if lang != "en" else 11.5, MUTED, max_width=570)
    y = 280
    for paragraph in data["body"]:
        y = text(page, lang, 58, y, paragraph, 12.2 if lang != "en" else 10.8, WHITE, max_width=575, line_gap=1.33)
        y += 9
    tag_w = 254
    tag_h = 29
    for i, (key, value) in enumerate(data["tags"]):
        x = 58 if i % 2 == 0 else 346
        yy = 415 if i < 2 else 453
        page.draw_rect(fitz.Rect(x, yy, x + tag_w, yy + tag_h), color=LINE, fill=PANEL, width=0.8)
        text(page, lang, x + 12, yy + 20, key, 10.5, RED if i == 0 else GOLD, "bold")
        text(page, lang, x + 58, yy + 20, value, 10.5 if lang != "ko" else 9.7, WHITE, "bold", max_width=180)
    card_rect = fitz.Rect(665, 86, 905, 454)
    page.draw_rect(fitz.Rect(card_rect.x0 + 7, card_rect.y0 + 7, card_rect.x1 + 7, card_rect.y1 + 7), fill=(0.02, 0.06, 0.05), color=None)
    page.draw_rect(card_rect, fill=(0.93, 0.95, 0.93), color=None)
    poly(page, [(665, 86), (784, 86), (665, 184)], RED)
    poly(page, [(905, 454), (810, 454), (905, 374)], RED_DARK)
    page.insert_image(fitz.Rect(679, 100, 891, 405), filename=str(assets["founder"]), keep_proportion=False)
    page.draw_rect(fitz.Rect(679, 100, 891, 405), color=WHITE, width=1)
    page.draw_rect(fitz.Rect(679, 414, 891, 436), fill=(0.05, 0.10, 0.09), color=None)
    text(page, lang, 691, 430, data["name"], 10.5, WHITE, "bold")
    text(page, secondary_lang, 752, 430, "/ " + secondary, 11, WHITE, "reg")
    text(page, lang, 810, 520, "shouye.fun", 7.5, GOLD)


def page_contents(doc: fitz.Document, lang: str) -> None:
    page = base_page(doc, lang, "02", "CONTENTS")
    text(page, lang, 58, 122, "目錄" if lang == "tc" else "Contents" if lang == "en" else "목차", 32, WHITE, "bold")
    items = DATA[lang]["contents"]
    for idx, (num, title, desc) in enumerate(items):
        col = idx % 2
        row = idx // 2
        x = 115 + col * 350
        y = 180 + row * 78
        text(page, lang, x, y, num, 12, RED, "bold")
        text(page, lang, x + 48, y, title, 13.5 if lang != "en" else 12.5, WHITE, "bold", max_width=245)
        text(page, lang, x + 48, y + 20, desc, 8.3 if lang != "en" else 7.8, MUTED, max_width=260)
        page.draw_line((x + 48, y + 31), (x + 315, y + 31), color=LINE, width=0.8)
    text(page, lang, 815, 520, "shouye.fun", 7, GOLD)


def page_position(doc: fitz.Document, lang: str) -> None:
    data = DATA[lang]["position"]
    page = base_page(doc, lang, "03", "01  " + ("項目定位" if lang == "tc" else "Positioning" if lang == "en" else "프로젝트 포지셔닝"))
    text(page, lang, 58, 132, data["title"], 24 if lang != "en" else 22, WHITE, "bold", max_width=570)
    page.draw_rect(fitz.Rect(58, 148, 135, 151), fill=RED, color=None)
    text(page, lang, 58, 190, data["body"], 10.7 if lang != "en" else 9.4, WHITE, max_width=540)
    hi = data["highlight"]
    card(page, (632, 154, 838, 274), PANEL_2, LINE)
    text(page, lang, 652, 196, hi[0], 23, RED, "bold")
    text(page, lang, 652, 220, hi[1], 10, WHITE, "bold", max_width=160)
    text(page, lang, 652, 250, hi[2], 8.8 if lang != "en" else 8.0, MUTED, max_width=160)
    for i, item in enumerate(data["cards"]):
        x = 58 + i * 240
        r = card(page, (58 + i * 240, 330, 212 + i * 240, 438), PANEL_2, LINE)
        text(page, lang, x + 14, 360, item[0], 13, RED if i == 2 else WHITE, "bold", max_width=120)
        text(page, lang, x + 14, 396, item[1], 8.6 if lang != "en" else 7.5, WHITE, max_width=124)


def page_why(doc: fitz.Document, lang: str) -> None:
    data = DATA[lang]["why"]
    page = base_page(doc, lang, "04", "02  " + ("為什麼需要售業" if lang == "tc" else "Why Shouye" if lang == "en" else "왜 Shouye인가"))
    text(page, lang, 58, 132, data["title"], 23 if lang != "en" else 21, WHITE, "bold", max_width=780)
    page.draw_rect(fitz.Rect(58, 148, 135, 151), fill=RED, color=None)
    text(page, lang, 58, 188, data["body"], 10.0 if lang != "en" else 8.7, WHITE, max_width=810)
    y = 258
    for idx, row in enumerate(data["rows"]):
        fill = RED if idx == 3 else PANEL_2
        color = WHITE
        page.draw_rect(fitz.Rect(58, y, 902, y + 36), fill=fill, color=None)
        text(page, lang, 80, y + 23, row[0], 10.2, GOLD if idx == 3 else RED if idx == 0 else WHITE, "bold", max_width=150)
        text(page, lang, 315, y + 23, row[1], 8.3 if lang != "en" else 7.2, color, "bold", max_width=230)
        text(page, lang, 610, y + 23, row[2], 8.3 if lang != "en" else 7.2, color, max_width=250)
        y += 48
    text(page, lang, 58, 472, data["example"], 8.2 if lang != "en" else 7.1, GOLD, "bold", max_width=820)


def page_model(doc: fitz.Document, lang: str) -> None:
    data = DATA[lang]["model"]
    page = base_page(doc, lang, "05", "03  " + ("核心模式" if lang == "tc" else "Core Model" if lang == "en" else "핵심 모델"))
    text(page, lang, 58, 132, data["title"], 24 if lang != "en" else 22, WHITE, "bold", max_width=760)
    page.draw_rect(fitz.Rect(58, 148, 135, 151), fill=RED, color=None)
    text(page, lang, 58, 188, data["body"], 10 if lang != "en" else 8.8, WHITE, max_width=800)
    for idx, key in enumerate(["left", "right"]):
        x = 58 if idx == 0 else 520
        stroke = RED if idx == 0 else GOLD
        card(page, (x, 264, x + 390, 378), PANEL_2, stroke, 0.9)
        title, body = data[key]
        text(page, lang, x + 22, 304, title, 14 if lang != "en" else 13, RED if idx == 0 else GOLD, "bold")
        text(page, lang, x + 22, 340, body, 8.5 if lang != "en" else 7.6, WHITE, max_width=330)
    step_y = 438
    for i, label in enumerate(data["steps"], 1):
        cx = 112 + (i - 1) * 215
        page.draw_circle((cx, step_y), 13, fill=RED if i == 1 else PANEL_2, color=None)
        textbox(page, lang, fitz.Rect(cx - 6, step_y - 6, cx + 6, step_y + 8), str(i), 8, WHITE, "bold", fitz.TEXT_ALIGN_CENTER)
        text(page, lang, cx - 38, step_y + 36, label, 8 if lang != "en" else 7.2, WHITE, "bold", max_width=100)
        if i < 4:
            page.draw_line((cx + 22, step_y), (cx + 180, step_y), color=GOLD, width=0.8)


def page_roles(doc: fitz.Document, lang: str) -> None:
    data = DATA[lang]["roles"]
    page = base_page(doc, lang, "06", "04  " + ("角色與流轉" if lang == "tc" else "Roles and Flow" if lang == "en" else "역할과 흐름"))
    text(page, lang, 58, 132, data["title"], 25 if lang != "en" else 22, WHITE, "bold", max_width=820)
    x_positions = [58, 355, 652]
    for idx, role in enumerate(data["roles"]):
        x = x_positions[idx]
        card(page, (x, 220, x + 235, 380), PANEL_2, LINE)
        text(page, lang, x + 20, 260, role[0], 13, RED if idx == 0 else GOLD if idx == 2 else WHITE, "bold")
        text(page, lang, x + 20, 294, role[1], 11, WHITE, "bold", max_width=170)
        text(page, lang, x + 20, 334, role[2], 8.0 if lang != "en" else 7.0, WHITE, max_width=185)
    title, body = data["platform"]
    text(page, lang, 58, 438, title, 12, GOLD, "bold")
    text(page, lang, 58, 468, body, 8.8 if lang != "en" else 7.7, WHITE, max_width=840)


def page_merchant(doc: fitz.Document, lang: str) -> None:
    data = DATA[lang]["merchant"]
    page = base_page(doc, lang, "07", "05  " + ("商家生態" if lang == "tc" else "Merchant Ecosystem" if lang == "en" else "업체 생태계"))
    text(page, lang, 58, 128, data["title"], 19 if lang != "en" else 17.5, WHITE, "bold", max_width=820)
    text(page, lang, 58, 164, data["body"], 8.6 if lang != "en" else 7.4, WHITE, max_width=820)
    table_x, table_y = 58, 214
    col_w = [205, 220, 290]
    row_h = 42
    page.draw_rect(fitz.Rect(table_x, table_y, table_x + sum(col_w), table_y + 30), fill=TABLE, color=None)
    x = table_x
    for i, header in enumerate(data["headers"]):
        text(page, lang, x + 12, table_y + 21, header, 8.5 if lang != "en" else 7.8, WHITE, "bold")
        x += col_w[i]
    y = table_y + 30
    for ridx, row in enumerate(data["rows"]):
        fill = PANEL_2 if ridx % 2 == 0 else PANEL
        page.draw_rect(fitz.Rect(table_x, y, table_x + sum(col_w), y + row_h), fill=fill, color=LINE, width=0.35)
        x = table_x
        for cidx, cell in enumerate(row):
            text(page, lang, x + 12, y + 18, cell, 7.9 if lang != "en" else 7.0, WHITE, "bold" if cidx == 0 else "reg", max_width=col_w[cidx] - 20, line_gap=1.18)
            x += col_w[cidx]
        y += row_h
    side_x = table_x + sum(col_w) + 25
    card(page, (side_x, 214, 908, 424), PANEL_2, LINE)
    text(page, lang, side_x + 18, 246, data["boundary_title"], 11, GOLD, "bold", max_width=170)
    text(page, lang, side_x + 18, 286, data["boundary"], 7.6 if lang != "en" else 6.7, WHITE, max_width=145)
    text(page, lang, 58, 472, data["activity"], 7.2 if lang != "en" else 6.2, MUTED, max_width=830)


def page_culture(doc: fitz.Document, lang: str, assets: dict[str, Path]) -> None:
    data = DATA[lang]["culture"]
    page = base_page(doc, lang, "08", "06  " + ("長期文化" if lang == "tc" else "Long-term Culture" if lang == "en" else "장기 문화"))
    text(page, lang, 58, 126, data["title"], 21 if lang != "en" else 18, WHITE, "bold", max_width=820)
    page.draw_rect(fitz.Rect(58, 148, 135, 151), fill=RED, color=None)
    text(page, lang, 58, 192, data["body"], 8.9 if lang != "en" else 7.8, WHITE, max_width=820)
    for i, item in enumerate(data["cards"]):
        x = 58 + i * 215
        card(page, (x, 304, x + 170, 404), PANEL_2, LINE)
        text(page, lang, x + 18, 342, item[0], 13 if lang != "en" else 12, GOLD if i else RED, "bold")
        text(page, lang, x + 18, 378, item[1], 7.8 if lang != "en" else 7.0, WHITE, max_width=130)
    page.insert_image(fitz.Rect(58, 428, 194, 474), filename=str(assets["logo"]), keep_proportion=True)
    text(page, lang, 228, 450, data["site"], 8.5, WHITE, "bold")
    text(page, lang, 228, 474, data["email"], 8.5, WHITE, "bold")


def build(lang: str, assets: dict[str, Path]) -> Path:
    doc = fitz.open()
    page_cover(doc, lang, assets)
    page_founder(doc, lang, assets)
    page_contents(doc, lang)
    page_position(doc, lang)
    page_why(doc, lang)
    page_model(doc, lang)
    page_roles(doc, lang)
    page_merchant(doc, lang)
    page_culture(doc, lang, assets)
    if hasattr(doc, "subset_fonts"):
        doc.subset_fonts()
    out = OUT / f"shouye-project-introduction-{DATA[lang]['suffix']}.pdf"
    doc.save(out, garbage=4, deflate=True, clean=True)
    return out


def render_contact(paths: list[Path]) -> None:
    from PIL import Image, ImageDraw

    for pdf_path in paths:
        doc = fitz.open(pdf_path)
        thumbs = []
        for page in doc:
            pix = page.get_pixmap(matrix=fitz.Matrix(0.42, 0.42), alpha=False)
            thumbs.append(Image.frombytes("RGB", [pix.width, pix.height], pix.samples))
        cols = 3
        rows = (len(thumbs) + cols - 1) // cols
        w, h = thumbs[0].size
        sheet = Image.new("RGB", (cols * w, rows * h), (235, 235, 235))
        draw = ImageDraw.Draw(sheet)
        for idx, thumb in enumerate(thumbs):
            x = (idx % cols) * w
            y = (idx // cols) * h
            sheet.paste(thumb, (x, y))
            draw.text((x + 6, y + 6), str(idx + 1), fill=(255, 0, 0))
        preview = TMP / f"{pdf_path.stem}-contact-sheet.png"
        sheet.save(preview)
        print(preview)


def main() -> None:
    assets = ensure_assets()
    paths = [build(lang, assets) for lang in ("tc", "en", "ko")]
    render_contact(paths)
    for path in paths:
        doc = fitz.open(path)
        print(path, path.stat().st_size, doc.page_count, len(doc[0].get_text("text")))


if __name__ == "__main__":
    main()
