# Mileage Tracking - Implementation Plan

## Phase 1: Database Layer (TDD)
**Estimated Time:** 30 minutes

### Tasks
- [ ] Add MileageEntry interface to db.ts
- [ ] Add mileageEntries store to SubLinkDB schema
- [ ] Implement saveMileage function with validation
- [ ] Implement getMileage function
- [ ] Implement updateMileage function
- [ ] Implement deleteMileage function
- [ ] Implement getMileageByProject function (index query)
- [ ] Implement getMileageByDateRange function (index query)
- [ ] Implement getAllMileage function
- [ ] Write comprehensive tests for all mileage functions
- [ ] Run tests and verify all pass

**Test Coverage Requirements:**
- CRUD operations for mileage entries
- Index queries work correctly
- Validation prevents invalid data
- Timestamps are managed correctly
- Project association works

**Commands:**
```bash
npm run test -- src/db.test.ts
npm run typecheck
```

---

## Phase 2: Mileage Form Component (TDD)
**Estimated Time:** 45 minutes

### Tasks
- [ ] Create MileageForm.test.tsx with test cases
- [ ] Implement MileageForm.tsx component
- [ ] Add form fields: date, start/end locations, project selector, purpose, notes
- [ ] Add round-trip toggle
- [ ] Implement GPS location capture for start location
- [ ] Add manual miles input field
- [ ] Implement form validation
- [ ] Add edit mode support (editId prop)
- [ ] Handle project selection from query params
- [ ] Write tests for form submission
- [ ] Write tests for validation
- [ ] Write tests for GPS capture (mock geolocation)
- [ ] Write tests for edit mode

**Test Coverage Requirements:**
- Form renders correctly
- Validation errors display
- Submit creates new entry
- Edit mode loads existing data
- GPS capture works
- Project selector works
- Round-trip calculation works

**Commands:**
```bash
npm run test -- src/components/MileageForm.test.tsx
```

---

## Phase 3: Mileage List Component (TDD)
**Estimated Time:** 30 minutes

### Tasks
- [ ] Create MileageList.test.tsx with test cases
- [ ] Implement MileageList.tsx component
- [ ] Display all mileage entries in table/list format
- [ ] Add project filter dropdown
- [ ] Add date range filter (start date, end date)
- [ ] Calculate and display total miles for filtered entries
- [ ] Add click to navigate to detail view
- [ ] Show project name if associated
- [ ] Display date, locations, miles, purpose
- [ ] Add "New Mileage" button
- [ ] Write tests for list rendering
- [ ] Write tests for filtering
- [ ] Write tests for total calculation

**Test Coverage Requirements:**
- List renders all entries
- Filtering by project works
- Filtering by date range works
- Total calculation is correct
- Navigation to detail works

**Commands:**
```bash
npm run test -- src/components/MileageList.test.tsx
```

---

## Phase 4: Mileage Detail Component (TDD)
**Estimated Time:** 20 minutes

### Tasks
- [ ] Create MileageDetail.test.tsx with test cases
- [ ] Implement MileageDetail.tsx component
- [ ] Display all mileage entry details
- [ ] Show project association with link
- [ ] Add Edit button linking to edit route
- [ ] Add Delete button with confirmation
- [ ] Display coordinates if available
- [ ] Show round-trip indicator
- [ ] Write tests for detail rendering
- [ ] Write tests for edit navigation
- [ ] Write tests for delete functionality

**Test Coverage Requirements:**
- Detail renders correctly
- All fields display
- Edit button works
- Delete with confirmation works
- Project link works

**Commands:**
```bash
npm run test -- src/components/MileageDetail.test.tsx
```

---

## Phase 5: Mileage Summary Component (TDD)
**Estimated Time:** 25 minutes

### Tasks
- [ ] Create MileageSummary.test.tsx with test cases
- [ ] Implement MileageSummary.tsx component
- [ ] Calculate total miles by project
- [ ] Calculate total miles by month
- [ ] Calculate total miles by year
- [ ] Display estimated cost using standard rate ($0.67/mile for 2024)
- [ ] Show breakdown by project in table
- [ ] Add configurable mileage rate
- [ ] Write tests for calculations
- [ ] Write tests for grouping logic

**Test Coverage Requirements:**
- Totals calculate correctly
- Grouping by project works
- Grouping by time period works
- Cost calculation is accurate

**Commands:**
```bash
npm run test -- src/components/MileageSummary.test.tsx
```

---

## Phase 6: Recent Mileage Dashboard Widget (TDD)
**Estimated Time:** 15 minutes

### Tasks
- [ ] Create RecentMileage.test.tsx with test cases
- [ ] Implement RecentMileage.tsx component
- [ ] Show last 5 mileage entries
- [ ] Display total miles for current week/month
- [ ] Add quick "Log Mileage" button
- [ ] Link to full mileage list
- [ ] Write tests for widget rendering
- [ ] Write tests for data display

**Test Coverage Requirements:**
- Widget renders recent entries
- Total calculation is correct
- Quick action button works
- Navigation works

**Commands:**
```bash
npm run test -- src/components/RecentMileage.test.tsx
```

---

## Phase 7: PDF Report Generation (TDD)
**Estimated Time:** 40 minutes

### Tasks
- [ ] Create mileagePdf.test.ts utility tests
- [ ] Implement mileagePdf.ts utility
- [ ] Generate PDF with date range selection
- [ ] Include summary section (total miles, cost)
- [ ] Include detailed entry list
- [ ] Group entries by project
- [ ] Add page headers/footers
- [ ] Include standard mileage rate
- [ ] Format for professional tax documentation
- [ ] Write tests for PDF generation
- [ ] Write tests for date filtering
- [ ] Write tests for grouping

**Test Coverage Requirements:**
- PDF generates without errors
- Date range filters correctly
- Grouping works
- Totals are accurate
- Professional formatting

**Commands:**
```bash
npm run test -- src/utils/mileagePdf.test.ts
```

---

## Phase 8: Routing and Navigation
**Estimated Time:** 15 minutes

### Tasks
- [ ] Add mileage routes to App.tsx
- [ ] Add "Mileage" link to main navigation
- [ ] Add mileage quick action to dashboard
- [ ] Ensure back navigation works correctly
- [ ] Test all routes manually

**Routes to Add:**
- `/mileage` - List all mileage entries
- `/mileage/new` - Create new entry
- `/mileage/:id` - View entry detail
- `/mileage/:id/edit` - Edit entry
- `/mileage/summary` - View summary/report

**Commands:**
```bash
npm run dev  # Manual testing
```

---

## Phase 9: Integration and Polish
**Estimated Time:** 30 minutes

### Tasks
- [ ] Add mileage to project detail view (show total miles)
- [ ] Ensure high-contrast styling matches existing theme
- [ ] Add loading states for async operations
- [ ] Add error handling and user feedback
- [ ] Test offline functionality
- [ ] Test GPS capture on mobile device
- [ ] Review accessibility (large touch targets, contrast)
- [ ] Add mileage stats to dashboard
- [ ] Manual end-to-end testing

**Testing Checklist:**
- [ ] Create mileage entry
- [ ] Edit mileage entry
- [ ] Delete mileage entry
- [ ] Filter by project
- [ ] Filter by date range
- [ ] Generate PDF report
- [ ] View summary
- [ ] Navigate from dashboard
- [ ] GPS capture works
- [ ] Works offline

---

## Phase 10: Final Validation
**Estimated Time:** 20 minutes

### Tasks
- [ ] Run full test suite: `npm run test`
- [ ] Run typecheck: `npm run typecheck`
- [ ] Run linter: `npm run lint`
- [ ] Build production: `npm run build`
- [ ] Build pages: `npm run build:pages`
- [ ] Manual smoke test of all features
- [ ] Verify offline functionality
- [ ] Check responsive design on mobile
- [ ] Review code for any TODOs or console.logs

**Success Criteria:**
- All tests pass
- No TypeScript errors
- No linting errors
- Production build succeeds
- All features work end-to-end
- Offline mode works

**Commands:**
```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run build:pages
```

---

## Total Estimated Time: 4.5 hours

## Notes
- Follow existing code patterns from invoices, expenses, and estimates
- Reuse PDF generation patterns from invoicePdf.ts and estimatePdf.ts
- Maintain consistency with existing UI/UX
- Prioritize offline-first functionality
- Use large touch targets and high contrast for rugged UX
