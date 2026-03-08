# Implementation Plan: Invoicing

## Phase 1: Data Layer & Tests
- [ ] 1.1 Add `invoices` interface to SubLinkDB schema in db.ts
- [ ] 1.2 Increment DB version to 7, create invoices object store
- [ ] 1.3 Implement invoice CRUD functions: saveInvoice, getInvoices, getInvoice, updateInvoice, deleteInvoice
- [ ] 1.4 Implement invoice number generation: getNextInvoiceNumber
- [ ] 1.5 Write unit tests for invoice database operations

## Phase 2: Invoice Form Component
- [ ] 2.1 Create InvoiceForm.tsx component with fields for client info, dates, notes
- [ ] 2.2 Add line item management (add/remove/edit items)
- [ ] 2.3 Implement time entry selector to add time entries as line items
- [ ] 2.4 Add automatic calculation of subtotal, tax, and total
- [ ] 2.5 Write tests for InvoiceForm component

## Phase 3: Invoice List & Detail Views
- [ ] 3.1 Create InvoiceList.tsx component with status indicators
- [ ] 3.2 Add filtering by status (all/pending/paid/overdue)
- [ ] 3.3 Create InvoiceDetail.tsx component to view invoice details
- [ ] 3.4 Add "Mark as Paid" functionality
- [ ] 3.5 Add delete invoice with confirmation
- [ ] 3.6 Write tests for list and detail components

## Phase 4: PDF Export
- [ ] 4.1 Create generateInvoicePDF function using jspdf
- [ ] 4.2 Design professional PDF layout with company info, line items, totals
- [ ] 4.3 Add download button to invoice detail view
- [ ] 4.4 Test PDF generation with various line item counts

## Phase 5: Dashboard Integration
- [ ] 5.1 Add unpaid invoice count to DashboardStats component
- [ ] 5.2 Add total outstanding amount to dashboard
- [ ] 5.3 Add recent invoices to activity feed
- [ ] 5.4 Update dashboard tests

## Phase 6: Navigation & Routing
- [ ] 6.1 Add "Invoices" link to main navigation
- [ ] 6.2 Add routes: /invoices, /invoices/new, /invoices/:id, /invoices/:id/edit
- [ ] 6.3 Update App.tsx with invoice routes
- [ ] 6.4 Write routing tests

## Phase 7: Final Verification
- [ ] 7.1 Run full test suite
- [ ] 7.2 Run production build
- [ ] 7.3 Manual testing of complete invoice workflow
- [ ] 7.4 Update README.md with invoicing feature
