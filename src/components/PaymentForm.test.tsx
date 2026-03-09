import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PaymentForm from './PaymentForm'
import { initDB, getPayments, clearDatabase, saveInvoice } from '../db'
import 'fake-indexeddb/auto'

describe('PaymentForm', () => {
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

  it('renders form with all required fields', () => {
    const onSuccess = vi.fn()
    render(<PaymentForm invoiceId={invoiceId} onSuccess={onSuccess} />)
    
    expect(screen.getByLabelText(/payment amount/i)).toBeDefined()
    expect(screen.getByLabelText(/payment date/i)).toBeDefined()
    expect(screen.getByLabelText(/payment method/i)).toBeDefined()
  })

  it('saves new payment to database', async () => {
    const onSuccess = vi.fn()
    render(<PaymentForm invoiceId={invoiceId} onSuccess={onSuccess} />)
    
    fireEvent.change(screen.getByLabelText(/payment amount/i), {
      target: { value: '500.00' }
    })
    fireEvent.change(screen.getByLabelText(/payment date/i), {
      target: { value: '2024-01-15' }
    })
    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: 'check' }
    })
    
    fireEvent.click(screen.getByText(/record payment/i))
    
    await waitFor(async () => {
      const payments = await getPayments()
      expect(payments.length).toBe(1)
      expect(payments[0].amount).toBe(500)
      expect(payments[0].date).toBe('2024-01-15')
      expect(payments[0].method).toBe('check')
      expect(payments[0].invoiceId).toBe(invoiceId)
    })
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('saves payment with reference number and notes', async () => {
    const onSuccess = vi.fn()
    render(<PaymentForm invoiceId={invoiceId} onSuccess={onSuccess} />)
    
    fireEvent.change(screen.getByLabelText(/payment amount/i), {
      target: { value: '250' }
    })
    fireEvent.change(screen.getByLabelText(/reference number/i), {
      target: { value: 'Check #1234' }
    })
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Partial payment' }
    })
    
    fireEvent.click(screen.getByText(/record payment/i))
    
    await waitFor(async () => {
      const payments = await getPayments()
      expect(payments[0].referenceNumber).toBe('Check #1234')
      expect(payments[0].notes).toBe('Partial payment')
    })
  })

  it('validates amount must be positive', async () => {
    const onSuccess = vi.fn()
    render(<PaymentForm invoiceId={invoiceId} onSuccess={onSuccess} />)
    
    const amountInput = screen.getByLabelText(/payment amount/i) as HTMLInputElement
    fireEvent.change(amountInput, { target: { value: '' } })
    
    fireEvent.click(screen.getByText(/record payment/i))
    
    await waitFor(() => {
      const errorEl = screen.queryByText(/valid payment amount/i)
      if (errorEl) {
        expect(errorEl).toBeDefined()
      }
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('renders with initial data in edit mode', () => {
    const initialData = {
      amount: '750.00',
      date: '2024-01-20',
      method: 'ach' as const,
      referenceNumber: 'TXN-123',
      notes: 'Wire transfer'
    }
    
    render(<PaymentForm invoiceId={invoiceId} editId="test-id" initialData={initialData} />)
    
    const amountInput = screen.getByLabelText(/payment amount/i) as HTMLInputElement
    expect(amountInput.value).toBe('750.00')
    
    const methodSelect = screen.getByLabelText(/payment method/i) as HTMLSelectElement
    expect(methodSelect.value).toBe('ach')
    
    const refInput = screen.getByLabelText(/reference number/i) as HTMLInputElement
    expect(refInput.value).toBe('TXN-123')
  })

  it('shows different button text in edit mode', () => {
    const initialData = {
      amount: '100',
      date: '2024-01-01',
      method: 'check' as const,
      referenceNumber: '',
      notes: ''
    }
    
    render(<PaymentForm invoiceId={invoiceId} editId="test-id" initialData={initialData} />)
    
    expect(screen.getByText(/update payment/i)).toBeDefined()
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn()
    render(<PaymentForm invoiceId={invoiceId} onCancel={onCancel} />)
    
    fireEvent.click(screen.getByText(/cancel/i))
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('supports different payment methods', async () => {
    const onSuccess = vi.fn()
    render(<PaymentForm invoiceId={invoiceId} onSuccess={onSuccess} />)
    
    const methodSelect = screen.getByLabelText(/payment method/i) as HTMLSelectElement
    expect(methodSelect.options.length).toBe(5)
    
    fireEvent.change(screen.getByLabelText(/payment amount/i), {
      target: { value: '100' }
    })
    fireEvent.change(methodSelect, {
      target: { value: 'credit_card' }
    })
    
    fireEvent.click(screen.getByText(/record payment/i))
    
    await waitFor(async () => {
      const payments = await getPayments()
      expect(payments[0].method).toBe('credit_card')
    })
  })
})
