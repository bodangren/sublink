import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getWaivers } from '../db'
import type { Waiver } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const RecentWaivers = () => {
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

  if (waivers.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Waivers</h3>
        </div>
        <p className="card-text">No waivers generated yet.</p>
        <NavLink to="/waivers/new">
          <button className="card-button">Create Waiver</button>
        </NavLink>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Waivers</h3>
      </div>
      <ul className="card-list">
        {waivers.map(waiver => (
          <li key={waiver.id} className="card-list-item">
            <div className="item-header">
              <span className="item-title">{waiver.projectName}</span>
            </div>
            <div className="item-details">
              ${waiver.amount} - {new Date(waiver.createdAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
      <NavLink to="/waivers" className="card-link">
        <button className="card-button">View All Waivers</button>
      </NavLink>
    </div>
  )
}

export default RecentWaivers
