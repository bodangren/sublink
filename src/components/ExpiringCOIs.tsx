import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getCOIs } from '../db'
import type { Certificate } from '../db'
import { getCOIStatus, getStatusColor, getStatusLabel } from '../utils/coiStatus'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

interface ExpiringCOIsProps {
  inline?: boolean
}

const ExpiringCOIs = ({ inline = false }: ExpiringCOIsProps) => {
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

  const content = expiringCOIs.length === 0 ? (
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
      ✓ All certificates are up to date.
    </p>
  ) : (
    <>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {expiringCOIs.slice(0, 3).map(coi => {
          const status = getCOIStatus(coi.expirationDate)
          const statusColor = getStatusColor(status)
          const statusLabel = getStatusLabel(status)
          
          return (
            <li
              key={coi.id}
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                backgroundColor: 'var(--input-bg)',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{coi.insuranceCompany}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Expires: {new Date(coi.expirationDate).toLocaleDateString()}
                </div>
              </div>
              <span
                className="status-badge"
                style={{ backgroundColor: statusColor }}
              >
                {statusLabel}
              </span>
            </li>
          )
        })}
      </ul>
      <NavLink
        to="/compliance"
        style={{
          display: 'block',
          textAlign: 'center',
          color: 'var(--accent-color)',
          textDecoration: 'none',
          fontSize: '0.875rem',
          paddingTop: '0.5rem',
        }}
      >
        View All →
      </NavLink>
    </>
  )

  if (inline) {
    return <div>{content}</div>
  }

  return (
    <div className="dashboard-card warning-card">
      <div className="card-header">
        <span className="card-icon">⚠</span>
        <h3>Certificates Requiring Attention ({expiringCOIs.length})</h3>
      </div>
      {content}
    </div>
  )
}

export default ExpiringCOIs
