# Implementation Plan

## Phase 1: Fix Linting Errors
- [x] Fix unused `err` variables in `PhotoCapture.tsx` (lines 68, 74)
- [x] Fix unused `err` variables in `TaskDetail.tsx` (lines 91, 97)
- [x] Fix unused `e` variable in `pdfGenerator.ts` (line 128)

## Phase 2: Extract Photo Capture Hook
- [x] Create `usePhotoCapture` hook in `src/hooks/usePhotoCapture.ts`
- [x] Move shared photo capture logic from `PhotoCapture.tsx` to hook
- [x] Refactor `PhotoCapture.tsx` to use new hook
- [x] Refactor `TaskDetail.tsx` to use new hook

## Phase 3: Standardize Error Handling
- [x] Replace `alert()` calls with state-based error display in `TaskForm.tsx`
- [x] Replace `alert()` calls with state-based error display in `COIForm.tsx`
- [x] Replace `alert()` calls with state-based error display in `WaiverForm.tsx`

## Phase 4: Cleanup and Verify
- [x] Remove unused `useFormFields` hook or document its purpose (kept for future use, documented in lessons-learned.md)
- [x] Run full test suite (92 tests passing)
- [x] Run production build (success)

## Checkpoints
- [x] Phase 1 Complete: Lint passes
- [x] Phase 2 Complete: Photo capture still works
- [x] Phase 3 Complete: No more alert() calls
- [x] Phase 4 Complete: Build succeeds, tests pass
