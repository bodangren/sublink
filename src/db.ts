import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

export type ExpenseCategory = 'materials' | 'fuel' | 'equipment_rental' | 'subcontractor' | 'other'

export interface InvoiceLineItem {
  id: string
  type: 'time' | 'custom' | 'expense'
  description: string
  quantity: number
  rate: number
  amount: number
  timeEntryId?: string
  expenseId?: string
}

export interface SubLinkDB extends DBSchema {
  projects: {
    key: string
    value: {
      id: string
      name: string
      client?: string
      address?: string
      contractValue?: string
      startDate?: string
      endDate?: string
      notes?: string
      createdAt: number
      updatedAt: number
    }
  }
  waivers: {
    key: string
    value: {
      id: string
      projectName: string
      projectId?: string
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
      projectId?: string
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
  dailyLogs: {
    key: string
    value: {
      id: string
      date: string
      project: string
      projectId?: string
      weather: string
      workPerformed: string
      delays?: string
      personnel: string
      equipment?: string
      notes?: string
      createdAt: number
      updatedAt: number
    }
  }
  timeEntries: {
    key: string
    value: {
      id: string
      projectId: string
      taskId?: string
      startTime: number
      endTime: number
      duration: number
      notes?: string
      createdAt: number
      updatedAt: number
    }
    indexes: { 'by-project': string, 'by-date': string }
  }
  invoices: {
    key: string
    value: {
      id: string
      invoiceNumber: string
      projectId?: string
      projectName?: string
      clientName: string
      clientEmail?: string
      clientAddress?: string
      issueDate: string
      dueDate: string
      lineItems: InvoiceLineItem[]
      subtotal: number
      taxRate: number
      taxAmount: number
      total: number
      notes?: string
      status: 'draft' | 'pending' | 'paid' | 'overdue'
      paidAt?: number
      createdAt: number
      updatedAt: number
    }
    indexes: { 'by-status': string, 'by-project': string }
  }
  expenses: {
    key: string
    value: {
      id: string
      projectId?: string
      taskId?: string
      description: string
      category: ExpenseCategory
      amount: number
      vendor?: string
      receiptPhoto?: string
      date: string
      billable: boolean
      invoiceId?: string
      notes?: string
      createdAt: number
      updatedAt: number
    }
    indexes: { 'by-project': string, 'by-date': string, 'by-invoice': string }
  }
}

export type Project = SubLinkDB['projects']['value']
export type Waiver = SubLinkDB['waivers']['value']
export type Certificate = SubLinkDB['certificates']['value']
export type Task = SubLinkDB['tasks']['value']
export type TaskPhoto = SubLinkDB['photos']['value']
export type DailyLog = SubLinkDB['dailyLogs']['value']
export type TimeEntry = SubLinkDB['timeEntries']['value']
export type Invoice = SubLinkDB['invoices']['value']
export type Expense = SubLinkDB['expenses']['value']

let db: IDBPDatabase<SubLinkDB>

export const initDB = async () => {
  db = await openDB<SubLinkDB>('sublink-db', 8, {
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
      if (oldVersion < 4) {
        db.createObjectStore('dailyLogs', {
          keyPath: 'id',
        })
      }
      if (oldVersion < 5) {
        db.createObjectStore('projects', {
          keyPath: 'id',
        })
      }
      if (oldVersion < 6) {
        const timeStore = db.createObjectStore('timeEntries', {
          keyPath: 'id',
        })
        timeStore.createIndex('by-project', 'projectId')
        timeStore.createIndex('by-date', 'startTime')
      }
      if (oldVersion < 7) {
        const invoiceStore = db.createObjectStore('invoices', {
          keyPath: 'id',
        })
        invoiceStore.createIndex('by-status', 'status')
        invoiceStore.createIndex('by-project', 'projectId')
      }
      if (oldVersion < 8) {
        const expenseStore = db.createObjectStore('expenses', {
          keyPath: 'id',
        })
        expenseStore.createIndex('by-project', 'projectId')
        expenseStore.createIndex('by-date', 'date')
        expenseStore.createIndex('by-invoice', 'invoiceId')
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
  await db.clear('dailyLogs')
  await db.clear('projects')
  await db.clear('timeEntries')
  await db.clear('invoices')
  await db.clear('expenses')
}

export const saveProject = async (project: Omit<SubLinkDB['projects']['value'], 'id' | 'createdAt' | 'updatedAt'>) => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('projects', { ...project, id, createdAt: now, updatedAt: now })
  return id
}

export const getProjects = async () => {
  return await db.getAll('projects')
}

export const getProject = async (id: string) => {
  return await db.get('projects', id)
}

export const updateProject = async (id: string, updates: Partial<Omit<SubLinkDB['projects']['value'], 'id' | 'createdAt'>>) => {
  const existing = await db.get('projects', id)
  if (!existing) throw new Error('Project not found')
  await db.put('projects', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteProject = async (id: string) => {
  await db.delete('projects', id)
}

export const getTasksByProject = async (projectId: string) => {
  const tasks = await db.getAll('tasks')
  return tasks.filter(task => task.projectId === projectId)
}

export const getDailyLogsByProject = async (projectId: string) => {
  const logs = await db.getAll('dailyLogs')
  return logs.filter(log => log.projectId === projectId)
}

export const getWaiversByProject = async (projectId: string) => {
  const waivers = await db.getAll('waivers')
  return waivers.filter(waiver => waiver.projectId === projectId)
}

export const saveDailyLog = async (log: Omit<SubLinkDB['dailyLogs']['value'], 'id' | 'createdAt' | 'updatedAt'>) => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('dailyLogs', { ...log, id, createdAt: now, updatedAt: now })
  return id
}

export const getDailyLogs = async () => {
  return await db.getAll('dailyLogs')
}

export const getDailyLog = async (id: string) => {
  return await db.get('dailyLogs', id)
}

export const updateDailyLog = async (id: string, updates: Partial<Omit<SubLinkDB['dailyLogs']['value'], 'id' | 'createdAt'>>) => {
  const existing = await db.get('dailyLogs', id)
  if (!existing) throw new Error('Daily log not found')
  await db.put('dailyLogs', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteDailyLog = async (id: string) => {
  await db.delete('dailyLogs', id)
}

export const getDailyLogByDate = async (date: string) => {
  const logs = await db.getAll('dailyLogs')
  return logs.find(log => log.date === date)
}

export const saveTimeEntry = async (entry: Omit<SubLinkDB['timeEntries']['value'], 'id' | 'createdAt' | 'updatedAt'>) => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('timeEntries', { ...entry, id, createdAt: now, updatedAt: now })
  return id
}

export const getTimeEntries = async () => {
  return await db.getAll('timeEntries')
}

export const getTimeEntry = async (id: string) => {
  return await db.get('timeEntries', id)
}

export const updateTimeEntry = async (id: string, updates: Partial<Omit<SubLinkDB['timeEntries']['value'], 'id' | 'createdAt'>>) => {
  const existing = await db.get('timeEntries', id)
  if (!existing) throw new Error('Time entry not found')
  await db.put('timeEntries', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteTimeEntry = async (id: string) => {
  await db.delete('timeEntries', id)
}

export const getTimeEntriesByProject = async (projectId: string) => {
  const entries = await db.getAll('timeEntries')
  return entries.filter(entry => entry.projectId === projectId)
}

export const getTodaysTimeEntries = async () => {
  const entries = await db.getAll('timeEntries')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000
  return entries.filter(entry => entry.startTime >= todayStart && entry.startTime < todayEnd)
}

export const getTotalDurationToday = async () => {
  const entries = await getTodaysTimeEntries()
  return entries.reduce((total, entry) => total + entry.duration, 0)
}

export const getNextInvoiceNumber = async (): Promise<string> => {
  const invoices = await db.getAll('invoices')
  if (invoices.length === 0) {
    return 'INV-001'
  }
  const numbers = invoices
    .map(inv => {
      const match = inv.invoiceNumber.match(/INV-(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter(n => !isNaN(n))
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0
  return `INV-${String(maxNum + 1).padStart(3, '0')}`
}

export const saveInvoice = async (
  invoice: Omit<SubLinkDB['invoices']['value'], 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>
): Promise<{ id: string; invoiceNumber: string }> => {
  const id = crypto.randomUUID()
  const invoiceNumber = await getNextInvoiceNumber()
  const now = Date.now()
  await db.put('invoices', { ...invoice, id, invoiceNumber, createdAt: now, updatedAt: now })
  return { id, invoiceNumber }
}

export const getInvoices = async (): Promise<Invoice[]> => {
  return await db.getAll('invoices')
}

export const getInvoice = async (id: string): Promise<Invoice | undefined> => {
  return await db.get('invoices', id)
}

export const updateInvoice = async (
  id: string,
  updates: Partial<Omit<SubLinkDB['invoices']['value'], 'id' | 'invoiceNumber' | 'createdAt'>>
): Promise<void> => {
  const existing = await db.get('invoices', id)
  if (!existing) throw new Error('Invoice not found')
  await db.put('invoices', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteInvoice = async (id: string): Promise<void> => {
  await db.delete('invoices', id)
}

export const getInvoicesByStatus = async (status: Invoice['status']): Promise<Invoice[]> => {
  return await db.getAllFromIndex('invoices', 'by-status', status)
}

export const getInvoicesByProject = async (projectId: string): Promise<Invoice[]> => {
  return await db.getAllFromIndex('invoices', 'by-project', projectId)
}

export const getUnpaidInvoices = async (): Promise<Invoice[]> => {
  const invoices = await db.getAll('invoices')
  return invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue')
}

export const markInvoicePaid = async (id: string): Promise<void> => {
  const existing = await db.get('invoices', id)
  if (!existing) throw new Error('Invoice not found')
  await db.put('invoices', {
    ...existing,
    status: 'paid',
    paidAt: Date.now(),
    updatedAt: Date.now(),
  })
}

export const saveExpense = async (
  expense: Omit<SubLinkDB['expenses']['value'], 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('expenses', { ...expense, id, createdAt: now, updatedAt: now })
  return id
}

export const getExpenses = async (): Promise<Expense[]> => {
  return await db.getAll('expenses')
}

export const getExpense = async (id: string): Promise<Expense | undefined> => {
  return await db.get('expenses', id)
}

export const updateExpense = async (
  id: string,
  updates: Partial<Omit<SubLinkDB['expenses']['value'], 'id' | 'createdAt'>>
): Promise<void> => {
  const existing = await db.get('expenses', id)
  if (!existing) throw new Error('Expense not found')
  await db.put('expenses', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteExpense = async (id: string): Promise<void> => {
  await db.delete('expenses', id)
}

export const getExpensesByProject = async (projectId: string): Promise<Expense[]> => {
  return await db.getAllFromIndex('expenses', 'by-project', projectId)
}

export const getExpensesByInvoice = async (invoiceId: string): Promise<Expense[]> => {
  return await db.getAllFromIndex('expenses', 'by-invoice', invoiceId)
}

export const getBillableExpenses = async (): Promise<Expense[]> => {
  const expenses = await db.getAll('expenses')
  return expenses.filter(exp => exp.billable && !exp.invoiceId)
}

export const linkExpenseToInvoice = async (expenseId: string, invoiceId: string): Promise<void> => {
  const existing = await db.get('expenses', expenseId)
  if (!existing) throw new Error('Expense not found')
  await db.put('expenses', { ...existing, invoiceId, updatedAt: Date.now() })
}

export const getTotalExpensesByProject = async (projectId: string): Promise<number> => {
  const expenses = await getExpensesByProject(projectId)
  return expenses.reduce((total, exp) => total + exp.amount, 0)
}

export const exportAllData = async () => {
  const [projects, waivers, certificates, tasks, photos, dailyLogs, timeEntries, invoices, expenses] = await Promise.all([
    db.getAll('projects'),
    db.getAll('waivers'),
    db.getAll('certificates'),
    db.getAll('tasks'),
    db.getAll('photos'),
    db.getAll('dailyLogs'),
    db.getAll('timeEntries'),
    db.getAll('invoices'),
    db.getAll('expenses'),
  ])
  
  return {
    projects,
    waivers,
    certificates,
    tasks,
    photos,
    dailyLogs,
    timeEntries,
    invoices,
    expenses,
  }
}

type StoreName = 'projects' | 'waivers' | 'certificates' | 'tasks' | 'photos' | 'dailyLogs' | 'timeEntries' | 'invoices' | 'expenses'

export interface RestoreData {
  projects?: SubLinkDB['projects']['value'][]
  waivers?: SubLinkDB['waivers']['value'][]
  certificates?: SubLinkDB['certificates']['value'][]
  tasks?: SubLinkDB['tasks']['value'][]
  photos?: SubLinkDB['photos']['value'][]
  dailyLogs?: SubLinkDB['dailyLogs']['value'][]
  timeEntries?: SubLinkDB['timeEntries']['value'][]
  invoices?: SubLinkDB['invoices']['value'][]
  expenses?: SubLinkDB['expenses']['value'][]
}

export const restoreData = async (data: RestoreData, mode: 'replace' | 'merge' = 'replace'): Promise<void> => {
  if (mode === 'replace') {
    await clearDatabase()
  }
  
  const stores: StoreName[] = ['projects', 'waivers', 'certificates', 'tasks', 'photos', 'dailyLogs', 'timeEntries', 'invoices', 'expenses']
  
  for (const storeName of stores) {
    const items = data[storeName]
    if (items && items.length > 0) {
      if (mode === 'merge') {
        for (const item of items) {
          const existing = await db.get(storeName, item.id)
          if (!existing) {
            await db.put(storeName, item)
          }
        }
      } else {
        for (const item of items) {
          await db.put(storeName, item)
        }
      }
    }
  }
}
