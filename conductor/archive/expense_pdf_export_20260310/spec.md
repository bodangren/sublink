# Expense Report PDF Export

## Overview
Generate professional PDF reports for tracked expenses, enabling subcontractors to document business expenses for tax purposes. This feature complements the existing mileage tracking PDF export and provides comprehensive expense documentation.

## Functional Requirements

### FR1: PDF Report Generation
- Generate a professional PDF document listing expenses
- Include expense date, description, category, vendor, amount, and notes
- Display totals by category and grand total
- Show billable status for each expense
- Include project association when applicable

### FR2: Date Range Filtering
- Allow filtering expenses by date range
- Default to current tax year or all expenses
- Display the selected date range prominently in the report

### FR3: Category Summaries
- Group expenses by category (materials, fuel, equipment_rental, subcontractor, other)
- Show subtotal for each category
- Calculate and display grand total

### FR4: Project Filtering
- Allow filtering by project (optional)
- Show project name in header when filtered
- Include project column when showing all expenses

### FR5: Export UI Integration
- Add "Export PDF" button to ExpenseList component
- Include date range selector in export modal/dropdown
- Provide immediate feedback on successful export

## Non-Functional Requirements

### NFR1: Performance
- PDF generation should complete within 3 seconds for up to 500 expenses

### NFR2: Mobile-Friendly
- Export button accessible with large touch target (44x44px minimum)
- Export works offline

### NFR3: Consistent Design
- Match existing PDF styling (invoices, estimates, mileage)
- Use SubLink branding with high-contrast colors

## Acceptance Criteria

1. User can generate a PDF expense report from the ExpenseList page
2. PDF includes all expense details with category summaries
3. Date range filtering works correctly
4. Report includes totals by category and grand total
5. PDF downloads with a sensible filename (e.g., `SubLink_Expenses_2026-03-10.pdf`)
6. All tests pass with >80% coverage for new code

## Out of Scope

- Receipt photo embedding in PDF (future enhancement)
- Email sending of reports
- Multi-currency support
- Expense approval workflows
