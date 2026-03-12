import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllChangeOrders, deleteChangeOrder } from '../db'
import type { ChangeOrder, ChangeOrderStatus } from '../db'
import { useConfirm } from '../hooks/useConfirm'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString()
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

const ChangeOrderList = () => {
  const navigate = useNavigate()
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ChangeOrderStatus | 'all'>('all')
  const confirm = useConfirm()

  useEffect(() => {
    loadChangeOrders()
  }, [])

  const loadChangeOrders = async () => {
    setLoading(true)
    const cos = await getAllChangeOrders()
    setChangeOrders(cos.sort((a, b) => b.createdAt - a.createdAt))
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Change Order',
      message: 'Are you sure you want to delete this change order?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteChangeOrder(id)
      setChangeOrders(cos => cos.filter(co => co.id !== id))
    }
  }

  const filteredChangeOrders = statusFilter === 'all'
    ? changeOrders
    : changeOrders.filter(co => co.status === statusFilter)

  const totalApproved = changeOrders
    .filter(co => co.status === 'approved')
    .reduce((sum, co) => sum + co.costAdjustment, 0)

  const pendingCount = changeOrders.filter(co => co.status === 'submitted').length

  if (loading) {
    return (
      <div className="container">
        <h1>Change Orders</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Change Orders</h1>
        <button
          onClick={() => navigate('/change-orders/new')}
          style={{
            backgroundColor: 'var(--accent-color)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          + New Change Order
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--secondary-bg)', 
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Change Orders</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{changeOrders.length}</div>
        </div>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--secondary-bg)', 
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pending Approval</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0d6efd' }}>{pendingCount}</div>
        </div>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--secondary-bg)', 
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Approved Value</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalApproved >= 0 ? '#28a745' : '#dc3545' }}>
            {formatCurrency(totalApproved)}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="statusFilter" style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ChangeOrderStatus | 'all')}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredChangeOrders.length === 0 ? (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          backgroundColor: 'var(--secondary-bg)', 
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
        }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            {statusFilter === 'all' 
              ? 'No change orders yet. Create your first change order to track scope changes.'
              : `No ${statusFilter} change orders.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredChangeOrders.map(co => (
            <div 
              key={co.id}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--secondary-bg)',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/change-orders/' + co.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    marginRight: '0.75rem',
                  }}>
                    {co.changeOrderNumber}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: getStatusColor(co.status),
                    color: '#fff',
                  }}>
                    {co.status}
                  </span>
                </div>
                <span style={{ 
                  fontWeight: 'bold',
                  color: co.costAdjustment >= 0 ? '#28a745' : '#dc3545',
                  fontSize: '1.1rem',
                }}>
                  {co.costAdjustment >= 0 ? '+' : ''}{formatCurrency(co.costAdjustment)}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {co.projectName || 'No Project'}
              </div>
              <div style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {co.description.length > 100 ? co.description.substring(0, 100) + '...' : co.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Created {formatDate(co.createdAt)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(co.id); }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
)}
      )}
    </div>
  )
}

export default ChangeOrderList
