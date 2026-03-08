import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import InvoiceForm from './InvoiceForm'
import { initDB, clearDatabase, getProjects, saveProject, getInvoices, saveTimeEntry } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('InvoiceForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<InvoiceForm />)
    
    expect(screen.getByLabelText(/client name/i)).toBeDefined()
    expect(screen.getByLabelText(/client email/i)).toBeDefined()
    expect(screen.getByLabelText(/client address/i)).toBeDefined()
    expect(screen.getByLabelText(/issue date/i)).toBeDefined()
    expect(screen.getByLabelText(/due date/i)).toBeDefined()
    expect(screen.getByLabelText(/tax rate/i)).toBeDefined()
    expect(screen.getByLabelText(/status/i)).toBeDefined()
  })

  it('shows error when submitting without client name', async () => {
    renderWithRouter(<InvoiceForm />)
    
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /invoice form/i }))
    })
    
    expect(screen.getByText(/please enter a client name/i)).toBeDefined()
  })

  it('shows error when submitting without line items', async () => {
    renderWithRouter(<InvoiceForm />)
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/client name/i), {
        target: { value: 'Test Client' }
      })
      
      const descriptionInput = screen.getByPlaceholderText('Description')
      fireEvent.change(descriptionInput, {
        target: { value: '' }
      })
      
      fireEvent.submit(screen.getByRole('form', { name: /invoice form/i }))
    })
    
    expect(screen.getByText(/please add at least one line item/i)).toBeDefined()
  })

  it('saves invoice to database', async () => {
    renderWithRouter(<InvoiceForm />)
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/client name/i), {
        target: { value: 'Acme Corp' }
      })
      fireEvent.change(screen.getByLabelText(/client email/i), {
        target: { value: 'billing@acme.com' }
      })
      
      const descriptionInput = screen.getByPlaceholderText('Description')
      fireEvent.change(descriptionInput, {
        target: { value: 'Plumbing services' }
      })
      
      const numberInputs = screen.getAllByRole('spinbutton')
      const rateInput = numberInputs[1] as HTMLInputElement
      fireEvent.change(rateInput, {
        target: { value: '100' }
      })
      
      fireEvent.submit(screen.getByRole('form', { name: /invoice form/i }))
    })
    
    await waitFor(async () => {
      const invoices = await getInvoices()
      expect(invoices.length).toBeGreaterThan(0)
      expect(invoices[0].clientName).toBe('Acme Corp')
      expect(invoices[0].clientEmail).toBe('billing@acme.com')
      expect(invoices[0].lineItems[0].description).toBe('Plumbing services')
    }, { timeout: 3000 })
  })

  it('calculates totals correctly', async () => {
    renderWithRouter(<InvoiceForm />)
    
    const descriptionInput = screen.getByPlaceholderText('Description')
    const numberInputs = screen.getAllByRole('spinbutton')
    
    await act(async () => {
      fireEvent.change(descriptionInput, {
        target: { value: 'Test item' }
      })
      fireEvent.change(numberInputs[0], {
        target: { value: '2' }
      })
      fireEvent.change(numberInputs[1], {
        target: { value: '50' }
      })
    })
    
    await waitFor(() => {
      const amounts = screen.getAllByText('$100.00')
      expect(amounts.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('adds and removes line items', async () => {
    renderWithRouter(<InvoiceForm />)
    
    await act(async () => {
      fireEvent.click(screen.getByText(/\+ add line item/i))
    })
    
    const lineItemInputs = screen.getAllByPlaceholderText('Description')
    expect(lineItemInputs.length).toBe(2)
    
    await act(async () => {
      const removeButtons = screen.getAllByText('Remove')
      fireEvent.click(removeButtons[0])
    })
    
    await waitFor(() => {
      const remainingInputs = screen.getAllByPlaceholderText('Description')
      expect(remainingInputs.length).toBe(1)
    })
  })

  it('loads projects and populates client info', async () => {
    await saveProject({ 
      name: 'Downtown Project', 
      client: 'Jane Smith',
      address: '123 Main St'
    })
    
    renderWithRouter(<InvoiceForm />)
    
    await waitFor(async () => {
      const projects = await getProjects()
      expect(projects.length).toBeGreaterThan(0)
    })
    
    const projects = await getProjects()
    
    await act(async () => {
      const projectSelect = document.getElementById('project') as HTMLSelectElement
      fireEvent.change(projectSelect, {
        target: { value: projects[0].id }
      })
    })
    
    await waitFor(() => {
      const clientNameInput = screen.getByLabelText(/client name/i) as HTMLInputElement
      expect(clientNameInput.value).toBe('Jane Smith')
    })
  })

  it('shows time entry buttons when project has time entries', async () => {
    const projectId = await saveProject({ name: 'Test Project' })
    await saveTimeEntry({
      projectId,
      startTime: Date.now() - 7200000,
      endTime: Date.now(),
      duration: 7200,
      notes: 'Test work'
    })
    
    renderWithRouter(<InvoiceForm />)
    
    await waitFor(async () => {
      const projects = await getProjects()
      expect(projects.length).toBeGreaterThan(0)
    })
    
    const projects = await getProjects()
    
    await act(async () => {
      const projectSelect = document.getElementById('project') as HTMLSelectElement
      fireEvent.change(projectSelect, {
        target: { value: projects[0].id }
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText(/add time entries:/i)).toBeDefined()
    })
  })

  it('renders with initial data in edit mode', () => {
    const initialData = {
      clientName: 'Existing Client',
      clientEmail: 'existing@test.com',
      issueDate: '2026-03-01',
      dueDate: '2026-03-31',
      lineItems: [{
        id: 'item-1',
        type: 'custom' as const,
        description: 'Existing item',
        quantity: 1,
        rate: 100,
        amount: 100
      }],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'draft' as const
    }
    
    renderWithRouter(<InvoiceForm editId="test-id" initialData={initialData} />)
    
    expect(screen.getByText(/edit invoice/i)).toBeDefined()
    expect(screen.getByText(/update invoice/i)).toBeDefined()
    
    const clientNameInput = screen.getByLabelText(/client name/i) as HTMLInputElement
    expect(clientNameInput.value).toBe('Existing Client')
  })

  it('calculates tax correctly', async () => {
    renderWithRouter(<InvoiceForm />)
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/client name/i), {
        target: { value: 'Test Client' }
      })
      
      const descriptionInput = screen.getByPlaceholderText('Description')
      fireEvent.change(descriptionInput, {
        target: { value: 'Test item' }
      })
      
      const numberInputs = screen.getAllByRole('spinbutton')
      fireEvent.change(numberInputs[1], {
        target: { value: '100' }
      })
      
      fireEvent.change(screen.getByLabelText(/tax rate/i), {
        target: { value: '10' }
      })
    })
    
    await waitFor(() => {
      const taxText = screen.getByText(/\$10\.00/)
      expect(taxText).toBeDefined()
    }, { timeout: 3000 })
  })
})
