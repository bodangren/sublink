import { describe, it, expect, beforeEach } from 'vitest'
import { initDB, clearDatabase, saveCOI, saveInvoice, saveProject, getAllNotifications } from '../db'
import { generateCOINotifications, generateInvoiceNotifications, generateProjectNotifications, generateAllNotifications } from './notifications'
import 'fake-indexeddb/auto'

describe('Notification Generation', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('generateCOINotifications', () => {
    it('should generate notification for COI expiring in 7 days', async () => {
      const today = new Date()
      const expirationDate = new Date(today)
      expirationDate.setDate(expirationDate.getDate() + 7)
      
      await saveCOI({
        insuranceCompany: 'Test Insurance',
        policyNumber: 'POL-001',
        policyType: 'General Liability',
        effectiveDate: today.toISOString().split('T')[0],
        expirationDate: expirationDate.toISOString().split('T')[0],
        coverageAmount: '1000000',
      })

      await generateCOINotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('coi_expiration')
      expect(notifications[0].priority).toBe('medium')
    })

    it('should generate high priority notification for already expired COI', async () => {
      const today = new Date()
      const pastDate = new Date(today)
      pastDate.setDate(pastDate.getDate() - 1)
      
      await saveCOI({
        insuranceCompany: 'Test Insurance',
        policyNumber: 'POL-002',
        policyType: 'General Liability',
        effectiveDate: pastDate.toISOString().split('T')[0],
        expirationDate: pastDate.toISOString().split('T')[0],
        coverageAmount: '1000000',
      })

      await generateCOINotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].priority).toBe('high')
    })

    it('should not generate notification for COI expiring in more than 7 days', async () => {
      const today = new Date()
      const expirationDate = new Date(today)
      expirationDate.setDate(expirationDate.getDate() + 14)
      
      await saveCOI({
        insuranceCompany: 'Test Insurance',
        policyNumber: 'POL-003',
        policyType: 'General Liability',
        effectiveDate: today.toISOString().split('T')[0],
        expirationDate: expirationDate.toISOString().split('T')[0],
        coverageAmount: '1000000',
      })

      await generateCOINotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(0)
    })

    it('should not create duplicate notifications', async () => {
      const today = new Date()
      const expirationDate = new Date(today)
      expirationDate.setDate(expirationDate.getDate() + 5)
      
      await saveCOI({
        insuranceCompany: 'Test Insurance',
        policyNumber: 'POL-004',
        policyType: 'General Liability',
        effectiveDate: today.toISOString().split('T')[0],
        expirationDate: expirationDate.toISOString().split('T')[0],
        coverageAmount: '1000000',
      })

      await generateCOINotifications()
      await generateCOINotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(1)
    })
  })

  describe('generateInvoiceNotifications', () => {
    it('should generate notification for overdue invoice', async () => {
      const today = new Date()
      const pastDate = new Date(today)
      pastDate.setDate(pastDate.getDate() - 5)
      
      await saveInvoice({
        clientName: 'Test Client',
        issueDate: pastDate.toISOString().split('T')[0],
        dueDate: pastDate.toISOString().split('T')[0],
        lineItems: [],
        subtotal: 1000,
        taxRate: 0,
        taxAmount: 0,
        total: 1000,
        status: 'pending',
      })

      await generateInvoiceNotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('invoice_overdue')
      expect(notifications[0].priority).toBe('high')
    })

    it('should not generate notification for paid invoices', async () => {
      const today = new Date()
      const pastDate = new Date(today)
      pastDate.setDate(pastDate.getDate() - 5)
      
      await saveInvoice({
        clientName: 'Test Client',
        issueDate: pastDate.toISOString().split('T')[0],
        dueDate: pastDate.toISOString().split('T')[0],
        lineItems: [],
        subtotal: 1000,
        taxRate: 0,
        taxAmount: 0,
        total: 1000,
        status: 'paid',
      })

      await generateInvoiceNotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(0)
    })

    it('should not generate notification for invoice not yet due', async () => {
      const today = new Date()
      const futureDate = new Date(today)
      futureDate.setDate(futureDate.getDate() + 30)
      
      await saveInvoice({
        clientName: 'Test Client',
        issueDate: today.toISOString().split('T')[0],
        dueDate: futureDate.toISOString().split('T')[0],
        lineItems: [],
        subtotal: 1000,
        taxRate: 0,
        taxAmount: 0,
        total: 1000,
        status: 'pending',
      })

      await generateInvoiceNotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(0)
    })
  })

  describe('generateProjectNotifications', () => {
    it('should generate notification for project ending in 3 days', async () => {
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + 3)
      
      await saveProject({
        name: 'Test Project',
        endDate: endDate.toISOString().split('T')[0],
      })

      await generateProjectNotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('project_deadline')
      expect(notifications[0].priority).toBe('medium')
    })

    it('should not generate notification for project ending in more than 3 days', async () => {
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + 10)
      
      await saveProject({
        name: 'Test Project 2',
        endDate: endDate.toISOString().split('T')[0],
      })

      await generateProjectNotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(0)
    })

    it('should generate high priority notification for overdue project', async () => {
      const today = new Date()
      const pastDate = new Date(today)
      pastDate.setDate(pastDate.getDate() - 1)
      
      await saveProject({
        name: 'Overdue Project',
        endDate: pastDate.toISOString().split('T')[0],
      })

      await generateProjectNotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].priority).toBe('high')
    })

    it('should not generate notification for project without end date', async () => {
      await saveProject({
        name: 'No End Date Project',
      })

      await generateProjectNotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications).toHaveLength(0)
    })
  })

  describe('generateAllNotifications', () => {
    it('should generate notifications for all entity types', async () => {
      const today = new Date()
      const pastDate = new Date(today)
      pastDate.setDate(pastDate.getDate() - 1)
      const soonDate = new Date(today)
      soonDate.setDate(soonDate.getDate() + 3)

      await saveCOI({
        insuranceCompany: 'Test Insurance',
        policyNumber: 'POL-001',
        policyType: 'General Liability',
        effectiveDate: today.toISOString().split('T')[0],
        expirationDate: soonDate.toISOString().split('T')[0],
        coverageAmount: '1000000',
      })

      await saveInvoice({
        clientName: 'Test Client',
        issueDate: pastDate.toISOString().split('T')[0],
        dueDate: pastDate.toISOString().split('T')[0],
        lineItems: [],
        subtotal: 1000,
        taxRate: 0,
        taxAmount: 0,
        total: 1000,
        status: 'pending',
      })

      await saveProject({
        name: 'Test Project',
        endDate: soonDate.toISOString().split('T')[0],
      })

      await generateAllNotifications()
      
      const notifications = await getAllNotifications()
      expect(notifications.length).toBeGreaterThanOrEqual(3)
      
      const types = notifications.map(n => n.type)
      expect(types).toContain('coi_expiration')
      expect(types).toContain('invoice_overdue')
      expect(types).toContain('project_deadline')
    })

    it('should clear existing auto-generated notifications before regenerating', async () => {
      const today = new Date()
      const pastDate = new Date(today)
      pastDate.setDate(pastDate.getDate() - 1)

      await saveInvoice({
        clientName: 'Test Client',
        issueDate: pastDate.toISOString().split('T')[0],
        dueDate: pastDate.toISOString().split('T')[0],
        lineItems: [],
        subtotal: 1000,
        taxRate: 0,
        taxAmount: 0,
        total: 1000,
        status: 'pending',
      })

      await generateAllNotifications()
      expect(await getAllNotifications()).toHaveLength(1)

      await generateAllNotifications()
      expect(await getAllNotifications()).toHaveLength(1)
    })
  })
})
