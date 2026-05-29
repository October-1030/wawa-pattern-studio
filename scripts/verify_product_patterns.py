import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, ROOT)

from pattern_core.product_patterns import build_easy_a_line_pieces, load_profiles, validate_product


def assert_true(value, message):
    if not value:
        raise AssertionError(message)


def main():
    profiles = load_profiles()
    sellable = ['neo-blythe', 'barbie-vintage']
    for key in sellable:
        checks = validate_product(key, profiles[key], build_easy_a_line_pieces(profiles[key]))
        assert_true(checks['sellable_gate'], f'{key} should pass sellable gate: {checks}')
        assert_true(checks['layout_fits_us_letter'], f'{key} should fit US Letter')
        assert_true(checks['shoulder_match'], f'{key} shoulder seams should match')
        assert_true(checks['side_match'], f'{key} side seams should match')

    tiled = validate_product('american-girl-18', profiles['american-girl-18'], build_easy_a_line_pieces(profiles['american-girl-18']))
    assert_true(tiled['sellable_gate'], 'american-girl-18 should pass through tiled output gate')
    assert_true(tiled.get('tiled_layout_required'), 'american-girl-18 should require tiled output')
    assert_true(tiled.get('tiled_layout_available'), 'american-girl-18 tiled output should be available')
    print('verify_product_patterns: all checks passed')


if __name__ == '__main__':
    main()
