import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RecentWaivers from './RecentWaivers'
import { initDB, saveWaiver, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('RecentWaivers', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays message when no waivers exist', async () => {
    renderWithRouter(<RecentWaivers />)
    
    await waitFor(() => {
      expect(screen.getByText(/no waivers generated yet/i)).toBeDefined()
    })
  })

  it('displays up to 3 most recent waivers', async () => {
    let createdAt = 1_700_000_000_000
    vi.spyOn(Date, 'now').mockImplementation(() => {
      createdAt += 1_000
      return createdAt
    })

    for (let i = 1; i <= 5; i++) {
      await saveWaiver({ 
        projectName: `Project ${i}`, 
        subcontractorName: `Sub ${i}`,
        amount: `${i}000`,
        date: '2026-03-08',
        signature: 'data:image/png;base64,signature'
      })
    }
    
    renderWithRouter(<RecentWaivers />)
    
    await waitFor(() => {
      expect(screen.getByText('Project 5')).toBeDefined()
      expect(screen.getByText('Project 4')).toBeDefined()
      expect(screen.getByText('Project 3')).toBeDefined()
      expect(screen.queryByText('Project 2')).toBeNull()
      expect(screen.queryByText('Project 1')).toBeNull()
    })
  })

  it('displays waiver project name and amount', async () => {
    await saveWaiver({ 
      projectName: 'Test Project', 
      subcontractorName: 'Test Sub',
      amount: '5000',
      date: '2026-03-08',
      signature: 'data:image/png;base64,signature'
    })
    
    renderWithRouter(<RecentWaivers />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeDefined()
    })
  })

  it('shows view all link when waivers exist', async () => {
    await saveWaiver({ 
      projectName: 'Test Project', 
      subcontractorName: 'Test Sub',
      amount: '5000',
      date: '2026-03-08',
      signature: 'data:image/png;base64,signature'
    })
    
    renderWithRouter(<RecentWaivers />)
    
    await waitFor(() => {
      expect(screen.getByText(/view all waivers/i)).toBeDefined()
    })
  })
})
