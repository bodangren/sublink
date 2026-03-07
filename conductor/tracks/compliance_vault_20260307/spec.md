# Specification: Compliance Vault

## User Stories

### Primary Story: COI Management
**As a** subcontractor  
**I want** to store and track my Certificates of Insurance  
**So that** I can ensure I'm always compliant and avoid being blocked from job sites

### Acceptance Criteria
1. User can add a new COI with the following fields:
   - Insurance Company Name
   - Policy Number
   - Policy Type (General Liability, Workers Comp, Auto, etc.)
   - Effective Date
   - Expiration Date
   - Coverage Amount
   - Notes (optional)

2. User can view a list of all stored COIs showing:
   - Insurance company
   - Policy number
   - Expiration date
   - Status indicator (Active, Expiring Soon, Expired)

3. Status indicators use color coding:
   - **Green:** Active (>30 days until expiration)
   - **Orange:** Expiring Soon (≤30 days until expiration)
   - **Red:** Expired (past expiration date)

4. User can edit existing COIs

5. User can delete COIs (with confirmation)

6. All operations work offline

## Technical Requirements

### Data Model
```typescript
interface COI {
  id: string
  insuranceCompany: string
  policyNumber: string
  policyType: string
  effectiveDate: string
  expirationDate: string
  coverageAmount: string
  notes?: string
  createdAt: number
  updatedAt: number
}
```

### Database
- Extend existing IndexedDB schema to include `certificates` object store
- Implement CRUD operations: createCOI, getCOIs, updateCOI, deleteCOI
- Database version upgrade from 1 to 2

### UI Components
1. **COIForm:** Form component for adding/editing certificates
2. **Compliance:** Updated list view with COI cards
3. **COICard:** Individual certificate display with status indicator

### Status Calculation Logic
```typescript
function getCOIStatus(expirationDate: string): 'active' | 'expiring' | 'expired' {
  const now = new Date()
  const exp = new Date(expirationDate)
  const daysUntilExpiration = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiration < 0) return 'expired'
  if (daysUntilExpiration <= 30) return 'expiring'
  return 'active'
}
```

## UI/UX Guidelines
- High-contrast color coding for status
- Large touch targets for outdoor use
- Clear visual hierarchy
- Immediate feedback on save operations
- "Add COI" button prominently displayed

## Testing Requirements
- Unit tests for COI status calculation
- Component tests for COIForm
- Integration tests for CRUD operations
- Database migration tests (v1 to v2)

## Out of Scope
- Automatic sync to cloud (future feature)
- Push notifications for expiration (future feature)
- Document upload/attachment (future feature)
