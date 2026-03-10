# Client Management - Specification

## Overview
Add a centralized Client Management system that allows subcontractors to store client information once and reuse it across projects, invoices, estimates, and waivers. This eliminates redundant data entry and ensures consistency.

## User Stories
1. As a subcontractor, I want to create and manage client contacts so I don't have to re-enter client info for every invoice/estimate.
2. As a subcontractor, I want to link clients to projects so all related records show the correct client.
3. As a subcontractor, I want to select from existing clients when creating invoices and estimates.
4. As a subcontractor, I want to view all projects, invoices, and estimates for a specific client.

## Data Model
```typescript
clients: {
  key: string
  value: {
    id: string
    name: string           // Required - Company or individual name
    contactPerson?: string // Primary contact name
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    notes?: string
    createdAt: number
    updatedAt: number
  }
}
```

## Components
1. **ClientList** - Display all clients with search/filter
2. **ClientForm** - Create/edit client information
3. **ClientDetail** - View client details with related projects/invoices/estimates
4. **ClientSelect** - Reusable dropdown for selecting clients in forms

## Integration Points
- ProjectForm: Add client selection dropdown
- InvoiceForm: Use ClientSelect instead of manual entry
- EstimateForm: Use ClientSelect instead of manual entry
- Dashboard: Show recent clients or quick client stats

## UI Requirements
- High-contrast design matching existing rugged aesthetic
- Large touch targets for gloved hands
- Clear visual feedback on save/delete actions
- Search functionality for quick client lookup

## Database Migration
- Add `clients` object store (version 12)
- Add `clientId` field to projects, invoices, estimates
- Maintain backward compatibility with existing data
