import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DashboardNotifications from './DashboardNotifications'
import { initDB, clearDatabase, saveNotification } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('DashboardNotifications', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders empty state when no unread notifications', async () => {
    renderWithRouter(<DashboardNotifications />)
    
    await waitFor(() => {
      expect(screen.getByText(/no pending notifications/i)).toBeInTheDocument()
    })
  })

  it('displays unread notifications', async () => {
    await saveNotification({
      type: 'coi_expiration',
      title: 'COI Expiring',
      message: 'Certificate expires soon',
      entityType: 'certificate',
      entityId: 'cert-1',
      priority: 'medium',
      read: false,
    })

    await saveNotification({
      type: 'invoice_overdue',
      title: 'Invoice Overdue',
      message: 'Invoice is past due',
      entityType: 'invoice',
      entityId: 'inv-1',
      priority: 'high',
      read: false,
    })

    renderWithRouter(<DashboardNotifications />)

    await waitFor(() => {
      expect(screen.getByText('COI Expiring')).toBeInTheDocument()
      expect(screen.getByText('Invoice Overdue')).toBeInTheDocument()
    })
  })

  it('only shows unread notifications', async () => {
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

    renderWithRouter(<DashboardNotifications />)

    await waitFor(() => {
      expect(screen.getByText('Unread Notification')).toBeInTheDocument()
    })

    expect(screen.queryByText('Read Notification')).not.toBeInTheDocument()
  })

  it('limits display to 3 notifications', async () => {
    for (let i = 1; i <= 5; i++) {
      await saveNotification({
        type: 'coi_expiration',
        title: `Notification ${i}`,
        message: `Message ${i}`,
        entityType: 'certificate',
        entityId: `cert-${i}`,
        priority: 'medium',
        read: false,
      })
    }

    renderWithRouter(<DashboardNotifications />)

    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })

    expect(screen.getByText(/view all/i)).toBeInTheDocument()
  })
})
