import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ExpenseList from './ExpenseList'
import { initDB, saveExpense, getExpenses, clearDatabase, saveProject } from '../db'
import 'fake-indexeddb/auto'

import type { Project } from '../db'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ExpenseList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('displays empty state when no expenses', async () => {
    renderWithRouter(<ExpenseList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no expenses found/i)).toBeDefined()
    })
  })

  it('displays list of expenses', async () => {
    await saveExpense({ description: 'Expense 1', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
    await saveExpense({ description: 'Expense 2', category: 'fuel', amount: 50, date: '2024-01-02', billable: true })
    
    renderWithRouter(<ExpenseList />)
    
    await waitFor(() => {
      expect(screen.getByText('Expense 1')).toBeDefined()
      expect(screen.getByText('Expense 2')).toBeDefined()
    })
  })

  it('shows billable indicator for billable expenses', async () => {
    await saveExpense({ description: 'Billable Expense', category: 'materials', amount: 100, date: '2024-01-01', billable: true })
    
    renderWithRouter(<ExpenseList />)
    
    await waitFor(() => {
      expect(screen.getByText('Billable')).toBeDefined()
    })
  })

  it('deletes expense when confirmed', async () => {
    await saveExpense({ description: 'Expense to delete', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
    
    renderWithRouter(<ExpenseList />)
    
    await waitFor(() => {
      expect(screen.getByText('Expense to delete')).toBeDefined()
    })
    
    window.confirm = () => true
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/i })
    fireEvent.click(deleteButtons[0])
    
    await waitFor(async () => {
      const expenses = await getExpenses()
      expect(expenses.find(e => e.description === 'Expense to delete')).toBeUndefined()
    })
  })

  it('displays total amount for filtered expenses', async () => {
    await saveExpense({ description: 'Expense 1', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
    await saveExpense({ description: 'Expense 2', category: 'materials', amount: 200, date: '2024-01-02', billable: false })
    
    renderWithRouter(<ExpenseList />)
    
    await waitFor(() => {
      expect(screen.getByText(/\$300.00/)).toBeDefined()
    })
  })
})
