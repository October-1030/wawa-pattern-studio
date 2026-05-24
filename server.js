const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
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

async function analyzeDesign(req, res) {
  const body = await readRequestBody(req);
  let payload;
  try {
    payload = JSON.parse(body || '{}');
  } catch (_error) {
    sendJson(res, 400, { error: 'Request body must be valid JSON.' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(res, 501, {
      error: 'OPENAI_API_KEY is not configured for this local app.',
      fallback: true,
    });
    return;
  }

  const imageDataUrl = payload.imageDataUrl;

  if (!imageDataUrl || !String(imageDataUrl).startsWith('data:image/')) {
    sendJson(res, 400, { error: 'imageDataUrl must be a base64 data URL.' });
    return;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: [
        'You analyze doll dress reference images for a local sewing pattern drafting tool.',
        'Return only compact JSON. Do not include markdown.',
        'Use only these enum values:',
        'neckline: round, square, boat, v',
        'sleeve: sleeveless, short, puff',
        'skirt: a-line, gathered, straight',
        'closure: back, shoulder, none',
        'Do not infer body measurements from the image. Measurements come from the selected doll profile.',
      ].join('\n'),
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                'Analyze this doll dress design reference.',
                'Return JSON with keys: neckline, sleeve, skirt, closure, designNotes, confidence.',
                `Optional user notes: ${payload.notes || 'none'}`,
              ].join('\n'),
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
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
    sendJson(res, response.status, { error: message });
    return;
  }

  try {
    const style = parseJsonObject(extractOutputText(data));
    sendJson(res, 200, { style });
  } catch (_error) {
    sendJson(res, 502, { error: 'Image analysis returned invalid JSON.' });
  }
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

    if (req.method !== 'GET') {
      res.writeHead(405, { Allow: 'GET, POST' });
      res.end('Method not allowed');
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
