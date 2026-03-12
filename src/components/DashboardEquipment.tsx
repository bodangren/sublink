import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getEquipmentNeedingMaintenance } from '../db'
import type { Equipment } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const DashboardEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useAsyncEffect(
    async (isMounted) => {
      const data = await getEquipmentNeedingMaintenance()
      if (isMounted()) setEquipment(data)
    },
    [],
    { onResult: undefined }
  )

  if (equipment.length === 0) {
    return (
      <div className="dashboard-section">
        <h3 style={{ margin: 0 }}>Equipment</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          All equipment is up to date on maintenance.
        </p>
      </div>
    )
  }

  return (
    <div className="dashboard-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>Equipment</h3>
        <NavLink to="/equipment" style={{ fontSize: '0.875rem' }}>
          View All
        </NavLink>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {equipment.slice(0, 3).map(item => (
          <li
            key={item.id}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: 'var(--secondary-bg)',
              borderRadius: '4px',
              borderLeft: `4px solid #dc3545`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{item.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Next maintenance: {new Date(item.nextMaintenanceDate || 'Unknown').toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <NavLink to={`/equipment/${item.id}`}>
                <button style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>View</button>
              </NavLink>
              <NavLink to={`/equipment/edit/${item.id}`}>
                <button style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Edit</button>
              </NavLink>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DashboardEquipment
