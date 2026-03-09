import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RecentPayments from './RecentPayments'
import { initDB, saveInvoice, savePayment, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('RecentPayments', () => {
  let invoiceId: string

  beforeEach(async () => {
    await initDB()
    await clearDatabase()
    const result = await saveInvoice({
      clientName: 'Test Client',
      issueDate: '2024-01-01',
      dueDate: '2024-01-31',
      lineItems: [],
      subtotal: 1000,
      taxRate: 0,
      taxAmount: 0,
      total: 1000,
      status: 'pending'
    })
    invoiceId = result.id
  })

  it('displays empty state when no payments', async () => {
    renderWithRouter(<RecentPayments />)
    
    await waitFor(() => {
      expect(screen.getByText(/no payments recorded/i)).toBeDefined()
    })
  })

  it('displays recent payments', async () => {
    await savePayment({
      invoiceId,
      amount: 500,
      date: '2024-01-15',
      method: 'check'
    })
    
    renderWithRouter(<RecentPayments />)
    
    await waitFor(() => {
      expect(screen.getByText('$500.00')).toBeDefined()
    })
  })

  it('displays invoice number with payment', async () => {
    await savePayment({
      invoiceId,
      amount: 250,
      date: '2024-01-20',
      method: 'ach'
    })
    
    renderWithRouter(<RecentPayments />)
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeDefined()
    })
  })

  it('limits to 5 most recent payments', async () => {
    for (let i = 0; i < 7; i++) {
      await savePayment({
        invoiceId,
        amount: 100 * (i + 1),
        date: `2024-01-${String(i + 10).padStart(2, '0')}`,
        method: 'check'
      })
    }
    
    renderWithRouter(<RecentPayments />)
    
    await waitFor(() => {
      const amounts = screen.getAllByText(/\$\d+\.\d{2}/)
      expect(amounts.length).toBe(5)
    })
  })
})
