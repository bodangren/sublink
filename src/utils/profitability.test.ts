import { describe, it, expect } from 'vitest'
import {
  calculateProjectProfitability,
  formatHours,
  formatCurrency,
  formatPercent,
} from './profitability'
import type { Project, TimeEntry, Expense } from '../db'

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-id',
  name: 'Test Project',
  contractValue: '10000',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

const createMockTimeEntry = (durationMs: number): TimeEntry => ({
  id: 'time-id',
  projectId: 'test-id',
  startTime: Date.now() - durationMs,
  endTime: Date.now(),
  duration: durationMs,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const createMockExpense = (amount: number): Expense => ({
  id: 'exp-id',
  description: 'Test Expense',
  category: 'materials',
  amount,
  date: '2024-01-01',
  billable: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

describe('calculateProjectProfitability', () => {
  it('calculates profitability for a project with all data', () => {
    const project = createMockProject({ contractValue: '10000' })
    const timeEntries = [
      createMockTimeEntry(8 * 3600000),
      createMockTimeEntry(4 * 3600000),
    ]
    const expenses = [
      createMockExpense(500),
      createMockExpense(250),
    ]
    const hourlyRate = 75

    const result = calculateProjectProfitability(project, timeEntries, expenses, hourlyRate)

    expect(result.contractValue).toBe(10000)
    expect(result.totalHours).toBe(12)
    expect(result.laborCost).toBe(900)
    expect(result.totalExpenses).toBe(750)
    expect(result.totalCosts).toBe(1650)
    expect(result.profitLoss).toBe(8350)
    expect(result.marginPercent).toBeCloseTo(83.5, 1)
    expect(result.hasContractValue).toBe(true)
  })

  it('handles project with no contract value', () => {
    const project = createMockProject({ contractValue: '' })
    const timeEntries = [createMockTimeEntry(8 * 3600000)]
    const expenses = [createMockExpense(100)]
    const hourlyRate = 75

    const result = calculateProjectProfitability(project, timeEntries, expenses, hourlyRate)

    expect(result.contractValue).toBe(0)
    expect(result.hasContractValue).toBe(false)
    expect(result.marginPercent).toBeNull()
    expect(result.profitLoss).toBe(-700)
  })

  it('handles project with no time entries', () => {
    const project = createMockProject({ contractValue: '5000' })
    const timeEntries: TimeEntry[] = []
    const expenses = [createMockExpense(500)]
    const hourlyRate = 75

    const result = calculateProjectProfitability(project, timeEntries, expenses, hourlyRate)

    expect(result.totalHours).toBe(0)
    expect(result.laborCost).toBe(0)
    expect(result.totalExpenses).toBe(500)
  })

  it('handles project with no expenses', () => {
    const project = createMockProject({ contractValue: '5000' })
    const timeEntries = [createMockTimeEntry(8 * 3600000)]
    const expenses: Expense[] = []
    const hourlyRate = 75

    const result = calculateProjectProfitability(project, timeEntries, expenses, hourlyRate)

    expect(result.totalHours).toBe(8)
    expect(result.laborCost).toBe(600)
    expect(result.totalExpenses).toBe(0)
  })

  it('handles zero hourly rate', () => {
    const project = createMockProject({ contractValue: '5000' })
    const timeEntries = [createMockTimeEntry(8 * 3600000)]
    const expenses = [createMockExpense(500)]
    const hourlyRate = 0

    const result = calculateProjectProfitability(project, timeEntries, expenses, hourlyRate)

    expect(result.laborCost).toBe(0)
    expect(result.totalCosts).toBe(500)
  })

  it('calculates loss correctly', () => {
    const project = createMockProject({ contractValue: '1000' })
    const timeEntries = [createMockTimeEntry(20 * 3600000)]
    const expenses = [createMockExpense(500)]
    const hourlyRate = 75

    const result = calculateProjectProfitability(project, timeEntries, expenses, hourlyRate)

    expect(result.profitLoss).toBe(-1000)
    expect(result.marginPercent).toBe(-100)
  })

  it('handles invalid contract value string', () => {
    const project = createMockProject({ contractValue: 'invalid' })
    const timeEntries: TimeEntry[] = []
    const expenses: Expense[] = []
    const hourlyRate = 75

    const result = calculateProjectProfitability(project, timeEntries, expenses, hourlyRate)

    expect(result.contractValue).toBe(0)
    expect(result.hasContractValue).toBe(false)
  })
})

describe('formatHours', () => {
  it('formats hours only', () => {
    expect(formatHours(8)).toBe('8h')
  })

  it('formats minutes only', () => {
    expect(formatHours(0.5)).toBe('30m')
  })

  it('formats hours and minutes', () => {
    expect(formatHours(8.5)).toBe('8h 30m')
  })

  it('handles zero hours', () => {
    expect(formatHours(0)).toBe('0m')
  })

  it('rounds minutes correctly', () => {
    expect(formatHours(1.25)).toBe('1h 15m')
  })
})

describe('formatCurrency', () => {
  it('formats positive values', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500.00')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats large values', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00')
  })
})

describe('formatPercent', () => {
  it('formats positive percentage with plus sign', () => {
    expect(formatPercent(25.5)).toBe('+25.5%')
  })

  it('formats negative percentage', () => {
    expect(formatPercent(-10.25)).toBe('-10.3%')
  })

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('+0.0%')
  })

  it('returns N/A for null', () => {
    expect(formatPercent(null)).toBe('N/A')
  })
})
