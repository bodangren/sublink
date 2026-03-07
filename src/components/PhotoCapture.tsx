import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { savePhoto, getPhotosByTask, getPhotoCountByTask } from '../db'
import { getGPSLocation, createWatermarkText } from '../utils/gps'
import { applyWatermark } from '../utils/watermark'
import type { TaskPhoto } from '../db'

interface PhotoCaptureProps {
  taskId: string
  taskTitle: string
}

const PhotoCapture = ({ taskId, taskTitle }: PhotoCaptureProps) => {
  const navigate = useNavigate()
  const [photoCount, setPhotoCount] = useState(0)
  const [photos, setPhotos] = useState<TaskPhoto[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadData = async () => {
      const count = await getPhotoCountByTask(taskId)
      setPhotoCount(count)
      const photoList = await getPhotosByTask(taskId)
      setPhotos(photoList)
    }
    loadData()
  }, [taskId])

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
          
          const count = await getPhotoCountByTask(taskId)
          setPhotoCount(count)
          const photoList = await getPhotosByTask(taskId)
          setPhotos(photoList)
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

  const handleBack = () => {
    navigate('/tasking')
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{taskTitle}</h2>
        <span style={{ 
          backgroundColor: 'var(--accent-color)', 
          color: '#fff', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontWeight: 'bold'
        }}>
          {photoCount} photo{photoCount !== 1 ? 's' : ''}
        </span>
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
            color: '#fff',
            textAlign: 'center',
            cursor: isCapturing ? 'wait' : 'pointer',
            borderRadius: '4px',
            opacity: isCapturing ? 0.7 : 1
          }}
        >
          {isCapturing ? 'Processing...' : 'Take Photo'}
        </span>
      </label>

      <div style={{ marginTop: '2rem' }}>
        <h3>Photos</h3>
        {photos.length === 0 ? (
          <p>No photos yet. Tap "Take Photo" to capture proof of work.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {photos.map(photo => (
              <div 
                key={photo.id} 
                style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '4px', 
                  overflow: 'hidden' 
                }}
              >
                <img 
                  src={photo.imageData} 
                  alt="Task photo" 
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
                <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(photo.capturedAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={handleBack}
        style={{ marginTop: '2rem', backgroundColor: '#444', color: '#fff' }}
      >
        Back to Tasks
      </button>
    </div>
  )
}

export default PhotoCapture
