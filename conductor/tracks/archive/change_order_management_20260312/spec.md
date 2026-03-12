# Specification: Change Order Management

## Overview
Implement a change order management system that allows subcontractors to track scope changes, cost adjustments, and approval status for construction projects. Change orders are critical for maintaining accurate billing and protecting lien rights.

## Functional Requirements

### FR-1: Change Order Creation
- Create change orders linked to specific projects
- Include description of work being added/modified/removed
- Specify cost adjustment (positive for additions, negative for deletions)
- Add reason/justification for the change
- Reference to original contract line items (optional)
- Automatic change order numbering (CO-001, CO-002, etc.)

### FR-2: Change Order Status Tracking
- **Draft**: Initial creation, not yet submitted
- **Submitted**: Sent to GC/client for approval
- **Approved**: Change approved, ready for billing
- **Rejected**: Change rejected by GC/client
- Status transitions with timestamps

### FR-3: Change Order Details
- Change order number (auto-generated)
- Project reference
- Description of change
- Original scope reference (optional)
- Cost impact (increase/decrease)
- Date submitted
- Date approved/rejected
- Notes/comments

### FR-4: Project Integration
- View all change orders for a project
- See total change order value on project detail
- Link approved change orders to invoices
- Dashboard widget showing pending change orders

### FR-5: Reporting
- Export change order summary as PDF
- View change order history by project

## Non-Functional Requirements

### NFR-1: Performance
- Change order list should load in under 200ms
- Form submission should complete in under 100ms

### NFR-2: Offline-First
- All change order operations must work without network connectivity
- Data persisted in IndexedDB

### NFR-3: Accessibility
- Touch targets minimum 44x44px for outdoor use
- High contrast for visibility in bright sunlight
- Clear status indicators with color coding

## Acceptance Criteria

1. User can create a new change order linked to a project
2. User can edit change orders in draft status
3. User can change change order status (draft -> submitted -> approved/rejected)
4. User can view all change orders for a project
5. Project detail shows total change order value
6. User can export change order as PDF
7. All change order data persists in IndexedDB
8. Change orders work completely offline

## Out of Scope

- Digital signatures on change orders
- Email notifications for status changes
- Change order templates
- Multi-party approval workflows
