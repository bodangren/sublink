# Implementation Plan

## Phase 1: ChangeOrderList Tests
- [x] Create ChangeOrderList.test.tsx
- [x] Test renders empty state when no change orders
- [x] Test displays list of change orders
- [x] Test filters by status
- [x] Test shows summary stats
- [x] Test shows cost adjustment with correct sign

## Phase 2: ChangeOrderDetail Tests
- [x] Create ChangeOrderDetail.test.tsx
- [x] Test shows loading initially
- [x] Test shows not found when CO doesn't exist
- [x] Test displays change order details
- [x] Test status transitions (draft->submitted, submitted->approved/rejected)

## Phase 3: ChangeOrderForm Tests
- [x] Create ChangeOrderForm.test.tsx
- [x] Test renders form with all fields
- [x] Test populates project dropdown with existing projects
- [x] Test saves change order to database
- [x] Test shows cost adjustment indicators
- [x] Test shows edit mode title

## Phase 4: Verification
- [x] Run `npm test` - all tests pass
- [x] Run `npm run lint` - passes
- [x] Run `npm run build` - succeeds
