# Implementation Plan: Payment Tracking

## Phase 1: Database Layer
1. Update `src/db.ts`:
   - Add `Payment` interface to `SubLinkDB` schema
   - Add `payments` object store with indexes
   - Increment DB version to 9
   - Add CRUD functions: `savePayment`, `getPayments`, `getPayment`, `getPaymentsByInvoice`, `updatePayment`, `deletePayment`, `getTotalPaidByInvoice`
   - Update `exportAllData` and `restoreData` to include payments

## Phase 2: Payment Form Component
2. Create `src/components/PaymentForm.tsx`:
   - Form with amount, date, method, reference, notes fields
   - Support both create and edit modes
   - Validation for required fields
   - Call `savePayment` or `updatePayment` on submit

3. Create `src/components/PaymentForm.test.tsx`:
   - Test form rendering
   - Test creating new payment
   - Test editing existing payment
   - Test validation

## Phase 3: Payment List Component
4. Create `src/components/PaymentList.tsx`:
   - Display payments for an invoice
   - Show date, amount, method, reference
   - Delete with confirmation
   - Edit navigation

5. Create `src/components/PaymentList.test.tsx`:
   - Test list rendering with payments
   - Test empty state
   - Test delete functionality

## Phase 4: Invoice Integration
6. Update `src/components/InvoiceDetail.tsx`:
   - Add payment summary section (total, paid, balance)
   - Add PaymentForm inline or as modal
   - Add PaymentList component
   - Update "Mark as Paid" to use payment system

7. Update `src/components/InvoiceList.tsx`:
   - Show paid amount alongside total
   - Add visual indicator for payment status

8. Update tests for InvoiceDetail and InvoiceList

## Phase 5: Dashboard Widget
9. Create `src/components/RecentPayments.tsx`:
   - Fetch and display last 5 payments
   - Show invoice number, client, amount, date
   - Link to invoice detail

10. Create `src/components/RecentPayments.test.tsx`:
    - Test widget rendering
    - Test empty state
    - Test navigation

11. Update `src/App.tsx`:
    - Import and add RecentPayments to Home component

## Phase 6: Testing & Verification
12. Run all tests: `npm run test -- --run`
13. Run build: `npm run build`
14. Manual verification of payment flow

## File Changes Summary
- `src/db.ts` - Add payments schema and functions
- `src/components/PaymentForm.tsx` - NEW
- `src/components/PaymentForm.test.tsx` - NEW
- `src/components/PaymentList.tsx` - NEW
- `src/components/PaymentList.test.tsx` - NEW
- `src/components/RecentPayments.tsx` - NEW
- `src/components/RecentPayments.test.tsx` - NEW
- `src/components/InvoiceDetail.tsx` - Update for payments
- `src/components/InvoiceDetail.test.tsx` - Update tests
- `src/components/InvoiceList.tsx` - Show payment status
- `src/components/InvoiceList.test.tsx` - Update tests
- `src/App.tsx` - Add RecentPayments widget
- `src/utils/dataBackup.ts` - Update backup summary type
