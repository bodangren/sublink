import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotificationBadge from './NotificationBadge'
import { initDB, clearDatabase, saveNotification } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('NotificationBadge', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders without badge when no unread notifications', async () => {
    renderWithRouter(<NotificationBadge />)
    
    await waitFor(() => {
      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument()
  })

  it('displays unread count badge', async () => {
    await saveNotification({
      type: 'coi_expiration',
      title: 'Test 1',
      message: 'Message 1',
      entityType: 'certificate',
      entityId: 'cert-1',
      priority: 'medium',
      read: false,
    })

    await saveNotification({
      type: 'invoice_overdue',
      title: 'Test 2',
      message: 'Message 2',
      entityType: 'invoice',
      entityId: 'inv-1',
      priority: 'high',
      read: false,
    })

    renderWithRouter(<NotificationBadge />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('only counts unread notifications', async () => {
    await saveNotification({
      type: 'coi_expiration',
      title: 'Unread',
      message: 'Unread message',
      entityType: 'certificate',
      entityId: 'cert-1',
      priority: 'medium',
      read: false,
    })

    await saveNotification({
      type: 'invoice_overdue',
      title: 'Read',
      message: 'Read message',
      entityType: 'invoice',
      entityId: 'inv-1',
      priority: 'high',
      read: true,
    })

    renderWithRouter(<NotificationBadge />)

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('links to notifications page', async () => {
    renderWithRouter(<NotificationBadge />)
    
    await waitFor(() => {
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/notifications')
    })
  })

  it('displays bell icon', async () => {
    renderWithRouter(<NotificationBadge />)
    
    await waitFor(() => {
      expect(screen.getByText('🔔')).toBeInTheDocument()
    })
  })
})
