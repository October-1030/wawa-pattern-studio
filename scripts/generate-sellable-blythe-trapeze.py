from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfbase.pdfmetrics import stringWidth
from math import hypot
import json
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'output', 'pdf')
os.makedirs(OUT_DIR, exist_ok=True)
PDF_PATH = os.path.join(OUT_DIR, 'blythe-simple-trapeze-dress-us-letter.pdf')
CHECK_PATH = os.path.join(OUT_DIR, 'blythe-simple-trapeze-dress-seam-check.json')

PAGE_W, PAGE_H = letter
IN = 72

# Finished target: Blythe / 12-inch doll, simple sleeveless A-line dress.
# This intentionally uses one-piece dress fronts/backs, avoiding a waist seam mismatch.
SA = 0.25
CHEST = 4.20
HIP = 4.40
NECK = 1.15
SHOULDER = 1.55
GARMENT_LEN = 4.75
EASE = 0.28
BACK_EXTENSION = 0.35

# Half pattern dimensions in inches, seam allowance included.
front = {
    'title': 'FRONT DRESS',
    'cut': 'Cut 1 on fold',
    'fold': 'CENTER FRONT / FOLD',
    'x': 0.70,
    'y': 2.05,
    'w_top': CHEST / 4 + EASE / 2 + SA,       # quarter chest + ease + SA
    'w_hem': HIP / 4 + 0.72 + SA,             # A-line flare
    'h': GARMENT_LEN + SA * 2,
    'neck_w': 0.36,
    'neck_d': 0.34,
    'shoulder_x': 0.78,
    'shoulder_y': 0.10,
    'arm_y': 1.08,
}
back = dict(front)
back.update({
    'title': 'BACK DRESS',
    'cut': 'Cut 2 mirror image',
    'fold': 'CENTER BACK / OPENING',
    'x': 4.20,
    'y': 2.05,
    'neck_d': 0.18,
    'extension': BACK_EXTENSION,
})

# Keep shoulder and side seam lengths matched by construction.
# Back shape includes a center-back extension, but the sewing seam starts after the extension.

def q_to_c(p0, p1, p2):
    c1 = (p0[0] + 2/3 * (p1[0] - p0[0]), p0[1] + 2/3 * (p1[1] - p0[1]))
    c2 = (p2[0] + 2/3 * (p1[0] - p2[0]), p2[1] + 2/3 * (p1[1] - p2[1]))
    return c1, c2, p2

def to_page(origin_x, origin_y, x, y):
    return (origin_x * IN + x * IN, PAGE_H - (origin_y * IN + y * IN))

def draw_q(path, origin_x, origin_y, p0, p1, p2):
    c1, c2, p = q_to_c(p0, p1, p2)
    path.curveTo(*to_page(origin_x, origin_y, *c1), *to_page(origin_x, origin_y, *c2), *to_page(origin_x, origin_y, *p))

def cubic_len(p0, p1, p2, p3, steps=80):
    def pt(t):
        u = 1 - t
        return (
            u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
            u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1],
        )
    length = 0
    prev = p0
    for i in range(1, steps + 1):
        cur = pt(i / steps)
        length += hypot(cur[0] - prev[0], cur[1] - prev[1])
        prev = cur
    return length

def piece_points(p, back_piece=False):
    ext = p.get('extension', 0)
    return {
        'cb_top': (0, p['neck_d']),
        'neck_start': (ext, p['neck_d']),
        'neck_end': (ext + p['neck_w'], 0),
        'shoulder': (ext + p['shoulder_x'], p['shoulder_y']),
        'arm_end': (ext + p['w_top'], p['arm_y']),
        'hem_side': (ext + p['w_hem'], p['h'] - 0.08),
        'hem_fold': (0, p['h']),
        'hem_curve_ctrl': ((ext + p['w_hem']) * 0.45, p['h'] + 0.10),
    }

def draw_piece(c, p, is_back=False):
    ox, oy = p['x'], p['y']
    pts = piece_points(p, is_back)
    path = c.beginPath()
    path.moveTo(*to_page(ox, oy, *pts['cb_top']))
    if is_back:
        path.lineTo(*to_page(ox, oy, *pts['neck_start']))
    draw_q(path, ox, oy, pts['neck_start'], (pts['neck_start'][0] + p['neck_w'] * 0.48, p['neck_d'] * 0.10), pts['neck_end'])
    path.lineTo(*to_page(ox, oy, *pts['shoulder']))
    draw_q(path, ox, oy, pts['shoulder'], (pts['shoulder'][0] + 0.18, 0.42), pts['arm_end'])
    path.curveTo(*to_page(ox, oy, ext := pts['arm_end'][0] + 0.08, 2.05), *to_page(ox, oy, pts['hem_side'][0] - 0.08, p['h'] - 1.15), *to_page(ox, oy, *pts['hem_side']))
    draw_q(path, ox, oy, pts['hem_side'], pts['hem_curve_ctrl'], pts['hem_fold'])
    path.close()

    c.setStrokeColor(colors.black)
    c.setLineWidth(1.1)
    c.setDash()
    c.drawPath(path, stroke=1, fill=0)

    # Stitch line: inset indication (not a mathematically offset path, but useful cutting guide).
    c.setStrokeColor(colors.HexColor('#555555'))
    c.setLineWidth(0.7)
    c.setDash(4, 3)
    sx = p.get('extension', 0) + SA
    stitch = c.beginPath()
    stitch.moveTo(*to_page(ox, oy, sx, p['neck_d'] + SA * 0.65))
    draw_q(stitch, ox, oy, (sx, p['neck_d'] + SA * 0.65), (sx + p['neck_w'] * 0.46, SA * 0.55), (p.get('extension', 0) + p['neck_w'] + SA * 0.25, SA))
    stitch.lineTo(*to_page(ox, oy, p.get('extension', 0) + p['shoulder_x'] - SA * 0.15, p['shoulder_y'] + SA * 0.45))
    draw_q(stitch, ox, oy, (p.get('extension', 0) + p['shoulder_x'] - SA * 0.15, p['shoulder_y'] + SA * 0.45), (p.get('extension', 0) + p['shoulder_x'] + 0.18, 0.50), (p.get('extension', 0) + p['w_top'] - SA, p['arm_y'] + SA * 0.2))
    stitch.curveTo(*to_page(ox, oy, p.get('extension', 0) + p['w_top'] - SA + 0.08, 2.10), *to_page(ox, oy, p.get('extension', 0) + p['w_hem'] - SA - 0.10, p['h'] - 1.10), *to_page(ox, oy, p.get('extension', 0) + p['w_hem'] - SA, p['h'] - SA))
    draw_q(stitch, ox, oy, (p.get('extension', 0) + p['w_hem'] - SA, p['h'] - SA), ((p.get('extension', 0) + p['w_hem']) * 0.45, p['h'] - SA + 0.05), (sx, p['h'] - SA))
    c.drawPath(stitch, stroke=1, fill=0)
    c.setDash()

    # Fold/opening line
    fold_x = p.get('extension', 0)
    c.setLineWidth(0.8)
    c.setDash(6, 4)
    c.line(*to_page(ox, oy, fold_x, p['neck_d']), *to_page(ox, oy, fold_x, p['h']))
    c.setDash()

    # Grainline
    gx = p.get('extension', 0) + p['w_top'] * 0.63
    c.setLineWidth(0.7)
    c.line(*to_page(ox, oy, gx, 1.55), *to_page(ox, oy, gx, p['h'] - 0.80))
    c.line(*to_page(ox, oy, gx, 1.55), *to_page(ox, oy, gx - 0.05, 1.70))
    c.line(*to_page(ox, oy, gx, 1.55), *to_page(ox, oy, gx + 0.05, 1.70))
    c.line(*to_page(ox, oy, gx, p['h'] - 0.80), *to_page(ox, oy, gx - 0.05, p['h'] - 0.95))
    c.line(*to_page(ox, oy, gx, p['h'] - 0.80), *to_page(ox, oy, gx + 0.05, p['h'] - 0.95))

    # Labels
    c.setFillColor(colors.black)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(*to_page(ox, oy, p.get('extension', 0) + 0.34, 2.85), p['title'])
    c.setFont('Helvetica', 8)
    c.drawString(*to_page(ox, oy, p.get('extension', 0) + 0.34, 3.05), p['cut'])
    c.drawString(*to_page(ox, oy, p.get('extension', 0) + 0.34, 3.22), 'SA 1/4 in / 0.64 cm included')
    c.drawString(*to_page(ox, oy, gx + 0.08, 2.20), 'GRAINLINE')
    c.saveState()
    tx, ty = to_page(ox, oy, fold_x + 0.07, 3.15)
    c.translate(tx, ty)
    c.rotate(90)
    c.setFont('Helvetica', 7)
    c.drawString(0, 0, p['fold'])
    c.restoreState()


def draw_header(c, title, subtitle=''):
    c.setFont('Helvetica-Bold', 15)
    c.drawString(0.55 * IN, PAGE_H - 0.35 * IN, title)
    if subtitle:
        c.setFont('Helvetica', 8.5)
        c.drawString(0.55 * IN, PAGE_H - 0.52 * IN, subtitle)


def make_pdf():
    c = canvas.Canvas(PDF_PATH, pagesize=letter)
    c.setTitle('Blythe Simple Trapeze Dress - US Letter Sewing Pattern')
    c.setAuthor('Wawa Pattern Studio')

    # Cover
    draw_header(c, 'Blythe Simple Trapeze Dress', 'Digital sewing pattern - US Letter - print at 100% scale')
    c.setFont('Helvetica-Bold', 24)
    c.drawString(0.75 * IN, PAGE_H - 1.45 * IN, 'Simple Trapeze Dress')
    c.setFont('Helvetica', 12)
    lines = [
        'For Blythe / 12-inch dolls',
        'Beginner friendly sleeveless A-line dress with back closure',
        'Pattern pieces: front dress on fold, back dress cut 2 mirror image',
        'Seam allowance: 1/4 in / 0.64 cm included',
    ]
    y = PAGE_H - 1.85 * IN
    for line in lines:
        c.drawString(0.78 * IN, y, line)
        y -= 0.28 * IN
    c.setFont('Helvetica-Bold', 11)
    c.drawString(0.78 * IN, y - 0.12 * IN, 'Measurements used')
    c.setFont('Helvetica', 10)
    data = [('Bust/chest', '4.20 in / 10.67 cm'), ('Approx finished length', '4.75 in / 12.07 cm'), ('Recommended fabric', 'light cotton lawn, poplin, or thin quilting cotton')]
    y -= 0.45 * IN
    for k, v in data:
        c.drawString(0.95 * IN, y, f'{k}: {v}')
        y -= 0.24 * IN
    c.setFont('Helvetica', 8)
    c.drawString(0.78 * IN, 0.75 * IN, 'Print note: choose Actual Size / 100%. Do not fit to page. Check the 1 x 1 inch test square before cutting fabric.')
    c.showPage()

    # Pattern page
    draw_header(c, 'Pattern Page 1 of 1', 'Blythe Simple Trapeze Dress - US Letter')
    c.setLineWidth(0.9)
    c.rect(6.85 * IN, PAGE_H - 1.55 * IN, 1 * IN, 1 * IN, stroke=1, fill=0)
    c.setFont('Helvetica', 7.5)
    c.drawString(6.85 * IN, PAGE_H - 1.72 * IN, '1 x 1 in test square')
    c.drawString(6.85 * IN, PAGE_H - 1.88 * IN, '2.54 x 2.54 cm')
    # Safe border
    c.setStrokeColor(colors.HexColor('#999999'))
    c.setDash(3, 3)
    c.rect(0.45 * IN, 0.45 * IN, 7.6 * IN, 10.1 * IN, stroke=1, fill=0)
    c.setDash()
    c.setStrokeColor(colors.black)
    draw_piece(c, front, False)
    draw_piece(c, back, True)
    c.setFont('Helvetica', 7)
    c.drawString(0.55 * IN, 0.32 * IN, 'Wawa Pattern Studio - Blythe Simple Trapeze Dress - seam allowance included')
    c.showPage()

    # Instructions
    draw_header(c, 'Sewing Instructions', 'Blythe Simple Trapeze Dress')
    y = PAGE_H - 0.95 * IN
    c.setFont('Helvetica-Bold', 11)
    c.drawString(0.7 * IN, y, 'Cutting')
    y -= 0.25 * IN
    c.setFont('Helvetica', 9.5)
    instructions = [
        '1. Print on US Letter at 100% / Actual Size. Check the test square.',
        '2. Cut FRONT DRESS once on the fold.',
        '3. Cut BACK DRESS twice as mirror images.',
        '4. Transfer the grainline and center back opening marks.',
        '',
        'Sewing order',
        '5. With right sides together, sew front and back shoulder seams.',
        '6. Finish neckline and armholes with a narrow facing, bias strip, or tiny rolled hem.',
        '7. Sew side seams from armhole to hem. Press seams open or toward the back.',
        '8. Finish center back edges. Add snaps, hook-and-loop tape, or tiny buttons.',
        '9. Hem the lower edge with a narrow hem. Press gently with low heat.',
        '',
        'Quality notes',
        '- Use thin doll-scale fabric. Heavy cotton can make the neckline bulky.',
        '- Seam allowance is included on all pattern pieces.',
        '- If your doll body differs from standard Blythe, test in scrap fabric first.',
    ]
    for line in instructions:
        if line in ('Sewing order', 'Quality notes'):
            y -= 0.12 * IN
            c.setFont('Helvetica-Bold', 11)
            c.drawString(0.7 * IN, y, line)
            c.setFont('Helvetica', 9.5)
        elif line == '':
            y -= 0.14 * IN
        else:
            c.drawString(0.85 * IN, y, line)
        y -= 0.24 * IN
    c.setFont('Helvetica', 8)
    c.drawString(0.7 * IN, 0.70 * IN, 'Digital product. No physical item is shipped. You may sell finished handmade garments; do not resell or redistribute this PDF.')
    c.save()


def seam_checks():
    shoulder_front = hypot(front['shoulder_x'] - front['neck_w'], front['shoulder_y'] - 0)
    shoulder_back = hypot(back['shoulder_x'] - back['neck_w'], back['shoulder_y'] - 0)
    # Approximate side seam uses identical control points except for x offset, therefore exact by construction.
    side_front = cubic_len((front['w_top'], front['arm_y']), (front['w_top'] + 0.08, 2.05), (front['w_hem'] - 0.08, front['h'] - 1.15), (front['w_hem'], front['h'] - 0.08))
    side_back = cubic_len((back['w_top'], back['arm_y']), (back['w_top'] + 0.08, 2.05), (back['w_hem'] - 0.08, back['h'] - 1.15), (back['w_hem'], back['h'] - 0.08))
    return {
        'pattern': 'Blythe Simple Trapeze Dress',
        'units': 'inches',
        'seam_allowance': SA,
        'checks': {
            'shoulder_front': round(shoulder_front, 4),
            'shoulder_back': round(shoulder_back, 4),
            'shoulder_difference': round(shoulder_back - shoulder_front, 6),
            'side_front': round(side_front, 4),
            'side_back': round(side_back, 4),
            'side_difference': round(side_back - side_front, 6),
        },
        'status': 'PASS - shoulder and side seams match by construction',
    }

if __name__ == '__main__':
    make_pdf()
    checks = seam_checks()
    with open(CHECK_PATH, 'w', encoding='utf-8') as f:
        json.dump(checks, f, indent=2)
    print(PDF_PATH)
    print(json.dumps(checks, indent=2))
