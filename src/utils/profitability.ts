import type { Project, TimeEntry, Expense } from '../db'

export interface ProfitabilityResult {
  contractValue: number
  totalHours: number
  laborCost: number
  totalExpenses: number
  totalCosts: number
  profitLoss: number
  marginPercent: number | null
  hasContractValue: boolean
}

export function calculateProjectProfitability(
  project: Project,
  timeEntries: TimeEntry[],
  expenses: Expense[],
  hourlyRate: number
): ProfitabilityResult {
  const contractValue = parseFloat(project.contractValue || '0') || 0
  const hasContractValue = contractValue > 0
  
  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 3600000), 0)
  const laborCost = totalHours * hourlyRate
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalCosts = laborCost + totalExpenses
  
  const profitLoss = contractValue - totalCosts
  
  const marginPercent = hasContractValue ? (profitLoss / contractValue) * 100 : null
  
  return {
    contractValue,
    totalHours,
    laborCost,
    totalExpenses,
    totalCosts,
    profitLoss,
    marginPercent,
    hasContractValue,
  }
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) {
    return `${m}m`
  }
  if (m === 0) {
    return `${h}h`
  }
  return `${h}h ${m}m`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null): string {
  if (value === null) return 'N/A'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}
