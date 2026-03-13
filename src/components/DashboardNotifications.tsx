import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getUnreadNotifications } from '../db'
import type { NotificationRecord } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

interface DashboardNotificationsProps {
  inline?: boolean
}

const DashboardNotifications = ({ inline = false }: DashboardNotificationsProps) => {
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

  const content = notifications.length === 0 ? (
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
      ✓ All caught up! No pending notifications.
    </p>
  ) : (
    <>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {notifications.map(notification => (
          <li
            key={notification.id}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: 'var(--input-bg)',
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
      <NavLink
        to="/notifications"
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
      <h3>Notifications</h3>
      {content}
    </div>
  )
}

export default DashboardNotifications
