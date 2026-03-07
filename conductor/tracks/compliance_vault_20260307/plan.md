# Implementation Plan: Compliance Vault

## Phase 1: Database Extension
**Files:** `src/db.ts`  
**Duration:** 30 minutes

### Tasks
1. Extend `SubLinkDB` interface with `certificates` object store
2. Update `initDB` to handle version upgrade (1 → 2)
3. Implement CRUD functions:
   - `saveCOI`
   - `getCOIs`
   - `updateCOI`
   - `deleteCOI`

### Verification
- Database opens successfully
- Existing waivers data is preserved
- New certificates store is created

---

## Phase 2: Utility Functions
**Files:** `src/utils/coiStatus.ts` (new)  
**Duration:** 15 minutes

### Tasks
1. Create `getCOIStatus` function
2. Create `getDaysUntilExpiration` helper
3. Add unit tests

### Verification
- All status calculation tests pass
- Edge cases handled (past dates, future dates)

---

## Phase 3: COI Form Component
**Files:** `src/components/COIForm.tsx` (new)  
**Duration:** 45 minutes

### Tasks
1. Create form with all required fields
2. Implement form validation
3. Add date pickers for effective/expiration dates
4. Handle both create and edit modes
5. Integrate with database functions

### Verification
- Form renders correctly
- Validation prevents invalid submissions
- Data saves to IndexedDB
- Edit mode pre-fills existing data

---

## Phase 4: Update Compliance View
**Files:** `src/App.tsx`  
**Duration:** 30 minutes

### Tasks
1. Replace Compliance placeholder with actual implementation
2. Load and display COIs from database
3. Implement status-based color coding
4. Add "Add COI" button
5. Add delete functionality with confirmation

### Verification
- COIs load and display correctly
- Status indicators show proper colors
- Delete confirmation works
- Navigation to form works

---

## Phase 5: Testing
**Files:** `src/COIForm.test.tsx`, `src/utils/coiStatus.test.ts` (new)  
**Duration:** 30 minutes

### Tasks
1. Write tests for COI status utilities
2. Write component tests for COIForm
3. Test database operations
4. Ensure >90% coverage for new code

### Verification
- All tests pass
- Coverage meets threshold

---

## Phase 6: Integration & Polish
**Duration:** 20 minutes

### Tasks
1. Run full test suite
2. Run linter and fix issues
3. Run type checker
4. Build production bundle
5. Manual testing in browser

### Verification
- `npm run lint` passes
- `npm run build` succeeds
- Manual testing confirms functionality

---

## Phase 7: Documentation & Commit
**Duration:** 10 minutes

### Tasks
1. Update README.md with Compliance Vault feature
2. Update conductor/tracks.md to mark track as complete
3. Commit all changes
4. Push to remote

### Verification
- Documentation is accurate
- Commit message is clear
- Push succeeds

---

## Total Estimated Time: 3 hours

## Risk Mitigation
- **Database Migration:** Test upgrade path thoroughly to ensure no data loss
- **Date Handling:** Use consistent date format (ISO 8601) to avoid timezone issues
- **Offline Functionality:** All operations use local IndexedDB only

## Rollback Plan
If critical issues arise:
1. Revert database schema changes
2. Remove Compliance Vault components
3. Restore previous App.tsx
4. All changes are reversible via git
