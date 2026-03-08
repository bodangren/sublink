import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveExpense, updateExpense, getProjects, getExpense, getTasks } from '../db'
import type { Project, Task, ExpenseCategory } from '../db'

interface ExpenseData {
  projectId: string
  taskId: string
  description: string
  category: ExpenseCategory
  amount: string
  vendor: string
  date: string
  billable: boolean
  notes: string
}

interface ExpenseFormProps {
  editId?: string
  initialData?: ExpenseData
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'materials', label: 'Materials' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'equipment_rental', label: 'Equipment Rental' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'other', label: 'Other' }
]

const ExpenseForm = ({ editId, initialData }: ExpenseFormProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [formData, setFormData] = useState<ExpenseData>(initialData || {
    projectId: searchParams.get('projectId') || '',
    taskId: '',
    description: '',
    category: 'materials',
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    billable: true,
    notes: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getProjects().then(setProjects)
    getTasks().then(setTasks)
  }, [])

  useEffect(() => {
    if (editId && !initialData) {
      getExpense(editId).then(expense => {
        if (expense) {
          setFormData({
            projectId: expense.projectId || '',
            taskId: expense.taskId || '',
            description: expense.description,
            category: expense.category,
            amount: expense.amount.toString(),
            vendor: expense.vendor || '',
            date: expense.date,
            billable: expense.billable,
            notes: expense.notes || ''
          })
        }
      })
    }
  }, [editId, initialData])

  const filteredTasks = formData.projectId
    ? tasks.filter(t => t.projectId === formData.projectId)
    : tasks

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount < 0) {
      setError('Please enter a valid amount')
      setIsSubmitting(false)
      return
    }

    try {
      const expenseData = {
        description: formData.description,
        category: formData.category,
        amount,
        date: formData.date,
        billable: formData.billable,
        ...(formData.projectId && { projectId: formData.projectId }),
        ...(formData.taskId && { taskId: formData.taskId }),
        ...(formData.vendor && { vendor: formData.vendor }),
        ...(formData.notes && { notes: formData.notes })
      }

      if (editId) {
        await updateExpense(editId, expenseData)
      } else {
        await saveExpense(expenseData)
      }
      navigate('/expenses')
    } catch (err) {
      setError('Failed to save expense. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h2>{editId ? 'Edit Expense' : 'New Expense'}</h2>
      {error && (
        <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="projectId">Project (Optional)</label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
        >
          <option value="">No Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label htmlFor="taskId">Task (Optional)</label>
        <select
          id="taskId"
          name="taskId"
          value={formData.taskId}
          onChange={handleChange}
        >
          <option value="">No Task</option>
          {filteredTasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>

        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          {EXPENSE_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. 2x4 lumber, 50 gal water heater"
          required
        />

        <label htmlFor="amount">Amount ($)</label>
        <input
          id="amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          required
        />

        <label htmlFor="vendor">Vendor (Optional)</label>
        <input
          id="vendor"
          type="text"
          name="vendor"
          value={formData.vendor}
          onChange={handleChange}
          placeholder="e.g. Home Depot, ABC Supply"
        />

        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <div style={{ margin: '1rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="billable"
              checked={formData.billable}
              onChange={handleChange}
              style={{ width: 'auto' }}
            />
            Billable to Client
          </label>
        </div>

        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional details..."
          rows={3}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (editId ? 'Update Expense' : 'Save Expense')}
        </button>

        <button
          type="button"
          onClick={() => navigate('/expenses')}
          style={{ backgroundColor: '#444', color: '#fff', marginLeft: '0.5rem' }}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

export default ExpenseForm
