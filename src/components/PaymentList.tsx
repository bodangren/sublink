import { useState, useEffect } from 'react'
import { getPaymentsByInvoice, deletePayment } from '../db'
import type { Payment, PaymentMethod } from '../db'
import { useConfirm } from '../hooks/useConfirm'

interface PaymentListProps {
  invoiceId: string
  onEdit?: (payment: Payment) => void
  onRefresh?: () => void
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  check: 'Check',
  cash: 'Cash',
  ach: 'ACH/Bank Transfer',
  credit_card: 'Credit Card',
  other: 'Other'
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const PaymentList = ({ invoiceId, onEdit, onRefresh }: PaymentListProps) => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    const loadPayments = async () => {
      setLoading(true)
      const data = await getPaymentsByInvoice(invoiceId)
      if (mounted) {
        setPayments(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        setLoading(false)
      }
    }
    loadPayments()
    return () => { mounted = false }
  }, [invoiceId])

  const handleDelete = async (payment: Payment) => {
    const confirmed = await confirm({
      title: 'Delete Payment',
      message: `Are you sure you want to delete this ${formatCurrency(payment.amount)} payment?`,
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deletePayment(payment.id)
      const data = await getPaymentsByInvoice(invoiceId)
      setPayments(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      if (onRefresh) onRefresh()
    }
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading payments...</p>
  }

  if (payments.length === 0) {
    return (
      <div style={{ 
        backgroundColor: 'var(--secondary-bg)', 
        padding: '1rem', 
        borderRadius: '4px',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        No payments recorded yet.
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Total Paid: </strong>
        <span style={{ color: '#28a745', fontWeight: 'bold' }}>{formatCurrency(totalPaid)}</span>
        <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
          ({payments.length} payment{payments.length !== 1 ? 's' : ''})
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {payments.map(payment => (
          <div 
            key={payment.id}
            style={{ 
              backgroundColor: 'var(--secondary-bg)', 
              padding: '1rem', 
              borderRadius: '4px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#28a745' }}>
                  {formatCurrency(payment.amount)}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {new Date(payment.date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  backgroundColor: 'var(--primary-bg)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  {METHOD_LABELS[payment.method]}
                </span>
              </div>
            </div>
            
            {payment.referenceNumber && (
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                Ref: {payment.referenceNumber}
              </div>
            )}
            
            {payment.notes && (
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                {payment.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              {onEdit && (
                <button 
                  onClick={() => onEdit(payment)}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  Edit
                </button>
              )}
              <button 
                onClick={() => handleDelete(payment)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: '#fff' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PaymentList
