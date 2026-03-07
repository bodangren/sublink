# Specification: Codebase Cleanup & Refactor

## Identified Issues

### 1. Missing Project Memory Files
- No `conductor/tech-debt.md` - should track known shortcuts
- No `conductor/lessons-learned.md` - should capture patterns and gotchas

### 2. Unarchived Completed Tracks
The following tracks are marked complete but still in `tracks/` folder:
- `scaffold_pwa_20260307`
- `digital_lien_waivers_20260307`
- `compliance_vault_20260307`

### 3. Duplicate Edit Wrapper Pattern
In `App.tsx`, `COIEditWrapper` and `TaskEditWrapper` share nearly identical code:
```typescript
const [item, setItem] = useState<Item | null>(null)
const id = window.location.pathname.split('/').pop()
useEffect(() => {
  const load = async () => {
    if (id) {
      const items = await getItems()
      const found = items.find(i => i.id === id)
      if (found) setItem(found)
    }
  }
  load()
}, [id])
if (!item) return <div className="container"><p>Loading...</p></div>
return <Form editId={id} initialData={item} />
```

### 4. Duplicate Form Handler Pattern
`handleChange` function duplicated across:
- `COIForm.tsx`
- `TaskForm.tsx`
- `WaiverForm.tsx`

### 5. parseInt Without Validation
In `App.tsx:159`:
```typescript
Coverage: ${parseInt(coi.coverageAmount).toLocaleString()}
```
This can produce `NaN.toLocaleString()` if coverageAmount is empty or invalid.

## Acceptance Criteria

1. `conductor/tech-debt.md` exists with proper format
2. `conductor/lessons-learned.md` exists with project insights
3. All completed tracks moved to `conductor/archive/`
4. `tracks.md` updated with correct links
5. Generic `EditWrapper` component created and used
6. `useFormFields` hook extracted for form state management
7. `parseInt` replaced with safe parsing function
8. All tests pass
9. Production build succeeds

## Out of Scope
- Major architectural changes
- New features
- UI/UX redesign
