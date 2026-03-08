import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProjectList from './ProjectList'
import { initDB, saveProject, getProjects, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ProjectList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows empty state when no projects exist', async () => {
    renderWithRouter(<ProjectList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no projects yet/i)).toBeDefined()
    })
  })

  it('displays list of projects', async () => {
    await saveProject({ name: 'Project 1', client: 'Client A' })
    await saveProject({ name: 'Project 2', client: 'Client B' })
    
    renderWithRouter(<ProjectList />)
    
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeDefined()
      expect(screen.getByText('Project 2')).toBeDefined()
      expect(screen.getByText('Client A')).toBeDefined()
      expect(screen.getByText('Client B')).toBeDefined()
    })
  })

  it('shows contract value for projects', async () => {
    await saveProject({ name: 'Project 1', contractValue: '50000' })
    
    renderWithRouter(<ProjectList />)
    
    await waitFor(() => {
      expect(screen.getByText(/Contract: \$50000/i)).toBeDefined()
    })
  })

  it('deletes project when confirmed', async () => {
    await saveProject({ name: 'Project to Delete' })
    
    renderWithRouter(<ProjectList />)
    
    await waitFor(() => {
      expect(screen.getByText('Project to Delete')).toBeDefined()
    })
    
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(async () => {
      const remainingProjects = await getProjects()
      expect(remainingProjects.length).toBe(0)
    })
  })
})
