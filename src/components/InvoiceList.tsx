import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getInvoices, deleteInvoice } from '../db'
import type { Invoice } from '../db'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getInvoiceStatus = (invoice: Invoice): 'draft' | 'pending' | 'paid' | 'overdue' => {
  if (invoice.status === 'paid') return 'paid'
  if (invoice.status === 'draft') return 'draft'
  const today = new Date().toISOString().split('T')[0]
  if (invoice.dueDate < today) return 'overdue'
  return 'pending'
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return '#28a745'
    case 'pending': return '#ffc107'
    case 'overdue': return '#dc3545'
    case 'draft': return '#6c757d'
    default: return '#6c757d'
  }
}

const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending' | 'paid' | 'overdue'>('all')

  useEffect(() => {
    let mounted = true
    getInvoices().then(data => {
      if (mounted) setInvoices(data.sort((a, b) => b.createdAt - a.createdAt))
    })
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id)
      const data = await getInvoices()
      setInvoices(data.sort((a, b) => b.createdAt - a.createdAt))
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true
    return getInvoiceStatus(invoice) === filter
  })

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter(i => getInvoiceStatus(i) === 'draft').length,
    pending: invoices.filter(i => getInvoiceStatus(i) === 'pending').length,
    paid: invoices.filter(i => getInvoiceStatus(i) === 'paid').length,
    overdue: invoices.filter(i => getInvoiceStatus(i) === 'overdue').length,
  }

  return (
    <div className="container">
      <h1>Invoices</h1>
      <NavLink to="/invoices/new">
        <button>New Invoice</button>
      </NavLink>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(['all', 'draft', 'pending', 'overdue', 'paid'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filter === status ? 'var(--accent-color)' : 'var(--secondary-bg)',
              color: filter === status ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textTransform: 'capitalize',
            }}
          >
            {status} ({statusCounts[status]})
          </button>
        ))}
      </div>
      
      <div style={{ marginTop: '1.5rem' }}>
        {filteredInvoices.length === 0 ? (
          <p>No invoices {filter !== 'all' ? `with status "${filter}"` : ''}. Create your first invoice to start tracking payments.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredInvoices.map(invoice => {
              const status = getInvoiceStatus(invoice)
              const statusColor = getStatusColor(status)
              
              return (
                <li key={invoice.id} style={{ 
                  backgroundColor: 'var(--secondary-bg)', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  borderLeft: `4px solid ${statusColor}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{invoice.invoiceNumber}</strong>
                        <span style={{ 
                          backgroundColor: statusColor, 
                          color: '#fff', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {status}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>{invoice.clientName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                        {formatCurrency(invoice.total)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {invoice.projectName && <span>Project: {invoice.projectName} • </span>}
                    Issued: {formatDate(invoice.issueDate)} • Due: {formatDate(invoice.dueDate)}
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <NavLink to={`/invoices/${invoice.id}`}>
                      <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View</button>
                    </NavLink>
                    <NavLink to={`/invoices/edit/${invoice.id}`}>
                      <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Edit</button>
                    </NavLink>
                    <button 
                      onClick={() => handleDelete(invoice.id)}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff' }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default InvoiceList
