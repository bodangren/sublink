import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TaskForm from './TaskForm'
import { initDB, getTasks, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('TaskForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<TaskForm />)
    
    expect(screen.getByLabelText(/title/i)).toBeDefined()
    expect(screen.getByLabelText(/description/i)).toBeDefined()
    expect(screen.getByLabelText(/contract reference/i)).toBeDefined()
  })

  it('saves new task to database', async () => {
    renderWithRouter(<TaskForm />)
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Install plumbing fixtures' }
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Install all fixtures in unit 4B' }
    })
    fireEvent.change(screen.getByLabelText(/contract reference/i), {
      target: { value: 'CONTRACT-2024-001' }
    })
    
    fireEvent.click(screen.getByText(/save task/i))
    
    await waitFor(async () => {
      const tasks = await getTasks()
      expect(tasks.length).toBeGreaterThan(0)
      expect(tasks[0].title).toBe('Install plumbing fixtures')
      expect(tasks[0].description).toBe('Install all fixtures in unit 4B')
      expect(tasks[0].contractReference).toBe('CONTRACT-2024-001')
    })
  })

  it('saves task without contract reference', async () => {
    renderWithRouter(<TaskForm />)
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Quick task' }
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'No contract needed' }
    })
    
    fireEvent.click(screen.getByText(/save task/i))
    
    await waitFor(async () => {
      const tasks = await getTasks()
      expect(tasks[0].contractReference).toBeUndefined()
    })
  })

  it('renders with initial data in edit mode', () => {
    const initialData = {
      title: 'Existing task',
      description: 'Existing description',
      contractReference: 'REF-123'
    }
    
    renderWithRouter(<TaskForm editId="test-id" initialData={initialData} />)
    
    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
    expect(titleInput.value).toBe('Existing task')
    
    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
    expect(descInput.value).toBe('Existing description')
    
    const refInput = screen.getByLabelText(/contract reference/i) as HTMLInputElement
    expect(refInput.value).toBe('REF-123')
  })

  it('shows different button text in edit mode', () => {
    const initialData = {
      title: 'Test',
      description: 'Test',
      contractReference: ''
    }
    
    renderWithRouter(<TaskForm editId="test-id" initialData={initialData} />)
    
    expect(screen.getByText(/update task/i)).toBeDefined()
  })
})
