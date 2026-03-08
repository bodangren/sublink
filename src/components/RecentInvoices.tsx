import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getInvoices } from '../db'
import type { Invoice } from '../db'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const RecentInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    let mounted = true
    getInvoices().then(data => {
      if (mounted) {
        const sorted = data.sort((a, b) => b.createdAt - a.createdAt)
        setInvoices(sorted.slice(0, 5))
      }
    })
    return () => { mounted = false }
  }, [])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return '#28a745'
      case 'pending': return '#ffc107'
      case 'overdue': return '#dc3545'
      default: return '#6c757d'
    }
  }

  if (invoices.length === 0) return null

  return (
    <div className="recent-section">
      <h3>Recent Invoices</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {invoices.map(invoice => (
          <li key={invoice.id} style={{ 
            marginBottom: '0.5rem', 
            padding: '0.75rem', 
            backgroundColor: 'var(--secondary-bg)', 
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{invoice.invoiceNumber}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{invoice.clientName}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                backgroundColor: getStatusColor(invoice.status),
                color: '#fff',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {invoice.status}
              </span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <NavLink to="/invoices">
        <button style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>View All Invoices</button>
      </NavLink>
    </div>
  )
}

export default RecentInvoices
