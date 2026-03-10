import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

export type ExpenseCategory = 'materials' | 'fuel' | 'equipment_rental' | 'subcontractor' | 'other'
export type PaymentMethod = 'check' | 'cash' | 'ach' | 'credit_card' | 'other'
export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'converted'

export interface Client {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface EstimateLineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

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
  clients: {
    key: string
    value: Client
    indexes: { 'by-name': string }
  }
  projects: {
    key: string
    value: {
      id: string
      name: string
      client?: string
      clientId?: string
      address?: string
      contractValue?: string
      startDate?: string
      endDate?: string
      notes?: string
      createdAt: number
      updatedAt: number
    }
    indexes: { 'by-client': string }
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
      taskId?: string
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
      photoIds?: string[]
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
      clientId?: string
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
    indexes: { 'by-status': string, 'by-project': string, 'by-client': string }
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
  payments: {
    key: string
    value: {
      id: string
      invoiceId: string
      amount: number
      date: string
      method: PaymentMethod
      referenceNumber?: string
      notes?: string
      createdAt: number
      updatedAt: number
    }
    indexes: { 'by-invoice': string, 'by-date': string }
  }
  estimates: {
    key: string
    value: {
      id: string
      estimateNumber: string
      projectId?: string
      projectName?: string
      clientId?: string
      clientName: string
      clientEmail?: string
      clientAddress?: string
      issueDate: string
      validUntilDate: string
      lineItems: EstimateLineItem[]
      subtotal: number
      taxRate: number
      taxAmount: number
      total: number
      notes?: string
      status: EstimateStatus
      convertedToInvoiceId?: string
      createdAt: number
      updatedAt: number
    }
    indexes: { 'by-status': string, 'by-project': string, 'by-client': string }
  }
  mileageEntries: {
    key: string
    value: {
      id: string
      projectId?: string
      projectName?: string
      date: string
      startLocation: string
      endLocation: string
      startCoords?: { lat: number; lng: number }
      endCoords?: { lat: number; lng: number }
      miles: number
      purpose?: string
      notes?: string
      isRoundTrip: boolean
      createdAt: number
      updatedAt: number
    }
    indexes: { 'by-project': string, 'by-date': string }
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
export type Payment = SubLinkDB['payments']['value']
export type Estimate = SubLinkDB['estimates']['value']
export type MileageEntry = SubLinkDB['mileageEntries']['value']

let db: IDBPDatabase<SubLinkDB>

export const initDB = async () => {
  db = await openDB<SubLinkDB>('sublink-db', 12, {
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
      if (oldVersion < 9) {
        const paymentStore = db.createObjectStore('payments', {
          keyPath: 'id',
        })
        paymentStore.createIndex('by-invoice', 'invoiceId')
        paymentStore.createIndex('by-date', 'date')
      }
      if (oldVersion < 10) {
        const estimateStore = db.createObjectStore('estimates', {
          keyPath: 'id',
        })
        estimateStore.createIndex('by-status', 'status')
        estimateStore.createIndex('by-project', 'projectId')
      }
      if (oldVersion < 11) {
        const mileageStore = db.createObjectStore('mileageEntries', {
          keyPath: 'id',
        })
        mileageStore.createIndex('by-project', 'projectId')
        mileageStore.createIndex('by-date', 'date')
      }
      if (oldVersion < 12) {
        const clientStore = db.createObjectStore('clients', {
          keyPath: 'id',
        })
        clientStore.createIndex('by-name', 'name')
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

export const saveClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('clients', { ...client, id, createdAt: now, updatedAt: now })
  return id
}

export const getClients = async (): Promise<Client[]> => {
  return await db.getAll('clients')
}

export const getClient = async (id: string): Promise<Client | undefined> => {
  return await db.get('clients', id)
}

export const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<void> => {
  const existing = await db.get('clients', id)
  if (!existing) throw new Error('Client not found')
  await db.put('clients', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteClient = async (id: string): Promise<void> => {
  await db.delete('clients', id)
}

export const searchClients = async (query: string): Promise<Client[]> => {
  const clients = await db.getAll('clients')
  const lowerQuery = query.toLowerCase()
  return clients.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.contactPerson?.toLowerCase().includes(lowerQuery) ||
    c.email?.toLowerCase().includes(lowerQuery)
  )
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
  await db.clear('payments')
  await db.clear('estimates')
  await db.clear('mileageEntries')
  await db.clear('clients')
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

export const getProjectsByClient = async (clientId: string): Promise<Project[]> => {
  const projects = await db.getAll('projects')
  return projects.filter(project => project.clientId === clientId)
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

export const getPhotosByDailyLog = async (logId: string) => {
  const log = await db.get('dailyLogs', logId)
  if (!log || !log.photoIds || log.photoIds.length === 0) {
    return []
  }
  
  const photos = await Promise.all(
    log.photoIds.map(photoId => db.get('photos', photoId))
  )
  
  return photos.filter((photo): photo is NonNullable<typeof photo> => photo !== undefined)
    .sort((a, b) => a.capturedAt - b.capturedAt)
}

export const getPhotoCountByDailyLog = async (logId: string) => {
  const log = await db.get('dailyLogs', logId)
  if (!log || !log.photoIds) {
    return 0
  }
  return log.photoIds.length
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

export const getInvoicesByClient = async (clientId: string): Promise<Invoice[]> => {
  const invoices = await db.getAll('invoices')
  return invoices.filter(inv => inv.clientId === clientId)
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

export const savePayment = async (
  payment: Omit<SubLinkDB['payments']['value'], 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('payments', { ...payment, id, createdAt: now, updatedAt: now })
  return id
}

export const getPayments = async (): Promise<Payment[]> => {
  return await db.getAll('payments')
}

export const getPayment = async (id: string): Promise<Payment | undefined> => {
  return await db.get('payments', id)
}

export const getPaymentsByInvoice = async (invoiceId: string): Promise<Payment[]> => {
  return await db.getAllFromIndex('payments', 'by-invoice', invoiceId)
}

export const updatePayment = async (
  id: string,
  updates: Partial<Omit<SubLinkDB['payments']['value'], 'id' | 'createdAt'>>
): Promise<void> => {
  const existing = await db.get('payments', id)
  if (!existing) throw new Error('Payment not found')
  await db.put('payments', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deletePayment = async (id: string): Promise<void> => {
  await db.delete('payments', id)
}

export const getTotalPaidByInvoice = async (invoiceId: string): Promise<number> => {
  const payments = await getPaymentsByInvoice(invoiceId)
  return payments.reduce((total, payment) => total + payment.amount, 0)
}

export const getRecentPayments = async (limit: number = 5): Promise<Payment[]> => {
  const payments = await db.getAll('payments')
  return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}

export const getNextEstimateNumber = async (): Promise<string> => {
  const estimates = await db.getAll('estimates')
  if (estimates.length === 0) {
    return 'EST-001'
  }
  const numbers = estimates
    .map(est => {
      const match = est.estimateNumber.match(/EST-(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter(n => !isNaN(n))
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0
  return `EST-${String(maxNum + 1).padStart(3, '0')}`
}

export const saveEstimate = async (
  estimate: Omit<SubLinkDB['estimates']['value'], 'id' | 'estimateNumber' | 'createdAt' | 'updatedAt'>
): Promise<{ id: string; estimateNumber: string }> => {
  const id = crypto.randomUUID()
  const estimateNumber = await getNextEstimateNumber()
  const now = Date.now()
  await db.put('estimates', { ...estimate, id, estimateNumber, createdAt: now, updatedAt: now })
  return { id, estimateNumber }
}

export const getEstimates = async (): Promise<Estimate[]> => {
  return await db.getAll('estimates')
}

export const getEstimate = async (id: string): Promise<Estimate | undefined> => {
  return await db.get('estimates', id)
}

export const updateEstimate = async (
  id: string,
  updates: Partial<Omit<SubLinkDB['estimates']['value'], 'id' | 'estimateNumber' | 'createdAt'>>
): Promise<void> => {
  const existing = await db.get('estimates', id)
  if (!existing) throw new Error('Estimate not found')
  await db.put('estimates', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteEstimate = async (id: string): Promise<void> => {
  await db.delete('estimates', id)
}

export const updateEstimateStatus = async (id: string, status: EstimateStatus): Promise<void> => {
  const existing = await db.get('estimates', id)
  if (!existing) throw new Error('Estimate not found')
  await db.put('estimates', { ...existing, status, updatedAt: Date.now() })
}

export const convertEstimateToInvoice = async (estimateId: string): Promise<{ invoiceId: string; invoiceNumber: string }> => {
  const estimate = await db.get('estimates', estimateId)
  if (!estimate) throw new Error('Estimate not found')
  
  const invoiceLineItems: InvoiceLineItem[] = estimate.lineItems.map(item => ({
    id: crypto.randomUUID(),
    type: 'custom' as const,
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.amount,
  }))
  
  const invoiceResult = await saveInvoice({
    projectId: estimate.projectId,
    projectName: estimate.projectName,
    clientName: estimate.clientName,
    clientEmail: estimate.clientEmail,
    clientAddress: estimate.clientAddress,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: invoiceLineItems,
    subtotal: estimate.subtotal,
    taxRate: estimate.taxRate,
    taxAmount: estimate.taxAmount,
    total: estimate.total,
    notes: estimate.notes,
    status: 'pending',
  })
  
  await updateEstimate(estimateId, {
    status: 'converted',
    convertedToInvoiceId: invoiceResult.id,
  })
  
  return { invoiceId: invoiceResult.id, invoiceNumber: invoiceResult.invoiceNumber }
}

export const getEstimatesByStatus = async (status: EstimateStatus): Promise<Estimate[]> => {
  return await db.getAllFromIndex('estimates', 'by-status', status)
}

export const getEstimatesByProject = async (projectId: string): Promise<Estimate[]> => {
  return await db.getAllFromIndex('estimates', 'by-project', projectId)
}

export const getEstimatesByClient = async (clientId: string): Promise<Estimate[]> => {
  const estimates = await db.getAll('estimates')
  return estimates.filter(est => est.clientId === clientId)
}

export const getRecentEstimates = async (limit: number = 5): Promise<Estimate[]> => {
  const estimates = await db.getAll('estimates')
  return estimates.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
}

export const saveMileage = async (mileage: Omit<MileageEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> => {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.put('mileageEntries', { ...mileage, id, createdAt: now, updatedAt: now })
  return { id }
}

export const getMileage = async (id: string): Promise<MileageEntry | undefined> => {
  return await db.get('mileageEntries', id)
}

export const getAllMileage = async (): Promise<MileageEntry[]> => {
  return await db.getAll('mileageEntries')
}

export const updateMileage = async (id: string, updates: Partial<Omit<MileageEntry, 'id' | 'createdAt'>>): Promise<void> => {
  const existing = await db.get('mileageEntries', id)
  if (!existing) throw new Error('Mileage entry not found')
  await db.put('mileageEntries', { ...existing, ...updates, updatedAt: Date.now() })
}

export const deleteMileage = async (id: string): Promise<void> => {
  await db.delete('mileageEntries', id)
}

export const getMileageByProject = async (projectId: string): Promise<MileageEntry[]> => {
  return await db.getAllFromIndex('mileageEntries', 'by-project', projectId)
}

export const getMileageByDateRange = async (startDate: string, endDate: string): Promise<MileageEntry[]> => {
  const allMileage = await db.getAll('mileageEntries')
  return allMileage.filter(entry => entry.date >= startDate && entry.date <= endDate)
}

export const getRecentMileage = async (limit: number = 5): Promise<MileageEntry[]> => {
  const mileage = await db.getAll('mileageEntries')
  return mileage.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
}

export const exportAllData = async () => {
  const [projects, waivers, certificates, tasks, photos, dailyLogs, timeEntries, invoices, expenses, payments, estimates, mileageEntries, clients] = await Promise.all([
    db.getAll('projects'),
    db.getAll('waivers'),
    db.getAll('certificates'),
    db.getAll('tasks'),
    db.getAll('photos'),
    db.getAll('dailyLogs'),
    db.getAll('timeEntries'),
    db.getAll('invoices'),
    db.getAll('expenses'),
    db.getAll('payments'),
    db.getAll('estimates'),
    db.getAll('mileageEntries'),
    db.getAll('clients'),
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
    payments,
    estimates,
    mileageEntries,
    clients,
  }
}

type StoreName = 'projects' | 'waivers' | 'certificates' | 'tasks' | 'photos' | 'dailyLogs' | 'timeEntries' | 'invoices' | 'expenses' | 'payments' | 'estimates' | 'mileageEntries' | 'clients'

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
  payments?: SubLinkDB['payments']['value'][]
  estimates?: SubLinkDB['estimates']['value'][]
  mileageEntries?: SubLinkDB['mileageEntries']['value'][]
  clients?: SubLinkDB['clients']['value'][]
}

export const restoreData = async (data: RestoreData, mode: 'replace' | 'merge' = 'replace'): Promise<void> => {
  if (mode === 'replace') {
    await clearDatabase()
  }
  
  const stores: StoreName[] = ['projects', 'waivers', 'certificates', 'tasks', 'photos', 'dailyLogs', 'timeEntries', 'invoices', 'expenses', 'payments', 'estimates', 'mileageEntries', 'clients']
  
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
