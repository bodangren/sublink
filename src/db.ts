import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

interface SubLinkDB extends DBSchema {
  waivers: {
    key: string
    value: {
      id: string
      projectName: string
      subcontractorName: string
      amount: string
      date: string
      signature: string // Base64
      createdAt: number
    }
  }
}

let db: IDBPDatabase<SubLinkDB>

export const initDB = async () => {
  db = await openDB<SubLinkDB>('sublink-db', 1, {
    upgrade(db) {
      db.createObjectStore('waivers', {
        keyPath: 'id',
      })
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
