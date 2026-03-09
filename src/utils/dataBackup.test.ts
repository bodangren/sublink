import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createBackupFile,
  downloadBackup,
  parseBackupFile,
  verifyChecksum,
  formatBackupDate,
  formatFileSize,
  getBackupSize,
  saveLastBackupInfo,
  getLastBackupInfo,
  daysSinceLastBackup,
  BACKUP_VERSION,
  APP_VERSION,
} from './dataBackup'
import type { BackupData } from './dataBackup'

const mockBackupData: BackupData = {
  projects: [{ id: '1', name: 'Test Project', createdAt: Date.now(), updatedAt: Date.now() }],
  waivers: [],
  certificates: [],
  tasks: [],
  photos: [],
  dailyLogs: [],
  timeEntries: [],
  invoices: [],
  payments: [],
}

describe('dataBackup utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createBackupFile', () => {
    it('creates a backup file with correct structure', async () => {
      const backup = await createBackupFile(mockBackupData)

      expect(backup.version).toBe(BACKUP_VERSION)
      expect(backup.appVersion).toBe(APP_VERSION)
      expect(backup.exportedAt).toBeDefined()
      expect(backup.checksum).toBeDefined()
      expect(backup.summary).toBeDefined()
      expect(backup.data).toEqual(mockBackupData)
    })

    it('calculates correct summary counts', async () => {
      const data: BackupData = {
        projects: [
          { id: '1', name: 'Project 1', createdAt: 1, updatedAt: 1 },
          { id: '2', name: 'Project 2', createdAt: 2, updatedAt: 2 },
        ],
        waivers: [{ id: '1', projectName: 'Test', subcontractorName: 'Sub', amount: '100', date: '2024-01-01', signature: 'sig', createdAt: 1 }],
        certificates: [],
        tasks: [],
        photos: [],
        dailyLogs: [],
        timeEntries: [],
        invoices: [],
        payments: [],
      }

      const backup = await createBackupFile(data)

      expect(backup.summary.projects).toBe(2)
      expect(backup.summary.waivers).toBe(1)
      expect(backup.summary.certificates).toBe(0)
    })
  })

  describe('downloadBackup', () => {
    it('creates a download link with correct filename', async () => {
      const backup = await createBackupFile(mockBackupData)
      const linkSpy = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockReturnValue(linkSpy as unknown as HTMLAnchorElement)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => linkSpy as unknown as HTMLAnchorElement)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => linkSpy as unknown as HTMLAnchorElement)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      downloadBackup(backup)

      expect(linkSpy.download).toMatch(/sublink-backup-\d{4}-\d{2}-\d{2}\.json/)
      expect(linkSpy.click).toHaveBeenCalled()
    })
  })

  describe('parseBackupFile', () => {
    it('parses a valid backup file', async () => {
      const backup = await createBackupFile(mockBackupData)
      const jsonString = JSON.stringify(backup)
      const file = new File([jsonString], 'backup.json', { type: 'application/json' })

      const parsed = await parseBackupFile(file)

      expect(parsed.version).toBe(BACKUP_VERSION)
      expect(parsed.checksum).toBe(backup.checksum)
    })

    it('rejects invalid JSON', async () => {
      const file = new File(['not json'], 'backup.json', { type: 'application/json' })

      await expect(parseBackupFile(file)).rejects.toThrow('Failed to parse backup file')
    })

    it('rejects backup without required fields', async () => {
      const invalidBackup = { version: '1.0', data: {} }
      const file = new File([JSON.stringify(invalidBackup)], 'backup.json', { type: 'application/json' })

      await expect(parseBackupFile(file)).rejects.toThrow('Invalid backup file format')
    })
  })

  describe('verifyChecksum', () => {
    it('returns true for valid checksum', async () => {
      const backup = await createBackupFile(mockBackupData)
      const isValid = await verifyChecksum(backup)
      expect(isValid).toBe(true)
    })

    it('returns false for modified data', async () => {
      const backup = await createBackupFile(mockBackupData)
      backup.data.projects = []
      const isValid = await verifyChecksum(backup)
      expect(isValid).toBe(false)
    })
  })

  describe('formatBackupDate', () => {
    it('formats ISO date string to locale string', () => {
      const iso = '2024-01-15T10:30:00.000Z'
      const formatted = formatBackupDate(iso)
      expect(formatted).toContain('2024')
      expect(formatted).toContain('15')
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('formats kilobytes', () => {
      expect(formatFileSize(2048)).toBe('2.0 KB')
    })

    it('formats megabytes', () => {
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.00 MB')
    })
  })

  describe('getBackupSize', () => {
    it('returns the size of the backup JSON', async () => {
      const backup = await createBackupFile(mockBackupData)
      const size = getBackupSize(backup)
      expect(size).toBeGreaterThan(0)
    })
  })

  describe('last backup info', () => {
    it('saves and retrieves last backup info', async () => {
      const backup = await createBackupFile(mockBackupData)
      saveLastBackupInfo(backup)

      const info = getLastBackupInfo()
      expect(info).not.toBeNull()
      expect(info?.date).toBe(backup.exportedAt)
      expect(info?.summary).toEqual(backup.summary)
    })

    it('returns null when no backup info stored', () => {
      const info = getLastBackupInfo()
      expect(info).toBeNull()
    })
  })

  describe('daysSinceLastBackup', () => {
    it('returns null when no backup exists', () => {
      expect(daysSinceLastBackup()).toBeNull()
    })

    it('returns 0 for today backup', async () => {
      const backup = await createBackupFile(mockBackupData)
      saveLastBackupInfo(backup)
      expect(daysSinceLastBackup()).toBe(0)
    })

    it('returns correct days for old backup', () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 5)
      
      localStorage.setItem('sublink_last_backup', JSON.stringify({
        date: oldDate.toISOString(),
        summary: { projects: 0, waivers: 0, certificates: 0, tasks: 0, photos: 0, dailyLogs: 0, timeEntries: 0, invoices: 0, payments: 0 },
      }))

      expect(daysSinceLastBackup()).toBe(5)
    })
  })
})
