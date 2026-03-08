import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DailyLogForm from './DailyLogForm'
import { initDB, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
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
})
