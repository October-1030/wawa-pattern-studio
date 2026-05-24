# Wawa Pattern Studio

Local doll sewing pattern generator for Etsy-ready PDF pattern packs.

## Run

```powershell
cd D:\projects\Etsy-wawa\pattern-app
npm start
```

Open:

```text
http://localhost:4177
```

## Verify

```powershell
npm test
```

## What this MVP does

- Upload a doll dress reference image.
- Select a doll measurement profile.
- Adjust measurements in inches.
- Generate English-labeled pattern pieces for a simple doll dress.
- Print or save a US Letter PDF from the browser print dialog.
- Download the full-scale SVG pattern page.

## Optional AI image analysis

Manual controls work without an API key.

To enable image analysis, create `D:\projects\Etsy-wawa\pattern-app\.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=4177
```

The AI analysis only reads style details from the uploaded image. It does not infer body measurements. The generated pattern dimensions come from the selected doll profile and editable measurement fields.

## Etsy output note

The app defaults to US Letter:

```text
8.5 x 11 in
Print at 100% scale
Do not fit to page
1 x 1 inch test square
```

Before listing any generated pattern on Etsy, sew a test sample and correct the drafting values if needed.
