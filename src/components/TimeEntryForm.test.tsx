import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TimeEntryForm from './TimeEntryForm'
import { initDB, clearDatabase, getProjects, saveProject, getTimeEntries } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('TimeEntryForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<TimeEntryForm />)
    
    expect(screen.getByLabelText(/project/i)).toBeDefined()
    expect(screen.getByLabelText(/start time/i)).toBeDefined()
    expect(screen.getByLabelText(/end time/i)).toBeDefined()
    expect(screen.getByLabelText(/notes/i)).toBeDefined()
  })

  it('shows error when submitting without project', async () => {
    renderWithRouter(<TimeEntryForm />)
    
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /time entry form/i }))
    })
    
    expect(screen.getByText(/please select a project/i)).toBeDefined()
  })

  it('shows error when end time is before start time', async () => {
    await saveProject({ name: 'Test Project' })
    
    renderWithRouter(<TimeEntryForm />)
    
    await waitFor(async () => {
      const projects = await getProjects()
      expect(projects.length).toBeGreaterThan(0)
    })
    
    const projects = await getProjects()
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/project/i), {
        target: { value: projects[0].id }
      })
      
      const now = new Date()
      const earlier = new Date(now.getTime() - 3600000)
      
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: now.toISOString().slice(0, 16) }
      })
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: earlier.toISOString().slice(0, 16) }
      })
      
      fireEvent.click(screen.getByText(/save entry/i))
    })
    
    expect(screen.getByText(/end time must be after start time/i)).toBeDefined()
  })

  it('saves time entry to database', async () => {
    await saveProject({ name: 'Test Project' })
    
    renderWithRouter(<TimeEntryForm />)
    
    let projects: Awaited<ReturnType<typeof getProjects>> = []
    await waitFor(async () => {
      projects = await getProjects()
      expect(projects.length).toBeGreaterThan(0)
    })
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/project/i), {
        target: { value: projects[0].id }
      })
      
      const now = new Date()
      const earlier = new Date(now.getTime() - 3600000)
      
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: earlier.toISOString().slice(0, 16) }
      })
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: now.toISOString().slice(0, 16) }
      })
      
      fireEvent.change(screen.getByLabelText(/notes/i), {
        target: { value: 'Working on plumbing' }
      })
    })

    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /time entry form/i }))
    })
    
    await waitFor(async () => {
      const entries = await getTimeEntries()
      expect(entries.length).toBeGreaterThan(0)
      expect(entries[0].projectId).toBe(projects[0].id)
      expect(entries[0].notes).toBe('Working on plumbing')
    })
  })

  it('shows duration when times are set', async () => {
    await saveProject({ name: 'Test Project' })
    
    renderWithRouter(<TimeEntryForm />)
    
    await waitFor(async () => {
      const projects = await getProjects()
      expect(projects.length).toBeGreaterThan(0)
    })
    
    const projects = await getProjects()
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/project/i), {
        target: { value: projects[0].id }
      })
      
      const now = new Date()
      const earlier = new Date(now.getTime() - 7200000)
      
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: earlier.toISOString().slice(0, 16) }
      })
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: now.toISOString().slice(0, 16) }
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText(/duration:/i)).toBeDefined()
      expect(screen.getByText(/2h 0m/)).toBeDefined()
    })
  })

  it('renders with initial data in edit mode', () => {
    const now = new Date()
    const earlier = new Date(now.getTime() - 3600000)
    
    const initialData = {
      projectId: 'project-1',
      startTime: earlier.toISOString().slice(0, 16),
      endTime: now.toISOString().slice(0, 16),
      notes: 'Existing notes',
      taskId: '',
    }
    
    renderWithRouter(<TimeEntryForm editId="test-id" initialData={initialData} />)
    
    expect(screen.getByText(/edit time entry/i)).toBeDefined()
    expect(screen.getByText(/update entry/i)).toBeDefined()
  })
})
