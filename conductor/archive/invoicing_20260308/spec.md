# Track: Invoicing - Create and Export Professional Invoices

## Overview
Enable subcontractors to create professional invoices based on time entries and tasks, export them as PDFs, and track payment status. This feature directly addresses the product vision of helping subcontractors "get paid faster."

## Problem Statement
Subcontractors currently track time and complete tasks but have no way to convert that work into billable invoices. They need to:
- Create invoices from tracked time entries
- Add line items for materials or fixed-price work
- Export professional PDF invoices for clients
- Track which invoices have been paid

## Goals
1. Allow users to create invoices linked to projects
2. Support adding time entries as billable line items
3. Support adding custom line items (materials, fixed costs)
4. Generate professional PDF invoices
5. Track invoice payment status (pending, paid, overdue)
6. Display invoice list with filtering and status indicators

## Acceptance Criteria
- [ ] Users can create a new invoice with client info, project reference, and due date
- [ ] Users can add time entries from a project as invoice line items
- [ ] Users can add custom line items (description, quantity, rate, amount)
- [ ] Invoice calculates subtotal, tax (optional), and total automatically
- [ ] Users can export invoice as a professional PDF
- [ ] Invoice list shows all invoices with status indicators (pending/paid/overdue)
- [ ] Users can mark invoices as paid
- [ ] Dashboard shows unpaid invoice count and total amount outstanding
- [ ] All invoice operations work offline (IndexedDB storage)
- [ ] Tests pass with >80% coverage on new code

## Technical Requirements
- New `invoices` object store in IndexedDB (DB version 7)
- Invoice data model:
  - id, invoiceNumber, projectId, clientName, clientEmail, clientAddress
  - issueDate, dueDate, lineItems[], subtotal, taxRate, taxAmount, total
  - notes, status (draft/pending/paid/overdue), paidAt
  - createdAt, updatedAt
- Line item model:
  - id, type (time/custom), description, quantity, rate, amount
  - timeEntryId (optional, for time-based items)
- PDF generation using jspdf (already in use)
- Invoice number auto-increment (format: INV-001, INV-002, etc.)

## Out of Scope
- Email sending (offline-first constraint)
- Online payment processing
- Recurring invoices
- Multiple tax rates per invoice

## Dependencies
- Existing project management feature
- Existing time tracking feature
- Existing PDF generation (jspdf)
