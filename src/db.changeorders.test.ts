import { describe, it, expect, beforeEach } from 'vitest'
import {
  initDB,
  clearDatabase,
  saveProject,
  saveChangeOrder,
  getChangeOrder,
  getAllChangeOrders,
  getChangeOrdersByProject,
  getChangeOrdersByStatus,
  updateChangeOrder,
  updateChangeOrderStatus,
  deleteChangeOrder,
  getNextChangeOrderNumber,
  getTotalChangeOrdersByProject,
} from './db'
import 'fake-indexeddb/auto'

describe('Change Order database operations', () => {
  let projectId: string

  beforeEach(async () => {
    await initDB()
    await clearDatabase()
    projectId = await saveProject({ name: 'Test Project' })
  })

  describe('getNextChangeOrderNumber', () => {
    it('returns CO-001 for first change order', async () => {
      const number = await getNextChangeOrderNumber()
      expect(number).toBe('CO-001')
    })

    it('increments change order number for subsequent change orders', async () => {
      await saveChangeOrder({
        projectId,
        projectName: 'Test Project',
        description: 'Add additional outlets',
        costAdjustment: 1500,
        reason: 'Client requested more outlets in kitchen',
        status: 'draft',
      })

      const number = await getNextChangeOrderNumber()
      expect(number).toBe('CO-002')
    })

    it('handles gaps in change order numbers', async () => {
      await saveChangeOrder({
        projectId,
        projectName: 'Test Project',
        description: 'CO 1',
        costAdjustment: 100,
        reason: 'Test',
        status: 'draft',
      })
      await saveChangeOrder({
        projectId,
        projectName: 'Test Project',
        description: 'CO 2',
        costAdjustment: 200,
        reason: 'Test',
        status: 'draft',
      })

      const number = await getNextChangeOrderNumber()
      expect(number).toBe('CO-003')
    })
  })

  describe('saveChangeOrder', () => {
    it('saves a new change order and returns id and change order number', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Test Project',
        description: 'Add bathroom fan',
        costAdjustment: 750,
        reason: 'Client requested additional ventilation',
        status: 'draft',
      })

      expect(result.id).toBeDefined()
      expect(result.changeOrderNumber).toBe('CO-001')
    })

    it('saves change order with all optional fields', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Full Project',
        description: 'Complete change description',
        costAdjustment: 5000,
        reason: 'Scope expansion due to site conditions',
        contractReference: 'SECTION-2.3',
        status: 'submitted',
        submittedDate: '2024-01-15',
        notes: 'Client approved verbally, waiting for written confirmation',
      })

      const co = await getChangeOrder(result.id)
      expect(co?.projectName).toBe('Full Project')
      expect(co?.contractReference).toBe('SECTION-2.3')
      expect(co?.submittedDate).toBe('2024-01-15')
      expect(co?.notes).toBe('Client approved verbally, waiting for written confirmation')
    })

    it('saves negative cost adjustment for deductions', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Test Project',
        description: 'Remove unused scope',
        costAdjustment: -2500,
        reason: 'Client decided not to install deck',
        status: 'draft',
      })

      const co = await getChangeOrder(result.id)
      expect(co?.costAdjustment).toBe(-2500)
    })
  })

  describe('getChangeOrder', () => {
    it('returns undefined for non-existent change order', async () => {
      const co = await getChangeOrder('non-existent-id')
      expect(co).toBeUndefined()
    })

    it('returns the specific change order by id', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Specific Project',
        description: 'Specific change',
        costAdjustment: 1000,
        reason: 'Specific reason',
        status: 'approved',
      })

      const co = await getChangeOrder(result.id)
      expect(co).toBeDefined()
      expect(co?.id).toBe(result.id)
      expect(co?.description).toBe('Specific change')
      expect(co?.changeOrderNumber).toBe('CO-001')
    })
  })

  describe('getAllChangeOrders', () => {
    it('returns empty array when no change orders exist', async () => {
      const cos = await getAllChangeOrders()
      expect(cos).toEqual([])
    })

    it('returns all saved change orders', async () => {
      await saveChangeOrder({
        projectId,
        projectName: 'Project',
        description: 'CO 1',
        costAdjustment: 100,
        reason: 'R1',
        status: 'draft',
      })
      await saveChangeOrder({
        projectId,
        projectName: 'Project',
        description: 'CO 2',
        costAdjustment: 200,
        reason: 'R2',
        status: 'approved',
      })

      const cos = await getAllChangeOrders()
      expect(cos.length).toBe(2)
      expect(cos.map(c => c.description)).toContain('CO 1')
      expect(cos.map(c => c.description)).toContain('CO 2')
    })
  })

  describe('getChangeOrdersByProject', () => {
    it('returns empty array for project with no change orders', async () => {
      const cos = await getChangeOrdersByProject(projectId)
      expect(cos).toEqual([])
    })

    it('returns only change orders for specific project', async () => {
      const otherProjectId = await saveProject({ name: 'Other Project' })

      await saveChangeOrder({
        projectId,
        projectName: 'Test Project',
        description: 'CO for Project 1',
        costAdjustment: 100,
        reason: 'R1',
        status: 'draft',
      })
      await saveChangeOrder({
        projectId: otherProjectId,
        projectName: 'Other Project',
        description: 'CO for Project 2',
        costAdjustment: 200,
        reason: 'R2',
        status: 'draft',
      })

      const cos = await getChangeOrdersByProject(projectId)
      expect(cos.length).toBe(1)
      expect(cos[0].description).toBe('CO for Project 1')
    })
  })

  describe('getChangeOrdersByStatus', () => {
    it('returns change orders filtered by status', async () => {
      await saveChangeOrder({
        projectId,
        projectName: 'Project',
        description: 'Draft CO',
        costAdjustment: 100,
        reason: 'R1',
        status: 'draft',
      })
      await saveChangeOrder({
        projectId,
        projectName: 'Project',
        description: 'Approved CO',
        costAdjustment: 200,
        reason: 'R2',
        status: 'approved',
      })
      await saveChangeOrder({
        projectId,
        projectName: 'Project',
        description: 'Submitted CO',
        costAdjustment: 300,
        reason: 'R3',
        status: 'submitted',
      })

      const draft = await getChangeOrdersByStatus('draft')
      const approved = await getChangeOrdersByStatus('approved')
      const rejected = await getChangeOrdersByStatus('rejected')

      expect(draft.length).toBe(1)
      expect(draft[0].description).toBe('Draft CO')
      expect(approved.length).toBe(1)
      expect(approved[0].description).toBe('Approved CO')
      expect(rejected.length).toBe(0)
    })
  })

  describe('updateChangeOrder', () => {
    it('updates an existing change order', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Test Project',
        description: 'Original description',
        costAdjustment: 1000,
        reason: 'Original reason',
        status: 'draft',
      })

      await updateChangeOrder(result.id, {
        description: 'Updated description',
        costAdjustment: 1500,
      })

      const co = await getChangeOrder(result.id)
      expect(co?.description).toBe('Updated description')
      expect(co?.costAdjustment).toBe(1500)
      expect(co?.reason).toBe('Original reason')
    })

    it('throws error for non-existent change order', async () => {
      await expect(updateChangeOrder('non-existent-id', { description: 'New' }))
        .rejects.toThrow('Change order not found')
    })

    it('updates updatedAt timestamp', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Test',
        costAdjustment: 100,
        reason: 'Test',
        status: 'draft',
      })
      const before = await getChangeOrder(result.id)

      await new Promise(resolve => setTimeout(resolve, 10))
      await updateChangeOrder(result.id, { description: 'Updated' })

      const after = await getChangeOrder(result.id)
      expect(after?.updatedAt).toBeGreaterThan(before!.updatedAt)
    })
  })

  describe('updateChangeOrderStatus', () => {
    it('updates status from draft to submitted', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Test CO',
        costAdjustment: 500,
        reason: 'Test',
        status: 'draft',
      })

      await updateChangeOrderStatus(result.id, 'submitted')

      const co = await getChangeOrder(result.id)
      expect(co?.status).toBe('submitted')
    })

    it('updates status to approved with approved date', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Test CO',
        costAdjustment: 500,
        reason: 'Test',
        status: 'submitted',
      })

      await updateChangeOrderStatus(result.id, 'approved')

      const co = await getChangeOrder(result.id)
      expect(co?.status).toBe('approved')
      expect(co?.approvedDate).toBeDefined()
    })

    it('updates status to rejected with rejected date', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Test CO',
        costAdjustment: 500,
        reason: 'Test',
        status: 'submitted',
      })

      await updateChangeOrderStatus(result.id, 'rejected')

      const co = await getChangeOrder(result.id)
      expect(co?.status).toBe('rejected')
      expect(co?.rejectedDate).toBeDefined()
    })

    it('throws error for non-existent change order', async () => {
      await expect(updateChangeOrderStatus('non-existent', 'approved'))
        .rejects.toThrow('Change order not found')
    })
  })

  describe('deleteChangeOrder', () => {
    it('deletes an existing change order', async () => {
      const result = await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'To delete',
        costAdjustment: 100,
        reason: 'Test',
        status: 'draft',
      })

      await deleteChangeOrder(result.id)

      const co = await getChangeOrder(result.id)
      expect(co).toBeUndefined()
    })

    it('does not throw when deleting non-existent change order', async () => {
      await expect(deleteChangeOrder('non-existent-id')).resolves.not.toThrow()
    })
  })

  describe('getTotalChangeOrdersByProject', () => {
    it('returns 0 for project with no change orders', async () => {
      const total = await getTotalChangeOrdersByProject(projectId)
      expect(total).toBe(0)
    })

    it('returns sum of all approved change order adjustments', async () => {
      await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Approved 1',
        costAdjustment: 1000,
        reason: 'R1',
        status: 'approved',
      })
      await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Approved 2',
        costAdjustment: 500,
        reason: 'R2',
        status: 'approved',
      })
      await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Draft (not counted)',
        costAdjustment: 2000,
        reason: 'R3',
        status: 'draft',
      })

      const total = await getTotalChangeOrdersByProject(projectId)
      expect(total).toBe(1500)
    })

    it('handles negative adjustments correctly', async () => {
      await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Addition',
        costAdjustment: 1000,
        reason: 'R1',
        status: 'approved',
      })
      await saveChangeOrder({
        projectId,
        projectName: 'Test',
        description: 'Deduction',
        costAdjustment: -300,
        reason: 'R2',
        status: 'approved',
      })

      const total = await getTotalChangeOrdersByProject(projectId)
      expect(total).toBe(700)
    })
  })
})
