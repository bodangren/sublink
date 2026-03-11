# Specification: Project Profitability Dashboard

## Problem Statement
Subcontractors currently have no way to see if they're making or losing money on individual projects. They track time, expenses, and contract values separately but can't see the complete financial picture in one place.

## Solution
Add a "Financial Summary" section to the Project Detail page that aggregates all financial data and displays key profitability metrics.

## User Stories

### US-1: View Project Financials
As a subcontractor, I want to see a financial summary on the project detail page so I can understand my profitability on each job.

**Acceptance Criteria:**
- Financial summary shows total contract value
- Shows total billable time (hours and dollar value at configurable rate)
- Shows total expenses
- Shows profit/loss calculation
- Shows margin percentage
- All values are clearly labeled and formatted

### US-2: Configure Hourly Rate
As a subcontractor, I want to set my hourly rate so the system can calculate labor costs accurately.

**Acceptance Criteria:**
- Hourly rate can be set in Settings
- Rate persists across sessions
- Rate is used for all profitability calculations
- Default rate is $75/hour

### US-3: Quick Financial Overview
As a subcontractor, I want to see at a glance if a project is profitable or not.

**Acceptance Criteria:**
- Profit/loss displayed with color coding (green for profit, red for loss)
- Margin percentage shown as a percentage
- Visual indicator makes profitability immediately clear

## Data Requirements

### Financial Calculations
- **Contract Value:** From project.contractValue
- **Total Labor Hours:** Sum of all time entries for project
- **Labor Cost:** Total Labor Hours × Hourly Rate
- **Total Expenses:** Sum of all expenses for project
- **Total Costs:** Labor Cost + Total Expenses
- **Profit/Loss:** Contract Value - Total Costs
- **Margin %:** (Profit/Loss / Contract Value) × 100

### Edge Cases
- Project with no contract value: Show "Not Set" and skip margin calculation
- Project with no time entries: Show 0 hours, $0 labor
- Project with no expenses: Show $0 expenses
- Division by zero for margin when contract value is 0 or empty

## UI/UX Requirements
- Use existing high-contrast "rugged" theme
- Large, readable numbers
- Clear section header "Financial Summary"
- Responsive layout for mobile
- Color coding for positive/negative values
- Currency formatting with $ symbol and thousands separators
- Time formatting as "X hours Y minutes" or decimal hours

## Technical Constraints
- Must work offline (all data from IndexedDB)
- No external API calls
- Follow existing component patterns
- Add unit tests for calculation utilities
