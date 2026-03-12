import { describe, it, expect, beforeEach } from 'vitest'
import { initDB, clearDatabase, saveNotification, getNotification, getAllNotifications, getUnreadNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, clearAllNotifications } from './db'
import 'fake-indexeddb/auto'

describe('Notification Database Operations', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('saveNotification', () => {
    it('should save a notification and return its id', async () => {
      const id = await saveNotification({
        type: 'coi_expiration',
        title: 'COI Expiring Soon',
        message: 'Certificate ABC expires in 7 days',
        entityType: 'certificate',
        entityId: 'cert-123',
        priority: 'medium',
        read: false,
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should save notification with createdAt timestamp', async () => {
      const beforeSave = Date.now()
      const id = await saveNotification({
        type: 'invoice_overdue',
        title: 'Invoice Overdue',
        message: 'Invoice INV-001 is past due',
        entityType: 'invoice',
        entityId: 'inv-123',
        priority: 'high',
        read: false,
      })
      const afterSave = Date.now()

      const notification = await getNotification(id)
      expect(notification?.createdAt).toBeGreaterThanOrEqual(beforeSave)
      expect(notification?.createdAt).toBeLessThanOrEqual(afterSave)
    })
  })

  describe('getNotification', () => {
    it('should retrieve a notification by id', async () => {
      const id = await saveNotification({
        type: 'project_deadline',
        title: 'Project Deadline Approaching',
        message: 'Project Kitchen Remodel ends in 3 days',
        entityType: 'project',
        entityId: 'proj-123',
        priority: 'medium',
        read: false,
      })

      const notification = await getNotification(id)
      expect(notification).toBeDefined()
      expect(notification?.type).toBe('project_deadline')
      expect(notification?.title).toBe('Project Deadline Approaching')
      expect(notification?.entityId).toBe('proj-123')
    })

    it('should return undefined for non-existent notification', async () => {
      const notification = await getNotification('non-existent-id')
      expect(notification).toBeUndefined()
    })
  })

  describe('getAllNotifications', () => {
    it('should return all notifications sorted by createdAt desc', async () => {
      await saveNotification({
        type: 'coi_expiration',
        title: 'First',
        message: 'First notification',
        entityType: 'certificate',
        entityId: 'cert-1',
        priority: 'medium',
        read: false,
      })

      await new Promise(resolve => setTimeout(resolve, 10))

      await saveNotification({
        type: 'invoice_overdue',
        title: 'Second',
        message: 'Second notification',
        entityType: 'invoice',
        entityId: 'inv-1',
        priority: 'high',
        read: false,
      })

      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(2)
      expect(notifications[0].title).toBe('Second')
      expect(notifications[1].title).toBe('First')
    })

    it('should return empty array when no notifications exist', async () => {
      const notifications = await getAllNotifications()
      expect(notifications).toEqual([])
    })
  })

  describe('getUnreadNotifications', () => {
    it('should return only unread notifications', async () => {
      await saveNotification({
        type: 'coi_expiration',
        title: 'Unread 1',
        message: 'Unread notification 1',
        entityType: 'certificate',
        entityId: 'cert-1',
        priority: 'medium',
        read: false,
      })

      const readId = await saveNotification({
        type: 'invoice_overdue',
        title: 'Read',
        message: 'Read notification',
        entityType: 'invoice',
        entityId: 'inv-1',
        priority: 'high',
        read: true,
      })

      await saveNotification({
        type: 'project_deadline',
        title: 'Unread 2',
        message: 'Unread notification 2',
        entityType: 'project',
        entityId: 'proj-1',
        priority: 'low',
        read: false,
      })

      const unread = await getUnreadNotifications()
      expect(unread).toHaveLength(2)
      expect(unread.find(n => n.id === readId)).toBeUndefined()
    })
  })

  describe('markNotificationRead', () => {
    it('should mark a notification as read', async () => {
      const id = await saveNotification({
        type: 'coi_expiration',
        title: 'Test',
        message: 'Test notification',
        entityType: 'certificate',
        entityId: 'cert-1',
        priority: 'medium',
        read: false,
      })

      await markNotificationRead(id)

      const notification = await getNotification(id)
      expect(notification?.read).toBe(true)
    })

    it('should not throw for non-existent notification', async () => {
      await expect(markNotificationRead('non-existent')).resolves.not.toThrow()
    })
  })

  describe('markAllNotificationsRead', () => {
    it('should mark all notifications as read', async () => {
      await saveNotification({
        type: 'coi_expiration',
        title: 'Unread 1',
        message: 'Unread notification 1',
        entityType: 'certificate',
        entityId: 'cert-1',
        priority: 'medium',
        read: false,
      })

      await saveNotification({
        type: 'invoice_overdue',
        title: 'Unread 2',
        message: 'Unread notification 2',
        entityType: 'invoice',
        entityId: 'inv-1',
        priority: 'high',
        read: false,
      })

      await markAllNotificationsRead()

      const unread = await getUnreadNotifications()
      expect(unread).toHaveLength(0)

      const all = await getAllNotifications()
      expect(all.every(n => n.read)).toBe(true)
    })
  })

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const id = await saveNotification({
        type: 'coi_expiration',
        title: 'To Delete',
        message: 'Will be deleted',
        entityType: 'certificate',
        entityId: 'cert-1',
        priority: 'medium',
        read: false,
      })

      await deleteNotification(id)

      const notification = await getNotification(id)
      expect(notification).toBeUndefined()
    })

    it('should not throw for non-existent notification', async () => {
      await expect(deleteNotification('non-existent')).resolves.not.toThrow()
    })
  })

  describe('clearAllNotifications', () => {
    it('should clear all notifications', async () => {
      await saveNotification({
        type: 'coi_expiration',
        title: 'Test 1',
        message: 'Test 1',
        entityType: 'certificate',
        entityId: 'cert-1',
        priority: 'medium',
        read: false,
      })

      await saveNotification({
        type: 'invoice_overdue',
        title: 'Test 2',
        message: 'Test 2',
        entityType: 'invoice',
        entityId: 'inv-1',
        priority: 'high',
        read: true,
      })

      await clearAllNotifications()

      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(0)
    })
  })
})
