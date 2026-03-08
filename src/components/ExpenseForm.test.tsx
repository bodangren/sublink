import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ExpenseForm from './ExpenseForm'
import { initDB, getExpenses, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ExpenseForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all required fields', () => {
    renderWithRouter(<ExpenseForm />)
    
    expect(screen.getByLabelText(/description/i)).toBeDefined()
    expect(screen.getByLabelText(/category/i)).toBeDefined()
    expect(screen.getByLabelText(/amount/i)).toBeDefined()
    expect(screen.getByLabelText(/date/i)).toBeDefined()
  })

  it('saves new expense to database', async () => {
    renderWithRouter(<ExpenseForm />)
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Lumber purchase' }
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '150.50' }
    })
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' }
    })
    
    fireEvent.click(screen.getByText(/save expense/i))
    
    await waitFor(async () => {
      const expenses = await getExpenses()
      expect(expenses.length).toBeGreaterThan(0)
      expect(expenses[0].description).toBe('Lumber purchase')
      expect(expenses[0].amount).toBe(150.50)
      expect(expenses[0].date).toBe('2024-01-15')
      expect(expenses[0].category).toBe('materials')
      expect(expenses[0].billable).toBe(true)
    })
  })

  it('saves expense with vendor and notes', async () => {
    renderWithRouter(<ExpenseForm />)
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Equipment rental' }
    })
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'equipment_rental' }
    })
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '500' }
    })
    fireEvent.change(screen.getByLabelText(/vendor/i), {
      target: { value: 'Rental Co' }
    })
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-20' }
    })
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Weekly rate' }
    })
    
    fireEvent.click(screen.getByText(/save expense/i))
    
    await waitFor(async () => {
      const expenses = await getExpenses()
      expect(expenses[0].category).toBe('equipment_rental')
      expect(expenses[0].vendor).toBe('Rental Co')
      expect(expenses[0].notes).toBe('Weekly rate')
    })
  })

  it('validates amount is required', async () => {
    renderWithRouter(<ExpenseForm />)
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test expense' }
    })
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2024-01-15' }
    })
    
    const submitButton = screen.getByText(/save expense/i)
    expect((submitButton as HTMLButtonElement).form?.checkValidity()).toBe(false)
  })

  it('renders with initial data in edit mode', () => {
    const initialData = {
      projectId: '',
      taskId: '',
      description: 'Existing expense',
      category: 'fuel' as const,
      amount: '75.00',
      vendor: 'Gas Station',
      date: '2024-01-10',
      billable: false,
      notes: 'Edit test'
    }
    
    renderWithRouter(<ExpenseForm editId="test-id" initialData={initialData} />)
    
    const descInput = screen.getByLabelText(/description/i) as HTMLInputElement
    expect(descInput.value).toBe('Existing expense')
    
    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement
    expect(categorySelect.value).toBe('fuel')
    
    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement
    expect(amountInput.value).toBe('75.00')
    
    const vendorInput = screen.getByLabelText(/vendor/i) as HTMLInputElement
    expect(vendorInput.value).toBe('Gas Station')
  })

  it('shows different button text in edit mode', () => {
    const initialData = {
      projectId: '',
      taskId: '',
      description: 'Test',
      category: 'materials' as const,
      amount: '100',
      vendor: '',
      date: '2024-01-01',
      billable: true,
      notes: ''
    }
    
    renderWithRouter(<ExpenseForm editId="test-id" initialData={initialData} />)
    
    expect(screen.getByText(/update expense/i)).toBeDefined()
  })
})
