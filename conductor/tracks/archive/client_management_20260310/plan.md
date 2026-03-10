# Client Management - Implementation Plan

## Phase 1: Database Schema & API
- [x] Add `clients` store to db.ts schema (version 12)
- [x] Add `clientId` field to projects, invoices, estimates
- [x] Implement CRUD functions: saveClient, getClients, getClient, updateClient, deleteClient
- [x] Add getProjectsByClient, getInvoicesByClient, getEstimatesByClient

## Phase 2: Client Components
- [x] Create ClientForm component with validation
- [x] Create ClientList component with search
- [x] Create ClientDetail component showing related records
- [x] Create ClientSelect dropdown component

## Phase 3: Integration
- [x] Update ProjectForm to use ClientSelect
- [x] Update InvoiceForm to use ClientSelect (auto-fill client details)
- [x] Update EstimateForm to use ClientSelect (auto-fill client details)
- [x] Add Clients section to navigation

## Phase 4: Tests & Polish
- [x] Unit tests for ClientForm, ClientList, ClientDetail, ClientSelect
- [x] Integration tests for db client functions
- [x] Verify backward compatibility with existing data
- [x] Update README with new feature

## Files to Create
- src/components/ClientForm.tsx
- src/components/ClientList.tsx
- src/components/ClientDetail.tsx
- src/components/ClientSelect.tsx
- src/components/ClientForm.test.tsx
- src/components/ClientList.test.tsx
- src/components/ClientDetail.test.tsx
- src/components/ClientSelect.test.tsx

## Files to Modify
- src/db.ts - Add clients store and functions
- src/db.test.ts - Add client tests
- src/components/ProjectForm.tsx - Add client selection
- src/components/InvoiceForm.tsx - Add client selection
- src/components/EstimateForm.tsx - Add client selection
- src/App.tsx - Add routes for clients
- README.md - Document new feature
