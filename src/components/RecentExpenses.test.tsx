import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RecentExpenses from './RecentExpenses'
import { initDB, saveExpense, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('RecentExpenses', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('displays empty state when no expenses', async () => {
    renderWithRouter(<RecentExpenses />)
    
    await waitFor(() => {
      expect(screen.getByText(/no expenses yet/i)).toBeDefined()
    })
  })

  it('displays recent expenses', async () => {
    await saveExpense({ description: 'Expense 1', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
    await saveExpense({ description: 'Expense 2', category: 'fuel', amount: 50, date: '2024-01-02', billable: false })
    
    renderWithRouter(<RecentExpenses />)
    
    await waitFor(() => {
      expect(screen.getByText('Expense 1')).toBeDefined()
      expect(screen.getByText('Expense 2')).toBeDefined()
    })
  })

  it('limits to 5 most recent expenses', async () => {
    for (let i = 1; i <= 7; i++) {
      await saveExpense({ description: `Expense ${i}`, category: 'materials', amount: i * 10, date: `2024-01-0${i}`, billable: false })
    }
    
    renderWithRouter(<RecentExpenses />)
    
    await waitFor(() => {
      expect(screen.getByText('Expense 7')).toBeDefined()
      expect(screen.queryByText('Expense 1')).toBeNull()
      expect(screen.queryByText('Expense 2')).toBeNull()
    })
  })

  it('displays total amount for recent expenses', async () => {
    await saveExpense({ description: 'Expense 1', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
    await saveExpense({ description: 'Expense 2', category: 'materials', amount: 50, date: '2024-01-02', billable: false })
    
    renderWithRouter(<RecentExpenses />)
    
    expect((await screen.findAllByText(/\$150.00/)).length).toBeGreaterThan(0)
  })
})
