import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DailyLogDetail from './DailyLogDetail'
import { initDB, clearDatabase, saveDailyLog } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfirmProvider>{component}</ConfirmProvider>
    </BrowserRouter>
  )
}

describe('DailyLogDetail', () => {
  let logId: string

  beforeEach(async () => {
    await initDB()
    await clearDatabase()
    logId = await saveDailyLog({
      date: '2026-03-08',
      project: 'Detail Test Project',
      weather: 'Partly Cloudy, 68F',
      workPerformed: 'Completed electrical rough-in on floors 3 and 4',
      personnel: 'John (Lead), Mike, Sarah',
      delays: 'Material delivery delayed 2 hours',
      equipment: 'Scissor lift, Power tools',
      notes: 'Need to coordinate with HVAC team tomorrow'
    })
  })

  it('displays log details', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Detail Test Project')).toBeDefined()
    })
  })

  it('displays weather conditions', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Partly Cloudy, 68F')).toBeDefined()
    })
  })

  it('displays work performed', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Completed electrical rough-in/)).toBeDefined()
    })
  })

  it('displays personnel', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/John \(Lead\), Mike, Sarah/)).toBeDefined()
    })
  })

  it('displays delays section when present', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Delays \/ Issues/)).toBeDefined()
      expect(screen.getByText(/Material delivery delayed/)).toBeDefined()
    })
  })

  it('displays equipment section when present', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Equipment Used/)).toBeDefined()
    })
  })

  it('displays notes section when present', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Additional Notes/)).toBeDefined()
    })
  })

  it('shows export pdf button', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/export pdf/i)).toBeDefined()
    })
  })

  it('shows edit and delete buttons', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeDefined()
      expect(screen.getByText('Delete')).toBeDefined()
    })
  })

  it('shows not found message for invalid id', async () => {
    renderWithRouter(<DailyLogDetail logId="invalid-id" />)
    
    await waitFor(() => {
      expect(screen.getByText(/daily log not found/i)).toBeDefined()
    })
  })
})
