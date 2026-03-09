import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DailyLogDetail from './DailyLogDetail'
import { initDB, clearDatabase, saveDailyLog, savePhoto } from '../db'
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

  it('displays photo count badge when photos exist', async () => {
    const photo1Id = await savePhoto({
      imageData: 'data:image/png;base64,test1',
      capturedAt: Date.now(),
      watermarkData: 'test1'
    })
    const photo2Id = await savePhoto({
      imageData: 'data:image/png;base64,test2',
      capturedAt: Date.now(),
      watermarkData: 'test2'
    })
    
    await initDB()
    const logIdWithPhotos = await saveDailyLog({
      date: '2026-03-08',
      project: 'Photo Test Project',
      weather: 'Sunny',
      workPerformed: 'Work with photos',
      personnel: 'Team',
      photoIds: [photo1Id, photo2Id]
    })

    renderWithRouter(<DailyLogDetail logId={logIdWithPhotos} />)
    
    await waitFor(() => {
      expect(screen.getByText(/2 photos/)).toBeDefined()
    })
  })

  it('displays site photos section when photos exist', async () => {
    const photoId = await savePhoto({
      imageData: 'data:image/png;base64,testphoto',
      capturedAt: Date.now(),
      watermarkData: 'testphoto'
    })
    
    await initDB()
    const logIdWithPhotos = await saveDailyLog({
      date: '2026-03-08',
      project: 'Photo Display Test',
      weather: 'Clear',
      workPerformed: 'Test work',
      personnel: 'Test team',
      photoIds: [photoId]
    })

    renderWithRouter(<DailyLogDetail logId={logIdWithPhotos} />)
    
    await waitFor(() => {
      expect(screen.getByText(/site photos/i)).toBeDefined()
    })
  })

  it('does not display photo count badge when no photos', async () => {
    renderWithRouter(<DailyLogDetail logId={logId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Detail Test Project')).toBeDefined()
    })
    
    expect(screen.queryByText(/photo/)).toBeNull()
  })
})
