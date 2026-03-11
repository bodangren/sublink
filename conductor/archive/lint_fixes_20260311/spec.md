# Specification: Lint Fixes & Tech Debt Cleanup

## Overview
Fix ESLint errors identified in the codebase and address open tech debt items to improve code quality and maintainability.

## Functional Requirements

### FR-1: Fix react-hooks/set-state-in-effect Errors
- App.tsx:280 - setLoading(false) in effect body
- ClientSelect.tsx:29 - setSelectedClient() in effect body
- Refactor to avoid cascading renders

### FR-2: Fix @typescript-eslint/no-explicit-any Errors
- ClientSelect.test.tsx:53, 55 - Replace `any` with proper types
- MileageForm.test.tsx:66 - Replace `any` with proper types

### FR-3: Fix react-hooks/exhaustive-deps Warning
- InvoiceDetail.tsx:64 - Add missing `loadInvoice` dependency

### FR-4: Address TD-001 (Inline Styles)
- Convert frequently-used inline styles to CSS classes
- Priority: Dashboard cards, form layouts, common patterns

## Non-Functional Requirements
- NFR-1: All existing tests must pass
- NFR-2: Build must succeed with no errors
- NFR-3: No behavioral changes to user-facing features

## Acceptance Criteria
- [ ] `npm run lint` returns no errors
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes all tests
- [ ] TD-001 addressed (at least partially)

## Out of Scope
- TD-002 (form validation) - deferred to future track
- Major architectural changes
