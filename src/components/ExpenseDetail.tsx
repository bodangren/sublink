import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { getExpense, deleteExpense, getProject, getInvoice } from '../db'
import type { Expense, ExpenseCategory } from '../db'
import { useConfirm } from '../hooks/useConfirm'

interface ExpenseDetailProps {
  expenseId: string
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

const ExpenseDetail = ({ expenseId }: ExpenseDetailProps) => {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        const expenseData = await getExpense(expenseId)
        if (!mounted) return
        if (!expenseData) {
          navigate('/expenses')
          return
        }
        setExpense(expenseData)

        if (expenseData.projectId) {
          const project = await getProject(expenseData.projectId)
          if (project) setProjectName(project.name)
        }

        if (expenseData.invoiceId) {
          const invoice = await getInvoice(expenseData.invoiceId)
          if (invoice) setInvoiceNumber(invoice.invoiceNumber)
        }
      } catch (err) {
        console.error('Failed to load expense:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [expenseId, navigate])

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteExpense(expenseId)
      navigate('/expenses')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="container">
        <p>Expense not found.</p>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Expense Details</h2>
        <span style={{
          backgroundColor: CATEGORY_COLORS[expense.category],
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          {CATEGORY_LABELS[expense.category]}
        </span>
      </div>

      <div style={{
        backgroundColor: 'var(--secondary-bg)',
        padding: '1.5rem',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          ${expense.amount.toFixed(2)}
        </div>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>{expense.description}</p>
        
        {projectName && (
          <p style={{ margin: '0.5rem 0', color: 'var(--accent-color)' }}>
            <strong>Project:</strong> {projectName}
          </p>
        )}

        {expense.vendor && (
          <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
            <strong>Vendor:</strong> {expense.vendor}
          </p>
        )}

        <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
          <strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}
        </p>

        {expense.billable && (
          <p style={{ margin: '0.5rem 0' }}>
            <span style={{
              backgroundColor: expense.invoiceId ? 'var(--success-color)' : 'var(--accent-color)',
              color: expense.invoiceId ? '#fff' : '#000',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              {expense.invoiceId ? `Billed on ${invoiceNumber}` : 'Billable'}
            </span>
          </p>
        )}

        {expense.notes && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <strong>Notes:</strong>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>{expense.notes}</p>
          </div>
        )}

        <p style={{ margin: '1rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Created: {new Date(expense.createdAt).toLocaleDateString()} at {new Date(expense.createdAt).toLocaleTimeString()}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <NavLink to={`/expenses/edit/${expense.id}`} style={{ flex: 1 }}>
          <button style={{ width: '100%', padding: '0.75rem 1rem' }}>Edit Expense</button>
        </NavLink>
        <button
          onClick={handleDelete}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: '#dc3545',
            color: '#fff'
          }}
        >
          Delete Expense
        </button>
      </div>

      <button
        onClick={() => navigate('/expenses')}
        style={{ marginTop: '1rem', backgroundColor: '#444', color: '#fff' }}
      >
        Back to Expenses
      </button>
    </div>
  )
}

export default ExpenseDetail
