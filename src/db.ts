import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

export interface SubLinkDB extends DBSchema {
  waivers: {
    key: string
    value: {
      id: string
      projectName: string
      subcontractorName: string
      amount: string
      date: string
      signature: string
      createdAt: number
    }
  }
  certificates: {
    key: string
    value: {
      id: string
      insuranceCompany: string
      policyNumber: string
      policyType: string
      effectiveDate: string
      expirationDate: string
      coverageAmount: string
      notes?: string
      createdAt: number
      updatedAt: number
    }
  }
  tasks: {
    key: string
    value: {
      id: string
      title: string
      description: string
      contractReference?: string
      createdAt: number
      updatedAt: number
    }
  }
  photos: {
    key: string
    value: {
      id: string
      taskId: string
      imageData: string
      latitude?: number
      longitude?: number
      capturedAt: number
      watermarkData: string
    }
    indexes: { 'by-task': string }
  }
}

export type Waiver = SubLinkDB['waivers']['value']
export type Certificate = SubLinkDB['certificates']['value']
export type Task = SubLinkDB['tasks']['value']
export type TaskPhoto = SubLinkDB['photos']['value']

let db: IDBPDatabase<SubLinkDB>

export const initDB = async () => {
  db = await openDB<SubLinkDB>('sublink-db', 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('waivers', {
          keyPath: 'id',
        })
      }
      if (oldVersion < 2) {
        db.createObjectStore('certificates', {
          keyPath: 'id',
        })
      }
      if (oldVersion < 3) {
        db.createObjectStore('tasks', {
          keyPath: 'id',
        })
        const photoStore = db.createObjectStore('photos', {
          keyPath: 'id',
        })
        photoStore.createIndex('by-task', 'taskId')
      }
    },
  })
}

export const saveWaiver = async (waiver: Omit<SubLinkDB['waivers']['value'], 'id' | 'createdAt'>) => {
  const id = crypto.randomUUID()
  const createdAt = Date.now()
  await db.put('waivers', { ...waiver, id, createdAt })
}

export const getWaivers = async () => {
  return await db.getAll('waivers')
}

export const saveCOI = async (coi: Omit<SubLinkDB['certificates']['value'], 'id' | 'createdAt' | 'updatedAt'>) => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('certificates', { ...coi, id, createdAt: now, updatedAt: now })
  return id
}

export const getCOIs = async () => {
  return await db.getAll('certificates')
}

export const updateCOI = async (id: string, updates: Partial<Omit<SubLinkDB['certificates']['value'], 'id' | 'createdAt'>>) => {
  const existing = await db.get('certificates', id)
  if (!existing) throw new Error('COI not found')
  await db.put('certificates', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteCOI = async (id: string) => {
  await db.delete('certificates', id)
}

export const saveTask = async (task: Omit<SubLinkDB['tasks']['value'], 'id' | 'createdAt' | 'updatedAt'>) => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('tasks', { ...task, id, createdAt: now, updatedAt: now })
  return id
}

export const getTasks = async () => {
  return await db.getAll('tasks')
}

export const getTask = async (id: string) => {
  return await db.get('tasks', id)
}

export const updateTask = async (id: string, updates: Partial<Omit<SubLinkDB['tasks']['value'], 'id' | 'createdAt'>>) => {
  const existing = await db.get('tasks', id)
  if (!existing) throw new Error('Task not found')
  await db.put('tasks', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteTask = async (id: string) => {
  await deletePhotosByTask(id)
  await db.delete('tasks', id)
}

export const savePhoto = async (photo: Omit<SubLinkDB['photos']['value'], 'id'>) => {
  const id = crypto.randomUUID()
  await db.put('photos', { ...photo, id })
  return id
}

export const getPhotosByTask = async (taskId: string) => {
  const photos = await db.getAllFromIndex('photos', 'by-task', taskId)
  return photos.sort((a, b) => a.capturedAt - b.capturedAt)
}

export const deletePhotosByTask = async (taskId: string) => {
  const photos = await db.getAllFromIndex('photos', 'by-task', taskId)
  for (const photo of photos) {
    await db.delete('photos', photo.id)
  }
}

export const getPhotoCountByTask = async (taskId: string) => {
  const photos = await db.getAllFromIndex('photos', 'by-task', taskId)
  return photos.length
}

export const clearDatabase = async () => {
  await db.clear('waivers')
  await db.clear('certificates')
  await db.clear('tasks')
  await db.clear('photos')
}
