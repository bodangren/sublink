import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getGPSLocation, formatCoordinates, formatTimestamp, createWatermarkText } from './gps'

describe('gps utilities', () => {
  describe('formatCoordinates', () => {
    it('formats coordinates to 6 decimal places', () => {
      const result = formatCoordinates(40.7128, -74.0060)
      expect(result).toBe('40.712800, -74.006000')
    })

    it('handles negative coordinates', () => {
      const result = formatCoordinates(-33.8688, 151.2093)
      expect(result).toBe('-33.868800, 151.209300')
    })

    it('handles zero coordinates', () => {
      const result = formatCoordinates(0, 0)
      expect(result).toBe('0.000000, 0.000000')
    })
  })

  describe('formatTimestamp', () => {
    it('formats timestamp to readable date string', () => {
      const timestamp = new Date('2024-03-15T10:30:00').getTime()
      const result = formatTimestamp(timestamp)
      expect(result).toContain('2024')
      expect(result).toContain('03')
      expect(result).toContain('15')
    })
  })

  describe('createWatermarkText', () => {
    it('creates watermark with GPS coordinates', () => {
      const timestamp = new Date('2024-03-15T10:30:00').getTime()
      const result = createWatermarkText(40.7128, -74.0060, timestamp)
      
      expect(result).toContain('40.712800')
      expect(result).toContain('-74.006000')
      expect(result).toContain('2024')
    })

    it('creates watermark without GPS coordinates', () => {
      const timestamp = new Date('2024-03-15T10:30:00').getTime()
      const result = createWatermarkText(undefined, undefined, timestamp)
      
      expect(result).toContain('No GPS')
    })
  })

  describe('getGPSLocation', () => {
    const originalGeolocation = navigator.geolocation

    beforeEach(() => {
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: vi.fn(),
        },
        writable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(navigator, 'geolocation', {
        value: originalGeolocation,
        writable: true,
      })
    })

    it('resolves with coordinates on success', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
        },
        timestamp: Date.now(),
      }

      vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((success) => {
        success(mockPosition as GeolocationPosition)
      })

      const result = await getGPSLocation()
      expect(result).toEqual({ latitude: 40.7128, longitude: -74.0060 })
    })

    it('resolves with null on error', async () => {
      vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((_, error) => {
        error?.({ code: 1, message: 'Permission denied' } as GeolocationPositionError)
      })

      const result = await getGPSLocation()
      expect(result).toBeNull()
    })
  })
})
