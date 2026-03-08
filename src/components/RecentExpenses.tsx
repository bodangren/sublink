import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getExpenses } from '../db'
import type { Expense, ExpenseCategory } from '../db'

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  materials: '#1976d2',
  fuel: '#f57c00',
  equipment_rental: '#7b1fa2',
  subcontractor: '#388e3c',
  other: '#757575'
}

const RecentExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totalAmount, setTotalAmount] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    const loadExpenses = async () => {
      const allExpenses = await getExpenses()
      const sorted = allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const recent = sorted.slice(0, 5)
      if (mounted) {
        setExpenses(recent)
        setTotalAmount(recent.reduce((sum, e) => sum + e.amount, 0))
      }
    }
    loadExpenses()
    return () => { mounted = false }
  }, [])

  if (expenses.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Expenses</h3>
        </div>
        <p className="card-text">No expenses recorded. Start tracking job costs.</p>
        <NavLink to="/expenses/new">
          <button className="card-button">Add Expense</button>
        </NavLink>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Expenses</h3>
        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
          ${totalAmount.toFixed(2)}
        </span>
      </div>
      <ul className="card-list">
        {expenses.map(expense => (
          <li key={expense.id} className="card-list-item">
            <NavLink to={`/expenses/${expense.id}`} className="item-link">
              <div className="item-header">
                <span className="item-title">{expense.description}</span>
                <span style={{
                  backgroundColor: CATEGORY_COLORS[expense.category],
                  color: '#fff',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '4px',
                  fontSize: '0.625rem',
                  marginLeft: '0.5rem'
                }}>
                  {expense.category.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="item-details">
                <span>{new Date(expense.date).toLocaleDateString()}</span>
                <span style={{ fontWeight: 'bold' }}>${expense.amount.toFixed(2)}</span>
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
      <NavLink to="/expenses" className="card-link">
        <button className="card-button">View All Expenses</button>
      </NavLink>
    </div>
  )
}

export default RecentExpenses
