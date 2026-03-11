# Implementation Plan: Project Profitability Dashboard

## Phase 1: Settings - Hourly Rate Storage
**Files to modify:**
- `src/db.ts` - Add settings store and functions
- `src/components/Settings.tsx` - Add hourly rate input field

**Tasks:**
1. Add `settings` object store to IndexedDB schema (version 13)
2. Create `getSetting(key)` and `setSetting(key, value)` functions
3. Add hourly rate input to Settings page
4. Default rate: $75/hour
5. Test: Settings.test.tsx

## Phase 2: Financial Calculation Utilities
**Files to create/modify:**
- `src/utils/profitability.ts` - New utility file
- `src/utils/profitability.test.ts` - Unit tests

**Tasks:**
1. Create `calculateProjectProfitability()` function
2. Input: project, timeEntries, expenses, hourlyRate
3. Output: { contractValue, totalHours, laborCost, totalExpenses, totalCosts, profitLoss, marginPercent }
4. Handle edge cases (null contract, division by zero)
5. Write comprehensive unit tests

## Phase 3: ProjectDetail Enhancement
**Files to modify:**
- `src/components/ProjectDetail.tsx` - Add financial summary section
- `src/components/ProjectDetail.test.tsx` - Add tests

**Tasks:**
1. Fetch time entries and expenses for project
2. Fetch hourly rate from settings
3. Calculate profitability metrics
4. Add "Financial Summary" section to UI
5. Style with color coding for profit/loss
6. Write tests for new functionality

## Phase 4: Dashboard Enhancement (Optional)
**Files to modify:**
- `src/components/DashboardStats.tsx` - Add overall profitability

**Tasks:**
1. Calculate aggregate profitability across all projects
2. Show total profit/loss for current month
3. Add to dashboard stats

## Verification
1. Run `npm run test` - all tests pass
2. Run `npm run build` - production build succeeds
3. Run `npm run lint` - no lint errors
4. Manual testing in browser

## File Structure
```
src/
├── db.ts                          (modify)
├── utils/
│   └── profitability.ts           (new)
│   └── profitability.test.ts      (new)
├── components/
│   ├── Settings.tsx               (modify)
│   ├── Settings.test.tsx          (modify)
│   ├── ProjectDetail.tsx          (modify)
│   └── ProjectDetail.test.tsx     (modify)
```
