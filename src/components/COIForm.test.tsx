import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import COIForm from './COIForm'
import { initDB, getCOIs } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('COIForm', () => {
  beforeEach(async () => {
    await initDB()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<COIForm />)
    
    expect(screen.getByLabelText(/insurance company/i)).toBeDefined()
    expect(screen.getByLabelText(/policy number/i)).toBeDefined()
    expect(screen.getByLabelText(/policy type/i)).toBeDefined()
    expect(screen.getByLabelText(/effective date/i)).toBeDefined()
    expect(screen.getByLabelText(/expiration date/i)).toBeDefined()
    expect(screen.getByLabelText(/coverage amount/i)).toBeDefined()
    expect(screen.getByLabelText(/notes/i)).toBeDefined()
  })

  it('renders with default values in create mode', () => {
    renderWithRouter(<COIForm />)
    
    const effectiveDateInput = screen.getByLabelText(/effective date/i) as HTMLInputElement
    const today = new Date().toISOString().split('T')[0]
    expect(effectiveDateInput.value).toBe(today)
    
    const policyTypeSelect = screen.getByLabelText(/policy type/i) as HTMLSelectElement
    expect(policyTypeSelect.value).toBe('General Liability')
  })

  it('renders with initial data in edit mode', () => {
    const initialData = {
      insuranceCompany: 'Test Insurance',
      policyNumber: 'TEST-123',
      policyType: 'Workers Compensation',
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      coverageAmount: '500000',
      notes: 'Test notes'
    }
    
    renderWithRouter(<COIForm editId="test-id" initialData={initialData} />)
    
    const companyInput = screen.getByLabelText(/insurance company/i) as HTMLInputElement
    expect(companyInput.value).toBe('Test Insurance')
    
    const policyNumberInput = screen.getByLabelText(/policy number/i) as HTMLInputElement
    expect(policyNumberInput.value).toBe('TEST-123')
  })

  it('saves new COI to database', async () => {
    renderWithRouter(<COIForm />)
    
    fireEvent.change(screen.getByLabelText(/insurance company/i), {
      target: { value: 'State Farm' }
    })
    fireEvent.change(screen.getByLabelText(/policy number/i), {
      target: { value: 'GL-12345' }
    })
    fireEvent.change(screen.getByLabelText(/expiration date/i), {
      target: { value: '2025-12-31' }
    })
    fireEvent.change(screen.getByLabelText(/coverage amount/i), {
      target: { value: '1000000' }
    })
    
    fireEvent.click(screen.getByText(/save certificate/i))
    
    await waitFor(async () => {
      const cois = await getCOIs()
      expect(cois.length).toBeGreaterThan(0)
      expect(cois[0].insuranceCompany).toBe('State Farm')
    })
  })

  it('shows different button text in edit mode', () => {
    const initialData = {
      insuranceCompany: 'Test',
      policyNumber: '123',
      policyType: 'General Liability',
      effectiveDate: '2024-01-01',
      expirationDate: '2025-01-01',
      coverageAmount: '1000000',
      notes: ''
    }
    
    renderWithRouter(<COIForm editId="test-id" initialData={initialData} />)
    
    expect(screen.getByText(/update certificate/i)).toBeDefined()
  })
})
