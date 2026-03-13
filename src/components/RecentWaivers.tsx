import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getWaivers } from '../db'
import type { Waiver } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

interface RecentWaiversProps {
  inline?: boolean
}

const RecentWaivers = ({ inline = false }: RecentWaiversProps) => {
  const [waivers, setWaivers] = useState<Waiver[]>([])

  useAsyncEffect(
    async (isMounted) => {
      const allWaivers = await getWaivers()
      const sorted = allWaivers.sort((a, b) => b.createdAt - a.createdAt)
      const recent = sorted.slice(0, 3)
      if (isMounted()) {
        setWaivers(recent)
      }
    },
    []
  )

  const content = waivers.length === 0 ? (
    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
      No waivers yet. <NavLink to="/waivers/new" style={{ color: 'var(--accent-color)' }}>Create one</NavLink>
    </p>
  ) : (
    <>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {waivers.map(waiver => (
          <li
            key={waiver.id}
            style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{waiver.projectName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              ${waiver.amount} • {new Date(waiver.createdAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
      <NavLink
        to="/waivers"
        style={{
          display: 'block',
          textAlign: 'center',
          color: 'var(--accent-color)',
          textDecoration: 'none',
          fontSize: '0.875rem',
          paddingTop: '0.75rem',
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
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Waivers</h3>
      </div>
      {content}
    </div>
  )
}

export default RecentWaivers
