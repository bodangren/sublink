import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { getDailyLog, deleteDailyLog, getPhotosByDailyLog, getPhotoCountByDailyLog } from '../db'
import PhotoGallery from './PhotoGallery'
import type { DailyLog, TaskPhoto } from '../db'
import { generateDailyLogPdf } from '../utils/dailyLogPdf'
import { useConfirm } from '../hooks/useConfirm'

interface DailyLogDetailProps {
  logId: string
}

const DailyLogDetail = ({ logId }: DailyLogDetailProps) => {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [log, setLog] = useState<DailyLog | null>(null)
  const [photos, setPhotos] = useState<TaskPhoto[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        const logData = await getDailyLog(logId)
        if (!mounted) return
        if (!logData) {
          navigate('/logs')
          return
        }
        setLog(logData)
        
        const photosData = await getPhotosByDailyLog(logId)
        const count = await getPhotoCountByDailyLog(logId)
        if (mounted) {
          setPhotos(photosData)
          setPhotoCount(count)
        }
      } catch (err) {
        console.error('Failed to load daily log:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [logId, navigate])

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Daily Log',
      message: 'Are you sure you want to delete this daily log?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteDailyLog(logId)
      navigate('/logs')
    }
  }

  const handleExportPdf = async () => {
    if (!log) return
    setExporting(true)
    try {
      await generateDailyLogPdf({ log, photos })
    } catch (err) {
      console.error('Failed to export PDF:', err)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (!log) {
    return (
      <div className="container">
        <p>Daily log not found.</p>
        <NavLink to="/logs"><button>Back to Logs</button></NavLink>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{log.project}</h1>
        {photoCount > 0 && (
          <span style={{ 
            backgroundColor: 'var(--accent-color)', 
            color: '#000', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            {photoCount} photo{photoCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <p style={{ color: 'var(--accent-color)', marginBottom: '1.5rem' }}>{formatDate(log.date)}</p>

      <div style={{ 
        backgroundColor: 'var(--secondary-bg)', 
        padding: '1rem', 
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', padding: 0, fontSize: '1rem' }}>Weather</h3>
        <p style={{ margin: 0 }}>{log.weather}</p>
      </div>

      <div style={{ 
        backgroundColor: 'var(--secondary-bg)', 
        padding: '1rem', 
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', padding: 0, fontSize: '1rem' }}>Work Performed</h3>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{log.workPerformed}</p>
      </div>

      <div style={{ 
        backgroundColor: 'var(--secondary-bg)', 
        padding: '1rem', 
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', padding: 0, fontSize: '1rem' }}>Personnel on Site</h3>
        <p style={{ margin: 0 }}>{log.personnel}</p>
      </div>

      {log.delays && (
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem',
          borderLeft: '4px solid #ff4444'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', padding: 0, fontSize: '1rem', color: '#ff4444' }}>Delays / Issues</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{log.delays}</p>
        </div>
      )}

      {log.equipment && (
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', padding: 0, fontSize: '1rem' }}>Equipment Used</h3>
          <p style={{ margin: 0 }}>{log.equipment}</p>
        </div>
      )}

      {log.notes && (
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', padding: 0, fontSize: '1rem' }}>Additional Notes</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{log.notes}</p>
        </div>
      )}

      {photos.length > 0 && (
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', padding: 0, fontSize: '1rem' }}>Site Photos</h3>
          <PhotoGallery photos={photos} />
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleExportPdf} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
        <NavLink to={`/logs/edit/${log.id}`}>
          <button style={{ backgroundColor: '#666' }}>Edit</button>
        </NavLink>
        <button 
          onClick={handleDelete}
          style={{ backgroundColor: '#dc3545', color: '#fff' }}
        >
          Delete
        </button>
      </div>
      
      <NavLink to="/logs">
        <button style={{ backgroundColor: '#444', color: '#fff', marginTop: '0.5rem' }}>
          Back to Logs
        </button>
      </NavLink>
    </div>
  )
}

export default DailyLogDetail
