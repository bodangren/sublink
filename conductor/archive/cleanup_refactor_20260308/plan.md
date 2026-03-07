# Implementation Plan: Codebase Cleanup & Refactor

## Phase 1: Create Project Memory Files
**Files:** `conductor/tech-debt.md`, `conductor/lessons-learned.md`  
**Duration:** 15 minutes

### Tasks
1. [ ] Create `conductor/tech-debt.md` with known shortcuts
2. [ ] Create `conductor/lessons-learned.md` with project insights

### Verification
- Files exist and follow conductor templates

---

## Phase 2: Archive Completed Tracks
**Files:** `conductor/tracks/`, `conductor/archive/`, `conductor/tracks.md`  
**Duration:** 10 minutes

### Tasks
1. [ ] Move `scaffold_pwa_20260307` to archive
2. [ ] Move `digital_lien_waivers_20260307` to archive
3. [ ] Move `compliance_vault_20260307` to archive
4. [ ] Update `tracks.md` with archive links

### Verification
- Only active tracks remain in `tracks/`
- All archived tracks have correct links in `tracks.md`

---

## Phase 3: Create Generic EditWrapper Component
**Files:** `src/components/EditWrapper.tsx` (new), `src/App.tsx`  
**Duration:** 20 minutes

### Tasks
1. [ ] Create generic `EditWrapper<T>` component
2. [ ] Replace `COIEditWrapper` with generic version
3. [ ] Replace `TaskEditWrapper` with generic version
4. [ ] Update `TaskDetailWrapper` to use similar pattern

### Verification
- All edit routes still work
- No TypeScript errors
- Less code duplication

---

## Phase 4: Extract Form Utilities Hook
**Files:** `src/hooks/useFormFields.ts` (new), `src/components/*.tsx`  
**Duration:** 25 minutes

### Tasks
1. [ ] Create `useFormFields` hook
2. [ ] Update `COIForm` to use hook
3. [ ] Update `TaskForm` to use hook
4. [ ] Update `WaiverForm` to use hook (if applicable)

### Verification
- All forms still function correctly
- Reduced code duplication

---

## Phase 5: Fix parseInt Validation
**Files:** `src/utils/format.ts` (new), `src/App.tsx`  
**Duration:** 10 minutes

### Tasks
1. [ ] Create `safeParseInt` utility function
2. [ ] Update App.tsx to use safe parsing
3. [ ] Add test for utility

### Verification
- No NaN displayed for invalid input
- Test passes

---

## Phase 6: Testing & Verification
**Duration:** 15 minutes

### Tasks
1. [ ] Run full test suite
2. [ ] Run linter
3. [ ] Run type checker
4. [ ] Build production bundle

### Verification
- `npm run test` passes
- `npm run lint` passes
- `npm run build` succeeds

---

## Phase 7: Documentation & Commit
**Duration:** 10 minutes

### Tasks
1. [ ] Update README.md if needed
2. [ ] Update `conductor/index.md` if needed
3. [ ] Mark track complete in `tracks.md`
4. [ ] Archive this track
5. [ ] Commit with model info
6. [ ] Push to remote

### Verification
- Documentation accurate
- Commit pushed successfully

---

## Total Estimated Time: 1.5 hours

## Risk Mitigation
- All changes are refactors with existing test coverage
- Changes are reversible via git
- No breaking changes to user-facing features
