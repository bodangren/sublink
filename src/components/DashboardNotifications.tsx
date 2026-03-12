import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getUnreadNotifications } from '../db'
import type { NotificationRecord } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const DashboardNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])

  useAsyncEffect(
    async (isMounted) => {
      const data = await getUnreadNotifications()
      if (isMounted()) setNotifications(data.slice(0, 3))
    },
    []
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#dc3545'
      case 'medium':
        return '#ffc107'
      default:
        return '#6c757d'
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="dashboard-section">
        <h3>Notifications</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          All caught up! No pending notifications.
        </p>
      </div>
    )
  }

  return (
    <div className="dashboard-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>Notifications</h3>
        <NavLink to="/notifications" style={{ fontSize: '0.875rem' }}>
          View All
        </NavLink>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {notifications.map(notification => (
          <li
            key={notification.id}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: 'var(--secondary-bg)',
              borderRadius: '4px',
              borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{notification.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {notification.message}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DashboardNotifications
