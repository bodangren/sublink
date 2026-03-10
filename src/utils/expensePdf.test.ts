import { describe, it, expect, vi } from 'vitest'
import { generateExpensePDF, generateExpensePDFFilename, getCategoryTotals } from './expensePdf'
import type { Expense } from '../db'

vi.mock('./pdfShared', () => ({
  PAGE_MARGIN: 20,
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  formatDate: (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US'),
  addHeader: vi.fn(() => 45),
  addFooter: vi.fn(),
  downloadPDF: vi.fn()
}))

const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Lumber for framing',
    category: 'materials',
    amount: 250.00,
    vendor: 'Home Depot',
    date: '2026-03-01',
    billable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    description: 'Gas for truck',
    category: 'fuel',
    amount: 75.50,
    vendor: 'Shell',
    date: '2026-03-02',
    billable: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '3',
    description: 'Scaffolding rental',
    category: 'equipment_rental',
    amount: 300.00,
    vendor: 'United Rentals',
    date: '2026-03-03',
    billable: true,
    projectId: 'proj-1',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '4',
    description: 'Electrical work by sub',
    category: 'subcontractor',
    amount: 1500.00,
    vendor: 'Sparky Electric',
    date: '2026-03-04',
    billable: true,
    projectId: 'proj-1',
    notes: 'Panel upgrade',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '5',
    description: 'Coffee and donuts',
    category: 'other',
    amount: 25.00,
    date: '2026-03-05',
    billable: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

describe('getCategoryTotals', () => {
  it('should calculate totals by category', () => {
    const totals = getCategoryTotals(mockExpenses)
    
    expect(totals.materials).toBe(250.00)
    expect(totals.fuel).toBe(75.50)
    expect(totals.equipment_rental).toBe(300.00)
    expect(totals.subcontractor).toBe(1500.00)
    expect(totals.other).toBe(25.00)
  })

  it('should return zero for categories with no expenses', () => {
    const totals = getCategoryTotals([])
    
    expect(totals.materials).toBe(0)
    expect(totals.fuel).toBe(0)
    expect(totals.equipment_rental).toBe(0)
    expect(totals.subcontractor).toBe(0)
    expect(totals.other).toBe(0)
  })
})

describe('generateExpensePDF', () => {
  it('should generate a PDF blob', async () => {
    const blob = await generateExpensePDF(mockExpenses, '2026-03-01', '2026-03-31')
    
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/pdf')
  })

  it('should generate PDF with empty expenses list', async () => {
    const blob = await generateExpensePDF([], '2026-03-01', '2026-03-31')
    
    expect(blob).toBeInstanceOf(Blob)
  })

  it('should include project names when provided', async () => {
    const expensesWithProject: Expense[] = [
      {
        ...mockExpenses[2],
        projectId: 'proj-1'
      }
    ]
    
    const projectNames = new Map([['proj-1', 'Test Project']])
    const blob = await generateExpensePDF(expensesWithProject, '2026-03-01', '2026-03-31', projectNames)
    
    expect(blob).toBeInstanceOf(Blob)
  })
})

describe('generateExpensePDFFilename', () => {
  it('should generate filename with date', () => {
    const filename = generateExpensePDFFilename('2026-03-10')
    
    expect(filename).toBe('SubLink_Expenses_2026-03-10.pdf')
  })
})
