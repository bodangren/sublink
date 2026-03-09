import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TodayLogStatus from './TodayLogStatus'
import { initDB, clearDatabase, saveDailyLog, savePhoto } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('TodayLogStatus', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows pending status when no log for today', async () => {
    renderWithRouter(<TodayLogStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/daily log pending/i)).toBeDefined()
    })
  })

  it('shows create log button when no log exists', async () => {
    renderWithRouter(<TodayLogStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/create log/i)).toBeDefined()
    })
  })

  it('shows complete status when log exists for today', async () => {
    const today = new Date().toISOString().split('T')[0]
    await saveDailyLog({
      date: today,
      project: 'Today Project',
      weather: 'Sunny',
      workPerformed: 'Work done today',
      personnel: 'Team',
      delays: '',
      equipment: '',
      notes: ''
    })

    renderWithRouter(<TodayLogStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/today's log complete/i)).toBeDefined()
    })
  })

  it('shows view logs button when log exists', async () => {
    const today = new Date().toISOString().split('T')[0]
    await saveDailyLog({
      date: today,
      project: 'Today Project',
      weather: 'Sunny',
      workPerformed: 'Work done today',
      personnel: 'Team',
      delays: '',
      equipment: '',
      notes: ''
    })

    renderWithRouter(<TodayLogStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/view logs/i)).toBeDefined()
    })
  })

  it('does not show pending for yesterday log', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    await saveDailyLog({
      date: yesterday,
      project: 'Yesterday Project',
      weather: 'Cloudy',
      workPerformed: 'Work done yesterday',
      personnel: 'Team',
      delays: '',
      equipment: '',
      notes: ''
    })

    renderWithRouter(<TodayLogStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/daily log pending/i)).toBeDefined()
    })
  })
})
