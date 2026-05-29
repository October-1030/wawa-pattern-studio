const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const appPath = path.join(root, 'public', 'app.js');

function makeElement(id = '') {
  return {
    checked: id === 'closureCheckbox',
    dataset: {},
    disabled: false,
    files: [],
    id,
    innerHTML: '',
    listeners: {},
    style: {
      setProperty() {},
    },
    textContent: '',
    value: '',
    addEventListener(event, handler) {
      this.listeners[event] = handler;
    },
    appendChild() {},
    classList: {
      add() {},
      remove() {},
      toggle() {},
    },
    click() {
      this.clicked = true;
    },
    closest() {
      return makeElement();
    },
    querySelectorAll() {
      return [];
    },
    remove() {
      this.removed = true;
    },
  };
}

function loadApp(fetchImpl = async () => ({ ok: false, json: async () => ({ fallback: true }) })) {
  const elements = new Map();
  const segmentButtons = ['a-line', 'gathered', 'straight'].map((template) => ({
    ...makeElement(),
    dataset: { template },
    classList: { toggle() {} },
  }));
  const createdLinks = [];
  const blobStore = [];

  class TestFileReader {
    readAsDataURL(file) {
      this.result = `data:${file.type};base64,ZmFrZQ==`;
      if (this.onload) this.onload();
    }
  }

  class TestBlob {
    constructor(parts, options) {
      this.parts = parts;
      this.type = options?.type || '';
      blobStore.push(this);
    }
  }

  const context = {
    Blob: TestBlob,
    FileReader: TestFileReader,
    URL: {
      createObjectURL() {
        return 'blob:test-url';
      },
      revokeObjectURL() {},
    },
    console,
    document: {
      body: {
        appendChild() {},
      },
      addEventListener() {},
      createElement(tag) {
        const element = makeElement(tag);
        createdLinks.push(element);
        return element;
      },
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, makeElement(id));
        return elements.get(id);
      },
      querySelectorAll(selector) {
        if (selector === '.segment') return segmentButtons;
        return [];
      },
    },
    fetch: fetchImpl,
    window: {
      location: {
        hash: '',
        pathname: '/',
      },
      addEventListener() {},
      scrollTo() {
        this.scrollCalled = true;
      },
      printCalled: false,
      print() {
        this.printCalled = true;
      },
    },
  };

  const source = fs.readFileSync(appPath, 'utf8');
  vm.runInNewContext(
    `${source}
globalThis.__api = {
  analyzeDesign,
  applyStyle,
  boundsOverlap,
  downloadSvg,
  elements,
  etsyListingText,
  localStyleGuess,
  patternPages,
  patternSvg,
  pieceBounds,
  printDocumentHtml,
  profiles,
  standalonePatternSvg,
  state,
};`,
    context,
    { filename: appPath },
  );

  return { api: context.__api, blobStore, context, createdLinks, elements };
}

function assertNoPageOverlap(api, page) {
  for (let left = 0; left < page.pieces.length; left += 1) {
    for (let right = left + 1; right < page.pieces.length; right += 1) {
      assert.equal(
        api.boundsOverlap(api.pieceBounds(page.pieces[left]), api.pieceBounds(page.pieces[right])),
        false,
        `${page.pieces[left].title} overlaps ${page.pieces[right].title} on page ${page.number}`,
      );
    }
  }
}

function assertPageBounds(api, page) {
  for (const piece of page.pieces) {
    const bounds = api.pieceBounds(piece);
    assert.ok(bounds.left >= 0.45, `${piece.title} left bound is outside printable area`);
    assert.ok(bounds.top >= 0.45, `${piece.title} top bound is outside printable area`);
    assert.ok(bounds.right <= 8.06, `${piece.title} right bound is outside printable area`);
    assert.ok(bounds.bottom <= 10.55, `${piece.title} bottom bound is outside printable area`);
  }
}

async function run() {
  const { api, blobStore, context, createdLinks, elements } = loadApp();

  for (const profile of ['blythe', 'barbie', 'americanGirl']) {
    for (const template of ['a-line', 'gathered', 'straight']) {
      for (const sleeve of ['sleeveless', 'short', 'puff']) {
        api.state.profile = profile;
        api.state.measurements = { ...api.profiles[profile] };
        api.state.template = template;
        api.state.sleeve = sleeve;
        api.state.closure = true;
        const pages = api.patternPages();
        assert.ok(pages.length >= 1, `${profile}/${template}/${sleeve} produced no pages`);
        for (const page of pages) {
          assert.equal(page.total, pages.length, 'page total is inconsistent');
          assertNoPageOverlap(api, page);
          assertPageBounds(api, page);
        }
      }
    }
  }

  api.state.profile = 'americanGirl';
  api.state.templateId = 'trapeze';
  api.state.measurements = { ...api.profiles.americanGirl };
  api.state.template = 'a-line';
  api.state.sleeve = 'sleeveless';
  api.state.closure = true;
  assert.equal(api.patternPages().length, 2, '18-inch A-line sleeveless dress should fit on 2 US Letter pattern pages');

  elements.get('styleNotes').value = 'square neck puff sleeve gathered no closure';
  api.state.imageDataUrl = '';
  await api.analyzeDesign();
  assert.equal(api.state.neckline, 'square');
  assert.equal(api.state.sleeve, 'puff');
  assert.equal(api.state.template, 'gathered');
  assert.equal(api.state.closure, false);
  assert.match(elements.get('aiStatus').textContent, /Applied a local style guess/);

  elements.get('styleNotes').value = 'sleeveless dress for 18-inch dolls with round neckline, A-line skirt, and back opening';
  api.state.imageDataUrl = '';
  await api.analyzeDesign();
  assert.equal(api.state.profile, 'americanGirl');
  assert.equal(api.state.neckline, 'round');
  assert.equal(api.state.sleeve, 'sleeveless');
  assert.equal(api.state.template, 'a-line');
  assert.equal(api.state.closure, true);
  assert.equal(api.state.fitPreset, 'sleeveless-a-line-18');
  assert.equal(api.patternPages().length, 2);
  assert.match(elements.get('patternNotes').innerHTML, /Reference match/);
  assert.match(api.etsyListingText(), /Reference match: 18-inch sleeveless A-line dress reference match/);

  elements.get('necklineSelect').value = 'square';
  elements.get('necklineSelect').listeners.change();
  assert.equal(api.state.fitPreset, 'basic');
  assert.equal(api.state.aiNotes, '');

  elements.get('referencePresetButton').listeners.click();
  assert.equal(api.state.profile, 'americanGirl');
  assert.equal(api.state.neckline, 'round');
  assert.equal(api.state.sleeve, 'sleeveless');
  assert.equal(api.state.template, 'a-line');
  assert.equal(api.state.closure, true);
  assert.equal(api.state.fitPreset, 'sleeveless-a-line-18');
  assert.match(elements.get('aiStatus').textContent, /Applied 18-inch sleeveless/);

  elements.get('styleNotes').value = 'straight short sleeve back opening';
  api.state.imageDataUrl = 'data:image/png;base64,ZmFrZQ==';
  await api.analyzeDesign();
  assert.equal(api.state.sleeve, 'short');
  assert.equal(api.state.template, 'straight');
  assert.equal(api.state.closure, true);
  assert.match(elements.get('aiStatus').textContent, /AI key is not configured/);

  const input = elements.get('referenceImage');
  input.files = [{ name: 'dress.png', type: 'image/png' }];
  input.listeners.change();
  assert.equal(api.state.imageDataUrl, 'data:image/png;base64,ZmFrZQ==');
  assert.equal(elements.get('uploadLabel').textContent, 'dress.png');
  assert.match(elements.get('imagePreview').innerHTML, /<img/);

  input.files = [{ name: 'notes.txt', type: 'text/plain' }];
  input.listeners.change();
  assert.match(elements.get('aiStatus').textContent, /Choose a PNG/);

  api.state.profile = 'americanGirl';
  api.state.templateId = 'trapeze';
  api.state.measurements = { ...api.profiles.americanGirl };
  api.state.template = 'a-line';
  api.state.sleeve = 'sleeveless';
  api.state.closure = true;
  const svgPack = api.standalonePatternSvg();
  assert.match(svgPack, /pattern-svg-pack/);
  assert.match(svgPack, /PAGE 1 OF 2/);
  assert.match(svgPack, /PAGE 2 OF 2/);
  assert.match(svgPack, /1 x 1 in test square/);
  assert.match(svgPack, /2\.54 x 2\.54 cm/);

  api.downloadSvg();
  assert.equal(blobStore.at(-1).type, 'image/svg+xml;charset=utf-8');
  assert.equal(createdLinks.at(-1).download, 'wawa-bjd-trapeze-pattern-us-letter.svg');
  assert.equal(createdLinks.at(-1).clicked, true);

  const printHtml = api.printDocumentHtml();
  const printPageCount = (printHtml.match(/class="print-page/g) || []).length;
  assert.equal(printPageCount, api.patternPages().length + 2, 'print document should include cover, pattern pages, and instructions');
  assert.match(printHtml, /Sewing Instructions/);
  assert.match(api.etsyListingText(), /2 US Letter printable pattern pages/);

  context.window.printCalled = false;
  elements.get('printButton').listeners.click();
  assert.equal(context.window.printCalled, false, 'Top print button should open in-app preview before printing');
  assert.match(elements.get('printPreviewPages').innerHTML, /Sewing Instructions/);
  assert.equal(context.window.scrollCalled, true, 'Print preview should scroll into view');
  elements.get('printNowButton').listeners.click();
  assert.equal(context.window.printCalled, true, 'Preview print button did not call window.print');

  console.log('verify-pattern-app: all checks passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
