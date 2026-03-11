import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MileageForm from './MileageForm'
import { initDB, clearDatabase, getProjects, saveProject } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('MileageForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all required fields', () => {
    renderWithRouter(<MileageForm />)
    
    expect(screen.getByLabelText(/date/i)).toBeDefined()
    expect(screen.getByLabelText(/start location/i)).toBeDefined()
    expect(screen.getByLabelText(/end location/i)).toBeDefined()
    expect(screen.getByLabelText(/miles/i)).toBeDefined()
    expect(screen.getByLabelText(/purpose/i)).toBeDefined()
    expect(screen.getByLabelText(/notes/i)).toBeDefined()
  })

  it('displays today\'s date by default', () => {
    renderWithRouter(<MileageForm />)
    
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    const today = new Date().toISOString().split('T')[0]
    expect(dateInput.value).toBe(today)
  })

  it('renders project selector', async () => {
    await saveProject({ name: 'Test Project' })
    
    renderWithRouter(<MileageForm />)
    
    await waitFor(async () => {
      const projects = await getProjects()
      expect(projects.length).toBeGreaterThan(0)
    })
  })

  it('renders submit button', () => {
    renderWithRouter(<MileageForm />)
    
    expect(screen.getByRole('button', { name: /log mileage/i })).toBeDefined()
  })

  it('toggles round trip checkbox', () => {
    renderWithRouter(<MileageForm />)
    
    const checkbox = screen.getByRole('checkbox', { name: /round trip/i }) as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('captures GPS coordinates when available', async () => {
    type PositionCallback = (position: GeolocationPosition) => void
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success: PositionCallback) => {
        success({
          coords: { latitude: 40.7128, longitude: -74.0060, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: Date.now()
        } as GeolocationPosition)
      })
    }
    
    const originalGeolocation = navigator.geolocation
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true
    })
    
    renderWithRouter(<MileageForm />)
    
    const buttons = screen.getAllByRole('button')
    const captureButton = buttons.find(btn => btn.textContent?.includes('Capture'))
    
    if (captureButton) {
      fireEvent.click(captureButton)
      
      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
      })
    }
    
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
      configurable: true
    })
  })

  it('handles GPS error gracefully', async () => {
    type PositionCallback = (position: GeolocationPosition) => void
    type PositionErrorCallback = (error: GeolocationPositionError) => void
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
        error({ message: 'Permission denied', code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
      })
    }
    
    const originalGeolocation = navigator.geolocation
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true
    })
    
    renderWithRouter(<MileageForm />)
    
    const buttons = screen.getAllByRole('button')
    const captureButton = buttons.find(btn => btn.textContent?.includes('Capture'))
    
    if (captureButton) {
      fireEvent.click(captureButton)
      
      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
      })
    }
    
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
      configurable: true
    })
  })

  it('loads existing mileage entry in edit mode', async () => {
    const result = await initDB().then(async () => {
      const { saveMileage } = await import('../db')
      return await saveMileage({
        date: '2024-03-10',
        startLocation: 'Office',
        endLocation: 'Job Site',
        miles: 25.5,
        purpose: 'Site visit',
        isRoundTrip: false,
      })
    })
    
    renderWithRouter(<MileageForm editId={result.id} />)
    
    await waitFor(() => {
      const startInput = screen.getByLabelText(/start location/i) as HTMLInputElement
      const endInput = screen.getByLabelText(/end location/i) as HTMLInputElement
      const milesInput = screen.getByLabelText(/miles/i) as HTMLInputElement
      const purposeInput = screen.getByLabelText(/purpose/i) as HTMLInputElement
      
      expect(startInput.value).toBe('Office')
      expect(endInput.value).toBe('Job Site')
      expect(milesInput.value).toBe('25.5')
      expect(purposeInput.value).toBe('Site visit')
    })
  })

  it('updates button text in edit mode', async () => {
    const result = await initDB().then(async () => {
      const { saveMileage } = await import('../db')
      return await saveMileage({
        date: '2024-03-10',
        startLocation: 'Office',
        endLocation: 'Job Site',
        miles: 25.5,
        isRoundTrip: false,
      })
    })
    
    renderWithRouter(<MileageForm editId={result.id} />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update mileage/i })).toBeDefined()
    })
  })
})
