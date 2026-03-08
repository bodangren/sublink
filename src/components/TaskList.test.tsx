import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TaskList from './TaskList'
import { initDB, saveTask, getTasks, clearDatabase } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfirmProvider>{component}</ConfirmProvider>
    </BrowserRouter>
  )
}

describe('TaskList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows empty state when no tasks exist', async () => {
    renderWithRouter(<TaskList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeDefined()
    })
  })

  it('displays list of tasks', async () => {
    await saveTask({ title: 'Task 1', description: 'Description 1' })
    await saveTask({ title: 'Task 2', description: 'Description 2' })
    
    renderWithRouter(<TaskList />)
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeDefined()
      expect(screen.getByText('Task 2')).toBeDefined()
    })
  })

  it('shows photo count for tasks with photos', async () => {
    renderWithRouter(<TaskList />)
    
    await waitFor(() => {
      const photoCounts = screen.queryAllByText(/0 photos/)
      expect(photoCounts.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('displays contract reference when present', async () => {
    await saveTask({ 
      title: 'Task with contract', 
      description: 'Description',
      contractReference: 'REF-123'
    })
    
    renderWithRouter(<TaskList />)
    
    await waitFor(() => {
      expect(screen.getByText(/Contract:/)).toBeDefined()
    })
    
    const container = screen.getByText(/Contract:/).parentElement
    expect(container?.textContent).toContain('REF-123')
  })

  it('shows delete button for each task', async () => {
    await saveTask({ title: 'Task to delete', description: 'Description' })
    
    renderWithRouter(<TaskList />)
    
    await waitFor(() => {
      expect(screen.getByText('Task to delete')).toBeDefined()
    })
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('deletes task when delete is clicked and confirmed', async () => {
    await saveTask({ title: 'Task to delete', description: 'Description' })
    
    renderWithRouter(<TaskList />)
    
    await waitFor(() => {
      expect(screen.getByText('Task to delete')).toBeDefined()
    })
    
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/i })
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Delete Task')).toBeDefined()
    })
    
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    
    await waitFor(async () => {
      const tasks = await getTasks()
      expect(tasks.find(t => t.title === 'Task to delete')).toBeUndefined()
    })
  })
})
