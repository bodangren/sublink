import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getRecentMileage } from '../db'
import type { MileageEntry } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

interface RecentMileageProps {
  inline?: boolean
}

const RecentMileage = ({ inline = false }: RecentMileageProps) => {
  const [mileage, setMileage] = useState<MileageEntry[]>([])
  const [totalMiles, setTotalMiles] = useState(0)

  useAsyncEffect(
    async (isMounted) => {
      const recentMileage = await getRecentMileage(5)
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const thisMonthMileage = recentMileage.filter(m => new Date(m.date) >= startOfMonth)
      const monthTotal = thisMonthMileage.reduce((sum, m) => sum + m.miles, 0)
      
      if (isMounted()) {
        setMileage(recentMileage)
        setTotalMiles(monthTotal)
      }
    },
    []
  )

  const content = mileage.length === 0 ? (
    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
      No mileage entries yet. <NavLink to="/mileage/new" style={{ color: 'var(--accent-color)' }}>Log mileage</NavLink>
    </p>
  ) : (
    <>
      <div style={{
        marginBottom: '0.75rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: 'var(--input-bg)',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>This Month</span>
        <strong style={{ color: 'var(--accent-color)' }}>{totalMiles.toFixed(1)} mi</strong>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {mileage.map(entry => (
          <li
            key={entry.id}
            style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <NavLink
              to={`/mileage/${entry.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                {entry.startLocation} → {entry.endLocation}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {new Date(entry.date).toLocaleDateString()} • {entry.miles.toFixed(1)} mi
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
      <NavLink
        to="/mileage"
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
    <div style={{ padding: '1rem', backgroundColor: 'var(--secondary-bg)', borderRadius: '8px', border: '2px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, padding: 0 }}>Recent Mileage</h3>
        <NavLink to="/mileage/new">
          <button style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', marginTop: 0, width: 'auto' }}>+ Log</button>
        </NavLink>
      </div>
      {content}
    </div>
  )
}

export default RecentMileage
