import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CalendarView from './CalendarView'
import * as db from '../db'

vi.mock('../db', () => ({
  getTasks: vi.fn(),
  getDailyLogs: vi.fn(),
  getProjects: vi.fn(),
}))

const mockTasks = [
  { id: 'task-1', title: 'Task One', description: 'Desc', createdAt: new Date('2026-03-15').getTime(), updatedAt: Date.now() },
  { id: 'task-2', title: 'Task Two', description: 'Desc', createdAt: new Date('2026-03-15').getTime(), updatedAt: Date.now() },
]

const mockLogs = [
  { id: 'log-1', date: '2026-03-15', project: 'Project Alpha', weather: 'Sunny', workPerformed: 'Work', personnel: 'John', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'log-2', date: '2026-03-16', project: 'Project Beta', weather: 'Rainy', workPerformed: 'Work', personnel: 'Jane', createdAt: Date.now(), updatedAt: Date.now() },
]

const mockProjects = [
  { id: 'proj-1', name: 'Project Alpha', endDate: '2026-03-20', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'proj-2', name: 'Project Beta', endDate: '2026-03-25', createdAt: Date.now(), updatedAt: Date.now() },
]

const renderCalendar = () => {
  return render(
    <MemoryRouter>
      <CalendarView />
    </MemoryRouter>
  )
}

describe('CalendarView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(db.getTasks).mockResolvedValue(mockTasks as unknown as db.Task[])
    vi.mocked(db.getDailyLogs).mockResolvedValue(mockLogs as unknown as db.DailyLog[])
    vi.mocked(db.getProjects).mockResolvedValue(mockProjects as unknown as db.Project[])
  })

  it('renders loading state initially', () => {
    renderCalendar()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders calendar with month and year after loading', async () => {
    renderCalendar()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    const monthYear = screen.getByRole('heading', { name: /March 2026|February 2026|April 2026/ })
    expect(monthYear).toBeInTheDocument()
  })

  it('renders day headers', async () => {
    renderCalendar()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('navigates to previous month', async () => {
    renderCalendar()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    const prevButton = screen.getByRole('button', { name: 'Previous month' })
    fireEvent.click(prevButton)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /February 2026/ })).toBeInTheDocument()
    })
  })

  it('navigates to next month', async () => {
    renderCalendar()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    const nextButton = screen.getByRole('button', { name: 'Next month' })
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /April 2026/ })).toBeInTheDocument()
    })
  })

  it('renders legend with indicators', async () => {
    renderCalendar()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Daily Logs')).toBeInTheDocument()
    expect(screen.getByText('Deadlines')).toBeInTheDocument()
  })

  it('selects a day when clicked', async () => {
    renderCalendar()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    const dayButtons = screen.getAllByRole('button')
    const day15 = dayButtons.find(btn => btn.textContent?.includes('15') && btn.className.includes('calendar-day'))
    
    if (day15) {
      fireEvent.click(day15)
      
      await waitFor(() => {
        expect(screen.getByText('Add Log')).toBeInTheDocument()
        expect(screen.getByText('Add Task')).toBeInTheDocument()
      })
    }
  })

  it('shows Today button', async () => {
    renderCalendar()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
  })

  it('fetches data on mount', async () => {
    renderCalendar()
    
    await waitFor(() => {
      expect(db.getTasks).toHaveBeenCalled()
      expect(db.getDailyLogs).toHaveBeenCalled()
      expect(db.getProjects).toHaveBeenCalled()
    })
  })
})
