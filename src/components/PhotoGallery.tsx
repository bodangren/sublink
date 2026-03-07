import { useState } from 'react'
import type { TaskPhoto } from '../db'

interface PhotoGalleryProps {
  photos: TaskPhoto[]
}

const PhotoGallery = ({ photos }: PhotoGalleryProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<TaskPhoto | null>(null)

  const openFullscreen = (photo: TaskPhoto) => {
    setSelectedPhoto(photo)
  }

  const closeFullscreen = () => {
    setSelectedPhoto(null)
  }

  if (photos.length === 0) {
    return <p>No photos yet.</p>
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
        {photos.map(photo => (
          <div 
            key={photo.id} 
            onClick={() => openFullscreen(photo)}
            style={{ 
              border: '1px solid var(--border-color)', 
              borderRadius: '4px', 
              overflow: 'hidden',
              cursor: 'pointer'
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

      {selectedPhoto && (
        <div 
          onClick={closeFullscreen}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            padding: '1rem'
          }}
        >
          <img 
            src={selectedPhoto.imageData} 
            alt="Full size photo" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80vh', 
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: 'var(--secondary-bg)',
            borderRadius: '4px',
            textAlign: 'center',
            maxWidth: '100%'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {new Date(selectedPhoto.capturedAt).toLocaleString()}
            </div>
            {selectedPhoto.latitude !== undefined && selectedPhoto.longitude !== undefined && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                GPS: {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
              </div>
            )}
            <div style={{ fontSize: '0.875rem', color: 'var(--accent-color)', marginTop: '0.5rem' }}>
              Tap anywhere to close
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PhotoGallery
