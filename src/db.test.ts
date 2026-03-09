import { describe, it, expect, beforeEach } from 'vitest'
import { initDB, saveTask, getTasks, getTask, updateTask, deleteTask, savePhoto, getPhotosByTask, deletePhotosByTask, clearDatabase, saveDailyLog, getDailyLogs, getDailyLog, updateDailyLog, deleteDailyLog, getDailyLogByDate, saveProject, getProjects, getProject, updateProject, deleteProject, getTasksByProject, getDailyLogsByProject, saveInvoice, getInvoices, getInvoice, updateInvoice, deleteInvoice, getNextInvoiceNumber, getUnpaidInvoices, markInvoicePaid, exportAllData, restoreData, saveExpense, getExpenses, getExpense, updateExpense, deleteExpense, getExpensesByProject, getExpensesByInvoice, getBillableExpenses, linkExpenseToInvoice, getTotalExpensesByProject, getPhotosByDailyLog, getPhotoCountByDailyLog, saveEstimate, getEstimates, getEstimate, updateEstimate, deleteEstimate, updateEstimateStatus, convertEstimateToInvoice, getNextEstimateNumber, getRecentEstimates } from './db'
import type { InvoiceLineItem, EstimateLineItem } from './db'
import 'fake-indexeddb/auto'

describe('Task database operations', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('saveTask', () => {
    it('saves a new task and returns its id', async () => {
      const id = await saveTask({
        title: 'Install fixtures',
        description: 'Install bathroom fixtures in unit 4B',
        contractReference: 'CONTRACT-2024-001'
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('saves task with optional contract reference', async () => {
      const id = await saveTask({
        title: 'Rough plumbing',
        description: 'First floor rough-in'
      })

      expect(id).toBeDefined()
    })
  })

  describe('getTasks', () => {
    it('returns empty array when no tasks exist', async () => {
      const tasks = await getTasks()
      expect(tasks).toEqual([])
    })

    it('returns all saved tasks', async () => {
      await saveTask({ title: 'Task 1', description: 'Desc 1' })
      await saveTask({ title: 'Task 2', description: 'Desc 2' })

      const tasks = await getTasks()
      expect(tasks.length).toBe(2)
      expect(tasks.map(t => t.title)).toContain('Task 1')
      expect(tasks.map(t => t.title)).toContain('Task 2')
    })

    it('returns tasks with all fields populated', async () => {
      await saveTask({
        title: 'Full task',
        description: 'Complete description',
        contractReference: 'REF-123'
      })

      const tasks = await getTasks()
      const task = tasks.find(t => t.title === 'Full task')
      
      expect(task).toBeDefined()
      expect(task?.description).toBe('Complete description')
      expect(task?.contractReference).toBe('REF-123')
      expect(task?.id).toBeDefined()
      expect(task?.createdAt).toBeDefined()
      expect(task?.updatedAt).toBeDefined()
    })
  })

  describe('getTask', () => {
    it('returns undefined for non-existent task', async () => {
      const task = await getTask('non-existent-id')
      expect(task).toBeUndefined()
    })

    it('returns the specific task by id', async () => {
      const id = await saveTask({
        title: 'Specific Task',
        description: 'Specific description',
        contractReference: 'SPEC-001'
      })

      const task = await getTask(id)
      expect(task).toBeDefined()
      expect(task?.id).toBe(id)
      expect(task?.title).toBe('Specific Task')
      expect(task?.description).toBe('Specific description')
    })
  })

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const id = await saveTask({
        title: 'Original title',
        description: 'Original desc'
      })

      await updateTask(id, { title: 'Updated title' })

      const tasks = await getTasks()
      const task = tasks.find(t => t.id === id)
      expect(task?.title).toBe('Updated title')
      expect(task?.description).toBe('Original desc')
    })

    it('throws error for non-existent task', async () => {
      await expect(updateTask('non-existent-id', { title: 'New' }))
        .rejects.toThrow('Task not found')
    })

    it('updates updatedAt timestamp', async () => {
      const id = await saveTask({ title: 'Test', description: 'Test' })
      const tasksBefore = await getTasks()
      const before = tasksBefore.find(t => t.id === id)
      
      await new Promise(resolve => setTimeout(resolve, 10))
      await updateTask(id, { title: 'Updated' })
      
      const tasksAfter = await getTasks()
      const after = tasksAfter.find(t => t.id === id)
      expect(after?.updatedAt).toBeGreaterThan(before!.updatedAt)
    })
  })

  describe('deleteTask', () => {
    it('deletes an existing task', async () => {
      const id = await saveTask({ title: 'To delete', description: 'Delete me' })
      
      await deleteTask(id)
      
      const tasks = await getTasks()
      expect(tasks.find(t => t.id === id)).toBeUndefined()
    })

    it('does not throw when deleting non-existent task', async () => {
      await expect(deleteTask('non-existent-id')).resolves.not.toThrow()
    })
  })
})

describe('Photo database operations', () => {
  let taskId: string

  beforeEach(async () => {
    await initDB()
    await clearDatabase()
    taskId = await saveTask({ title: 'Photo task', description: 'For photos' })
  })

  describe('savePhoto', () => {
    it('saves a photo with task association', async () => {
      const id = await savePhoto({
        taskId,
        imageData: 'data:image/png;base64,test',
        latitude: 40.7128,
        longitude: -74.0060,
        capturedAt: Date.now(),
        watermarkData: '40.7128, -74.0060 | 2024-01-15 10:30'
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('saves photo without GPS coordinates', async () => {
      const id = await savePhoto({
        taskId,
        imageData: 'data:image/png;base64,test',
        capturedAt: Date.now(),
        watermarkData: 'No GPS | 2024-01-15 10:30'
      })

      expect(id).toBeDefined()
    })
  })

  describe('getPhotosByTask', () => {
    it('returns empty array for task with no photos', async () => {
      const photos = await getPhotosByTask(taskId)
      expect(photos).toEqual([])
    })

    it('returns photos for specific task', async () => {
      const otherTaskId = await saveTask({ title: 'Other', description: 'Other' })
      
      await savePhoto({
        taskId,
        imageData: 'photo1',
        capturedAt: Date.now(),
        watermarkData: 'wm1'
      })
      await savePhoto({
        taskId: otherTaskId,
        imageData: 'photo2',
        capturedAt: Date.now(),
        watermarkData: 'wm2'
      })

      const photos = await getPhotosByTask(taskId)
      expect(photos.length).toBe(1)
      expect(photos[0].imageData).toBe('photo1')
    })

    it('returns photos sorted by capturedAt ascending', async () => {
      const now = Date.now()
      await savePhoto({
        taskId,
        imageData: 'photo3',
        capturedAt: now + 2000,
        watermarkData: 'wm3'
      })
      await savePhoto({
        taskId,
        imageData: 'photo1',
        capturedAt: now,
        watermarkData: 'wm1'
      })
      await savePhoto({
        taskId,
        imageData: 'photo2',
        capturedAt: now + 1000,
        watermarkData: 'wm2'
      })

      const photos = await getPhotosByTask(taskId)
      expect(photos[0].imageData).toBe('photo1')
      expect(photos[1].imageData).toBe('photo2')
      expect(photos[2].imageData).toBe('photo3')
    })
  })

  describe('deletePhotosByTask', () => {
    it('deletes all photos for a task', async () => {
      await savePhoto({
        taskId,
        imageData: 'photo1',
        capturedAt: Date.now(),
        watermarkData: 'wm1'
      })
      await savePhoto({
        taskId,
        imageData: 'photo2',
        capturedAt: Date.now(),
        watermarkData: 'wm2'
      })

      await deletePhotosByTask(taskId)

      const photos = await getPhotosByTask(taskId)
      expect(photos).toEqual([])
    })

    it('does not affect photos from other tasks', async () => {
      const otherTaskId = await saveTask({ title: 'Other', description: 'Other' })
      
      await savePhoto({
        taskId: otherTaskId,
        imageData: 'other photo',
        capturedAt: Date.now(),
        watermarkData: 'other wm'
      })
      await deletePhotosByTask(taskId)

      const otherPhotos = await getPhotosByTask(otherTaskId)
      expect(otherPhotos.length).toBe(1)
    })
  })
})

describe('Daily Log database operations', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('saveDailyLog', () => {
    it('saves a new daily log and returns its id', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'Downtown Office Building',
        weather: 'Sunny, 72F',
        workPerformed: 'Installed HVAC units on floors 3-5',
        personnel: 'John, Mike, Sarah',
        delays: '',
        equipment: '',
        notes: ''
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('saves log with all optional fields', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'Test Project',
        weather: 'Rainy',
        workPerformed: 'Testing',
        personnel: 'Tester',
        delays: 'Weather delay',
        equipment: 'Crane, Forklift',
        notes: 'Additional notes here'
      })

      expect(id).toBeDefined()
    })
  })

  describe('getDailyLogs', () => {
    it('returns empty array when no logs exist', async () => {
      const logs = await getDailyLogs()
      expect(logs).toEqual([])
    })

    it('returns all saved logs', async () => {
      await saveDailyLog({
        date: '2026-03-07',
        project: 'Project A',
        weather: 'Sunny',
        workPerformed: 'Work A',
        personnel: 'Team A',
        delays: '',
        equipment: '',
        notes: ''
      })
      await saveDailyLog({
        date: '2026-03-08',
        project: 'Project B',
        weather: 'Cloudy',
        workPerformed: 'Work B',
        personnel: 'Team B',
        delays: '',
        equipment: '',
        notes: ''
      })

      const logs = await getDailyLogs()
      expect(logs.length).toBe(2)
      expect(logs.map(l => l.project)).toContain('Project A')
      expect(logs.map(l => l.project)).toContain('Project B')
    })

    it('returns logs with all fields populated', async () => {
      await saveDailyLog({
        date: '2026-03-08',
        project: 'Full Log Test',
        weather: 'Partly Cloudy, 68F',
        workPerformed: 'Complete work description',
        personnel: 'John, Jane',
        delays: 'Material delay',
        equipment: 'Excavator',
        notes: 'End of day notes'
      })

      const logs = await getDailyLogs()
      const log = logs.find(l => l.project === 'Full Log Test')
      
      expect(log).toBeDefined()
      expect(log?.date).toBe('2026-03-08')
      expect(log?.weather).toBe('Partly Cloudy, 68F')
      expect(log?.workPerformed).toBe('Complete work description')
      expect(log?.delays).toBe('Material delay')
      expect(log?.equipment).toBe('Excavator')
      expect(log?.id).toBeDefined()
      expect(log?.createdAt).toBeDefined()
      expect(log?.updatedAt).toBeDefined()
    })
  })

  describe('getDailyLog', () => {
    it('returns undefined for non-existent log', async () => {
      const log = await getDailyLog('non-existent-id')
      expect(log).toBeUndefined()
    })

    it('returns the specific log by id', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'Specific Project',
        weather: 'Clear',
        workPerformed: 'Specific work',
        personnel: 'Specific team',
        delays: '',
        equipment: '',
        notes: ''
      })

      const log = await getDailyLog(id)
      expect(log).toBeDefined()
      expect(log?.id).toBe(id)
      expect(log?.project).toBe('Specific Project')
    })
  })

  describe('updateDailyLog', () => {
    it('updates an existing log', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'Original Project',
        weather: 'Sunny',
        workPerformed: 'Original work',
        personnel: 'Original team',
        delays: '',
        equipment: '',
        notes: ''
      })

      await updateDailyLog(id, { project: 'Updated Project' })

      const logs = await getDailyLogs()
      const log = logs.find(l => l.id === id)
      expect(log?.project).toBe('Updated Project')
      expect(log?.workPerformed).toBe('Original work')
    })

    it('throws error for non-existent log', async () => {
      await expect(updateDailyLog('non-existent-id', { project: 'New' }))
        .rejects.toThrow('Daily log not found')
    })

    it('updates updatedAt timestamp', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'Test',
        weather: 'Test',
        workPerformed: 'Test',
        personnel: 'Test',
        delays: '',
        equipment: '',
        notes: ''
      })
      const logsBefore = await getDailyLogs()
      const before = logsBefore.find(l => l.id === id)
      
      await new Promise(resolve => setTimeout(resolve, 10))
      await updateDailyLog(id, { project: 'Updated' })
      
      const logsAfter = await getDailyLogs()
      const after = logsAfter.find(l => l.id === id)
      expect(after?.updatedAt).toBeGreaterThan(before!.updatedAt)
    })
  })

  describe('deleteDailyLog', () => {
    it('deletes an existing log', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'To delete',
        weather: 'Test',
        workPerformed: 'Test',
        personnel: 'Test',
        delays: '',
        equipment: '',
        notes: ''
      })
      
      await deleteDailyLog(id)
      
      const logs = await getDailyLogs()
      expect(logs.find(l => l.id === id)).toBeUndefined()
    })

    it('does not throw when deleting non-existent log', async () => {
      await expect(deleteDailyLog('non-existent-id')).resolves.not.toThrow()
    })
  })

  describe('getDailyLogByDate', () => {
    it('returns undefined when no log exists for date', async () => {
      const log = await getDailyLogByDate('2026-03-08')
      expect(log).toBeUndefined()
    })

    it('returns the log for the specified date', async () => {
      await saveDailyLog({
        date: '2026-03-08',
        project: 'March 8 Project',
        weather: 'Sunny',
        workPerformed: 'Work for March 8',
        personnel: 'Team',
        delays: '',
        equipment: '',
        notes: ''
      })

      const log = await getDailyLogByDate('2026-03-08')
      expect(log).toBeDefined()
      expect(log?.project).toBe('March 8 Project')
    })
  })

  describe('Daily Log Photo integration', () => {
    it('saves daily log with photoIds', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'Photo Test Project',
        weather: 'Sunny',
        workPerformed: 'Work with photos',
        personnel: 'Team',
        photoIds: ['photo-1', 'photo-2']
      })

      const log = await getDailyLog(id)
      expect(log?.photoIds).toBeDefined()
      expect(log?.photoIds).toEqual(['photo-1', 'photo-2'])
    })

    it('saves daily log without photoIds (optional field)', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'No Photos Project',
        weather: 'Cloudy',
        workPerformed: 'Work without photos',
        personnel: 'Team'
      })

      const log = await getDailyLog(id)
      expect(log?.photoIds).toBeUndefined()
    })

    it('updates daily log with photoIds', async () => {
      const id = await saveDailyLog({
        date: '2026-03-08',
        project: 'Update Test',
        weather: 'Sunny',
        workPerformed: 'Work',
        personnel: 'Team'
      })

      await updateDailyLog(id, { photoIds: ['new-photo-1', 'new-photo-2'] })

      const log = await getDailyLog(id)
      expect(log?.photoIds).toEqual(['new-photo-1', 'new-photo-2'])
    })
  })

  describe('getPhotosByDailyLog', () => {
    let logId: string
    let taskId: string

    beforeEach(async () => {
      taskId = await saveTask({ title: 'Task for photos', description: 'Test task' })
      logId = await saveDailyLog({
        date: '2026-03-08',
        project: 'Photo Test',
        weather: 'Sunny',
        workPerformed: 'Work',
        personnel: 'Team',
        photoIds: []
      })
    })

    it('returns empty array when no photos attached to log', async () => {
      const photos = await getPhotosByDailyLog(logId)
      expect(photos).toEqual([])
    })

    it('returns photos attached to daily log', async () => {
      const photo1Id = await savePhoto({
        taskId,
        imageData: 'photo1-data',
        capturedAt: Date.now(),
        watermarkData: 'wm1'
      })
      const photo2Id = await savePhoto({
        taskId,
        imageData: 'photo2-data',
        capturedAt: Date.now(),
        watermarkData: 'wm2'
      })

      await updateDailyLog(logId, { photoIds: [photo1Id, photo2Id] })

      const photos = await getPhotosByDailyLog(logId)
      expect(photos.length).toBe(2)
      expect(photos.map(p => p.imageData)).toContain('photo1-data')
      expect(photos.map(p => p.imageData)).toContain('photo2-data')
    })

    it('does not return photos from other daily logs', async () => {
      const otherLogId = await saveDailyLog({
        date: '2026-03-07',
        project: 'Other Project',
        weather: 'Rainy',
        workPerformed: 'Other work',
        personnel: 'Other team',
        photoIds: []
      })

      const photo1Id = await savePhoto({
        taskId,
        imageData: 'photo-for-log1',
        capturedAt: Date.now(),
        watermarkData: 'wm1'
      })
      const photo2Id = await savePhoto({
        taskId,
        imageData: 'photo-for-log2',
        capturedAt: Date.now(),
        watermarkData: 'wm2'
      })

      await updateDailyLog(logId, { photoIds: [photo1Id] })
      await updateDailyLog(otherLogId, { photoIds: [photo2Id] })

      const photos = await getPhotosByDailyLog(logId)
      expect(photos.length).toBe(1)
      expect(photos[0].imageData).toBe('photo-for-log1')
    })
  })

  describe('getPhotoCountByDailyLog', () => {
    let logId: string
    let taskId: string

    beforeEach(async () => {
      taskId = await saveTask({ title: 'Task', description: 'Test' })
      logId = await saveDailyLog({
        date: '2026-03-08',
        project: 'Count Test',
        weather: 'Sunny',
        workPerformed: 'Work',
        personnel: 'Team',
        photoIds: []
      })
    })

    it('returns 0 when no photos attached', async () => {
      const count = await getPhotoCountByDailyLog(logId)
      expect(count).toBe(0)
    })

    it('returns correct count of attached photos', async () => {
      const photo1Id = await savePhoto({
        taskId,
        imageData: 'photo1',
        capturedAt: Date.now(),
        watermarkData: 'wm1'
      })
      const photo2Id = await savePhoto({
        taskId,
        imageData: 'photo2',
        capturedAt: Date.now(),
        watermarkData: 'wm2'
      })
      const photo3Id = await savePhoto({
        taskId,
        imageData: 'photo3',
        capturedAt: Date.now(),
        watermarkData: 'wm3'
      })

      await updateDailyLog(logId, { photoIds: [photo1Id, photo2Id, photo3Id] })

      const count = await getPhotoCountByDailyLog(logId)
      expect(count).toBe(3)
    })
  })
})

describe('Project database operations', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('saveProject', () => {
    it('saves a new project and returns its id', async () => {
      const id = await saveProject({
        name: 'Test Project',
        client: 'Test Client',
        address: '123 Test St',
        contractValue: '50000',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        notes: 'Test notes'
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('saves project with only required fields', async () => {
      const id = await saveProject({ name: 'Minimal Project' })
      expect(id).toBeDefined()
    })
  })

  describe('getProjects', () => {
    it('returns empty array when no projects exist', async () => {
      const projects = await getProjects()
      expect(projects).toEqual([])
    })

    it('returns all saved projects', async () => {
      await saveProject({ name: 'Project 1' })
      await saveProject({ name: 'Project 2' })

      const projects = await getProjects()
      expect(projects.length).toBe(2)
      expect(projects.map(p => p.name)).toContain('Project 1')
      expect(projects.map(p => p.name)).toContain('Project 2')
    })
  })

  describe('getProject', () => {
    it('returns undefined for non-existent project', async () => {
      const project = await getProject('non-existent-id')
      expect(project).toBeUndefined()
    })

    it('returns the specific project by id', async () => {
      const id = await saveProject({
        name: 'Specific Project',
        client: 'Specific Client'
      })

      const project = await getProject(id)
      expect(project).toBeDefined()
      expect(project?.id).toBe(id)
      expect(project?.name).toBe('Specific Project')
      expect(project?.client).toBe('Specific Client')
    })
  })

  describe('updateProject', () => {
    it('updates an existing project', async () => {
      const id = await saveProject({ name: 'Original Name' })

      await updateProject(id, { name: 'Updated Name' })

      const project = await getProject(id)
      expect(project?.name).toBe('Updated Name')
    })

    it('throws error for non-existent project', async () => {
      await expect(updateProject('non-existent-id', { name: 'New' }))
        .rejects.toThrow('Project not found')
    })

    it('updates updatedAt timestamp', async () => {
      const id = await saveProject({ name: 'Test' })
      const before = await getProject(id)
      
      await new Promise(resolve => setTimeout(resolve, 10))
      await updateProject(id, { name: 'Updated' })
      
      const after = await getProject(id)
      expect(after?.updatedAt).toBeGreaterThan(before!.updatedAt)
    })
  })

  describe('deleteProject', () => {
    it('deletes an existing project', async () => {
      const id = await saveProject({ name: 'To Delete' })
      
      await deleteProject(id)
      
      const projects = await getProjects()
      expect(projects.find(p => p.id === id)).toBeUndefined()
    })
  })

  describe('getTasksByProject', () => {
    it('returns empty array for project with no tasks', async () => {
      const projectId = await saveProject({ name: 'Test Project' })
      const tasks = await getTasksByProject(projectId)
      expect(tasks).toEqual([])
    })

    it('returns only tasks for specific project', async () => {
      const projectId = await saveProject({ name: 'Project 1' })
      const otherProjectId = await saveProject({ name: 'Project 2' })
      
      await saveTask({ title: 'Task 1', description: 'Desc', projectId })
      await saveTask({ title: 'Task 2', description: 'Desc', projectId })
      await saveTask({ title: 'Task 3', description: 'Desc', projectId: otherProjectId })

      const tasks = await getTasksByProject(projectId)
      expect(tasks.length).toBe(2)
      expect(tasks.map(t => t.title)).toContain('Task 1')
      expect(tasks.map(t => t.title)).toContain('Task 2')
      expect(tasks.map(t => t.title)).not.toContain('Task 3')
    })
  })

  describe('getDailyLogsByProject', () => {
    it('returns only logs for specific project', async () => {
      const projectId = await saveProject({ name: 'Project 1' })
      const otherProjectId = await saveProject({ name: 'Project 2' })
      
      await saveDailyLog({
        date: '2026-03-08',
        project: 'Project 1',
        weather: 'Sunny',
        workPerformed: 'Work 1',
        personnel: 'Team 1',
        projectId
      })
      await saveDailyLog({
        date: '2026-03-07',
        project: 'Project 2',
        weather: 'Rainy',
        workPerformed: 'Work 2',
        personnel: 'Team 2',
        projectId: otherProjectId
      })

      const logs = await getDailyLogsByProject(projectId)
      expect(logs.length).toBe(1)
      expect(logs[0].project).toBe('Project 1')
    })
  })
})

describe('Invoice database operations', () => {
  const createLineItem = (overrides: Partial<InvoiceLineItem> = {}): InvoiceLineItem => ({
    id: crypto.randomUUID(),
    type: 'custom',
    description: 'Test item',
    quantity: 1,
    rate: 100,
    amount: 100,
    ...overrides
  })

  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('getNextInvoiceNumber', () => {
    it('returns INV-001 for first invoice', async () => {
      const number = await getNextInvoiceNumber()
      expect(number).toBe('INV-001')
    })

    it('increments invoice number for subsequent invoices', async () => {
      await saveInvoice({
        clientName: 'Client 1',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [createLineItem()],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'pending'
      })

      const number = await getNextInvoiceNumber()
      expect(number).toBe('INV-002')
    })

    it('handles gaps in invoice numbers', async () => {
      await saveInvoice({
        clientName: 'Client 1',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [createLineItem()],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'pending'
      })
      await saveInvoice({
        clientName: 'Client 2',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [createLineItem()],
        subtotal: 200,
        taxRate: 0,
        taxAmount: 0,
        total: 200,
        status: 'pending'
      })

      const number = await getNextInvoiceNumber()
      expect(number).toBe('INV-003')
    })
  })

  describe('saveInvoice', () => {
    it('saves a new invoice and returns id and invoice number', async () => {
      const result = await saveInvoice({
        clientName: 'Test Client',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [createLineItem()],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'pending'
      })

      expect(result.id).toBeDefined()
      expect(result.invoiceNumber).toBe('INV-001')
    })

    it('saves invoice with all optional fields', async () => {
      const projectId = await saveProject({ name: 'Test Project' })
      const result = await saveInvoice({
        projectId,
        projectName: 'Test Project',
        clientName: 'Full Client',
        clientEmail: 'client@test.com',
        clientAddress: '123 Test St',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [createLineItem()],
        subtotal: 500,
        taxRate: 8.5,
        taxAmount: 42.50,
        total: 542.50,
        notes: 'Thank you for your business',
        status: 'draft'
      })

      const invoice = await getInvoice(result.id)
      expect(invoice?.clientEmail).toBe('client@test.com')
      expect(invoice?.taxRate).toBe(8.5)
      expect(invoice?.notes).toBe('Thank you for your business')
    })
  })

  describe('getInvoices', () => {
    it('returns empty array when no invoices exist', async () => {
      const invoices = await getInvoices()
      expect(invoices).toEqual([])
    })

    it('returns all saved invoices', async () => {
      await saveInvoice({
        clientName: 'Client A',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'pending'
      })
      await saveInvoice({
        clientName: 'Client B',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [],
        subtotal: 200,
        taxRate: 0,
        taxAmount: 0,
        total: 200,
        status: 'paid'
      })

      const invoices = await getInvoices()
      expect(invoices.length).toBe(2)
      expect(invoices.map(i => i.clientName)).toContain('Client A')
      expect(invoices.map(i => i.clientName)).toContain('Client B')
    })
  })

  describe('getInvoice', () => {
    it('returns undefined for non-existent invoice', async () => {
      const invoice = await getInvoice('non-existent-id')
      expect(invoice).toBeUndefined()
    })

    it('returns the specific invoice by id', async () => {
      const result = await saveInvoice({
        clientName: 'Specific Client',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [createLineItem({ description: 'Specific work' })],
        subtotal: 500,
        taxRate: 10,
        taxAmount: 50,
        total: 550,
        status: 'pending'
      })

      const invoice = await getInvoice(result.id)
      expect(invoice).toBeDefined()
      expect(invoice?.id).toBe(result.id)
      expect(invoice?.clientName).toBe('Specific Client')
      expect(invoice?.lineItems.length).toBe(1)
      expect(invoice?.lineItems[0].description).toBe('Specific work')
    })
  })

  describe('updateInvoice', () => {
    it('updates an existing invoice', async () => {
      const result = await saveInvoice({
        clientName: 'Original Client',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'draft'
      })

      await updateInvoice(result.id, { clientName: 'Updated Client', status: 'pending' })

      const invoice = await getInvoice(result.id)
      expect(invoice?.clientName).toBe('Updated Client')
      expect(invoice?.status).toBe('pending')
    })

    it('throws error for non-existent invoice', async () => {
      await expect(updateInvoice('non-existent-id', { clientName: 'New' }))
        .rejects.toThrow('Invoice not found')
    })

    it('updates updatedAt timestamp', async () => {
      const result = await saveInvoice({
        clientName: 'Test',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'pending'
      })
      const before = await getInvoice(result.id)
      
      await new Promise(resolve => setTimeout(resolve, 10))
      await updateInvoice(result.id, { clientName: 'Updated' })
      
      const after = await getInvoice(result.id)
      expect(after?.updatedAt).toBeGreaterThan(before!.updatedAt)
    })
  })

  describe('deleteInvoice', () => {
    it('deletes an existing invoice', async () => {
      const result = await saveInvoice({
        clientName: 'To Delete',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'pending'
      })
      
      await deleteInvoice(result.id)
      
      const invoices = await getInvoices()
      expect(invoices.find(i => i.id === result.id)).toBeUndefined()
    })

    it('does not throw when deleting non-existent invoice', async () => {
      await expect(deleteInvoice('non-existent-id')).resolves.not.toThrow()
    })
  })

  describe('getUnpaidInvoices', () => {
    it('returns only pending and overdue invoices', async () => {
      await saveInvoice({
        clientName: 'Pending Client',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'pending'
      })
      await saveInvoice({
        clientName: 'Overdue Client',
        issueDate: '2026-01-01',
        dueDate: '2026-02-01',
        lineItems: [],
        subtotal: 200,
        taxRate: 0,
        taxAmount: 0,
        total: 200,
        status: 'overdue'
      })
      await saveInvoice({
        clientName: 'Paid Client',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [],
        subtotal: 300,
        taxRate: 0,
        taxAmount: 0,
        total: 300,
        status: 'paid'
      })

      const unpaid = await getUnpaidInvoices()
      expect(unpaid.length).toBe(2)
      expect(unpaid.map(i => i.clientName)).toContain('Pending Client')
      expect(unpaid.map(i => i.clientName)).toContain('Overdue Client')
      expect(unpaid.map(i => i.clientName)).not.toContain('Paid Client')
    })
  })

  describe('markInvoicePaid', () => {
    it('marks an invoice as paid', async () => {
      const result = await saveInvoice({
        clientName: 'To Pay',
        issueDate: '2026-03-08',
        dueDate: '2026-04-08',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'pending'
      })

      await markInvoicePaid(result.id)

      const invoice = await getInvoice(result.id)
      expect(invoice?.status).toBe('paid')
      expect(invoice?.paidAt).toBeDefined()
    })

    it('throws error for non-existent invoice', async () => {
      await expect(markInvoicePaid('non-existent-id'))
        .rejects.toThrow('Invoice not found')
    })
  })
})

describe('Expense database operations', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('saveExpense', () => {
    it('saves a new expense and returns its id', async () => {
      const id = await saveExpense({
        description: 'Lumber purchase',
        category: 'materials',
        amount: 150.00,
        date: '2024-01-15',
        billable: true
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('saves expense with all optional fields', async () => {
      const projectId = await saveProject({ name: 'Test Project' })
      const id = await saveExpense({
        projectId,
        description: 'Equipment rental',
        category: 'equipment_rental',
        amount: 500.00,
        vendor: 'Rental Co',
        date: '2024-01-15',
        billable: true,
        notes: 'Weekly rate'
      })

      const expense = await getExpense(id)
      expect(expense?.projectId).toBe(projectId)
      expect(expense?.vendor).toBe('Rental Co')
      expect(expense?.notes).toBe('Weekly rate')
    })
  })

  describe('getExpenses', () => {
    it('returns empty array when no expenses exist', async () => {
      const expenses = await getExpenses()
      expect(expenses).toEqual([])
    })

    it('returns all saved expenses', async () => {
      await saveExpense({ description: 'Expense 1', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
      await saveExpense({ description: 'Expense 2', category: 'fuel', amount: 50, date: '2024-01-02', billable: true })

      const expenses = await getExpenses()
      expect(expenses.length).toBe(2)
    })
  })

  describe('getExpense', () => {
    it('returns undefined for non-existent expense', async () => {
      const expense = await getExpense('non-existent-id')
      expect(expense).toBeUndefined()
    })

    it('returns the specific expense by id', async () => {
      const id = await saveExpense({
        description: 'Test Expense',
        category: 'materials',
        amount: 200,
        date: '2024-01-15',
        billable: true
      })

      const expense = await getExpense(id)
      expect(expense).toBeDefined()
      expect(expense?.id).toBe(id)
      expect(expense?.description).toBe('Test Expense')
    })
  })

  describe('updateExpense', () => {
    it('updates an existing expense', async () => {
      const id = await saveExpense({
        description: 'Original',
        category: 'materials',
        amount: 100,
        date: '2024-01-01',
        billable: false
      })

      await updateExpense(id, { description: 'Updated', amount: 150 })

      const expense = await getExpense(id)
      expect(expense?.description).toBe('Updated')
      expect(expense?.amount).toBe(150)
    })

    it('throws error for non-existent expense', async () => {
      await expect(updateExpense('non-existent-id', { description: 'Test' }))
        .rejects.toThrow('Expense not found')
    })
  })

  describe('deleteExpense', () => {
    it('deletes an existing expense', async () => {
      const id = await saveExpense({
        description: 'To Delete',
        category: 'other',
        amount: 50,
        date: '2024-01-01',
        billable: false
      })

      await deleteExpense(id)

      const expense = await getExpense(id)
      expect(expense).toBeUndefined()
    })
  })

  describe('getExpensesByProject', () => {
    it('returns expenses filtered by project', async () => {
      const projectId = await saveProject({ name: 'Project A' })
      await saveExpense({ projectId, description: 'Expense A', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
      await saveExpense({ description: 'Expense B', category: 'materials', amount: 100, date: '2024-01-01', billable: false })

      const expenses = await getExpensesByProject(projectId)
      expect(expenses.length).toBe(1)
      expect(expenses[0].description).toBe('Expense A')
    })
  })

  describe('getExpensesByInvoice', () => {
    it('returns expenses linked to an invoice', async () => {
      await saveExpense({
        description: 'Billed Expense',
        category: 'materials',
        amount: 100,
        date: '2024-01-01',
        billable: true,
        invoiceId: 'inv-123'
      })
      await saveExpense({
        description: 'Unbilled Expense',
        category: 'materials',
        amount: 100,
        date: '2024-01-01',
        billable: true
      })

      const expenses = await getExpensesByInvoice('inv-123')
      expect(expenses.length).toBe(1)
      expect(expenses[0].description).toBe('Billed Expense')
    })
  })

  describe('getBillableExpenses', () => {
    it('returns only unbilled billable expenses', async () => {
      await saveExpense({ description: 'Billable', category: 'materials', amount: 100, date: '2024-01-01', billable: true })
      await saveExpense({ description: 'Non-billable', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
      await saveExpense({ description: 'Already billed', category: 'materials', amount: 100, date: '2024-01-01', billable: true, invoiceId: 'inv-1' })

      const expenses = await getBillableExpenses()
      expect(expenses.length).toBe(1)
      expect(expenses[0].description).toBe('Billable')
    })
  })

  describe('linkExpenseToInvoice', () => {
    it('links expense to invoice', async () => {
      const id = await saveExpense({
        description: 'Test',
        category: 'materials',
        amount: 100,
        date: '2024-01-01',
        billable: true
      })

      await linkExpenseToInvoice(id, 'inv-456')

      const expense = await getExpense(id)
      expect(expense?.invoiceId).toBe('inv-456')
    })

    it('throws error for non-existent expense', async () => {
      await expect(linkExpenseToInvoice('non-existent', 'inv-1'))
        .rejects.toThrow('Expense not found')
    })
  })

  describe('getTotalExpensesByProject', () => {
    it('returns total of all expenses for a project', async () => {
      const projectId = await saveProject({ name: 'Project' })
      await saveExpense({ projectId, description: 'E1', category: 'materials', amount: 100, date: '2024-01-01', billable: false })
      await saveExpense({ projectId, description: 'E2', category: 'materials', amount: 200, date: '2024-01-01', billable: false })
      await saveExpense({ description: 'Other', category: 'materials', amount: 500, date: '2024-01-01', billable: false })

      const total = await getTotalExpensesByProject(projectId)
      expect(total).toBe(300)
    })

    it('returns 0 for project with no expenses', async () => {
      const projectId = await saveProject({ name: 'Empty Project' })
      const total = await getTotalExpensesByProject(projectId)
      expect(total).toBe(0)
    })
  })
})

describe('Backup and Restore operations', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  describe('exportAllData', () => {
    it('returns empty data when database is empty', async () => {
      const data = await exportAllData()
      expect(data.projects).toEqual([])
      expect(data.waivers).toEqual([])
      expect(data.certificates).toEqual([])
      expect(data.tasks).toEqual([])
      expect(data.photos).toEqual([])
      expect(data.dailyLogs).toEqual([])
      expect(data.timeEntries).toEqual([])
      expect(data.invoices).toEqual([])
      expect(data.expenses).toEqual([])
      expect(data.estimates).toEqual([])
    })

    it('exports all data from all stores', async () => {
      await saveProject({ name: 'Project 1' })
      await saveTask({ title: 'Task 1', description: 'Desc' })
      await saveDailyLog({ date: '2024-01-01', project: 'Test', weather: 'Sunny', workPerformed: 'Work', personnel: '1' })
      await saveExpense({ description: 'Expense 1', category: 'materials', amount: 100, date: '2024-01-01', billable: false })

      const data = await exportAllData()

      expect(data.projects.length).toBe(1)
      expect(data.tasks.length).toBe(1)
      expect(data.dailyLogs.length).toBe(1)
      expect(data.expenses.length).toBe(1)
    })
  })

  describe('restoreData', () => {
    it('restores data in replace mode', async () => {
      await saveProject({ name: 'Old Project' })
      
      const restorePayload = {
        projects: [{ id: 'new-1', name: 'New Project', createdAt: Date.now(), updatedAt: Date.now() }],
      }

      await restoreData(restorePayload, 'replace')

      const projects = await getProjects()
      expect(projects.length).toBe(1)
      expect(projects[0].name).toBe('New Project')
    })

    it('merges data in merge mode', async () => {
      await saveProject({ name: 'Existing Project' })
      
      const restorePayload = {
        projects: [{ id: 'new-1', name: 'New Project', createdAt: Date.now(), updatedAt: Date.now() }],
      }

      await restoreData(restorePayload, 'merge')

      const projects = await getProjects()
      expect(projects.length).toBe(2)
    })

    it('skips duplicates in merge mode', async () => {
      const existingId = await saveProject({ name: 'Existing Project' })
      
      const restorePayload = {
        projects: [{ id: existingId, name: 'Updated Name', createdAt: Date.now(), updatedAt: Date.now() }],
      }

      await restoreData(restorePayload, 'merge')

      const projects = await getProjects()
      expect(projects.length).toBe(1)
      expect(projects[0].name).toBe('Existing Project')
    })
  })
})

describe('Estimate database operations', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  const createTestLineItems = (): EstimateLineItem[] => [
    { id: '1', description: 'Labor', quantity: 8, rate: 75, amount: 600 },
    { id: '2', description: 'Materials', quantity: 1, rate: 250, amount: 250 },
  ]

  describe('getNextEstimateNumber', () => {
    it('returns EST-001 for first estimate', async () => {
      const number = await getNextEstimateNumber()
      expect(number).toBe('EST-001')
    })

    it('increments estimate number', async () => {
      await saveEstimate({
        clientName: 'Test Client',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: createTestLineItems(),
        subtotal: 850,
        taxRate: 0,
        taxAmount: 0,
        total: 850,
        status: 'draft',
      })

      const number = await getNextEstimateNumber()
      expect(number).toBe('EST-002')
    })
  })

  describe('saveEstimate', () => {
    it('saves a new estimate and returns id and number', async () => {
      const result = await saveEstimate({
        clientName: 'John Smith',
        clientEmail: 'john@example.com',
        clientAddress: '123 Main St',
        issueDate: '2024-01-15',
        validUntilDate: '2024-02-15',
        lineItems: createTestLineItems(),
        subtotal: 850,
        taxRate: 8.5,
        taxAmount: 72.25,
        total: 922.25,
        notes: 'Test estimate',
        status: 'draft',
      })

      expect(result.id).toBeDefined()
      expect(result.estimateNumber).toBe('EST-001')
    })

    it('saves estimate with project reference', async () => {
      const projectId = await saveProject({ name: 'Test Project' })

      const result = await saveEstimate({
        projectId,
        projectName: 'Test Project',
        clientName: 'Client',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 0,
        status: 'draft',
      })

      const estimate = await getEstimate(result.id)
      expect(estimate?.projectId).toBe(projectId)
    })
  })

  describe('getEstimates', () => {
    it('returns empty array when no estimates exist', async () => {
      const estimates = await getEstimates()
      expect(estimates).toEqual([])
    })

    it('returns all saved estimates', async () => {
      await saveEstimate({
        clientName: 'Client 1',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'draft',
      })
      await saveEstimate({
        clientName: 'Client 2',
        issueDate: '2024-01-02',
        validUntilDate: '2024-02-02',
        lineItems: [],
        subtotal: 200,
        taxRate: 0,
        taxAmount: 0,
        total: 200,
        status: 'sent',
      })

      const estimates = await getEstimates()
      expect(estimates.length).toBe(2)
      expect(estimates.map(e => e.clientName)).toContain('Client 1')
      expect(estimates.map(e => e.clientName)).toContain('Client 2')
    })
  })

  describe('getEstimate', () => {
    it('returns undefined for non-existent estimate', async () => {
      const estimate = await getEstimate('non-existent')
      expect(estimate).toBeUndefined()
    })

    it('returns the specific estimate by id', async () => {
      const result = await saveEstimate({
        clientName: 'Specific Client',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: createTestLineItems(),
        subtotal: 850,
        taxRate: 0,
        taxAmount: 0,
        total: 850,
        status: 'draft',
      })

      const estimate = await getEstimate(result.id)
      expect(estimate).toBeDefined()
      expect(estimate?.id).toBe(result.id)
      expect(estimate?.clientName).toBe('Specific Client')
      expect(estimate?.lineItems.length).toBe(2)
    })
  })

  describe('updateEstimate', () => {
    it('updates an existing estimate', async () => {
      const result = await saveEstimate({
        clientName: 'Original Name',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'draft',
      })

      await updateEstimate(result.id, { clientName: 'Updated Name', total: 150 })

      const estimate = await getEstimate(result.id)
      expect(estimate?.clientName).toBe('Updated Name')
      expect(estimate?.total).toBe(150)
    })

    it('throws error for non-existent estimate', async () => {
      await expect(updateEstimate('non-existent', { clientName: 'Test' })).rejects.toThrow('Estimate not found')
    })
  })

  describe('deleteEstimate', () => {
    it('deletes an existing estimate', async () => {
      const result = await saveEstimate({
        clientName: 'To Delete',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'draft',
      })

      await deleteEstimate(result.id)

      const estimate = await getEstimate(result.id)
      expect(estimate).toBeUndefined()
    })
  })

  describe('updateEstimateStatus', () => {
    it('updates estimate status', async () => {
      const result = await saveEstimate({
        clientName: 'Client',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'draft',
      })

      await updateEstimateStatus(result.id, 'accepted')

      const estimate = await getEstimate(result.id)
      expect(estimate?.status).toBe('accepted')
    })
  })

  describe('convertEstimateToInvoice', () => {
    it('converts estimate to invoice and updates status', async () => {
      const estimateResult = await saveEstimate({
        clientName: 'Invoice Client',
        clientEmail: 'invoice@example.com',
        clientAddress: '456 Oak Ave',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: createTestLineItems(),
        subtotal: 850,
        taxRate: 8.5,
        taxAmount: 72.25,
        total: 922.25,
        notes: 'Convert to invoice',
        status: 'accepted',
      })

      const invoiceResult = await convertEstimateToInvoice(estimateResult.id)

      expect(invoiceResult.invoiceId).toBeDefined()
      expect(invoiceResult.invoiceNumber).toMatch(/^INV-\d{3}$/)

      const estimate = await getEstimate(estimateResult.id)
      expect(estimate?.status).toBe('converted')
      expect(estimate?.convertedToInvoiceId).toBe(invoiceResult.invoiceId)

      const invoice = await getInvoice(invoiceResult.invoiceId)
      expect(invoice).toBeDefined()
      expect(invoice?.clientName).toBe('Invoice Client')
      expect(invoice?.clientEmail).toBe('invoice@example.com')
      expect(invoice?.total).toBe(922.25)
      expect(invoice?.lineItems.length).toBe(2)
      expect(invoice?.status).toBe('pending')
    })

    it('throws error for non-existent estimate', async () => {
      await expect(convertEstimateToInvoice('non-existent')).rejects.toThrow('Estimate not found')
    })
  })

  describe('getRecentEstimates', () => {
    it('returns empty array when no estimates exist', async () => {
      const estimates = await getRecentEstimates()
      expect(estimates).toEqual([])
    })

    it('returns most recent estimates sorted by creation date', async () => {
      await saveEstimate({
        clientName: 'Old',
        issueDate: '2024-01-01',
        validUntilDate: '2024-02-01',
        lineItems: [],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        total: 100,
        status: 'draft',
      })
      
      await new Promise(resolve => setTimeout(resolve, 10))
      
      await saveEstimate({
        clientName: 'New',
        issueDate: '2024-01-02',
        validUntilDate: '2024-02-02',
        lineItems: [],
        subtotal: 200,
        taxRate: 0,
        taxAmount: 0,
        total: 200,
        status: 'draft',
      })

      const estimates = await getRecentEstimates(5)
      expect(estimates.length).toBe(2)
      expect(estimates[0].clientName).toBe('New')
      expect(estimates[1].clientName).toBe('Old')
    })

    it('respects limit parameter', async () => {
      for (let i = 0; i < 10; i++) {
        await saveEstimate({
          clientName: `Client ${i}`,
          issueDate: '2024-01-01',
          validUntilDate: '2024-02-01',
          lineItems: [],
          subtotal: 100,
          taxRate: 0,
          taxAmount: 0,
          total: 100,
          status: 'draft',
        })
      }

      const estimates = await getRecentEstimates(3)
      expect(estimates.length).toBe(3)
    })
  })
})
