# Implementation Plan

## Phase 1: Create Shared Module
1. Create `src/utils/pdfShared.ts` with consolidated utilities
2. Export all shared functions and constants

## Phase 2: Update PDF Generators
1. Update `estimatePdf.ts` to use pdfShared
2. Update `invoicePdf.ts` to use pdfShared
3. Update `dailyLogPdf.ts` to use pdfShared
4. Update `pdfGenerator.ts` to use pdfShared

## Phase 3: Testing
1. Create tests for pdfShared.ts
2. Verify all existing tests pass
3. Run lint and build

## Phase 4: Verification
1. Manual test PDF generation for each type
2. Ensure formatting is consistent

## Commands
```bash
npm run lint
npm test -- --run
npm run build
```
