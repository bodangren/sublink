import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProjectForm from './ProjectForm'
import { initDB, saveProject, getProjects, clearDatabase, getProject } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ProjectForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<ProjectForm />)
    
    expect(screen.getByLabelText(/Project Name/i)).toBeDefined()
    expect(screen.getByLabelText(/Client/i)).toBeDefined()
    expect(screen.getByLabelText(/Address/i)).toBeDefined()
    expect(screen.getByLabelText(/Contract Value/i)).toBeDefined()
    expect(screen.getByLabelText(/Start Date/i)).toBeDefined()
    expect(screen.getByLabelText(/End Date/i)).toBeDefined()
    expect(screen.getByLabelText(/Notes/i)).toBeDefined()
  })

  it('creates a new project', async () => {
    renderWithRouter(<ProjectForm />)
    
    const nameInput = screen.getByLabelText(/Project Name/i)
    fireEvent.change(nameInput, { target: { value: 'New Test Project' } })
    
    const clientInput = screen.getByLabelText(/Client/i)
    fireEvent.change(clientInput, { target: { value: 'Test Client' } })
    
    const submitButton = screen.getByText(/Create Project/i)
    fireEvent.click(submitButton)
    
    await waitFor(async () => {
      const projects = await getProjects()
      expect(projects.length).toBe(1)
      expect(projects[0].name).toBe('New Test Project')
      expect(projects[0].client).toBe('Test Client')
    })
  })

  it('shows edit mode when editId is provided', async () => {
    const projectId = await saveProject({ 
      name: 'Existing Project', 
      client: 'Existing Client' 
    })
    const project = await getProject(projectId)
    
    renderWithRouter(<ProjectForm editId={projectId} initialData={{
      name: project!.name,
      client: project!.client || '',
      address: project!.address || '',
      contractValue: project!.contractValue || '',
      startDate: project!.startDate || '',
      endDate: project!.endDate || '',
      notes: project!.notes || ''
    }} />)
    
    expect(screen.getByDisplayValue('Existing Project')).toBeDefined()
    expect(screen.getByDisplayValue('Existing Client')).toBeDefined()
    expect(screen.getByText(/Update Project/i)).toBeDefined()
  })

  it('requires project name', async () => {
    renderWithRouter(<ProjectForm />)
    
    const submitButton = screen.getByText(/Create Project/i)
    fireEvent.click(submitButton)
    
    const nameInput = screen.getByLabelText(/Project Name/i)
    expect(nameInput.hasAttribute('required')).toBe(true)
  })
})
