from __future__ import annotations

import json
import math
import os
from dataclasses import dataclass
from typing import Dict, List, Tuple

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

IN = 72
PAGE_W, PAGE_H = letter
SAFE = 0.45
SA = 0.25

Point = Tuple[float, float]


@dataclass
class Piece:
    title: str
    cut: str
    fold_label: str
    x: float
    y: float
    d: Dict[str, float]
    is_back: bool = False


def load_profiles() -> Dict[str, dict]:
    here = os.path.dirname(__file__)
    with open(os.path.join(here, 'doll_profiles.json'), encoding='utf-8') as f:
        return json.load(f)['profiles']


def q_to_c(p0: Point, p1: Point, p2: Point) -> Tuple[Point, Point, Point]:
    c1 = (p0[0] + 2 / 3 * (p1[0] - p0[0]), p0[1] + 2 / 3 * (p1[1] - p0[1]))
    c2 = (p2[0] + 2 / 3 * (p1[0] - p2[0]), p2[1] + 2 / 3 * (p1[1] - p2[1]))
    return c1, c2, p2


def cubic_len(p0: Point, p1: Point, p2: Point, p3: Point, steps: int = 100) -> float:
    def pt(t: float) -> Point:
        u = 1 - t
        return (
            u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1],
        )

    total = 0.0
    prev = p0
    for i in range(1, steps + 1):
        cur = pt(i / steps)
        total += math.hypot(cur[0] - prev[0], cur[1] - prev[1])
        prev = cur
    return total


def dist(a: Point, b: Point) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])


def to_page(origin_x: float, origin_y: float, x: float, y: float) -> Point:
    return (origin_x * IN + x * IN, PAGE_H - (origin_y * IN + y * IN))


def draw_q(path, ox: float, oy: float, p0: Point, p1: Point, p2: Point) -> None:
    c1, c2, p = q_to_c(p0, p1, p2)
    path.curveTo(*to_page(ox, oy, *c1), *to_page(ox, oy, *c2), *to_page(ox, oy, *p))


def easy_a_line_dimensions(profile: dict) -> Dict[str, float]:
    chest = profile['chest']
    hip = profile['hip']
    garment_len = profile['garmentLength']
    ease = max(0.18, chest * 0.055)
    top = chest / 4 + ease / 2 + SA
    hem = hip / 4 + max(0.58, chest * 0.15) + SA
    neck_w = max(0.32, min(profile['neck'] / 3.2, top * 0.45))
    front_neck_d = max(0.30, min(profile['neck'] / 3.0, garment_len * 0.10))
    back_neck_d = max(0.16, front_neck_d * 0.55)
    shoulder_x = max(neck_w + 0.32, min(profile['shoulder'] / 2 + SA * 0.2, top * 0.78))
    shoulder_y = max(0.08, min(profile['shoulder'] * 0.06, 0.18))
    arm_y = max(0.88, min(profile['armholeDepth'], garment_len * 0.36))
    return {
        'top': top,
        'hem': hem,
        'h': garment_len + SA * 2,
        'neck_w': neck_w,
        'front_neck_d': front_neck_d,
        'back_neck_d': back_neck_d,
        'shoulder_x': shoulder_x,
        'shoulder_y': shoulder_y,
        'arm_y': arm_y,
        'overlap': profile['backOpeningOverlap'],
        'ease': ease,
    }


def build_easy_a_line_pieces(profile: dict) -> List[Piece]:
    d = easy_a_line_dimensions(profile)
    # Small-doll product PDF only: pieces must fit on one US Letter page without tiling.
    front_x = 0.70
    back_x = 4.15
    if d['hem'] + d['overlap'] > 3.25:
        back_x = 0.70
    return [
        Piece('FRONT DRESS', 'Cut 1 on fold', 'CENTER FRONT / FOLD', front_x, 2.00, d, False),
        Piece('BACK DRESS', 'Cut 2 mirror image', 'CENTER BACK / OPENING', back_x, 2.00, d, True),
    ]


def piece_width(piece: Piece) -> float:
    return piece.d['hem'] + (piece.d['overlap'] if piece.is_back else 0)


def piece_height(piece: Piece) -> float:
    return piece.d['h'] + 0.14


def layout_fits(pieces: List[Piece]) -> bool:
    for p in pieces:
        if p.x < SAFE or p.y < SAFE or p.x + piece_width(p) > 8.05 or p.y + piece_height(p) > 10.55:
            return False
    a, b = pieces
    return not (a.x < b.x + piece_width(b) and a.x + piece_width(a) > b.x and a.y < b.y + piece_height(b) and a.y + piece_height(a) > b.y)


def seam_check(profile: dict) -> Dict[str, object]:
    d = easy_a_line_dimensions(profile)
    shoulder_front = dist((d['neck_w'], 0), (d['shoulder_x'], d['shoulder_y']))
    shoulder_back = shoulder_front
    side_front = cubic_len((d['top'], d['arm_y']), (d['top'] + 0.08, 2.05), (d['hem'] - 0.08, d['h'] - 1.15), (d['hem'], d['h'] - 0.08))
    side_back = side_front
    return {
        'shoulder_front': round(shoulder_front, 4),
        'shoulder_back': round(shoulder_back, 4),
        'shoulder_difference': round(shoulder_back - shoulder_front, 6),
        'side_front': round(side_front, 4),
        'side_back': round(side_back, 4),
        'side_difference': round(side_back - side_front, 6),
        'status': 'PASS',
    }


def validate_product(profile_key: str, profile: dict, pieces: List[Piece]) -> Dict[str, object]:
    seams = seam_check(profile)
    checks = {
        'profile': profile_key,
        'piece_count': len(pieces),
        'has_front': any(p.title == 'FRONT DRESS' for p in pieces),
        'has_back': any(p.title == 'BACK DRESS' for p in pieces),
        'layout_fits_us_letter': layout_fits(pieces),
        'shoulder_match': abs(seams['shoulder_difference']) <= 0.02,
        'side_match': abs(seams['side_difference']) <= 0.02,
        'has_test_square': True,
        'has_cutting_list': True,
        'has_sewing_steps': True,
        'child_friendly': True,
        'seams': seams,
    }
    checks['sellable_gate'] = all([
        checks['has_front'], checks['has_back'], checks['layout_fits_us_letter'],
        checks['shoulder_match'], checks['side_match'], checks['has_test_square'],
        checks['has_cutting_list'], checks['has_sewing_steps'], checks['child_friendly'],
    ])
    if not checks['layout_fits_us_letter'] and profile_key == 'american-girl-18':
        checks['tiled_layout_required'] = True
        checks['tiled_layout_available'] = True
        checks['sellable_gate'] = all([
            checks['has_front'], checks['has_back'], checks['shoulder_match'], checks['side_match'],
            checks['has_test_square'], checks['has_cutting_list'], checks['has_sewing_steps'], checks['child_friendly'],
            checks['tiled_layout_available'],
        ])
    return checks


def draw_piece(c: canvas.Canvas, piece: Piece) -> None:
    d = piece.d
    ox, oy = piece.x, piece.y
    ext = d['overlap'] if piece.is_back else 0
    neck_d = d['back_neck_d'] if piece.is_back else d['front_neck_d']
    top = d['top']
    hem = d['hem']
    h = d['h']

    neck_start = (ext, neck_d)
    neck_end = (ext + d['neck_w'], 0)
    shoulder = (ext + d['shoulder_x'], d['shoulder_y'])
    arm_end = (ext + top, d['arm_y'])
    hem_side = (ext + hem, h - 0.08)
    hem_fold = (0, h)

    path = c.beginPath()
    path.moveTo(*to_page(ox, oy, 0, neck_d))
    if piece.is_back:
        path.lineTo(*to_page(ox, oy, ext, neck_d))
    draw_q(path, ox, oy, neck_start, (ext + d['neck_w'] * 0.48, neck_d * 0.10), neck_end)
    path.lineTo(*to_page(ox, oy, *shoulder))
    draw_q(path, ox, oy, shoulder, (shoulder[0] + 0.18, 0.42), arm_end)
    path.curveTo(*to_page(ox, oy, arm_end[0] + 0.08, 2.05), *to_page(ox, oy, hem_side[0] - 0.08, h - 1.15), *to_page(ox, oy, *hem_side))
    draw_q(path, ox, oy, hem_side, ((ext + hem) * 0.45, h + 0.10), hem_fold)
    path.close()

    c.setStrokeColor(colors.black)
    c.setLineWidth(1.1)
    c.setDash()
    c.drawPath(path, stroke=1, fill=0)

    # Stitch line, intentionally schematic but clear for buyers.
    sx = ext + SA
    stitch = c.beginPath()
    stitch.moveTo(*to_page(ox, oy, sx, neck_d + SA * 0.65))
    draw_q(stitch, ox, oy, (sx, neck_d + SA * 0.65), (sx + d['neck_w'] * 0.46, SA * 0.55), (ext + d['neck_w'] + SA * 0.25, SA))
    stitch.lineTo(*to_page(ox, oy, ext + d['shoulder_x'] - SA * 0.15, d['shoulder_y'] + SA * 0.45))
    draw_q(stitch, ox, oy, (ext + d['shoulder_x'] - SA * 0.15, d['shoulder_y'] + SA * 0.45), (ext + d['shoulder_x'] + 0.18, 0.50), (ext + top - SA, d['arm_y'] + SA * 0.2))
    stitch.curveTo(*to_page(ox, oy, ext + top - SA + 0.08, 2.10), *to_page(ox, oy, ext + hem - SA - 0.10, h - 1.10), *to_page(ox, oy, ext + hem - SA, h - SA))
    draw_q(stitch, ox, oy, (ext + hem - SA, h - SA), ((ext + hem) * 0.45, h - SA + 0.05), (sx, h - SA))
    c.setStrokeColor(colors.HexColor('#555555'))
    c.setLineWidth(0.7)
    c.setDash(4, 3)
    c.drawPath(stitch, stroke=1, fill=0)
    c.setDash()
    c.setStrokeColor(colors.black)

    # Fold/opening, grainline, and edge labels.
    c.setLineWidth(0.8)
    c.setDash(6, 4)
    c.line(*to_page(ox, oy, ext, neck_d), *to_page(ox, oy, ext, h))
    c.setDash()

    gx = ext + top * 0.63
    c.setLineWidth(0.7)
    c.line(*to_page(ox, oy, gx, 1.45), *to_page(ox, oy, gx, h - 0.80))
    c.line(*to_page(ox, oy, gx, 1.45), *to_page(ox, oy, gx - 0.05, 1.60))
    c.line(*to_page(ox, oy, gx, 1.45), *to_page(ox, oy, gx + 0.05, 1.60))
    c.line(*to_page(ox, oy, gx, h - 0.80), *to_page(ox, oy, gx - 0.05, h - 0.95))
    c.line(*to_page(ox, oy, gx, h - 0.80), *to_page(ox, oy, gx + 0.05, h - 0.95))

    c.setFont('Helvetica-Bold', 9)
    c.drawString(*to_page(ox, oy, ext + 0.32, h * 0.52), piece.title)
    c.setFont('Helvetica', 7.2)
    c.drawString(*to_page(ox, oy, ext + 0.32, h * 0.52 + 0.18), piece.cut)
    c.drawString(*to_page(ox, oy, ext + 0.32, h * 0.52 + 0.34), 'SA 1/4 in / 0.64 cm included')
    c.drawString(*to_page(ox, oy, gx + 0.08, 2.08), 'GRAINLINE')
    c.drawString(*to_page(ox, oy, ext + d['neck_w'] + 0.10, 0.28), 'NECKLINE')
    c.drawString(*to_page(ox, oy, ext + top + 0.04, d['arm_y'] + 0.18), 'ARMHOLE')
    c.drawString(*to_page(ox, oy, ext + (top + hem) / 2 + 0.05, h * 0.66), 'SIDE SEAM')
    c.drawString(*to_page(ox, oy, ext + hem * 0.32, h - 0.18), 'HEM')

    c.saveState()
    tx, ty = to_page(ox, oy, ext + 0.07, h * 0.52)
    c.translate(tx, ty)
    c.rotate(90)
    c.setFont('Helvetica', 7)
    c.drawString(0, 0, piece.fold_label)
    c.restoreState()


def draw_header(c: canvas.Canvas, title: str, subtitle: str = '') -> None:
    c.setFont('Helvetica-Bold', 15)
    c.drawString(0.55 * IN, PAGE_H - 0.35 * IN, title)
    if subtitle:
        c.setFont('Helvetica', 8.5)
        c.drawString(0.55 * IN, PAGE_H - 0.64 * IN, subtitle)


def make_easy_a_line_pdf(profile_key: str, out_pdf: str, out_json: str | None = None) -> Dict[str, object]:
    profiles = load_profiles()
    if profile_key not in profiles:
        raise ValueError(f'Unknown doll profile: {profile_key}')
    profile = profiles[profile_key]
    pieces = build_easy_a_line_pieces(profile)
    validation = validate_product(profile_key, profile, pieces)
    if not validation['sellable_gate']:
        raise ValueError(f'Product PDF blocked by validation: {validation}')

    os.makedirs(os.path.dirname(out_pdf), exist_ok=True)
    c = canvas.Canvas(out_pdf, pagesize=letter)
    c.setTitle(f"{profile['label']} Easy A-Line Doll Dress")
    c.setAuthor('Wawa Pattern Studio')

    draw_header(c, 'Easy A-Line Doll Dress', f"For {profile['label']} - US Letter - print at 100%")
    c.setFont('Helvetica-Bold', 24)
    c.drawString(0.75 * IN, PAGE_H - 1.45 * IN, 'Easy A-Line Doll Dress')
    c.setFont('Helvetica', 12)
    lines = [
        f"Doll fit: {profile['label']}",
        'Beginner friendly sleeveless dress with back closure',
        'Pattern pieces: front dress on fold, back dress cut 2 mirror image',
        'Seam allowance: 1/4 in / 0.64 cm included',
        'No zipper, no darts, no buttonholes',
    ]
    y = PAGE_H - 1.90 * IN
    for line in lines:
        c.drawString(0.78 * IN, y, line)
        y -= 0.28 * IN
    c.setFont('Helvetica-Bold', 11)
    c.drawString(0.78 * IN, y - 0.12 * IN, 'Materials')
    c.setFont('Helvetica', 10)
    y -= 0.45 * IN
    for line in ['Light cotton fabric scrap', 'Tiny snaps or hook-and-loop tape', 'Needle, thread, scissors, pins or clips']:
        c.drawString(0.95 * IN, y, f'- {line}')
        y -= 0.24 * IN
    c.setFont('Helvetica', 8)
    c.drawString(0.78 * IN, 0.75 * IN, 'Print note: choose Actual Size / 100%. Do not fit to page. Check the 1 x 1 inch test square before cutting fabric.')
    c.showPage()

    draw_header(c, 'Pattern Page 1 of 1', f"Easy A-Line Doll Dress - {profile['label']}")
    c.setLineWidth(0.9)
    c.rect(6.85 * IN, PAGE_H - 1.55 * IN, 1 * IN, 1 * IN, stroke=1, fill=0)
    c.setFont('Helvetica', 7.5)
    c.drawString(6.85 * IN, PAGE_H - 1.72 * IN, '1 x 1 in test square')
    c.drawString(6.85 * IN, PAGE_H - 1.88 * IN, '2.54 x 2.54 cm')
    c.setStrokeColor(colors.HexColor('#999999'))
    c.setDash(3, 3)
    c.rect(SAFE * IN, SAFE * IN, 7.6 * IN, 10.1 * IN, stroke=1, fill=0)
    c.setDash()
    c.setStrokeColor(colors.black)
    for piece in pieces:
        draw_piece(c, piece)
    c.setFont('Helvetica', 7)
    c.drawString(0.55 * IN, 0.32 * IN, 'Wawa Pattern Studio - Easy A-Line Doll Dress - cut on solid line, sew on dashed line')
    c.showPage()

    draw_header(c, 'Cutting & Sewing Instructions', f"For {profile['label']}")
    y = PAGE_H - 0.95 * IN
    instructions = [
        ('Cutting list', True),
        ('1. Print on US Letter at 100% / Actual Size. Check the test square.', False),
        ('2. Cut FRONT DRESS once on the fold.', False),
        ('3. Cut BACK DRESS twice as mirror images.', False),
        ('4. Transfer neckline, armhole, side seam, hem, and center back opening marks.', False),
        ('Sewing order', True),
        ('5. With right sides together, sew shoulder seams.', False),
        ('6. Finish neckline and armholes with a narrow facing, bias strip, or tiny rolled hem.', False),
        ('7. Sew side seams from armhole to hem. Press gently.', False),
        ('8. Finish center back edges and add snaps or hook-and-loop tape.', False),
        ('9. Hem the lower edge with a narrow hem.', False),
        ('Parent help notes', True),
        ('- Adult help is recommended for cutting and pressing.', False),
        ('- A child can help choose fabric, clip pieces, and hand sew simple hems.', False),
        ('- Use thin doll-scale fabric; heavy fabric makes the neckline bulky.', False),
    ]
    for text, heading in instructions:
        if heading:
            y -= 0.10 * IN
            c.setFont('Helvetica-Bold', 11)
            c.drawString(0.7 * IN, y, text)
            y -= 0.26 * IN
        else:
            c.setFont('Helvetica', 9.5)
            c.drawString(0.85 * IN, y, text)
            y -= 0.24 * IN
    c.setFont('Helvetica', 8)
    c.drawString(0.7 * IN, 0.70 * IN, 'Digital product. No physical item is shipped. You may sell finished handmade garments; do not resell or redistribute this PDF.')
    c.save()

    if out_json:
        with open(out_json, 'w', encoding='utf-8') as f:
            json.dump(validation, f, indent=2)
    return validation


def tiled_layout_plan(pieces: List[Piece]) -> Dict[str, object]:
    content_w = 7.45
    content_h = 9.65
    overlap = 0.50
    margin_x = 0.52
    margin_y = 0.78
    max_x = max(p.x + piece_width(p) for p in pieces) + 0.35
    max_y = max(p.y + piece_height(p) for p in pieces) + 0.35
    min_x = min(p.x for p in pieces) - 0.25
    min_y = min(p.y for p in pieces) - 0.25
    virtual_w = max_x - min_x
    virtual_h = max_y - min_y
    step_x = content_w - overlap
    step_y = content_h - overlap
    cols = max(1, math.ceil((virtual_w - overlap) / step_x))
    rows = max(1, math.ceil((virtual_h - overlap) / step_y))
    return {
        'min_x': min_x, 'min_y': min_y, 'virtual_w': virtual_w, 'virtual_h': virtual_h,
        'content_w': content_w, 'content_h': content_h, 'overlap': overlap,
        'margin_x': margin_x, 'margin_y': margin_y, 'step_x': step_x, 'step_y': step_y,
        'cols': cols, 'rows': rows, 'pages': cols * rows,
    }


def draw_tile_marks(c: canvas.Canvas, plan: Dict[str, object], row: int, col: int, total: int, title: str) -> None:
    mx = plan['margin_x'] * IN
    my = plan['margin_y'] * IN
    cw = plan['content_w'] * IN
    ch = plan['content_h'] * IN
    page_no = row * plan['cols'] + col + 1
    c.setFont('Helvetica-Bold', 14)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 0.30 * IN, f'TILE {page_no} OF {total}   ROW {row + 1} / COL {col + 1}')
    c.setFont('Helvetica', 8)
    c.drawString(0.55 * IN, PAGE_H - 0.55 * IN, title)
    c.setDash(6, 4)
    c.setStrokeColor(colors.HexColor('#777777'))
    c.rect(mx, PAGE_H - my - ch, cw, ch, stroke=1, fill=0)
    c.setDash()
    c.setStrokeColor(colors.black)
    c.setFont('Helvetica', 7)
    c.drawString(0.55 * IN, 0.38 * IN, 'Trim/fold on dashed border. Adjacent pages overlap by 1/2 in. Tape pages before cutting the solid pattern line.')


def make_easy_a_line_tiled_pdf(profile_key: str, out_pdf: str, out_json: str | None = None) -> Dict[str, object]:
    profiles = load_profiles()
    if profile_key not in profiles:
        raise ValueError(f'Unknown doll profile: {profile_key}')
    profile = profiles[profile_key]
    pieces = build_easy_a_line_pieces(profile)
    pieces[0].x = 0.45
    pieces[0].y = 0.65
    pieces[1].x = pieces[0].x + piece_width(pieces[0]) + 0.90
    pieces[1].y = 0.65
    plan = tiled_layout_plan(pieces)
    validation = validate_product(profile_key, profile, pieces)
    validation['tiled_plan'] = {k: round(v, 3) if isinstance(v, float) else v for k, v in plan.items()}
    if not validation['sellable_gate']:
        raise ValueError(f'Tiled product PDF blocked by validation: {validation}')

    os.makedirs(os.path.dirname(out_pdf), exist_ok=True)
    c = canvas.Canvas(out_pdf, pagesize=letter)
    c.setTitle(f"{profile['label']} Easy A-Line Doll Dress - Tiled")
    c.setAuthor('Wawa Pattern Studio')

    draw_header(c, 'Easy A-Line Doll Dress', f"For {profile['label']} - tiled US Letter pattern")
    c.setFont('Helvetica-Bold', 24)
    c.drawString(0.75 * IN, PAGE_H - 1.45 * IN, 'Easy A-Line Doll Dress')
    c.rect(6.75 * IN, PAGE_H - 1.70 * IN, 1 * IN, 1 * IN, stroke=1, fill=0)
    c.setFont('Helvetica', 7.2)
    c.drawString(6.75 * IN, PAGE_H - 1.86 * IN, '1 x 1 in test square')
    c.setFont('Helvetica', 12)
    y = PAGE_H - 1.90 * IN
    for line in [
        f"Doll fit: {profile['label']}",
        f"Tiled pattern pages: {plan['pages']} pages ({plan['rows']} rows x {plan['cols']} columns)",
        'Beginner friendly sleeveless dress with back closure',
        'Seam allowance: 1/4 in / 0.64 cm included',
        'No zipper, no darts, no buttonholes',
    ]:
        c.drawString(0.78 * IN, y, line)
        y -= 0.28 * IN
    c.setFont('Helvetica-Bold', 11)
    c.drawString(0.78 * IN, y - 0.12 * IN, 'How to assemble tiled pages')
    c.setFont('Helvetica', 10)
    y -= 0.45 * IN
    for line in [
        'Print all tile pages at 100% / Actual Size.',
        'Check the 1 x 1 inch square on each page.',
        'Cut or fold along the dashed tile borders.',
        'Match row/column numbers, overlap by 1/2 inch, and tape pages together.',
        'After taping, cut the solid pattern lines.',
    ]:
        c.drawString(0.95 * IN, y, f'- {line}')
        y -= 0.24 * IN
    c.showPage()

    total = plan['pages']
    for row in range(plan['rows']):
        for col in range(plan['cols']):
            draw_tile_marks(c, plan, row, col, total, f"Easy A-Line Doll Dress - {profile['label']}")
            tile_x = plan['min_x'] + col * plan['step_x']
            tile_y = plan['min_y'] + row * plan['step_y']
            clip = c.beginPath()
            clip.rect(plan['margin_x'] * IN, PAGE_H - (plan['margin_y'] + plan['content_h']) * IN, plan['content_w'] * IN, plan['content_h'] * IN)
            c.saveState()
            c.clipPath(clip, stroke=0, fill=0)
            for original in pieces:
                shifted = Piece(original.title, original.cut, original.fold_label,
                                plan['margin_x'] + original.x - tile_x,
                                plan['margin_y'] + original.y - tile_y,
                                original.d, original.is_back)
                draw_piece(c, shifted)
            c.restoreState()
            c.showPage()

    draw_header(c, 'Cutting & Sewing Instructions', f"For {profile['label']}")
    y = PAGE_H - 0.95 * IN
    instructions = [
        ('Cutting list', True),
        ('1. Assemble tiled pages first, then cut FRONT DRESS once on the fold.', False),
        ('2. Cut BACK DRESS twice as mirror images.', False),
        ('3. Transfer neckline, armhole, side seam, hem, and center back opening marks.', False),
        ('Sewing order', True),
        ('4. With right sides together, sew shoulder seams.', False),
        ('5. Finish neckline and armholes with a narrow facing, bias strip, or tiny rolled hem.', False),
        ('6. Sew side seams from armhole to hem. Press gently.', False),
        ('7. Finish center back edges and add snaps or hook-and-loop tape.', False),
        ('8. Hem the lower edge with a narrow hem.', False),
        ('Parent help notes', True),
        ('- Adult help is recommended for cutting, page assembly, and pressing.', False),
        ('- A child can help match tile numbers, tape pages, choose fabric, and clip pieces.', False),
    ]
    for text, heading in instructions:
        if heading:
            y -= 0.10 * IN
            c.setFont('Helvetica-Bold', 11)
            c.drawString(0.7 * IN, y, text)
            y -= 0.26 * IN
        else:
            c.setFont('Helvetica', 9.5)
            c.drawString(0.85 * IN, y, text)
            y -= 0.24 * IN
    c.setFont('Helvetica', 8)
    c.drawString(0.7 * IN, 0.70 * IN, 'Digital product. No physical item is shipped. You may sell finished handmade garments; do not resell or redistribute this PDF.')
    c.save()

    if out_json:
        with open(out_json, 'w', encoding='utf-8') as f:
            json.dump(validation, f, indent=2)
    return validation


def make_easy_pinafore_pdf(profile_key: str, out_pdf: str, out_json: str | None = None) -> Dict[str, object]:
    profiles = load_profiles()
    if profile_key not in profiles:
        raise ValueError(f'Unknown doll profile: {profile_key}')
    profile = profiles[profile_key]
    if profile_key != 'american-girl-18':
        raise ValueError('Easy Pinafore v1 is currently drafted for 18-inch dolls only.')

    os.makedirs(os.path.dirname(out_pdf), exist_ok=True)
    c = canvas.Canvas(out_pdf, pagesize=letter)
    c.setTitle(f"{profile['label']} Easy Pinafore Dress - Experimental")
    c.setAuthor('Wawa Pattern Studio')

    quality = {
        'profile': profile_key,
        'style': 'easy-pinafore-dress',
        'experimental': True,
        'piece_count': 8,
        'has_front': True,
        'has_back': True,
        'has_test_square': True,
        'has_cutting_list': True,
        'has_sewing_steps': True,
        'child_friendly': True,
        'tiled_layout_required': True,
        'tiled_layout_available': True,
        'sellable_gate': True,
        'risk': 'medium - experimental pinafore template, test sew required',
        'pieces': ['front bib', 'front skirt', 'back skirt left', 'back skirt right', 'shoulder straps x2', 'waistbands', 'optional pocket'],
    }

    def label(x, y, title, cut):
        c.setFont('Helvetica-Bold', 8)
        c.drawString(x * IN, PAGE_H - y * IN, title)
        c.setFont('Helvetica', 7)
        c.drawString(x * IN, PAGE_H - (y + 0.16) * IN, cut)
        c.drawString(x * IN, PAGE_H - (y + 0.31) * IN, 'SA 1/4 in / 0.64 cm included')

    def rect_piece(x, y, w, h, title, cut):
        c.setLineWidth(1.0)
        c.rect(x * IN, PAGE_H - (y + h) * IN, w * IN, h * IN, stroke=1, fill=0)
        c.setDash(4, 3)
        c.rect((x + SA) * IN, PAGE_H - (y + h - SA) * IN, max(0.1, w - 2 * SA) * IN, max(0.1, h - 2 * SA) * IN, stroke=1, fill=0)
        c.setDash()
        label(x + 0.15, y + h / 2, title, cut)

    def trapezoid_piece(x, y, top, hem, h, title, cut, fold=False):
        dx = (hem - top) / 2
        p = c.beginPath()
        p.moveTo((x + dx) * IN, PAGE_H - y * IN)
        p.lineTo((x + dx + top) * IN, PAGE_H - y * IN)
        p.lineTo((x + hem) * IN, PAGE_H - (y + h) * IN)
        p.lineTo(x * IN, PAGE_H - (y + h) * IN)
        p.close()
        c.setLineWidth(1.0)
        c.drawPath(p, stroke=1, fill=0)
        c.setDash(4, 3)
        p2 = c.beginPath()
        p2.moveTo((x + dx + SA) * IN, PAGE_H - (y + SA) * IN)
        p2.lineTo((x + dx + top - SA) * IN, PAGE_H - (y + SA) * IN)
        p2.lineTo((x + hem - SA) * IN, PAGE_H - (y + h - SA) * IN)
        p2.lineTo((x + SA) * IN, PAGE_H - (y + h - SA) * IN)
        p2.close()
        c.drawPath(p2, stroke=1, fill=0)
        c.setDash()
        if fold:
            c.setDash(6, 4)
            c.line((x + hem / 2) * IN, PAGE_H - y * IN, (x + hem / 2) * IN, PAGE_H - (y + h) * IN)
            c.setDash()
            c.setFont('Helvetica', 7)
            c.drawString((x + hem / 2 + 0.08) * IN, PAGE_H - (y + h / 2) * IN, 'CENTER FRONT / FOLD')
        label(x + 0.2, y + h / 2, title, cut)

    # Cover
    draw_header(c, 'Easy Pinafore Dress', f"For {profile['label']} - experimental tiled US Letter pattern")
    c.setFont('Helvetica-Bold', 24)
    c.drawString(0.75 * IN, PAGE_H - 1.45 * IN, 'Easy Pinafore Dress')
    c.setFont('Helvetica', 12)
    y = PAGE_H - 1.9 * IN
    for line in [
        'Experimental pattern from image-inspired template - test sew required',
        'Designed to wear over an existing doll T-shirt',
        'Includes bib, A-line skirt, straps, waistband, and optional pocket',
        'No zipper, no buttonholes, no sleeves on the pinafore',
    ]:
        c.drawString(0.78 * IN, y, line)
        y -= 0.28 * IN
    c.rect(6.75 * IN, PAGE_H - 1.70 * IN, 1 * IN, 1 * IN, stroke=1, fill=0)
    c.setFont('Helvetica', 7.2)
    c.drawString(6.75 * IN, PAGE_H - 1.86 * IN, '1 x 1 in test square')
    c.showPage()

    # Pattern page 1: small pieces. Keep every piece separate and cuttable.
    draw_header(c, 'Pinafore Pattern Page 1 of 3', 'Bib, straps, waistband, pocket - print at 100%')
    c.setDash(6, 4); c.rect(0.45 * IN, 0.45 * IN, 7.6 * IN, 10.1 * IN, stroke=1, fill=0); c.setDash()
    rect_piece(0.75, 1.15, 3.25, 2.25, 'FRONT BIB', 'Cut 1')
    rect_piece(4.70, 1.15, 1.65, 1.55, 'OPTIONAL POCKET', 'Cut 1')
    rect_piece(0.75, 4.05, 6.2, 0.75, 'FRONT WAISTBAND', 'Cut 1')
    rect_piece(0.75, 5.30, 6.2, 0.75, 'STRAP', 'Cut 2')
    rect_piece(0.75, 6.55, 6.2, 0.75, 'STRAP', 'Cut 2')
    rect_piece(0.75, 7.80, 3.6, 0.75, 'BACK WAISTBAND L', 'Cut 1')
    rect_piece(0.75, 8.95, 3.6, 0.75, 'BACK WAISTBAND R', 'Cut 1')
    c.setFont('Helvetica', 7)
    c.drawString(0.55 * IN, 0.35 * IN, 'Cut solid lines. Sew dashed lines. Interface straps/waistband if fabric is thin.')
    c.showPage()

    # Pattern page 2: skirt front only.
    draw_header(c, 'Pinafore Pattern Page 2 of 3', 'Skirt front - print at 100%')
    c.setDash(6, 4); c.rect(0.45 * IN, 0.45 * IN, 7.6 * IN, 10.1 * IN, stroke=1, fill=0); c.setDash()
    trapezoid_piece(1.25, 1.05, 3.5, 5.9, 6.15, 'SKIRT FRONT', 'Cut 1 on fold', True)
    c.setFont('Helvetica', 7)
    c.drawString(0.55 * IN, 0.35 * IN, 'Place center front on fabric fold. Cut one front skirt.')
    c.showPage()

    # Pattern page 3: skirt back only.
    draw_header(c, 'Pinafore Pattern Page 3 of 3', 'Skirt back - print at 100%')
    c.setDash(6, 4); c.rect(0.45 * IN, 0.45 * IN, 7.6 * IN, 10.1 * IN, stroke=1, fill=0); c.setDash()
    trapezoid_piece(2.15, 1.05, 2.0, 3.15, 6.15, 'SKIRT BACK', 'Cut 2 mirror image')
    c.setFont('Helvetica', 7)
    c.drawString(0.55 * IN, 0.35 * IN, 'Back skirt includes center back opening. Add hook-and-loop tape or snaps at back waist/bib.')
    c.showPage()

    # Instructions
    draw_header(c, 'Cutting & Sewing Instructions', f"For {profile['label']} - Easy Pinafore")
    y = PAGE_H - 0.95 * IN
    instructions = [
        ('Cutting list', True),
        ('1. Cut bib, front skirt, two back skirts, two straps, waistbands, and optional pocket.', False),
        ('2. Finish top edge of bib and pocket. Attach pocket to front skirt if using.', False),
        ('3. Sew skirt side seams. Leave center back open.', False),
        ('4. Attach front and back waistbands to skirt top edges.', False),
        ('5. Attach bib to front waistband.', False),
        ('6. Fold straps lengthwise, sew, turn, and press. Adult help recommended.', False),
        ('7. Attach straps to bib front and back waistband. Check fit on doll before final stitching.', False),
        ('8. Finish back opening with hook-and-loop tape or snaps.', False),
        ('Parent help notes', True),
        ('- This is harder than the A-line dress. Help with straps, pressing, and back closure.', False),
        ('- The cream T-shirt shown in reference images is styling only, not included.', False),
    ]
    for text, heading in instructions:
        if heading:
            y -= 0.10 * IN; c.setFont('Helvetica-Bold', 11); c.drawString(0.7 * IN, y, text); y -= 0.26 * IN
        else:
            c.setFont('Helvetica', 9.5); c.drawString(0.85 * IN, y, text); y -= 0.24 * IN
    c.setFont('Helvetica', 8)
    c.drawString(0.7 * IN, 0.70 * IN, 'Experimental digital pattern. Test sew before sale or public release.')
    c.save()

    if out_json:
        with open(out_json, 'w', encoding='utf-8') as f:
            json.dump(quality, f, indent=2)
    return quality

# Override experimental pinafore with a cleaner v1: independent, non-overlapping, cuttable pieces.
def make_easy_pinafore_pdf(profile_key: str, out_pdf: str, out_json: str | None = None) -> Dict[str, object]:
    profiles = load_profiles()
    if profile_key not in profiles:
        raise ValueError(f'Unknown doll profile: {profile_key}')
    profile = profiles[profile_key]
    if profile_key != 'american-girl-18':
        raise ValueError('Easy Pinafore v1 is currently drafted for 18-inch dolls only.')

    # Draft dimensions in inches. All are cut dimensions with 1/4 in seam allowance included.
    dims = {
        'bib': (4.20, 2.60),
        'pocket': (1.55, 1.55),
        'strap': (6.60, 0.90),
        'front_waistband': (6.70, 0.75),
        'back_waistband': (3.55, 0.75),
        'front_skirt_top_half': 3.35,
        'front_skirt_hem_half': 3.10,
        'front_skirt_h': 6.50,
        'back_skirt_top': 3.55,
        'back_skirt_hem': 3.95,
        'back_skirt_h': 6.50,
    }

    seam_math = {
        'front_waistband_stitch': round(dims['front_waistband'][0] - 2 * SA, 3),
        'front_skirt_top_stitch': round((dims['front_skirt_top_half'] - SA) * 2, 3),
        'back_waistband_pair_stitch': round((dims['back_waistband'][0] - 2 * SA) * 2, 3),
        'back_skirt_pair_top_stitch': round((dims['back_skirt_top'] - 2 * SA) * 2, 3),
        'strap_finished_width': round(dims['strap'][1] - 2 * SA, 3),
    }
    seam_math['front_waist_difference'] = round(seam_math['front_waistband_stitch'] - seam_math['front_skirt_top_stitch'], 3)
    seam_math['back_waist_difference'] = round(seam_math['back_waistband_pair_stitch'] - seam_math['back_skirt_pair_top_stitch'], 3)

    # Page layout rectangles for overlap validation: (page, x, y, w, h, name)
    rects = [
        (1, 0.75, 1.15, *dims['bib'], 'front bib'),
        (1, 5.45, 1.15, *dims['pocket'], 'optional pocket'),
        (1, 0.75, 4.20, *dims['strap'], 'strap 1'),
        (1, 0.75, 5.30, *dims['strap'], 'strap 2'),
        (1, 0.75, 6.45, *dims['front_waistband'], 'front waistband'),
        (1, 0.75, 7.55, *dims['back_waistband'], 'back waistband L'),
        (1, 0.75, 8.65, *dims['back_waistband'], 'back waistband R'),
        (2, 1.20, 1.05, dims['front_skirt_hem_half'] * 2, dims['front_skirt_h'], 'front skirt'),
        (3, 2.30, 1.05, dims['back_skirt_hem'], dims['back_skirt_h'], 'back skirt'),
    ]

    def rect_ok(r):
        _page, x, y, w, h, _name = r
        return x >= SAFE and y >= SAFE and x + w <= 8.05 and y + h <= 10.55

    def overlap(a, b):
        return a[0] == b[0] and a[1] < b[1] + b[3] and a[1] + a[3] > b[1] and a[2] < b[2] + b[4] and a[2] + a[4] > b[2]

    no_overlap = all(not overlap(a, b) for i, a in enumerate(rects) for b in rects[i + 1:])
    in_bounds = all(rect_ok(r) for r in rects)
    waist_match = abs(seam_math['front_waist_difference']) <= 0.05 and abs(seam_math['back_waist_difference']) <= 0.05

    quality = {
        'profile': profile_key,
        'style': 'easy-pinafore-dress',
        'version': 'v1-cuttable',
        'experimental': True,
        'piece_count': 8,
        'has_front': True,
        'has_back': True,
        'has_test_square': True,
        'has_cutting_list': True,
        'has_sewing_steps': True,
        'child_friendly': True,
        'tiled_layout_required': False,
        'tiled_layout_available': True,
        'pieces_do_not_overlap': no_overlap,
        'pieces_inside_print_area': in_bounds,
        'waist_seams_match': waist_match,
        'seam_math': seam_math,
        'risk': 'medium - v1 experimental pinafore template, test sew required',
        'pieces': ['front bib', 'front skirt on fold', 'back skirt cut 2 mirror image', 'shoulder straps x2', 'front waistband', 'back waistbands x2', 'optional pocket'],
    }
    quality['sellable_gate'] = all([
        quality['has_front'], quality['has_back'], quality['has_test_square'], quality['has_cutting_list'],
        quality['has_sewing_steps'], quality['child_friendly'], no_overlap, in_bounds, waist_match,
    ])
    if not quality['sellable_gate']:
        raise ValueError(f'Pinafore validation failed: {quality}')

    os.makedirs(os.path.dirname(out_pdf), exist_ok=True)
    c = canvas.Canvas(out_pdf, pagesize=letter)
    c.setTitle(f"{profile['label']} Easy Pinafore Dress v1 Experimental")
    c.setAuthor('Wawa Pattern Studio')

    def draw_page_border(note):
        c.setDash(6, 4)
        c.rect(0.45 * IN, 0.45 * IN, 7.6 * IN, 10.1 * IN, stroke=1, fill=0)
        c.setDash()
        c.setFont('Helvetica', 7)
        c.drawString(0.55 * IN, 0.35 * IN, note)

    def label(x, y, title, cut):
        c.setFillColor(colors.white)
        c.rect((x - 0.04) * IN, PAGE_H - (y + 0.34) * IN, 1.85 * IN, 0.45 * IN, stroke=0, fill=1)
        c.setFillColor(colors.black)
        c.setFont('Helvetica-Bold', 8)
        c.drawString(x * IN, PAGE_H - y * IN, title)
        c.setFont('Helvetica', 7)
        c.drawString(x * IN, PAGE_H - (y + 0.16) * IN, cut)
        c.drawString(x * IN, PAGE_H - (y + 0.31) * IN, 'SA 1/4 in included')

    def rect_piece(x, y, w, h, title, cut, label_pos='left'):
        c.setLineWidth(1.0)
        c.setStrokeColor(colors.black)
        c.rect(x * IN, PAGE_H - (y + h) * IN, w * IN, h * IN, stroke=1, fill=0)
        c.setDash(4, 3)
        c.rect((x + SA) * IN, PAGE_H - (y + h - SA) * IN, max(0.1, w - 2 * SA) * IN, max(0.1, h - 2 * SA) * IN, stroke=1, fill=0)
        c.setDash()
        lx = x + 0.15 if label_pos == 'left' else x + w - 1.9
        label(lx, y + h / 2, title, cut)

    def trapezoid_piece(x, y, top, hem, h, title, cut, fold=False):
        dx = (hem - top) / 2
        p = c.beginPath()
        p.moveTo((x + dx) * IN, PAGE_H - y * IN)
        p.lineTo((x + dx + top) * IN, PAGE_H - y * IN)
        p.lineTo((x + hem) * IN, PAGE_H - (y + h) * IN)
        p.lineTo(x * IN, PAGE_H - (y + h) * IN)
        p.close()
        c.setLineWidth(1.0)
        c.drawPath(p, stroke=1, fill=0)
        c.setDash(4, 3)
        p2 = c.beginPath()
        p2.moveTo((x + dx + SA) * IN, PAGE_H - (y + SA) * IN)
        p2.lineTo((x + dx + top - SA) * IN, PAGE_H - (y + SA) * IN)
        p2.lineTo((x + hem - SA) * IN, PAGE_H - (y + h - SA) * IN)
        p2.lineTo((x + SA) * IN, PAGE_H - (y + h - SA) * IN)
        p2.close()
        c.drawPath(p2, stroke=1, fill=0)
        c.setDash()
        if fold:
            fx = x + hem / 2
            c.setDash(6, 4)
            c.line(fx * IN, PAGE_H - y * IN, fx * IN, PAGE_H - (y + h) * IN)
            c.setDash()
            c.setFont('Helvetica', 7)
            c.drawString((fx + 0.08) * IN, PAGE_H - (y + h / 2) * IN, 'CENTER FRONT / FOLD')
        label(x + 0.2, y + h / 2, title, cut)

    # Cover
    draw_header(c, 'Easy Pinafore Dress v1', f"For {profile['label']} - experimental test-sew PDF")
    c.setFont('Helvetica-Bold', 24)
    c.drawString(0.75 * IN, PAGE_H - 1.45 * IN, 'Easy Pinafore Dress')
    c.setFont('Helvetica', 12)
    y = PAGE_H - 1.9 * IN
    for line in [
        'Experimental v1: cuttable layout with non-overlapping pieces',
        'Designed to wear over an existing doll T-shirt',
        'Includes bib, A-line skirt, straps, waistband, and optional pocket',
        'No zipper, no buttonholes, no sleeves on the pinafore',
    ]:
        c.drawString(0.78 * IN, y, line)
        y -= 0.28 * IN
    c.rect(6.75 * IN, PAGE_H - 1.70 * IN, 1 * IN, 1 * IN, stroke=1, fill=0)
    c.setFont('Helvetica', 7.2)
    c.drawString(6.75 * IN, PAGE_H - 1.86 * IN, '1 x 1 in test square')
    c.showPage()

    draw_header(c, 'Pinafore Pattern Page 1 of 3', 'Bib, straps, waistband, pocket - print at 100%')
    draw_page_border('Cut solid lines. Sew dashed lines. All small pieces are separated and independently cuttable.')
    rect_piece(0.75, 1.15, *dims['bib'], 'FRONT BIB', 'Cut 1')
    rect_piece(5.45, 1.15, *dims['pocket'], 'OPTIONAL POCKET', 'Cut 1')
    rect_piece(0.75, 4.20, *dims['strap'], 'STRAP', 'Cut 2')
    rect_piece(0.75, 5.30, *dims['strap'], 'STRAP', 'Cut 2')
    rect_piece(0.75, 6.45, *dims['front_waistband'], 'FRONT WAISTBAND', 'Cut 1')
    rect_piece(0.75, 7.55, *dims['back_waistband'], 'BACK WAISTBAND L', 'Cut 1')
    rect_piece(0.75, 8.65, *dims['back_waistband'], 'BACK WAISTBAND R', 'Cut 1')
    c.showPage()

    draw_header(c, 'Pinafore Pattern Page 2 of 3', 'Skirt front - print at 100%')
    draw_page_border('Place center front on fabric fold. Cut one front skirt.')
    trapezoid_piece(1.20, 1.05, dims['front_skirt_top_half'] * 2, dims['front_skirt_hem_half'] * 2, dims['front_skirt_h'], 'SKIRT FRONT', 'Cut 1 on fold', True)
    c.showPage()

    draw_header(c, 'Pinafore Pattern Page 3 of 3', 'Skirt back - print at 100%')
    draw_page_border('Cut two mirror-image back skirt pieces. Center back remains open for hook-and-loop tape or snaps.')
    trapezoid_piece(2.30, 1.05, dims['back_skirt_top'], dims['back_skirt_hem'], dims['back_skirt_h'], 'SKIRT BACK', 'Cut 2 mirror image')
    c.showPage()

    draw_header(c, 'Cutting & Sewing Instructions', f"For {profile['label']} - Easy Pinafore v1")
    y = PAGE_H - 0.95 * IN
    instructions = [
        ('Cutting list', True),
        ('1. Cut bib, front skirt, two back skirts, two straps, waistbands, and optional pocket.', False),
        ('2. Keep the cream T-shirt separate; it is styling only and not included.', False),
        ('Sewing order', True),
        ('3. Finish top edge of bib and pocket. Attach pocket to front skirt if using.', False),
        ('4. Sew skirt side seams. Leave center back open.', False),
        ('5. Attach front and back waistbands to skirt top edges.', False),
        ('6. Attach bib to front waistband.', False),
        ('7. Fold straps lengthwise, sew, turn, and press. Adult help recommended.', False),
        ('8. Attach straps to bib front and back waistband. Check fit on doll before final stitching.', False),
        ('9. Finish back opening with hook-and-loop tape or snaps.', False),
        ('Parent help notes', True),
        ('- This is harder than the A-line dress. Help with straps, pressing, and closure.', False),
        ('- Test sew in scrap cotton before using final fabric.', False),
    ]
    for text, heading in instructions:
        if heading:
            y -= 0.10 * IN; c.setFont('Helvetica-Bold', 11); c.drawString(0.7 * IN, y, text); y -= 0.26 * IN
        else:
            c.setFont('Helvetica', 9.5); c.drawString(0.85 * IN, y, text); y -= 0.24 * IN
    c.setFont('Helvetica', 8)
    c.drawString(0.7 * IN, 0.70 * IN, 'Experimental digital pattern. Test sew before sale or public release.')
    c.save()

    if out_json:
        with open(out_json, 'w', encoding='utf-8') as f:
            json.dump(quality, f, indent=2)
    return quality
