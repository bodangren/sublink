import { useState, useEffect } from 'react'
import { savePayment, updatePayment, getPayment } from '../db'
import type { PaymentMethod } from '../db'

interface PaymentData {
  amount: string
  date: string
  method: PaymentMethod
  referenceNumber: string
  notes: string
}

interface PaymentFormProps {
  invoiceId: string
  editId?: string
  initialData?: PaymentData
  onSuccess?: () => void
  onCancel?: () => void
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'ach', label: 'ACH/Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' }
]

const PaymentForm = ({ invoiceId, editId, initialData, onSuccess, onCancel }: PaymentFormProps) => {
  const [formData, setFormData] = useState<PaymentData>(initialData || {
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'check',
    referenceNumber: '',
    notes: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editId && !initialData) {
      getPayment(editId).then(payment => {
        if (payment) {
          setFormData({
            amount: payment.amount.toString(),
            date: payment.date,
            method: payment.method,
            referenceNumber: payment.referenceNumber || '',
            notes: payment.notes || ''
          })
        }
      })
    }
  }, [editId, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount')
      setIsSubmitting(false)
      return
    }

    try {
      const paymentData = {
        invoiceId,
        amount,
        date: formData.date,
        method: formData.method,
        ...(formData.referenceNumber && { referenceNumber: formData.referenceNumber }),
        ...(formData.notes && { notes: formData.notes })
      }

      if (editId) {
        await updatePayment(editId, paymentData)
      } else {
        await savePayment(paymentData)
      }
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError('Failed to save payment. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <label htmlFor="amount">Payment Amount ($)</label>
      <input
        id="amount"
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        placeholder="0.00"
        step="0.01"
        min="0.01"
        required
      />

      <label htmlFor="date">Payment Date</label>
      <input
        id="date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <label htmlFor="method">Payment Method</label>
      <select
        id="method"
        name="method"
        value={formData.method}
        onChange={handleChange}
        required
      >
        {PAYMENT_METHODS.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      <label htmlFor="referenceNumber">Reference Number (Optional)</label>
      <input
        id="referenceNumber"
        type="text"
        name="referenceNumber"
        value={formData.referenceNumber}
        onChange={handleChange}
        placeholder="e.g. Check #1234, Transaction ID"
      />

      <label htmlFor="notes">Notes (Optional)</label>
      <textarea
        id="notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Additional details..."
        rows={2}
      />

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (editId ? 'Update Payment' : 'Record Payment')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ backgroundColor: '#444', color: '#fff' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default PaymentForm
