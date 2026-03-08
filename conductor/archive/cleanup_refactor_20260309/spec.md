# Specification: Code Quality Cleanup & Refactor

## Overview
Daily cleanup track addressing linting errors, technical debt items, and code quality improvements identified through automated analysis.

## Objectives
1. Fix all ESLint errors and warnings
2. Address technical debt items (TD-001, TD-002, TD-003)
3. Improve code maintainability and reduce duplication
4. Ensure production build succeeds

## Scope

### Critical Fixes (Lint Errors)
- Remove unused imports in test files
- Fix variable access before declaration in ExpenseList.tsx
- Replace `any` types with proper TypeScript types
- Fix setState in useEffect anti-patterns
- Remove unused variables

### Technical Debt Items
- **TD-001**: 474 inline styles - extract to CSS utility classes (partial: common patterns)
- **TD-002**: Form validation feedback (defer - requires design)
- **TD-003**: Replace window.confirm with custom confirmation dialog

### Code Quality
- Fix React hooks dependency warnings
- Ensure consistent patterns across components

## Acceptance Criteria
- [ ] `npm run lint` passes with 0 errors
- [ ] All tests pass (`npm test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Tech debt registry updated
- [ ] Lessons learned updated with patterns used

## Out of Scope
- Complete CSS migration (too large for single track)
- Form validation redesign (requires UX design)
- Performance optimizations beyond lint fixes
