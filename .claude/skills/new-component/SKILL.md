---
name: new-component
description: Scaffold a new feature component set (Form, List, Detail + tests) following project conventions
disable-model-invocation: true
---

# New Component Scaffolder

Generate a complete feature component set for SubLink following established patterns.

## Usage

`/new-component <FeatureName>`

## What it creates

Given a feature name (e.g., `Equipment`), scaffold:

1. `src/components/<Name>Form.tsx` — Create/edit form with validation
2. `src/components/<Name>List.tsx` — Filterable list view
3. `src/components/<Name>Detail.tsx` — Detail/view page
4. `src/components/<Name>Form.test.tsx` — Form tests
5. `src/components/<Name>List.test.tsx` — List tests
6. `src/components/<Name>Detail.test.tsx` — Detail tests

## Conventions to follow

- Read existing components in `src/components/` to match patterns (e.g., `ProjectForm.tsx`, `TaskList.tsx`)
- Use IndexedDB via `idb` library — data store defined in `src/db.ts`
- Add the new object store to `src/db.ts` if needed
- Use `react-router-dom` for navigation (match existing route patterns in `App.tsx`)
- Large touch targets, high-contrast styling for outdoor/construction use
- Tests use `@testing-library/react`, `vitest`, and `fake-indexeddb`
- Register new routes in `App.tsx`
