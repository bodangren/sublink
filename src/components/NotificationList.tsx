import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getAllNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../db'
import type { NotificationRecord } from '../db'

const NotificationList = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])

  useEffect(() => {
    let mounted = true
    loadNotifications()
    return () => { mounted = false }

    async function loadNotifications() {
      const data = await getAllNotifications()
      if (mounted) setNotifications(data)
    }
  }, [])

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    const data = await getAllNotifications()
    setNotifications(data)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    const data = await getAllNotifications()
    setNotifications(data)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this notification?')) {
      await deleteNotification(id)
      const data = await getAllNotifications()
      setNotifications(data)
    }
  }

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return <span style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginRight: '0.5rem' }}>HIGH</span>
    }
    if (priority === 'medium') {
      return <span style={{ backgroundColor: '#ffc107', color: '#000', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginRight: '0.5rem' }}>MEDIUM</span>
    }
    return null
  }

  const getEntityLink = (notification: NotificationRecord) => {
    switch (notification.entityType) {
      case 'certificate':
        return `/compliance`
      case 'invoice':
        return `/invoices/${notification.entityId}`
      case 'project':
        return `/projects/${notification.entityId}`
      default:
        return '#'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="container">
      <h1>Notifications {unreadCount > 0 && <span style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', marginLeft: '0.5rem' }}>{unreadCount}</span>}</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}>Mark All as Read</button>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--secondary-bg)', borderRadius: '4px' }}>
            <p style={{ margin: 0 }}>No notifications yet.</p>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Notifications will appear here when certificates are expiring, invoices are overdue, or projects are nearing deadlines.
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map(notification => (
              <li
                key={notification.id}
                style={{
                  backgroundColor: 'var(--secondary-bg)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: notification.read ? '1px solid var(--border-color)' : '2px solid var(--primary)',
                  borderRadius: '4px',
                  opacity: notification.read ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    {getPriorityBadge(notification.priority)}
                    <strong style={{ fontSize: '1.1rem' }}>{notification.title}</strong>
                    {!notification.read && <span style={{ backgroundColor: '#007bff', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginLeft: '0.5rem' }}></span>}
                  </div>
                  <small style={{ color: 'var(--text-secondary)' }}>{formatTimestamp(notification.createdAt)}</small>
                </div>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{notification.message}</p>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <NavLink to={getEntityLink(notification)}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View Related</button>
                  </NavLink>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff' }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default NotificationList
