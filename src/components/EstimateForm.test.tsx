import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EstimateForm from './EstimateForm'
import { initDB, clearDatabase, getEstimates, saveProject } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('EstimateForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<EstimateForm />)
    
    expect(screen.getByLabelText(/client name/i)).toBeDefined()
    expect(screen.getByLabelText(/client email/i)).toBeDefined()
    expect(screen.getByLabelText(/client address/i)).toBeDefined()
    expect(screen.getByLabelText(/issue date/i)).toBeDefined()
    expect(screen.getByLabelText(/valid until/i)).toBeDefined()
    expect(screen.getByLabelText(/tax rate/i)).toBeDefined()
    expect(screen.getByLabelText(/status/i)).toBeDefined()
  })

  it('shows error when submitting without client name', async () => {
    renderWithRouter(<EstimateForm />)
    
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /estimate form/i }))
    })
    
    expect(screen.getByText(/please enter a client name/i)).toBeDefined()
  })

  it('shows error when submitting without line items', async () => {
    renderWithRouter(<EstimateForm />)
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/client name/i), {
        target: { value: 'Test Client' }
      })
      
      const descriptionInput = screen.getByPlaceholderText('Description')
      fireEvent.change(descriptionInput, {
        target: { value: '' }
      })
      
      fireEvent.submit(screen.getByRole('form', { name: /estimate form/i }))
    })
    
    expect(screen.getByText(/please add at least one line item/i)).toBeDefined()
  })

  it('saves estimate to database', async () => {
    renderWithRouter(<EstimateForm />)
    
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
      
      fireEvent.submit(screen.getByRole('form', { name: /estimate form/i }))
    })
    
    await waitFor(async () => {
      const estimates = await getEstimates()
      expect(estimates.length).toBeGreaterThan(0)
      expect(estimates[0].clientName).toBe('Acme Corp')
      expect(estimates[0].clientEmail).toBe('billing@acme.com')
      expect(estimates[0].lineItems[0].description).toBe('Plumbing services')
    }, { timeout: 3000 })
  })

  it('calculates totals correctly', async () => {
    renderWithRouter(<EstimateForm />)
    
    const descriptionInput = screen.getByPlaceholderText('Description')
    const numberInputs = screen.getAllByRole('spinbutton')
    
    await act(async () => {
      fireEvent.change(descriptionInput, {
        target: { value: 'Test Item' }
      })
      
      const quantityInput = numberInputs[0] as HTMLInputElement
      fireEvent.change(quantityInput, {
        target: { value: '5' }
      })
      
      const rateInput = numberInputs[1] as HTMLInputElement
      fireEvent.change(rateInput, {
        target: { value: '50' }
      })
    })
    
    await waitFor(() => {
      const amounts = screen.getAllByText('$250.00')
      expect(amounts.length).toBeGreaterThan(0)
    })
  })

  it('calculates tax correctly', async () => {
    renderWithRouter(<EstimateForm />)
    
    const descriptionInput = screen.getByPlaceholderText('Description')
    const numberInputs = screen.getAllByRole('spinbutton')
    
    await act(async () => {
      fireEvent.change(descriptionInput, {
        target: { value: 'Test Item' }
      })
      
      const rateInput = numberInputs[1] as HTMLInputElement
      fireEvent.change(rateInput, {
        target: { value: '100' }
      })
      
      const taxRateInput = screen.getByLabelText(/tax rate/i)
      fireEvent.change(taxRateInput, {
        target: { value: '10' }
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText(/\$10.00/)).toBeDefined()
      expect(screen.getByText(/\$110.00/)).toBeDefined()
    })
  })

  it('adds and removes line items', async () => {
    renderWithRouter(<EstimateForm />)
    
    await act(async () => {
      const addButton = screen.getByRole('button', { name: /\+ add line item/i })
      fireEvent.click(addButton)
    })
    
    const descriptions = screen.getAllByPlaceholderText('Description')
    expect(descriptions.length).toBe(2)
    
    await act(async () => {
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      fireEvent.click(removeButtons[0])
    })
    
    const descriptionsAfterRemove = screen.getAllByPlaceholderText('Description')
    expect(descriptionsAfterRemove.length).toBe(1)
  })

  it('populates project dropdown with existing projects', async () => {
    await saveProject({ name: 'Test Project' })
    
    renderWithRouter(<EstimateForm />)
    
    await waitFor(() => {
      const projectSelect = screen.getByRole('combobox', { name: /project/i })
      expect(projectSelect.textContent).toContain('Test Project')
    })
  })

  it('auto-fills client info from selected project', async () => {
    const projectId = await saveProject({ 
      name: 'Project with Client', 
      client: 'Client Name',
      address: '123 Main St'
    })
    
    renderWithRouter(<EstimateForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Project with Client' })).toBeDefined()
    })
    
    const projectSelect = screen.getByRole('combobox', { name: /project/i }) as HTMLSelectElement
    
    await act(async () => {
      fireEvent.change(projectSelect, {
        target: { value: projectId }
      })
    })
    
    await waitFor(() => {
      const clientNameInput = screen.getByLabelText(/client name/i) as HTMLInputElement
      expect(clientNameInput.value).toBe('Client Name')
    }, { timeout: 2000 })
  })

  it('renders with initial data in edit mode', () => {
    renderWithRouter(
      <EstimateForm 
        editId="test-id"
        initialData={{
          clientName: 'Existing Client',
          clientEmail: 'existing@example.com',
          issueDate: '2024-01-01',
          validUntilDate: '2024-02-01',
          lineItems: [{ id: '1', description: 'Existing Item', quantity: 1, rate: 100, amount: 100 }],
          subtotal: 100,
          taxRate: 0,
          taxAmount: 0,
          total: 100,
          status: 'draft',
        }}
      />
    )
    
    expect((screen.getByLabelText(/client name/i) as HTMLInputElement).value).toBe('Existing Client')
    expect((screen.getByLabelText(/client email/i) as HTMLInputElement).value).toBe('existing@example.com')
    expect(screen.getByDisplayValue('Existing Item')).toBeDefined()
  })

  it('displays all status options', () => {
    renderWithRouter(<EstimateForm />)
    
    const statusSelect = screen.getByLabelText(/status/i)
    fireEvent.click(statusSelect)
    
    expect(screen.getByRole('option', { name: /draft/i })).toBeDefined()
    expect(screen.getByRole('option', { name: /^sent$/i })).toBeDefined()
    expect(screen.getByRole('option', { name: /accepted/i })).toBeDefined()
    expect(screen.getByRole('option', { name: /declined/i })).toBeDefined()
  })
})
