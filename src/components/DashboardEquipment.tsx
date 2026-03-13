import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getEquipmentNeedingMaintenance } from '../db'
import type { Equipment } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

interface DashboardEquipmentProps {
  inline?: boolean
}

const DashboardEquipment = ({ inline = false }: DashboardEquipmentProps) => {
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useAsyncEffect(
    async (isMounted) => {
      const data = await getEquipmentNeedingMaintenance()
      if (isMounted()) setEquipment(data)
    },
    [],
    { onResult: undefined }
  )

  const content = equipment.length === 0 ? (
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
      ✓ All equipment is up to date on maintenance.
    </p>
  ) : (
    <>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {equipment.slice(0, 3).map(item => (
          <li
            key={item.id}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: 'var(--input-bg)',
              borderRadius: '4px',
              borderLeft: '4px solid #dc3545',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{item.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Next maintenance: {new Date(item.nextMaintenanceDate || 'Unknown').toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <NavLink to={`/equipment/${item.id}`}>
                <button style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginTop: 0, width: 'auto' }}>View</button>
              </NavLink>
              <NavLink to={`/equipment/edit/${item.id}`}>
                <button style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginTop: 0, width: 'auto' }}>Edit</button>
              </NavLink>
            </div>
          </li>
        ))}
      </ul>
      <NavLink
        to="/equipment"
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
    <div className="dashboard-section">
      <h3 style={{ margin: 0 }}>Equipment</h3>
      {content}
    </div>
  )
}

export default DashboardEquipment
