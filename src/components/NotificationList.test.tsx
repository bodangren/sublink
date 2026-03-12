import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotificationList from './NotificationList'
import { initDB, clearDatabase, saveNotification, getAllNotifications } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('NotificationList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders empty state when no notifications exist', async () => {
    renderWithRouter(<NotificationList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
    })
  })

  it('displays list of notifications', async () => {
    await saveNotification({
      type: 'coi_expiration',
      title: 'COI Expiring',
      message: 'Certificate expires in 7 days',
      entityType: 'certificate',
      entityId: 'cert-1',
      priority: 'medium',
      read: false,
    })

    await saveNotification({
      type: 'invoice_overdue',
      title: 'Invoice Overdue',
      message: 'Invoice is overdue',
      entityType: 'invoice',
      entityId: 'inv-1',
      priority: 'high',
      read: false,
    })

    renderWithRouter(<NotificationList />)

    await waitFor(() => {
      expect(screen.getByText('COI Expiring')).toBeInTheDocument()
      expect(screen.getByText('Invoice Overdue')).toBeInTheDocument()
    })
  })

  it('marks notification as read when Mark as Read button clicked', async () => {
    await saveNotification({
      type: 'coi_expiration',
      title: 'Test Notification',
      message: 'Test message',
      entityType: 'certificate',
      entityId: 'cert-1',
      priority: 'medium',
      read: false,
    })

    renderWithRouter(<NotificationList />)

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument()
    })

    const markReadBtn = screen.getByRole('button', { name: /mark as read/i })
    fireEvent.click(markReadBtn)

    await waitFor(async () => {
      const notifications = await getAllNotifications()
      expect(notifications[0].read).toBe(true)
    })
  })

  it('deletes notification when Delete button clicked', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    await saveNotification({
      type: 'coi_expiration',
      title: 'To Delete',
      message: 'Will be deleted',
      entityType: 'certificate',
      entityId: 'cert-1',
      priority: 'medium',
      read: false,
    })

    renderWithRouter(<NotificationList />)

    await waitFor(() => {
      expect(screen.getByText('To Delete')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteBtn)

    await waitFor(async () => {
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(0)
    })

    confirmSpy.mockRestore()
  })

  it('marks all notifications as read when Mark All Read clicked', async () => {
    await saveNotification({
      type: 'coi_expiration',
      title: 'Notification 1',
      message: 'Message 1',
      entityType: 'certificate',
      entityId: 'cert-1',
      priority: 'medium',
      read: false,
    })

    await saveNotification({
      type: 'invoice_overdue',
      title: 'Notification 2',
      message: 'Message 2',
      entityType: 'invoice',
      entityId: 'inv-1',
      priority: 'high',
      read: false,
    })

    renderWithRouter(<NotificationList />)

    await waitFor(() => {
      expect(screen.getByText('Notification 1')).toBeInTheDocument()
    })

    const markAllBtn = screen.getByRole('button', { name: /mark all as read/i })
    fireEvent.click(markAllBtn)

    await waitFor(async () => {
      const notifications = await getAllNotifications()
      expect(notifications.every(n => n.read)).toBe(true)
    })
  })

  it('shows different styling for read vs unread notifications', async () => {
    await saveNotification({
      type: 'coi_expiration',
      title: 'Unread Notification',
      message: 'This is unread',
      entityType: 'certificate',
      entityId: 'cert-1',
      priority: 'medium',
      read: false,
    })

    await saveNotification({
      type: 'invoice_overdue',
      title: 'Read Notification',
      message: 'This is read',
      entityType: 'invoice',
      entityId: 'inv-1',
      priority: 'high',
      read: true,
    })

    renderWithRouter(<NotificationList />)

    await waitFor(() => {
      expect(screen.getByText('Unread Notification')).toBeInTheDocument()
    })

    const unreadItem = screen.getByText('Unread Notification').closest('li')
    expect(unreadItem).toBeInTheDocument()
  })

  it('displays priority indicator for high priority notifications', async () => {
    await saveNotification({
      type: 'invoice_overdue',
      title: 'Urgent Notification',
      message: 'This is urgent',
      entityType: 'invoice',
      entityId: 'inv-1',
      priority: 'high',
      read: false,
    })

    renderWithRouter(<NotificationList />)

    await waitFor(() => {
      expect(screen.getByText(/high/i)).toBeInTheDocument()
    })
  })
})
