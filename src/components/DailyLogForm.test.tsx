import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DailyLogForm from './DailyLogForm'
import { initDB, clearDatabase, saveDailyLog, savePhoto, getDailyLog } from '../db'
import 'fake-indexeddb/auto'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'test-edit-id' })
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('DailyLogForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
    mockNavigate.mockClear()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<DailyLogForm />)
    
    expect(screen.getByLabelText(/date/i)).toBeDefined()
    expect(screen.getByLabelText(/project.*optional/i)).toBeDefined()
    expect(screen.getByLabelText(/project.*job site/i)).toBeDefined()
    expect(screen.getByLabelText(/weather/i)).toBeDefined()
    expect(screen.getByLabelText(/work performed/i)).toBeDefined()
    expect(screen.getByLabelText(/delays/i)).toBeDefined()
    expect(screen.getByLabelText(/personnel/i)).toBeDefined()
    expect(screen.getByLabelText(/equipment/i)).toBeDefined()
    expect(screen.getByLabelText(/notes/i)).toBeDefined()
  })

  it('displays today date by default', () => {
    renderWithRouter(<DailyLogForm />)
    
    const today = new Date().toISOString().split('T')[0]
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.value).toBe(today)
  })

  it('shows edit title when editId is provided', () => {
    renderWithRouter(<DailyLogForm editId="test-id" initialData={{
      date: '2026-03-08',
      project: 'Test Project',
      projectId: '',
      weather: 'Sunny',
      workPerformed: 'Test work',
      delays: '',
      personnel: 'Test crew',
      equipment: '',
      notes: ''
    }} />)
    
    expect(screen.getByText('Edit Daily Log')).toBeDefined()
  })

  it('shows cancel button', () => {
    renderWithRouter(<DailyLogForm />)
    
    expect(screen.getByText('Cancel')).toBeDefined()
  })

  it('navigates to /logs on cancel', () => {
    renderWithRouter(<DailyLogForm />)
    
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockNavigate).toHaveBeenCalledWith('/logs')
  })

  it('renders photo capture button', () => {
    renderWithRouter(<DailyLogForm />)
    
    expect(screen.getByText(/capture photo/i)).toBeDefined()
  })

  it('shows site photos section', () => {
    renderWithRouter(<DailyLogForm />)
    
    expect(screen.getByText(/site photos/i)).toBeDefined()
  })

  it('loads existing photos when editing a log with photos', async () => {
    const photoId = await savePhoto({
      imageData: 'data:image/png;base64,existingphoto',
      capturedAt: Date.now(),
      watermarkData: 'existing-watermark'
    })
    
    const logId = await saveDailyLog({
      date: '2026-03-08',
      project: 'Photo Test Project',
      weather: 'Sunny',
      workPerformed: 'Test work',
      personnel: 'Test crew',
      photoIds: [photoId]
    })

    renderWithRouter(<DailyLogForm editId={logId} />)

    await waitFor(() => {
      expect(screen.getByText(/1 photo captured/)).toBeDefined()
    })
  })

  it('preserves existing photos when saving in edit mode', async () => {
    const photoId = await savePhoto({
      imageData: 'data:image/png;base64,existingphoto',
      capturedAt: Date.now(),
      watermarkData: 'existing-watermark'
    })
    
    const logId = await saveDailyLog({
      date: '2026-03-08',
      project: 'Photo Preserve Test',
      weather: 'Sunny',
      workPerformed: 'Test work',
      personnel: 'Test crew',
      photoIds: [photoId]
    })

    renderWithRouter(<DailyLogForm editId={logId} />)

    await waitFor(() => {
      expect(screen.getByText(/1 photo captured/)).toBeDefined()
    })

    const submitButton = screen.getByText(/update log/i)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/logs')
    })

    const updatedLog = await getDailyLog(logId)
    expect(updatedLog?.photoIds).toContain(photoId)
  })

  it('loads existing photos when editing with initialData provided', async () => {
    const photoId = await savePhoto({
      imageData: 'data:image/png;base64,existingphoto',
      capturedAt: Date.now(),
      watermarkData: 'existing-watermark'
    })
    
    const logId = await saveDailyLog({
      date: '2026-03-08',
      project: 'InitialData Photo Test',
      weather: 'Sunny',
      workPerformed: 'Test work',
      personnel: 'Test crew',
      photoIds: [photoId]
    })

    renderWithRouter(<DailyLogForm 
      editId={logId} 
      initialData={{
        date: '2026-03-08',
        project: 'InitialData Photo Test',
        projectId: '',
        weather: 'Sunny',
        workPerformed: 'Test work',
        delays: '',
        personnel: 'Test crew',
        equipment: '',
        notes: ''
      }} 
    />)

    await waitFor(() => {
      expect(screen.getByText(/1 photo captured/)).toBeDefined()
    })
  })
})
