import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import InvoiceList from './InvoiceList'
import { initDB, clearDatabase, saveInvoice, savePayment } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfirmProvider>{component}</ConfirmProvider>
    </BrowserRouter>
  )
}

describe('InvoiceList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders empty state when no invoices', () => {
    renderWithRouter(<InvoiceList />)
    
    expect(screen.getByText(/no invoices/i)).toBeDefined()
    expect(screen.getByText(/new invoice/i)).toBeDefined()
  })

  it('displays list of invoices', async () => {
    await saveInvoice({
      clientName: 'Client A',
      issueDate: '2026-03-08',
      dueDate: '2026-04-08',
      lineItems: [{
        id: '1',
        type: 'custom',
        description: 'Work',
        quantity: 1,
        rate: 100,
        amount: 100
      }],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'pending'
    })

    await saveInvoice({
      clientName: 'Client B',
      issueDate: '2026-03-07',
      dueDate: '2026-04-07',
      lineItems: [{
        id: '2',
        type: 'custom',
        description: 'Work',
        quantity: 2,
        rate: 50,
        amount: 100
      }],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'paid'
    })
    
    renderWithRouter(<InvoiceList />)
    
    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeDefined()
      expect(screen.getByText('Client B')).toBeDefined()
    })
  })

  it('filters invoices by status', async () => {
    await saveInvoice({
      clientName: 'Pending Client',
      issueDate: '2026-03-08',
      dueDate: '2026-04-08',
      lineItems: [],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'pending'
    })

    const paidInvoice = await saveInvoice({
      clientName: 'Paid Client',
      issueDate: '2026-03-08',
      dueDate: '2026-04-08',
      lineItems: [],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'pending'
    })
    
    await savePayment({
      invoiceId: paidInvoice.id,
      amount: 100,
      date: '2026-03-09',
      method: 'check'
    })
    
    renderWithRouter(<InvoiceList />)
    
    await waitFor(() => {
      expect(screen.getByText('Pending Client')).toBeDefined()
      expect(screen.getByText('Paid Client')).toBeDefined()
    })
    
    fireEvent.click(screen.getByText(/paid \(/i))
    
    await waitFor(() => {
      expect(screen.getByText('Paid Client')).toBeDefined()
      expect(screen.queryByText('Pending Client')).toBeNull()
    })
  })

  it('shows invoice totals', async () => {
    await saveInvoice({
      clientName: 'Test Client',
      issueDate: '2026-03-08',
      dueDate: '2026-04-08',
      lineItems: [{
        id: '1',
        type: 'custom',
        description: 'Work',
        quantity: 5,
        rate: 100,
        amount: 500
      }],
      subtotal: 500,
      taxRate: 10,
      taxAmount: 50,
      total: 550,
      status: 'pending'
    })
    
    renderWithRouter(<InvoiceList />)
    
    await waitFor(() => {
      expect(screen.getByText('$550.00')).toBeDefined()
    })
  })
})
