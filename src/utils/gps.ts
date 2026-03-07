export interface GPSLocation {
  latitude: number
  longitude: number
}

export const getGPSLocation = (): Promise<GPSLocation | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  })
}

export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export const createWatermarkText = (
  latitude: number | undefined,
  longitude: number | undefined,
  timestamp: number
): string => {
  const locationText = latitude !== undefined && longitude !== undefined
    ? formatCoordinates(latitude, longitude)
    : 'No GPS'
  const timeText = formatTimestamp(timestamp)
  return `${locationText} | ${timeText}`
}
