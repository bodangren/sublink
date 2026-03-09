# Track: PDF Utilities Refactor

## Status
`completed`

## Priority
`high`

## Type
`refactor`

## Created
2026-03-10

## Summary
Consolidate duplicate PDF utility functions into a shared module to reduce code duplication and improve maintainability.

## Scope
- src/utils/estimatePdf.ts
- src/utils/invoicePdf.ts
- src/utils/dailyLogPdf.ts
- src/utils/pdfGenerator.ts
- New: src/utils/pdfShared.ts

## Impact
- Reduces code duplication by ~100 lines
- Improves maintainability
- Ensures consistent formatting across all PDFs
