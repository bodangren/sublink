import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TimeEntryList from './TimeEntryList'
import { initDB, clearDatabase, saveProject, saveTimeEntry, getProjects } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('TimeEntryList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows empty state when no entries', async () => {
    renderWithRouter(<TimeEntryList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no time entries yet/i)).toBeDefined()
    })
  })

  it('displays time entries with project name', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    const now = Date.now()
    await saveTimeEntry({
      projectId: projects[0].id,
      startTime: now - 3600000,
      endTime: now,
      duration: 3600,
    })
    
    renderWithRouter(<TimeEntryList />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Project')).toHaveLength(2)
    })
  })

  it('shows total time section', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    const now = Date.now()
    await saveTimeEntry({
      projectId: projects[0].id,
      startTime: now - 3600000,
      endTime: now,
      duration: 3600,
    })
    
    renderWithRouter(<TimeEntryList />)
    
    await waitFor(() => {
      expect(screen.getByText(/total time/i)).toBeDefined()
    })
  })

  it('filters entries by project', async () => {
    await saveProject({ name: 'Project A' })
    await saveProject({ name: 'Project B' })
    const projects = await getProjects()
    const projectA = projects.find((project) => project.name === 'Project A')
    const projectB = projects.find((project) => project.name === 'Project B')

    expect(projectA).toBeDefined()
    expect(projectB).toBeDefined()
    
    const now = Date.now()
    await saveTimeEntry({
      projectId: projectA!.id,
      startTime: now - 3600000,
      endTime: now,
      duration: 3600,
    })
    await saveTimeEntry({
      projectId: projectB!.id,
      startTime: now - 7200000,
      endTime: now - 3600000,
      duration: 3600,
    })
    
    renderWithRouter(<TimeEntryList />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Project A')).toHaveLength(2)
      expect(screen.getAllByText('Project B')).toHaveLength(2)
    })
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: projectA!.id } })
    
    await waitFor(() => {
      expect(screen.getAllByText('Project A')).toHaveLength(2)
      expect(screen.queryAllByText('Project B')).toHaveLength(1)
    })
  })

  it('deletes entry on confirm', async () => {
    await saveProject({ name: 'Test Project' })
    const projects = await getProjects()
    
    const now = Date.now()
    await saveTimeEntry({
      projectId: projects[0].id,
      startTime: now - 3600000,
      endTime: now,
      duration: 3600,
    })
    
    renderWithRouter(<TimeEntryList />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Project')).toHaveLength(2)
    })
    
    window.confirm = () => true
    const deleteButtons = screen.getAllByText(/delete/i)
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText(/no time entries yet/i)).toBeDefined()
    })
  })
})
