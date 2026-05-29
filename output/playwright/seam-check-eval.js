() => {
  function pathLen(d) {
    const svg = document.querySelector('svg') || document.body.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
    const l = p.getTotalLength();
    p.remove();
    return l;
  }
  function line(x1, y1, x2, y2) { return `M ${x1} ${y1} L ${x2} ${y2}`; }
  function qpath(mx, my, cx, cy, x, y) { return `M ${mx} ${my} Q ${cx} ${cy} ${x} ${y}`; }
  function cpath(mx, my, x1, y1, x2, y2, x, y) { return `M ${mx} ${my} C ${x1} ${y1} ${x2} ${y2} ${x} ${y}`; }
  function round(n) { return typeof n === 'number' ? Math.round(n * 1000) / 1000 : n; }

  function check(profile, templateId) {
    state.category = 'bjd';
    state.profile = profile;
    state.templateId = templateId;
    applyTemplateDefaults(currentTemplate());

    const m = draftMeasurements();
    const sa = state.seamAllowance;
    const f = bodiceDraft('front');
    const b = bodiceDraft('back');
    const fStitchW = f.w - sa;
    const bStitchW = b.w - sa;
    const fStitchWaist = Math.max(sa + 0.2, f.waistW - sa);
    const bStitchWaist = Math.max(b.extension + sa + 0.2, b.waistW - sa);
    const fStitchH = f.h - sa;
    const bStitchH = b.h - sa;

    const front = {
      shoulder: pathLen(line(f.neckW, 0, f.shoulder, f.shoulderDrop)),
      side: pathLen(cpath(fStitchW, f.armY + sa * 0.25, fStitchW * 0.96, f.h * 0.73, fStitchWaist + 0.08, fStitchH * 0.9, fStitchWaist, fStitchH)),
      waist: pathLen(qpath(fStitchWaist, fStitchH, fStitchWaist * 0.5, fStitchH + f.waistCurve * 0.7, sa, fStitchH)),
    };
    const back = {
      shoulder: pathLen(line(b.extension + b.neckW, 0, b.shoulder, b.shoulderDrop)),
      side: pathLen(cpath(bStitchW, b.armY + sa * 0.25, bStitchW * 0.97, b.h * 0.73, bStitchWaist + 0.08, bStitchH * 0.9, bStitchWaist, bStitchH)),
      waist: pathLen(qpath(bStitchWaist, bStitchH, bStitchWaist * 0.5, bStitchH + b.waistCurve * 0.7, b.extension + sa, bStitchH)),
    };

    const baseTop = m.waist / 4 + state.ease / 2 + sa;
    const top = state.template === 'gathered' ? baseTop * 1.45 : baseTop;
    const h = m.skirtLength + sa * 2 + 0.25;
    const waistCurve = Math.max(0.04, Math.min(h * 0.018, 0.12));
    const stitchTop = Math.max(sa + 0.2, top - sa);
    const skirtWaist = pathLen(qpath(sa, sa + waistCurve, top * 0.5, sa * 0.45, stitchTop, sa));

    const frontArmhole = pathLen(cpath(f.shoulder - sa * 0.2, f.shoulderDrop + sa * 0.45, f.shoulder + sa * 0.2, f.armY * 0.32, fStitchW * 0.74, f.armY * 0.78, fStitchW, f.armY + sa * 0.25));
    const backArmhole = pathLen(cpath(b.shoulder - sa * 0.2, b.shoulderDrop + sa * 0.45, b.shoulder + sa * 0.2, b.armY * 0.34, bStitchW * 0.74, b.armY * 0.78, bStitchW, b.armY + sa * 0.25));
    const sleeve = sleevePiece();
    let sleeveCap = null;
    if (sleeve) {
      const cap = state.sleeve === 'puff' ? 0.55 : 0.38;
      const w = m.armhole + sa * 2 + (state.sleeve === 'puff' ? 0.45 : 0.15);
      sleeveCap = pathLen(qpath(sa, cap + sa * 0.6, w / 2, sa * 0.5, w - sa, cap + sa * 0.6));
    }

    const pages = patternPages();
    return {
      profile,
      templateId,
      style: { skirt: state.template, sleeve: state.sleeve, neckline: state.neckline, closure: state.closure },
      pages: pages.length,
      measurements: m,
      seams: { front, back, skirtWaist, frontArmhole, backArmhole, sleeveCap },
      diffs: {
        shoulderBackMinusFront: back.shoulder - front.shoulder,
        sideBackMinusFront: back.side - front.side,
        frontWaistSkirtMinusBodice: skirtWaist - front.waist,
        backWaistSkirtMinusBodice: skirtWaist - back.waist,
        sleeveCapMinusArmholePair: sleeveCap == null ? null : sleeveCap - (frontArmhole + backArmhole),
      },
      pieces: buildPieces().map((p) => ({ title: p.title, cut: p.cut, width: p.width, height: p.height, x: p.x, y: p.y })),
    };
  }

  const results = [
    check('blythe', 'trapeze'),
    check('americanGirl', 'trapeze'),
    check('blythe', 'puff-sleeve'),
  ];
  return JSON.parse(JSON.stringify(results, (_k, v) => (typeof v === 'number' ? round(v) : v)));
}
