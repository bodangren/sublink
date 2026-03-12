# Specification: Add Tests for Change Order Components

## Overview
Add comprehensive test coverage for the Change Order Management feature components: ChangeOrderList, ChangeOrderDetail, and ChangeOrderForm.

## Background
The Change Order Management feature was recently implemented but lacks test coverage. This track adds tests to ensure reliability and prevent regressions.

## Scope
- ChangeOrderList.test.tsx: Tests for list display, filtering, deletion
- ChangeOrderDetail.test.tsx: Tests for detail view, status changes, deletion
- ChangeOrderForm.test.tsx: Tests for form validation, creation, editing

## Acceptance Criteria
- All three test files created with >80% coverage
- Tests follow existing project patterns (vitest, testing-library, fake-indexeddb)
- All tests pass
- npm run lint passes
- npm run build succeeds
