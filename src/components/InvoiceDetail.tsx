import { useState, useEffect } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { getInvoice, markInvoicePaid, deleteInvoice } from '../db'
import type { Invoice } from '../db'
import { useConfirm } from '../hooks/useConfirm'

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
    case 'draft': return '#6c757d'
    default: return '#6c757d'
  }
}

const getInvoiceStatus = (invoice: Invoice): string => {
  if (invoice.status === 'paid') return 'paid'
  if (invoice.status === 'draft') return 'draft'
  const today = new Date().toISOString().split('T')[0]
  if (invoice.dueDate < today) return 'overdue'
  return 'pending'
}

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let mounted = true
    if (id) {
      getInvoice(id).then(data => {
        if (mounted) {
          setInvoice(data || null)
          setLoading(false)
        }
      })
    }
    return () => { mounted = false }
  }, [id])

  const handleMarkPaid = async () => {
    if (!invoice || !id) return
    const confirmed = await confirm({
      title: 'Mark as Paid',
      message: 'Mark this invoice as paid?',
      confirmLabel: 'Mark Paid',
      variant: 'info'
    })
    if (confirmed) {
      await markInvoicePaid(id)
      const updated = await getInvoice(id)
      setInvoice(updated || null)
    }
  }

  const handleDelete = async () => {
    if (!invoice || !id) return
    const confirmed = await confirm({
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteInvoice(id)
      navigate('/invoices')
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return
    setDownloading(true)
    try {
      const { generateInvoicePDF, downloadPDF } = await import('../utils/invoicePdf')
      const blob = await generateInvoicePDF(invoice)
      downloadPDF(blob, `Invoice_${invoice.invoiceNumber}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container">
        <h1>Invoice Not Found</h1>
        <p>The invoice you're looking for doesn't exist.</p>
        <NavLink to="/invoices">
          <button>Back to Invoices</button>
        </NavLink>
      </div>
    )
  }

  const status = getInvoiceStatus(invoice)
  const statusColor = getStatusColor(status)

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{invoice.invoiceNumber}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            {invoice.projectName && (
              <NavLink to={`/projects/${invoice.projectId}`} style={{ color: 'var(--accent-color)' }}>
                {invoice.projectName}
              </NavLink>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
            {formatCurrency(invoice.total)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Bill To</h3>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{invoice.clientName}</div>
          {invoice.clientEmail && <div style={{ color: 'var(--text-secondary)' }}>{invoice.clientEmail}</div>}
          {invoice.clientAddress && <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{invoice.clientAddress}</div>}
        </div>
        <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Dates</h3>
          <div><strong>Issue Date:</strong> {invoice.issueDate}</div>
          <div><strong>Due Date:</strong> {invoice.dueDate}</div>
          {invoice.paidAt && (
            <div style={{ color: '#28a745' }}>
              <strong>Paid:</strong> {new Date(invoice.paidAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Line Items</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-bg)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Description</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)', width: '80px' }}>Qty</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)', width: '100px' }}>Rate</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)', width: '100px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map(item => (
              <tr key={item.id}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  {item.description}
                  {item.type === 'time' && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(Time Entry)</span>}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>{item.quantity}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>{formatCurrency(item.rate)}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--secondary-bg)', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Tax ({invoice.taxRate}%):</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span>Total:</span>
            <span style={{ color: 'var(--accent-color)' }}>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Notes</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <NavLink to="/invoices">
          <button>Back to Invoices</button>
        </NavLink>
        <button 
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
        >
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
        {status !== 'paid' && (
          <button 
            onClick={handleMarkPaid}
            style={{ backgroundColor: '#28a745', color: '#fff' }}
          >
            Mark as Paid
          </button>
        )}
        <NavLink to={`/invoices/edit/${invoice.id}`}>
          <button>Edit</button>
        </NavLink>
        <button 
          onClick={handleDelete}
          style={{ backgroundColor: '#dc3545', color: '#fff' }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default InvoiceDetail
