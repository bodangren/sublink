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
      expect(screen.getByText('Test Project')).toBeDefined()
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
    
    const now = Date.now()
    await saveTimeEntry({
      projectId: projects[0].id,
      startTime: now - 3600000,
      endTime: now,
      duration: 3600,
    })
    await saveTimeEntry({
      projectId: projects[1].id,
      startTime: now - 7200000,
      endTime: now - 3600000,
      duration: 3600,
    })
    
    renderWithRouter(<TimeEntryList />)
    
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeDefined()
      expect(screen.getByText('Project B')).toBeDefined()
    })
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: projects[0].id } })
    
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeDefined()
      expect(screen.queryByText('Project B')).toBeNull()
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
      expect(screen.getByText('Test Project')).toBeDefined()
    })
    
    window.confirm = () => true
    const deleteButtons = screen.getAllByText(/delete/i)
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText(/no time entries yet/i)).toBeDefined()
    })
  })
})
