# -*- coding: utf-8 -*-
from __future__ import annotations

import shutil
from pathlib import Path

import fitz
from PIL import Image, ImageOps
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle

from generate_project_intro_translations import DATA, OUT, TMP, ensure_assets


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
DIM = colors.HexColor("#8da399")
LINE = colors.HexColor("#31544b")

FONT_DIR = Path("C:/Windows/Fonts")
FONT_FILES = {
    "tc_reg": FONT_DIR / "msyh.ttc",
    "tc_med": FONT_DIR / "msyhbd.ttc",
    "tc_bold": FONT_DIR / "simhei.ttf",
    "en_reg": FONT_DIR / "segoeui.ttf",
    "en_med": FONT_DIR / "segoeuib.ttf",
    "en_bold": FONT_DIR / "segoeuib.ttf",
    "ko_reg": FONT_DIR / "NotoSansKR-VF.ttf",
    "ko_med": FONT_DIR / "NotoSansKR-VF.ttf",
    "ko_bold": FONT_DIR / "NotoSansKR-VF.ttf",
}
for key, fallback in {
    "tc_reg": FONT_DIR / "Deng.ttf",
    "tc_med": FONT_DIR / "Dengb.ttf",
    "tc_bold": FONT_DIR / "msyhbd.ttc",
    "en_reg": FONT_DIR / "arial.ttf",
    "en_med": FONT_DIR / "arialbd.ttf",
    "en_bold": FONT_DIR / "arialbd.ttf",
    "ko_reg": FONT_DIR / "malgun.ttf",
    "ko_med": FONT_DIR / "malgunbd.ttf",
    "ko_bold": FONT_DIR / "malgunbd.ttf",
}.items():
    if not FONT_FILES[key].exists():
        FONT_FILES[key] = fallback


def register_fonts() -> None:
    for name, path in FONT_FILES.items():
        pdfmetrics.registerFont(TTFont(f"SY_{name}", str(path)))


register_fonts()


def fonts(lang: str) -> tuple[str, str, str]:
    return f"SY_{lang}_reg", f"SY_{lang}_med", f"SY_{lang}_bold"


def style(
    lang: str,
    name: str,
    size: float,
    leading: float,
    color=WHITE,
    weight: str = "reg",
    align=TA_LEFT,
) -> ParagraphStyle:
    reg, med, bold = fonts(lang)
    font_name = {"reg": reg, "med": med, "bold": bold}[weight]
    return ParagraphStyle(
        name,
        fontName=font_name,
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=align,
        wordWrap="CJK",
        spaceBefore=0,
        spaceAfter=0,
    )


def para(c: canvas.Canvas, lang: str, value: str, x: float, top: float, width: float, ps: ParagraphStyle) -> float:
    p = Paragraph(value.replace("\n", "<br/>"), ps)
    _, h = p.wrap(width, 1000)
    p.drawOn(c, x, top - h)
    return top - h


def polygon(c: canvas.Canvas, pts: list[tuple[float, float]], fill, stroke=None) -> None:
    path = c.beginPath()
    path.moveTo(*pts[0])
    for point in pts[1:]:
        path.lineTo(*point)
    path.close()
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.drawPath(path, fill=1, stroke=1)
    else:
        c.drawPath(path, fill=1, stroke=0)


def png_cache(path: Path, tag: str) -> tuple[Path, int, int]:
    cache = TMP / f"v2-{tag}.png"
    if cache.exists():
        with Image.open(cache) as img:
            return cache, img.width, img.height
    img = Image.open(path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.save(cache, "PNG")
    return cache, img.width, img.height


def draw_png(c: canvas.Canvas, path: Path, x: float, top: float, max_w: float, max_h: float, tag: str) -> None:
    cache, iw, ih = png_cache(path, tag)
    scale = min(max_w / iw, max_h / ih)
    w, h = iw * scale, ih * scale
    c.drawImage(ImageReader(str(cache)), x, top - h, w, h, mask="auto")


def image_cache(path: Path, tag: str, box_w: float, box_h: float) -> Path:
    cache = TMP / f"v2-{tag}.jpg"
    if cache.exists():
        return cache
    img = Image.open(path).convert("RGB")
    img = ImageOps.exif_transpose(img)
    sw, sh = img.size
    ratio = box_w / box_h
    src_ratio = sw / sh
    if src_ratio > ratio:
        nw = int(sh * ratio)
        left = (sw - nw) // 2
        img = img.crop((left, 0, left + nw, sh))
    else:
        nh = int(sw / ratio)
        top = (sh - nh) // 2
        img = img.crop((0, top, sw, top + nh))
    img.thumbnail((int(box_w * 2), int(box_h * 2)), Image.Resampling.LANCZOS)
    img.save(cache, "JPEG", quality=92)
    return cache


def draw_cover_image(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, tag: str) -> None:
    cache = image_cache(path, tag, w, h)
    c.drawImage(ImageReader(str(cache)), x, y, w, h, preserveAspectRatio=False, mask="auto")


def draw_text(c: canvas.Canvas, lang: str, x: float, y: float, value: str, size: float, color=WHITE, weight="reg") -> None:
    reg, med, bold = fonts(lang)
    c.setFont({"reg": reg, "med": med, "bold": bold}[weight], size)
    c.setFillColor(color)
    c.drawString(x, y, value)


def base(c: canvas.Canvas, lang: str, section: str, page_no: int) -> None:
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    polygon(c, [(0, PAGE_H), (218, PAGE_H), (174, PAGE_H - 18), (0, PAGE_H - 18)], RED)
    polygon(c, [(PAGE_W, 0), (PAGE_W - 132, 0), (PAGE_W - 88, 26), (PAGE_W, 26)], RED_DARK)
    c.setStrokeColor(LINE)
    c.setLineWidth(1.1)
    c.line(42, PAGE_H - 62, PAGE_W - 42, PAGE_H - 62)
    draw_text(c, lang, 42, PAGE_H - 44, section, 10, GOLD_LIGHT, "bold")
    draw_text(c, lang, PAGE_W - 230, 24, f"SHOUYE PROJECT INTRODUCTION  ·  {page_no:02d}", 8.5, MUTED, "med")


def title(c: canvas.Canvas, lang: str, value: str, y: float = 430, size: float = 32, width: float = 820) -> None:
    para(c, lang, value, 58, y + size, width, style(lang, f"title-{value[:8]}", size, size * 1.14, WHITE, "bold"))
    c.setFillColor(RED)
    c.rect(58, y - 18, 66, 5, fill=1, stroke=0)


def panel(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill=PANEL, stroke=LINE, radius: float = 8) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def tag(c: canvas.Canvas, lang: str, x: float, y: float, value: str, fill=PANEL_2, min_w: float = 64) -> float:
    _, _, bold = fonts(lang)
    c.setFont(bold, 8.5)
    w = max(min_w, c.stringWidth(value, bold, 8.5) + 24)
    c.setFillColor(fill)
    c.roundRect(x, y, w, 20, 10, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.drawCentredString(x + w / 2, y + 6.5, value)
    return w


def cover(c: canvas.Canvas, lang: str, assets: dict[str, Path]) -> None:
    data = DATA[lang]["cover"]
    draw_cover_image(c, assets["cover_bg"], 0, 0, PAGE_W, PAGE_H, f"cover-{lang}")
    polygon(c, [(0, 0), (PAGE_W * 0.58, 0), (PAGE_W * 0.42, PAGE_H), (0, PAGE_H)], DEEP_2)
    polygon(c, [(0, PAGE_H), (290, PAGE_H), (250, PAGE_H - 26), (0, PAGE_H - 26)], RED)
    polygon(c, [(PAGE_W, 0), (PAGE_W - 270, 0), (PAGE_W - 214, 46), (PAGE_W, 46)], RED_DARK)
    draw_png(c, assets["logo"], 58, PAGE_H - 56, 220, 90, "cover-logo")
    draw_text(c, lang, 58, 348, data["edition"], 11, GOLD_LIGHT, "bold")
    cover_title_size = {"tc": 42, "en": 34, "ko": 36}[lang]
    cover_sub_size = {"tc": 28, "en": 22, "ko": 23}[lang]
    draw_text(c, lang, 58, 288, data["title"], cover_title_size, WHITE, "bold")
    para(c, lang, data["subtitle"], 58, 252, 430, style(lang, f"cover-sub-{lang}", cover_sub_size, cover_sub_size * 1.25, WHITE, "bold"))
    para(c, lang, data["body"], 60, 178, 430, style(lang, f"cover-copy-{lang}", 12 if lang != "en" else 10.5, 18, MUTED, "med"))
    x = 60
    for idx, item in enumerate(data["chips"]):
        x += tag(c, lang, x, 104, item, RED if idx == 0 else PANEL_2) + 12
    draw_text(c, lang, PAGE_W - 120, 74, "shouye.fun", 10.5, GOLD_LIGHT, "bold")
    c.showPage()


def founder(c: canvas.Canvas, lang: str, assets: dict[str, Path]) -> None:
    data = DATA[lang]["founder"]
    base(c, lang, data["label"], 1)
    title(c, lang, data["title"], 386, {"tc": 40, "en": 34, "ko": 36}[lang], 560)
    draw_text(c, lang, 58, 304, data["name"], 26, WHITE, "bold")
    secondary = data.get("name_secondary", "여택우")
    secondary_lang = "ko" if lang in {"tc", "en"} else "en"
    draw_text(c, secondary_lang, 210 if lang == "tc" else 172 if lang == "en" else 170, 306, "/  " + secondary, 19, GOLD_LIGHT, "med")
    para(c, lang, data["subtitle"], 58, 278, 540, style(lang, f"founder-sub-{lang}", 12.5 if lang != "en" else 11.2, 17, MUTED, "med"))
    y = 238
    for idx, paragraph in enumerate(data["body"]):
        y = para(c, lang, paragraph, 58, y, 562, style(lang, f"founder-body-{lang}-{idx}", 11.2 if lang != "en" else 9.8, 16.5, WHITE, "reg"))
        y -= 10
    for idx, (key, value) in enumerate(data["tags"]):
        x = 58 if idx % 2 == 0 else 346
        yy = 92 if idx < 2 else 54
        panel(c, x, yy, 254, 29, fill=DEEP_2, stroke=LINE, radius=2)
        draw_text(c, lang, x + 14, yy + 10, key, 10.5, RED if idx == 0 else GOLD_LIGHT, "bold")
        para(c, lang, value, x + 64, yy + 21, 172, style(lang, f"founder-tag-{lang}-{idx}", 9.8, 12, WHITE, "bold"))
    c.setFillColor(colors.HexColor("#03100d"))
    c.rect(675, 76, 238, 364, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#eef2ef"))
    c.rect(665, 86, 238, 364, fill=1, stroke=0)
    polygon(c, [(665, 450), (784, 450), (665, 352)], RED)
    polygon(c, [(903, 86), (808, 86), (903, 166)], RED_DARK)
    founder_img = image_cache(assets["founder"], f"founder-{lang}", 212, 305)
    c.drawImage(ImageReader(str(founder_img)), 679, 131, 212, 305, preserveAspectRatio=False, mask="auto")
    c.setStrokeColor(WHITE)
    c.setLineWidth(1)
    c.rect(679, 131, 212, 305, fill=0, stroke=1)
    c.setFillColor(colors.HexColor("#0f1917"))
    c.rect(679, 102, 212, 22, fill=1, stroke=0)
    draw_text(c, lang, 691, 108, data["name"], 10, WHITE, "bold")
    draw_text(c, secondary_lang, 752, 108, "/ " + secondary, 10, WHITE, "reg")
    draw_text(c, lang, PAGE_W - 122, 24, "shouye.fun", 8.5, GOLD_LIGHT, "med")
    c.showPage()


def toc(c: canvas.Canvas, lang: str) -> None:
    base(c, lang, "CONTENTS", 2)
    title(c, lang, "目錄" if lang == "tc" else "Contents" if lang == "en" else "목차", 404, 36, 300)
    items = DATA[lang]["contents"]
    for idx, (num, head, body) in enumerate(items):
        x = 82 + (idx % 2) * 400
        y = 294 - (idx // 2) * 84
        draw_text(c, lang, x, y + 28, num, 20, RED if idx % 2 == 0 else GOLD_LIGHT, "bold")
        para(c, lang, head, x + 62, y + 45, 255, style(lang, f"toc-head-{lang}-{idx}", 13 if lang != "en" else 11.5, 16, WHITE, "bold"))
        para(c, lang, body, x + 62, y + 20, 275, style(lang, f"toc-body-{lang}-{idx}", 9 if lang != "en" else 7.8, 12, MUTED, "med"))
        c.setStrokeColor(LINE)
        c.line(x + 62, y, x + 320, y)
    c.showPage()


def positioning(c: canvas.Canvas, lang: str) -> None:
    data = DATA[lang]["position"]
    base(c, lang, "01  " + DATA[lang]["contents"][0][1], 3)
    title(c, lang, data["title"], 404, 31 if lang != "en" else 28, 680)
    para(c, lang, data["body"], 58, 368, 520, style(lang, f"pos-lead-{lang}", 11.8 if lang != "en" else 10.3, 18, MUTED, "med"))
    panel(c, 612, 276, 246, 126, fill=PANEL_2, stroke=PANEL_2, radius=8)
    draw_text(c, lang, 640, 340, data["highlight"][0], 42, RED, "bold")
    draw_text(c, lang, 640, 312, data["highlight"][1], 14 if lang != "en" else 11.5, WHITE, "bold")
    para(c, lang, data["highlight"][2], 640, 298, 188, style(lang, f"pos-hi-{lang}", 9.2 if lang != "en" else 8.0, 13, MUTED, "med"))
    for idx, item in enumerate(data["cards"]):
        x = 58 + idx * 280
        panel(c, x, 112, 248, 118)
        draw_text(c, lang, x + 22, 190, item[0], 17 if lang != "en" else 13.5, GOLD_LIGHT if idx == 2 else RED if idx == 0 else WHITE, "bold")
        para(c, lang, item[1], x + 22, 160, 198, style(lang, f"pos-card-{lang}-{idx}", 9.6 if lang != "en" else 8.2, 14.6, MUTED, "med"))
    c.showPage()


def why(c: canvas.Canvas, lang: str) -> None:
    data = DATA[lang]["why"]
    base(c, lang, "02  " + DATA[lang]["contents"][1][1], 4)
    title(c, lang, data["title"], 404, 27 if lang != "en" else 23, 850)
    para(c, lang, data["body"], 58, 360, 780, style(lang, f"why-lead-{lang}", 11.2 if lang != "en" else 9.4, 17, MUTED, "med"))
    y = 270
    for idx, row in enumerate(data["rows"]):
        fill = RED if idx == 3 else PANEL if idx % 2 == 0 else DEEP_2
        panel(c, 76, y, 810, 48, fill=fill, stroke=fill, radius=4)
        draw_text(c, lang, 104, y + 18, row[0], 12.5 if lang != "en" else 10.0, GOLD_LIGHT if idx == 3 else RED if idx == 0 else WHITE, "bold")
        para(c, lang, row[1], 292, y + 30, 215, style(lang, f"why-row-a-{lang}-{idx}", 8.7 if lang != "en" else 7.4, 11, WHITE, "med"))
        para(c, lang, row[2], 566, y + 30, 250, style(lang, f"why-row-b-{lang}-{idx}", 8.7 if lang != "en" else 7.4, 11, WHITE if idx == 3 else MUTED, "med"))
        y -= 60
    para(c, lang, data["example"], 76, 52, 820, style(lang, f"why-ex-{lang}", 9.2 if lang != "en" else 7.8, 12, GOLD_LIGHT, "bold"))
    c.showPage()


def model(c: canvas.Canvas, lang: str) -> None:
    data = DATA[lang]["model"]
    base(c, lang, "03  " + DATA[lang]["contents"][2][1], 5)
    title(c, lang, data["title"], 404, 31 if lang != "en" else 27, 850)
    para(c, lang, data["body"], 58, 360, 730, style(lang, f"mode-lead-{lang}", 11.5 if lang != "en" else 9.7, 17.5, MUTED, "med"))
    for idx, key in enumerate(["left", "right"]):
        x = 58 if idx == 0 else 522
        panel(c, x, 168, 380, 150, fill=PANEL if idx == 0 else PANEL_2, stroke=RED if idx == 0 else GOLD_LIGHT)
        draw_text(c, lang, x + 30, 270, data[key][0], 21 if lang != "en" else 17, RED if idx == 0 else GOLD_LIGHT, "bold")
        para(c, lang, data[key][1], x + 30, 235, 304, style(lang, f"mode-{key}-{lang}", 10.2 if lang != "en" else 8.7, 15.4, MUTED, "med"))
    x = 132
    for idx, step in enumerate(data["steps"]):
        c.setFillColor(RED if idx == 0 else PANEL_2)
        c.circle(x, 92, 22, fill=1, stroke=0)
        draw_text(c, lang, x - 4, 88, str(idx + 1), 12, WHITE, "bold")
        para(c, lang, step, x - 52, 58, 104, style(lang, f"step-{lang}-{idx}", 8.4 if lang != "en" else 7.2, 10, MUTED, "med", TA_CENTER))
        if idx < 3:
            c.setStrokeColor(GOLD)
            c.setLineWidth(1.5)
            c.line(x + 28, 92, x + 146, 92)
        x += 174
    c.showPage()


def roles(c: canvas.Canvas, lang: str) -> None:
    data = DATA[lang]["roles"]
    base(c, lang, "04  " + DATA[lang]["contents"][3][1], 6)
    title(c, lang, data["title"], 404, 30 if lang != "en" else 24.5, 850)
    for idx, role in enumerate(data["roles"]):
        x = 58 + idx * 292
        panel(c, x, 200, 248, 178, fill=PANEL)
        draw_text(c, lang, x + 24, 326, role[0], 18 if lang != "en" else 14, RED if idx == 0 else GOLD_LIGHT if idx == 2 else WHITE, "bold")
        para(c, lang, role[1], x + 24, 298, 190, style(lang, f"role-head-{lang}-{idx}", 14 if lang != "en" else 10.8, 16, WHITE, "bold"))
        para(c, lang, role[2], x + 24, 250, 196, style(lang, f"role-body-{lang}-{idx}", 9.3 if lang != "en" else 7.8, 14, MUTED, "med"))
    draw_text(c, lang, 58, 128, data["platform"][0], 16, GOLD_LIGHT, "bold")
    para(c, lang, data["platform"][1], 58, 96, 790, style(lang, f"platform-{lang}", 11.4 if lang != "en" else 9.6, 17, WHITE, "med"))
    c.showPage()


def business(c: canvas.Canvas, lang: str) -> None:
    data = DATA[lang]["merchant"]
    base(c, lang, "05  " + DATA[lang]["contents"][4][1], 7)
    title(c, lang, data["title"], 404, 26 if lang != "en" else 20.5, 840)
    para(c, lang, data["body"], 58, 360, 740, style(lang, f"biz-lead-{lang}", 10.4 if lang != "en" else 8.3, 15.5, MUTED, "med"))
    rows = [data["headers"]] + data["rows"]
    table_data = []
    for ridx, row in enumerate(rows):
        table_data.append([
            Paragraph(cell.replace("\n", "<br/>"), style(lang, f"biz-{lang}-{ridx}-{cidx}", 9.5 if lang != "en" else 7.7, 12.4 if lang != "en" else 10.1, WHITE if ridx == 0 else MUTED, "bold" if ridx == 0 or cidx == 0 else "med", TA_CENTER if cidx else TA_LEFT))
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
    draw_text(c, lang, 808, 306, data["boundary_title"], 12.5 if lang != "en" else 9.8, GOLD_LIGHT, "bold")
    para(c, lang, data["boundary"], 808, 270, 72, style(lang, f"biz-note-{lang}", 8.0 if lang != "en" else 6.6, 12, MUTED, "med"))
    para(c, lang, data["activity"], 58, 62, 800, style(lang, f"activity-{lang}", 7.0 if lang != "en" else 5.9, 9, MUTED, "med"))
    c.showPage()


def culture(c: canvas.Canvas, lang: str, assets: dict[str, Path]) -> None:
    data = DATA[lang]["culture"]
    base(c, lang, "06  " + DATA[lang]["contents"][5][1], 8)
    title(c, lang, data["title"], 404, 26 if lang != "en" else 19.5, 850)
    para(c, lang, data["body"], 58, 360, 790, style(lang, f"culture-lead-{lang}", 10.8 if lang != "en" else 8.8, 16, MUTED, "med"))
    for idx, item in enumerate(data["cards"]):
        x = 72 + idx * 210
        panel(c, x, 176, 172, 112, fill=PANEL)
        draw_text(c, lang, x + 22, 246, item[0], 18 if lang != "en" else 14, GOLD_LIGHT if idx else RED, "bold")
        para(c, lang, item[1], x + 22, 214, 126, style(lang, f"val-{lang}-{idx}", 9.2 if lang != "en" else 7.7, 13.8, MUTED, "med"))
    draw_png(c, assets["logo"], 72, 118, 144, 50, "close-logo")
    draw_text(c, lang, 250, 96, data["site"], 9.5, WHITE, "bold")
    draw_text(c, lang, 250, 74, data["email"], 9, MUTED, "med")
    c.showPage()


def build(lang: str, assets: dict[str, Path]) -> Path:
    out = OUT / f"shouye-project-introduction-{DATA[lang]['suffix']}.pdf"
    c = canvas.Canvas(str(out), pagesize=(PAGE_W, PAGE_H), pdfVersion=(1, 4))
    c.setTitle(f"Shouye Project Introduction - {DATA[lang]['suffix']}")
    cover(c, lang, assets)
    founder(c, lang, assets)
    toc(c, lang)
    positioning(c, lang)
    why(c, lang)
    model(c, lang)
    roles(c, lang)
    business(c, lang)
    culture(c, lang, assets)
    c.save()
    doc = fitz.open(out)
    if hasattr(doc, "subset_fonts"):
        doc.subset_fonts()
    optimized = OUT / f"shouye-project-introduction-{DATA[lang]['suffix']}-optimized.pdf"
    doc.save(optimized, garbage=4, deflate=True, clean=True)
    doc.close()
    if out.exists():
        out.unlink()
    optimized.replace(out)
    return out


def render_contact(paths: list[Path]) -> None:
    from PIL import Image, ImageDraw

    for pdf_path in paths:
        preview_dir = TMP / f"v2-preview-{pdf_path.stem}"
        if preview_dir.exists():
            shutil.rmtree(preview_dir)
        preview_dir.mkdir(parents=True, exist_ok=True)
        doc = fitz.open(pdf_path)
        thumbs = []
        for index, page in enumerate(doc, 1):
            pix = page.get_pixmap(matrix=fitz.Matrix(0.42, 0.42), alpha=False)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            (preview_dir / f"page-{index:02d}.png").write_bytes(pix.tobytes("png"))
            thumbs.append(img)
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
        sheet.save(TMP / f"v2-{pdf_path.stem}-contact-sheet.png")


def main() -> None:
    assets = ensure_assets()
    paths = [build(lang, assets) for lang in ("tc", "en", "ko")]
    render_contact(paths)
    for path in paths:
        doc = fitz.open(path)
        print(path, path.stat().st_size, doc.page_count, min(len(p.get_text("text").strip()) for p in doc))


if __name__ == "__main__":
    main()
