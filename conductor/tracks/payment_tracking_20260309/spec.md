# Specification: Payment Tracking

## Overview
Add comprehensive payment tracking to SubLink, allowing subcontractors to record payments received on invoices. This includes support for partial payments, multiple payment methods, and a complete payment history.

## User Stories

### US-1: Record Payment on Invoice
As a subcontractor, I want to record a payment received on an invoice so that I can track what I've been paid.

**Acceptance Criteria:**
- Can access "Record Payment" from invoice detail page
- Can enter payment amount, date, method, and reference number
- Payment is saved and linked to the invoice
- Invoice balance is automatically calculated

### US-2: View Payment History
As a subcontractor, I want to see the payment history for an invoice so I know what's been paid and what's outstanding.

**Acceptance Criteria:**
- Payment history displayed on invoice detail
- Shows date, amount, method, and reference for each payment
- Shows running balance after each payment

### US-3: Track Partial Payments
As a subcontractor, I want to record partial payments because GCs often pay in installments.

**Acceptance Criteria:**
- Can record multiple payments per invoice
- Balance updates after each payment
- Invoice shows total paid and remaining balance

### US-4: View Recent Payments on Dashboard
As a subcontractor, I want to see recent payments on the dashboard so I know what money came in recently.

**Acceptance Criteria:**
- Dashboard shows last 5 payments received
- Shows invoice number, client, amount, and date
- Links to invoice detail

### US-5: Payment Summary in Invoice List
As a subcontractor, I want to see payment status at a glance in the invoice list.

**Acceptance Criteria:**
- Invoice list shows total paid amount
- Visual indicator for fully paid vs partially paid vs unpaid

## Data Model

### Payment Entity
```typescript
interface Payment {
  id: string
  invoiceId: string
  amount: number
  date: string
  method: 'check' | 'cash' | 'ach' | 'credit_card' | 'other'
  referenceNumber?: string
  notes?: string
  createdAt: number
  updatedAt: number
}
```

### Payment Method Labels
- `check` - Check
- `cash` - Cash
- `ach` - ACH/Bank Transfer
- `credit_card` - Credit Card
- `other` - Other

## UI Components

### PaymentForm
- Amount input (required)
- Date picker (default: today)
- Payment method dropdown
- Reference number input (optional)
- Notes textarea (optional)

### PaymentList
- Table or card list of payments
- Sort by date (newest first)
- Delete option with confirmation

### RecentPayments (Dashboard Widget)
- Last 5 payments
- Compact card format
- Links to invoices

### InvoicePaymentSummary
- Total invoice amount
- Total paid
- Balance due
- Progress bar (optional)

## Database Changes
- Add `payments` object store to IndexedDB
- Index by `invoiceId` and `date`
- Increment DB version to 9

## Routes
- Payments are created/viewed within invoice context
- No separate `/payments` route needed
- Form shown as modal or inline on invoice detail

## Integration Points
- InvoiceDetail: Add payment section with form and history
- InvoiceList: Show paid/total amounts
- Dashboard: Add RecentPayments widget
- Data backup: Include payments in export/restore
