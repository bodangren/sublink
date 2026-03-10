import { useState, useRef, useCallback } from 'react'
import { savePhoto } from '../db'
import { getGPSLocation, createWatermarkText } from '../utils/gps'
import { applyWatermark } from '../utils/watermark'
import type { TaskPhoto } from '../db'

interface UseDailyLogPhotoCaptureResult {
  photos: TaskPhoto[]
  photoCount: number
  isCapturing: boolean
  error: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleCapture: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  clearPhotos: () => void
  getPhotoIds: () => string[]
  setInitialPhotos: (photos: TaskPhoto[]) => void
}

interface UseDailyLogPhotoCaptureOptions {
  initialPhotos?: TaskPhoto[]
}

export function useDailyLogPhotoCapture(options?: UseDailyLogPhotoCaptureOptions): UseDailyLogPhotoCaptureResult {
  const [photos, setPhotos] = useState<TaskPhoto[]>(options?.initialPhotos || [])
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          
          const photoId = await savePhoto({
            imageData: watermarkedImage,
            latitude: gps?.latitude,
            longitude: gps?.longitude,
            capturedAt: timestamp,
            watermarkData: watermarkText,
          })
          
          const newPhoto: TaskPhoto = {
            id: photoId,
            imageData: watermarkedImage,
            latitude: gps?.latitude,
            longitude: gps?.longitude,
            capturedAt: timestamp,
            watermarkData: watermarkText,
          }
          
          setPhotos(prev => [...prev, newPhoto])
          setIsCapturing(false)
        } catch {
          setError('Failed to process photo')
          setIsCapturing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setError('Failed to capture photo')
      setIsCapturing(false)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const clearPhotos = useCallback(() => {
    setPhotos([])
  }, [])

  const setInitialPhotos = useCallback((initialPhotos: TaskPhoto[]) => {
    setPhotos(initialPhotos)
  }, [])

  const getPhotoIds = useCallback(() => {
    return photos.map(p => p.id)
  }, [photos])

  return {
    photos,
    photoCount: photos.length,
    isCapturing,
    error,
    fileInputRef,
    handleCapture,
    clearPhotos,
    getPhotoIds,
    setInitialPhotos
  }
}
