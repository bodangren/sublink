# Specification: Estimates/Quotes

## Overview

Enable subcontractors to create professional estimates (quotes) for prospective work. Estimates serve as pre-work proposals that can be accepted by clients and converted to invoices once work begins. This feature directly supports the vision of helping subcontractors get work and get paid faster.

## Functional Requirements

### FR-1: Estimate Creation
- Users can create estimates with client information (name, email, address)
- Estimates support line items with description, quantity, unit price, and total
- Estimates include project reference (optional link to existing project)
- Automatic calculation of subtotal, tax rate, tax amount, and total
- Estimates have status: draft, sent, accepted, declined, converted

### FR-2: Estimate Management
- View list of all estimates with status indicators
- Edit existing estimates (draft status only)
- Delete estimates (with confirmation)
- Duplicate an existing estimate to create a new one

### FR-3: Estimate to Invoice Conversion
- One-click conversion of accepted estimates to invoices
- All line items, client info, and amounts transfer to the new invoice
- Original estimate marked as "converted" with reference to the invoice

### FR-4: PDF Export
- Generate professional PDF estimates for client presentation
- PDF includes company branding, estimate number, date, valid until date
- Line items clearly formatted with totals

### FR-5: Dashboard Integration
- Recent estimates widget on dashboard
- Quick action to create new estimate from home screen

## Non-Functional Requirements

### NFR-1: Offline-First
- All estimate operations must work offline via IndexedDB
- Data persists locally until sync is available

### NFR-2: Performance
- Estimate list loads in under 500ms
- PDF generation completes in under 3 seconds

### NFR-3: UX
- Large touch targets (44x44px minimum) for field use
- High contrast for outdoor visibility
- One-tap access to create estimate from dashboard

## Acceptance Criteria

1. User can create a new estimate with client details and line items
2. User can view, edit (draft only), and delete estimates
3. User can export estimate as PDF
4. User can convert an accepted estimate to an invoice
5. Estimate appears in dashboard recent activity
6. All operations work offline
7. Unit tests cover all estimate operations

## Out of Scope

- Email sending functionality (copy/download PDF instead)
- Digital signature on estimate acceptance
- Estimate versioning/history
- Multi-currency support
