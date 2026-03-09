import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getInvoices, deleteInvoice, getTotalPaidByInvoice } from '../db'
import type { Invoice } from '../db'
import { useConfirm } from '../hooks/useConfirm'

interface InvoiceWithPaid extends Invoice {
  totalPaid: number
}

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

const getInvoiceStatusWithPayments = (invoice: Invoice, totalPaid: number): 'draft' | 'pending' | 'partial' | 'paid' | 'overdue' => {
  if (invoice.status === 'draft') return 'draft'
  if (totalPaid >= invoice.total) return 'paid'
  if (totalPaid > 0) return 'partial'
  const today = new Date().toISOString().split('T')[0]
  if (invoice.dueDate < today) return 'overdue'
  return 'pending'
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return '#28a745'
    case 'partial': return '#17a2b8'
    case 'pending': return '#ffc107'
    case 'overdue': return '#dc3545'
    case 'draft': return '#6c757d'
    default: return '#6c757d'
  }
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'partial': return 'Partial'
    default: return status
  }
}

const InvoiceList = () => {
  const [invoices, setInvoices] = useState<InvoiceWithPaid[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending' | 'partial' | 'paid' | 'overdue'>('all')
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    async function loadInvoices() {
      const data = await getInvoices()
      const invoicesWithPaid: InvoiceWithPaid[] = await Promise.all(
        data.map(async (invoice) => {
          const totalPaid = await getTotalPaidByInvoice(invoice.id)
          return { ...invoice, totalPaid }
        })
      )
      if (mounted) {
        setInvoices(invoicesWithPaid.sort((a, b) => b.createdAt - a.createdAt))
      }
    }
    loadInvoices()
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteInvoice(id)
      const data = await getInvoices()
      const invoicesWithPaid: InvoiceWithPaid[] = await Promise.all(
        data.map(async (invoice) => {
          const totalPaid = await getTotalPaidByInvoice(invoice.id)
          return { ...invoice, totalPaid }
        })
      )
      setInvoices(invoicesWithPaid.sort((a, b) => b.createdAt - a.createdAt))
    }
  }

  const getInvoiceStatus = (invoice: InvoiceWithPaid) => getInvoiceStatusWithPayments(invoice, invoice.totalPaid)

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true
    return getInvoiceStatus(invoice) === filter
  })

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter(i => getInvoiceStatus(i) === 'draft').length,
    pending: invoices.filter(i => getInvoiceStatus(i) === 'pending').length,
    partial: invoices.filter(i => getInvoiceStatus(i) === 'partial').length,
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
        {(['all', 'draft', 'pending', 'partial', 'overdue', 'paid'] as const).map(status => (
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
            {getStatusLabel(status)} ({statusCounts[status]})
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
              const balance = invoice.total - invoice.totalPaid
              
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
                          {getStatusLabel(status)}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>{invoice.clientName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                        {formatCurrency(invoice.total)}
                      </div>
                      {invoice.totalPaid > 0 && invoice.totalPaid < invoice.total && (
                        <div style={{ fontSize: '0.75rem', color: '#28a745' }}>
                          {formatCurrency(invoice.totalPaid)} paid, {formatCurrency(balance)} due
                        </div>
                      )}
                      {invoice.totalPaid >= invoice.total && (
                        <div style={{ fontSize: '0.75rem', color: '#28a745' }}>
                          Fully paid
                        </div>
                      )}
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
