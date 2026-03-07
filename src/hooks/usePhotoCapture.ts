import { useState, useRef, useCallback, useEffect } from 'react'
import { savePhoto, getPhotosByTask, getPhotoCountByTask } from '../db'
import { getGPSLocation, createWatermarkText } from '../utils/gps'
import { applyWatermark } from '../utils/watermark'
import type { TaskPhoto } from '../db'

interface UsePhotoCaptureResult {
  photos: TaskPhoto[]
  photoCount: number
  isCapturing: boolean
  error: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleCapture: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  refreshPhotos: () => Promise<void>
}

export function usePhotoCapture(taskId: string): UsePhotoCaptureResult {
  const [photos, setPhotos] = useState<TaskPhoto[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadPhotos = useCallback(async () => {
    const photoList = await getPhotosByTask(taskId)
    const count = await getPhotoCountByTask(taskId)
    return { photoList, count }
  }, [taskId])

  useEffect(() => {
    let mounted = true
    loadPhotos().then(({ photoList, count }) => {
      if (mounted) {
        setPhotos(photoList)
        setPhotoCount(count)
      }
    })
    return () => { mounted = false }
  }, [loadPhotos])

  const refreshPhotos = useCallback(async () => {
    const { photoList, count } = await loadPhotos()
    setPhotos(photoList)
    setPhotoCount(count)
  }, [loadPhotos])

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
  }, [taskId, refreshPhotos])

  return {
    photos,
    photoCount,
    isCapturing,
    error,
    fileInputRef,
    handleCapture,
    refreshPhotos
  }
}
