import {
  getCOIs,
  getInvoices,
  getProjects,
  getAllNotifications,
  saveNotification,
  deleteNotification,
  type NotificationType,
  type NotificationPriority,
} from '../db'

const COI_WARNING_DAYS = 7
const PROJECT_WARNING_DAYS = 3

function getDaysUntil(dateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(dateString)
  targetDate.setHours(0, 0, 0, 0)
  const diffTime = targetDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

async function removeExistingNotification(entityType: string, entityId: string, type: NotificationType): Promise<void> {
  const existing = await getAllNotifications()
  const toDelete = existing.find(
    n => n.entityType === entityType && n.entityId === entityId && n.type === type
  )
  if (toDelete) {
    await deleteNotification(toDelete.id)
  }
}

export async function generateCOINotifications(): Promise<void> {
  const cois = await getCOIs()
  
  for (const coi of cois) {
    const daysUntilExpiration = getDaysUntil(coi.expirationDate)
    
    await removeExistingNotification('certificate', coi.id, 'coi_expiration')
    
    if (daysUntilExpiration <= COI_WARNING_DAYS) {
      const priority: NotificationPriority = daysUntilExpiration < 0 ? 'high' : 'medium'
      const message = daysUntilExpiration < 0
        ? `Certificate ${coi.policyNumber} expired ${Math.abs(daysUntilExpiration)} days ago`
        : `Certificate ${coi.policyNumber} expires in ${daysUntilExpiration} days`
      
      await saveNotification({
        type: 'coi_expiration',
        title: 'COI Expiration Warning',
        message,
        entityType: 'certificate',
        entityId: coi.id,
        priority,
        read: false,
      })
    }
  }
}

export async function generateInvoiceNotifications(): Promise<void> {
  const invoices = await getInvoices()
  
  for (const invoice of invoices) {
    if (invoice.status === 'paid' || invoice.status === 'draft') continue
    
    const daysUntilDue = getDaysUntil(invoice.dueDate)
    
    await removeExistingNotification('invoice', invoice.id, 'invoice_overdue')
    
    if (daysUntilDue < 0) {
      await saveNotification({
        type: 'invoice_overdue',
        title: 'Invoice Overdue',
        message: `Invoice ${invoice.invoiceNumber} from ${invoice.clientName} is ${Math.abs(daysUntilDue)} days overdue`,
        entityType: 'invoice',
        entityId: invoice.id,
        priority: 'high',
        read: false,
      })
    }
  }
}

export async function generateProjectNotifications(): Promise<void> {
  const projects = await getProjects()
  
  for (const project of projects) {
    if (!project.endDate) continue
    
    const daysUntilEnd = getDaysUntil(project.endDate)
    
    await removeExistingNotification('project', project.id, 'project_deadline')
    
    if (daysUntilEnd <= PROJECT_WARNING_DAYS) {
      const priority: NotificationPriority = daysUntilEnd < 0 ? 'high' : 'medium'
      const message = daysUntilEnd < 0
        ? `Project "${project.name}" was due ${Math.abs(daysUntilEnd)} days ago`
        : `Project "${project.name}" ends in ${daysUntilEnd} days`
      
      await saveNotification({
        type: 'project_deadline',
        title: 'Project Deadline',
        message,
        entityType: 'project',
        entityId: project.id,
        priority,
        read: false,
      })
    }
  }
}

export async function generateAllNotifications(): Promise<void> {
  await generateCOINotifications()
  await generateInvoiceNotifications()
  await generateProjectNotifications()
}
