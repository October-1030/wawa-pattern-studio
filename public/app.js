const profiles = {
  blythe: {
    label: 'Blythe / 12-inch doll',
    chest: 4.2,
    waist: 3.25,
    shoulder: 1.55,
    neck: 1.15,
    bodiceLength: 1.65,
    skirtLength: 3.1,
    armhole: 1.1,
  },
  barbie: {
    label: 'Barbie-style / 11.5-inch doll',
    chest: 4.75,
    waist: 3.35,
    shoulder: 1.7,
    neck: 1.2,
    bodiceLength: 1.75,
    skirtLength: 3.4,
    armhole: 1.15,
  },
  americanGirl: {
    label: '18-inch doll',
    chest: 11,
    waist: 10.5,
    shoulder: 4.25,
    neck: 4.1,
    bodiceLength: 4.3,
    skirtLength: 6.25,
    armhole: 3.2,
  },
  custom: {
    label: 'Custom measurements',
    chest: 4.2,
    waist: 3.25,
    shoulder: 1.55,
    neck: 1.15,
    bodiceLength: 1.65,
    skirtLength: 3.1,
    armhole: 1.1,
  },
};

const measurementFields = [
  ['chest', 'Chest'],
  ['waist', 'Waist'],
  ['shoulder', 'Shoulder'],
  ['neck', 'Neck'],
  ['bodiceLength', 'Bodice length'],
  ['skirtLength', 'Skirt length'],
  ['armhole', 'Armhole'],
];

const state = {
  imageDataUrl: '',
  imageName: '',
  profile: 'blythe',
  template: 'a-line',
  neckline: 'round',
  sleeve: 'sleeveless',
  closure: true,
  ease: 0.2,
  seamAllowance: 0.25,
  measurements: { ...profiles.blythe },
  aiNotes: '',
  fitPreset: 'basic',
};

const elements = {
  analyzeButton: document.getElementById('analyzeButton'),
  aiStatus: document.getElementById('aiStatus'),
  closureCheckbox: document.getElementById('closureCheckbox'),
  downloadSvgButton: document.getElementById('downloadSvgButton'),
  easeInput: document.getElementById('easeInput'),
  etsyText: document.getElementById('etsyText'),
  imagePreview: document.getElementById('imagePreview'),
  measurementGrid: document.getElementById('measurementGrid'),
  necklineSelect: document.getElementById('necklineSelect'),
  patternNotes: document.getElementById('patternNotes'),
  patternPreview: document.getElementById('patternPreview'),
  printButton: document.getElementById('printButton'),
  printDoc: document.getElementById('printDoc'),
  profileSelect: document.getElementById('profileSelect'),
  referencePresetButton: document.getElementById('referencePresetButton'),
  referenceImage: document.getElementById('referenceImage'),
  seamAllowanceInput: document.getElementById('seamAllowanceInput'),
  sleeveSelect: document.getElementById('sleeveSelect'),
  styleNotes: document.getElementById('styleNotes'),
  uploadLabel: document.getElementById('uploadLabel'),
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function fmt(value) {
  return Number(value).toFixed(2).replace(/\.00$/, '');
}

const pageSize = {
  width: 8.5,
  height: 11,
  safeX: 0.45,
  safeY: 0.45,
  safeWidth: 7.6,
  safeHeight: 10.1,
  layoutX: 0.55,
  layoutY: 1.98,
  layoutBottom: 10.5,
  gapX: 0.35,
  gapY: 0.02,
};

function createMeasurementInputs() {
  elements.measurementGrid.innerHTML = measurementFields
    .map(([key, label]) => {
      return `
        <label class="field">
          <span>${label} (in)</span>
          <input type="number" min="0" step="0.05" data-measurement="${key}" value="${state.measurements[key]}" />
        </label>
      `;
    })
    .join('');

  elements.measurementGrid.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      clearReferenceMatch();
      state.profile = 'custom';
      elements.profileSelect.value = 'custom';
      state.measurements[input.dataset.measurement] = number(input.value, 0);
      render();
    });
  });
}

function syncMeasurementInputs() {
  elements.measurementGrid.querySelectorAll('input').forEach((input) => {
    input.value = state.measurements[input.dataset.measurement];
  });
}

function setTemplate(template) {
  state.template = template;
  document.querySelectorAll('.segment').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.template === template);
  });
}

function clearReferenceMatch() {
  state.fitPreset = 'basic';
  state.aiNotes = '';
}

function referenceDressStyle() {
  return {
    closure: 'back',
    confidence: 1,
    designNotes: 'Reference preset: 18-inch sleeveless A-line dress with back opening.',
    fitPreset: 'sleeveless-a-line-18',
    neckline: 'round',
    profile: 'americanGirl',
    skirt: 'a-line',
    sleeve: 'sleeveless',
  };
}

function localStyleGuess(notes) {
  const text = String(notes || '').toLowerCase();
  const is18Inch = /18\s*[- ]?\s*inch|18in|american\s*girl/.test(text);
  const isBlythe = /blythe|12\s*[- ]?\s*inch/.test(text);
  const isBarbie = /barbie|11\.5\s*[- ]?\s*inch/.test(text);
  const wantsNoClosure = text.includes('no closure') || text.includes('without closure') || text.includes('closed back');
  const wantsShoulderClosure = text.includes('shoulder closure') || text.includes('shoulder opening');
  const wantsBackClosure =
    text.includes('back closure') ||
    text.includes('back opening') ||
    text.includes('snap closure') ||
    text.includes('button back') ||
    text.includes('hook-and-loop');
  const neckline = text.includes('square')
    ? 'square'
    : text.includes('boat')
      ? 'boat'
      : text.includes('v-neck') || text.includes('v neck')
        ? 'v'
        : 'round';
  const sleeve = text.includes('puff') ? 'puff' : text.includes('short sleeve') ? 'short' : 'sleeveless';
  const skirt =
    text.includes('gather') || text.includes('ruffle')
      ? 'gathered'
      : text.includes('straight') || text.includes('shift dress')
        ? 'straight'
        : 'a-line';
  const closure = wantsNoClosure ? 'none' : wantsShoulderClosure ? 'shoulder' : wantsBackClosure ? 'back' : 'back';
  const profile = is18Inch ? 'americanGirl' : isBlythe ? 'blythe' : isBarbie ? 'barbie' : '';
  const fitPreset =
    (is18Inch || state.profile === 'americanGirl') && sleeve === 'sleeveless' && skirt === 'a-line' && closure === 'back'
      ? 'sleeveless-a-line-18'
      : 'basic';

  return {
    closure,
    designNotes:
      fitPreset === 'sleeveless-a-line-18'
        ? 'Local reference match: 18-inch sleeveless A-line dress with back opening.'
        : 'Local style guess from style notes. Configure OPENAI_API_KEY for image analysis.',
    fitPreset,
    neckline,
    profile,
    skirt,
    sleeve,
    confidence: 0.35,
  };
}

function applyReferencePreset() {
  applyStyle(referenceDressStyle());
  elements.aiStatus.textContent = 'Applied 18-inch sleeveless A-line reference preset.';
}

function applyStyle(style) {
  if (profiles[style.profile]) {
    state.profile = style.profile;
    state.measurements = { ...profiles[state.profile] };
    elements.profileSelect.value = state.profile;
    syncMeasurementInputs();
  }
  if (['round', 'square', 'boat', 'v'].includes(style.neckline)) {
    state.neckline = style.neckline;
    elements.necklineSelect.value = style.neckline;
  }
  if (['sleeveless', 'short', 'puff'].includes(style.sleeve)) {
    state.sleeve = style.sleeve;
    elements.sleeveSelect.value = style.sleeve;
  }
  if (['a-line', 'gathered', 'straight'].includes(style.skirt)) {
    setTemplate(style.skirt);
  }
  if (['back', 'shoulder', 'none'].includes(style.closure)) {
    state.closure = style.closure === 'back';
    elements.closureCheckbox.checked = state.closure;
  }
  state.fitPreset = style.fitPreset || 'basic';
  state.aiNotes = style.designNotes || '';
  render();
}

async function analyzeDesign() {
  const notes = elements.styleNotes.value.trim();
  const localInput = [notes, state.imageName].filter(Boolean).join(' ');

  if (!state.imageDataUrl) {
    if (!notes) {
      elements.aiStatus.textContent = 'Upload a reference image or add style notes first.';
      return;
    }
    applyStyle(localStyleGuess(localInput));
    elements.aiStatus.textContent = 'Applied a local style guess from notes. Upload an image and configure OPENAI_API_KEY for image analysis.';
    return;
  }

  elements.aiStatus.textContent = 'Analyzing reference image...';
  elements.analyzeButton.disabled = true;

  try {
    const response = await fetch('/api/analyze-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDataUrl: state.imageDataUrl,
        notes,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const fallback = localStyleGuess(localInput);
      applyStyle(fallback);
      elements.aiStatus.textContent = data.fallback
        ? 'OpenAI key is not configured. Applied a local style guess from notes.'
        : `AI analysis failed: ${data.error}`;
      return;
    }

    applyStyle(data.style || {});
    elements.aiStatus.textContent = 'Image analysis applied. Review the controls before exporting.';
  } catch (error) {
    const fallback = localStyleGuess(localInput);
    applyStyle(fallback);
    elements.aiStatus.textContent = `AI analysis failed. Applied local guess: ${error.message}`;
  } finally {
    elements.analyzeButton.disabled = false;
  }
}

function necklineDepth(kind, height) {
  const m = state.measurements;
  if (state.neckline === 'boat') return clamp(m.neck / 18, 0.12, height * 0.1);
  if (state.neckline === 'v') return clamp(m.neck / 5.8, 0.42, height * 0.28);
  if (state.neckline === 'square') return clamp(m.neck / 7.2, 0.28, height * 0.2);
  return kind === 'front' ? clamp(m.neck / 7.4, 0.26, height * 0.18) : clamp(m.neck / 14, 0.14, height * 0.11);
}

function isReferenceDressPreset() {
  return state.fitPreset === 'sleeveless-a-line-18';
}

function fitPresetLabel() {
  if (isReferenceDressPreset()) return '18-inch sleeveless A-line dress reference match';
  return '';
}

function bodiceDraft(kind) {
  const m = state.measurements;
  const sa = state.seamAllowance;
  const ease = state.ease;
  const referenceMatch = isReferenceDressPreset();
  const extension = kind === 'back' && state.closure ? (referenceMatch ? 0.38 : 0.32) : 0;
  const chestW = m.chest / 4 + ease / 2 + sa + extension;
  const waistW = m.waist / 4 + ease / 3 + sa + extension;
  const w = Math.max(chestW, waistW + (referenceMatch ? 0.1 : 0)) + (referenceMatch ? 0.1 : 0.14);
  const h = m.bodiceLength + sa * 2;
  const neckW = clamp(m.neck / (kind === 'front' ? 4.75 : 5.1), 0.22, w * (referenceMatch ? 0.31 : 0.34));
  const neckD = necklineDepth(kind, h);
  const shoulder = clamp(m.shoulder / 2 + sa * 0.35 + extension, w * 0.45, w * (referenceMatch ? 0.72 : 0.76));
  const shoulderDrop = clamp(m.shoulder * 0.045, 0.06, 0.22);
  const armY = clamp(m.armhole * (referenceMatch ? 0.54 : 0.58) + sa * 0.35, h * 0.35, h * 0.62);
  const waistCurve = clamp(h * 0.018, 0.03, 0.08);

  return { chestW, ease, extension, h, neckD, neckW, sa, shoulder, shoulderDrop, waistCurve, waistW, w, armY };
}

function necklinePath(kind, extension, neckD, neckW) {
  const origin = kind === 'back' ? extension : 0;
  if (state.neckline === 'square') {
    return `M ${fmt(origin)} ${fmt(neckD)} L ${fmt(origin + neckW)} ${fmt(neckD)} L ${fmt(origin + neckW)} 0`;
  }
  if (state.neckline === 'v') {
    return `M ${fmt(origin)} ${fmt(neckD)} L ${fmt(origin + neckW)} 0`;
  }
  return `M ${fmt(origin)} ${fmt(neckD)} Q ${fmt(origin + neckW * 0.46)} ${fmt(neckD * 0.08)} ${fmt(origin + neckW)} 0`;
}

function frontBodicePiece() {
  const { h, neckD, neckW, sa, shoulder, shoulderDrop, waistCurve, waistW, w, armY } = bodiceDraft('front');
  const stitchW = w - sa;
  const stitchWaist = Math.max(sa + 0.2, waistW - sa);
  const stitchH = h - sa;

  return {
    x: 0.55,
    y: 1.05,
    title: 'FRONT BODICE',
    cut: 'Cut 1 on Fold',
    foldLabel: 'CENTER FRONT / FOLD',
    d: [
      necklinePath('front', 0, neckD, neckW),
      `L ${fmt(shoulder)} ${fmt(shoulderDrop)}`,
      `C ${fmt(shoulder + 0.08)} ${fmt(armY * 0.28)} ${fmt(w * 0.72)} ${fmt(armY * 0.78)} ${fmt(w)} ${fmt(armY)}`,
      `C ${fmt(w * 0.97)} ${fmt(h * 0.73)} ${fmt(waistW + 0.12)} ${fmt(h * 0.9)} ${fmt(waistW)} ${fmt(h)}`,
      `Q ${fmt(waistW * 0.5)} ${fmt(h + waistCurve)} 0 ${fmt(h)}`,
      'Z',
    ].join(' '),
    stitch: [
      `M ${fmt(sa)} ${fmt(neckD + sa * 0.7)}`,
      `Q ${fmt(neckW * 0.52 + sa)} ${fmt(sa * 0.7)} ${fmt(neckW + sa * 0.55)} ${fmt(sa)}`,
      `L ${fmt(shoulder - sa * 0.2)} ${fmt(shoulderDrop + sa * 0.45)}`,
      `C ${fmt(shoulder + sa * 0.2)} ${fmt(armY * 0.32)} ${fmt(stitchW * 0.74)} ${fmt(armY * 0.78)} ${fmt(stitchW)} ${fmt(armY + sa * 0.25)}`,
      `C ${fmt(stitchW * 0.96)} ${fmt(h * 0.73)} ${fmt(stitchWaist + 0.08)} ${fmt(stitchH * 0.9)} ${fmt(stitchWaist)} ${fmt(stitchH)}`,
      `Q ${fmt(stitchWaist * 0.5)} ${fmt(stitchH + waistCurve * 0.7)} ${fmt(sa)} ${fmt(stitchH)}`,
    ].join(' '),
    fold: { x1: 0, y1: neckD, x2: 0, y2: h },
    grain: { x: w * 0.62, y1: 0.55, y2: h - 0.35 },
    labelX: w * 0.12,
    labelY: h * 0.55,
    width: w,
    height: h,
  };
}

function backBodicePiece() {
  const { extension, h, neckD, neckW, sa, shoulder, shoulderDrop, waistCurve, waistW, w, armY } = bodiceDraft('back');
  const stitchW = w - sa;
  const stitchWaist = Math.max(extension + sa + 0.2, waistW - sa);
  const stitchH = h - sa;

  return {
    x: 3.05,
    y: 1.05,
    title: 'BACK BODICE',
    cut: state.closure ? 'Cut 2' : 'Cut 1 on Fold',
    foldLabel: state.closure ? 'CENTER BACK / OPENING' : 'CENTER BACK / FOLD',
    d: [
      `M 0 ${fmt(neckD)}`,
      `L ${fmt(extension)} ${fmt(neckD)}`,
      `Q ${fmt(extension + neckW * 0.52)} ${fmt(neckD * 0.14)} ${fmt(extension + neckW)} 0`,
      `L ${fmt(shoulder)} ${fmt(shoulderDrop)}`,
      `C ${fmt(shoulder + 0.08)} ${fmt(armY * 0.3)} ${fmt(w * 0.72)} ${fmt(armY * 0.78)} ${fmt(w)} ${fmt(armY)}`,
      `C ${fmt(w * 0.98)} ${fmt(h * 0.73)} ${fmt(waistW + 0.1)} ${fmt(h * 0.9)} ${fmt(waistW)} ${fmt(h)}`,
      `Q ${fmt(waistW * 0.5)} ${fmt(h + waistCurve)} 0 ${fmt(h)}`,
      'Z',
    ].join(' '),
    stitch: [
      `M ${fmt(extension + sa)} ${fmt(neckD + sa * 0.45)}`,
      `Q ${fmt(extension + neckW * 0.55 + sa)} ${fmt(sa * 0.75)} ${fmt(extension + neckW + sa * 0.55)} ${fmt(sa)}`,
      `L ${fmt(shoulder - sa * 0.2)} ${fmt(shoulderDrop + sa * 0.45)}`,
      `C ${fmt(shoulder + sa * 0.2)} ${fmt(armY * 0.34)} ${fmt(stitchW * 0.74)} ${fmt(armY * 0.78)} ${fmt(stitchW)} ${fmt(armY + sa * 0.25)}`,
      `C ${fmt(stitchW * 0.97)} ${fmt(h * 0.73)} ${fmt(stitchWaist + 0.08)} ${fmt(stitchH * 0.9)} ${fmt(stitchWaist)} ${fmt(stitchH)}`,
      `Q ${fmt(stitchWaist * 0.5)} ${fmt(stitchH + waistCurve * 0.7)} ${fmt(extension + sa)} ${fmt(stitchH)}`,
    ].join(' '),
    fold: { x1: extension, y1: neckD, x2: extension, y2: h },
    grain: { x: w * 0.64, y1: 0.55, y2: h - 0.35 },
    labelX: w * 0.12,
    labelY: h * 0.55,
    width: w,
    height: h,
  };
}

function skirtPiece(kind) {
  const m = state.measurements;
  const sa = state.seamAllowance;
  const ease = state.ease;
  const onFold = kind === 'front';
  const topBase = m.waist / 4 + ease / 2 + sa;
  const top = state.template === 'gathered' ? topBase * 1.45 : topBase;
  const referenceMatch = isReferenceDressPreset();
  const flare =
    state.template === 'straight'
      ? clamp(m.skirtLength * 0.06, 0.12, 0.45)
      : state.template === 'gathered'
        ? clamp(m.skirtLength * 0.18, 0.45, 1.25)
        : clamp(m.skirtLength * (referenceMatch ? 0.2 : 0.18), 0.65, referenceMatch ? 1.25 : 1.1);
  const bottom = top + flare;
  const h = m.skirtLength + sa * 2 + 0.25;
  const waistCurve = clamp(h * 0.018, 0.04, 0.12);
  const hemCurve = clamp(h * 0.025, 0.05, 0.16);
  const stitchTop = Math.max(sa + 0.2, top - sa);
  const stitchBottom = Math.max(sa + 0.2, bottom - sa);
  const stitchH = h - sa;

  return {
    x: onFold ? 0.55 : 4.25,
    y: 4.0,
    title: onFold ? 'SKIRT FRONT' : 'SKIRT BACK',
    cut: onFold ? 'Cut 1 on Fold' : 'Cut 2',
    foldLabel: onFold ? 'CENTER FRONT / FOLD' : 'CENTER BACK / OPENING',
    d: [
      `M 0 ${fmt(waistCurve)}`,
      `Q ${fmt(top * 0.5)} ${fmt(-waistCurve)} ${fmt(top)} 0`,
      `C ${fmt(top + flare * 0.28)} ${fmt(h * 0.28)} ${fmt(bottom - flare * 0.15)} ${fmt(h * 0.75)} ${fmt(bottom)} ${fmt(h - hemCurve)}`,
      `Q ${fmt(bottom * 0.5)} ${fmt(h + hemCurve)} 0 ${fmt(h)}`,
      'Z',
    ].join(' '),
    stitch: [
      `M ${fmt(sa)} ${fmt(sa + waistCurve)}`,
      `Q ${fmt(top * 0.5)} ${fmt(sa * 0.45)} ${fmt(stitchTop)} ${fmt(sa)}`,
      `C ${fmt(stitchTop + flare * 0.24)} ${fmt(h * 0.28)} ${fmt(stitchBottom - flare * 0.14)} ${fmt(h * 0.74)} ${fmt(stitchBottom)} ${fmt(stitchH - hemCurve)}`,
      `Q ${fmt(stitchBottom * 0.5)} ${fmt(stitchH + hemCurve * 0.65)} ${fmt(sa)} ${fmt(stitchH)}`,
      'Z',
    ].join(' '),
    fold: { x1: 0, y1: 0, x2: 0, y2: h },
    grain: { x: bottom * 0.58, y1: 0.65, y2: h - 0.55 },
    labelX: bottom * 0.2,
    labelY: h * 0.5,
    width: bottom,
    height: h,
  };
}

function sleevePiece() {
  if (state.sleeve === 'sleeveless') return null;

  const m = state.measurements;
  const sa = state.seamAllowance;
  const w = m.armhole + sa * 2 + (state.sleeve === 'puff' ? 0.45 : 0.15);
  const h = state.sleeve === 'puff' ? 1.15 : 0.85;
  const cap = state.sleeve === 'puff' ? 0.55 : 0.38;

  return {
    x: 5.65,
    y: 1.05,
    title: state.sleeve === 'puff' ? 'PUFF SLEEVE' : 'SHORT SLEEVE',
    cut: 'Cut 2',
    foldLabel: '',
    d: [
      `M 0 ${fmt(cap)}`,
      `Q ${fmt(w / 2)} ${fmt(-cap * 0.45)} ${fmt(w)} ${fmt(cap)}`,
      `L ${fmt(w - 0.15)} ${fmt(h)}`,
      `L 0.15 ${fmt(h)}`,
      'Z',
    ].join(' '),
    stitch: `M ${fmt(sa)} ${fmt(cap + sa * 0.6)} Q ${fmt(w / 2)} ${fmt(sa * 0.5)} ${fmt(w - sa)} ${fmt(cap + sa * 0.6)} L ${fmt(w - sa)} ${fmt(h - sa)} L ${fmt(sa)} ${fmt(h - sa)} Z`,
    grain: { x: w / 2, y1: cap + 0.15, y2: h - 0.2 },
    labelX: w * 0.18,
    labelY: h * 0.62,
    width: w,
    height: h,
  };
}

function buildPieces() {
  return [frontBodicePiece(), backBodicePiece(), sleevePiece(), skirtPiece('front'), skirtPiece('back')].filter(Boolean);
}

function pieceBounds(piece) {
  return {
    left: piece.x,
    top: piece.y,
    right: piece.x + pieceDisplayWidth(piece),
    bottom: piece.y + pieceDisplayHeight(piece),
  };
}

function pieceDisplayWidth(piece) {
  return piece.rotated ? piece.height : piece.width;
}

function pieceDisplayHeight(piece) {
  return piece.rotated ? piece.width : piece.height;
}

function boundsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function piecesNeedPaging(pieces) {
  const right = pageSize.safeX + pageSize.safeWidth;
  const bottom = pageSize.safeY + pageSize.safeHeight;

  if (
    pieces.some((piece) => {
      const bounds = pieceBounds(piece);
      return bounds.left < pageSize.safeX || bounds.top < pageSize.safeY || bounds.right > right || bounds.bottom > bottom;
    })
  ) {
    return true;
  }

  for (let index = 0; index < pieces.length; index += 1) {
    for (let next = index + 1; next < pieces.length; next += 1) {
      if (boundsOverlap(pieceBounds(pieces[index]), pieceBounds(pieces[next]))) {
        return true;
      }
    }
  }

  return false;
}

function packPiecesOnPages(pieces) {
  const pages = [{ pieces: [] }];
  const layoutRight = pageSize.safeX + pageSize.safeWidth;
  const layoutHeight = pageSize.layoutBottom - pageSize.layoutY;
  let page = pages[0];
  let cursorX = pageSize.layoutX;
  let cursorY = pageSize.layoutY;
  let rowHeight = 0;

  pieces.forEach((piece) => {
    const preparedPiece =
      piece.title.startsWith('SKIRT') && piece.height > piece.width && piece.height <= layoutRight - pageSize.layoutX && piece.width <= layoutHeight
        ? { ...piece, rotated: true }
        : { ...piece };
    const width = pieceDisplayWidth(preparedPiece);
    const height = pieceDisplayHeight(preparedPiece);

    if (cursorX > pageSize.layoutX && cursorX + width > layoutRight) {
      cursorX = pageSize.layoutX;
      cursorY += rowHeight + pageSize.gapY;
      rowHeight = 0;
    }

    if (cursorY > pageSize.layoutY && cursorY + height > pageSize.layoutBottom) {
      page = { pieces: [] };
      pages.push(page);
      cursorX = pageSize.layoutX;
      cursorY = pageSize.layoutY;
      rowHeight = 0;
    }

    page.pieces.push({ ...preparedPiece, x: cursorX, y: cursorY });
    cursorX += width + pageSize.gapX;
    rowHeight = Math.max(rowHeight, height);
  });

  return pages.map((item, index) => ({
    ...item,
    number: index + 1,
    total: pages.length,
  }));
}

function patternPages() {
  const pieces = buildPieces();
  const pages = piecesNeedPaging(pieces) ? packPiecesOnPages(pieces) : [{ pieces, number: 1, total: 1 }];
  return pages.map((page) => ({ ...page, total: pages.length }));
}

function drawGrainline(grain) {
  if (!grain) return '';
  const arrow = 0.08;
  return `
    <line class="grain-line" x1="${fmt(grain.x)}" y1="${fmt(grain.y1)}" x2="${fmt(grain.x)}" y2="${fmt(grain.y2)}" />
    <path class="grain-line" d="M ${fmt(grain.x)} ${fmt(grain.y1)} l ${-arrow} ${arrow} M ${fmt(grain.x)} ${fmt(grain.y1)} l ${arrow} ${arrow}" />
    <path class="grain-line" d="M ${fmt(grain.x)} ${fmt(grain.y2)} l ${-arrow} ${-arrow} M ${fmt(grain.x)} ${fmt(grain.y2)} l ${arrow} ${-arrow}" />
    <text class="small-label" x="${fmt(grain.x + 0.08)}" y="${fmt((grain.y1 + grain.y2) / 2)}" transform="rotate(90 ${fmt(grain.x + 0.08)} ${fmt((grain.y1 + grain.y2) / 2)})">GRAINLINE</text>
  `;
}

function drawFoldLine(piece) {
  if (!piece.fold) return '';
  return `
    <line class="fold-line" x1="${fmt(piece.fold.x1)}" y1="${fmt(piece.fold.y1)}" x2="${fmt(piece.fold.x2)}" y2="${fmt(piece.fold.y2)}" />
    <text class="small-label" x="${fmt(piece.fold.x1 + 0.07)}" y="${fmt((piece.fold.y1 + piece.fold.y2) / 2)}" transform="rotate(90 ${fmt(piece.fold.x1 + 0.07)} ${fmt((piece.fold.y1 + piece.fold.y2) / 2)})">${escapeHtml(piece.foldLabel)}</text>
  `;
}

function drawPiece(piece) {
  const transform = piece.rotated
    ? `translate(${fmt(piece.x)} ${fmt(piece.y + piece.width)}) rotate(-90)`
    : `translate(${fmt(piece.x)} ${fmt(piece.y)})`;

  return `
    <g class="pattern-piece" transform="${transform}">
      <path class="cut-line" d="${piece.d}" />
      <path class="stitch-line" d="${piece.stitch}" />
      ${drawFoldLine(piece)}
      ${drawGrainline(piece.grain)}
      <path class="notch" d="M -0.05 0.72 L 0.05 0.82 L -0.05 0.92" />
      <text class="piece-label" x="${fmt(piece.labelX)}" y="${fmt(piece.labelY)}">${escapeHtml(piece.title)}</text>
      <text class="small-label" x="${fmt(piece.labelX)}" y="${fmt(piece.labelY + 0.18)}">${escapeHtml(piece.cut)}</text>
      <text class="small-label" x="${fmt(piece.labelX)}" y="${fmt(piece.labelY + 0.36)}">SA ${fmt(state.seamAllowance)} in included</text>
    </g>
  `;
}

function patternPageSvg(page, options = {}) {
  const title = `${profiles[state.profile].label} dress pattern - US Letter - page ${page.number} of ${page.total}`.toUpperCase();
  const sizeAttributes =
    typeof options.y === 'number'
      ? `x="0" y="${fmt(options.y)}" width="${pageSize.width}" height="${pageSize.height}"`
      : `width="${pageSize.width}in" height="${pageSize.height}in"`;

  return `
    <svg class="pattern-svg" xmlns="http://www.w3.org/2000/svg" ${sizeAttributes} viewBox="0 0 8.5 11" role="img" aria-label="US Letter doll dress sewing pattern page ${page.number}">
      <style>
        .page-border { fill: #fffdf8; stroke: #111; stroke-width: 0.006; }
        .safe-border { fill: none; stroke: #111; stroke-width: 0.012; stroke-dasharray: 0.12 0.09; }
        .grid-line { stroke: #e8e2d7; stroke-width: 0.004; }
        .cut-line { fill: none; stroke: #111; stroke-width: 0.012; }
        .stitch-line { fill: none; stroke: #111; stroke-width: 0.008; stroke-dasharray: 0.09 0.07; }
        .fold-line { stroke: #111; stroke-width: 0.01; stroke-dasharray: 0.12 0.07; }
        .grain-line { fill: none; stroke: #111; stroke-width: 0.008; }
        .notch { fill: none; stroke: #111; stroke-width: 0.008; }
        .piece-label { font-family: Arial, Helvetica, sans-serif; font-size: 0.14px; font-weight: 700; letter-spacing: 0; }
        .small-label { font-family: Arial, Helvetica, sans-serif; font-size: 0.105px; letter-spacing: 0; }
        .page-title { font-family: Arial, Helvetica, sans-serif; font-size: 0.14px; font-weight: 700; letter-spacing: 0; }
      </style>
      <rect class="page-border" x="0" y="0" width="8.5" height="11" />
      ${Array.from({ length: 8 }, (_, index) => `<line class="grid-line" x1="${index + 0.5}" y1="0.5" x2="${index + 0.5}" y2="10.5" />`).join('')}
      ${Array.from({ length: 10 }, (_, index) => `<line class="grid-line" x1="0.5" y1="${index + 0.5}" x2="8" y2="${index + 0.5}" />`).join('')}
      <rect class="safe-border" x="0.45" y="0.45" width="7.6" height="10.1" />
      <text class="page-title" x="0.55" y="0.32">WAWA PATTERN STUDIO - ${escapeHtml(title)}</text>
      <rect x="6.85" y="0.62" width="1" height="1" fill="none" stroke="#111" stroke-width="0.012" />
      <text class="small-label" x="6.86" y="1.78">1 x 1 inch test square</text>
      <text class="small-label" x="6.86" y="1.95">Print at 100% scale</text>
      ${page.pieces.map(drawPiece).join('')}
    </svg>
  `;
}

function patternSvg() {
  return patternPages().map(patternPageSvg).join('');
}

function standalonePatternSvg() {
  const pages = patternPages();
  if (pages.length === 1) return patternPageSvg(pages[0]);

  const height = pageSize.height * pages.length;
  return `
    <svg class="pattern-svg-pack" xmlns="http://www.w3.org/2000/svg" width="${pageSize.width}in" height="${fmt(height)}in" viewBox="0 0 ${pageSize.width} ${fmt(height)}" role="img" aria-label="US Letter doll dress sewing pattern page pack">
      ${pages.map((page, index) => patternPageSvg(page, { y: index * pageSize.height })).join('')}
    </svg>
  `;
}

function patternWarnings() {
  const m = state.measurements;
  const warnings = [];
  const pages = patternPages();
  if (pages.length > 1) {
    warnings.push(`Pattern pieces are split across ${pages.length} US Letter pages to prevent overlap.`);
  }
  if (m.chest <= 0 || m.waist <= 0 || m.skirtLength <= 0) {
    warnings.push('Measurements must be greater than zero.');
  }
  return warnings;
}

function notesHtml() {
  const warnings = patternWarnings();
  const preset = fitPresetLabel();
  const notes = [
    `<strong>Profile:</strong> ${escapeHtml(profiles[state.profile].label)}`,
    `<strong>Style:</strong> ${escapeHtml(state.sleeve)} ${escapeHtml(state.template)} dress, ${escapeHtml(state.neckline)} neckline`,
    `<strong>Seam allowance:</strong> ${fmt(state.seamAllowance)} in included`,
    `<strong>Buyer print note:</strong> Print on US Letter at 100% scale. Do not fit to page.`,
  ];
  if (preset) notes.push(`<strong>Reference match:</strong> ${escapeHtml(preset)}`);
  if (state.aiNotes) notes.push(`<strong>Draft notes:</strong> ${escapeHtml(state.aiNotes)}`);
  if (warnings.length) notes.push(`<strong>Check:</strong> ${warnings.map(escapeHtml).join(' ')}`);
  return notes.map((line) => `<p>${line}</p>`).join('');
}

function etsyListingText() {
  const pageCount = patternPages().length;
  return [
    'Digital sewing pattern for a doll dress.',
    '',
    'Included:',
    `- ${pageCount} US Letter printable pattern page${pageCount === 1 ? '' : 's'}`,
    '- Full-scale pattern pieces',
    '- English labels and cutting notes',
    '- 1 inch test square',
    '',
    'Pattern details:',
    `- Doll profile: ${profiles[state.profile].label}`,
    `- Style: ${state.sleeve} ${state.template} dress`,
    `- Neckline: ${state.neckline}`,
    `- Seam allowance included: ${fmt(state.seamAllowance)} in`,
    ...(fitPresetLabel() ? [`- Reference match: ${fitPresetLabel()}`] : []),
    '',
    'Printing:',
    '- Print at 100% scale',
    '- Do not scale or fit to page',
    '- Check the 1 x 1 inch test square before cutting',
    '',
    'This is a digital sewing pattern. No physical item will be shipped.',
    'The final pattern layout is generated from doll measurements and drafting rules. Test sew before commercial release.',
  ].join('\n');
}

function buildMeasurementRows() {
  return measurementFields
    .map(([key, label]) => {
      return `<tr><th>${label}</th><td>${fmt(state.measurements[key])} in</td></tr>`;
    })
    .join('');
}

function printDocumentHtml() {
  const imageHtml = state.imageDataUrl
    ? `<img class="print-cover-image" src="${state.imageDataUrl}" alt="Reference design" />`
    : `<div class="print-cover-image"></div>`;

  return `
    <article class="print-page print-cover">
      <h1>${escapeHtml(profiles[state.profile].label)} Dress Pattern</h1>
      <p class="subtitle">Digital sewing pattern - US Letter - Print at 100% scale</p>
      <div class="print-cover-grid">
        ${imageHtml}
        <table class="print-table">
          <tbody>
            <tr><th>Pattern</th><td>${escapeHtml(state.sleeve)} ${escapeHtml(state.template)} dress</td></tr>
            <tr><th>Doll profile</th><td>${escapeHtml(profiles[state.profile].label)}</td></tr>
            <tr><th>Neckline</th><td>${escapeHtml(state.neckline)}</td></tr>
            <tr><th>Closure</th><td>${state.closure ? 'Back closure' : 'No back extension'}</td></tr>
            <tr><th>Seam allowance</th><td>${fmt(state.seamAllowance)} in included</td></tr>
            ${fitPresetLabel() ? `<tr><th>Reference match</th><td>${escapeHtml(fitPresetLabel())}</td></tr>` : ''}
            ${buildMeasurementRows()}
          </tbody>
        </table>
      </div>
    </article>
    ${patternPages()
      .map(
        (page) => `
          <article class="print-page">
            ${patternPageSvg(page)}
          </article>
        `,
      )
      .join('')}
    <article class="print-page print-instructions">
      <h2>Sewing Instructions</h2>
      <ol>
        <li>Print this file on US Letter paper at 100% scale. Do not fit to page.</li>
        <li>Measure the 1 x 1 inch test square before cutting fabric.</li>
        <li>Cut fabric pieces as labeled. Transfer notches and grainlines.</li>
        <li>Sew shoulder seams, then finish neckline and armholes.</li>
        <li>Sew side seams. Attach skirt to bodice with right sides together.</li>
        <li>Finish the back closure with snaps, hook-and-loop tape, or tiny buttons.</li>
        <li>Hem the skirt. Press carefully with low heat for doll-scale fabric.</li>
      </ol>
      <h2>Notes</h2>
      <ul>
        <li>Seam allowance is included in every piece.</li>
        <li>This pattern is generated from measurements and should be test sewn before commercial release.</li>
        <li>This is a digital sewing pattern. No physical item will be shipped.</li>
      </ul>
    </article>
  `;
}

function render() {
  elements.patternPreview.innerHTML = patternSvg();
  elements.patternNotes.innerHTML = notesHtml();
  elements.etsyText.value = etsyListingText();
  elements.printDoc.innerHTML = printDocumentHtml();
}

function downloadSvg() {
  const blob = new Blob([standalonePatternSvg()], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wawa-${state.profile}-doll-dress-pattern-us-letter.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  elements.referenceImage.addEventListener('change', () => {
    const file = elements.referenceImage.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      elements.aiStatus.textContent = 'Choose a PNG, JPG, or WebP image.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      state.imageDataUrl = reader.result;
      state.imageName = file.name;
      elements.uploadLabel.textContent = file.name;
      elements.imagePreview.innerHTML = `<img src="${state.imageDataUrl}" alt="Uploaded design reference" />`;
      elements.aiStatus.textContent = 'Reference loaded. Add notes or use Analyze / Apply Notes to update the draft.';
      render();
    };
    reader.readAsDataURL(file);
  });

  elements.profileSelect.addEventListener('change', () => {
    clearReferenceMatch();
    state.profile = elements.profileSelect.value;
    state.measurements = { ...profiles[state.profile] };
    syncMeasurementInputs();
    render();
  });

  document.querySelectorAll('.segment').forEach((button) => {
    button.addEventListener('click', () => {
      clearReferenceMatch();
      setTemplate(button.dataset.template);
      render();
    });
  });

  elements.necklineSelect.addEventListener('change', () => {
    clearReferenceMatch();
    state.neckline = elements.necklineSelect.value;
    render();
  });

  elements.sleeveSelect.addEventListener('change', () => {
    clearReferenceMatch();
    state.sleeve = elements.sleeveSelect.value;
    render();
  });

  elements.closureCheckbox.addEventListener('change', () => {
    clearReferenceMatch();
    state.closure = elements.closureCheckbox.checked;
    render();
  });

  elements.easeInput.addEventListener('input', () => {
    clearReferenceMatch();
    state.ease = number(elements.easeInput.value, 0.2);
    render();
  });

  elements.seamAllowanceInput.addEventListener('input', () => {
    clearReferenceMatch();
    state.seamAllowance = number(elements.seamAllowanceInput.value, 0.25);
    render();
  });

  elements.analyzeButton.addEventListener('click', analyzeDesign);
  elements.downloadSvgButton.addEventListener('click', downloadSvg);
  elements.referencePresetButton.addEventListener('click', applyReferencePreset);
  elements.printButton.addEventListener('click', () => {
    render();
    window.print();
  });
}

createMeasurementInputs();
bindEvents();
render();
