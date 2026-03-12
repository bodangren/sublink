import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ChangeOrderForm from './ChangeOrderForm'
import { initDB, clearDatabase, saveProject, getAllChangeOrders } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ChangeOrderForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<ChangeOrderForm />)
    
    expect(screen.getByLabelText(/project/i)).toBeDefined()
    expect(screen.getByLabelText(/description of change/i)).toBeDefined()
    expect(screen.getByLabelText(/cost adjustment/i)).toBeDefined()
    expect(screen.getByLabelText(/reason/i)).toBeDefined()
    expect(screen.getByLabelText(/contract reference/i)).toBeDefined()
    expect(screen.getByLabelText(/status/i)).toBeDefined()
    expect(screen.getByLabelText(/notes/i)).toBeDefined()
  })

  it('populates project dropdown with existing projects', async () => {
    await saveProject({ name: 'Project Alpha', client: 'Client A' })
    await saveProject({ name: 'Project Beta', client: 'Client B' })
    
    renderWithRouter(<ChangeOrderForm />)
    
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeDefined()
      expect(screen.getByText('Project Beta')).toBeDefined()
    })
  })

  it('saves change order to database', async () => {
    await saveProject({ name: 'Save Project', client: 'Client' })
    
    renderWithRouter(<ChangeOrderForm />)
    
    await waitFor(() => {
      expect(screen.getByText('Save Project')).toBeDefined()
    })
    
    const projectOption = screen.getByText('Save Project')
    fireEvent.change(screen.getByLabelText(/project/i), { 
      target: { value: projectOption.getAttribute('value') || '' } 
    })
    
    fireEvent.change(screen.getByLabelText(/description of change/i), { 
      target: { value: 'New electrical outlets in kitchen' } 
    })
    fireEvent.change(screen.getByLabelText(/cost adjustment/i), { 
      target: { value: '1500' } 
    })
    fireEvent.change(screen.getByLabelText(/reason/i), { 
      target: { value: 'Client requested additional outlets' } 
    })
    fireEvent.change(screen.getByLabelText(/contract reference/i), { 
      target: { value: 'Section 3.2' } 
    })
    fireEvent.change(screen.getByLabelText(/notes/i), { 
      target: { value: 'Coordinate with plumber' } 
    })
    
    const submitButton = screen.getByRole('button', { name: /create change order/i })
    fireEvent.click(submitButton)
    
    await waitFor(async () => {
      const changeOrders = await getAllChangeOrders()
      expect(changeOrders.length).toBe(1)
      expect(changeOrders[0].description).toBe('New electrical outlets in kitchen')
      expect(changeOrders[0].costAdjustment).toBe(1500)
      expect(changeOrders[0].reason).toBe('Client requested additional outlets')
      expect(changeOrders[0].contractReference).toBe('Section 3.2')
      expect(changeOrders[0].notes).toBe('Coordinate with plumber')
    })
  })

  it('shows addition indicator for positive cost', () => {
    renderWithRouter(<ChangeOrderForm />)
    
    fireEvent.change(screen.getByLabelText(/cost adjustment/i), { 
      target: { value: '500' } 
    })
    
    expect(screen.getByText(/addition/i)).toBeDefined()
    expect(screen.getByText('$500.00')).toBeDefined()
  })

  it('shows deduction indicator for negative cost', () => {
    renderWithRouter(<ChangeOrderForm />)
    
    fireEvent.change(screen.getByLabelText(/cost adjustment/i), { 
      target: { value: '-300' } 
    })
    
    expect(screen.getByText(/deduction/i)).toBeDefined()
    expect(screen.getByText('$300.00')).toBeDefined()
  })

  it('has cancel button', () => {
    renderWithRouter(<ChangeOrderForm />)
    
    expect(screen.getByText(/cancel/i)).toBeDefined()
  })

  it('shows edit mode title when editId is provided', () => {
    renderWithRouter(<ChangeOrderForm editId="test-id" />)
    
    expect(screen.getByRole('heading', { name: /edit change order/i })).toBeDefined()
  })

  it('shows create mode title by default', () => {
    renderWithRouter(<ChangeOrderForm />)
    
    expect(screen.getByRole('heading', { name: /create change order/i })).toBeDefined()
  })

  it('has all status options', () => {
    renderWithRouter(<ChangeOrderForm />)
    
    expect(screen.getByText('Draft')).toBeDefined()
    expect(screen.getByText('Submitted')).toBeDefined()
    expect(screen.getByText('Approved')).toBeDefined()
    expect(screen.getByText('Rejected')).toBeDefined()
  })
})
