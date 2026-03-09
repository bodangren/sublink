import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getEstimates, deleteEstimate } from '../db'
import type { Estimate } from '../db'
import { useConfirm } from '../hooks/useConfirm'

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

const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const EstimateList = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'declined' | 'converted'>('all')
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    async function loadEstimates() {
      const data = await getEstimates()
      if (mounted) {
        setEstimates(data.sort((a, b) => b.createdAt - a.createdAt))
      }
    }
    loadEstimates()
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Estimate',
      message: 'Are you sure you want to delete this estimate?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteEstimate(id)
      const data = await getEstimates()
      setEstimates(data.sort((a, b) => b.createdAt - a.createdAt))
    }
  }

  const filteredEstimates = estimates.filter(estimate => {
    if (filter === 'all') return true
    return estimate.status === filter
  })

  const statusCounts = {
    all: estimates.length,
    draft: estimates.filter(e => e.status === 'draft').length,
    sent: estimates.filter(e => e.status === 'sent').length,
    accepted: estimates.filter(e => e.status === 'accepted').length,
    declined: estimates.filter(e => e.status === 'declined').length,
    converted: estimates.filter(e => e.status === 'converted').length,
  }

  return (
    <div className="container">
      <h1>Estimates</h1>
      <NavLink to="/estimates/new">
        <button>New Estimate</button>
      </NavLink>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(['all', 'draft', 'sent', 'accepted', 'declined', 'converted'] as const).map(status => (
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
        {filteredEstimates.length === 0 ? (
          <p>No estimates {filter !== 'all' ? `with status "${filter}"` : ''}. Create your first estimate to start quoting work.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredEstimates.map(estimate => {
              const statusColor = getStatusColor(estimate.status)
              
              return (
                <li key={estimate.id} style={{ 
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
                        <strong style={{ fontSize: '1.1rem' }}>{estimate.estimateNumber}</strong>
                        <span style={{ 
                          backgroundColor: statusColor, 
                          color: '#fff', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {getStatusLabel(estimate.status)}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>{estimate.clientName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                        {formatCurrency(estimate.total)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {estimate.projectName && <span>Project: {estimate.projectName} • </span>}
                    Issued: {formatDate(estimate.issueDate)} • Valid Until: {formatDate(estimate.validUntilDate)}
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <NavLink to={`/estimates/${estimate.id}`}>
                      <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View</button>
                    </NavLink>
                    {estimate.status === 'draft' && (
                      <NavLink to={`/estimates/edit/${estimate.id}`}>
                        <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Edit</button>
                      </NavLink>
                    )}
                    <button 
                      onClick={() => handleDelete(estimate.id)}
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

export default EstimateList
