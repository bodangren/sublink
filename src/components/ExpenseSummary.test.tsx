import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExpenseSummary from './ExpenseSummary'
import type { Expense, ExpenseCategory } from '../db'

vi.mock('../utils/expensePdf', () => ({
  generateExpensePDF: vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
  generateExpensePDFFilename: vi.fn().mockReturnValue('SubLink_Expenses_2026-03-10.pdf'),
  downloadPDF: vi.fn(),
  getCategoryTotals: vi.fn().mockReturnValue({
    materials: 250,
    fuel: 75.50,
    equipment_rental: 300,
    subcontractor: 1500,
    other: 25
  })
}))

const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Lumber',
    category: 'materials' as ExpenseCategory,
    amount: 250,
    date: '2026-03-01',
    billable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    description: 'Gas',
    category: 'fuel' as ExpenseCategory,
    amount: 75.50,
    date: '2026-03-02',
    billable: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

describe('ExpenseSummary', () => {
  it('should display total amount', () => {
    render(<ExpenseSummary expenses={mockExpenses} projectNames={new Map()} />)
    
    expect(screen.getByText(/\$325\.50/)).toBeDefined()
  })

  it('should display expense count', () => {
    render(<ExpenseSummary expenses={mockExpenses} projectNames={new Map()} />)
    
    expect(screen.getByText(/2 expenses/)).toBeDefined()
  })

  it('should show export button', () => {
    render(<ExpenseSummary expenses={mockExpenses} projectNames={new Map()} />)
    
    expect(screen.getByText('Export PDF')).toBeDefined()
  })

  it('should show category totals', () => {
    render(<ExpenseSummary expenses={mockExpenses} projectNames={new Map()} />)
    
    expect(screen.getByText(/Materials:/)).toBeDefined()
    expect(screen.getByText(/Fuel:/)).toBeDefined()
  })
})
