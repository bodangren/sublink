# Cleanup: Fix ESLint Errors in Change Order Components

## Problem
Two components have ESLint errors due to accessing async functions before they are declared in useEffect hooks:

1. `ChangeOrderDetail.tsx` - `loadChangeOrder` accessed before declaration
2. `ChangeOrderList.tsx` - `loadChangeOrders` accessed before declaration

## Root Cause
The components use the pattern of declaring async functions after the useEffect that calls them, which triggers the `react-hooks/immutability` rule.

## Solution
Migrate these components to use the existing `useAsyncEffect` hook, which was extracted in a previous cleanup track. This hook is already used by 9 other components in the codebase.

## Acceptance Criteria
- [ ] `npm run lint` passes with zero errors
- [ ] All 607+ tests continue to pass
- [ ] `npm run build` succeeds
- [ ] Change order functionality works as before (list, detail, status changes)
