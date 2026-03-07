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
}

export type Waiver = SubLinkDB['waivers']['value']
export type Certificate = SubLinkDB['certificates']['value']

let db: IDBPDatabase<SubLinkDB>

export const initDB = async () => {
  db = await openDB<SubLinkDB>('sublink-db', 2, {
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
