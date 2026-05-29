# -*- coding: utf-8 -*-
from __future__ import annotations

import shutil
from pathlib import Path

import fitz
from PIL import Image, ImageEnhance, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT_DIR = ROOT / "output" / "pdf"
TMP_DIR = ROOT / "tmp" / "pdfs" / "shouye-project-introduction-v5"
PREVIEW_DIR = OUT_DIR / "preview-shouye-project-introduction-v5-final"
PDF_PATH = OUT_DIR / "shouye-project-introduction-v5-final.pdf"
CONTACT_SHEET = OUT_DIR / "shouye-project-introduction-v5-final-preview.png"

PAGE_W, PAGE_H = 960, 540

DEEP = colors.HexColor("#061512")
DEEP_2 = colors.HexColor("#0b201c")
PANEL = colors.HexColor("#102a25")
PANEL_2 = colors.HexColor("#163b34")
RED = colors.HexColor("#ef3f34")
RED_DARK = colors.HexColor("#bf211d")
GOLD = colors.HexColor("#c39235")
GOLD_LIGHT = colors.HexColor("#f2d06b")
WHITE = colors.HexColor("#f7fbf8")
MUTED = colors.HexColor("#bfd0ca")
LINE = colors.HexColor("#31544b")

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


def ps(name: str, size: float, leading: float, color=WHITE, font=FONT_REGULAR, align=TA_LEFT) -> ParagraphStyle:
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


def para(c: canvas.Canvas, text: str, x: float, top: float, width: float, style: ParagraphStyle) -> float:
    p = Paragraph(text, style)
    _, h = p.wrap(width, 1000)
    p.drawOn(c, x, top - h)
    return top - h


def crop_cover(path: Path, box_w: float, box_h: float, tag: str, darken: float = 1, contrast: float = 1) -> Path:
    out = TMP_DIR / f"{tag}.jpg"
    if out.exists():
        return out
    img = Image.open(path).convert("RGB")
    img = ImageOps.exif_transpose(img)
    src_w, src_h = img.size
    dst_ratio = box_w / box_h
    src_ratio = src_w / src_h
    if src_ratio > dst_ratio:
        new_w = int(src_h * dst_ratio)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / dst_ratio)
        top = (src_h - new_h) // 2
        img = img.crop((0, top, src_w, top + new_h))
    img = ImageEnhance.Brightness(img).enhance(darken)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    img.thumbnail((int(box_w * 2), int(box_h * 2)), Image.Resampling.LANCZOS)
    img.save(out, "JPEG", quality=92)
    return out


def draw_cover_img(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, tag: str, darken: float = 1) -> None:
    if not path.exists():
        return
    cached = crop_cover(path, w, h, tag, darken=darken, contrast=1.04)
    c.drawImage(ImageReader(str(cached)), x, y, w, h, preserveAspectRatio=False, mask="auto")


def png_cache(path: Path, tag: str) -> tuple[Path, int, int]:
    out = TMP_DIR / f"{tag}.png"
    if out.exists():
        with Image.open(out) as img:
            return out, img.width, img.height
    img = Image.open(path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.save(out, "PNG")
    return out, img.width, img.height


def draw_png(c: canvas.Canvas, path: Path, x: float, top: float, max_w: float, max_h: float, tag: str) -> None:
    if not path.exists():
        return
    cached, iw, ih = png_cache(path, tag)
    scale = min(max_w / iw, max_h / ih)
    w, h = iw * scale, ih * scale
    c.drawImage(ImageReader(str(cached)), x, top - h, w, h, mask="auto")


def polygon(c: canvas.Canvas, pts: list[tuple[float, float]], fill, stroke=None) -> None:
    p = c.beginPath()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    p.close()
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.drawPath(p, fill=1, stroke=1)
    else:
        c.drawPath(p, fill=1, stroke=0)


def base(c: canvas.Canvas, section: str, page_no: int) -> None:
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    polygon(c, [(0, PAGE_H), (218, PAGE_H), (174, PAGE_H - 18), (0, PAGE_H - 18)], RED)
    polygon(c, [(PAGE_W, 0), (PAGE_W - 132, 0), (PAGE_W - 88, 26), (PAGE_W, 26)], RED_DARK)
    c.setStrokeColor(LINE)
    c.setLineWidth(1.1)
    c.line(42, PAGE_H - 62, PAGE_W - 42, PAGE_H - 62)
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 10)
    c.drawString(42, PAGE_H - 44, section)
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 8.5)
    c.drawRightString(PAGE_W - 42, 24, f"SHOUYE PROJECT INTRODUCTION  ·  {page_no:02d}")


def title(c: canvas.Canvas, text: str, y: float = 438, size: float = 32) -> None:
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, size)
    c.drawString(58, y, text)
    c.setFillColor(RED)
    c.rect(58, y - 18, 66, 5, fill=1, stroke=0)


def panel(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill=PANEL, stroke=LINE) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=1)


def tag(c: canvas.Canvas, x: float, y: float, text: str, fill=RED) -> float:
    c.setFont(FONT_BOLD, 8.5)
    w = c.stringWidth(text, FONT_BOLD, 8.5) + 24
    c.setFillColor(fill)
    c.roundRect(x, y, w, 20, 10, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.drawCentredString(x + w / 2, y + 6.5, text)
    return w


def cover(c: canvas.Canvas) -> None:
    draw_cover_img(c, ASSETS["hero"], 0, 0, PAGE_W, PAGE_H, "v5-cover-bg", darken=0.38)
    polygon(c, [(0, 0), (PAGE_W * 0.58, 0), (PAGE_W * 0.42, PAGE_H), (0, PAGE_H)], DEEP_2)
    polygon(c, [(0, PAGE_H), (290, PAGE_H), (250, PAGE_H - 26), (0, PAGE_H - 26)], RED)
    polygon(c, [(PAGE_W, 0), (PAGE_W - 270, 0), (PAGE_W - 214, 46), (PAGE_W, 46)], RED_DARK)
    draw_png(c, ASSETS["logo_light"], 58, PAGE_H - 56, 220, 90, "v5-cover-logo")
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 11)
    c.drawString(58, 348, "PROJECT INTRODUCTION · 2026 试运营版")
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 42)
    c.drawString(58, 288, "售业项目介绍")
    c.setFont(FONT_BOLD, 28)
    c.drawString(58, 238, "让你的经验和技能得到变现")
    para(
        c,
        "围绕留学生真实痛点，把个人经验、技能服务、商家服务和快速求助匹配放在同一个平台里。",
        60,
        195,
        430,
        ps("cover-copy", 13, 20, MUTED, FONT_MEDIUM),
    )
    x = 60
    for item in ["C2C 个人经验", "快速匹配", "论坛沉淀", "商家服务"]:
        x += tag(c, x, 104, item, RED if item == "C2C 个人经验" else PANEL_2) + 12
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 10.5)
    c.drawRightString(PAGE_W - 58, 74, "shouye.fun")
    c.showPage()


def toc(c: canvas.Canvas) -> None:
    base(c, "CONTENTS", 2)
    title(c, "目录", 430, 36)
    items = [
        ("01", "项目定位", "个人经验与技能服务撮合平台"),
        ("02", "为什么需要售业", "比普通内容平台更聚焦留学细问题"),
        ("03", "核心模式", "论坛式沉淀 + 快速匹配式对接"),
        ("04", "角色与流转", "求助者、助人者、商家和后台规则"),
        ("05", "商家生态", "入驻、认证、置顶和活动合作"),
        ("06", "长期文化", "真实、互助、边界、长期"),
    ]
    for idx, (num, head, body) in enumerate(items):
        x = 82 + (idx % 2) * 400
        y = 300 - (idx // 2) * 84
        c.setFillColor(RED if idx in (0, 2, 4) else GOLD)
        c.setFont(FONT_BOLD, 24)
        c.drawString(x, y + 28, num)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 15)
        c.drawString(x + 62, y + 34, head)
        c.setFillColor(MUTED)
        c.setFont(FONT_MEDIUM, 10)
        c.drawString(x + 62, y + 12, body)
        c.setStrokeColor(LINE)
        c.line(x + 62, y, x + 320, y)
    c.showPage()


def positioning(c: canvas.Canvas) -> None:
    base(c, "01  项目定位", 3)
    title(c, "售业不是普通论坛", 430, 32)
    para(
        c,
        "更准确地说，售业是一个围绕留学生问题的个人经验与技能服务撮合平台。会的人可以把经验和技能发出来；需要的人可以付费看、付费问，也可以直接发需求等待对接。",
        58,
        374,
        520,
        ps("position-lead", 12.5, 20, MUTED, FONT_MEDIUM),
    )
    c.setFillColor(PANEL_2)
    c.roundRect(612, 276, 246, 126, 8, fill=1, stroke=0)
    c.setFillColor(RED)
    c.setFont(FONT_BOLD, 42)
    c.drawString(640, 340, "C2C")
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 16)
    c.drawString(640, 312, "个人经验 / 技能对接")
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 10)
    c.drawString(640, 288, "不是二手交易，是把懂的人和需要的人接上。")
    cards = [
        ("个人对个人", "材料、选课、签证、作品集、租房避坑，知道的人可以收费答疑。"),
        ("个人对商家", "线下服务、长期服务、专业服务进入同一套展示和评价规则。"),
        ("快速匹配", "输入需求，平台把问题推给可能懂的人或商家，尽快接住。"),
    ]
    for idx, (head, body) in enumerate(cards):
        x = 58 + idx * 280
        panel(c, x, 112, 248, 118)
        c.setFillColor(GOLD_LIGHT if idx == 2 else RED if idx == 0 else WHITE)
        c.setFont(FONT_BOLD, 18)
        c.drawString(x + 22, 190, head)
        para(c, body, x + 22, 160, 198, ps(f"pos-card-{idx}", 10.2, 15.2, MUTED, FONT_MEDIUM))
    c.showPage()


def why(c: canvas.Canvas) -> None:
    base(c, "02  为什么需要售业", 4)
    title(c, "小红书适合看方向，售业负责解决细问题", 430, 28)
    para(
        c,
        "留学里的很多问题太细，不一定有流量，但会有人愿意为准确答案付费。售业把这些细需求从群聊、笔记和广告里拎出来，让它们变成可被搜索、可被付费、可被评价的服务。",
        58,
        374,
        720,
        ps("why-lead", 12, 18.5, MUTED, FONT_MEDIUM),
    )
    rows = [
        ("小红书", "内容多、热度高", "细需求容易被流量淹没"),
        ("群聊 / 朋友圈", "问得快、熟人感强", "消息沉得快，后面的人难复用"),
        ("普通商家广告", "服务能落地", "缺少评价、范围和投诉记录"),
        ("售业", "提问、付费看帖、付费答疑、商家服务在一起", "答案留下来，后来的人还能继续用"),
    ]
    y = 278
    for idx, row in enumerate(rows):
        fill = PANEL_2 if idx == 3 else PANEL
        panel(c, 76, y, 810, 54, fill=fill, stroke=GOLD if idx == 3 else LINE)
        c.setFillColor(RED if idx == 0 else GOLD_LIGHT if idx == 3 else WHITE)
        c.setFont(FONT_BOLD, 13.5)
        c.drawString(104, y + 20, row[0])
        c.setFillColor(WHITE)
        c.setFont(FONT_MEDIUM, 10.5)
        c.drawString(292, y + 21, row[1])
        c.setFillColor(MUTED)
        c.drawString(566, y + 21, row[2])
        y -= 70
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 15)
    c.drawString(76, 42, "例子：D-2 续签缺证明、某校专业材料、租房合同避坑、作品集面试、搬家清洁维修翻译")
    c.showPage()


def mode(c: canvas.Canvas) -> None:
    base(c, "03  核心模式", 5)
    title(c, "论坛式沉淀 + 快速匹配式对接", 430, 32)
    para(
        c,
        "能复用的问题，留下来；需要马上解决的问题，推给合适的人。售业不让用户在信息海里慢慢捞，而是让需求主动流向可能解决它的人。",
        58,
        374,
        690,
        ps("mode-lead", 12.5, 19, MUTED, FONT_MEDIUM),
    )
    panel(c, 58, 168, 380, 150, fill=PANEL)
    panel(c, 522, 168, 380, 150, fill=PANEL_2, stroke=GOLD)
    c.setFillColor(RED)
    c.setFont(FONT_BOLD, 24)
    c.drawString(88, 270, "论坛式沉淀")
    para(c, "适合经验帖、攻略、学校专题和可复用问题。内容可以被搜索、收藏、追问和评价。", 88, 235, 304, ps("forum", 11, 17, MUTED, FONT_MEDIUM))
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 24)
    c.drawString(552, 270, "快速匹配式对接")
    para(c, "适合急需帮助、个案很细、需要人跟进的问题。发布需求后，由达人或商家接单。", 552, 235, 304, ps("match", 11, 17, MUTED, FONT_MEDIUM))
    steps = ["发布需求", "标签匹配", "达人/商家接单", "完成评价"]
    x = 132
    for idx, step in enumerate(steps):
        c.setFillColor(RED if idx == 0 else FOREST if False else PANEL_2)
        c.circle(x, 92, 22, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 12)
        c.drawCentredString(x, 88, str(idx + 1))
        c.setFillColor(MUTED)
        c.setFont(FONT_MEDIUM, 9)
        c.drawCentredString(x, 52, step)
        if idx < len(steps) - 1:
            c.setStrokeColor(GOLD)
            c.setLineWidth(1.5)
            c.line(x + 28, 92, x + 146, 92)
            c.line(x + 140, 98, x + 146, 92)
            c.line(x + 140, 86, x + 146, 92)
        x += 174
    c.showPage()


def roles(c: canvas.Canvas) -> None:
    base(c, "04  角色与流转", 6)
    title(c, "三类角色，同一个交易和信任场", 430, 31)
    data = [
        ("求助者", "把问题说清楚", "发布求助、悬赏、退款申诉、材料问题；不再到处问人。"),
        ("助人者", "把经验变成收入", "懂学校、懂流程、懂材料、懂本地生活的人，可以卖经验、接咨询。"),
        ("商家", "把服务边界讲明白", "搬家、清洁、维修、升学、作品集、通信等服务按类别展示，被评价和管理。"),
    ]
    for idx, (role, head, body) in enumerate(data):
        x = 58 + idx * 292
        panel(c, x, 200, 248, 178, fill=PANEL)
        c.setFillColor(RED if idx == 0 else GOLD_LIGHT if idx == 2 else WHITE)
        c.setFont(FONT_BOLD, 20)
        c.drawString(x + 24, 326, role)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 17)
        c.drawString(x + 24, 288, head)
        para(c, body, x + 24, 252, 196, ps(f"role-{idx}", 10.2, 15.5, MUTED, FONT_MEDIUM))
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 18)
    c.drawString(58, 128, "平台做什么？")
    para(
        c,
        "把需求分发出去，把答案留下来，把商家的服务边界管住，把评价、投诉、认证和积分沉淀成信任系统。",
        58,
        96,
        760,
        ps("platform-do", 13, 20, WHITE, FONT_MEDIUM),
    )
    c.showPage()


def business(c: canvas.Canvas) -> None:
    base(c, "05  商家生态", 7)
    title(c, "商家合作要赚钱，但不能压过用户信任", 430, 28)
    para(c, "商家是售业生态的一部分。平台可以给商家曝光、认证、置顶和活动资源，但服务范围、收费、风险和售后边界必须清楚。", 58, 376, 740, ps("business-lead", 12, 18.5, MUTED, FONT_MEDIUM))
    rows = [
        ["合作项", "标准价", "前期邀请优惠"],
        ["普通入驻", "199 元/月\n1,980 元/年", "首批 90 天免费\n年付 980 元"],
        ["认证商家", "399 元/月\n3,980 元/年", "首月免费\n试运营 199 元/月"],
        ["类目置顶", "699 元/月/类目", "首批 299 元/月/类目"],
        ["首页鱼缸置顶", "1,299 元/月", "首批 699 元/月\n限 10 个名额"],
        ["联合活动包", "999 元/次", "首批 399 元/次"],
    ]
    table_data = []
    for ridx, row in enumerate(rows):
        table_data.append([
            Paragraph(cell.replace("\n", "<br/>"), ps(f"biz-{ridx}-{cidx}", 10.5, 14.2, WHITE if ridx == 0 else MUTED, FONT_BOLD if ridx == 0 or cidx == 0 else FONT_MEDIUM, TA_CENTER if cidx else TA_LEFT))
            for cidx, cell in enumerate(row)
        ])
    t = Table(table_data, colWidths=[210, 210, 280], rowHeights=[34, 45, 45, 45, 45, 45])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PANEL_2),
        ("BACKGROUND", (0, 1), (-1, -1), PANEL),
        ("BACKGROUND", (0, 2), (-1, 2), DEEP_2),
        ("BACKGROUND", (0, 4), (-1, 4), DEEP_2),
        ("GRID", (0, 0), (-1, -1), 0.7, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    t.wrapOn(c, 700, 270)
    t.drawOn(c, 58, 94)
    panel(c, 786, 94, 116, 259, fill=PANEL_2, stroke=GOLD)
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 15)
    c.drawString(808, 306, "合作底线")
    para(c, "拒绝虚假宣传、灰产服务、换钱换汇、论文代写等高风险业务。试运营价以正式协议和后台订单为准。", 808, 270, 72, ps("biz-note", 9.5, 14, MUTED, FONT_MEDIUM))
    c.showPage()


def culture(c: canvas.Canvas) -> None:
    base(c, "06  长期文化", 8)
    title(c, "不是信息差生意，是留学生互助和服务的基础设施", 430, 27)
    para(c, "售业希望让学生敢问、有人愿答、商家把话说清楚、平台把规则守住。一个问题解决完，不应该只剩下一次聊天记录；它应该变成后来的人能继续使用的经验。", 58, 372, 760, ps("culture-lead", 12, 19, MUTED, FONT_MEDIUM))
    values = [
        ("真实", "讲清时间、学校、身份阶段和限制条件。"),
        ("互助", "让走过的人帮助后来的人，也获得合理回报。"),
        ("边界", "商家写清服务范围、价格、风险和售后。"),
        ("长期", "把内容、评价和规则沉淀成平台资产。"),
    ]
    for idx, (head, body) in enumerate(values):
        x = 72 + idx * 210
        panel(c, x, 176, 172, 112, fill=PANEL)
        c.setFillColor(GOLD_LIGHT)
        c.setFont(FONT_BOLD, 21)
        c.drawString(x + 22, 246, head)
        para(c, body, x + 22, 214, 126, ps(f"val-{idx}", 10, 15, MUTED, FONT_MEDIUM))
    draw_png(c, ASSETS["logo_light"], 72, 118, 144, 50, "v5-close-logo-light")
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 10.5)
    c.drawString(250, 96, "官网：shouye.fun")
    c.setFillColor(MUTED)
    c.setFont(FONT_MEDIUM, 9.5)
    c.drawString(250, 74, "邮箱：l243736590@gmail.com")
    c.showPage()


def build_pdf() -> None:
    ensure_dirs()
    c = canvas.Canvas(str(PDF_PATH), pagesize=(PAGE_W, PAGE_H), pdfVersion=(1, 4))
    c.setTitle("售业项目介绍 V5")
    c.setAuthor("滨州售业网络科技有限公司")
    cover(c)
    toc(c)
    positioning(c)
    why(c)
    mode(c)
    roles(c)
    business(c)
    culture(c)
    c.save()


def render_preview() -> None:
    doc = fitz.open(str(PDF_PATH))
    page_paths: list[Path] = []
    for idx, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
        out = PREVIEW_DIR / f"page-{idx + 1:02d}.png"
        pix.save(str(out))
        page_paths.append(out)
    thumbs: list[Image.Image] = []
    for path in page_paths:
        img = Image.open(path).convert("RGB")
        img.thumbnail((320, 180), Image.Resampling.LANCZOS)
        thumbs.append(img)
    cols = 4
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 340 + 18, rows * 202 + 20), "#f1f3ed")
    for idx, thumb in enumerate(thumbs):
        x = 16 + (idx % cols) * 340
        y = 14 + (idx // cols) * 202
        sheet.paste(thumb, (x, y))
    sheet.save(CONTACT_SHEET, "PNG")


if __name__ == "__main__":
    build_pdf()
    render_preview()
    print(PDF_PATH)
    print(CONTACT_SHEET)
