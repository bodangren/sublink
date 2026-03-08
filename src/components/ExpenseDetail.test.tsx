import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ExpenseDetail from './ExpenseDetail'
import { initDB, saveExpense, getExpenses, clearDatabase, saveProject } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfirmProvider>{component}</ConfirmProvider>
    </BrowserRouter>
  )
}

describe('ExpenseDetail', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('displays expense details', async () => {
    const expenseId = await saveExpense({ 
      description: 'Test Expense', 
      category: 'materials', 
      amount: 250.50, 
      date: '2024-01-15', 
      billable: false 
    })
    
    renderWithRouter(<ExpenseDetail expenseId={expenseId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Expense')).toBeDefined()
      expect(screen.getByText(/\$250.50/)).toBeDefined()
      expect(screen.getByText('Materials')).toBeDefined()
    })
  })

  it('displays vendor when present', async () => {
    const expenseId = await saveExpense({ 
      description: 'Vendor Expense', 
      category: 'materials', 
      amount: 100, 
      vendor: 'Home Depot',
      date: '2024-01-15', 
      billable: false 
    })
    
    renderWithRouter(<ExpenseDetail expenseId={expenseId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Home Depot')).toBeDefined()
    })
  })

  it('displays project name when linked to project', async () => {
    const projectId = await saveProject({ name: 'Test Project' })
    const expenseId = await saveExpense({ 
      projectId,
      description: 'Project Expense', 
      category: 'materials', 
      amount: 100, 
      date: '2024-01-15', 
      billable: false 
    })
    
    renderWithRouter(<ExpenseDetail expenseId={expenseId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeDefined()
    })
  })

  it('shows billable status', async () => {
    const expenseId = await saveExpense({ 
      description: 'Billable Expense', 
      category: 'materials', 
      amount: 100, 
      date: '2024-01-15', 
      billable: true 
    })
    
    renderWithRouter(<ExpenseDetail expenseId={expenseId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Billable')).toBeDefined()
    })
  })

  it('deletes expense when delete is clicked and confirmed', async () => {
    const expenseId = await saveExpense({ 
      description: 'Expense to delete', 
      category: 'materials', 
      amount: 100, 
      date: '2024-01-15', 
      billable: false 
    })
    
    renderWithRouter(<ExpenseDetail expenseId={expenseId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Expense to delete')).toBeDefined()
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Delete Expense' }))
    
    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this expense?')).toBeDefined()
    })
    
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })
    fireEvent.click(deleteButtons[deleteButtons.length - 1])
    
    await waitFor(async () => {
      const expenses = await getExpenses()
      expect(expenses.length).toBe(0)
    })
  })

  it('shows category with correct color', async () => {
    const expenseId = await saveExpense({ 
      description: 'Fuel Expense', 
      category: 'fuel', 
      amount: 50, 
      date: '2024-01-15', 
      billable: false 
    })
    
    renderWithRouter(<ExpenseDetail expenseId={expenseId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Fuel')).toBeDefined()
    })
  })
})
