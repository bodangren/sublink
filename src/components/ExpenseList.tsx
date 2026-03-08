import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getExpenses, deleteExpense, getProjects } from '../db'
import type { Expense, Project, ExpenseCategory } from '../db'
import { useConfirm } from '../hooks/useConfirm'

interface ExpenseWithProject extends Expense {
  projectName?: string
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

const ExpenseList = () => {
  const [expenses, setExpenses] = useState<ExpenseWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filterProject, setFilterProject] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      const [expenseList, projectList] = await Promise.all([
        getExpenses(),
        getProjects()
      ])
      const projectMap = new Map(projectList.map(p => [p.id, p.name]))
      const expensesWithProjects = expenseList.map(expense => ({
        ...expense,
        projectName: expense.projectId ? projectMap.get(expense.projectId) : undefined
      }))
      if (mounted) {
        setProjects(projectList)
        setExpenses(expensesWithProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      if (filterProject && expense.projectId !== filterProject) return false
      if (filterCategory && expense.category !== filterCategory) return false
      return true
    })
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteExpense(id)
      const expenseList = await getExpenses()
      const projectMap = new Map(projects.map(p => [p.id, p.name]))
      const expensesWithProjects = expenseList.map(expense => ({
        ...expense,
        projectName: expense.projectId ? projectMap.get(expense.projectId) : undefined
      }))
      setExpenses(expensesWithProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    }
  }

  const filteredExpenses = getFilteredExpenses()

  return (
    <div className="container">
      <h1>Expenses</h1>
      <NavLink to="/expenses/new">
        <button>New Expense</button>
      </NavLink>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="filterProject" style={{ marginRight: '0.5rem' }}>Project:</label>
          <select
            id="filterProject"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterCategory" style={{ marginRight: '0.5rem' }}>Category:</label>
          <select
            id="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredExpenses.length > 0 && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: 'var(--secondary-bg)', 
          borderRadius: '4px',
          border: '2px solid var(--accent-color)'
        }}>
          <strong>Total: ${filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</strong>
          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
            ({filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        {filteredExpenses.length === 0 ? (
          <p>No expenses found. Start tracking your job-related costs.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredExpenses.map(expense => (
              <li key={expense.id} style={{
                backgroundColor: 'var(--secondary-bg)',
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{expense.description}</strong>
                    {expense.projectName && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--accent-color)' }}>
                        {expense.projectName}
                      </div>
                    )}
                    <small style={{ color: 'var(--text-secondary)' }}>
                      {new Date(expense.date).toLocaleDateString()}
                    </small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                      ${expense.amount.toFixed(2)}
                    </div>
                    <span style={{
                      backgroundColor: CATEGORY_COLORS[expense.category],
                      color: '#fff',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      {CATEGORY_LABELS[expense.category]}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {expense.vendor && <><strong>Vendor:</strong> {expense.vendor}</>}
                  {expense.billable && !expense.invoiceId && (
                    <span style={{ 
                      marginLeft: expense.vendor ? '0.5rem' : '0', 
                      color: 'var(--accent-color)' 
                    }}>
                      Billable
                    </span>
                  )}
                  {expense.invoiceId && (
                    <span style={{ marginLeft: '0.5rem', color: 'var(--success-color)' }}>
                      Billed
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <NavLink to={`/expenses/${expense.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                      View
                    </button>
                  </NavLink>
                  <NavLink to={`/expenses/edit/${expense.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Edit</button>
                  </NavLink>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff' }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ExpenseList
