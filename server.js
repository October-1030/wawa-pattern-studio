const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUTPUT_DIR = path.join(ROOT, 'output');
const PORT = Number(process.env.PORT || 4177);
const MAX_BODY_BYTES = 7 * 1024 * 1024;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function extractOutputText(response) {
  if (response.output_text) return response.output_text;

  const chunks = [];
  for (const item of response.output || []) {
    if (item.type !== 'message') continue;
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

function parseJsonObject(text) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw _error;
  }
}

function httpError(statusCode, message, extra = {}) {
  return Object.assign(new Error(message), { statusCode, ...extra });
}

function analysisInstructions() {
  return [
    'You analyze doll dress reference images for a local sewing pattern drafting tool.',
    'Return only compact JSON. Do not include markdown.',
    'Use only these enum values:',
    'neckline: round, square, boat, v',
    'sleeve: sleeveless, short, puff',
    'skirt: a-line, gathered, straight',
    'closure: back, shoulder, none',
    'templateId: prototype, trapeze, gathered-waist, puff-sleeve, qipao, jiaao',
    'Choose templateId from the closest fixed BJD template. Use trapeze for simple sleeveless A-line dresses, gathered-waist for full skirts, puff-sleeve for puff sleeve dresses, qipao for cheongsam/qipao references, and jiaao for jacket/hanfu top references.',
    'Do not infer body measurements from the image. Measurements come from the selected doll profile.',
  ].join('\n');
}

function analysisPrompt(notes) {
  return [
    'Analyze this doll dress design reference.',
    'Return JSON with keys: templateId, neckline, sleeve, skirt, closure, designNotes, confidence.',
    `Optional user notes: ${notes || 'none'}`,
  ].join('\n');
}

function parseImageDataUrl(imageDataUrl) {
  const value = String(imageDataUrl || '');
  const match = /^data:(image\/[a-z0-9.+-]+);base64,/i.exec(value);
  if (!match) throw httpError(400, 'imageDataUrl must be a base64 image data URL.');

  return {
    base64: value.slice(match[0].length),
    mimeType: match[1].toLowerCase(),
  };
}

function parseAnalysisStyle(text) {
  try {
    return parseJsonObject(text);
  } catch (_error) {
    throw httpError(502, 'Image analysis returned invalid JSON.');
  }
}

function extractGeminiText(response) {
  const chunks = [];
  for (const candidate of response.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.text) chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
}

async function analyzeWithOpenAI(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw httpError(501, 'OPENAI_API_KEY is not configured for this local app.', { fallback: true });

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: analysisInstructions(),
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: analysisPrompt(payload.notes),
            },
            {
              type: 'input_image',
              image_url: payload.imageDataUrl,
              detail: 'low',
            },
          ],
        },
      ],
      max_output_tokens: 500,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `${response.status} ${response.statusText}`;
    throw httpError(response.status, message);
  }

  return parseAnalysisStyle(extractOutputText(data));
}

async function analyzeWithGemini(payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw httpError(501, 'GEMINI_API_KEY is not configured for this local app.', { fallback: true });

  const image = parseImageDataUrl(payload.imageDataUrl);
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${analysisInstructions()}\n\n${analysisPrompt(payload.notes)}`,
            },
            {
              inline_data: {
                mime_type: image.mimeType,
                data: image.base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `${response.status} ${response.statusText}`;
    throw httpError(response.status, message);
  }

  return parseAnalysisStyle(extractGeminiText(data));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: ROOT, windowsHide: true, timeout: 120000, ...options }, (error, stdout, stderr) => {
      if (error) {
        reject(Object.assign(error, { stdout, stderr }));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function safeProductPayload(body) {
  const payload = JSON.parse(body || '{}');
  const doll = String(payload.doll || '').trim();
  const style = String(payload.style || 'easy-a-line-dress').trim();
  const allowedDolls = new Set(['neo-blythe', 'barbie-vintage', 'american-girl-18']);
  const allowedStyles = new Set(['easy-a-line-dress', 'easy-pinafore-dress']);
  if (!allowedDolls.has(doll)) throw httpError(400, 'Unsupported doll profile.');
  if (!allowedStyles.has(style)) throw httpError(400, 'Unsupported outfit style.');
  return { doll, style };
}

async function generateProductPdf(req, res) {
  let payload;
  try {
    payload = safeProductPayload(await readRequestBody(req));
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message });
    return;
  }

  try {
    const { stdout } = await runCommand('python', [
      path.join(ROOT, 'scripts', 'generate_product_pdf.py'),
      '--doll',
      payload.doll,
      '--style',
      payload.style,
      '--render',
    ]);
    const result = JSON.parse(stdout.slice(stdout.indexOf('{')));
    const pdfName = path.basename(result.pdf);
    sendJson(res, 200, {
      pdfUrl: `/generated/product-pdf/${pdfName}`,
      pdfName,
      quality: result.validation,
      rendered: (result.rendered || []).map((filePath) => `/generated/product-pdf/${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`),
    });
  } catch (error) {
    sendJson(res, 500, {
      error: 'Failed to generate product PDF.',
      detail: error.message,
      stderr: error.stderr,
    });
  }
}

async function analyzeDesign(req, res) {
  const body = await readRequestBody(req);
  let payload;
  try {
    payload = JSON.parse(body || '{}');
  } catch (_error) {
    sendJson(res, 400, { error: 'Request body must be valid JSON.' });
    return;
  }

  try {
    parseImageDataUrl(payload.imageDataUrl);
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message });
    return;
  }

  const provider = String(process.env.AI_PROVIDER || 'openai').trim().toLowerCase();
  try {
    if (provider === 'openai') {
      sendJson(res, 200, { provider, style: await analyzeWithOpenAI(payload) });
      return;
    }

    if (provider === 'gemini' || provider === 'google') {
      sendJson(res, 200, { provider: 'gemini', style: await analyzeWithGemini(payload) });
      return;
    }

    sendJson(res, 400, { error: `Unsupported AI_PROVIDER "${provider}". Use "openai" or "gemini".` });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error.message,
      fallback: Boolean(error.fallback),
      provider,
    });
  }
}

function serveGenerated(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const relativeUrlPath = decodeURIComponent(url.pathname.replace(/^\/generated\//, ''));
  const filePath = path.normalize(path.join(OUTPUT_DIR, relativeUrlPath));
  const relativePath = path.relative(OUTPUT_DIR, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(content);
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  const relativePath = path.relative(PUBLIC_DIR, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (!path.extname(filePath)) {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (indexError, indexContent) => {
          if (indexError) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
          }
          res.writeHead(200, {
            'Content-Type': MIME_TYPES['.html'],
            'X-Content-Type-Options': 'nosniff',
          });
          res.end(indexContent);
        });
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(content);
  });
}

loadEnvFile(path.join(ROOT, '.env'));

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/analyze-design') {
      await analyzeDesign(req, res);
      return;
    }

    if (req.method === 'POST' && req.url === '/api/generate-product-pdf') {
      await generateProductPdf(req, res);
      return;
    }

    if (req.method !== 'GET') {
      res.writeHead(405, { Allow: 'GET, POST' });
      res.end('Method not allowed');
      return;
    }

    if (req.url.startsWith('/generated/')) {
      serveGenerated(req, res);
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, error.statusCode || 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Wawa Pattern Studio running at http://localhost:${PORT}`);
});
