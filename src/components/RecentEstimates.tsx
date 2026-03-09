import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getRecentEstimates } from '../db'
import type { Estimate } from '../db'

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
    default: return '#6c757d'
  }
}

const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const RecentEstimates = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([])

  useEffect(() => {
    let mounted = true
    getRecentEstimates(5).then(data => {
      if (mounted) {
        setEstimates(data)
      }
    })
    return () => { mounted = false }
  }, [])

  if (estimates.length === 0) return null

  return (
    <div className="recent-section">
      <h3>Recent Estimates</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {estimates.map(estimate => (
          <li key={estimate.id} style={{ 
            marginBottom: '0.5rem', 
            padding: '0.75rem', 
            backgroundColor: 'var(--secondary-bg)', 
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{estimate.estimateNumber}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{estimate.clientName}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                backgroundColor: getStatusColor(estimate.status),
                color: '#fff',
                padding: '0.125rem 1.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {getStatusLabel(estimate.status)}
              </span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                {formatCurrency(estimate.total)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <NavLink to="/estimates">
        <button style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>View All Estimates</button>
      </NavLink>
    </div>
  )
}

export default RecentEstimates
