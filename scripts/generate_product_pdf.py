import argparse
import json
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, ROOT)

from pattern_core.product_patterns import (
    build_easy_a_line_pieces,
    load_profiles,
    make_easy_a_line_pdf,
    make_easy_a_line_tiled_pdf,
    make_easy_pinafore_pdf,
    validate_product,
)


def slug(value: str) -> str:
    return ''.join(ch if ch.isalnum() or ch in '-_' else '-' for ch in value.lower()).strip('-')


def render_pngs(pdf_path: str, out_dir: str) -> list[str]:
    try:
        import fitz
    except Exception:
        return []
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    paths = []
    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        path = os.path.join(out_dir, f'page-{i}.png')
        pix.save(path)
        paths.append(path)
    return paths


def main():
    parser = argparse.ArgumentParser(description='Generate product-quality doll sewing PDF.')
    parser.add_argument('--doll', required=True, help='Doll profile key, e.g. neo-blythe or barbie-vintage')
    parser.add_argument('--style', default='easy-a-line-dress', choices=['easy-a-line-dress', 'easy-pinafore-dress'])
    parser.add_argument('--out-dir', default=os.path.join(ROOT, 'output', 'product-pdf'))
    parser.add_argument('--render', action='store_true', help='Render PDF pages to PNG for visual QA when PyMuPDF is installed')
    parser.add_argument('--check-only', action='store_true', help='Only run validation; do not create PDF')
    args = parser.parse_args()

    profiles = load_profiles()
    if args.doll not in profiles:
        raise SystemExit(f'Unknown doll profile: {args.doll}. Available: {", ".join(profiles)}')

    if args.style == 'easy-a-line-dress':
        pieces = build_easy_a_line_pieces(profiles[args.doll])
        validation = validate_product(args.doll, profiles[args.doll], pieces)
    else:
        validation = {
            'profile': args.doll,
            'style': args.style,
            'sellable_gate': args.doll == 'american-girl-18',
            'experimental': True,
        }
    if args.check_only:
        print(json.dumps(validation, indent=2))
        raise SystemExit(0 if validation.get('sellable_gate') else 2)

    os.makedirs(args.out_dir, exist_ok=True)
    base = f'{slug(args.doll)}-{args.style}-us-letter'
    pdf_path = os.path.join(args.out_dir, f'{base}.pdf')
    json_path = os.path.join(args.out_dir, f'{base}-quality.json')
    if args.style == 'easy-pinafore-dress':
        validation = make_easy_pinafore_pdf(args.doll, pdf_path, json_path)
    elif validation.get('tiled_layout_required'):
        validation = make_easy_a_line_tiled_pdf(args.doll, pdf_path, json_path)
    else:
        validation = make_easy_a_line_pdf(args.doll, pdf_path, json_path)
    rendered = render_pngs(pdf_path, os.path.join(args.out_dir, f'{base}-rendered')) if args.render else []
    print(json.dumps({
        'pdf': pdf_path,
        'quality': json_path,
        'rendered': rendered,
        'validation': validation,
    }, indent=2))


if __name__ == '__main__':
    main()
