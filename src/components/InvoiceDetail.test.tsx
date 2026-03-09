import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import InvoiceDetail from './InvoiceDetail'
import { initDB, clearDatabase, saveInvoice } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (id: string) => {
  return render(
    <MemoryRouter initialEntries={[`/invoices/${id}`]}>
      <ConfirmProvider>
        <Routes>
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Routes>
      </ConfirmProvider>
    </MemoryRouter>
  )
}

describe('InvoiceDetail', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows loading initially', () => {
    renderWithRouter('test-id')
    
    expect(screen.getByText(/loading/i)).toBeDefined()
  })

  it('shows not found when invoice does not exist', async () => {
    renderWithRouter('nonexistent-id')
    
    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeDefined()
    })
  })

  it('displays invoice details', async () => {
    const result = await saveInvoice({
      clientName: 'Test Client',
      clientEmail: 'test@example.com',
      issueDate: '2026-03-08',
      dueDate: '2026-04-08',
      lineItems: [{
        id: '1',
        type: 'custom',
        description: 'Plumbing work',
        quantity: 2,
        rate: 100,
        amount: 200
      }],
      subtotal: 200,
      taxRate: 10,
      taxAmount: 20,
      total: 220,
      status: 'pending'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText(result.invoiceNumber)).toBeDefined()
      expect(screen.getByText('Test Client')).toBeDefined()
      expect(screen.getByText('Plumbing work')).toBeDefined()
    })
  })

  it('shows record payment button when balance due', async () => {
    const result = await saveInvoice({
      clientName: 'Payable Client',
      issueDate: '2026-03-08',
      dueDate: '2026-04-08',
      lineItems: [],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'pending'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('Record Payment')).toBeDefined()
    })
  })
})
