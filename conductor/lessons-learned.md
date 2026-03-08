# Lessons Learned

> Bounded to 50 lines. Archive older items to `archive/lessons-history.md`.

## Architecture Decisions
- **IndexedDB Schema Migrations:** Use version numbers carefully - increment for each new object store. Test upgrade paths to prevent data loss.
- **Offline-First Design:** All data operations must go through db.ts functions. Never assume network availability.

## Recurring Gotchas
- **Date Handling:** Always use ISO 8601 format (`toISOString().split('T')[0]`) for date inputs to avoid timezone issues.
- **Canvas Context:** `SignatureCanvas` requires explicit dimensions in `canvasProps` to render correctly.
- **GPS Permissions:** `navigator.geolocation` may fail silently - always handle errors gracefully.

## Useful Patterns
- **Edit Wrappers:** Generic `EditWrapper<T>` component reduces boilerplate for edit routes.
- **Form State:** `useFormFields<T>` hook standardizes form handling across components.
- **Mounted Flag:** Use `let mounted = true` pattern in `useEffect` to prevent state updates after unmount.

## Testing Insights
- **IndexedDB in Tests:** Use `initDB()` in test setup and `clearDatabase()` in teardown.
- **Signature Canvas Mock:** Mock `react-signature-canvas` in tests to avoid canvas errors.
- **HTMLDialogElement in jsdom:** Need to mock `showModal()` and `close()` methods in setupTests.ts since jsdom doesn't support native dialog element.
- **ConfirmProvider Wrapper:** Components using `useConfirm` hook must be wrapped in `ConfirmProvider` in tests.
- **Multiple Button Matches:** When testing dialog confirmations, use `getAllByRole` and click the last element, or use `within()` to scope queries to the dialog.

## Performance Notes
- **Photo Thumbnails:** Full-resolution photos stored in IndexedDB can slow down list views - consider thumbnail generation in future.
