import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  exportAllData,
  restoreData,
} from '../db'
import type { RestoreData } from '../db'
import {
  createBackupFile,
  downloadBackup,
  parseBackupFile,
  verifyChecksum,
  formatBackupDate,
  formatFileSize,
  getBackupSize,
  getLastBackupInfo,
  saveLastBackupInfo,
  daysSinceLastBackup,
} from '../utils/dataBackup'
import type { BackupFile, BackupSummary } from '../utils/dataBackup'

export default function Settings() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewBackup, setPreviewBackup] = useState<BackupFile | null>(null)
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace')
  const [lastBackup, setLastBackup] = useState<{ date: string; summary: BackupSummary } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLastBackup(getLastBackupInfo())
  }, [])

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setSuccess(null)
    
    try {
      const data = await exportAllData()
      const backup = await createBackupFile(data)
      downloadBackup(backup)
      saveLastBackupInfo(backup)
      setLastBackup({ date: backup.exportedAt, summary: backup.summary })
      setSuccess(`Backup created: ${formatFileSize(getBackupSize(backup))}`)
    } catch (err) {
      setError('Failed to create backup. Please try again.')
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImporting(true)
    setError(null)
    setSuccess(null)
    setPreviewBackup(null)
    
    try {
      const backup = await parseBackupFile(file)
      const isValid = await verifyChecksum(backup)
      
      if (!isValid) {
        setError('Backup file is corrupted or has been modified.')
        return
      }
      
      setPreviewBackup(backup)
    } catch (err) {
      setError('Failed to read backup file. Please ensure it is a valid SubLink backup.')
      console.error('Parse error:', err)
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRestore = async () => {
    if (!previewBackup) return
    
    setImporting(true)
    setError(null)
    
    try {
      await restoreData(previewBackup.data as RestoreData, restoreMode)
      setSuccess(`Data restored successfully! ${restoreMode === 'replace' ? 'All previous data was replaced.' : 'New data was merged with existing data.'}`)
      setPreviewBackup(null)
    } catch (err) {
      setError('Failed to restore data. Please try again.')
      console.error('Restore error:', err)
    } finally {
      setImporting(false)
    }
  }

  const cancelPreview = () => {
    setPreviewBackup(null)
    setError(null)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
          <button onClick={() => setError(null)} className="alert-close" aria-label="Close">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
          <button onClick={() => setSuccess(null)} className="alert-close" aria-label="Close">
            ×
          </button>
        </div>
      )}

      <section className="settings-section">
        <h2>Data Backup & Restore</h2>
        <p className="settings-description">
          Your data is stored locally in this browser. Create backups regularly to protect against data loss.
        </p>

        {lastBackup && (
          <div className="last-backup-info">
            <strong>Last backup:</strong>{' '}
            {formatBackupDate(lastBackup.date)} (
            {lastBackup.summary.projects + lastBackup.summary.waivers + lastBackup.summary.certificates +
             lastBackup.summary.tasks + lastBackup.summary.photos + lastBackup.summary.dailyLogs +
             lastBackup.summary.timeEntries + lastBackup.summary.invoices + (lastBackup.summary.payments || 0)} records)
          </div>
        )}

        {daysSinceLastBackup() !== null && daysSinceLastBackup()! >= 7 && (
          <div className="alert alert-warning">
            It's been {daysSinceLastBackup()} days since your last backup. Consider creating a new backup.
          </div>
        )}

        <div className="backup-actions">
          <div className="backup-card">
            <h3>Export Backup</h3>
            <p>Download all your data as a JSON file. Keep this file safe.</p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn btn-primary btn-large"
            >
              {exporting ? 'Creating Backup...' : 'Export Data'}
            </button>
          </div>

          <div className="backup-card">
            <h3>Import Backup</h3>
            <p>Restore your data from a previously exported backup file.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="backup-file-input"
            />
            <label
              htmlFor="backup-file-input"
              className={`btn btn-secondary btn-large ${importing ? 'disabled' : ''}`}
            >
              {importing ? 'Reading File...' : 'Select Backup File'}
            </label>
          </div>
        </div>
      </section>

      {previewBackup && (
        <div className="modal-overlay" onClick={cancelPreview}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Restore Backup</h2>
              <button onClick={cancelPreview} className="modal-close" aria-label="Close">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="backup-preview">
                <div className="preview-info">
                  <p><strong>Backup Date:</strong> {formatBackupDate(previewBackup.exportedAt)}</p>
                  <p><strong>File Size:</strong> {formatFileSize(getBackupSize(previewBackup))}</p>
                  <p><strong>Version:</strong> {previewBackup.version}</p>
                </div>

                <h3>Contents</h3>
                <ul className="backup-contents">
                  {previewBackup.summary.projects > 0 && (
                    <li>{previewBackup.summary.projects} project{previewBackup.summary.projects !== 1 ? 's' : ''}</li>
                  )}
                  {previewBackup.summary.waivers > 0 && (
                    <li>{previewBackup.summary.waivers} lien waiver{previewBackup.summary.waivers !== 1 ? 's' : ''}</li>
                  )}
                  {previewBackup.summary.certificates > 0 && (
                    <li>{previewBackup.summary.certificates} certificate{previewBackup.summary.certificates !== 1 ? 's' : ''}</li>
                  )}
                  {previewBackup.summary.tasks > 0 && (
                    <li>{previewBackup.summary.tasks} task{previewBackup.summary.tasks !== 1 ? 's' : ''}</li>
                  )}
                  {previewBackup.summary.photos > 0 && (
                    <li>{previewBackup.summary.photos} photo{previewBackup.summary.photos !== 1 ? 's' : ''}</li>
                  )}
                  {previewBackup.summary.dailyLogs > 0 && (
                    <li>{previewBackup.summary.dailyLogs} daily log{previewBackup.summary.dailyLogs !== 1 ? 's' : ''}</li>
                  )}
                  {previewBackup.summary.timeEntries > 0 && (
                    <li>{previewBackup.summary.timeEntries} time entr{previewBackup.summary.timeEntries !== 1 ? 'ies' : 'y'}</li>
                  )}
                  {previewBackup.summary.invoices > 0 && (
                    <li>{previewBackup.summary.invoices} invoice{previewBackup.summary.invoices !== 1 ? 's' : ''}</li>
                  )}
                  {previewBackup.summary.payments > 0 && (
                    <li>{previewBackup.summary.payments} payment{previewBackup.summary.payments !== 1 ? 's' : ''}</li>
                  )}
                </ul>

                <div className="restore-options">
                  <h3>Restore Mode</h3>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="restoreMode"
                      value="replace"
                      checked={restoreMode === 'replace'}
                      onChange={() => setRestoreMode('replace')}
                    />
                    <span className="radio-text">
                      <strong>Replace All</strong>
                      <small>Delete all current data and restore from backup</small>
                    </span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="restoreMode"
                      value="merge"
                      checked={restoreMode === 'merge'}
                      onChange={() => setRestoreMode('merge')}
                    />
                    <span className="radio-text">
                      <strong>Merge</strong>
                      <small>Add backup data, keep existing records (skips duplicates)</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={cancelPreview} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={importing}
                className={`btn ${restoreMode === 'replace' ? 'btn-danger' : 'btn-primary'}`}
              >
                {importing ? 'Restoring...' : `Restore (${restoreMode === 'replace' ? 'Replace All' : 'Merge'})`}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="settings-section">
        <h2>About SubLink</h2>
        <p className="settings-description">
          SubLink is a local-first mobile PWA for subcontractors. All data is stored locally in your browser.
        </p>
        <p><strong>Version:</strong> 1.2.0</p>
      </section>

      <nav className="bottom-nav">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
        <NavLink to="/invoices">Invoices</NavLink>
        <NavLink to="/settings" className="active">Settings</NavLink>
      </nav>
    </div>
  )
}
