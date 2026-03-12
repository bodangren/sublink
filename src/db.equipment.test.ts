import { describe, it, expect, beforeEach } from 'vitest'
import {
  initDB,
  clearDatabase,
  saveEquipment,
  getEquipment,
  getAllEquipment,
  getEquipmentByProject,
  getEquipmentByStatus,
  getEquipmentByCategory,
  getEquipmentNeedingMaintenance,
  updateEquipment,
  assignEquipmentToProject,
  logEquipmentMaintenance,
  deleteEquipment,
  getTotalEquipmentValue,
} from './db'
import 'fake-indexeddb/auto'

describe('Equipment Database Operations', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('saveEquipment', () => {
    it('saves equipment with generated id and timestamps', async () => {
      const id = await saveEquipment({
        name: 'DeWalt Drill',
        category: 'power_tool',
        status: 'active',
      })

      expect(id).toBeDefined()
      const equipment = await getEquipment(id)
      expect(equipment).toBeDefined()
      expect(equipment?.name).toBe('DeWalt Drill')
      expect(equipment?.category).toBe('power_tool')
      expect(equipment?.status).toBe('active')
      expect(equipment?.createdAt).toBeDefined()
      expect(equipment?.updatedAt).toBeDefined()
    })

    it('saves equipment with all optional fields', async () => {
      const id = await saveEquipment({
        name: 'Circular Saw',
        description: '7-1/4" circular saw',
        category: 'power_tool',
        serialNumber: 'SN12345',
        modelNumber: 'CS-750',
        purchaseDate: '2025-01-15',
        purchasePrice: 199.99,
        status: 'active',
        maintenanceIntervalDays: 90,
      })

      const equipment = await getEquipment(id)
      expect(equipment?.description).toBe('7-1/4" circular saw')
      expect(equipment?.serialNumber).toBe('SN12345')
      expect(equipment?.modelNumber).toBe('CS-750')
      expect(equipment?.purchaseDate).toBe('2025-01-15')
      expect(equipment?.purchasePrice).toBe(199.99)
      expect(equipment?.maintenanceIntervalDays).toBe(90)
    })
  })

  describe('getAllEquipment', () => {
    it('returns empty array when no equipment', async () => {
      const equipment = await getAllEquipment()
      expect(equipment).toEqual([])
    })

    it('returns all equipment sorted by name', async () => {
      await saveEquipment({ name: 'Zebra Saw', category: 'power_tool', status: 'active' })
      await saveEquipment({ name: 'Alpha Drill', category: 'power_tool', status: 'active' })
      await saveEquipment({ name: 'Beta Hammer', category: 'hand_tool', status: 'active' })

      const equipment = await getAllEquipment()
      expect(equipment).toHaveLength(3)
      expect(equipment[0].name).toBe('Alpha Drill')
      expect(equipment[1].name).toBe('Beta Hammer')
      expect(equipment[2].name).toBe('Zebra Saw')
    })
  })

  describe('getEquipmentByProject', () => {
    it('returns equipment assigned to specific project', async () => {
      await saveEquipment({
        name: 'Drill',
        category: 'power_tool',
        status: 'active',
        currentProjectId: 'project-1',
        currentProjectName: 'Project 1',
      })
      await saveEquipment({
        name: 'Saw',
        category: 'power_tool',
        status: 'active',
        currentProjectId: 'project-2',
        currentProjectName: 'Project 2',
      })
      await saveEquipment({
        name: 'Hammer',
        category: 'hand_tool',
        status: 'active',
      })

      const project1Equipment = await getEquipmentByProject('project-1')
      expect(project1Equipment).toHaveLength(1)
      expect(project1Equipment[0].name).toBe('Drill')
    })
  })

  describe('getEquipmentByStatus', () => {
    it('returns equipment with specific status', async () => {
      await saveEquipment({ name: 'Drill', category: 'power_tool', status: 'active' })
      await saveEquipment({ name: 'Broken Saw', category: 'power_tool', status: 'in_repair' })
      await saveEquipment({ name: 'Old Hammer', category: 'hand_tool', status: 'retired' })

      const activeEquipment = await getEquipmentByStatus('active')
      expect(activeEquipment).toHaveLength(1)
      expect(activeEquipment[0].name).toBe('Drill')

      const repairEquipment = await getEquipmentByStatus('in_repair')
      expect(repairEquipment).toHaveLength(1)
      expect(repairEquipment[0].name).toBe('Broken Saw')
    })
  })

  describe('getEquipmentByCategory', () => {
    it('returns equipment in specific category', async () => {
      await saveEquipment({ name: 'Drill', category: 'power_tool', status: 'active' })
      await saveEquipment({ name: 'Hammer', category: 'hand_tool', status: 'active' })
      await saveEquipment({ name: 'Excavator', category: 'heavy_equipment', status: 'active' })

      const powerTools = await getEquipmentByCategory('power_tool')
      expect(powerTools).toHaveLength(1)
      expect(powerTools[0].name).toBe('Drill')
    })
  })

  describe('getEquipmentNeedingMaintenance', () => {
    it('returns active equipment with overdue maintenance', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      await saveEquipment({
        name: 'Needs Maintenance',
        category: 'power_tool',
        status: 'active',
        nextMaintenanceDate: yesterdayStr,
      })
      await saveEquipment({
        name: 'Future Maintenance',
        category: 'power_tool',
        status: 'active',
        nextMaintenanceDate: '2099-12-31',
      })
      await saveEquipment({
        name: 'No Maintenance Date',
        category: 'power_tool',
        status: 'active',
      })
      await saveEquipment({
        name: 'Retired Equipment',
        category: 'power_tool',
        status: 'retired',
        nextMaintenanceDate: yesterdayStr,
      })

      const needingMaintenance = await getEquipmentNeedingMaintenance()
      expect(needingMaintenance).toHaveLength(1)
      expect(needingMaintenance[0].name).toBe('Needs Maintenance')
    })
  })

  describe('updateEquipment', () => {
    it('updates equipment fields', async () => {
      const id = await saveEquipment({
        name: 'Drill',
        category: 'power_tool',
        status: 'active',
      })

      await updateEquipment(id, { status: 'in_repair', description: 'Needs repair' })

      const equipment = await getEquipment(id)
      expect(equipment?.status).toBe('in_repair')
      expect(equipment?.description).toBe('Needs repair')
      expect(equipment?.name).toBe('Drill')
    })
  })

  describe('assignEquipmentToProject', () => {
    it('assigns equipment to a project', async () => {
      const id = await saveEquipment({
        name: 'Drill',
        category: 'power_tool',
        status: 'active',
      })

      await assignEquipmentToProject(id, 'project-1', 'Kitchen Remodel')

      const equipment = await getEquipment(id)
      expect(equipment?.currentProjectId).toBe('project-1')
      expect(equipment?.currentProjectName).toBe('Kitchen Remodel')
      expect(equipment?.assignedDate).toBeDefined()
    })

    it('unassigns equipment from project', async () => {
      const id = await saveEquipment({
        name: 'Drill',
        category: 'power_tool',
        status: 'active',
        currentProjectId: 'project-1',
        currentProjectName: 'Old Project',
      })

      await assignEquipmentToProject(id, undefined, undefined)

      const equipment = await getEquipment(id)
      expect(equipment?.currentProjectId).toBeUndefined()
      expect(equipment?.currentProjectName).toBeUndefined()
      expect(equipment?.assignedDate).toBeUndefined()
    })
  })

  describe('logEquipmentMaintenance', () => {
    it('adds maintenance log and updates dates', async () => {
      const id = await saveEquipment({
        name: 'Drill',
        category: 'power_tool',
        status: 'active',
        maintenanceIntervalDays: 90,
      })

      await logEquipmentMaintenance(id, { notes: 'Replaced brushes', performedBy: 'John' })

      const equipment = await getEquipment(id)
      expect(equipment?.maintenanceHistory).toHaveLength(1)
      expect(equipment?.maintenanceHistory?.[0].notes).toBe('Replaced brushes')
      expect(equipment?.maintenanceHistory?.[0].performedBy).toBe('John')
      expect(equipment?.lastMaintenanceDate).toBeDefined()
      expect(equipment?.nextMaintenanceDate).toBeDefined()
    })

    it('appends to existing maintenance history', async () => {
      const id = await saveEquipment({
        name: 'Drill',
        category: 'power_tool',
        status: 'active',
        maintenanceIntervalDays: 90,
        maintenanceHistory: [{ date: '2025-01-01', notes: 'Initial service' }],
      })

      await logEquipmentMaintenance(id, { notes: 'Second service' })

      const equipment = await getEquipment(id)
      expect(equipment?.maintenanceHistory).toHaveLength(2)
    })
  })

  describe('deleteEquipment', () => {
    it('deletes equipment', async () => {
      const id = await saveEquipment({
        name: 'Drill',
        category: 'power_tool',
        status: 'active',
      })

      await deleteEquipment(id)

      const equipment = await getEquipment(id)
      expect(equipment).toBeUndefined()
    })
  })

  describe('getTotalEquipmentValue', () => {
    it('calculates total value of active equipment', async () => {
      await saveEquipment({
        name: 'Drill',
        category: 'power_tool',
        status: 'active',
        purchasePrice: 150,
      })
      await saveEquipment({
        name: 'Saw',
        category: 'power_tool',
        status: 'active',
        purchasePrice: 200,
      })
      await saveEquipment({
        name: 'Retired Tool',
        category: 'power_tool',
        status: 'retired',
        purchasePrice: 100,
      })
      await saveEquipment({
        name: 'No Price',
        category: 'power_tool',
        status: 'active',
      })

      const total = await getTotalEquipmentValue()
      expect(total).toBe(350)
    })

    it('returns 0 when no active equipment with prices', async () => {
      const total = await getTotalEquipmentValue()
      expect(total).toBe(0)
    })
  })
})
