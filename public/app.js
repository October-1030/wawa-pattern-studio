const profiles = {
  blythe: {
    label: 'Blythe / 12-inch doll (draft legacy)',
    chest: 4.2,
    waist: 3.25,
    hip: 4.4,
    shoulder: 1.55,
    neck: 1.15,
    bodiceLength: 1.65,
    backLength: 1.65,
    garmentLength: 4.75,
    skirtLength: 3.1,
    armhole: 1.1,
  },
  neoBlytheFactory: {
    label: 'Neo Blythe factory body / 28.5 cm',
    chest: 4.13,
    waist: 2.95,
    hip: 4.13,
    shoulder: 1.55,
    neck: 1.15,
    bodiceLength: 1.65,
    backLength: 1.65,
    garmentLength: 4.75,
    skirtLength: 3.1,
    armhole: 1.1,
  },
  barbie: {
    label: 'Barbie-style / 11.5-inch doll (draft legacy)',
    chest: 4.75,
    waist: 3.35,
    hip: 4.9,
    shoulder: 1.7,
    neck: 1.2,
    bodiceLength: 1.75,
    backLength: 1.75,
    garmentLength: 5.15,
    skirtLength: 3.4,
    armhole: 1.15,
  },
  barbieVintage: {
    label: 'Vintage Barbie / old-style 12-inch doll',
    chest: 6,
    waist: 3.75,
    hip: 5,
    shoulder: 2.5,
    neck: 2,
    bodiceLength: 2.5,
    backLength: 2.5,
    garmentLength: 5.5,
    skirtLength: 3,
    armhole: 2,
  },
  americanGirl: {
    label: 'American Girl style / 18-inch doll (draft verified)',
    chest: 11,
    waist: 10.5,
    hip: 12,
    shoulder: 4.25,
    neck: 4.1,
    bodiceLength: 4.3,
    backLength: 4.3,
    garmentLength: 10.5,
    skirtLength: 6.25,
    armhole: 3.2,
  },
  americanGirlStandard18: {
    label: 'American Girl standard / 18-inch doll (research)',
    chest: 11.75,
    waist: 11.5,
    hip: 12,
    shoulder: 4.5,
    neck: 6,
    bodiceLength: 4.4,
    backLength: 4.4,
    garmentLength: 10.5,
    skirtLength: 6.1,
    armhole: 3.2,
  },
  ourGeneration18: {
    label: 'Our Generation style / 18-inch doll (research)',
    chest: 12,
    waist: 11.33,
    hip: 12,
    shoulder: 4.5,
    neck: 6,
    bodiceLength: 4.5,
    backLength: 4.5,
    garmentLength: 10.6,
    skirtLength: 6.1,
    armhole: 3.2,
  },
  custom: {
    label: 'Custom measurements',
    chest: 4.2,
    waist: 3.25,
    shoulder: 1.55,
    neck: 1.15,
    bodiceLength: 1.65,
    backLength: 1.65,
    garmentLength: 4.75,
    skirtLength: 3.1,
    armhole: 1.1,
  },
};

let measurementFields = [
  ['chest', 'Chest'],
  ['waist', 'Waist'],
  ['shoulder', 'Shoulder'],
  ['neck', 'Neck'],
  ['bodiceLength', 'Bodice length'],
  ['skirtLength', 'Skirt length'],
  ['armhole', 'Armhole'],
];

const defaultDressMeasurements = {
  chest: 4.2,
  waist: 3.25,
  hip: 4.4,
  shoulder: 1.55,
  neck: 1.15,
  bodiceLength: 1.65,
  backLength: 1.65,
  garmentLength: 4.75,
  skirtLength: 3.1,
  armhole: 1.1,
  sleeveLength: 1,
  collarHeight: 0.25,
};

const catalog = {
  women: {
    label: 'Womenswear Drafting',
    headline: 'Womenswear Smart Drafting',
    description: 'Adult garment drafting templates kept in the same workflow for future Etsy and studio products.',
    templates: [
      {
        id: 'prototype',
        label: 'Block Pattern Drafting',
        summary: 'Bodice block with bust, waist, and back length.',
        title: 'Block Pattern Measurements',
        guide: 'Block Pattern Measurement Guide',
        kind: 'block',
        fields: [
          ['chest', 'Bust', 33],
          ['waist', 'Waist', 25.25],
          ['backLength', 'Back Length', 15],
        ],
      },
      {
        id: 'qipao',
        label: 'Qipao Pattern Drafting',
        summary: 'Close-fitting dress block with hip and collar controls.',
        title: 'Qipao Pattern Measurements',
        guide: 'Qipao Measurement Guide',
        kind: 'qipao',
        fields: [
          ['chest', 'Bust', 33],
          ['waist', 'Waist', 26.75],
          ['hip', 'Hip', 36.25],
          ['backLength', 'Back Length', 15],
          ['waistToHip', 'Waist to Hip Length', 7],
          ['skirtLength', 'Skirt Length', 30],
          ['collarHeight', 'Collar Height', 1.5],
        ],
      },
      {
        id: 'jiaao',
        label: 'Ming-style Jiaao Pattern Drafting',
        summary: 'Cross-collar jacket proportions with long sleeve span.',
        title: 'Ming-style Jiaao Measurements',
        guide: 'Ming-style Jiaao Measurement Guide',
        kind: 'jiaao',
        fields: [
          ['chest', 'Bust', 39.5],
          ['garmentLength', 'Garment Length', 23.5],
          ['sleeveLength', 'Total Sleeve Length', 63],
        ],
      },
      {
        id: 'trapeze',
        label: 'Trapeze Dress Pattern Drafting',
        summary: 'A-line trapeze dress from bust and garment length.',
        title: 'Trapeze Dress Measurements',
        guide: 'Trapeze Dress Measurement Guide',
        kind: 'trapeze',
        skirtTemplate: 'a-line',
        fields: [
          ['chest', 'Bust', 33],
          ['garmentLength', 'Garment Length', 31.5],
        ],
      },
    ],
  },
  bjd: {
    label: 'BJD Doll Drafting',
    headline: 'BJD Fixed Template Drafting',
    description: 'Choose a fixed doll dress template, select the doll profile, then export English US Letter PDF-ready pattern pages.',
    templates: [
      {
        id: 'prototype',
        label: 'BJD Bodice Block',
        summary: 'Fitted front and back bodice block for testing doll measurements.',
        title: 'BJD Block Pattern Measurements',
        guide: 'BJD Block Pattern Measurement Guide',
        kind: 'block',
        fixed: true,
        preset: { neckline: 'round', sleeve: 'sleeveless', skirt: 'straight', closure: true },
        fixedNotes: 'Use this first to test the doll bust, waist, shoulder, neck, and armhole values before selling styled patterns.',
        fields: [
          ['chest', 'Bust', 4.2],
          ['waist', 'Waist', 3.25],
          ['shoulder', 'Shoulder', 1.55],
          ['neck', 'Neck', 1.15],
          ['backLength', 'Back Length', 1.65],
          ['armhole', 'Armhole', 1.1],
        ],
      },
      {
        id: 'trapeze',
        label: 'BJD Trapeze Dress',
        summary: 'Sleeveless A-line dress with back closure. Best first Etsy template.',
        title: 'BJD Trapeze Dress Measurements',
        guide: 'BJD Trapeze Measurement Guide',
        kind: 'trapeze',
        fixed: true,
        preset: { neckline: 'round', sleeve: 'sleeveless', skirt: 'a-line', closure: true },
        fixedNotes: 'Fixed sleeveless round-neck A-line dress. Good for AI reference images that show a simple loose doll dress.',
        fields: [
          ['chest', 'Bust', 4.2],
          ['garmentLength', 'Garment Length', 4.75],
        ],
      },
      {
        id: 'gathered-waist',
        label: 'BJD Gathered Waist Dress',
        summary: 'Sleeveless bodice with a fuller gathered skirt.',
        title: 'BJD Gathered Waist Dress Measurements',
        guide: 'Gathered Dress Measurement Guide',
        kind: 'dress',
        fixed: true,
        preset: { neckline: 'round', sleeve: 'sleeveless', skirt: 'gathered', closure: true },
        fixedNotes: 'Fixed round-neck bodice plus gathered skirt. Use for ruffle, full skirt, or party dress references.',
        fields: [
          ['chest', 'Bust', 4.2],
          ['waist', 'Waist', 3.25],
          ['bodiceLength', 'Bodice Length', 1.65],
          ['skirtLength', 'Skirt Length', 3.1],
        ],
      },
      {
        id: 'puff-sleeve',
        label: 'BJD Puff Sleeve Dress',
        summary: 'Round-neck dress with puff sleeves and a gathered skirt.',
        title: 'BJD Puff Sleeve Dress Measurements',
        guide: 'Puff Sleeve Dress Measurement Guide',
        kind: 'dress',
        fixed: true,
        preset: { neckline: 'round', sleeve: 'puff', skirt: 'gathered', closure: true },
        fixedNotes: 'Fixed puff-sleeve dress with a gathered skirt. Use for cute, lolita, prairie, or party dress references.',
        fields: [
          ['chest', 'Bust', 4.2],
          ['waist', 'Waist', 3.25],
          ['shoulder', 'Shoulder', 1.55],
          ['armhole', 'Armhole', 1.1],
          ['bodiceLength', 'Bodice Length', 1.65],
          ['skirtLength', 'Skirt Length', 3.1],
        ],
      },
      {
        id: 'qipao',
        label: 'BJD Qipao Dress',
        summary: 'Slim straight dress with V-style front and collar height control.',
        title: 'BJD Qipao Measurements',
        guide: 'BJD Qipao Measurement Guide',
        kind: 'qipao',
        fixed: true,
        preset: { neckline: 'v', sleeve: 'sleeveless', skirt: 'straight', closure: true },
        fixedNotes: 'Fixed slim qipao-style dress draft. Collar height is listed for the final Etsy measurement table.',
        fields: [
          ['chest', 'Bust', 4.45],
          ['waist', 'Waist', 3.55],
          ['hip', 'Hip', 4.85],
          ['backLength', 'Back Length', 2],
          ['waistToHip', 'Waist to Hip Length', 1.6],
          ['skirtLength', 'Skirt Length', 4],
          ['collarHeight', 'Collar Height', 0.25],
        ],
      },
      {
        id: 'jiaao',
        label: 'BJD Jiaao Jacket',
        summary: 'Loose cross-front jacket template for traditional-style doll outfits.',
        title: 'BJD Jiaao Measurements',
        guide: 'BJD Jiaao Measurement Guide',
        kind: 'jiaao',
        fixed: true,
        preset: { neckline: 'v', sleeve: 'short', skirt: 'straight', closure: true },
        fixedNotes: 'Fixed loose jacket-style draft. Use as a simple traditional top template before adding advanced overlap pieces.',
        fields: [
          ['chest', 'Bust', 5.25],
          ['garmentLength', 'Garment Length', 3.15],
          ['sleeveLength', 'Total Sleeve Length', 8.4],
        ],
      },
    ],
  },
  pet: {
    label: 'Petwear Drafting',
    headline: 'Petwear Smart Drafting',
    description: 'Petwear template structure copied as an architecture target, with local export controls.',
    templates: [
      {
        id: 'vest',
        label: 'Pet Vest Pattern Drafting',
        summary: 'Vest draft from bust, neck, back length, and leg gap.',
        title: 'Pet Vest Measurements',
        guide: 'Pet Vest Measurement Guide',
        kind: 'pet-vest',
        fields: [
          ['chest', 'Bust', 12.5],
          ['neck', 'Neck', 8.75],
          ['backLength', 'Back Length', 8],
          ['frontLegGap', 'Front Leg Gap', 2],
        ],
      },
      {
        id: 'adjustable-vest',
        label: 'Adjustable Pet Vest Drafting',
        summary: 'Adjustable vest with the same core pet measurements.',
        title: 'Adjustable Pet Vest Measurements',
        guide: 'Adjustable Pet Vest Measurement Guide',
        kind: 'pet-vest',
        fields: [
          ['chest', 'Bust', 12.5],
          ['neck', 'Neck', 9],
          ['backLength', 'Back Length', 9],
          ['frontLegGap', 'Front Leg Gap', 2.35],
        ],
      },
      {
        id: 'one-piece',
        label: 'One-Piece Petwear Drafting',
        summary: 'One-piece petwear block.',
        title: 'One-Piece Petwear Measurements',
        guide: 'One-Piece Measurement Guide',
        kind: 'pet-one-piece',
        fields: [
          ['chest', 'Bust', 12.5],
          ['neck', 'Neck', 9],
          ['backLength', 'Back Length', 9],
          ['frontLegGap', 'Front Leg Gap', 2.35],
        ],
      },
      {
        id: 'tiered-dress',
        label: 'Tiered Dress Petwear Drafting',
        summary: 'Pet dress template with gathered skirt behavior.',
        title: 'Tiered Dress Petwear Measurements',
        guide: 'Tiered Dress Measurement Guide',
        kind: 'pet-dress',
        skirtTemplate: 'gathered',
        fields: [
          ['chest', 'Bust', 12.5],
          ['neck', 'Neck', 9],
          ['backLength', 'Back Length', 9],
          ['frontLegGap', 'Front Leg Gap', 2.35],
        ],
      },
      {
        id: 'raincoat',
        label: 'Pet Raincoat Drafting',
        summary: 'Raincoat template with hood measurements.',
        title: 'Pet Raincoat Measurements',
        guide: 'Pet Raincoat Measurement Guide',
        kind: 'pet-raincoat',
        fields: [
          ['chest', 'Bust', 12.5],
          ['neck', 'Neck', 9],
          ['backLength', 'Back Length', 9],
          ['headCircumference', 'Head Circumference', 11.5],
          ['headHeight', 'Head Height', 4.75],
        ],
      },
      {
        id: 'one-piece-plus',
        label: 'Plus-Size One-Piece Petwear Drafting',
        summary: 'Large pet one-piece draft with belly girth.',
        title: 'Plus-Size One-Piece Petwear Measurements',
        guide: 'Plus-Size One-Piece Measurement Guide',
        kind: 'pet-one-piece',
        fields: [
          ['chest', 'Bust', 15.75],
          ['neck', 'Neck', 9],
          ['bellyGirth', 'Belly Girth', 18],
          ['backLength', 'Back Length', 11.75],
          ['frontLegGap', 'Front Leg Gap', 2],
        ],
      },
      {
        id: 'two-leg',
        label: 'Two-Leg Petwear Drafting',
        summary: 'Two-leg petwear with front-leg circumference and length.',
        title: 'Two-Leg Petwear Measurements',
        guide: 'Two-Leg Measurement Guide',
        kind: 'pet-two-leg',
        fields: [
          ['chest', 'Bust', 22.75],
          ['neck', 'Neck', 13.75],
          ['backLength', 'Back Length', 15.75],
          ['frontLegGap', 'Front Leg Gap', 4.75],
          ['frontLegCircumference', 'Front Leg Circumference', 7],
          ['frontLegLength', 'Front Leg Length', 7],
        ],
      },
      {
        id: 'four-leg',
        label: 'Four-Leg Petwear Drafting',
        summary: 'Four-leg petwear with hind leg controls.',
        title: 'Four-Leg Petwear Measurements',
        guide: 'Four-Leg Measurement Guide',
        kind: 'pet-four-leg',
        fields: [
          ['chest', 'Bust', 22.75],
          ['neck', 'Neck', 13.75],
          ['backLength', 'Back Length', 15.75],
          ['frontLegGap', 'Front Leg Gap', 4.75],
          ['frontLegCircumference', 'Front Leg Circumference', 7],
          ['frontLegLength', 'Front Leg Length', 11],
          ['hipToThighRoot', 'Hip to Thigh Root', 9.5],
          ['hindLegCircumference', 'Hind Leg Circumference', 10.25],
          ['hindLegLength', 'Hind Leg Length', 13],
        ],
      },
    ],
  },
};

const state = {
  category: 'bjd',
  imageDataUrl: '',
  imageName: '',
  profile: 'blythe',
  template: 'a-line',
  templateId: 'trapeze',
  neckline: 'round',
  sleeve: 'sleeveless',
  closure: true,
  ease: 0.2,
  seamAllowance: 0.25,
  measurements: { ...profiles.blythe },
  aiNotes: '',
  fitPreset: 'basic',
  unit: 'in',
  zoom: 1,
};

const elements = {
  analyzeButton: document.getElementById('analyzeButton'),
  aiStatus: document.getElementById('aiStatus'),
  aboutView: document.getElementById('aboutView'),
  backToStudioButton: document.getElementById('backToStudioButton'),
  backToTemplatesButton: document.getElementById('backToTemplatesButton'),
  closureCheckbox: document.getElementById('closureCheckbox'),
  downloadSvgButton: document.getElementById('downloadSvgButton'),
  easeInput: document.getElementById('easeInput'),
  etsyText: document.getElementById('etsyText'),
  exportPdfButton: document.getElementById('exportPdfButton'),
  exportSvgPanelButton: document.getElementById('exportSvgPanelButton'),
  fitButton: document.getElementById('fitButton'),
  guideTitle: document.getElementById('guideTitle'),
  homeView: document.getElementById('homeView'),
  imagePreview: document.getElementById('imagePreview'),
  measurementGuide: document.getElementById('measurementGuide'),
  measurementGrid: document.getElementById('measurementGrid'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  modalCloseButton: document.getElementById('modalCloseButton'),
  modalContent: document.getElementById('modalContent'),
  necklineSelect: document.getElementById('necklineSelect'),
  patternNotes: document.getElementById('patternNotes'),
  patternPreview: document.getElementById('patternPreview'),
  previewTitle: document.getElementById('previewTitle'),
  printButton: document.getElementById('printButton'),
  printDoc: document.getElementById('printDoc'),
  printNowButton: document.getElementById('printNowButton'),
  printPreviewPages: document.getElementById('printPreviewPages'),
  printPreviewView: document.getElementById('printPreviewView'),
  productSubtitle: document.getElementById('productSubtitle'),
  productTitle: document.getElementById('productTitle'),
  productView: document.getElementById('productView'),
  labView: document.getElementById('labView'),
  labImageInput: document.getElementById('labImageInput'),
  labImagePreview: document.getElementById('labImagePreview'),
  labNotes: document.getElementById('labNotes'),
  labAnalyzeButton: document.getElementById('labAnalyzeButton'),
  labAnalysisResult: document.getElementById('labAnalysisResult'),
  labDollSelect: document.getElementById('labDollSelect'),
  labGenerateButton: document.getElementById('labGenerateButton'),
  labProductResult: document.getElementById('labProductResult'),
  labQualityList: document.getElementById('labQualityList'),
  productDollSelect: document.getElementById('productDollSelect'),
  productStyleSelect: document.getElementById('productStyleSelect'),
  generateProductPdfButton: document.getElementById('generateProductPdfButton'),
  productGenerateStatus: document.getElementById('productGenerateStatus'),
  productResult: document.getElementById('productResult'),
  productQualityList: document.getElementById('productQualityList'),
  profileSelect: document.getElementById('profileSelect'),
  referencePresetButton: document.getElementById('referencePresetButton'),
  referenceImage: document.getElementById('referenceImage'),
  seamAllowanceInput: document.getElementById('seamAllowanceInput'),
  sleeveSelect: document.getElementById('sleeveSelect'),
  studioView: document.getElementById('studioView'),
  styleNotes: document.getElementById('styleNotes'),
  templateView: document.getElementById('templateView'),
  unitSelect: document.getElementById('unitSelect'),
  uploadLabel: document.getElementById('uploadLabel'),
  zoomInButton: document.getElementById('zoomInButton'),
  zoomOutButton: document.getElementById('zoomOutButton'),
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

const CM_PER_INCH = 2.54;

function unitLabel() {
  return state.unit === 'cm' ? 'cm' : 'in';
}

function toDisplayUnit(valueInches) {
  return state.unit === 'cm' ? number(valueInches) * CM_PER_INCH : number(valueInches);
}

function fromDisplayUnit(value) {
  return state.unit === 'cm' ? number(value) / CM_PER_INCH : number(value);
}

function displayMeasurement(valueInches) {
  return state.unit === 'cm' ? fmt(toDisplayUnit(valueInches)) : fmt(valueInches);
}

function dualMeasurement(valueInches) {
  return `${fmt(valueInches)} in / ${fmt(number(valueInches) * CM_PER_INCH)} cm`;
}

function measurementStep() {
  return state.unit === 'cm' ? '0.1' : '0.05';
}

function currentCategory() {
  return catalog[state.category] || catalog.bjd;
}

function currentTemplate() {
  return currentCategory().templates.find((template) => template.id === state.templateId) || catalog.bjd.templates[3];
}

function templateDefaults(template = currentTemplate()) {
  const measurements = { ...defaultDressMeasurements };
  template.fields.forEach(([key, _label, value]) => {
    measurements[key] = value;
  });
  if (state.category === 'bjd' && profiles[state.profile]) {
    Object.assign(measurements, profiles[state.profile]);
    template.fields.forEach(([key, _label, value]) => {
      if (!(key in profiles[state.profile])) measurements[key] = value;
    });
  }
  measurements.bodiceLength = measurements.bodiceLength || measurements.backLength || measurements.garmentLength * 0.38;
  measurements.backLength = measurements.backLength || measurements.bodiceLength;
  measurements.skirtLength = measurements.skirtLength || Math.max(1, (measurements.garmentLength || 4.75) - measurements.bodiceLength);
  measurements.waist = measurements.waist || measurements.chest * 0.78;
  measurements.hip = measurements.hip || measurements.chest * 1.05;
  measurements.shoulder = measurements.shoulder || measurements.chest * 0.38;
  measurements.neck = measurements.neck || measurements.chest * 0.28;
  measurements.armhole = measurements.armhole || measurements.chest * 0.26;
  return measurements;
}

function draftMeasurements() {
  const m = { ...defaultDressMeasurements, ...state.measurements };
  m.bodiceLength = m.bodiceLength || m.backLength || m.garmentLength * 0.38;
  m.backLength = m.backLength || m.bodiceLength;
  m.skirtLength = m.skirtLength || Math.max(1, (m.garmentLength || 4.75) - m.bodiceLength);
  m.waist = m.waist || m.chest * 0.78;
  m.hip = m.hip || m.chest * 1.05;
  m.shoulder = m.shoulder || m.chest * 0.38;
  m.neck = m.neck || m.chest * 0.28;
  m.armhole = m.armhole || m.chest * 0.26;
  return m;
}

function applyTemplateDefaults(template = currentTemplate()) {
  measurementFields = template.fields.map(([key, label]) => [key, label]);
  state.measurements = templateDefaults(template);
  const preset = template.preset || {};
  state.template = preset.skirt || template.skirtTemplate || (template.kind === 'qipao' ? 'straight' : 'a-line');
  state.sleeve = preset.sleeve || (template.kind === 'jiaao' || template.kind.includes('leg') ? 'short' : 'sleeveless');
  state.neckline = preset.neckline || (template.kind === 'qipao' || template.kind === 'jiaao' ? 'v' : 'round');
  state.closure = preset.closure !== false;
  state.fitPreset = 'basic';
  state.aiNotes = '';
}

function routeHash(category, templateId = '') {
  if (category === 'home') return '#/';
  if (category === 'product') return '#/product';
  if (category === 'lab') return '#/lab';
  if (category === 'about') return '#/about-us';
  const categoryPath = category === 'bjd' ? 'bjd-dolls' : category === 'women' ? 'womenswear' : category === 'pet' ? 'petwear' : category;
  if (!templateId) return `#/${categoryPath}`;
  return `#/${categoryPath}/${templateId}`;
}

function categoryFromPath(path) {
  if (path === 'bjd-dolls') return 'bjd';
  if (path === 'womenswear') return 'women';
  if (path === 'petwear') return 'pet';
  return catalog[path] ? path : '';
}

function setRoute(category, templateId = '') {
  window.location.hash = routeHash(category, templateId);
}

function setVisibleView(view) {
  elements.homeView.classList.toggle('is-hidden', view !== 'home');
  elements.templateView.classList.toggle('is-hidden', view !== 'templates');
  elements.productView.classList.toggle('is-hidden', view !== 'product');
  elements.labView.classList.toggle('is-hidden', view !== 'lab');
  elements.aboutView.classList.toggle('is-hidden', view !== 'about');
  elements.studioView.classList.toggle('is-hidden', view !== 'studio');
  elements.printPreviewView.classList.toggle('is-hidden', view !== 'printPreview');
}

function updateNav(activeCategory) {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.route === activeCategory);
  });
}

function renderHome() {
  elements.homeView.innerHTML = `
    <div class="home-copy">
      <h1>Wawa Pattern Studio</h1>
      <p>Professional custom drafting for doll clothes, womenswear, and petwear. Enter fixed model measurements and export English US Letter pattern pages for Etsy products.</p>
    </div>
    <div class="project-cards">
      <button class="project-card product-card-highlight" type="button" data-category-card="lab">
        <span>Upload Image Lab</span>
        <small>Internal test: upload an outfit image, match a template, and generate an experimental PDF.</small>
      </button>
      <button class="project-card product-card-highlight" type="button" data-category-card="product">
        <span>Doll Pattern Maker</span>
        <small>Choose a doll and generate a product-quality printable PDF with seam checks.</small>
      </button>
      ${Object.entries(catalog)
        .map(
          ([key, category]) => `
            <button class="project-card" type="button" data-category-card="${key}">
              <span>${escapeHtml(category.label)}</span>
              <small>${escapeHtml(category.description)}</small>
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderTemplateList(categoryKey) {
  const category = catalog[categoryKey] || catalog.bjd;
  elements.templateView.innerHTML = `
    <div class="template-heading">
      <h1>${escapeHtml(category.headline)}</h1>
      <p>${escapeHtml(category.description)}</p>
    </div>
    <div class="template-grid">
      ${category.templates
        .map(
          (template) => `
            <button class="template-card" type="button" data-template-card="${escapeHtml(template.id)}">
              ${template.fixed ? '<em>Fixed template</em>' : ''}
              <span>${escapeHtml(template.label)}</span>
              <small>${escapeHtml(template.summary)}</small>
            </button>
          `,
        )
        .join('')}
      <button class="template-card is-muted" type="button" disabled>
        <span>Coming Soon</span>
        <small>More drafting templates can be added to the same catalog.</small>
      </button>
    </div>
  `;
}

function renderAbout() {
  setVisibleView('about');
  updateNav('about');
}

function renderProductMaker() {
  setVisibleView('product');
  updateNav('product');
}

function renderImageLab() {
  setVisibleView('lab');
  updateNav('lab');
}

function qualityCheckItems(quality) {
  if (!quality) return '<li>Generate a PDF to view checks.</li>';
  const items = [
    ['Front/back pieces complete', quality.has_front && quality.has_back],
    ['Shoulder seams match', quality.shoulder_match],
    ['Side seams match', quality.side_match],
    [quality.tiled_layout_required ? 'Tiled US Letter layout ready' : 'US Letter layout fits', quality.tiled_layout_required ? quality.tiled_layout_available : quality.layout_fits_us_letter],
    ['1 inch test square included', quality.has_test_square],
    ['Cutting list included', quality.has_cutting_list],
    ['Child-friendly sewing steps included', quality.has_sewing_steps && quality.child_friendly],
    ['Sellable gate passed', quality.sellable_gate],
  ];
  return items
    .map(([label, ok]) => `<li class="${ok ? 'is-pass' : 'is-fail'}">${ok ? '✓' : '×'} ${escapeHtml(label)}</li>`)
    .join('');
}

async function requestProductPdf({ doll, style, resultEl, qualityEl, statusEl, buttonEl }) {
  buttonEl.disabled = true;
  if (statusEl) statusEl.textContent = 'Generating product PDF...';
  resultEl.innerHTML = '<p>Working...</p>';
  qualityEl.innerHTML = '<li>Running checks...</li>';

  try {
    const response = await fetch('/api/generate-product-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doll, style }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'PDF generation failed.');
    if (statusEl) statusEl.textContent = 'PDF generated. Open it and print at 100% scale.';
    resultEl.innerHTML = `
      <p><strong>${escapeHtml(data.pdfName)}</strong></p>
      <a class="primary-button download-link" href="${escapeHtml(data.pdfUrl)}" target="_blank" rel="noopener">Open / Download PDF</a>
      ${data.quality?.experimental ? '<p class="status-line">Experimental pattern. Test sew before public release.</p>' : ''}
      ${data.quality?.tiled_layout_required ? '<p class="status-line">This large doll pattern uses tiled pages. Tape pages together before cutting.</p>' : ''}
    `;
    qualityEl.innerHTML = qualityCheckItems(data.quality);
  } catch (error) {
    if (statusEl) statusEl.textContent = error.message;
    resultEl.innerHTML = `<p>Could not generate PDF: ${escapeHtml(error.message)}</p>`;
    qualityEl.innerHTML = '<li class="is-fail">× Generation failed</li>';
  } finally {
    buttonEl.disabled = false;
  }
}

async function generateProductPdf() {
  await requestProductPdf({
    doll: elements.productDollSelect.value,
    style: elements.productStyleSelect.value,
    resultEl: elements.productResult,
    qualityEl: elements.productQualityList,
    statusEl: elements.productGenerateStatus,
    buttonEl: elements.generateProductPdfButton,
  });
}

function analyzeLabImage() {
  const notes = String(elements.labNotes.value || '').toLowerCase();
  const hasImage = Boolean(elements.labImageInput.files && elements.labImageInput.files[0]);
  const isPinafore = hasImage || /pinafore|jumper|strap|bib|waistband|pocket|背带|围裙/.test(notes);
  const style = isPinafore ? 'easy-pinafore-dress' : 'easy-a-line-dress';
  elements.labAnalysisResult.innerHTML = `
    <p><strong>Detected template:</strong> ${style === 'easy-pinafore-dress' ? 'Easy Pinafore Dress' : 'Easy A-Line Dress'}</p>
    <p><strong>Confidence:</strong> ${style === 'easy-pinafore-dress' ? 'experimental / medium' : 'basic / high'}</p>
    <p><strong>Note:</strong> Image Lab matches the picture to an internal template. It does not freehand arbitrary paper patterns.</p>
  `;
  elements.labAnalysisResult.dataset.matchedStyle = style;
}

async function generateLabPdf() {
  const style = elements.labAnalysisResult.dataset.matchedStyle || 'easy-pinafore-dress';
  await requestProductPdf({
    doll: elements.labDollSelect.value,
    style,
    resultEl: elements.labProductResult,
    qualityEl: elements.labQualityList,
    statusEl: null,
    buttonEl: elements.labGenerateButton,
  });
}

function showTemplateList(categoryKey) {
  state.category = categoryKey;
  renderTemplateList(categoryKey);
  setVisibleView('templates');
  updateNav(categoryKey);
}

function showStudio(categoryKey, templateId) {
  state.category = categoryKey;
  state.templateId = templateId;
  applyTemplateDefaults(currentTemplate());
  createMeasurementInputs();
  syncTemplateControls();
  setVisibleView('studio');
  updateNav(categoryKey);
  render();
}

function routeFromHash() {
  const routeText = window.location.hash
    ? window.location.hash.replace(/^#\/?/, '')
    : window.location.pathname.replace(/^\/?/, '');
  const parts = routeText.split('/').filter(Boolean);
  if (!parts.length) {
    renderHome();
    setVisibleView('home');
    updateNav('home');
    return;
  }
  if (parts[0] === 'about-us') {
    renderAbout();
    return;
  }
  if (parts[0] === 'product') {
    renderProductMaker();
    return;
  }
  if (parts[0] === 'lab') {
    renderImageLab();
    return;
  }
  const categoryKey = categoryFromPath(parts[0]);
  if (!categoryKey) {
    setRoute('home');
    return;
  }
  if (parts[1]) {
    const templateExists = catalog[categoryKey].templates.some((template) => template.id === parts[1]);
    if (templateExists) {
      showStudio(categoryKey, parts[1]);
      return;
    }
  }
  showTemplateList(categoryKey);
}

function syncTemplateControls() {
  elements.profileSelect.disabled = state.category !== 'bjd';
  elements.profileSelect.closest('.field').classList.toggle('is-disabled', state.category !== 'bjd');
  elements.profileSelect.value = state.profile;
  elements.unitSelect.value = state.unit;
  elements.necklineSelect.value = state.neckline;
  elements.sleeveSelect.value = state.sleeve;
  elements.closureCheckbox.checked = state.closure;
  elements.easeInput.value = state.ease;
  elements.seamAllowanceInput.value = state.seamAllowance;
  setTemplate(state.template);
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
          <span>${label} (${unitLabel()})</span>
          <input type="number" min="0" step="${measurementStep()}" data-measurement="${key}" value="${displayMeasurement(state.measurements[key])}" />
        </label>
      `;
    })
    .join('');

  elements.measurementGrid.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      clearReferenceMatch();
      state.profile = 'custom';
      elements.profileSelect.value = 'custom';
      state.measurements[input.dataset.measurement] = fromDisplayUnit(input.value);
      render();
    });
  });
}

function syncMeasurementInputs() {
  elements.measurementGrid.querySelectorAll('input').forEach((input) => {
    input.value = displayMeasurement(state.measurements[input.dataset.measurement]);
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
    templateId: 'trapeze',
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
  const templateId =
    text.includes('qipao') || text.includes('cheongsam') || text.includes('mandarin collar')
      ? 'qipao'
      : text.includes('jiaao') || text.includes('jacket') || text.includes('hanfu')
        ? 'jiaao'
        : sleeve === 'puff'
          ? 'puff-sleeve'
          : skirt === 'gathered'
            ? 'gathered-waist'
            : skirt === 'a-line'
              ? 'trapeze'
              : 'prototype';

  return {
    closure,
    designNotes:
      fitPreset === 'sleeveless-a-line-18'
        ? 'Local reference match: 18-inch sleeveless A-line dress with back opening.'
        : `Local style guess matched fixed template: ${templateId}. Configure OPENAI_API_KEY for image analysis.`,
    fitPreset,
    neckline,
    profile,
    skirt,
    sleeve,
    templateId,
    confidence: 0.35,
  };
}

function applyReferencePreset() {
  applyStyle(referenceDressStyle());
  elements.aiStatus.textContent = 'Applied 18-inch sleeveless A-line reference preset.';
}

function applyStyle(style) {
  if (style.templateId && currentCategory().templates.some((template) => template.id === style.templateId)) {
    state.templateId = style.templateId;
    applyTemplateDefaults(currentTemplate());
    createMeasurementInputs();
    syncTemplateControls();
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', routeHash(state.category, state.templateId));
    }
  }
  if (profiles[style.profile]) {
    state.profile = style.profile;
    state.measurements = templateDefaults(currentTemplate());
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
    elements.aiStatus.textContent = 'Applied a local style guess from notes. Upload an image and configure an AI provider key in .env for image analysis.';
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
      const providerLabel = data.provider ? `${String(data.provider).toUpperCase()} ` : 'AI ';
      elements.aiStatus.textContent = data.fallback
        ? `${providerLabel}key is not configured. Applied a local style guess from notes.`
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
  const m = draftMeasurements();
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
  const m = draftMeasurements();
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

  const m = draftMeasurements();
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
      <text class="small-label" x="${fmt(piece.labelX)}" y="${fmt(piece.labelY + 0.36)}">SA ${escapeHtml(dualMeasurement(state.seamAllowance))} included</text>
    </g>
  `;
}

function patternPageSvg(page, options = {}) {
  const template = currentTemplate();
  const title = `${template.label} - US Letter - page ${page.number} of ${page.total}`.toUpperCase();
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
      <text class="small-label" x="6.86" y="1.78">1 x 1 in test square</text>
      <text class="small-label" x="6.86" y="1.95">2.54 x 2.54 cm</text>
      <text class="small-label" x="6.86" y="2.12">Print at 100% scale</text>
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
  const m = draftMeasurements();
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
  const template = currentTemplate();
  const notes = [
    `<strong>Template:</strong> ${escapeHtml(template.label)}`,
    `<strong>Category:</strong> ${escapeHtml(currentCategory().label)}`,
    ...(template.fixed ? [`<strong>Fixed template:</strong> ${escapeHtml(template.fixedNotes || template.summary)}`] : []),
    ...(state.category === 'bjd' ? [`<strong>Doll profile:</strong> ${escapeHtml(profiles[state.profile].label)}`] : []),
    `<strong>Style:</strong> ${escapeHtml(state.sleeve)} ${escapeHtml(state.template)} draft, ${escapeHtml(state.neckline)} neckline`,
    `<strong>Seam allowance:</strong> ${escapeHtml(dualMeasurement(state.seamAllowance))} included`,
    `<strong>Buyer print note:</strong> Print on US Letter at 100% scale. Do not fit to page.`,
  ];
  if (preset) notes.push(`<strong>Reference match:</strong> ${escapeHtml(preset)}`);
  if (state.aiNotes) notes.push(`<strong>Draft notes:</strong> ${escapeHtml(state.aiNotes)}`);
  if (warnings.length) notes.push(`<strong>Check:</strong> ${warnings.map(escapeHtml).join(' ')}`);
  return notes.map((line) => `<p>${line}</p>`).join('');
}

function etsyListingText() {
  const pageCount = patternPages().length;
  const template = currentTemplate();
  return [
    `Digital sewing pattern: ${template.label}.`,
    '',
    'Included:',
    `- ${pageCount} US Letter printable pattern page${pageCount === 1 ? '' : 's'}`,
    '- Full-scale pattern pieces',
    '- English labels and cutting notes',
    '- 1 inch / 2.54 cm test square',
    '',
    'Pattern details:',
    `- Category: ${currentCategory().label}`,
    ...(template.fixed ? [`- Fixed template: ${template.fixedNotes || template.summary}`] : []),
    ...(state.category === 'bjd' ? [`- Doll profile: ${profiles[state.profile].label}`] : []),
    `- Style: ${state.sleeve} ${state.template} draft`,
    `- Neckline: ${state.neckline}`,
    `- Seam allowance included: ${dualMeasurement(state.seamAllowance)}`,
    '- Measurement table includes inches and centimeters',
    ...(fitPresetLabel() ? [`- Reference match: ${fitPresetLabel()}`] : []),
    '',
    'Printing:',
    '- Print at 100% scale',
    '- Do not scale or fit to page',
    '- Check the 1 x 1 inch / 2.54 x 2.54 cm test square before cutting',
    '',
    'This is a digital sewing pattern. No physical item will be shipped.',
    'The final pattern layout is generated from doll measurements and drafting rules. Test sew before commercial release.',
  ].join('\n');
}

function buildMeasurementRows() {
  return measurementFields
    .map(([key, label]) => {
      return `<tr><th>${label}</th><td>${dualMeasurement(state.measurements[key])}</td></tr>`;
    })
    .join('');
}

function printDocumentHtml() {
  const template = currentTemplate();
  const imageHtml = state.imageDataUrl
    ? `<img class="print-cover-image" src="${state.imageDataUrl}" alt="Reference design" />`
    : `<div class="print-cover-image"></div>`;

  return `
    <article class="print-page print-cover">
      <h1>${escapeHtml(template.label)}</h1>
      <p class="subtitle">Digital sewing pattern - US Letter - Print at 100% scale</p>
      <div class="print-cover-grid">
        ${imageHtml}
        <table class="print-table">
          <tbody>
            <tr><th>Pattern</th><td>${escapeHtml(template.label)}</td></tr>
            <tr><th>Category</th><td>${escapeHtml(currentCategory().label)}</td></tr>
            ${template.fixed ? `<tr><th>Template type</th><td>Fixed template</td></tr>` : ''}
            ${state.category === 'bjd' ? `<tr><th>Doll profile</th><td>${escapeHtml(profiles[state.profile].label)}</td></tr>` : ''}
            <tr><th>Neckline</th><td>${escapeHtml(state.neckline)}</td></tr>
            <tr><th>Closure</th><td>${state.closure ? 'Back closure' : 'No back extension'}</td></tr>
            <tr><th>Seam allowance</th><td>${dualMeasurement(state.seamAllowance)} included</td></tr>
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
        <li>Measure the 1 x 1 inch / 2.54 x 2.54 cm test square before cutting fabric.</li>
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

function measurementGuideSvg() {
  const template = currentTemplate();
  const labels = template.fields.slice(0, 6).map(([_key, label], index) => {
    const y = 48 + index * 19;
    return `<text class="guide-text" x="138" y="${y}">${escapeHtml(label)}</text>`;
  });
  return `
    <svg viewBox="0 0 260 180" role="img" aria-label="${escapeHtml(template.guide)}">
      <style>
        .guide-body { fill: none; stroke: #3d2b33; stroke-width: 1.2; }
        .guide-dress { fill: #f3d2df; stroke: #9f2352; stroke-width: 1.5; }
        .guide-line { stroke: #9f2352; stroke-width: 1.4; stroke-dasharray: 5 4; }
        .guide-text { font: 11px Arial, sans-serif; fill: #3d2b33; }
      </style>
      <text class="guide-text" x="12" y="18">${escapeHtml(template.guide)}</text>
      <g transform="translate(44 28)">
        <circle class="guide-body" cx="38" cy="14" r="10" />
        <path class="guide-body" d="M 38 24 L 38 72 M 18 42 L 58 42 M 38 72 L 24 126 M 38 72 L 52 126" />
        <path class="guide-dress" d="M 23 35 Q 38 26 53 35 L 68 106 Q 38 118 8 106 Z" />
        <line class="guide-line" x1="13" y1="48" x2="63" y2="48" />
        <line class="guide-line" x1="38" y1="34" x2="38" y2="108" />
      </g>
      <line class="guide-line" x1="124" y1="43" x2="132" y2="43" />
      ${labels.join('')}
    </svg>
  `;
}

function openProject(project) {
  const isBjd = project === 'bjd';
  elements.homeView.classList.toggle('is-hidden', isBjd);
  elements.studioView.classList.toggle('is-hidden', !isBjd);

  document.querySelectorAll('[data-open-project]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.openProject === project);
  });

  if (project === 'women' || project === 'pet') {
    elements.homeView.classList.remove('is-hidden');
    elements.studioView.classList.add('is-hidden');
    document.querySelectorAll('[data-open-project]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.openProject === 'home');
    });
  }
}

function render() {
  const template = currentTemplate();
  const printHtml = printDocumentHtml();
  elements.productTitle.textContent = template.title;
  elements.productSubtitle.textContent =
    state.unit === 'cm' ? 'Input unit: centimeters. Export shows inches and centimeters.' : 'Input unit: inches. Export shows inches and centimeters.';
  elements.previewTitle.textContent = `${template.label} - US Letter Pattern Pages`;
  elements.guideTitle.textContent = template.guide;
  elements.patternPreview.innerHTML = patternSvg();
  elements.patternPreview.style.setProperty('--preview-zoom', state.zoom);
  elements.measurementGuide.innerHTML = measurementGuideSvg();
  elements.patternNotes.innerHTML = notesHtml();
  elements.etsyText.value = etsyListingText();
  elements.printDoc.innerHTML = printHtml;
  elements.printPreviewPages.innerHTML = printHtml;
}

function openPrintPreview() {
  render();
  setVisibleView('printPreview');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadSvg() {
  const blob = new Blob([standalonePatternSvg()], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wawa-${state.category}-${state.templateId}-pattern-us-letter.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openModal(kind) {
  const modalHtml =
    kind === 'terms'
      ? `
        <h2>Terms & Policy</h2>
        <h3>Digital Service</h3>
        <p>This local application generates digital sewing pattern files. Review measurements and test sew before selling a finished PDF product.</p>
        <h3>Digital Delivery</h3>
        <p>Exports are generated locally as US Letter pages for printing at 100% scale. No physical item is included.</p>
        <h3>User Responsibility</h3>
        <p>You are responsible for final fit testing, Etsy listing accuracy, and customer instructions.</p>
      `
      : `
        <h2>Contact Us</h2>
        <p>Use this area for your shop support email, custom drafting requests, and buyer help text.</p>
        <p><a href="mailto:hello@example.com">hello@example.com</a></p>
      `;

  elements.modalContent.innerHTML = modalHtml;
  elements.modalBackdrop.classList.remove('is-hidden');
}

function closeModal() {
  elements.modalBackdrop.classList.add('is-hidden');
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const routeButton = event.target.closest('[data-route]');
    if (routeButton) {
      setRoute(routeButton.dataset.route);
      return;
    }

    const categoryCard = event.target.closest('[data-category-card]');
    if (categoryCard) {
      setRoute(categoryCard.dataset.categoryCard);
      return;
    }

    const templateCard = event.target.closest('[data-template-card]');
    if (templateCard) {
      setRoute(state.category, templateCard.dataset.templateCard);
      return;
    }

    const modalButton = event.target.closest('[data-modal]');
    if (modalButton) {
      openModal(modalButton.dataset.modal);
    }
  });

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
    state.measurements = templateDefaults(currentTemplate());
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

  elements.unitSelect.addEventListener('change', () => {
    state.unit = elements.unitSelect.value === 'cm' ? 'cm' : 'in';
    createMeasurementInputs();
    render();
  });

  elements.generateProductPdfButton.addEventListener('click', generateProductPdf);
  elements.labAnalyzeButton.addEventListener('click', analyzeLabImage);
  elements.labGenerateButton.addEventListener('click', generateLabPdf);
  elements.labImageInput.addEventListener('change', () => {
    const file = elements.labImageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      elements.labImagePreview.innerHTML = `<img src="${reader.result}" alt="Uploaded lab reference" />`;
      analyzeLabImage();
    };
    reader.readAsDataURL(file);
  });
  elements.analyzeButton.addEventListener('click', analyzeDesign);
  elements.downloadSvgButton.addEventListener('click', downloadSvg);
  elements.exportSvgPanelButton.addEventListener('click', downloadSvg);
  elements.referencePresetButton.addEventListener('click', applyReferencePreset);
  elements.backToTemplatesButton.addEventListener('click', () => setRoute(state.category));
  elements.backToStudioButton.addEventListener('click', () => setVisibleView('studio'));
  elements.exportPdfButton.addEventListener('click', openPrintPreview);
  elements.printButton.addEventListener('click', openPrintPreview);
  elements.printNowButton.addEventListener('click', () => {
    render();
    window.print();
  });
  elements.zoomInButton.addEventListener('click', () => {
    state.zoom = clamp(state.zoom + 0.1, 0.6, 1.6);
    render();
  });
  elements.zoomOutButton.addEventListener('click', () => {
    state.zoom = clamp(state.zoom - 0.1, 0.6, 1.6);
    render();
  });
  elements.fitButton.addEventListener('click', () => {
    state.zoom = 1;
    render();
  });
  elements.modalCloseButton.addEventListener('click', closeModal);
  elements.modalBackdrop.addEventListener('click', (event) => {
    if (event.target === elements.modalBackdrop) closeModal();
  });
  window.addEventListener('hashchange', routeFromHash);
}

renderHome();
applyTemplateDefaults(currentTemplate());
createMeasurementInputs();
bindEvents();
routeFromHash();
