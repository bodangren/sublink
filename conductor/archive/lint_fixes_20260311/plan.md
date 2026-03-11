# Implementation Plan: Lint Fixes & Tech Debt Cleanup

## Phase 1: Fix Critical Lint Errors

- [x] Task: Fix react-hooks/set-state-in-effect in App.tsx
    - [x] Read current implementation
    - [x] Refactor to use derived state or proper pattern
    - [x] Verify no regressions

- [x] Task: Fix react-hooks/set-state-in-effect in ClientSelect.tsx
    - [x] Read current implementation
    - [x] Refactor to avoid setState in effect body (used useMemo)
    - [x] Update tests if needed

- [x] Task: Fix @typescript-eslint/no-explicit-any in test files
    - [x] Fix ClientSelect.test.tsx types
    - [x] Fix MileageForm.test.tsx types
    - [x] Run tests to verify

- [x] Task: Fix react-hooks/exhaustive-deps in InvoiceDetail.tsx
    - [x] Add loadInvoice to dependency array using useCallback
    - [x] Verify component behavior

## Phase 2: Address Tech Debt TD-001

- [x] Task: Convert inline styles to CSS classes
    - [x] Identify high-frequency inline styles
    - [x] Create utility CSS classes in index.css
    - [x] Update ClientSelect component to use CSS classes

## Phase 3: Verification

- [x] Task: Run full verification suite
    - [x] Run `npm run lint` - expect zero errors ✓
    - [x] Run `npm run build` - expect success ✓
    - [x] Run `npm run test` - expect all pass (456 tests) ✓
    - [x] Update tech-debt.md to mark TD-001 progress ✓
