# Technical Debt Registry

> Bounded to 50 lines. Archive older items to `archive/tech-debt-history.md`.

## Active Items

| ID | Description | Severity | Status | Created |
|----|-------------|----------|--------|---------|
| TD-001 | Inline styles throughout components - should use CSS classes | Medium | Open | 2026-03-08 |
| TD-002 | No form validation feedback beyond `required` attribute | Low | Open | 2026-03-08 |

## Resolved Items

| ID | Description | Resolved | Track |
|----|-------------|----------|-------|
| TD-003 | `window.confirm` for deletions - replaced with ConfirmDialog | 2026-03-09 | cleanup_refactor_20260309 |
| TD-004 | Duplicate edit wrapper pattern in App.tsx | 2026-03-08 | cleanup_refactor_20260308 |
| TD-005 | parseInt without NaN validation | 2026-03-08 | cleanup_refactor_20260308 |

## Notes
- TD-001: Consider CSS modules or styled components in future refactor
- TD-002: Could integrate react-hook-form for better validation UX
