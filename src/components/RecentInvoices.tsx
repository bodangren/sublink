import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getInvoices } from '../db'
import type { Invoice } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return '#28a745'
    case 'pending': return '#ffc107'
    case 'overdue': return '#dc3545'
    default: return '#6c757d'
  }
}

interface RecentInvoicesProps {
  inline?: boolean
}

const RecentInvoices = ({ inline = false }: RecentInvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useAsyncEffect(
    async (isMounted) => {
      const data = await getInvoices()
      if (isMounted()) {
        const sorted = data.sort((a, b) => b.createdAt - a.createdAt)
        setInvoices(sorted.slice(0, 5))
      }
    },
    []
  )

  if (invoices.length === 0) return null

  const content = (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {invoices.map(invoice => (
        <li
          key={invoice.id}
          style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <NavLink
            to={`/invoices/${invoice.id}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{invoice.invoiceNumber}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {invoice.clientName}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                backgroundColor: getStatusColor(invoice.status),
                color: '#fff',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {invoice.status}
              </span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                {formatCurrency(invoice.total)}
              </span>
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
    <div className="recent-section">
      <h3>Recent Invoices</h3>
      {content}
      <NavLink to="/invoices">
        <button style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>View All Invoices</button>
      </NavLink>
    </div>
  )
}

export default RecentInvoices
