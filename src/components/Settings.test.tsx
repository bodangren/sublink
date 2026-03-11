import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Settings from './Settings'
import * as db from '../db'
import * as backup from '../utils/dataBackup'
import type { BackupFile } from '../utils/dataBackup'
import 'fake-indexeddb/auto'

vi.mock('../db', () => ({
  exportAllData: vi.fn(),
  restoreData: vi.fn(),
  getSetting: vi.fn(),
  setSetting: vi.fn(),
  DEFAULT_HOURLY_RATE: '75',
}))

vi.mock('../utils/dataBackup', () => ({
  createBackupFile: vi.fn(),
  downloadBackup: vi.fn(),
  parseBackupFile: vi.fn(),
  verifyChecksum: vi.fn(),
  formatBackupDate: vi.fn((d) => d),
  formatFileSize: vi.fn((s) => `${s} B`),
  getBackupSize: vi.fn(() => 1000),
  getLastBackupInfo: vi.fn(() => null),
  saveLastBackupInfo: vi.fn(),
  daysSinceLastBackup: vi.fn(() => null),
}))

const renderSettings = () => {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(db.getSetting).mockResolvedValue('75')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders settings page', () => {
    renderSettings()
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeDefined()
    expect(screen.getByText('Data Backup & Restore')).toBeDefined()
  })

  it('shows export button', () => {
    renderSettings()
    expect(screen.getByText('Export Data')).toBeDefined()
  })

  it('shows import button', () => {
    renderSettings()
    expect(screen.getByText('Select Backup File')).toBeDefined()
  })

  it('calls export functions when export button clicked', async () => {
    const mockData = { projects: [], waivers: [], certificates: [], tasks: [], photos: [], dailyLogs: [], timeEntries: [], invoices: [], expenses: [], payments: [], estimates: [], mileageEntries: [], clients: [] }
    const mockBackup = {
      version: '1.0',
      appVersion: '1.2.0',
      exportedAt: '2024-01-01T00:00:00.000Z',
      checksum: 'abc123',
      summary: { projects: 0, waivers: 0, certificates: 0, tasks: 0, photos: 0, dailyLogs: 0, timeEntries: 0, invoices: 0, payments: 0, estimates: 0, mileageEntries: 0, clients: 0 },
      data: mockData,
    }

    vi.mocked(db.exportAllData).mockResolvedValue(mockData as ReturnType<typeof db.exportAllData> extends Promise<infer T> ? T : never)
    vi.mocked(backup.createBackupFile).mockResolvedValue(mockBackup as BackupFile)

    renderSettings()

    const exportBtn = screen.getByText('Export Data')
    fireEvent.click(exportBtn)

    await waitFor(() => {
      expect(db.exportAllData).toHaveBeenCalled()
      expect(backup.createBackupFile).toHaveBeenCalledWith(mockData)
      expect(backup.downloadBackup).toHaveBeenCalledWith(mockBackup)
    })
  })

  it('shows about section', () => {
    renderSettings()
    expect(screen.getByText('About SubLink')).toBeDefined()
  })

  it('shows financial settings section', () => {
    vi.mocked(db.getSetting).mockResolvedValue('75')
    renderSettings()
    expect(screen.getByText('Financial Settings')).toBeDefined()
  })

  it('shows hourly rate input with default value', async () => {
    vi.mocked(db.getSetting).mockResolvedValue('75')
    renderSettings()
    await waitFor(() => {
      const input = screen.getByLabelText('Default Hourly Rate ($)')
      expect(input).toBeDefined()
      expect((input as HTMLInputElement).value).toBe('75')
    })
  })

  it('saves hourly rate when save button clicked', async () => {
    vi.mocked(db.getSetting).mockResolvedValue('75')
    vi.mocked(db.setSetting).mockResolvedValue(undefined)
    
    renderSettings()
    
    await waitFor(() => {
      expect(screen.getByLabelText('Default Hourly Rate ($)')).toBeDefined()
    })
    
    const input = screen.getByLabelText('Default Hourly Rate ($)')
    fireEvent.change(input, { target: { value: '85' } })
    
    const saveBtn = screen.getByText('Save Rate')
    fireEvent.click(saveBtn)
    
    await waitFor(() => {
      expect(db.setSetting).toHaveBeenCalledWith('hourlyRate', '85')
    })
  })
})
