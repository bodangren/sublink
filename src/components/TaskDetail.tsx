import { useState, useEffect, useRef } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { getTask, getPhotosByTask, getPhotoCountByTask, savePhoto, deleteTask } from '../db'
import { getGPSLocation, createWatermarkText } from '../utils/gps'
import { applyWatermark } from '../utils/watermark'
import { generateTaskPDF, downloadPDF, generatePDFFilename } from '../utils/pdfGenerator'
import PhotoGallery from './PhotoGallery'
import type { Task, TaskPhoto } from '../db'

interface TaskDetailProps {
  taskId: string
}

const TaskDetail = ({ taskId }: TaskDetailProps) => {
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [photos, setPhotos] = useState<TaskPhoto[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        const taskData = await getTask(taskId)
        if (!mounted) return
        if (!taskData) {
          navigate('/tasking')
          return
        }
        setTask(taskData)
        const photoList = await getPhotosByTask(taskId)
        setPhotos(photoList)
        const count = await getPhotoCountByTask(taskId)
        setPhotoCount(count)
      } catch (err) {
        console.error('Failed to load task:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [taskId, navigate])

  const refreshPhotos = async () => {
    const photoList = await getPhotosByTask(taskId)
    setPhotos(photoList)
    const count = await getPhotoCountByTask(taskId)
    setPhotoCount(count)
  }

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsCapturing(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string
          
          const gps = await getGPSLocation()
          const timestamp = Date.now()
          const watermarkText = createWatermarkText(
            gps?.latitude,
            gps?.longitude,
            timestamp
          )
          
          const watermarkedImage = await applyWatermark(imageData, watermarkText)
          
          await savePhoto({
            taskId,
            imageData: watermarkedImage,
            latitude: gps?.latitude,
            longitude: gps?.longitude,
            capturedAt: timestamp,
            watermarkData: watermarkText,
          })
          
          await refreshPhotos()
          setIsCapturing(false)
        } catch (err) {
          setError('Failed to process photo')
          setIsCapturing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to capture photo')
      setIsCapturing(false)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? All photos will also be deleted.')) {
      await deleteTask(taskId)
      navigate('/tasking')
    }
  }

  const handleExportPDF = async () => {
    if (!task) return
    
    setIsExporting(true)
    try {
      const blob = await generateTaskPDF({ task, photos })
      const filename = generatePDFFilename(task)
      downloadPDF(blob, filename)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container">
        <p>Task not found.</p>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{task.title}</h2>
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
      </div>

      <div style={{ 
        backgroundColor: 'var(--secondary-bg)', 
        padding: '1rem', 
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>{task.description}</p>
        {task.contractReference && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <strong>Contract:</strong> {task.contractReference}
          </p>
        )}
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        style={{ display: 'none' }}
        id="photo-input"
      />

      <label htmlFor="photo-input" style={{ display: 'block' }}>
        <span
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            display: 'inline-block',
            width: '100%', 
            fontSize: '1.25rem', 
            padding: '1.5rem',
            backgroundColor: 'var(--accent-color)',
            color: '#000',
            textAlign: 'center',
            cursor: isCapturing ? 'wait' : 'pointer',
            borderRadius: '4px',
            opacity: isCapturing ? 0.7 : 1
          }}
        >
          {isCapturing ? 'Processing...' : 'Take Photo'}
        </span>
      </label>

      <button 
        onClick={handleExportPDF}
        disabled={isExporting}
        style={{ 
          marginTop: '0.5rem',
          backgroundColor: isExporting ? '#666' : '#2196F3',
          color: '#fff',
          opacity: isExporting ? 0.7 : 1
        }}
      >
        {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
      </button>

      <div style={{ marginTop: '2rem' }}>
        <h3>Photos</h3>
        <PhotoGallery photos={photos} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
        <NavLink to={`/tasking/edit/${task.id}`} style={{ flex: 1 }}>
          <button style={{ fontSize: '0.875rem', padding: '0.75rem 1rem' }}>Edit Task</button>
        </NavLink>
        <button 
          onClick={handleDeleteTask}
          style={{ 
            flex: 1, 
            fontSize: '0.875rem', 
            padding: '0.75rem 1rem', 
            backgroundColor: '#dc3545', 
            color: '#fff' 
          }}
        >
          Delete Task
        </button>
      </div>

      <button 
        onClick={() => navigate('/tasking')}
        style={{ marginTop: '1rem', backgroundColor: '#444', color: '#fff' }}
      >
        Back to Tasks
      </button>
    </div>
  )
}

export default TaskDetail
