# Specification: Extract useAsyncEffect Hook

## Overview
Refactor the codebase to eliminate duplicate `let mounted = true` patterns in useEffect hooks by extracting them into a reusable `useAsyncEffect` custom hook.

## Problem
The codebase has 37 instances of the same pattern:
```typescript
useEffect(() => {
  let mounted = true
  fetchData().then(data => {
    if (mounted) {
      setState(data)
    }
  })
  return () => { mounted = false }
}, [deps])
```

This pattern is repeated across nearly every component that fetches data, leading to:
- Code duplication
- Increased maintenance burden
- Potential for inconsistent implementation

## Solution
Create a `useAsyncEffect` custom hook that:
1. Handles the mounted/unmounted pattern internally
2. Provides a clean API for async operations
3. Optionally handles loading state
4. Can be used as a drop-in replacement for the current pattern

## Acceptance Criteria
1. `useAsyncEffect` hook created in `src/hooks/useAsyncEffect.ts`
2. At least 10 components refactored to use the new hook
3. All existing tests pass
4. Production build succeeds
5. No lint errors
