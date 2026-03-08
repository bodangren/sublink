import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import InvoiceDetail from './InvoiceDetail'
import { initDB, clearDatabase, saveInvoice, getInvoice } from '../db'
import 'fake-indexeddb/auto'

describe('InvoiceDetail', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows loading initially', () => {
    render(
      <MemoryRouter initialEntries={['/invoices/test-id']}>
        <Routes>
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText(/loading/i)).toBeDefined()
  })

  it('shows not found when invoice does not exist', async () => {
    render(
      <MemoryRouter initialEntries={['/invoices/nonexistent-id']}>
        <Routes>
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Routes>
      </MemoryRouter>
    )
    
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

    render(
      <MemoryRouter initialEntries={[`/invoices/${result.id}`]}>
        <Routes>
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Routes>
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText(result.invoiceNumber)).toBeDefined()
      expect(screen.getByText('Test Client')).toBeDefined()
      expect(screen.getByText('Plumbing work')).toBeDefined()
    })
  })

  it('marks invoice as paid', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    
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

    render(
      <MemoryRouter initialEntries={[`/invoices/${result.id}`]}>
        <Routes>
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Routes>
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Mark as Paid')).toBeDefined()
    })
    
    fireEvent.click(screen.getByText('Mark as Paid'))
    
    await waitFor(async () => {
      const invoice = await getInvoice(result.id)
      expect(invoice?.status).toBe('paid')
    })
    
    vi.restoreAllMocks()
  })
})
