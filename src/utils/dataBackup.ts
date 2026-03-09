import type { SubLinkDB } from '../db'

export interface BackupData {
  projects: SubLinkDB['projects']['value'][]
  waivers: SubLinkDB['waivers']['value'][]
  certificates: SubLinkDB['certificates']['value'][]
  tasks: SubLinkDB['tasks']['value'][]
  photos: SubLinkDB['photos']['value'][]
  dailyLogs: SubLinkDB['dailyLogs']['value'][]
  timeEntries: SubLinkDB['timeEntries']['value'][]
  invoices: SubLinkDB['invoices']['value'][]
  payments: SubLinkDB['payments']['value'][]
}

export interface BackupSummary {
  projects: number
  waivers: number
  certificates: number
  tasks: number
  photos: number
  dailyLogs: number
  timeEntries: number
  invoices: number
  payments: number
}

export interface BackupFile {
  version: string
  appVersion: string
  exportedAt: string
  checksum: string
  summary: BackupSummary
  data: BackupData
}

export const BACKUP_VERSION = '1.0'
export const APP_VERSION = '1.2.0'

async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createBackupFile(data: BackupData): Promise<BackupFile> {
  const summary: BackupSummary = {
    projects: data.projects.length,
    waivers: data.waivers.length,
    certificates: data.certificates.length,
    tasks: data.tasks.length,
    photos: data.photos.length,
    dailyLogs: data.dailyLogs.length,
    timeEntries: data.timeEntries.length,
    invoices: data.invoices.length,
    payments: data.payments?.length || 0,
  }

  const backupWithoutChecksum: Omit<BackupFile, 'checksum'> = {
    version: BACKUP_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    summary,
    data,
  }

  const dataString = JSON.stringify(backupWithoutChecksum)
  const checksum = await generateChecksum(dataString)

  return {
    ...backupWithoutChecksum,
    checksum,
  }
}

export function downloadBackup(backup: BackupFile): void {
  const jsonString = JSON.stringify(backup, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `sublink-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function parseBackupFile(file: File): Promise<BackupFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const backup = JSON.parse(content) as BackupFile
        
        if (!backup.version || !backup.data || !backup.checksum) {
          reject(new Error('Invalid backup file format'))
          return
        }

        resolve(backup)
      } catch {
        reject(new Error('Failed to parse backup file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export async function verifyChecksum(backup: BackupFile): Promise<boolean> {
  const { checksum, ...backupWithoutChecksum } = backup
  const dataString = JSON.stringify(backupWithoutChecksum)
  const computedChecksum = await generateChecksum(dataString)
  return checksum === computedChecksum
}

export function formatBackupDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function getBackupSize(backup: BackupFile): number {
  return new Blob([JSON.stringify(backup)]).size
}

const LAST_BACKUP_KEY = 'sublink_last_backup'

export function saveLastBackupInfo(backup: BackupFile): void {
  localStorage.setItem(LAST_BACKUP_KEY, JSON.stringify({
    date: backup.exportedAt,
    summary: backup.summary,
  }))
}

export function getLastBackupInfo(): { date: string; summary: BackupSummary } | null {
  const stored = localStorage.getItem(LAST_BACKUP_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function daysSinceLastBackup(): number | null {
  const info = getLastBackupInfo()
  if (!info) return null
  const lastDate = new Date(info.date)
  const now = new Date()
  const diffMs = now.getTime() - lastDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
