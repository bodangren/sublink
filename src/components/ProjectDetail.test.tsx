import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProjectDetail from './ProjectDetail'
import { 
  initDB, saveProject, clearDatabase, 
  saveTask, saveDailyLog
} from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement, projectId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <Routes>
        <Route path="/projects/:id" element={component} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProjectDetail', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows project not found for invalid id', async () => {
    renderWithRouter(<ProjectDetail />, 'non-existent-id')
    
    await waitFor(() => {
      expect(screen.getByText(/Project not found/i)).toBeDefined()
    })
  })

  it('displays project details', async () => {
    const projectId = await saveProject({ 
      name: 'Test Project', 
      client: 'Test Client',
      address: '123 Test St',
      contractValue: '75000'
    })
    
    renderWithRouter(<ProjectDetail />, projectId)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeDefined()
      expect(screen.getByText('Test Client')).toBeDefined()
      expect(screen.getByText('123 Test St')).toBeDefined()
    })
  })

  it('shows counts of related items', async () => {
    const projectId = await saveProject({ name: 'Project with Items' })
    await saveTask({ title: 'Task 1', description: 'Desc', projectId })
    await saveTask({ title: 'Task 2', description: 'Desc', projectId })
    await saveDailyLog({ 
      date: '2026-03-08', 
      project: 'Project with Items', 
      weather: 'Sunny',
      workPerformed: 'Work',
      personnel: 'John',
      projectId 
    })
    
    renderWithRouter(<ProjectDetail />, projectId)
    
    await waitFor(() => {
      const taskCount = screen.getByText('2')
      expect(taskCount).toBeDefined()
      const logCount = screen.getByText('1')
      expect(logCount).toBeDefined()
    })
  })

  it('shows quick action buttons', async () => {
    const projectId = await saveProject({ name: 'Test Project' })
    
    renderWithRouter(<ProjectDetail />, projectId)
    
    await waitFor(() => {
      expect(screen.getByText(/\+ Daily Log/i)).toBeDefined()
      expect(screen.getByText(/\+ Task/i)).toBeDefined()
      expect(screen.getByText(/\+ Waiver/i)).toBeDefined()
    })
  })
})
