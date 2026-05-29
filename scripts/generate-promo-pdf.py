from __future__ import annotations

import math
import textwrap
from pathlib import Path

import fitz
from PIL import Image, ImageEnhance
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "pdf"
TMP_DIR = ROOT / "tmp" / "pdfs" / "shouye-promo"
PDF_PATH = OUT_DIR / "shouye-merchant-cooperation-proposal.pdf"
PREVIEW_DIR = OUT_DIR / "preview-shouye-promo"
CONTACT_SHEET = OUT_DIR / "shouye-merchant-cooperation-preview.png"

PUBLIC = ROOT / "public"
ASSETS = {
    "logo_light": PUBLIC / "brand" / "shouye-logo-full-light.png",
    "logo_dark": PUBLIC / "brand" / "shouye-logo-full-dark.png",
    "logo_new_light": PUBLIC / "brand" / "shouye-logo-new-light.png",
    "logo_new_dark": PUBLIC / "brand" / "shouye-logo-new-dark.png",
    "logo_text_dark": PUBLIC / "brand" / "shouye-logo-text-dark.png",
    "mark": PUBLIC / "favicon.png",
    "hero1": PUBLIC / "home-hero" / "1.png",
    "hero2": PUBLIC / "home-hero" / "2.jpg",
    "hero3": PUBLIC / "home-hero" / "3.jpg",
    "konkuk": PUBLIC / "schools" / "konkuk" / "1.jpg",
    "yonsei": PUBLIC / "schools" / "yonsei" / "2.jpg",
    "korea": PUBLIC / "schools" / "korea" / "2.jpg",
    "cau": PUBLIC / "schools" / "cau" / "1.jpg",
    "native": PUBLIC / "merchant-logos" / "native-education.png",
    "wala": PUBLIC / "merchant-logos" / "wala-study.png",
}

FONT_REGULAR = "NotoSansSC"
FONT_MEDIUM = "NotoSansSC-Medium"
FONT_BOLD = "NotoSansSC-Bold"

PAGE_W, PAGE_H = landscape(A4)

INK = colors.HexColor("#101819")
FOREST = colors.HexColor("#071f13")
DEEP = colors.HexColor("#172125")
CREAM = colors.HexColor("#fffdf3")
MIST = colors.HexColor("#eef5ee")
LINE = colors.HexColor("#dbe6da")
MUTED = colors.HexColor("#65756f")
CORAL = colors.HexColor("#ef5a3c")
RED = colors.HexColor("#e6394f")
GOLD = colors.HexColor("#c08a35")
GOLD_LIGHT = colors.HexColor("#ffe3a1")
BLUE = colors.HexColor("#12345a")


def register_fonts() -> None:
    candidates = {
        FONT_REGULAR: [
            Path(r"C:\Windows\Fonts\NotoSansSC-VF.ttf"),
            Path(r"C:\Windows\Fonts\Noto Sans SC (TrueType).otf"),
            Path(r"C:\Windows\Fonts\msyh.ttc"),
        ],
        FONT_MEDIUM: [
            Path(r"C:\Windows\Fonts\NotoSansSC-VF.ttf"),
            Path(r"C:\Windows\Fonts\Noto Sans SC Medium (TrueType).otf"),
            Path(r"C:\Windows\Fonts\msyh.ttc"),
        ],
        FONT_BOLD: [
            Path(r"C:\Windows\Fonts\simhei.ttf"),
            Path(r"C:\Windows\Fonts\NotoSansSC-VF.ttf"),
            Path(r"C:\Windows\Fonts\Noto Sans SC Bold (TrueType).otf"),
            Path(r"C:\Windows\Fonts\msyhbd.ttc"),
        ],
    }
    for name, paths in candidates.items():
        for path in paths:
            if path.exists():
                pdfmetrics.registerFont(TTFont(name, str(path)))
                break
        else:
            raise FileNotFoundError(f"No usable font found for {name}")


def ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)


def hex_to_rgb(hex_value: str) -> tuple[int, int, int]:
    value = hex_value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def prepared_cover_image(path: Path, ratio: float, name: str, *, darken: float = 0.78, blur: bool = False) -> Path:
    img = Image.open(path).convert("RGB")
    src_ratio = img.width / img.height
    if src_ratio > ratio:
        new_w = int(img.height * ratio)
        left = (img.width - new_w) // 2
        img = img.crop((left, 0, left + new_w, img.height))
    else:
        new_h = int(img.width / ratio)
        top = (img.height - new_h) // 2
        img = img.crop((0, top, img.width, top + new_h))
    img = ImageEnhance.Brightness(img).enhance(darken)
    if blur:
        img = img.resize((900, int(900 / ratio)), Image.Resampling.LANCZOS)
    out = TMP_DIR / f"{name}.jpg"
    img.save(out, "JPEG", quality=86)
    return out


def draw_image_cover(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, name: str, darken: float = 1.0) -> None:
    ratio = w / h
    prepared = prepared_cover_image(path, ratio, name, darken=darken)
    c.drawImage(str(prepared), x, y, w, h, preserveAspectRatio=False, mask="auto")


def draw_png(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float) -> None:
    c.drawImage(str(path), x, y, w, h, preserveAspectRatio=True, mask="auto")


def cropped_transparent_png(path: Path, name: str, padding: int = 10) -> Path:
    img = Image.open(path).convert("RGBA")
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        left = max(0, left - padding)
        top = max(0, top - padding)
        right = min(img.width, right + padding)
        bottom = min(img.height, bottom + padding)
        img = img.crop((left, top, right, bottom))
    out = TMP_DIR / f"{name}.png"
    img.save(out, "PNG", optimize=True)
    return out


def draw_cropped_png(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, name: str) -> None:
    c.drawImage(str(cropped_transparent_png(path, name)), x, y, w, h, preserveAspectRatio=True, mask="auto")


def style(name: str, size: float, leading: float | None = None, color=INK, font: str = FONT_REGULAR, align=TA_LEFT) -> ParagraphStyle:
    return ParagraphStyle(
        name,
        fontName=font,
        fontSize=size,
        leading=leading or size * 1.35,
        textColor=color,
        alignment=align,
        wordWrap="CJK",
        splitLongWords=True,
        spaceAfter=0,
        spaceBefore=0,
    )


def para(c: canvas.Canvas, text: str, x: float, top: float, w: float, ps: ParagraphStyle) -> float:
    p = Paragraph(text.replace("\n", "<br/>"), ps)
    _, h = p.wrap(w, PAGE_H)
    p.drawOn(c, x, top - h)
    return h


def chip(c: canvas.Canvas, text: str, x: float, y: float, fill=colors.white, stroke=None, text_color=INK) -> float:
    c.setFont(FONT_BOLD, 9)
    tw = pdfmetrics.stringWidth(text, FONT_BOLD, 9)
    w = tw + 20
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    c.roundRect(x, y, w, 22, 11, fill=1, stroke=1)
    c.setFillColor(text_color)
    c.drawString(x + 10, y + 7, text)
    return w


def section_label(c: canvas.Canvas, text: str, x: float, y: float, color=CORAL) -> None:
    c.setFillColor(color)
    c.roundRect(x, y, 5, 18, 2, fill=1, stroke=0)
    c.setFillColor(color)
    c.setFont(FONT_BOLD, 10)
    c.drawString(x + 12, y + 4.5, text)


def page_footer(c: canvas.Canvas, page_num: int, title: str, dark: bool = False) -> None:
    color = colors.Color(1, 1, 1, alpha=0.62) if dark else MUTED
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.18) if dark else LINE)
    c.line(42, 28, PAGE_W - 42, 28)
    c.setFillColor(color)
    c.setFont(FONT_REGULAR, 8.5)
    c.drawString(42, 16, "SHOUYE.PARTNER  ·  留学生经验分享与问题解决平台")
    c.drawCentredString(PAGE_W / 2, 16, title)
    c.drawRightString(PAGE_W - 42, 16, f"{page_num:02d}")


def draw_stat_card(c: canvas.Canvas, x: float, y: float, w: float, h: float, label: str, value: str, body: str, color=FOREST) -> None:
    c.setFillColor(colors.white)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=1)
    c.setFillColor(color)
    c.setFont(FONT_BOLD, 26)
    c.drawString(x + 18, y + h - 40, value)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 12)
    c.drawString(x + 18, y + h - 62, label)
    para(c, body, x + 18, y + h - 82, w - 36, style("stat-body", 9.2, 13, MUTED))


def draw_bubble(c: canvas.Canvas, x: float, y: float, w: float, label: str, tag: str, fill=colors.white, pinned=False) -> None:
    h = 44 if not pinned else 58
    c.setFillColor(fill)
    c.setStrokeColor(GOLD if pinned else colors.Color(1, 1, 1, alpha=0.8))
    c.roundRect(x, y, w, h, h / 2, fill=1, stroke=1)
    icon_color = GOLD if pinned else colors.HexColor("#dce6e2")
    c.setFillColor(icon_color)
    c.circle(x + 25, y + h / 2, 17, fill=1, stroke=0)
    c.setFillColor(BLUE if pinned else INK)
    c.setFont(FONT_BOLD, 12 if not pinned else 14)
    c.drawString(x + 52, y + h / 2 + 3, label)
    c.setFillColor(CORAL)
    c.setFont(FONT_BOLD, 8.5)
    c.drawRightString(x + w - 16, y + h / 2 + 2, tag)


def cover(c: canvas.Canvas) -> None:
    draw_image_cover(c, ASSETS["hero1"], 0, 0, PAGE_W, PAGE_H, "cover", darken=0.78)
    # The cover uses one page-wide veil instead of a card/bubble mask.
    c.setFillColor(colors.Color(0.02, 0.08, 0.07, alpha=0.68))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(colors.Color(0.01, 0.04, 0.03, alpha=0.22))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(colors.Color(0, 0, 0, alpha=0.18))
    c.rect(PAGE_W * 0.62, 0, PAGE_W * 0.38, PAGE_H, fill=1, stroke=0)

    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.18))
    c.setLineWidth(1)
    c.line(54, PAGE_H - 70, PAGE_W - 54, PAGE_H - 70)

    draw_cropped_png(c, ASSETS["logo_new_light"], 56, PAGE_H - 142, 172, 78, "cover-logo-new-light")
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 12)
    c.drawRightString(PAGE_W - 56, PAGE_H - 104, "商家入驻与广告展示合作方案")

    c.setFillColor(CORAL)
    c.roundRect(58, 337, 6, 72, 3, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 40)
    c.drawString(82, 377, "让留学生在需要服务时")
    c.drawString(82, 326, "第一眼看见你")
    para(
        c,
        "售业面向在韩中国留学生，围绕提问求助、经验攻略、学校专题、商家展示和积分成长体系，帮助商家在真实需求场景里获得稳定曝光和咨询线索。",
        84,
        277,
        560,
        style("cover-body", 14.5, 22, colors.Color(1, 1, 1, alpha=0.86), FONT_MEDIUM),
    )
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.75))
    c.setFont(FONT_MEDIUM, 10.5)
    c.drawString(84, 174, "问答悬赏  /  经验帖  /  学校专题  /  商家鱼缸  /  APP · 小程序 · 网站")
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.22))
    c.line(84, 157, 570, 157)
    c.setFont(FONT_BOLD, 11)
    c.setFillColor(GOLD_LIGHT)
    c.drawString(84, 118, "试运营合作版 · 2026")
    c.drawRightString(PAGE_W - 58, 118, "shouye.fun")


def platform_value(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "01 平台价值", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 30)
    c.drawString(42, PAGE_H - 104, "不是广告位堆叠，而是进入留学生问题现场")
    para(
        c,
        "留学生找服务时，通常不是从品牌广告开始，而是从一个具体问题开始：签证怎么续、房子怎么退押金、学校材料怎么准备、手机卡和搬家怎么处理。售业把商家展示放进这些问题链路里。",
        44,
        PAGE_H - 132,
        510,
        style("value-lead", 12, 18, MUTED, FONT_MEDIUM),
    )
    draw_image_cover(c, ASSETS["hero2"], 590, PAGE_H - 208, 210, 145, "value-campus", darken=0.88)
    c.setFillColor(colors.Color(0, 0, 0, alpha=0.26))
    c.roundRect(590, PAGE_H - 208, 210, 145, 14, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 18)
    c.drawString(612, PAGE_H - 122, "内容先建立信任")
    c.setFont(FONT_MEDIUM, 10)
    c.drawString(612, PAGE_H - 146, "再承接商家服务咨询")

    cards = [
        ("真实问题", "问答/求助", "围绕签证、租房、升学、生活、就业等高频难题，用户带着明确需求进入页面。"),
        ("长期搜索", "经验/攻略", "精华帖和学校专题适合 SEO 与社群转发，商家信息不是一次性曝光。"),
        ("可运营", "后台/展示", "商家分类、置顶、鱼缸气泡、展示页和品牌装饰都可后台管理。"),
    ]
    for idx, (label, value, body) in enumerate(cards):
        draw_stat_card(c, 44 + idx * 264, 270, 238, 132, label, value, body, [FOREST, BLUE, CORAL][idx])

    c.setFillColor(DEEP)
    c.roundRect(42, 86, PAGE_W - 84, 142, 16, fill=1, stroke=0)
    draw_png(c, ASSETS["mark"], 64, 116, 70, 70)
    para(
        c,
        "<b>适合合作的商家类型</b><br/>留学咨询、语学院/大学院申请、签证材料、论文与毕业、租房搬家、手机卡与网络、物流快递、韩语培训、艺术作品集、校园周边服务等。",
        154,
        188,
        610,
        style("types", 14, 22, colors.white, FONT_REGULAR),
    )
    page_footer(c, 2, "平台价值")


def display_resources(c: canvas.Canvas) -> None:
    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "02 展示资源", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 30)
    c.drawString(42, PAGE_H - 104, "从首页鱼缸到商家主页，形成连续曝光")
    para(c, "商家不是只出现在一个列表里，而是按类别、置顶等级、学校场景和内容推荐进入不同入口。", 44, PAGE_H - 132, 620, style("display-lead", 12, 18, MUTED, FONT_MEDIUM))

    c.setFillColor(colors.HexColor("#0d4670"))
    c.roundRect(42, 245, PAGE_W - 84, 220, 18, fill=1, stroke=0)
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.08))
    for i in range(70):
        c.circle(54 + (i * 37) % 735, 260 + ((i * 53) % 190), 1.4, fill=1, stroke=0)
    draw_bubble(c, 80, 386, 180, "土著人", "论文与毕业", fill=colors.HexColor("#c49b42"), pinned=True)
    draw_bubble(c, 292, 392, 230, "签证续签材料校对", "签证指导")
    draw_bubble(c, 546, 384, 190, "手机卡与网络套餐", "通信")
    draw_bubble(c, 122, 318, 210, "鑫鑫家政", "家政搬家")
    draw_bubble(c, 370, 314, 230, "语学院报名代办", "留学咨询")
    draw_bubble(c, 612, 306, 165, "TOPIK写作训练", "韩语培训")
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 16)
    c.drawString(68, 264, "首页鱼缸气泡")
    c.setFont(FONT_REGULAR, 10)
    c.drawString(188, 267, "置顶商家更大、更亮、层级更高，适合短期促销和重点服务。")

    panels = [
        ("类目页", ASSETS["konkuk"], "按留学咨询、签证、家政搬家、通信等类别展示，方便用户带着需求筛选。"),
        ("商家主页", ASSETS["hero3"], "支持品牌图、服务说明、案例、优惠提醒和咨询入口，适合沉淀长期介绍。"),
        ("内容入口", ASSETS["yonsei"], "经验帖、学校专题和问答详情中可自然关联服务，不硬塞广告。"),
    ]
    for idx, (title, img, body) in enumerate(panels):
        x = 42 + idx * 265
        c.setFillColor(MIST)
        c.setStrokeColor(LINE)
        c.roundRect(x, 64, 242, 150, 14, fill=1, stroke=1)
        draw_image_cover(c, img, x + 12, 132, 218, 66, f"display-{idx}", darken=0.9)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 15)
        c.drawString(x + 14, 110, title)
        para(c, body, x + 14, 94, 214, style(f"display-body-{idx}", 9.3, 13, MUTED))
    page_footer(c, 3, "展示资源")


def pricing(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "03 合作方案与费用", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 29)
    c.drawString(42, PAGE_H - 104, "入驻、认证、置顶分层收费，方便商家按阶段选择")
    para(c, "以下为试运营建议价，用于对外沟通和首批邀请。实际执行可按类目竞争度、城市、展示周期和正式协议微调。", 44, PAGE_H - 132, 700, style("price-lead", 11.5, 17, MUTED, FONT_MEDIUM))

    headers = ["合作项", "适合对象", "核心权益", "标准价", "前期邀请优惠"]
    rows = [
        ["普通入驻", "刚开始测试平台获客的商家", "分类展示、商家资料页、基础标签、用户咨询入口", "199 元/月\n1,980 元/年", "首批邀请 90 天免费\n年付 980 元"],
        ["认证商家", "需要建立信任背书的服务商", "认证标识、材料审核、优先收录、服务范围管理", "399 元/月\n3,980 元/年", "首月免费\n试运营 199 元/月"],
        ["类目置顶", "想在某一业务类别抢占曝光", "类目靠前、鱼缸高亮气泡、展示层级提升", "699 元/月/类目", "首批 299 元/月/类目\n3 个月起"],
        ["首页鱼缸置顶", "重点品牌或短期促销", "首页更大气泡、慢速移动、长期上层展示", "1,299 元/月", "首批 699 元/月\n限 10 个名额"],
        ["联合活动包", "愿意给留学生优惠的商家", "优惠券、活动页、内容推荐、社群转发素材", "999 元/次", "首批 399 元/次\n可与置顶打包"],
    ]
    table_data = [[Paragraph(f"<b>{cell}</b>", style("th", 9.5, 12, colors.white, FONT_BOLD, TA_CENTER)) for cell in headers]]
    for row_idx, row in enumerate(rows):
        table_data.append([
            Paragraph(row[0], style("td0", 10.5, 13, INK, FONT_BOLD)),
            Paragraph(row[1], style("td", 8.6, 11.5, INK)),
            Paragraph(row[2], style("td", 8.6, 11.5, INK)),
            Paragraph(row[3].replace("\n", "<br/>"), style("td-price", 9.2, 12, BLUE, FONT_BOLD, TA_CENTER)),
            Paragraph(row[4].replace("\n", "<br/>"), style("td-offer", 9.2, 12, CORAL, FONT_BOLD, TA_CENTER)),
        ])
    t = Table(table_data, colWidths=[88, 150, 250, 115, 145], rowHeights=[30, 54, 54, 54, 54, 54])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), FOREST),
        ("GRID", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#f5f8f3")),
        ("BACKGROUND", (0, 4), (-1, 4), colors.HexColor("#f5f8f3")),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    t.wrapOn(c, PAGE_W - 84, 330)
    t.drawOn(c, 46, 148)

    c.setFillColor(colors.HexColor("#fff4df"))
    c.setStrokeColor(colors.HexColor("#efd19a"))
    c.roundRect(42, 76, PAGE_W - 84, 58, 14, fill=1, stroke=1)
    para(
        c,
        "<b>费用说明：</b>以上价格为试运营合作报价，未包含特殊定制页面、线下拍摄、跨平台达人投放等额外服务。平台保留对违法违规、虚假宣传、换汇换钱及灰产服务拒绝入驻或下架的权利。",
        62,
        117,
        PAGE_W - 124,
        style("price-note", 10, 15, colors.HexColor("#654b18"), FONT_REGULAR),
    )
    page_footer(c, 4, "合作费用")


def invitation_offer(c: canvas.Canvas) -> None:
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_image_cover(c, ASSETS["korea"], 0, 0, PAGE_W, PAGE_H, "invite-bg", darken=0.34)
    c.setFillColor(colors.Color(0.03, 0.08, 0.07, alpha=0.74))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "04 首批邀请优惠", 42, PAGE_H - 58, GOLD_LIGHT)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 31)
    c.drawString(42, PAGE_H - 104, "前期重点不是收割广告费，而是一起把样板做出来")
    para(
        c,
        "试运营期更适合邀请一批服务稳定、愿意公开服务边界的商家。平台用优惠换取真实服务案例、用户评价和可持续内容。",
        44,
        PAGE_H - 132,
        660,
        style("invite-lead", 12, 18, colors.Color(1, 1, 1, alpha=0.82), FONT_MEDIUM),
    )

    offers = [
        ("首批入驻", "0 元", "普通入驻 90 天体验；完成资料后进入分类展示。"),
        ("认证减免", "首月免费", "提交营业/服务材料并通过审核，获得认证商家标识。"),
        ("置顶折扣", "低至 299/月", "类目置顶按业务范围单独计算，适合测试真实转化。"),
        ("年付保护", "锁定试运营价", "首批商家年付可锁定优惠价，不随短期涨价调整。"),
    ]
    for idx, (title, value, body) in enumerate(offers):
        x = 48 + idx * 196
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.10))
        c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.18))
        c.roundRect(x, 292, 176, 136, 16, fill=1, stroke=1)
        c.setFillColor(GOLD_LIGHT)
        c.setFont(FONT_BOLD, 13)
        c.drawString(x + 18, 396, title)
        c.setFillColor(colors.white)
        c.setFont(FONT_BOLD, 26)
        c.drawString(x + 18, 354, value)
        para(c, body, x + 18, 328, 140, style(f"offer-{idx}", 9.5, 13.5, colors.Color(1, 1, 1, alpha=0.75)))

    c.setFillColor(colors.white)
    c.roundRect(48, 96, 356, 150, 16, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 18)
    c.drawString(72, 212, "推荐首批合作包")
    para(c, "认证商家 + 1 个类目置顶 + 1 次联合优惠券活动，首批邀请价 <b>999 元/月</b>。适合想先试 30 天获客效果的商家。", 72, 188, 304, style("bundle", 12, 18, INK))
    c.setFillColor(RED)
    c.roundRect(72, 116, 134, 34, 17, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 12)
    c.drawCentredString(139, 126, "首批限量名额")

    c.setFillColor(colors.Color(1, 1, 1, alpha=0.12))
    c.roundRect(430, 96, 360, 150, 16, fill=1, stroke=0)
    para(
        c,
        "<b>平台希望优先邀请：</b><br/>服务边界清楚、愿意给留学生明确报价、能提供真实联系方式和基础资质、愿意接受用户评价和平台投诉处理规则的商家。",
        456,
        210,
        312,
        style("invite-fit", 12, 19, colors.white, FONT_REGULAR),
    )
    page_footer(c, 5, "首批邀请优惠", dark=True)


def onboarding(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "05 入驻流程", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 30)
    c.drawString(42, PAGE_H - 104, "一周内完成资料、审核、展示和首轮投放")
    para(c, "售业更重视商家资料是否真实、服务边界是否清楚、用户是否能理解收费方式。流程越清楚，后续投诉和误会越少。", 44, PAGE_H - 132, 650, style("flow-lead", 12, 18, MUTED, FONT_MEDIUM))

    steps = [
        ("01", "提交资料", "商家名称、服务类别、城市、联系方式、Logo、主营业务和价格边界。"),
        ("02", "后台审核", "平台审核资质、服务内容、是否涉及违规导流或高风险业务。"),
        ("03", "配置展示", "分配类别、商家主页、鱼缸气泡、置顶等级和品牌装饰权限。"),
        ("04", "上线试投", "进入首页鱼缸、分类页、相关内容入口，观察咨询和反馈。"),
        ("05", "复盘续约", "根据曝光、咨询、用户评价和投诉记录调整展示方式。"),
    ]
    for idx, (num, title, body) in enumerate(steps):
        x = 44 + idx * 153
        c.setFillColor(colors.white)
        c.setStrokeColor(LINE)
        c.roundRect(x, 312, 136, 138, 15, fill=1, stroke=1)
        c.setFillColor(CORAL if idx in (0, 3) else FOREST)
        c.setFont(FONT_BOLD, 22)
        c.drawString(x + 16, 410, num)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 14)
        c.drawString(x + 16, 384, title)
        para(c, body, x + 16, 362, 104, style(f"step-{idx}", 8.7, 12.5, MUTED))
        if idx < len(steps) - 1:
            c.setStrokeColor(GOLD)
            c.setLineWidth(1.4)
            c.line(x + 136, 381, x + 153, 381)
            c.line(x + 148, 386, x + 153, 381)
            c.line(x + 148, 376, x + 153, 381)

    c.setFillColor(DEEP)
    c.roundRect(42, 80, 510, 176, 18, fill=1, stroke=0)
    draw_png(c, ASSETS["logo_light"], 62, 176, 120, 56)
    para(
        c,
        "<b>对外沟通建议话术</b><br/>我们不是单纯卖广告位，而是把商家放进留学生真实问题和学校生活场景里。前期邀请商家可低成本试投，平台会一起优化展示内容和服务边界。",
        202,
        224,
        318,
        style("talk", 12, 19, colors.white, FONT_REGULAR),
    )
    c.setFillColor(colors.white)
    c.roundRect(576, 80, 222, 176, 18, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 17)
    c.drawString(600, 216, "联系与展示")
    items = ["官网：shouye.fun", "展示链接：shouye-platform.l243736590.workers.dev", "后台可配置：商家类别、置顶、展示页、材料审核", "价格有效期：2026 试运营阶段"]
    y = 188
    for item in items:
        c.setFillColor(CORAL)
        c.circle(604, y + 4, 3, fill=1, stroke=0)
        para(c, item, 616, y + 12, 158, style(f"contact-{y}", 8.8, 12.5, MUTED, FONT_MEDIUM))
        y -= 30
    page_footer(c, 6, "入驻流程")


def build_pdf() -> None:
    register_fonts()
    ensure_dirs()
    c = canvas.Canvas(str(PDF_PATH), pagesize=landscape(A4))
    cover(c)
    c.showPage()
    platform_value(c)
    c.showPage()
    display_resources(c)
    c.showPage()
    pricing(c)
    c.showPage()
    invitation_offer(c)
    c.showPage()
    onboarding(c)
    c.save()


def render_preview() -> None:
    for old in PREVIEW_DIR.glob("*.png"):
        old.unlink()
    doc = fitz.open(PDF_PATH)
    rendered_paths = []
    for index, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.55, 1.55), alpha=False)
        out = PREVIEW_DIR / f"page-{index + 1:02d}.png"
        pix.save(out)
        rendered_paths.append(out)
    thumbs = []
    for path in rendered_paths:
        img = Image.open(path).convert("RGB")
        img.thumbnail((420, 300), Image.Resampling.LANCZOS)
        thumbs.append(img)
    cols = 2
    rows = math.ceil(len(thumbs) / cols)
    sheet = Image.new("RGB", (cols * 460, rows * 340), (238, 242, 236))
    for idx, img in enumerate(thumbs):
        x = (idx % cols) * 460 + 20
        y = (idx // cols) * 340 + 20
        sheet.paste(img, (x, y))
    sheet.save(CONTACT_SHEET, "PNG")


PDF_PATH = OUT_DIR / "shouye-project-introduction.pdf"
PREVIEW_DIR = OUT_DIR / "preview-shouye-project-introduction"
CONTACT_SHEET = OUT_DIR / "shouye-project-introduction-preview.png"


def cover(c: canvas.Canvas) -> None:
    draw_image_cover(c, ASSETS["hero1"], 0, 0, PAGE_W, PAGE_H, "project-cover", darken=0.74)
    c.setFillColor(colors.Color(0.02, 0.07, 0.06, alpha=0.70))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(colors.Color(0, 0, 0, alpha=0.18))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.20))
    c.line(56, PAGE_H - 70, PAGE_W - 56, PAGE_H - 70)

    draw_cropped_png(c, ASSETS["logo_new_light"], 56, PAGE_H - 143, 185, 84, "project-cover-logo")
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 12)
    c.drawRightString(PAGE_W - 56, PAGE_H - 104, "项目介绍 · 文化与生态说明")

    c.setFillColor(CORAL)
    c.roundRect(58, 350, 6, 78, 3, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 42)
    c.drawString(82, 392, "售业项目介绍")
    c.setFont(FONT_BOLD, 31)
    c.drawString(84, 340, "让经验成为解决问题的力量")

    para(
        c,
        "售业是面向在韩中国留学生的经验分享与问题解决平台。我们希望把留学生活里分散、重复、难判断的信息，整理成可求助、可参考、可追踪、可合作的服务网络。",
        84,
        292,
        570,
        style("project-cover-body", 14.5, 22, colors.Color(1, 1, 1, alpha=0.86), FONT_MEDIUM),
    )

    c.setFillColor(colors.Color(1, 1, 1, alpha=0.76))
    c.setFont(FONT_MEDIUM, 10.5)
    c.drawString(84, 190, "提问求助  /  经验分享  /  学校专题  /  商家服务  /  积分成长  /  小程序与 APP")
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.23))
    c.line(84, 172, 622, 172)
    c.setFillColor(GOLD_LIGHT)
    c.setFont(FONT_BOLD, 11)
    c.drawString(84, 126, "项目介绍版 · 2026")
    c.drawRightString(PAGE_W - 58, 126, "shouye.fun")


def platform_value(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "01 项目出发点", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 31)
    c.drawString(42, PAGE_H - 104, "很多留学问题，不是没人回答，而是没人整理")
    para(
        c,
        "在异国生活，学生常常需要在微信群、论坛、搜索结果和熟人经验之间来回确认。信息可能过期、语境不完整，也很难判断谁是真经验、谁是广告。售业的出发点，是把这些零散经验沉淀成可被反复使用的公共基础设施。",
        44,
        PAGE_H - 134,
        610,
        style("origin-lead", 12.2, 18.5, MUTED, FONT_MEDIUM),
    )

    draw_image_cover(c, ASSETS["yonsei"], 620, PAGE_H - 204, 180, 132, "origin-campus", darken=0.85)
    c.setFillColor(colors.Color(0, 0, 0, alpha=0.26))
    c.roundRect(620, PAGE_H - 204, 180, 132, 13, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 15)
    c.drawString(640, PAGE_H - 118, "从真实问题开始")
    c.setFont(FONT_MEDIUM, 9.5)
    c.drawString(640, PAGE_H - 142, "再连接经验、规则和服务")

    cards = [
        ("信息分散", "同一个签证、租房或学校问题，答案散落在不同群聊和帖子里。"),
        ("信任不足", "用户很难判断内容是亲历经验、过期攻略，还是商家软广告。"),
        ("服务断层", "学生需要服务时，缺少清晰边界、价格透明和可投诉的商家入口。"),
    ]
    for idx, (title, body) in enumerate(cards):
        x = 44 + idx * 264
        c.setFillColor(colors.white)
        c.setStrokeColor(LINE)
        c.roundRect(x, 275, 238, 130, 14, fill=1, stroke=1)
        c.setFillColor([CORAL, BLUE, FOREST][idx])
        c.setFont(FONT_BOLD, 21)
        c.drawString(x + 18, 358, f"0{idx + 1}")
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 15)
        c.drawString(x + 66, 360, title)
        para(c, body, x + 18, 330, 198, style(f"origin-card-{idx}", 10, 15, MUTED))

    c.setFillColor(DEEP)
    c.roundRect(42, 86, PAGE_W - 84, 142, 16, fill=1, stroke=0)
    draw_png(c, ASSETS["mark"], 64, 116, 70, 70)
    para(
        c,
        "<b>售业想解决的不是单个问题，而是问题反复出现却没有被沉淀的状态。</b><br/>我们把求助、经验、学校专题、商家服务和积分激励放在一个体系里，让后来的人少走弯路，也让愿意分享的人获得回报。",
        154,
        188,
        610,
        style("origin-summary", 13.5, 21, colors.white, FONT_REGULAR),
    )
    page_footer(c, 2, "项目出发点")


def display_resources(c: canvas.Canvas) -> None:
    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "02 产品结构", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 31)
    c.drawString(42, PAGE_H - 104, "从一个问题，到一套可持续的留学生服务系统")
    para(
        c,
        "售业不是单页信息站，而是围绕用户问题逐步扩展的三端产品：网站承载长内容与搜索，小程序承接高频轻操作，APP 承接正式账号、内容和服务闭环。",
        44,
        PAGE_H - 134,
        700,
        style("product-lead", 12, 18, MUTED, FONT_MEDIUM),
    )

    modules = [
        ("提问 / 求助", "悬赏问答、退款申诉、人工处理"),
        ("经验 / 精华帖", "签证、租房、银行、打工、升学"),
        ("学校专题", "学校差异、申请节点、校园信息"),
        ("商家服务", "分类展示、认证、置顶、咨询线索"),
        ("成长体系", "积分、可提现积分、等级、称号"),
    ]
    c.setFillColor(colors.HexColor("#102027"))
    c.roundRect(42, 250, PAGE_W - 84, 190, 16, fill=1, stroke=0)
    for idx, (title, body) in enumerate(modules):
        x = 64 + idx * 150
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.08))
        c.roundRect(x, 292, 130, 104, 13, fill=1, stroke=1)
        c.setFillColor(GOLD_LIGHT if idx == 0 else colors.white)
        c.setFont(FONT_BOLD, 13.5)
        c.drawString(x + 14, 366, title)
        para(c, body, x + 14, 344, 102, style(f"module-{idx}", 8.8, 12.5, colors.Color(1, 1, 1, alpha=0.72)))
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 15)
    c.drawString(64, 270, "核心模块不是互相割裂，而是围绕同一个用户问题连续流转。")

    panels = [
        ("网站", ASSETS["konkuk"], "适合搜索、长文、学校专题、法律协议和商家展示页。"),
        ("小程序", ASSETS["cau"], "适合快速浏览、提问、看帖、轻量求助和商家入口。"),
        ("APP", ASSETS["hero3"], "适合正式账号体系、登录注册、内容沉淀和长期运营。"),
    ]
    for idx, (title, img, body) in enumerate(panels):
        x = 42 + idx * 265
        c.setFillColor(MIST)
        c.setStrokeColor(LINE)
        c.roundRect(x, 66, 242, 150, 14, fill=1, stroke=1)
        draw_image_cover(c, img, x + 12, 132, 218, 66, f"project-product-{idx}", darken=0.9)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 15)
        c.drawString(x + 14, 110, title)
        para(c, body, x + 14, 94, 214, style(f"product-body-{idx}", 9.3, 13, MUTED))
    page_footer(c, 3, "产品结构")


def invitation_offer(c: canvas.Canvas) -> None:
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_image_cover(c, ASSETS["korea"], 0, 0, PAGE_W, PAGE_H, "culture-bg", darken=0.36)
    c.setFillColor(colors.Color(0.02, 0.07, 0.06, alpha=0.76))
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "03 企业文化", 42, PAGE_H - 58, GOLD_LIGHT)
    c.setFillColor(colors.white)
    c.setFont(FONT_BOLD, 32)
    c.drawString(42, PAGE_H - 104, "不靠信息差吓唬学生，而靠真实经验建立信任")
    para(
        c,
        "售业的长期价值来自信任。平台允许商家存在，但不允许服务边界模糊、虚假承诺和灰产借壳。我们希望把社区、内容和商业服务放在同一套规则里。",
        44,
        PAGE_H - 134,
        690,
        style("culture-lead", 12.2, 18.5, colors.Color(1, 1, 1, alpha=0.82), FONT_MEDIUM),
    )

    values = [
        ("真实", "经验必须尽量讲清时间、背景、学校、身份阶段和限制条件。"),
        ("互助", "让已经走过的人帮助后来的人，也让认真回答的人获得回报。"),
        ("边界", "商家可以展示服务，但必须说清收费、范围、风险和不可承诺事项。"),
        ("长期", "不追求一次性流量收割，而是积累可复用的内容、口碑和规则。"),
    ]
    for idx, (title, body) in enumerate(values):
        x = 52 + idx * 192
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.10))
        c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.18))
        c.roundRect(x, 284, 170, 134, 15, fill=1, stroke=1)
        c.setFillColor(GOLD_LIGHT)
        c.setFont(FONT_BOLD, 20)
        c.drawString(x + 18, 374, title)
        para(c, body, x + 18, 338, 132, style(f"culture-{idx}", 9.5, 14, colors.Color(1, 1, 1, alpha=0.76)))

    c.setFillColor(colors.white)
    c.roundRect(52, 98, 350, 136, 16, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 18)
    c.drawString(76, 198, "平台不做什么")
    para(c, "不做换钱换汇撮合，不做虚假保证，不默认商家永远正确，不把用户隐私和认证材料当营销资产。", 76, 172, 296, style("dont", 12, 18, INK))

    c.setFillColor(colors.Color(1, 1, 1, alpha=0.12))
    c.roundRect(430, 98, 360, 136, 16, fill=1, stroke=0)
    para(
        c,
        "<b>售业希望形成的关系：</b><br/>用户敢问，回答者愿意分享，商家清楚表达服务边界，平台负责把规则、投诉、评价和展示秩序维护住。",
        456,
        198,
        308,
        style("relation", 12, 19, colors.white, FONT_REGULAR),
    )
    page_footer(c, 4, "企业文化", dark=True)


def pricing(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "04 生态合作与费用", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 30)
    c.drawString(42, PAGE_H - 104, "商家合作是生态的一部分，不是项目的全部")
    para(
        c,
        "平台会为真实、清晰、有边界的服务商开放展示和广告合作。费用按入驻、认证、类目置顶、首页鱼缸置顶和联合活动分层，试运营期保留首批邀请优惠。",
        44,
        PAGE_H - 132,
        720,
        style("ecosystem-lead", 11.8, 17.5, MUTED, FONT_MEDIUM),
    )
    headers = ["合作项", "适合对象", "核心权益", "标准价", "前期邀请优惠"]
    rows = [
        ["普通入驻", "刚开始测试平台获客的商家", "分类展示、商家资料页、基础标签、用户咨询入口", "199 元/月\n1,980 元/年", "首批邀请 90 天免费\n年付 980 元"],
        ["认证商家", "需要建立信任背书的服务商", "认证标识、材料审核、优先收录、服务范围管理", "399 元/月\n3,980 元/年", "首月免费\n试运营 199 元/月"],
        ["类目置顶", "想在某一业务类别抢占曝光", "类目靠前、鱼缸高亮气泡、展示层级提升", "699 元/月/类目", "首批 299 元/月/类目\n3 个月起"],
        ["首页鱼缸置顶", "重点品牌或短期促销", "首页更大气泡、慢速移动、长期上层展示", "1,299 元/月", "首批 699 元/月\n限 10 个名额"],
        ["联合活动包", "愿意给留学生优惠的商家", "优惠券、活动页、内容推荐、社群转发素材", "999 元/次", "首批 399 元/次\n可与置顶打包"],
    ]
    table_data = [[Paragraph(f"<b>{cell}</b>", style("th2", 9.5, 12, colors.white, FONT_BOLD, TA_CENTER)) for cell in headers]]
    for row in rows:
        table_data.append([
            Paragraph(row[0], style("eco-td0", 10.3, 13, INK, FONT_BOLD)),
            Paragraph(row[1], style("eco-td", 8.6, 11.5, INK)),
            Paragraph(row[2], style("eco-td", 8.6, 11.5, INK)),
            Paragraph(row[3].replace("\n", "<br/>"), style("eco-price", 9.2, 12, BLUE, FONT_BOLD, TA_CENTER)),
            Paragraph(row[4].replace("\n", "<br/>"), style("eco-offer", 9.2, 12, CORAL, FONT_BOLD, TA_CENTER)),
        ])
    t = Table(table_data, colWidths=[88, 150, 250, 115, 145], rowHeights=[30, 54, 54, 54, 54, 54])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), FOREST),
        ("GRID", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#f5f8f3")),
        ("BACKGROUND", (0, 4), (-1, 4), colors.HexColor("#f5f8f3")),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    t.wrapOn(c, PAGE_W - 84, 330)
    t.drawOn(c, 46, 148)
    c.setFillColor(colors.HexColor("#fff4df"))
    c.setStrokeColor(colors.HexColor("#efd19a"))
    c.roundRect(42, 76, PAGE_W - 84, 58, 14, fill=1, stroke=1)
    para(
        c,
        "<b>说明：</b>以上为 2026 试运营建议价，正式合作以协议和后台订单为准。平台可拒绝虚假宣传、灰产服务、换钱换汇等高风险业务。",
        62,
        116,
        PAGE_W - 124,
        style("eco-note", 10.2, 15, colors.HexColor("#654b18"), FONT_REGULAR),
    )
    page_footer(c, 5, "生态合作")


def onboarding(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    section_label(c, "05 试运营阶段", 42, PAGE_H - 58)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 30)
    c.drawString(42, PAGE_H - 104, "先把样板做扎实，再扩大城市、学校和服务类目")
    para(
        c,
        "当前阶段重点是验证内容供给、问答闭环、商家展示和用户信任机制。平台会优先邀请一批愿意公开服务边界、接受评价和投诉规则的商家一起试运营。",
        44,
        PAGE_H - 132,
        700,
        style("roadmap-lead", 12, 18, MUTED, FONT_MEDIUM),
    )
    steps = [
        ("01", "内容样板", "完善高频问题、精华经验帖、学校专题和合规说明。"),
        ("02", "账号体系", "打通网站、小程序、APP 的登录、积分、认证和资料管理。"),
        ("03", "商家样板", "选择典型服务类目，做清楚分类、置顶、展示页和投诉边界。"),
        ("04", "社群分发", "围绕学校、签证、租房、升学等场景做可转发内容。"),
        ("05", "城市扩展", "从韩国留学生核心场景出发，逐步扩展更多学校和城市。"),
    ]
    for idx, (num, title, body) in enumerate(steps):
        x = 44 + idx * 153
        c.setFillColor(colors.white)
        c.setStrokeColor(LINE)
        c.roundRect(x, 312, 136, 138, 15, fill=1, stroke=1)
        c.setFillColor(CORAL if idx in (0, 2) else FOREST)
        c.setFont(FONT_BOLD, 22)
        c.drawString(x + 16, 410, num)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 14)
        c.drawString(x + 16, 384, title)
        para(c, body, x + 16, 362, 104, style(f"roadmap-step-{idx}", 8.7, 12.5, MUTED))
        if idx < len(steps) - 1:
            c.setStrokeColor(GOLD)
            c.setLineWidth(1.4)
            c.line(x + 136, 381, x + 153, 381)
            c.line(x + 148, 386, x + 153, 381)
            c.line(x + 148, 376, x + 153, 381)
    c.setFillColor(DEEP)
    c.roundRect(42, 80, 510, 176, 18, fill=1, stroke=0)
    draw_cropped_png(c, ASSETS["logo_new_light"], 62, 176, 130, 58, "roadmap-logo-new")
    para(
        c,
        "<b>一句话介绍售业</b><br/>售业不是单纯的信息站，也不是单纯广告平台。它希望成为留学生遇到具体问题时，可以提问、查经验、找服务、积累信用和获得回报的基础设施。",
        212,
        224,
        306,
        style("project-one-line", 12, 19, colors.white, FONT_REGULAR),
    )
    c.setFillColor(colors.white)
    c.roundRect(576, 80, 222, 176, 18, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 17)
    c.drawString(600, 216, "联系与展示")
    items = ["官网：shouye.fun", "展示链接：shouye-platform.l243736590.workers.dev", "首批邀请：认证、置顶、联合活动均有试运营优惠", "资料版本：2026 项目介绍版"]
    y = 188
    for item in items:
        c.setFillColor(CORAL)
        c.circle(604, y + 4, 3, fill=1, stroke=0)
        para(c, item, 616, y + 12, 158, style(f"roadmap-contact-{y}", 8.8, 12.5, MUTED, FONT_MEDIUM))
        y -= 30
    page_footer(c, 6, "试运营阶段")


if __name__ == "__main__":
    build_pdf()
    render_preview()
    print(PDF_PATH)
    print(CONTACT_SHEET)
