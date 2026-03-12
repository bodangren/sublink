import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getRecentMileage } from '../db'
import type { MileageEntry } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const RecentMileage = () => {
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

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>Recent Mileage</h3>
        <NavLink to="/mileage/new">
          <button style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}>+ Log</button>
        </NavLink>
      </div>
      
      <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#e3f2fd', borderRadius: '3px' }}>
        <strong>This Month: {totalMiles.toFixed(1)} mi</strong>
      </div>
      
      {mileage.length === 0 ? (
        <p style={{ color: '#666', margin: 0 }}>No mileage entries yet</p>
      ) : (
        <div>
          {mileage.map(entry => (
            <NavLink 
              key={entry.id} 
              to={`/mileage/${entry.id}`}
              style={{ 
                display: 'block', 
                padding: '0.5rem 0', 
                borderBottom: '1px solid #eee',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>
                {entry.startLocation} → {entry.endLocation}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                {new Date(entry.date).toLocaleDateString()} • {entry.miles.toFixed(1)} mi
              </div>
            </NavLink>
          ))}
          <NavLink 
            to="/mileage" 
            style={{ 
              display: 'block', 
              padding: '0.5rem 0', 
              textAlign: 'center',
              color: '#1976d2',
              textDecoration: 'none'
            }}
          >
            View All →
          </NavLink>
        </div>
      )}
    </div>
  )
}

export default RecentMileage
