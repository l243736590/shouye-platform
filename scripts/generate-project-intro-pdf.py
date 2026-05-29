# -*- coding: utf-8 -*-
from __future__ import annotations

import shutil
from pathlib import Path

import fitz
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT_DIR = ROOT / "output" / "pdf"
TMP_DIR = ROOT / "tmp" / "pdfs" / "shouye-project-introduction"
PREVIEW_DIR = OUT_DIR / "preview-shouye-project-introduction-v2"
PDF_PATH = OUT_DIR / "shouye-project-introduction-v2.pdf"
CONTACT_SHEET = OUT_DIR / "shouye-project-introduction-v2-preview.png"

PAGE_W, PAGE_H = landscape(A4)

INK = colors.HexColor("#172229")
DEEP = colors.HexColor("#061512")
FOREST = colors.HexColor("#062b1f")
FOREST_2 = colors.HexColor("#103b31")
MIST = colors.HexColor("#eef5f0")
CREAM = colors.HexColor("#faf7ef")
GOLD = colors.HexColor("#c39235")
GOLD_LIGHT = colors.HexColor("#f4d57a")
CORAL = colors.HexColor("#ef5742")
BLUE = colors.HexColor("#0e365f")
MUTED = colors.HexColor("#5d686d")
LINE = colors.HexColor("#d9e1d8")

ASSETS = {
    "logo_light": PUBLIC / "brand" / "shouye-logo-new-light.png",
    "logo_dark": PUBLIC / "brand" / "shouye-logo-new-dark.png",
    "hero_1": PUBLIC / "home-hero" / "1.png",
    "hero_2": PUBLIC / "home-hero" / "2.jpg",
    "hero_3": PUBLIC / "home-hero" / "3.jpg",
    "konkuk": PUBLIC / "schools" / "konkuk" / "1.jpg",
    "cau": PUBLIC / "schools" / "cau" / "1.jpg",
    "korea": PUBLIC / "schools" / "korea" / "1.jpg",
    "yonsei": PUBLIC / "schools" / "yonsei" / "1.jpg",
    "native": PUBLIC / "merchant-logos" / "native-education.png",
    "wala": PUBLIC / "merchant-logos" / "wala-study.png",
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
        medium = bold
    if not bold.exists():
        bold = medium
    pdfmetrics.registerFont(TTFont("ShouyeRegular", str(regular)))
    pdfmetrics.registerFont(TTFont("ShouyeMedium", str(medium)))
    pdfmetrics.registerFont(TTFont("ShouyeBold", str(bold)))
    return "ShouyeRegular", "ShouyeMedium", "ShouyeBold"


FONT_REGULAR, FONT_MEDIUM, FONT_BOLD = register_fonts()


def ps(
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


def draw_para(c: canvas.Canvas, text: str, x: float, top: float, width: float, style: ParagraphStyle) -> float:
    para = Paragraph(text, style)
    _, h = para.wrap(width, 1000)
    para.drawOn(c, x, top - h)
    return top - h


def alpha_rect(c: canvas.Canvas, x: float, y: float, w: float, h: float, color, alpha: float) -> None:
    c.saveState()
    c.setFillAlpha(alpha)
    c.setFillColor(color)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.restoreState()


def alpha_round_rect(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    radius: float,
    color,
    alpha: float,
    stroke=None,
    stroke_alpha: float = 1,
) -> None:
    c.saveState()
    c.setFillAlpha(alpha)
    c.setFillColor(color)
    if stroke:
        c.setStrokeAlpha(stroke_alpha)
        c.setStrokeColor(stroke)
    else:
        c.setStrokeAlpha(0)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1 if stroke else 0)
    c.restoreState()


def image_cover_cache(path: Path, box_w: float, box_h: float, tag: str, darken: float = 1, blur: float = 0) -> Path:
    target = TMP_DIR / f"{tag}.jpg"
    if target.exists():
        return target
    img = Image.open(path).convert("RGB")
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
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    if darken != 1:
        img = ImageEnhance.Brightness(img).enhance(darken)
    img = ImageOps.exif_transpose(img)
    img.thumbnail((int(box_w * 2.2), int(box_h * 2.2)), Image.Resampling.LANCZOS)
    img.save(target, "JPEG", quality=90)
    return target


def draw_image_cover(
    c: canvas.Canvas,
    path: Path,
    x: float,
    y: float,
    w: float,
    h: float,
    tag: str,
    darken: float = 1,
    blur: float = 0,
) -> None:
    if not path.exists():
        return
    cached = image_cover_cache(path, w, h, tag, darken, blur)
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


def draw_png_contain(
    c: canvas.Canvas,
    path: Path,
    x: float,
    top: float,
    max_w: float,
    max_h: float,
    tag: str,
    align: str = "left",
) -> tuple[float, float]:
    if not path.exists():
        return 0, 0
    cached, iw, ih = transparent_png_cache(path, tag)
    scale = min(max_w / iw, max_h / ih)
    w, h = iw * scale, ih * scale
    draw_x = x
    if align == "center":
        draw_x = x + (max_w - w) / 2
    elif align == "right":
        draw_x = x + max_w - w
    c.drawImage(ImageReader(str(cached)), draw_x, top - h, w, h, mask="auto")
    return w, h


def pill(c: canvas.Canvas, x: float, y: float, text: str, fill=FOREST_2, text_color=colors.white) -> None:
    c.setFont(FONT_BOLD, 9)
    width = c.stringWidth(text, FONT_BOLD, 9) + 22
    alpha_round_rect(c, x, y, width, 22, 11, fill, 0.92, colors.Color(1, 1, 1), 0.12)
    c.setFillColor(text_color)
    c.drawString(x + 11, y + 7, text)


def section_label(c: canvas.Canvas, text: str, x: float, y: float, color=CORAL) -> None:
    c.setFillColor(color)
    c.setFont(FONT_BOLD, 10.5)
    c.drawString(x, y, text)
    c.setStrokeColor(color)
    c.setLineWidth(2.2)
    c.line(x, y - 9, x + 52, y - 9)


def page_footer(c: canvas.Canvas, page_no: int, title: str, dark: bool = False) -> None:
    line = colors.Color(1, 1, 1, alpha=0.22) if dark else LINE
    txt = colors.Color(1, 1, 1, alpha=0.68) if dark else MUTED
    c.setStrokeColor(line)
    c.setLineWidth(0.9)
    c.line(42, 38, PAGE_W - 42, 38)
    c.setFont(FONT_MEDIUM, 8.5)
    c.setFillColor(txt)
    c.drawString(42, 22, f"售业 shouye.fun · {title}")
    c.drawRightString(PAGE_W - 42, 22, f"{page_no:02d} / 06")


def cover(c: canvas.Canvas) -> None:
    draw_image_cover(c, ASSETS["hero_1"], 0, 0, PAGE_W, PAGE_H, "cover-homepage-visible", darken=0.46)
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.18))
    c.setLineWidth(1)
    c.rect(28, 28, PAGE_W - 56, PAGE_H - 56, fill=0, stroke=1)
    draw_png_contain(c, ASSETS["logo_light"], 54, PAGE_H - 48, 190, 92, "cover-logo")

    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 12)
    c.drawRightString(PAGE_W - 54, PAGE_H - 82, "项目介绍 · 文化与生态说明")
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 43)
    c.drawString(58, 342, "售业项目介绍")
    c.setFont(FONT_BOLD, 30)
    c.drawString(58, 294, "让你的经验和技能得到变现")
    draw_para(
        c,
        "很多留学生真正需要的，不是一句泛泛的建议，而是有人把自己走过的流程、踩过的坑、会做的事讲清楚。售业想做的，就是让这些经验被找到、被付费、被长期留下来。",
        60,
        248,
        610,
        ps("cover-body", 13.3, 21, colors.Color(1, 1, 1, alpha=0.82), FONT_MEDIUM),
    )
    tags = ["提问求助", "经验分享", "学校专题", "商家服务", "积分成长", "APP / 小程序 / 网站"]
    x = 60
    for tag in tags:
        pill(c, x, 134, tag, FOREST_2, colors.white)
        x += c.stringWidth(tag, FONT_BOLD, 9) + 34
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 12)
    c.drawString(60, 82, "2026 试运营版")
    c.drawRightString(PAGE_W - 60, 82, "shouye.fun")
    c.showPage()


def origin(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "01 为什么做售业", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 28)
    c.drawString(42, PAGE_H - 104, "小红书能种草，但很多留学细问题没人专门接")
    draw_para(
        c,
        "小红书、群聊和朋友圈都有价值，但它们更适合看经验、看热闹、找方向。真正到了办材料、选课、租房、续签、找兼职、找人帮忙的时候，很多问题太细了，搜索不到，等不到回复，也很难判断谁真的懂。",
        44,
        PAGE_H - 132,
        720,
        ps("origin-lead", 12.2, 18.5, MUTED, FONT_MEDIUM),
    )
    compare = [
        ("小红书", "内容多、流量大，适合看大方向和生活分享。", "但很细的需求会被淹没，比如某个学校某个专业材料怎么补、某类签证证明去哪开。"),
        ("群聊 / 朋友圈", "问得快，熟人感强，当下能有人接话。", "消息很快沉下去，同一个问题反复问，答案也很难留给后来的人。"),
        ("普通商家广告", "服务能落地，适合直接找人办事。", "如果只有广告，没有评价、边界和投诉记录，学生很难知道该不该信。"),
        ("售业", "专门围绕留学痛点，把提问、付费看帖、付费答疑、商家展示和评价放在一起。", "个人会什么就可以发什么，等真正需要的人来付费了解；答案留下来，后面的人还能继续用。"),
    ]
    widths = [172, 172, 172, 224]
    xs = [44, 234, 424, 614]
    for idx, (name, good, gap) in enumerate(compare):
        x = xs[idx]
        w = widths[idx]
        fill = DEEP if name == "售业" else colors.white
        stroke = GOLD if name == "售业" else LINE
        alpha_round_rect(c, x, 220, w, 190, 18, fill, 1, stroke, 1)
        c.setFillColor(GOLD_LIGHT if name == "售业" else CORAL if idx == 0 else FOREST)
        c.setFont(FONT_BOLD, 18)
        c.drawString(x + 18, 374, name)
        text_color = colors.white if name == "售业" else INK
        muted_color = colors.Color(1, 1, 1, alpha=0.76) if name == "售业" else MUTED
        draw_para(c, good, x + 18, 340, w - 36, ps(f"origin-good-{idx}", 9.8, 14.5, text_color, FONT_MEDIUM))
        c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.24) if name == "售业" else LINE)
        c.setLineWidth(0.8)
        c.line(x + 18, 294, x + w - 18, 294)
        draw_para(c, gap, x + 18, 274, w - 36, ps(f"origin-gap-{idx}", 9.3, 13.8, muted_color, FONT_REGULAR))

    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 19)
    c.drawString(44, 178, "售业更适合处理这些“太细但真的有人需要”的事")
    examples = [
        "某校某专业申请材料怎么写",
        "D-2 / D-4 续签缺了某项证明怎么办",
        "韩国租房合同哪里容易踩坑",
        "银行卡、手机卡、登陆证办理细节",
        "作品集、面试、选课、毕业材料",
        "搬家、清洁、维修、翻译等本地服务",
    ]
    for idx, text in enumerate(examples):
        col = idx % 3
        row = idx // 3
        x = 44 + col * 258
        y = 124 - row * 48
        alpha_round_rect(c, x, y, 224, 34, 17, colors.white, 1, LINE, 1)
        c.setFillColor(CORAL if idx in (0, 1) else FOREST)
        c.circle(x + 18, y + 17, 3.2, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont(FONT_MEDIUM, 10.2)
        c.drawString(x + 30, y + 12, text)
    page_footer(c, 2, "为什么做售业")
    c.showPage()


def product_system(c: canvas.Canvas) -> None:
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_image_cover(c, ASSETS["korea"], 0, 0, PAGE_W, PAGE_H, "system-bg", darken=0.34, blur=1.2)
    alpha_rect(c, 0, 0, PAGE_W, PAGE_H, DEEP, 0.78)
    section_label(c, "02 产品结构", 42, PAGE_H - 58, GOLD_LIGHT)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 31)
    c.drawString(42, PAGE_H - 104, "把提问、经验、服务和成长放进同一个闭环")
    draw_para(
        c,
        "售业不是单独的问答站、攻略站或广告位，而是一套围绕留学生问题流转的产品结构。用户可以问问题，创作者可以沉淀经验，商家可以清楚展示服务范围，平台用积分、审核和投诉规则维护秩序。",
        44,
        PAGE_H - 134,
        710,
        ps("system-lead", 12, 18.5, colors.Color(1, 1, 1, alpha=0.82), FONT_MEDIUM),
    )
    modules = [
        ("提问 / 求助", "发布具体问题、悬赏、退款申诉、材料求助，让需求先被看见。"),
        ("经验 / 精华帖", "把签证、租房、入学、打工、材料准备等经验沉淀成可复用内容。"),
        ("学校专题", "按学校整理申请、宿舍、学科、周边生活和常见坑点。"),
        ("商家服务", "按类别展示服务商，写清范围、认证状态、置顶和投诉边界。"),
        ("成长体系", "用积分、等级、称号、好评和优惠券鼓励真实分享与认真回答。"),
    ]
    for idx, (title, body) in enumerate(modules):
        x = 44 + idx * 153
        alpha_round_rect(c, x, 276, 132, 132, 16, colors.HexColor("#10231f"), 1, colors.white, 0.18)
        c.setFillColor(GOLD_LIGHT if idx in (0, 1) else colors.white)
        c.setFont(FONT_BOLD, 15)
        c.drawString(x + 15, 370, title)
        draw_para(c, body, x + 15, 338, 102, ps(f"module-{idx}", 9.2, 13.2, colors.white, FONT_REGULAR))

    panels = [
        ("网站", ASSETS["konkuk"], "适合搜索、长文、学校专题、合规协议和商家展示页。"),
        ("小程序", ASSETS["cau"], "适合快速浏览、提问、看帖、求助和轻量传播。"),
        ("APP", ASSETS["hero_3"], "适合正式账号体系、登录注册、内容沉淀和长期运营。"),
    ]
    for idx, (title, img, body) in enumerate(panels):
        x = 42 + idx * 265
        alpha_round_rect(c, x, 74, 242, 168, 16, colors.white, 0.94, colors.white, 0)
        draw_image_cover(c, img, x + 12, 147, 218, 76, f"system-panel-{idx}", darken=0.9)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 16)
        c.drawString(x + 16, 124, title)
        draw_para(c, body, x + 16, 102, 208, ps(f"panel-body-{idx}", 9.5, 13.5, MUTED, FONT_MEDIUM))
    page_footer(c, 3, "产品结构", dark=True)
    c.showPage()


def culture(c: canvas.Canvas) -> None:
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_image_cover(c, ASSETS["hero_3"], 0, 0, PAGE_W, PAGE_H, "culture-bg", darken=0.45, blur=0.8)
    alpha_rect(c, 0, 0, PAGE_W, PAGE_H, DEEP, 0.74)
    section_label(c, "03 企业文化", 42, PAGE_H - 58, GOLD_LIGHT)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 31)
    c.drawString(42, PAGE_H - 104, "不靠信息差吓唬学生，而靠真实经验建立信任")
    draw_para(
        c,
        "售业的长期价值来自信任。平台允许商业服务存在，但不允许服务边界模糊、虚假承诺、灰产借壳和把用户焦虑当作生意。我们希望把社区、内容和商业服务放在同一套清晰规则里。",
        44,
        PAGE_H - 134,
        710,
        ps("culture-lead", 12.1, 18.5, colors.Color(1, 1, 1, alpha=0.82), FONT_MEDIUM),
    )
    values = [
        ("真实", "经验尽量说明时间、学校、身份阶段、限制条件和可验证信息。"),
        ("互助", "让走过的人帮助后来的人，也让认真回答的人获得回报。"),
        ("边界", "商家必须说清收费、范围、风险和不可承诺事项。"),
        ("长期", "不追求一次性流量收割，而是积累可复用内容、口碑和规则。"),
    ]
    for idx, (title, body) in enumerate(values):
        x = 52 + idx * 192
        alpha_round_rect(c, x, 278, 170, 132, 15, colors.HexColor("#10231f"), 1, colors.white, 0.18)
        c.setFillColor(GOLD_LIGHT)
        c.setFont(FONT_BOLD, 21)
        c.drawString(x + 18, 368, title)
        draw_para(c, body, x + 18, 334, 132, ps(f"culture-value-{idx}", 10, 14.5, colors.white, FONT_MEDIUM))

    alpha_round_rect(c, 52, 98, 350, 138, 16, colors.white, 0.94, None)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 18)
    c.drawString(76, 198, "平台不做什么")
    draw_para(
        c,
        "不做换钱换汇撮合，不做虚假保证，不默认商家永远正确，不把用户隐私和认证材料当营销资产。",
        76,
        172,
        292,
        ps("dont", 11.5, 17, INK, FONT_MEDIUM),
    )
    alpha_round_rect(c, 430, 98, 360, 138, 16, FOREST_2, 1, colors.white, 0.16)
    draw_para(
        c,
        "<b>售业希望形成的关系：</b><br/>用户敢问，回答者愿意分享，商家清楚表达服务边界，平台负责把规则、投诉、评价和展示秩序维护住。",
        456,
        198,
        300,
        ps("relation", 12, 19, colors.white, FONT_REGULAR),
    )
    page_footer(c, 4, "企业文化", dark=True)
    c.showPage()


def ecosystem(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "04 生态合作", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 29)
    c.drawString(42, PAGE_H - 104, "商家合作是服务生态的一部分，不是项目的全部")
    draw_para(
        c,
        "售业会为真实、清晰、有边界的服务商开放展示和广告合作。合作费用按入驻、认证、类目置顶、首页鱼缸置顶和联合活动分层，试运营期保留首批邀请优惠。",
        44,
        PAGE_H - 132,
        725,
        ps("eco-lead", 11.8, 17.5, MUTED, FONT_MEDIUM),
    )

    headers = ["合作项", "适合对象", "核心权益", "标准价", "前期邀请优惠"]
    rows = [
        ["普通入驻", "刚开始测试平台获客的商家", "分类展示、商家资料页、基础标签、用户咨询入口", "199 元/月\n1,980 元/年", "首批邀请 90 天免费\n年付 980 元"],
        ["认证商家", "需要建立信任背书的服务商", "认证标识、材料审核、优先收录、服务范围管理", "399 元/月\n3,980 元/年", "首月免费\n试运营 199 元/月"],
        ["类目置顶", "想在某一业务类别抢占曝光", "类目靠前、鱼缸高亮气泡、展示层级提升", "699 元/月/类目", "首批 299 元/月/类目\n3 个月起"],
        ["首页鱼缸置顶", "重点品牌或短期促销", "首页更大气泡、慢速移动、长期上层展示", "1,299 元/月", "首批 699 元/月\n限 10 个名额"],
        ["联合活动包", "愿意给留学生优惠的商家", "优惠券、活动页、内容推荐、社群转发素材", "999 元/次", "首批 399 元/次\n可与置顶打包"],
    ]
    table_data = [[Paragraph(f"<b>{cell}</b>", ps(f"eco-head-{i}", 9.5, 12, colors.white, FONT_BOLD, TA_CENTER)) for i, cell in enumerate(headers)]]
    for ridx, row in enumerate(rows):
        table_data.append([
            Paragraph(row[0], ps(f"eco-name-{ridx}", 10.2, 13, INK, FONT_BOLD)),
            Paragraph(row[1], ps(f"eco-obj-{ridx}", 8.6, 11.4, INK)),
            Paragraph(row[2], ps(f"eco-right-{ridx}", 8.6, 11.4, INK)),
            Paragraph(row[3].replace("\n", "<br/>"), ps(f"eco-price-{ridx}", 9.2, 12, BLUE, FONT_BOLD, TA_CENTER)),
            Paragraph(row[4].replace("\n", "<br/>"), ps(f"eco-offer-{ridx}", 9.2, 12, CORAL, FONT_BOLD, TA_CENTER)),
        ])
    table = Table(table_data, colWidths=[88, 148, 250, 116, 146], rowHeights=[30, 54, 54, 54, 54, 54])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), FOREST),
        ("GRID", (0, 0), (-1, -1), 0.55, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#f4f8f3")),
        ("BACKGROUND", (0, 4), (-1, 4), colors.HexColor("#f4f8f3")),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    table.wrapOn(c, PAGE_W - 84, 330)
    table.drawOn(c, 46, 148)

    c.setFillColor(colors.HexColor("#fff4df"))
    c.setStrokeColor(colors.HexColor("#efd19a"))
    c.roundRect(42, 76, PAGE_W - 84, 58, 14, fill=1, stroke=1)
    draw_para(
        c,
        "<b>说明：</b>以上为 2026 试运营建议价，正式合作以协议和后台订单为准。平台可拒绝虚假宣传、灰产服务、换钱换汇、论文代写等高风险业务。",
        62,
        116,
        PAGE_W - 124,
        ps("eco-note", 10.2, 15, colors.HexColor("#654b18"), FONT_MEDIUM),
    )
    page_footer(c, 5, "生态合作")
    c.showPage()


def roadmap(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "05 试运营阶段", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 29)
    c.drawString(42, PAGE_H - 104, "先把样板做扎实，再扩大城市、学校和服务类目")
    draw_para(
        c,
        "当前阶段重点是验证内容供给、问答闭环、商家展示和用户信任机制。平台会优先邀请一批愿意公开服务边界、接受评价和投诉规则的商家一起试运营。",
        44,
        PAGE_H - 132,
        700,
        ps("roadmap-lead", 12, 18, MUTED, FONT_MEDIUM),
    )
    steps = [
        ("01", "内容样板", "完善高频问题、精华经验帖、学校专题和合规说明。"),
        ("02", "账号体系", "打通网站、小程序、APP 的登录、积分、认证和资料管理。"),
        ("03", "商家样板", "选择典型服务类目，做好分类、置顶、展示页和投诉边界。"),
        ("04", "社群分发", "围绕学校、签证、租房、升学等场景做可转发内容。"),
        ("05", "城市扩展", "从韩国留学生核心场景出发，逐步扩展更多学校和城市。"),
    ]
    for idx, (num, title, body) in enumerate(steps):
        x = 44 + idx * 153
        alpha_round_rect(c, x, 290, 136, 128, 15, colors.white, 1, LINE, 1)
        c.setFillColor(CORAL if idx in (0, 2) else FOREST)
        c.setFont(FONT_BOLD, 22)
        c.drawString(x + 16, 386, num)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 14)
        c.drawString(x + 16, 360, title)
        draw_para(c, body, x + 16, 338, 104, ps(f"roadmap-step-{idx}", 8.7, 12.5, MUTED, FONT_MEDIUM))
        if idx < len(steps) - 1:
            c.setStrokeColor(GOLD)
            c.setLineWidth(1.4)
            c.line(x + 136, 357, x + 153, 357)
            c.line(x + 148, 362, x + 153, 357)
            c.line(x + 148, 352, x + 153, 357)

    alpha_round_rect(c, 42, 80, 510, 176, 18, DEEP, 0.98, None)
    draw_png_contain(c, ASSETS["logo_light"], 62, 226, 136, 70, "roadmap-logo")
    draw_para(
        c,
        "<b>一句话介绍售业</b><br/>售业不是单纯的信息站，也不是单纯广告平台。它希望成为留学生遇到具体问题时，可以提问、查经验、找服务、积累信用和获得回报的基础设施。",
        212,
        220,
        306,
        ps("roadmap-summary", 11.7, 18.5, colors.white, FONT_REGULAR),
    )
    alpha_round_rect(c, 576, 80, 222, 176, 18, colors.white, 1, LINE, 1)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 17)
    c.drawString(600, 216, "展示与联系")
    items = [
        "官网：shouye.fun",
        "海外展示：shouye-platform.l243736590.workers.dev",
        "首批邀请：认证、置顶、联合活动均有试运营优惠",
        "资料版本：2026 项目介绍版",
    ]
    y = 187
    for idx, item in enumerate(items):
        c.setFillColor(CORAL)
        c.circle(604, y + 4, 3, fill=1, stroke=0)
        draw_para(c, item, 616, y + 13, 158, ps(f"roadmap-item-{idx}", 8.8, 12.5, MUTED, FONT_MEDIUM))
        y -= 30
    page_footer(c, 6, "试运营阶段")
    c.showPage()


def build_pdf() -> None:
    ensure_dirs()
    c = canvas.Canvas(str(PDF_PATH), pagesize=landscape(A4), pdfVersion=(1, 4))
    c.setTitle("售业项目介绍")
    c.setAuthor("滨州售业网络科技有限公司")
    cover(c)
    origin(c)
    product_system(c)
    culture(c)
    ecosystem(c)
    roadmap(c)
    c.save()


def render_preview() -> None:
    doc = fitz.open(str(PDF_PATH))
    page_paths: list[Path] = []
    for idx, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4), alpha=False)
        out = PREVIEW_DIR / f"page-{idx + 1:02d}.png"
        pix.save(str(out))
        page_paths.append(out)
    thumbs: list[Image.Image] = []
    for path in page_paths:
        img = Image.open(path).convert("RGB")
        img.thumbnail((420, 300), Image.Resampling.LANCZOS)
        thumbs.append(img)
    cols, rows = 3, 2
    sheet = Image.new("RGB", (cols * 440 + 20, rows * 322 + 24), "#f3f4ef")
    for idx, thumb in enumerate(thumbs):
        x = 20 + (idx % cols) * 440
        y = 18 + (idx // cols) * 322
        sheet.paste(thumb, (x, y))
    sheet.save(CONTACT_SHEET, "PNG")


if __name__ == "__main__":
    build_pdf()
    render_preview()
    print(PDF_PATH)
    print(CONTACT_SHEET)
