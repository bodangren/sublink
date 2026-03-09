# Specification: PDF Utilities Refactor

## Problem
The PDF generation utilities (estimatePdf.ts, invoicePdf.ts, dailyLogPdf.ts, pdfGenerator.ts) contain duplicate code:
- `formatCurrency()` - duplicated in estimatePdf and invoicePdf
- `formatDate()` - similar implementations across all files (slight variations)
- `downloadPDF()` - identical in 3 files
- `sanitizeFilename()` - duplicated in dailyLogPdf and pdfGenerator
- `loadImage()` - duplicated in dailyLogPdf and pdfGenerator
- PDF header patterns - similar across all generators
- PDF footer patterns - similar across all generators

## Solution
Create a new shared utility module `src/utils/pdfShared.ts` that contains:
1. `formatCurrency(amount: number): string` - USD formatting
2. `formatDate(dateStr: string): string` - date string formatting
3. `formatDateFromTimestamp(timestamp: number): string` - timestamp formatting
4. `formatShortDate(dateStr: string): string` - for filenames
5. `downloadPDF(blob: Blob, filename: string): void` - download helper
6. `sanitizeFilename(title: string): string` - safe filename generation
7. `loadImage(src: string): Promise<HTMLImageElement>` - image loading
8. PDF layout constants (margin, colors, etc.)
9. `addHeader(doc: jsPDF, title: string, subtitle: string): number` - returns y position
10. `addFooter(doc: jsPDF, documentType: string, referenceNumber: string): void`

## Files to Modify
1. Create `src/utils/pdfShared.ts`
2. Update `src/utils/estimatePdf.ts` - import from pdfShared
3. Update `src/utils/invoicePdf.ts` - import from pdfShared
4. Update `src/utils/dailyLogPdf.ts` - import from pdfShared
5. Update `src/utils/pdfGenerator.ts` - import from pdfShared
6. Create `src/utils/pdfShared.test.ts`

## Acceptance Criteria
- [ ] All duplicate functions moved to pdfShared.ts
- [ ] All PDF generators import from pdfShared.ts
- [ ] All existing tests pass
- [ ] New tests for pdfShared.ts
- [ ] Lint passes
- [ ] Build succeeds
