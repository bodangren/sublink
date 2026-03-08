import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ActiveTimer from './ActiveTimer'
import { initDB, clearDatabase, saveProject, getTimeEntries, getProjects } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfirmProvider>{component}</ConfirmProvider>
    </BrowserRouter>
  )
}

describe('ActiveTimer', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders nothing when no timer is running', () => {
    const { container } = renderWithRouter(<ActiveTimer />)
    expect(container.firstChild).toBeNull()
  })

  it('shows compact timer when timer is running', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    const startTime = Date.now()
    localStorage.setItem('sublink-active-timer', JSON.stringify({
      projectId: projects[0].id,
      projectName: 'Test Project',
      startTime,
    }))
    
    renderWithRouter(<ActiveTimer compact />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeDefined()
      expect(screen.getByText(/stop/i)).toBeDefined()
    })
  })

  it('stops and saves timer on click', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    const startTime = Date.now() - 1000
    localStorage.setItem('sublink-active-timer', JSON.stringify({
      projectId: projects[0].id,
      projectName: 'Test Project',
      startTime,
    }))
    
    renderWithRouter(<ActiveTimer compact />)
    
    await waitFor(() => {
      expect(screen.getByText(/stop/i)).toBeDefined()
    })
    
    fireEvent.click(screen.getByText(/stop/i))
    
    await waitFor(async () => {
      const entries = await getTimeEntries()
      expect(entries.length).toBeGreaterThan(0)
      expect(entries[0].projectId).toBe(projects[0].id)
    })
    
    expect(localStorage.getItem('sublink-active-timer')).toBeNull()
  })

  it('shows full timer in non-compact mode', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    localStorage.setItem('sublink-active-timer', JSON.stringify({
      projectId: projects[0].id,
      projectName: 'Test Project',
      startTime: Date.now(),
    }))
    
    renderWithRouter(<ActiveTimer />)
    
    await waitFor(() => {
      expect(screen.getByText(/timer running/i)).toBeDefined()
      expect(screen.getByText(/add notes/i)).toBeDefined()
      expect(screen.getByText(/stop & save/i)).toBeDefined()
    })
  })

  it('shows notes input when Add Notes clicked', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    localStorage.setItem('sublink-active-timer', JSON.stringify({
      projectId: projects[0].id,
      projectName: 'Test Project',
      startTime: Date.now(),
    }))
    
    renderWithRouter(<ActiveTimer />)
    
    await waitFor(() => {
      expect(screen.getByText(/add notes/i)).toBeDefined()
    })
    
    fireEvent.click(screen.getByText(/add notes/i))
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/what are you working on/i)).toBeDefined()
    })
  })

  it('discards timer on confirm', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    localStorage.setItem('sublink-active-timer', JSON.stringify({
      projectId: projects[0].id,
      projectName: 'Test Project',
      startTime: Date.now(),
    }))
    
    renderWithRouter(<ActiveTimer />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /discard timer/i })).toBeDefined()
    })
    
    fireEvent.click(screen.getByRole('button', { name: /discard timer/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Discard this timer? Time will not be saved.')).toBeDefined()
    })
    
    const confirmButtons = screen.getAllByRole('button', { name: 'Discard' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    
    await waitFor(() => {
      expect(localStorage.getItem('sublink-active-timer')).toBeNull()
    })
  })
})
