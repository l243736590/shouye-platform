# -*- coding: utf-8 -*-
from __future__ import annotations

from pathlib import Path
from typing import Iterable

import fitz
from PIL import Image

from generate_project_intro_translations import DATA


ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "tmp" / "pdfs" / "strict-translate"
OUT = ROOT / "output" / "pdf"
SOURCE = TMP / "source.pdf"
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)

PAGE_W = 960
PAGE_H = 540


def rgb(hex_color: str) -> tuple[float, float, float]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) / 255 for i in (0, 2, 4))


WHITE = rgb("#f7fbf8")
WHITE_2 = rgb("#f4f7f3")
MUTED = rgb("#bfd0ca")
MUTED_2 = rgb("#b7c9c0")
BODY = rgb("#dbe7e1")
GOLD = rgb("#f2d06b")
GOLD_2 = rgb("#f2c75b")
RED = rgb("#ef3f34")
RED_DARK = rgb("#c82420")
FOOTER = rgb("#f2f2f2")
PILL_DARK = rgb("#173f36")

FONT_DIR = Path("C:/Windows/Fonts")
FONTS = {
    "tc_reg": FONT_DIR / "Deng.ttf",
    "tc_bold": FONT_DIR / "Dengb.ttf",
    "en_reg": FONT_DIR / "segoeui.ttf",
    "en_bold": FONT_DIR / "segoeuib.ttf",
    "ko_reg": FONT_DIR / "NotoSansKR-VF.ttf",
    "ko_bold": FONT_DIR / "NotoSansKR-VF.ttf",
}
for key, fallback in {
    "tc_reg": FONT_DIR / "msyh.ttc",
    "tc_bold": FONT_DIR / "msyhbd.ttc",
    "en_reg": FONT_DIR / "arial.ttf",
    "en_bold": FONT_DIR / "arialbd.ttf",
    "ko_reg": FONT_DIR / "malgun.ttf",
    "ko_bold": FONT_DIR / "malgunbd.ttf",
}.items():
    if not FONTS[key].exists():
        FONTS[key] = fallback


def fontfile(lang: str, bold: bool = False) -> Path:
    return FONTS[f"{lang}_{'bold' if bold else 'reg'}"]


def fontname(lang: str, bold: bool = False) -> str:
    return f"SYStrict_{lang}_{'bold' if bold else 'reg'}"


def font_obj(lang: str, bold: bool = False) -> fitz.Font:
    return fitz.Font(fontfile=str(fontfile(lang, bold)))


def measure(lang: str, text: str, size: float, bold: bool = False) -> float:
    return font_obj(lang, bold).text_length(text, fontsize=size)


def wrap_text(lang: str, value: str, max_width: float, size: float, bold: bool = False) -> list[str]:
    if "\n" in value:
        result: list[str] = []
        for part in value.split("\n"):
            if part:
                result.extend(wrap_text(lang, part, max_width, size, bold))
            else:
                result.append("")
        return result
    if lang in {"en", "ko"}:
        words = value.split(" ")
        lines: list[str] = []
        line = ""
        for word in words:
            trial = word if not line else f"{line} {word}"
            if measure(lang, trial, size, bold) <= max_width:
                line = trial
                continue
            if line:
                lines.append(line)
            if measure(lang, word, size, bold) <= max_width:
                line = word
            else:
                line = ""
                for ch in word:
                    trial_ch = line + ch
                    if not line or measure(lang, trial_ch, size, bold) <= max_width:
                        line = trial_ch
                    else:
                        lines.append(line)
                        line = ch
        if line:
            lines.append(line)
        return lines

    lines = []
    line = ""
    for ch in value:
        trial = line + ch
        if not line or measure(lang, trial, size, bold) <= max_width:
            line = trial
        else:
            lines.append(line)
            line = ch
    if line:
        lines.append(line)
    return lines


def put(
    page: fitz.Page,
    lang: str,
    x: float,
    top: float,
    value: str,
    size: float,
    color=WHITE,
    bold: bool = False,
    width: float | None = None,
    line_height: float = 1.22,
    align: str = "left",
) -> None:
    if width is None:
        baseline = top + size
        page.insert_text(
            (x, baseline),
            value,
            fontsize=size,
            fontname=fontname(lang, bold),
            fontfile=str(fontfile(lang, bold)),
            color=color,
        )
        return

    lines = wrap_text(lang, value, width, size, bold)
    baseline = top + size
    for line in lines:
        if line:
            tx = x
            if align == "center":
                tx = x + (width - measure(lang, line, size, bold)) / 2
            elif align == "right":
                tx = x + width - measure(lang, line, size, bold)
            page.insert_text(
                (tx, baseline),
                line,
                fontsize=size,
                fontname=fontname(lang, bold),
                fontfile=str(fontfile(lang, bold)),
                color=color,
            )
        baseline += size * line_height


def draw_poly(page: fitz.Page, points: list[tuple[float, float]], fill: tuple[float, float, float]) -> None:
    shape = page.new_shape()
    shape.draw_polyline([fitz.Point(x, y) for x, y in points])
    shape.finish(color=None, fill=fill, closePath=True)
    shape.commit()


def draw_pill(page: fitz.Page, x: float, y: float, w: float, h: float, fill: tuple[float, float, float]) -> None:
    radius = h / 2
    page.draw_rect(fitz.Rect(x + radius, y, x + w - radius, y + h), color=None, fill=fill)
    page.draw_oval(fitz.Rect(x, y, x + h, y + h), color=None, fill=fill)
    page.draw_oval(fitz.Rect(x + w - h, y, x + w, y + h), color=None, fill=fill)


def get_text_lines(page: fitz.Page) -> list[dict]:
    lines = []
    raw = page.get_text("dict")
    for block in raw["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            spans = [s for s in line["spans"] if s["text"].strip()]
            if not spans:
                continue
            text = "".join(s["text"] for s in spans).strip()
            lines.append(
                {
                    "text": text,
                    "bbox": fitz.Rect(line["bbox"]),
                    "size": max(s["size"] for s in spans),
                    "color": spans[0]["color"],
                }
            )
    return lines


def avg_color(image: Image.Image, x: float, y: float, scale: float) -> tuple[int, int, int]:
    px = max(0, min(image.width - 1, int(round(x * scale))))
    py = max(0, min(image.height - 1, int(round(y * scale))))
    samples = []
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            sx = max(0, min(image.width - 1, px + dx))
            sy = max(0, min(image.height - 1, py + dy))
            samples.append(image.getpixel((sx, sy)))
    return tuple(int(sum(pixel[i] for pixel in samples) / len(samples)) for i in range(3))


def sample_fill(page: fitz.Page, image: Image.Image, rect: fitz.Rect, scale: float = 2.0) -> tuple[float, float, float]:
    cx = (rect.x0 + rect.x1) / 2
    cy = (rect.y0 + rect.y1) / 2
    points = [
        (rect.x0 - 3, cy),
        (rect.x1 + 3, cy),
        (cx, rect.y0 - 3),
        (cx, rect.y1 + 3),
        (rect.x0 + 2, rect.y0 + 2),
        (rect.x1 - 2, rect.y0 + 2),
        (rect.x0 + 2, rect.y1 - 2),
        (rect.x1 - 2, rect.y1 - 2),
    ]
    colors = []
    for x, y in points:
        if 0 <= x < page.rect.width and 0 <= y < page.rect.height:
            colors.append(avg_color(image, x, y, scale))
    if not colors:
        return rgb("#061512")
    # Median by brightness gives a stable nearby background and avoids most white glyph samples.
    colors.sort(key=lambda c: c[0] + c[1] + c[2])
    chosen = colors[len(colors) // 2]
    return tuple(v / 255 for v in chosen)


def redact_all_text(doc: fitz.Document) -> None:
    for page in doc:
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        lines = get_text_lines(page)
        for line in lines:
            rect = fitz.Rect(line["bbox"])
            pad_x = 1.2
            pad_y = 1.2
            rect.x0 = max(0, rect.x0 - pad_x)
            rect.y0 = max(0, rect.y0 - pad_y)
            rect.x1 = min(page.rect.width, rect.x1 + pad_x)
            rect.y1 = min(page.rect.height, rect.y1 + pad_y)
            page.add_redact_annot(rect, fill=sample_fill(page, image, rect))
        page.apply_redactions(
            images=fitz.PDF_REDACT_IMAGE_NONE,
            graphics=fitz.PDF_REDACT_LINE_ART_NONE,
            text=fitz.PDF_REDACT_TEXT_REMOVE,
        )


def footer(page: fitz.Page, lang: str, page_no: int) -> None:
    # Redactions near the footer can cover the original red slash. Repaint the original
    # slash first, then put the footer back at the source position.
    draw_poly(page, [(960, 540), (828, 540), (872, 514), (960, 514)], RED_DARK)
    put(page, lang, 762.6, 522.1, f"SHOUYE PROJECT INTRODUCTION  ·  {page_no:02d}", 8.5, MUTED, True)


def section(page: fitz.Page, lang: str, value: str) -> None:
    put(page, lang, 42, 35.4, value, 10, GOLD, True)


def draw_cover(page: fitz.Page, lang: str) -> None:
    data = DATA[lang]["cover"]
    put(page, lang, 58, 182.6, data["edition"], 11, GOLD, True)
    put(page, lang, 58, 226.8, data["title"], {"tc": 42, "en": 25.5, "ko": 36}[lang], WHITE, True, width=410)
    put(page, lang, 64, 274.9, data["subtitle"], {"tc": 18, "en": 15, "ko": 16}[lang], WHITE, True, width=380)
    put(page, lang, 63, 388.0, data["body"], {"tc": 10.0, "en": 7.1, "ko": 7.9}[lang], MUTED, True, width=350, line_height=1.2)
    # Repaint the original pill buttons to remove small color patches left by text redaction.
    page.draw_rect(fitz.Rect(50, 410, 478, 441), color=None, fill=rgb("#0a1f1c"))
    pill_specs = {
        "tc": [(59, 414, 84, RED), (153, 414, 74, PILL_DARK), (240, 414, 74, PILL_DARK), (326, 414, 74, PILL_DARK)],
        "en": [(59, 414, 98, RED), (165, 414, 88, PILL_DARK), (260, 414, 104, PILL_DARK), (371, 414, 98, PILL_DARK)],
        "ko": [(59, 414, 92, RED), (160, 414, 80, PILL_DARK), (248, 414, 88, PILL_DARK), (344, 414, 86, PILL_DARK)],
    }[lang]
    for x, y, w, fill in pill_specs:
        draw_pill(page, x, y, w, 22, fill)
    chip_font = {"tc": 8.1, "en": 5.15, "ko": 6.15}[lang]
    for (x, _y, width, _fill), label in zip(pill_specs, data["chips"]):
        put(page, lang, x, 421.3, label, chip_font, WHITE, True, width=width, align="center")
    put(page, lang, 849.5, 457.0, "shouye.fun", 10.5, FOOTER, True)


def draw_founder(page: fitz.Page, lang: str) -> None:
    data = DATA[lang]["founder"]
    put(page, lang, 58, 63, data["label"], 14, GOLD_2, True, width=260)
    put(page, lang, 58, 114.5, data["title"], {"tc": 46, "en": 34, "ko": 36}[lang], WHITE_2, True, width=360)
    put(page, lang, 58, 193.1, data["name"], 31 if lang != "en" else 25, WHITE_2, True)
    secondary = data.get("name_secondary", "여택우")
    secondary_lang = "ko" if lang in {"tc", "en"} else "en"
    put(page, secondary_lang, 210 if lang == "tc" else 170 if lang == "en" else 170, 195, "/  " + secondary, 20, GOLD_2, False)
    put(page, lang, 58, 228.6, data["subtitle"], 13 if lang != "en" else 10.8, MUTED_2, False, width=540)
    y = 264.8
    for paragraph in data["body"]:
        put(page, lang, 58, y, paragraph, 12 if lang != "en" else 9.5, BODY, False, width=545, line_height=1.33)
        y += (37 if lang == "tc" else 41 if lang == "en" else 42)
    for key, label, x, y in [
        (data["tags"][0][0], data["tags"][0][1], 70, 419.2),
        (data["tags"][1][0], data["tags"][1][1], 358, 419.2),
        (data["tags"][2][0], data["tags"][2][1], 70, 457.2),
        (data["tags"][3][0], data["tags"][3][1], 358, 457.2),
    ]:
        put(page, lang, x, y, key, 12.5, GOLD_2 if key != "EXP" else rgb("#ffc000"), True)
        label_x = x + (68 if len(key) >= 6 else 42)
        put(page, lang, label_x, y, label, 11.2 if lang != "en" else 9.2, WHITE_2, True, width=205)
    put(page, lang, 691, 419.2, data["name"], 11.5, WHITE_2, True)
    put(page, secondary_lang, 744, 417.0, "/  " + secondary, 12, WHITE_2, False)
    put(page, lang, 42, 504.4, "SHOUYE PROJECT INTRODUCTION | FOUNDER PROFILE", 10, MUTED_2, False)
    put(page, lang, 847.6, 513.4, "shouye.fun", 10, FOOTER, False)


def draw_toc(page: fitz.Page, lang: str) -> None:
    section(page, lang, "CONTENTS")
    footer(page, lang, 2)
    put(page, lang, 58, 79.1, "目錄" if lang == "tc" else "Contents" if lang == "en" else "목차", 36 if lang != "en" else 32, WHITE, True)
    for idx, (num, title, desc) in enumerate(DATA[lang]["contents"]):
        col = idx % 2
        row = idx // 2
        x_num = 82 + col * 400
        x_text = 144 + col * 400
        y_num = 191.4 + row * 84
        y_title = 193.1 + row * 84
        y_desc = 219.9 + row * 84
        put(page, lang, x_num, y_num, num, 24, RED if col == 0 else GOLD, True)
        put(page, lang, x_text, y_title, title, 15 if lang != "en" else 12.2, WHITE, True, width=230)
        put(page, lang, x_text, y_desc, desc, 9 if lang != "en" else 7.3, MUTED, False, width=260)


def draw_position(page: fitz.Page, lang: str) -> None:
    data = DATA[lang]["position"]
    section(page, lang, "01  " + DATA[lang]["contents"][0][1])
    footer(page, lang, 3)
    put(page, lang, 58, 82.5, data["title"], 32 if lang != "en" else 26, WHITE, True, width=610)
    put(page, lang, 58, 168.4, data["body"], 12.2 if lang != "en" else 9.5, MUTED, False, width=520, line_height=1.28)
    put(page, lang, 640, 153.9, data["highlight"][0], 42, RED, True)
    put(page, lang, 640, 214.3, data["highlight"][1], 15 if lang != "en" else 11.5, WHITE, True, width=200)
    put(page, lang, 640, 236.9, data["highlight"][2], 9.5 if lang != "en" else 7.6, MUTED, False, width=205)
    positions = [(80, 334.5, 381.9), (360, 334.5, 381.9), (640, 333.5, 381.9)]
    for (x, y_title, y_body), (title, body) in zip(positions, data["cards"]):
        put(page, lang, x, y_title, title, 18 if lang != "en" else 12.5, GOLD if x == 640 else RED if x == 80 else WHITE, True, width=190)
        put(page, lang, x, y_body, body, 9.2 if lang != "en" else 7.0, MUTED, False, width=195, line_height=1.3)


def draw_why(page: fitz.Page, lang: str) -> None:
    data = DATA[lang]["why"]
    section(page, lang, "02  " + DATA[lang]["contents"][1][1])
    footer(page, lang, 4)
    put(page, lang, 58, 85.9, data["title"], 28 if lang != "en" else 22, WHITE, True, width=820)
    put(page, lang, 58, 168.3, data["body"], 11.6 if lang != "en" else 8.6, MUTED, False, width=760, line_height=1.28)
    row_y = [230.4, 300.4, 370.4, 438.4]
    for idx, (row, y) in enumerate(zip(data["rows"], row_y)):
        put(page, lang, 104, y, row[0], 13.5 if lang != "en" else 9.3, RED if idx == 0 else WHITE, True, width=150)
        put(page, lang, 292, y + 2.1, row[1], 10.2 if lang != "en" else 7.1, WHITE, True, width=220)
        put(page, lang, 566, y + 2.1, row[2], 10.2 if lang != "en" else 7.1, WHITE if idx == 3 else MUTED, False, width=250)
    put(page, lang, 76, 485.1, data["example"], 10.2 if lang != "en" else 7.4, GOLD, True, width=810)


def draw_model(page: fitz.Page, lang: str) -> None:
    data = DATA[lang]["model"]
    section(page, lang, "03  " + DATA[lang]["contents"][2][1])
    footer(page, lang, 5)
    put(page, lang, 58, 82.5, data["title"], 32 if lang != "en" else 25, WHITE, True, width=850)
    put(page, lang, 58, 168.4, data["body"], 12.0 if lang != "en" else 8.7, MUTED, False, width=720, line_height=1.28)
    put(page, lang, 88, 249.4, data["left"][0], 24 if lang != "en" else 17, RED, True, width=330)
    put(page, lang, 88, 307.1, data["left"][1], 10.3 if lang != "en" else 7.7, MUTED, False, width=320, line_height=1.3)
    put(page, lang, 552, 249.4, data["right"][0], 24 if lang != "en" else 17, GOLD, True, width=330)
    put(page, lang, 552, 307.1, data["right"][1], 10.3 if lang != "en" else 7.7, MUTED, False, width=320, line_height=1.3)
    for x, num, label in zip([129, 303, 477, 651], ["1", "2", "3", "4"], DATA[lang]["model"]["steps"]):
        put(page, lang, x, 441.7, num, 12, WHITE, True)
        put(page, lang, x - 42, 480.7, label, 8.3 if lang != "en" else 6.7, MUTED, True, width=92, align="center")


def draw_roles(page: fitz.Page, lang: str) -> None:
    data = DATA[lang]["roles"]
    section(page, lang, "04  " + DATA[lang]["contents"][3][1])
    footer(page, lang, 6)
    put(page, lang, 58, 83.4, data["title"], 31 if lang != "en" else 23.5, WHITE, True, width=820)
    for x, role in zip([82, 374, 666], data["roles"]):
        put(page, lang, x, 196.8, role[0], 20 if lang != "en" else 13.5, RED if x == 82 else GOLD if x == 666 else WHITE, True, width=190)
        put(page, lang, x, 237.4, role[1], 16 if lang != "en" else 10.5, WHITE, True, width=190)
        put(page, lang, x, 280.9, role[2], 9.3 if lang != "en" else 7.1, MUTED, False, width=195, line_height=1.3)
    put(page, lang, 58, 396.5, data["platform"][0], 18 if lang != "en" else 13.5, GOLD, True)
    put(page, lang, 58, 436.5, data["platform"][1], 12.3 if lang != "en" else 9.0, WHITE, False, width=690, line_height=1.25)


def draw_merchant(page: fitz.Page, lang: str) -> None:
    data = DATA[lang]["merchant"]
    section(page, lang, "05  " + DATA[lang]["contents"][4][1])
    footer(page, lang, 7)
    put(page, lang, 58, 85.9, data["title"], 28 if lang != "en" else 18.5, WHITE, True, width=760)
    put(page, lang, 58, 166.3, data["body"], 10.8 if lang != "en" else 7.6, MUTED, False, width=690)
    headers = data["headers"]
    put(page, lang, 72, 198.4, headers[0], 10 if lang != "en" else 7.2, WHITE, True)
    put(page, lang, 350, 198.4, headers[1], 10 if lang != "en" else 7.2, WHITE, True, width=70, align="center")
    put(page, lang, 570, 198.4, headers[2], 10 if lang != "en" else 7.2, WHITE, True, width=100, align="center")
    ys = [237.9, 282.9, 327.9, 372.9, 417.9]
    for row, y in zip(data["rows"], ys):
        put(page, lang, 72, y, row[0], 9.5 if lang != "en" else 6.8, MUTED, True, width=120)
        put(page, lang, 335, y - 6, row[1], 8.7 if lang != "en" else 6.6, MUTED, False, width=85, align="center", line_height=1.2)
        put(page, lang, 565, y - 6, row[2], 8.7 if lang != "en" else 6.6, MUTED, False, width=105, align="center", line_height=1.2)
    put(page, lang, 808, 221.1, data["boundary_title"], 15 if lang != "en" else 9.5, GOLD, True, width=75)
    put(page, lang, 808, 271.8, data["boundary"], 8.6 if lang != "en" else 6.1, MUTED, False, width=70, line_height=1.35)
    put(page, lang, 61.4, 458.5, data["activity"], 7.2 if lang != "en" else 5.2, FOOTER, False, width=630, line_height=1.25)


def draw_culture(page: fitz.Page, lang: str) -> None:
    data = DATA[lang]["culture"]
    section(page, lang, "06  " + DATA[lang]["contents"][5][1])
    footer(page, lang, 8)
    title_size = {"tc": 27, "en": 18.2, "ko": 22}[lang]
    put(page, lang, 58, 86.8, data["title"], title_size, WHITE, True, width=780)
    put(page, lang, 58, 170.3, data["body"], 11.0 if lang != "en" else 8.1, MUTED, False, width=790, line_height=1.3)
    for x, card in zip([94, 304, 514, 724], data["cards"]):
        put(page, lang, x, 276.0, card[0], 21 if lang != "en" else 13.8, GOLD, True, width=140)
        put(page, lang, x, 312.8, card[1], 9.3 if lang != "en" else 6.9, MUTED, False, width=125, line_height=1.35)
    put(page, lang, 250, 435.0, data["site"], 10.5 if lang != "en" else 8.5, WHITE, True)
    put(page, lang, 250, 458.3, data["email"], 9.5 if lang != "en" else 8.0, MUTED, False)


DRAWERS = [
    draw_cover,
    draw_founder,
    draw_toc,
    draw_position,
    draw_why,
    draw_model,
    draw_roles,
    draw_merchant,
    draw_culture,
]


def build(lang: str) -> Path:
    doc = fitz.open(SOURCE)
    redact_all_text(doc)
    for index, page in enumerate(doc):
        DRAWERS[index](page, lang)
    if hasattr(doc, "subset_fonts"):
        doc.subset_fonts()
    out = OUT / f"shouye-project-user-base-{DATA[lang]['suffix']}.pdf"
    doc.save(out, garbage=4, deflate=True, clean=True)
    doc.close()
    return out


def render_contact(paths: Iterable[Path]) -> None:
    cols = 3
    for path in paths:
        doc = fitz.open(path)
        thumbs = []
        for page in doc:
            pix = page.get_pixmap(matrix=fitz.Matrix(0.42, 0.42), alpha=False)
            thumbs.append(Image.frombytes("RGB", [pix.width, pix.height], pix.samples))
        rows = (len(thumbs) + cols - 1) // cols
        w, h = thumbs[0].size
        sheet = Image.new("RGB", (cols * w, rows * h), (235, 235, 235))
        for i, thumb in enumerate(thumbs):
            sheet.paste(thumb, ((i % cols) * w, (i // cols) * h))
        sheet.save(TMP / f"{path.stem}-contact.png")


def main() -> None:
    outputs = [build(lang) for lang in ("tc", "en", "ko")]
    render_contact(outputs)
    for path in outputs:
        doc = fitz.open(path)
        print(path, path.stat().st_size, doc.page_count, min(len(page.get_text("text").strip()) for page in doc))


if __name__ == "__main__":
    main()
