import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getChangeOrder, deleteChangeOrder, updateChangeOrderStatus } from '../db'
import type { ChangeOrder, ChangeOrderStatus } from '../db'
import { useConfirm } from '../hooks/useConfirm'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: ChangeOrderStatus): string => {
  switch (status) {
    case 'draft': return '#6c757d'
    case 'submitted': return '#0d6efd'
    case 'approved': return '#28a745'
    case 'rejected': return '#dc3545'
    default: return '#6c757d'
  }
}

const ChangeOrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [changeOrder, setChangeOrder] = useState<ChangeOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const reloadChangeOrder = () => setReloadKey(k => k + 1)

  useAsyncEffect(
    async () => {
      if (!id) return null
      const co = await getChangeOrder(id)
      return co
    },
    [id, reloadKey],
    {
      onResult: (co) => {
        if (co) {
          setChangeOrder(co)
        } else {
          setError('Change order not found')
        }
        setLoading(false)
      },
      onError: () => {
        setError('Failed to load change order')
        setLoading(false)
      }
    }
  )

  const handleStatusChange = async (newStatus: ChangeOrderStatus) => {
    if (!changeOrder) return
    
    const confirmed = await confirm({
      title: 'Update Status',
      message: `Change status to ${newStatus}?`,
      confirmLabel: 'Update',
      variant: 'info'
    })
    
    if (confirmed) {
      await updateChangeOrderStatus(changeOrder.id, newStatus)
      reloadChangeOrder()
    }
  }

  const handleDelete = async () => {
    if (!changeOrder) return
    
    const confirmed = await confirm({
      title: 'Delete Change Order',
      message: 'Are you sure you want to delete this change order? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    
    if (confirmed) {
      await deleteChangeOrder(changeOrder.id)
      navigate('/change-orders')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    )
  }

  if (error || !changeOrder) {
    return (
      <div className="container">
        <h1>Change Order</h1>
        <p style={{ color: '#dc3545' }}>{error || 'Change order not found'}</p>
        <button
          onClick={() => navigate('/change-orders')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--secondary-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Change Orders
        </button>
      </div>
    )
  }

  const availableTransitions: { status: ChangeOrderStatus; label: string }[] = []
  if (changeOrder.status === 'draft') {
    availableTransitions.push({ status: 'submitted', label: 'Submit for Approval' })
  }
  if (changeOrder.status === 'submitted') {
    availableTransitions.push({ status: 'approved', label: 'Mark as Approved' })
    availableTransitions.push({ status: 'rejected', label: 'Mark as Rejected' })
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <button
            onClick={() => navigate('/change-orders')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-color)',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            &larr; Back to Change Orders
          </button>
          <h1 style={{ margin: 0 }}>{changeOrder.changeOrderNumber}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/change-orders/' + changeOrder.id + '/edit')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--secondary-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div style={{ 
        padding: '1rem', 
        backgroundColor: 'var(--secondary-bg)', 
        borderRadius: '4px',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            backgroundColor: getStatusColor(changeOrder.status),
            color: '#fff',
          }}>
            {changeOrder.status}
          </span>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: changeOrder.costAdjustment >= 0 ? '#28a745' : '#dc3545',
          }}>
            {changeOrder.costAdjustment >= 0 ? '+' : ''}{formatCurrency(changeOrder.costAdjustment)}
          </span>
        </div>
        
        {availableTransitions.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {availableTransitions.map(({ status, label }) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: status === 'rejected' ? '#dc3545' : 'var(--accent-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Project
        </h3>
        {changeOrder.projectId ? (
          <button
            onClick={() => navigate('/projects/' + changeOrder.projectId)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-color)',
              cursor: 'pointer',
              padding: 0,
              fontSize: '1rem',
              textDecoration: 'underline',
            }}
          >
            {changeOrder.projectName}
          </button>
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>No project linked</span>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Description of Change
        </h3>
        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{changeOrder.description}</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Reason / Justification
        </h3>
        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{changeOrder.reason}</p>
      </div>

      {changeOrder.contractReference && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Contract Reference
          </h3>
          <p style={{ margin: 0 }}>{changeOrder.contractReference}</p>
        </div>
      )}

      {changeOrder.notes && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Notes
          </h3>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{changeOrder.notes}</p>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Timeline
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
            <span>{formatTimestamp(changeOrder.createdAt)}</span>
          </div>
          {changeOrder.submittedDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Submitted:</span>
              <span>{formatDate(changeOrder.submittedDate)}</span>
            </div>
          )}
          {changeOrder.approvedDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Approved:</span>
              <span>{formatDate(changeOrder.approvedDate)}</span>
            </div>
          )}
          {changeOrder.rejectedDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rejected:</span>
              <span>{formatDate(changeOrder.rejectedDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChangeOrderDetail
