# Wawa Pattern Studio

Local sewing pattern generator for Etsy-ready PDF pattern packs. The app now follows a Floral-Mirror-style architecture with a home page, drafting categories, template lists, shared measurement forms, live SVG preview, and export controls.

## Run

```powershell
cd D:\projects\Etsy-wawa\pattern-app
npm start
```

Open:

```text
http://localhost:4177
```

Useful routes:

```text
http://localhost:4177/#/bjd-dolls
http://localhost:4177/#/bjd-dolls/trapeze
http://localhost:4177/#/womenswear
http://localhost:4177/#/petwear
```

## Verify

```powershell
npm test
```

## Generate product-quality PDF patterns

The product PDF path is separate from the older experimental web preview. It has a sellable gate that checks piece completeness, US Letter layout, test square, child-friendly instructions, and seam-length matching.

```powershell
cd D:\projects\Etsy-wawa\pattern-app
npm run generate:pdf -- --doll neo-blythe
npm run generate:pdf -- --doll barbie-vintage
```

Outputs are written to:

```text
output/product-pdf/
```

American Girl / 18-inch output uses tiled US Letter pages, similar to commercial large-format sewing PDFs:

```powershell
npm run generate:pdf -- --doll american-girl-18
```

## What this MVP does

- Open Womenswear, BJD Doll, or Petwear drafting areas.
- Choose from multiple drafting templates in each category.
- Use fixed BJD templates first: Bodice Block, Trapeze Dress, Gathered Waist Dress, Puff Sleeve Dress, Qipao Dress, and Jiaao Jacket.
- Upload a reference image or type style notes.
- Select a fixed doll profile for BJD templates.
- Adjust template-specific measurements in inches or centimeters.
- Generate English-labeled pattern pages.
- Print or save a US Letter PDF from the browser print dialog.
- Download the full-scale SVG pattern page.

## Optional AI image analysis

Manual controls work without an API key.

To enable OpenAI image analysis, create `D:\projects\Etsy-wawa\pattern-app\.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=4177
```

To use Gemini image analysis instead:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash
PORT=4177
```

Restart the local server after changing `.env`.

The AI analysis only reads style details from the uploaded image. It does not infer body measurements. The generated pattern dimensions come from the selected doll profile and editable measurement fields.

## Etsy output note

The app defaults to US Letter:

```text
8.5 x 11 in
Print at 100% scale
Do not fit to page
1 x 1 inch / 2.54 x 2.54 cm test square
```

The drafting math is stored in inches for US Letter accuracy, but the input form can switch between inches and centimeters. Exported measurement tables show both units.

## Fixed template workflow

The first production workflow should be:

1. Pick a BJD fixed template.
2. Pick a doll profile or enter custom measurements.
3. Optionally upload a design image or type notes to match the closest fixed template.
4. Check the live US Letter preview.
5. Click Export PDF to open the in-app PDF Preview.
6. Confirm the cover, pattern pages, and sewing instructions are visible, then click Print / Save PDF.

This is more reliable than trying to generate an unlimited industrial pattern from one image.

Before listing any generated pattern on Etsy, sew a test sample and correct the drafting values if needed.
