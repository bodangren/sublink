# Implementation Plan: Code Quality Cleanup & Refactor

## Phase 1: Critical Lint Fixes
- [x] Fix ExpenseList.test.tsx - remove unused imports
- [x] Fix ExpenseList.tsx - move getFilteredExpenses before useEffect
- [x] Fix Settings.test.tsx - replace any types
- [x] Fix WaiverForm.tsx - refactor setState in useEffect
- [x] Fix useActiveTimer.ts - refactor setState in useEffect
- [x] Fix dataBackup.ts - remove unused err variable
- [x] Fix InvoiceForm.tsx - add missing dependencies

## Phase 2: Tech Debt - Confirmation Dialog
- [x] Create ConfirmDialog component (already existed)
- [x] Create useConfirm hook for modal state (already existed)
- [x] Replace window.confirm in App.tsx (already done)
- [x] Replace window.confirm in ProjectDetail.tsx (already done)
- [x] Replace window.confirm in ExpenseDetail.tsx (already done)
- [x] Replace window.confirm in ExpenseList.tsx (already done)
- [x] Replace window.confirm in InvoiceDetail.tsx (already done)
- [x] Replace window.confirm in InvoiceList.tsx (already done)
- [x] Replace window.confirm in TimeEntryList.tsx (already done)
- [x] Replace window.confirm in ActiveTimer.tsx (already done)
- [x] Replace window.confirm in TaskList.tsx (already done)
- [x] Replace window.confirm in ProjectList.tsx (already done)
- [x] Replace window.confirm in DailyLogDetail.tsx (already done)
- [x] Replace window.confirm in DailyLogList.tsx (already done)
- [x] Replace window.confirm in TaskDetail.tsx (already done)
- [x] Fix useConfirm.tsx export syntax error
- [x] Add dialog element mock for jsdom tests (setupTests.ts)
- [x] Update all tests to use ConfirmProvider wrapper
- [x] Update tests to interact with ConfirmDialog correctly

## Phase 3: Bug Fixes Found During Testing
- [x] Fix ProjectDetail.tsx - sort waivers by createdAt correctly (was b.createdAt - b.createdAt)

## Phase 4: Tech Debt - Common Style Utilities (Skipped)
- [ ] Create utility CSS classes for common patterns (deferred)
- [ ] Apply to high-frequency inline styles (deferred)

## Phase 5: Verification & Documentation
- [x] Run full test suite (307 tests pass)
- [x] Run production build (success)
- [x] Update tech-debt.md
- [x] Update lessons-learned.md
- [x] Commit changes

## Estimated Time
2-3 hours (actual: ~2 hours)
