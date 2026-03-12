import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getCOIs } from '../db'
import type { Certificate } from '../db'
import { getCOIStatus, getStatusColor, getStatusLabel } from '../utils/coiStatus'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const ExpiringCOIs = () => {
  const [expiringCOIs, setExpiringCOIs] = useState<Certificate[]>([])

  useAsyncEffect(
    async (isMounted) => {
      const allCOIs = await getCOIs()
      const filtered = allCOIs.filter(coi => {
        const status = getCOIStatus(coi.expirationDate)
        return status === 'expiring' || status === 'expired'
      })
      if (isMounted()) {
        setExpiringCOIs(filtered)
      }
    },
    []
  )

  if (expiringCOIs.length === 0) {
    return (
      <div className="dashboard-card success-card">
        <div className="card-header">
          <span className="card-icon">✓</span>
          <h3>All Certificates Up to Date</h3>
        </div>
        <p className="card-text">No certificates expiring within 30 days</p>
      </div>
    )
  }

  return (
    <div className="dashboard-card warning-card">
      <div className="card-header">
        <span className="card-icon">⚠</span>
        <h3>Certificates Requiring Attention ({expiringCOIs.length})</h3>
      </div>
      <ul className="card-list">
        {expiringCOIs.map(coi => {
          const status = getCOIStatus(coi.expirationDate)
          const statusColor = getStatusColor(status)
          const statusLabel = getStatusLabel(status)
          
          return (
            <li key={coi.id} className="card-list-item">
              <div className="item-header">
                <span className="item-title">{coi.insuranceCompany}</span>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: statusColor }}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="item-details">
                Expires: {new Date(coi.expirationDate).toLocaleDateString()}
              </div>
            </li>
          )
        })}
      </ul>
      <NavLink to="/compliance" className="card-link">
        <button className="card-button">View All Certificates</button>
      </NavLink>
    </div>
  )
}

export default ExpiringCOIs
