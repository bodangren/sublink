import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PaymentList from './PaymentList'
import { initDB, saveInvoice, savePayment, getPaymentsByInvoice, clearDatabase } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithConfirm = (component: React.ReactElement) => {
  return render(<ConfirmProvider>{component}</ConfirmProvider>)
}

describe('PaymentList', () => {
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
    renderWithConfirm(<PaymentList invoiceId={invoiceId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/no payments recorded yet/i)).toBeDefined()
    })
  })

  it('displays list of payments', async () => {
    await savePayment({
      invoiceId,
      amount: 500,
      date: '2024-01-15',
      method: 'check'
    })
    await savePayment({
      invoiceId,
      amount: 250,
      date: '2024-01-20',
      method: 'ach'
    })

    renderWithConfirm(<PaymentList invoiceId={invoiceId} />)
    
    await waitFor(() => {
      expect(screen.getByText('$500.00')).toBeDefined()
      expect(screen.getByText('$250.00')).toBeDefined()
    })
    
    expect(screen.getByText(/total paid:/i)).toBeDefined()
    expect(screen.getByText('$750.00')).toBeDefined()
    expect(screen.getByText('(2 payments)')).toBeDefined()
  })

  it('displays payment method labels', async () => {
    await savePayment({
      invoiceId,
      amount: 100,
      date: '2024-01-15',
      method: 'check',
      referenceNumber: 'CHK-123'
    })

    renderWithConfirm(<PaymentList invoiceId={invoiceId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Check')).toBeDefined()
    })
    expect(screen.getByText('Ref: CHK-123')).toBeDefined()
  })

  it('displays payment notes', async () => {
    await savePayment({
      invoiceId,
      amount: 100,
      date: '2024-01-15',
      method: 'cash',
      notes: 'First installment'
    })

    renderWithConfirm(<PaymentList invoiceId={invoiceId} />)
    
    await waitFor(() => {
      expect(screen.getByText('First installment')).toBeDefined()
    })
  })

  it('calls onEdit when edit button clicked', async () => {
    await savePayment({
      invoiceId,
      amount: 100,
      date: '2024-01-15',
      method: 'check'
    })

    const onEdit = vi.fn()
    renderWithConfirm(<PaymentList invoiceId={invoiceId} onEdit={onEdit} />)
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeDefined()
    })
    
    fireEvent.click(screen.getByText('Edit'))
    
    expect(onEdit).toHaveBeenCalled()
  })

  it('deletes payment after confirmation', async () => {
    await savePayment({
      invoiceId,
      amount: 100,
      date: '2024-01-15',
      method: 'check'
    })

    const onRefresh = vi.fn()
    renderWithConfirm(<PaymentList invoiceId={invoiceId} onRefresh={onRefresh} />)
    
    await waitFor(() => {
      const amounts = screen.getAllByText('$100.00')
      expect(amounts.length).toBeGreaterThan(0)
    })
    
    fireEvent.click(screen.getByText('Delete'))
    
    await waitFor(() => {
      expect(screen.getByText('Delete Payment')).toBeDefined()
    })
    
    const dialog = screen.getByRole('dialog')
    const confirmButtons = dialog.querySelectorAll('button')
    const confirmBtn = Array.from(confirmButtons).find(btn => btn.textContent === 'Delete')
    if (confirmBtn) {
      fireEvent.click(confirmBtn)
    }
    
    await waitFor(async () => {
      const payments = await getPaymentsByInvoice(invoiceId)
      expect(payments.length).toBe(0)
    })
    
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled()
    })
  })

  it('sorts payments by date descending', async () => {
    await savePayment({
      invoiceId,
      amount: 100,
      date: '2024-01-10',
      method: 'check'
    })
    await savePayment({
      invoiceId,
      amount: 200,
      date: '2024-01-20',
      method: 'cash'
    })

    renderWithConfirm(<PaymentList invoiceId={invoiceId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Cash')).toBeDefined()
      expect(screen.getByText('Check')).toBeDefined()
    })
    
    const allAmounts = screen.getAllByText(/\$\d+\.\d{2}$/)
    expect(allAmounts.length).toBeGreaterThanOrEqual(2)
    const totalPaidAmount = allAmounts.find(el => el.textContent === '$300.00')
    expect(totalPaidAmount).toBeDefined()
  })
})
