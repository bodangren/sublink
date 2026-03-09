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

const RecentPayments = () => {
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

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Payments</h3>
        </div>
        <p className="card-text">Loading...</p>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Payments</h3>
        </div>
        <p className="card-text">No payments recorded yet.</p>
        <NavLink to="/invoices">
          <button className="card-button">View Invoices</button>
        </NavLink>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Payments</h3>
        <NavLink to="/invoices">
          <button className="card-button">View All</button>
        </NavLink>
      </div>
      <ul className="card-list">
        {payments.map(payment => (
          <li key={payment.id} className="card-list-item">
            <NavLink 
              to={`/invoices/${payment.invoiceId}`}
              className="item-link"
            >
              <div className="item-header">
                <span className="item-title">
                  {formatCurrency(payment.amount)}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {new Date(payment.date).toLocaleDateString()}
                </span>
              </div>
              {payment.invoice && (
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{payment.invoice.invoiceNumber}</span>
                  {payment.invoice.projectName && (
                    <span style={{ color: 'var(--text-secondary)' }}> - {payment.invoice.projectName}</span>
                  )}
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RecentPayments
