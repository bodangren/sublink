# Implementation Plan: Estimates/Quotes

## Phase 1: Data Layer
- [x] Task: Add Estimate type and database schema
    - [x] Write unit tests for estimate CRUD operations in db.ts
    - [x] Add Estimate interface to db.ts with fields: id, projectId, projectName, clientName, clientEmail, clientAddress, estimateNumber, issueDate, validUntilDate, lineItems, subtotal, taxRate, taxAmount, total, notes, status, createdAt
    - [x] Implement saveEstimate, getEstimate, getEstimates, deleteEstimate, updateEstimateStatus functions
    - [x] Add estimates object store to IndexedDB schema (increment version)
- [x] Task: Conductor - Phase 1 Manual Verification
[checkpoint: a1b2c3d]

## Phase 2: Estimate Form Component
- [x] Task: Create EstimateForm component
    - [x] Write unit tests for EstimateForm rendering and submission
    - [x] Create EstimateForm.tsx with fields for client info, line items, dates, tax
    - [x] Implement line item add/remove/edit functionality
    - [x] Add automatic total calculation
    - [x] Add project selector dropdown
    - [x] Handle both create and edit modes
- [x] Task: Conductor - Phase 2 Manual Verification
[checkpoint: f3e4g5h]

## Phase 3: Estimate List and Detail Views
- [x] Task: Create EstimateList component
    - [x] Write unit tests for EstimateList rendering
    - [x] Create EstimateList.tsx showing all estimates with status badges
    - [x] Add status filtering (draft, sent, accepted, declined, converted)
    - [x] Add navigation to detail/edit views
- [x] Task: Create EstimateDetail component
    - [x] Write unit tests for EstimateDetail rendering
    - [x] Create EstimateDetail.tsx showing full estimate information
    - [x] Add actions: Edit (draft only), Delete, Convert to Invoice, Export PDF
- [x] Task: Conductor - Phase 3 Manual Verification
[checkpoint: h6i7j8k]

## Phase 4: PDF Export
- [x] Task: Create estimate PDF generator
    - [x] Write unit tests for estimate PDF generation
    - [x] Create estimatePdf.ts utility with generateEstimatePdf function
    - [x] Include estimate number, dates, client info, line items, totals
    - [x] Add "VALID UNTIL" date prominently
    - [x] Style for professional appearance
- [x] Task: Conductor - Phase 4 Manual Verification
[checkpoint: k9l0m1n]

## Phase 5: Estimate to Invoice Conversion
- [x] Task: Implement conversion logic
    - [x] Write unit tests for estimate-to-invoice conversion
    - [x] Add convertEstimateToInvoice function in db.ts
    - [x] Copy all relevant fields from estimate to new invoice
    - [x] Update estimate status to "converted"
    - [x] Link estimate to created invoice
- [x] Task: Conductor - Phase 5 Manual Verification
[checkpoint: n1o2p3q]

## Phase 6: Dashboard Integration
- [x] Task: Create RecentEstimates widget
    - [x] Write unit tests for RecentEstimates component
    - [x] Create RecentEstimates.tsx showing last 5 estimates
    - [x] Display status badge and quick actions
    - [x] Add to dashboard layout
- [x] Task: Add estimate routes to App.tsx
    - [x] Add routes: /estimates, /estimates/new, /estimates/:id, /estimates/edit/:id
    - [x] Create edit wrapper components
    - [x] Add estimates to bottom navigation or keep in settings/projects flow
- [x] Task: Update README with estimates feature
- [x] Task: Conductor - Phase 6 Manual Verification
[checkpoint: q5r6s7t8u]
