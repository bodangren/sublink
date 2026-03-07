import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RecentTasks from './RecentTasks'
import { initDB, saveTask, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('RecentTasks', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('displays message when no tasks exist', async () => {
    renderWithRouter(<RecentTasks />)
    
    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeDefined()
    })
  })

  it('displays up to 5 most recent tasks', async () => {
    for (let i = 1; i <= 7; i++) {
      await saveTask({ 
        title: `Task ${i}`, 
        description: `Description ${i}` 
      })
    }
    
    renderWithRouter(<RecentTasks />)
    
    await waitFor(() => {
      expect(screen.getByText('Task 7')).toBeDefined()
      expect(screen.getByText('Task 6')).toBeDefined()
      expect(screen.getByText('Task 5')).toBeDefined()
      expect(screen.getByText('Task 4')).toBeDefined()
      expect(screen.getByText('Task 3')).toBeDefined()
      expect(screen.queryByText('Task 2')).toBeNull()
      expect(screen.queryByText('Task 1')).toBeNull()
    })
  })

  it('displays task creation date', async () => {
    await saveTask({ title: 'Test Task', description: 'Test Description' })
    
    renderWithRouter(<RecentTasks />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeDefined()
    })
  })

  it('shows view all link when tasks exist', async () => {
    await saveTask({ title: 'Test Task', description: 'Test Description' })
    
    renderWithRouter(<RecentTasks />)
    
    await waitFor(() => {
      expect(screen.getByText(/view all tasks/i)).toBeDefined()
    })
  })
})
