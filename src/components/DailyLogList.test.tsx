import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DailyLogList from './DailyLogList'
import { initDB, clearDatabase, saveDailyLog } from '../db'
import 'fake-indexeddb/auto'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('DailyLogList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('displays message when no logs exist', async () => {
    renderWithRouter(<DailyLogList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no daily logs recorded yet/i)).toBeDefined()
    })
  })

  it('displays saved daily logs', async () => {
    await saveDailyLog({
      date: '2026-03-08',
      project: 'Test Project Alpha',
      weather: 'Sunny',
      workPerformed: 'Installed fixtures',
      personnel: 'John, Mike',
      delays: '',
      equipment: '',
      notes: ''
    })

    renderWithRouter(<DailyLogList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project Alpha')).toBeDefined()
    })
  })

  it('shows new log button', async () => {
    renderWithRouter(<DailyLogList />)
    
    await waitFor(() => {
      expect(screen.getByText(/new daily log/i)).toBeDefined()
    })
  })

  it('displays weather badge', async () => {
    await saveDailyLog({
      date: '2026-03-08',
      project: 'Weather Test Project',
      weather: 'Rainy, 55F',
      workPerformed: 'Work',
      personnel: 'Team',
      delays: '',
      equipment: '',
      notes: ''
    })

    renderWithRouter(<DailyLogList />)
    
    await waitFor(() => {
      expect(screen.getByText('Rainy, 55F')).toBeDefined()
    })
  })

  it('displays crew information', async () => {
    await saveDailyLog({
      date: '2026-03-08',
      project: 'Crew Test',
      weather: 'Clear',
      workPerformed: 'Work',
      personnel: 'Alice, Bob, Charlie',
      delays: '',
      equipment: '',
      notes: ''
    })

    renderWithRouter(<DailyLogList />)
    
    await waitFor(() => {
      expect(screen.getByText(/Alice, Bob, Charlie/)).toBeDefined()
    })
  })
})
