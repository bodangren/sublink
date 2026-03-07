import { describe, it, expect, beforeEach } from 'vitest'
import { initDB, saveTask, getTasks, getTask, updateTask, deleteTask, savePhoto, getPhotosByTask, deletePhotosByTask, clearDatabase } from './db'
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
