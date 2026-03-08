import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TimeSummary from './TimeSummary'
import { initDB, clearDatabase, saveProject, saveTimeEntry, getProjects } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('TimeSummary', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('shows zero time when no entries', async () => {
    renderWithRouter(<TimeSummary />)
    
    await waitFor(() => {
      expect(screen.getByText(/time today/i)).toBeDefined()
      expect(screen.getByText('0s')).toBeDefined()
    })
  })

  it('shows total time for today', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    const today = new Date()
    today.setHours(10, 0, 0, 0)
    
    await saveTimeEntry({
      projectId: projects[0].id,
      startTime: today.getTime(),
      endTime: today.getTime() + 3600000,
      duration: 3600,
    })
    
    renderWithRouter(<TimeSummary />)
    
    await waitFor(() => {
      expect(screen.getByText('1h 0m')).toBeDefined()
    })
  })

  it('shows start button when no timer running', async () => {
    renderWithRouter(<TimeSummary />)
    
    await waitFor(() => {
      expect(screen.getByText(/start/i)).toBeDefined()
    })
  })

  it('shows project picker on start click', async () => {
    await saveProject({ name: 'Project A' })
    await saveProject({ name: 'Project B' })
    
    renderWithRouter(<TimeSummary />)
    
    await waitFor(() => {
      expect(screen.getByText(/start/i)).toBeDefined()
    })
    
    fireEvent.click(screen.getByText(/start/i))
    
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeDefined()
      expect(screen.getByText('Project B')).toBeDefined()
    })
  })

  it('starts timer when project selected', async () => {
    await saveProject({ name: 'Test Project' })
    
    renderWithRouter(<TimeSummary />)
    
    await waitFor(() => {
      expect(screen.getByText(/start/i)).toBeDefined()
    })
    
    fireEvent.click(screen.getByText(/start/i))
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeDefined()
    })
    
    fireEvent.click(screen.getByText('Test Project'))
    
    await waitFor(() => {
      expect(localStorage.getItem('sublink-active-timer')).not.toBeNull()
    })
  })

  it('shows running indicator when timer active', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    localStorage.setItem('sublink-active-timer', JSON.stringify({
      projectId: projects[0].id,
      projectName: 'Test Project',
      startTime: Date.now(),
    }))
    
    renderWithRouter(<TimeSummary />)
    
    await waitFor(() => {
      expect(screen.getByText(/timer running/i)).toBeDefined()
    })
  })

  it('shows link to all entries', async () => {
    renderWithRouter(<TimeSummary />)
    
    await waitFor(() => {
      expect(screen.getByText(/view all entries/i)).toBeDefined()
    })
  })
})
