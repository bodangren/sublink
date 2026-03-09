import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { getEstimate, deleteEstimate, convertEstimateToInvoice } from '../db'
import type { Estimate } from '../db'
import { useConfirm } from '../hooks/useConfirm'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'accepted': return '#28a745'
    case 'sent': return '#17a2b8'
    case 'declined': return '#dc3545'
    case 'converted': return '#6f42c1'
    case 'draft': return '#6c757d'
    default: return '#6c757d'
  }
}

const EstimateDetail = ({ estimateId }: { estimateId: string }) => {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadEstimate() {
      const data = await getEstimate(estimateId)
      if (mounted) {
        setEstimate(data || null)
        setLoading(false)
      }
    }
    loadEstimate()
    return () => { mounted = false }
  }, [estimateId])

  const handleDelete = async () => {
    if (!estimate) return
    const confirmed = await confirm({
      title: 'Delete Estimate',
      message: 'Are you sure you want to delete this estimate?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteEstimate(estimateId)
      navigate('/estimates')
    }
  }

  const handleDownloadPDF = async () => {
    if (!estimate) return
    setDownloading(true)
    try {
      const { generateEstimatePDF, downloadPDF } = await import('../utils/estimatePdf')
      const blob = await generateEstimatePDF(estimate)
      downloadPDF(blob, `Estimate_${estimate.estimateNumber}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleConvertToInvoice = async () => {
    if (!estimate) return
    const confirmed = await confirm({
      title: 'Convert to Invoice',
      message: 'This will create a new invoice from this estimate and mark it as converted. Continue?',
      confirmLabel: 'Convert',
      variant: 'info'
    })
    if (confirmed) {
      setConverting(true)
      try {
        const result = await convertEstimateToInvoice(estimateId)
        navigate(`/invoices/${result.invoiceId}`)
      } catch (error) {
        console.error('Failed to convert estimate:', error)
        setConverting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading estimate...</p>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="container">
        <h1>Estimate Not Found</h1>
        <p>The estimate you're looking for doesn't exist.</p>
        <NavLink to="/estimates">
          <button>Back to Estimates</button>
        </NavLink>
      </div>
    )
  }

  const statusColor = getStatusColor(estimate.status)

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{estimate.estimateNumber}</h1>
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
              {estimate.status}
            </span>
            {estimate.projectName && (
              <NavLink to={`/projects/${estimate.projectId}`} style={{ color: 'var(--accent-color)' }}>
                {estimate.projectName}
              </NavLink>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
            {formatCurrency(estimate.total)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Bill To</h3>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{estimate.clientName}</div>
          {estimate.clientEmail && <div style={{ color: 'var(--text-secondary)' }}>{estimate.clientEmail}</div>}
          {estimate.clientAddress && <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{estimate.clientAddress}</div>}
        </div>
        <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Dates</h3>
          <div><strong>Issue Date:</strong> {estimate.issueDate}</div>
          <div><strong>Valid Until:</strong> {estimate.validUntilDate}</div>
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
            {estimate.lineItems.map(item => (
              <tr key={item.id}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>{item.description}</td>
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
            <span>{formatCurrency(estimate.subtotal)}</span>
          </div>
          {estimate.taxRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Tax ({estimate.taxRate}%):</span>
              <span>{formatCurrency(estimate.taxAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span>Total:</span>
            <span style={{ color: 'var(--accent-color)' }}>{formatCurrency(estimate.total)}</span>
          </div>
        </div>
      </div>

      {estimate.notes && (
        <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Notes</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{estimate.notes}</p>
        </div>
      )}

      {estimate.convertedToInvoiceId && (
        <div style={{ backgroundColor: '#6f42c1', color: '#fff', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <strong>Converted to Invoice</strong>
          <NavLink 
            to={`/invoices/${estimate.convertedToInvoiceId}`} 
            style={{ marginLeft: '0.5rem', color: '#fff', textDecoration: 'underline' }}
          >
            View Invoice
          </NavLink>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <NavLink to="/estimates">
          <button>Back to Estimates</button>
        </NavLink>
        <button 
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
        >
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
        {estimate.status === 'draft' && (
          <NavLink to={`/estimates/edit/${estimate.id}`}>
            <button>Edit Estimate</button>
          </NavLink>
        )}
        {estimate.status === 'accepted' && !estimate.convertedToInvoiceId && (
          <button 
            onClick={handleConvertToInvoice}
            disabled={converting}
            style={{ backgroundColor: '#28a745', color: '#fff' }}
          >
            {converting ? 'Converting...' : 'Convert to Invoice'}
          </button>
        )}
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

export default EstimateDetail
