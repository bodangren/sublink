import { useState } from 'react'
import type { Expense, ExpenseCategory } from '../db'
import { generateExpensePDF, generateExpensePDFFilename, downloadPDF, getCategoryTotals } from '../utils/expensePdf'

interface ExpenseSummaryProps {
  expenses: Expense[]
  projectNames: Map<string, string>
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materials: 'Materials',
  fuel: 'Fuel',
  equipment_rental: 'Equipment Rental',
  subcontractor: 'Subcontractor',
  other: 'Other'
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  materials: '#1976d2',
  fuel: '#f57c00',
  equipment_rental: '#7b1fa2',
  subcontractor: '#388e3c',
  other: '#757575'
}

const ExpenseSummary = ({ expenses, projectNames }: ExpenseSummaryProps) => {
  const [showExport, setShowExport] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [exporting, setExporting] = useState(false)

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const categoryTotals = getCategoryTotals(expenses)
  const categoriesWithExpenses = (Object.keys(categoryTotals) as ExpenseCategory[]).filter(
    cat => categoryTotals[cat] > 0
  )

  const handleExport = async () => {
    setExporting(true)
    try {
      const filteredExpenses = expenses.filter(
        e => e.date >= startDate && e.date <= endDate
      )
      const blob = await generateExpensePDF(filteredExpenses, startDate, endDate, projectNames)
      const filename = generateExpensePDFFilename(new Date().toISOString().split('T')[0])
      downloadPDF(blob, filename)
    } finally {
      setExporting(false)
      setShowExport(false)
    }
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--secondary-bg)',
        borderRadius: '4px',
        border: '2px solid var(--accent-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ fontSize: '1.25rem' }}>Total: ${total.toFixed(2)}</strong>
            <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
              ({expenses.length} expense{expenses.length !== 1 ? 's' : ''})
            </span>
          </div>
          <button
            onClick={() => setShowExport(!showExport)}
            disabled={expenses.length === 0}
            style={{ minWidth: '120px' }}
          >
            Export PDF
          </button>
        </div>

        {categoriesWithExpenses.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categoriesWithExpenses.map(cat => (
              <span
                key={cat}
                style={{
                  backgroundColor: CATEGORY_COLORS[cat],
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              >
                {CATEGORY_LABELS[cat]}: ${categoryTotals[cat].toFixed(2)}
              </span>
            ))}
          </div>
        )}
      </div>

      {showExport && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--secondary-bg)',
          borderRadius: '4px',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Export Options</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                From:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.5rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                To:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '0.5rem' }}
              />
            </div>
            <button
              onClick={handleExport}
              disabled={exporting || !startDate || !endDate}
              style={{ minWidth: '100px' }}
            >
              {exporting ? 'Exporting...' : 'Download'}
            </button>
            <button
              onClick={() => setShowExport(false)}
              style={{ backgroundColor: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseSummary
