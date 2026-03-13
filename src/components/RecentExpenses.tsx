import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getExpenses } from '../db'
import type { Expense, ExpenseCategory } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  materials: '#1976d2',
  fuel: '#f57c00',
  equipment_rental: '#7b1fa2',
  subcontractor: '#388e3c',
  other: '#757575'
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materials: 'Materials',
  fuel: 'Fuel',
  equipment_rental: 'Rental',
  subcontractor: 'Sub',
  other: 'Other'
}

interface RecentExpensesProps {
  inline?: boolean
}

const RecentExpenses = ({ inline = false }: RecentExpensesProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totalAmount, setTotalAmount] = useState<number>(0)

  useAsyncEffect(
    async (isMounted) => {
      const allExpenses = await getExpenses()
      const sorted = allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const recent = sorted.slice(0, 5)
      if (isMounted()) {
        setExpenses(recent)
        setTotalAmount(recent.reduce((sum, e) => sum + e.amount, 0))
      }
    },
    []
  )

  const content = expenses.length === 0 ? (
    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
      No expenses yet. <NavLink to="/expenses/new" style={{ color: 'var(--accent-color)' }}>Add one</NavLink>
    </p>
  ) : (
    <>
      <div style={{
        marginBottom: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Recent Total</span>
        <strong style={{ color: 'var(--accent-color)' }}>${totalAmount.toFixed(2)}</strong>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {expenses.map(expense => (
          <li
            key={expense.id}
            style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <NavLink
              to={`/expenses/${expense.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{expense.description}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {new Date(expense.date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  backgroundColor: CATEGORY_COLORS[expense.category],
                  color: '#fff',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                }}>
                  {CATEGORY_LABELS[expense.category]}
                </span>
                <span style={{ fontWeight: 'bold' }}>${expense.amount.toFixed(2)}</span>
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
      <NavLink
        to="/expenses"
        style={{
          display: 'block',
          textAlign: 'center',
          color: 'var(--accent-color)',
          textDecoration: 'none',
          fontSize: '0.875rem',
          paddingTop: '0.75rem',
        }}
      >
        View All →
      </NavLink>
    </>
  )

  if (inline) {
    return <div>{content}</div>
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Expenses</h3>
        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
          ${totalAmount.toFixed(2)}
        </span>
      </div>
      {content}
    </div>
  )
}

export default RecentExpenses
