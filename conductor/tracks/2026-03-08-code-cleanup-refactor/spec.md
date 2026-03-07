# Specification: Code Cleanup and Refactor

## Problem Statement
The codebase has accumulated technical debt that needs to be addressed:
1. **Linting Errors:** 5 unused variable errors blocking clean builds
2. **Code Duplication:** Photo capture logic duplicated between PhotoCapture and TaskDetail components
3. **Inconsistent Patterns:** Error handling varies across components (some use `alert()`, some use state-based error display)
4. **Unused Code:** `useFormFields` hook exists but is not utilized

## Goals
- Achieve zero linting errors
- Eliminate duplicate photo capture logic by extracting to a shared hook
- Standardize error handling across all form components
- Improve code maintainability and reduce future technical debt

## Non-Goals
- Changing existing functionality or user behavior
- Adding new features
- Modifying the database schema

## Success Criteria
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] All existing tests pass
- [ ] No reduction in test coverage
- [ ] Photo capture functionality works identically after refactor
