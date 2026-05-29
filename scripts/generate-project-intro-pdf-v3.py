# -*- coding: utf-8 -*-
from __future__ import annotations

import shutil
from pathlib import Path

import fitz
from PIL import Image, ImageEnhance, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT_DIR = ROOT / "output" / "pdf"
TMP_DIR = ROOT / "tmp" / "pdfs" / "shouye-project-introduction-v4"
PREVIEW_DIR = OUT_DIR / "preview-shouye-project-introduction-v4-dark"
PDF_PATH = OUT_DIR / "shouye-project-introduction-v4-dark.pdf"
CONTACT_SHEET = OUT_DIR / "shouye-project-introduction-v4-dark-preview.png"

PAGE_W, PAGE_H = A4

INK = colors.HexColor("#f5fbf7")
DEEP = colors.HexColor("#061512")
FOREST = colors.HexColor("#083326")
FOREST_2 = colors.HexColor("#12463a")
CREAM = colors.HexColor("#faf7ef")
MIST = colors.HexColor("#edf4ef")
GOLD = colors.HexColor("#c39235")
GOLD_LIGHT = colors.HexColor("#f2d06b")
CORAL = colors.HexColor("#ef5742")
BLUE = colors.HexColor("#0e365f")
MUTED = colors.HexColor("#c3d0ca")
LINE = colors.HexColor("#2d4b42")
SOFT = colors.HexColor("#f4f0e6")
PANEL = colors.HexColor("#10231f")
PANEL_2 = colors.HexColor("#0b1d19")

ASSETS = {
    "logo_light": PUBLIC / "brand" / "shouye-logo-new-light.png",
    "logo_dark": PUBLIC / "brand" / "shouye-logo-new-dark.png",
    "hero": PUBLIC / "home-hero" / "1.png",
}


def ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    if PREVIEW_DIR.exists():
        shutil.rmtree(PREVIEW_DIR)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)


def register_fonts() -> tuple[str, str, str]:
    font_dir = Path("C:/Windows/Fonts")
    regular = font_dir / "Deng.ttf"
    medium = font_dir / "Dengb.ttf"
    bold = font_dir / "simhei.ttf"
    if not regular.exists():
        regular = font_dir / "NotoSansSC-VF.ttf"
    if not medium.exists():
        medium = regular
    if not bold.exists():
        bold = medium
    pdfmetrics.registerFont(TTFont("ShouyeRegular", str(regular)))
    pdfmetrics.registerFont(TTFont("ShouyeMedium", str(medium)))
    pdfmetrics.registerFont(TTFont("ShouyeBold", str(bold)))
    return "ShouyeRegular", "ShouyeMedium", "ShouyeBold"


FONT_REGULAR, FONT_MEDIUM, FONT_BOLD = register_fonts()


def style(
    name: str,
    size: float,
    leading: float,
    color=INK,
    font: str = FONT_REGULAR,
    align: int = TA_LEFT,
) -> ParagraphStyle:
    return ParagraphStyle(
        name,
        fontName=font,
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=align,
        wordWrap="CJK",
        spaceBefore=0,
        spaceAfter=0,
    )


def draw_para(c: canvas.Canvas, text: str, x: float, top: float, width: float, ps: ParagraphStyle) -> float:
    p = Paragraph(text, ps)
    _, h = p.wrap(width, 1000)
    p.drawOn(c, x, top - h)
    return top - h


def image_cover_cache(path: Path, box_w: float, box_h: float, tag: str, darken: float = 1) -> Path:
    target = TMP_DIR / f"{tag}.jpg"
    if target.exists():
        return target
    img = Image.open(path).convert("RGB")
    img = ImageOps.exif_transpose(img)
    src_w, src_h = img.size
    target_ratio = box_w / box_h
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        img = img.crop((0, top, src_w, top + new_h))
    img = ImageEnhance.Brightness(img).enhance(darken)
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img.thumbnail((int(box_w * 2.4), int(box_h * 2.4)), Image.Resampling.LANCZOS)
    img.save(target, "JPEG", quality=92)
    return target


def draw_image_cover(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, tag: str, darken: float = 1) -> None:
    if not path.exists():
        return
    cached = image_cover_cache(path, w, h, tag, darken)
    c.drawImage(ImageReader(str(cached)), x, y, w, h, preserveAspectRatio=False, mask="auto")


def transparent_png_cache(path: Path, tag: str) -> tuple[Path, int, int]:
    cached = TMP_DIR / f"{tag}.png"
    if cached.exists():
        with Image.open(cached) as img:
            return cached, img.width, img.height
    img = Image.open(path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.save(cached, "PNG")
    return cached, img.width, img.height


def draw_png(c: canvas.Canvas, path: Path, x: float, top: float, max_w: float, max_h: float, tag: str, align: str = "left") -> None:
    if not path.exists():
        return
    cached, iw, ih = transparent_png_cache(path, tag)
    scale = min(max_w / iw, max_h / ih)
    w, h = iw * scale, ih * scale
    dx = x
    if align == "center":
        dx = x + (max_w - w) / 2
    elif align == "right":
        dx = x + max_w - w
    c.drawImage(ImageReader(str(cached)), dx, top - h, w, h, mask="auto")


def fill_page(c: canvas.Canvas, bg=DEEP) -> None:
    c.setFillColor(bg)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def header(c: canvas.Canvas, no: str, title: str, dark: bool = False) -> None:
    color = GOLD_LIGHT
    c.setFillColor(color)
    c.setFont(FONT_BOLD, 10.5)
    c.drawString(44, PAGE_H - 48, f"{no}  {title}")
    c.setStrokeColor(color)
    c.setLineWidth(2)
    c.line(44, PAGE_H - 58, 90, PAGE_H - 58)


def footer(c: canvas.Canvas, page_no: int, title: str, dark: bool = False) -> None:
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.24))
    c.setLineWidth(0.8)
    c.line(44, 42, PAGE_W - 44, 42)
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.72))
    c.setFont(FONT_MEDIUM, 8)
    c.drawString(44, 25, f"售业 shouye.fun · {title}")
    c.drawRightString(PAGE_W - 44, 25, f"{page_no:02d} / 08")


def round_box(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill=PANEL, stroke=LINE, r: float = 18) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1)


def pill(c: canvas.Canvas, x: float, y: float, text: str, fill=FOREST, tc=colors.white) -> None:
    c.setFont(FONT_BOLD, 8.6)
    w = c.stringWidth(text, FONT_BOLD, 8.6) + 22
    c.setFillColor(fill)
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.35))
    c.roundRect(x, y, w, 21, 10.5, fill=1, stroke=1)
    c.setFillColor(tc)
    c.drawString(x + 11, y + 7, text)


def metric(c: canvas.Canvas, x: float, y: float, num: str, label: str, fill=PANEL) -> None:
    round_box(c, x, y, 150, 82, fill=fill, stroke=LINE, r=16)
    c.setFillColor(CORAL)
    c.setFont(FONT_BOLD, 22)
    c.drawString(x + 18, y + 45, num)
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 9.5)
    c.drawString(x + 18, y + 22, label)


def cover(c: canvas.Canvas) -> None:
    draw_image_cover(c, ASSETS["hero"], 0, 0, PAGE_W, PAGE_H, "portrait-cover-v4-full-dark", darken=0.32)
    draw_png(c, ASSETS["logo_light"], 56, PAGE_H - 58, 176, 86, "cover-logo")
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 10.5)
    c.drawRightString(PAGE_W - 56, PAGE_H - 86, "项目介绍 · 2026 试运营版")

    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 38)
    c.drawString(56, 482, "售业项目介绍")
    c.setFont(FONT_BOLD, 24)
    c.drawString(56, 438, "让你的经验和技能得到变现")
    draw_para(
        c,
        "售业服务的是很具体的留学问题：材料怎么补、课怎么选、房子怎么看、签证怎么办、找谁帮忙更靠谱。会的人可以把经验和技能发出来，有需要的人可以付费了解，也可以直接发布需求，快速匹配到合适的人或商家。",
        58,
        390,
        450,
        style("cover-body", 12.5, 20, colors.Color(1, 1, 1, alpha=0.86), FONT_MEDIUM),
    )
    x = 58
    for text in ["C2C 个人对个人", "快速匹配", "论坛沉淀", "商家服务", "三端入口"]:
        pill(c, x, 210, text, FOREST_2)
        x += c.stringWidth(text, FONT_BOLD, 8.6) + 34
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 10.5)
    c.drawString(58, 96, "shouye.fun")
    c.drawRightString(PAGE_W - 58, 96, "SELL WHAT YOU KNOW")
    c.showPage()


def page_what(c: canvas.Canvas) -> None:
    fill_page(c)
    header(c, "01", "售业是什么")
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 27)
    c.drawString(44, PAGE_H - 100, "它可以叫 C2C，但不只是发帖平台")
    draw_para(
        c,
        "更准确地说，售业是一个围绕留学生问题的“个人经验与技能服务撮合平台”。一个人会办某类材料、熟悉某个学校、懂某个流程，就可以把这件事挂出来；另一个人刚好需要，就能付费看、付费问，或者发需求等人接。",
        44,
        PAGE_H - 136,
        PAGE_W - 88,
        style("what-lead", 12, 18.5, MUTED, FONT_MEDIUM),
    )
    round_box(c, 44, 492, PAGE_W - 88, 160, fill=PANEL)
    flow = [
        ("我有问题", "发布需求"),
        ("平台分发", "匹配标签"),
        ("有人会做", "个人/商家接单"),
        ("解决问题", "评价沉淀"),
    ]
    for idx, (top, bottom) in enumerate(flow):
        x = 66 + idx * 122
        c.setFillColor(CORAL if idx == 0 else FOREST)
        c.circle(x + 28, 588, 28, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont(FONT_BOLD, 16)
        c.drawCentredString(x + 28, 583, str(idx + 1))
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 13)
        c.drawCentredString(x + 28, 545, top)
        c.setFillColor(MUTED)
        c.setFont(FONT_MEDIUM, 9.5)
        c.drawCentredString(x + 28, 526, bottom)
        if idx < len(flow) - 1:
            c.setStrokeColor(GOLD)
            c.setLineWidth(1.4)
            c.line(x + 62, 588, x + 112, 588)
            c.line(x + 106, 594, x + 112, 588)
            c.line(x + 106, 582, x + 112, 588)

    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 20)
    c.drawString(44, 438, "售业真正想做的，是把“懂的人”和“需要的人”接上")
    blocks = [
        ("个人对个人", "学生、学长学姐、已经办过的人，可以把自己的经验、流程和技能卖给后来的人。"),
        ("个人对商家", "当需求需要线下服务、专业服务或长期服务，平台把商家也接进同一套展示、评价和投诉规则里。"),
        ("快速解决问题", "像叫车一样，输入需求，系统把它送到合适的人面前；能接的人来帮你，而不是你到处翻帖子。"),
    ]
    for idx, (title, body) in enumerate(blocks):
        y = 292 - idx * 96
        fill = PANEL_2 if idx == 2 else PANEL
        stroke = GOLD if idx == 2 else LINE
        round_box(c, 44, y, PAGE_W - 88, 76, fill=fill, stroke=stroke, r=18)
        c.setFillColor(GOLD_LIGHT if idx in (1, 2) else CORAL)
        c.setFont(FONT_BOLD, 15)
        c.drawString(66, y + 45, title)
        draw_para(c, body, 170, y + 51, PAGE_W - 236, style(f"what-body-{idx}", 10.2, 15.2, colors.white if idx == 2 else MUTED, FONT_MEDIUM))
    footer(c, 2, "售业是什么")
    c.showPage()


def page_competition(c: canvas.Canvas) -> None:
    fill_page(c)
    header(c, "02", "为什么不是小红书")
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 26)
    c.drawString(44, PAGE_H - 100, "小红书适合看方向，售业负责把细问题解决掉")
    draw_para(
        c,
        "留学里的很多需求很小，但小到反而难找答案。比如某校某专业材料怎么补、某个证明去哪开、租房合同哪句有坑、作品集面试要不要带原件。这类问题不一定有流量，但会有人愿意为准确答案付费。",
        44,
        PAGE_H - 136,
        PAGE_W - 88,
        style("competition-lead", 12, 18.3, MUTED, FONT_MEDIUM),
    )
    rows = [
        ("小红书", "内容多、热度高，适合看生活方式和大方向。", "细需求容易被流量淹没，答案不一定有人持续维护。"),
        ("群聊 / 朋友圈", "问得快，熟人感强，当下有人接话。", "消息沉得快，同一个问题反复问，后面的人很难复用。"),
        ("普通商家广告", "能直接找人办事，服务落地。", "如果没有评价、范围和投诉记录，学生很难判断靠不靠谱。"),
        ("售业", "围绕留学痛点做提问、付费看帖、付费答疑、商家展示和评价。", "个人会什么就可以发什么，等真正需要的人付费了解；答案留下来，后来的人还能继续用。"),
    ]
    y = 560
    for idx, (name, value, gap) in enumerate(rows):
        is_us = name == "售业"
        round_box(c, 44, y, PAGE_W - 88, 82, fill=PANEL_2 if is_us else PANEL, stroke=GOLD if is_us else LINE, r=17)
        c.setFillColor(GOLD_LIGHT if is_us else CORAL if idx == 0 else FOREST)
        c.setFont(FONT_BOLD, 16)
        c.drawString(66, y + 50, name)
        draw_para(c, value, 160, y + 55, 165, style(f"comp-value-{idx}", 9.5, 13.5, INK, FONT_MEDIUM))
        draw_para(c, gap, 345, y + 55, 170, style(f"comp-gap-{idx}", 9.3, 13.2, MUTED, FONT_REGULAR))
        y -= 100

    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 17)
    c.drawString(44, 170, "售业更适合这些“很细，但真的有人需要”的问题")
    examples = ["D-2 / D-4 续签缺证明", "某校某专业申请材料", "租房合同避坑", "银行卡/手机卡/登陆证", "作品集和面试", "搬家清洁维修翻译"]
    for idx, ex in enumerate(examples):
        x = 44 + (idx % 2) * 254
        y = 126 - (idx // 2) * 34
        c.setFillColor(CORAL if idx < 2 else FOREST)
        c.circle(x + 5, y + 4, 3, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 9.5)
        c.drawString(x + 16, y, ex)
    footer(c, 3, "为什么不是小红书")
    c.showPage()


def page_modes(c: canvas.Canvas) -> None:
    fill_page(c, DEEP)
    header(c, "03", "两种对接方式", dark=True)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 28)
    c.drawString(44, PAGE_H - 102, "论坛式沉淀 + 快速匹配式对接")
    draw_para(
        c,
        "售业不是只让用户自己慢慢搜，也不是只靠客服人工派单。它同时保留论坛式内容沉淀和即时需求匹配：能沉淀的问题，留下来；需要马上解决的问题，推给合适的人。",
        44,
        PAGE_H - 140,
        PAGE_W - 88,
        style("modes-lead", 12, 18.5, colors.Color(1, 1, 1, alpha=0.82), FONT_MEDIUM),
    )
    mode_cards = [
        ("论坛式对接", "适合经验帖、攻略、学校专题和可复用问题。", ["付费看帖", "评论追问", "收藏复用", "评价沉淀"]),
        ("快速匹配式对接", "适合急需帮助、个案很细、需要人跟进的问题。", ["发布需求", "标签匹配", "达人/商家接单", "完成评价"]),
    ]
    for idx, (title, body, tags) in enumerate(mode_cards):
        y = 444 - idx * 196
        fill = PANEL if idx == 0 else colors.HexColor("#10231f")
        round_box(c, 44, y, PAGE_W - 88, 154, fill=fill, stroke=colors.Color(1, 1, 1, alpha=0.2), r=22)
        c.setFillColor(CORAL if idx == 0 else GOLD_LIGHT)
        c.setFont(FONT_BOLD, 21)
        c.drawString(70, y + 105, title)
        draw_para(c, body, 70, y + 78, PAGE_W - 140, style(f"mode-body-{idx}", 11, 16, MUTED, FONT_MEDIUM))
        tx = 70
        for tag in tags:
            pill(c, tx, y + 24, tag, FOREST if idx == 0 else CORAL)
            tx += c.stringWidth(tag, FONT_BOLD, 8.6) + 36

    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 16)
    c.drawString(54, 124, "一句话理解")
    draw_para(
        c,
        "用户不是去“大海捞针”找答案，而是把需求说清楚。平台把需求送到可能懂的人和合适的商家面前，让问题尽快被接住。",
        54,
        96,
        PAGE_W - 108,
        style("one-sentence", 12.5, 20, colors.white, FONT_MEDIUM),
    )
    footer(c, 4, "两种对接方式", dark=True)
    c.showPage()


def page_roles(c: canvas.Canvas) -> None:
    fill_page(c)
    header(c, "04", "三类角色")
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 25)
    c.drawString(44, PAGE_H - 100, "求助的人、会的人、能服务的商家")
    c.drawString(44, PAGE_H - 134, "都在同一个场里")
    roles = [
        ("求助者", "把问题说清楚", "发布求助、悬赏、退款申诉、材料问题；不再到处问人、翻聊天记录。"),
        ("助人者", "把经验变成收入", "会办流程、会写材料、懂学校、懂本地生活的人，可以卖经验、接咨询、做答疑。"),
        ("商家", "把服务边界讲明白", "搬家、清洁、维修、升学、作品集、通信等服务可以按类别展示，被评价、被投诉、被管理。"),
    ]
    y = 540
    for idx, (role, headline, body) in enumerate(roles):
        round_box(c, 44, y, PAGE_W - 88, 128, fill=PANEL, stroke=LINE, r=22)
        c.setFillColor(CORAL if idx == 0 else FOREST if idx == 1 else GOLD)
        c.setFont(FONT_BOLD, 17)
        c.drawString(70, y + 84, role)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 20)
        c.drawString(170, y + 84, headline)
        draw_para(c, body, 170, y + 53, 325, style(f"role-body-{idx}", 10.5, 15.8, MUTED, FONT_MEDIUM))
        y -= 158
    metric(c, 44, 76, "C2C", "个人经验 / 技能对接")
    metric(c, 222, 76, "B2C", "商家服务 / 类目展示")
    metric(c, 400, 76, "Match", "需求快速匹配")
    footer(c, 5, "三类角色")
    c.showPage()


def page_product(c: canvas.Canvas) -> None:
    fill_page(c, DEEP)
    header(c, "05", "产品结构", dark=True)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 28)
    c.drawString(44, PAGE_H - 102, "网站、小程序、APP 各做一件事")
    draw_para(
        c,
        "这三个入口不是重复做界面。网站负责长内容和展示，小程序负责轻量传播和快速打开，APP 负责账号、认证、积分和长期使用。",
        44,
        PAGE_H - 140,
        PAGE_W - 88,
        style("product-lead", 12, 18.5, colors.Color(1, 1, 1, alpha=0.82), FONT_MEDIUM),
    )
    products = [
        ("网站", "搜索、长文、学校专题、商家展示页、法律协议和后台管理。"),
        ("小程序", "提问、看帖、求助、分享入口，适合在微信里快速传播。"),
        ("APP", "正式账号体系、登录注册、实名认证、积分成长和长期运营。"),
    ]
    y = 505
    for idx, (title, body) in enumerate(products):
        round_box(c, 44, y, PAGE_W - 88, 110, fill=colors.HexColor("#10231f"), stroke=colors.Color(1, 1, 1, alpha=0.18), r=20)
        c.setFillColor(GOLD_LIGHT if idx == 0 else colors.white)
        c.setFont(FONT_BOLD, 22)
        c.drawString(70, y + 67, title)
        draw_para(c, body, 162, y + 70, 330, style(f"product-body-{idx}", 11, 16, colors.Color(1, 1, 1, alpha=0.82), FONT_MEDIUM))
        y -= 136
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 16)
    c.drawString(54, 142, "后台和规则系统")
    draw_para(
        c,
        "用户资料、商家管理、认证材料、投诉举报、积分提现、置顶展示都必须放在同一套后台里。售业不是只做漂亮页面，而是要把交易前后的信任关系管住。",
        54,
        112,
        PAGE_W - 108,
        style("backend-note", 11.5, 18, colors.white, FONT_MEDIUM),
    )
    footer(c, 6, "产品结构", dark=True)
    c.showPage()


def page_business(c: canvas.Canvas) -> None:
    fill_page(c)
    header(c, "06", "商家生态")
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 26)
    c.drawString(44, PAGE_H - 100, "商家合作要赚钱，但不能压过用户信任")
    draw_para(
        c,
        "商家是售业生态的一部分。平台可以给商家曝光、认证、置顶和活动资源，但前提是服务范围、收费、风险和售后边界写清楚。",
        44,
        PAGE_H - 136,
        PAGE_W - 88,
        style("business-lead", 12, 18, MUTED, FONT_MEDIUM),
    )
    data = [
        ["合作项", "标准价", "前期邀请优惠"],
        ["普通入驻", "199 元/月\n1,980 元/年", "首批 90 天免费\n年付 980 元"],
        ["认证商家", "399 元/月\n3,980 元/年", "首月免费\n试运营 199 元/月"],
        ["类目置顶", "699 元/月/类目", "首批 299 元/月/类目"],
        ["首页鱼缸置顶", "1,299 元/月", "首批 699 元/月\n限 10 个名额"],
        ["联合活动包", "999 元/次", "首批 399 元/次"],
    ]
    table_data = []
    for ridx, row in enumerate(data):
        table_data.append([
            Paragraph(cell.replace("\n", "<br/>"), style(f"biz-{ridx}-{cidx}", 10 if ridx else 10.5, 14, colors.white if ridx == 0 else INK, FONT_BOLD if ridx == 0 or cidx == 0 else FONT_MEDIUM, TA_CENTER if cidx else TA_LEFT))
            for cidx, cell in enumerate(row)
        ])
    t = Table(table_data, colWidths=[150, 150, 205], rowHeights=[34, 62, 62, 52, 62, 52])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), FOREST),
        ("BACKGROUND", (0, 1), (-1, -1), PANEL),
        ("BACKGROUND", (0, 2), (-1, 2), PANEL_2),
        ("BACKGROUND", (0, 4), (-1, 4), PANEL_2),
        ("GRID", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    t.wrapOn(c, PAGE_W - 88, 360)
    t.drawOn(c, 44, 300)
    round_box(c, 44, 128, PAGE_W - 88, 112, fill=PANEL, stroke=GOLD, r=18)
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 14)
    c.drawString(66, 203, "合作底线")
    draw_para(
        c,
        "拒绝虚假宣传、灰产服务、换钱换汇、论文代写等高风险业务。试运营价格仅作为邀请阶段方案，正式合作以协议和后台订单为准。",
        66,
        176,
        PAGE_W - 132,
        style("business-note", 10.5, 16, MUTED, FONT_MEDIUM),
    )
    footer(c, 7, "商家生态")
    c.showPage()


def page_close(c: canvas.Canvas) -> None:
    fill_page(c, DEEP)
    header(c, "07", "售业要做成什么样", dark=True)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 26)
    c.drawString(44, PAGE_H - 102, "不是信息差生意")
    c.drawString(44, PAGE_H - 138, "是留学生互助和服务的基础设施")
    draw_para(
        c,
        "售业希望让学生敢问、有人愿答、商家把话说清楚、平台把规则守住。一个问题解决完，不应该只剩下一次聊天记录；它应该变成后来的人能继续使用的经验。",
        44,
        PAGE_H - 178,
        PAGE_W - 88,
        style("close-lead", 12, 19, colors.Color(1, 1, 1, alpha=0.84), FONT_MEDIUM),
    )
    values = [
        ("真实", "讲清时间、学校、身份阶段和限制条件。"),
        ("互助", "让走过的人帮助后来的人，也获得合理回报。"),
        ("边界", "商家写清服务范围、价格、风险和售后。"),
        ("长期", "把内容、评价和规则沉淀成平台资产。"),
    ]
    y = 462
    for idx, (title, body) in enumerate(values):
        x = 44 + (idx % 2) * 258
        yy = y - (idx // 2) * 132
        round_box(c, x, yy, 226, 104, fill=colors.HexColor("#10231f"), stroke=colors.Color(1, 1, 1, alpha=0.18), r=18)
        c.setFillColor(GOLD_LIGHT)
        c.setFont(FONT_BOLD, 18)
        c.drawString(x + 22, yy + 66, title)
        draw_para(c, body, x + 22, yy + 42, 176, style(f"close-value-{idx}", 10.2, 15.2, colors.white, FONT_MEDIUM))
    round_box(c, 44, 122, PAGE_W - 88, 118, fill=PANEL, stroke=LINE, r=22)
    draw_png(c, ASSETS["logo_light"], 66, 213, 128, 58, "close-logo")
    draw_para(
        c,
        "<b>展示链接：</b>shouye.fun<br/><b>海外展示：</b>shouye-platform.l243736590.workers.dev<br/><b>资料版本：</b>2026 项目介绍竖版",
        220,
        204,
        290,
        style("contact", 10.5, 17, INK, FONT_MEDIUM),
    )
    footer(c, 8, "售业要做成什么样", dark=True)
    c.showPage()


def build_pdf() -> None:
    ensure_dirs()
    c = canvas.Canvas(str(PDF_PATH), pagesize=A4, pdfVersion=(1, 4))
    c.setTitle("售业项目介绍竖版")
    c.setAuthor("滨州售业网络科技有限公司")
    cover(c)
    page_what(c)
    page_competition(c)
    page_modes(c)
    page_roles(c)
    page_product(c)
    page_business(c)
    page_close(c)
    c.save()


def render_preview() -> None:
    doc = fitz.open(str(PDF_PATH))
    page_paths: list[Path] = []
    for idx, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.25, 1.25), alpha=False)
        out = PREVIEW_DIR / f"page-{idx + 1:02d}.png"
        pix.save(str(out))
        page_paths.append(out)
    thumbs: list[Image.Image] = []
    for path in page_paths:
        img = Image.open(path).convert("RGB")
        img.thumbnail((214, 303), Image.Resampling.LANCZOS)
        thumbs.append(img)
    cols = 4
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 234 + 22, rows * 324 + 24), "#f3f4ef")
    for idx, thumb in enumerate(thumbs):
        x = 20 + (idx % cols) * 234
        y = 18 + (idx // cols) * 324
        sheet.paste(thumb, (x, y))
    sheet.save(CONTACT_SHEET, "PNG")


if __name__ == "__main__":
    build_pdf()
    render_preview()
    print(PDF_PATH)
    print(CONTACT_SHEET)
