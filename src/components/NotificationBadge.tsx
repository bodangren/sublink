import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getUnreadNotifications } from '../db'

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    loadUnreadCount()
    return () => { mounted = false }

    async function loadUnreadCount() {
      const notifications = await getUnreadNotifications()
      if (mounted) setUnreadCount(notifications.length)
    }
  }, [])

  return (
    <NavLink
      to="/notifications"
      className={({ isActive }) => `nav-item nav-notifications${isActive ? ' active' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>🔔</span>
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#dc3545',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            minWidth: '18px',
            height: '18px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </NavLink>
  )
}

export default NotificationBadge
