import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getRecentPayments, getInvoice } from '../db'
import type { Payment, Invoice } from '../db'

interface PaymentWithInvoice extends Payment {
  invoice?: Invoice
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

interface RecentPaymentsProps {
  inline?: boolean
}

const RecentPayments = ({ inline = false }: RecentPaymentsProps) => {
  const [payments, setPayments] = useState<PaymentWithInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadPayments() {
      const paymentList = await getRecentPayments(5)
      const paymentsWithInvoices: PaymentWithInvoice[] = []
      
      for (const payment of paymentList) {
        const invoice = await getInvoice(payment.invoiceId)
        paymentsWithInvoices.push({ ...payment, invoice })
      }
      
      if (mounted) {
        setPayments(paymentsWithInvoices)
        setLoading(false)
      }
    }
    loadPayments()
    return () => { mounted = false }
  }, [])

  if (loading || payments.length === 0) return null

  const content = (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {payments.map(payment => (
        <li
          key={payment.id}
          style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <NavLink
            to={`/invoices/${payment.invoiceId}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--success-color)' }}>
                {formatCurrency(payment.amount)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {payment.invoice?.invoiceNumber} • {new Date(payment.date).toLocaleDateString()}
              </div>
            </div>
          </NavLink>
        </li>
      ))}
    </ul>
  )

  if (inline) {
    return <div>{content}</div>
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Payments</h3>
      </div>
      {content}
    </div>
  )
}

export default RecentPayments
