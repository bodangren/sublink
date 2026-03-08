---
name: pdf-generator
description: Create a new PDF export template following project conventions
disable-model-invocation: true
---

# PDF Generator Helper

Create new PDF export utilities for SubLink features.

## Usage

`/pdf-generator <feature>`

## What it creates

1. `src/utils/<feature>Pdf.ts` — PDF generation function using jsPDF
2. `src/utils/<feature>Pdf.test.ts` — Tests for the PDF generator

## Conventions to follow

- Read existing PDF utils for patterns: `src/utils/dailyLogPdf.ts`, `src/utils/invoicePdf.ts`, `src/utils/pdfGenerator.ts`
- Use `jspdf` library (already installed)
- Check `src/utils/watermark.ts` for watermark/branding patterns
- PDFs must work fully offline (no external font/image fetches)
- Export a single function: `generate<Feature>Pdf(data: <Type>): void`
- Include company branding consistent with existing PDFs
- Tests should verify PDF generation doesn't throw and produces valid output
