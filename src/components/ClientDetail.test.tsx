import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ClientDetail from './ClientDetail'
import { initDB, saveClient, clearDatabase, saveProject, saveInvoice, saveEstimate } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement, path = '/clients/test-id') => {
  window.history.pushState({}, '', path)
  return render(
    <ConfirmProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/clients/:id" element={component} />
        </Routes>
      </BrowserRouter>
    </ConfirmProvider>
  )
}

describe('ClientDetail', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows client not found for invalid id', async () => {
    renderWithRouter(<ClientDetail />)
    
    await waitFor(() => {
      expect(screen.getByText(/Client not found/)).toBeDefined()
    })
  })

  it('displays client details', async () => {
    const clientId = await saveClient({ 
      name: 'Test Company',
      contactPerson: 'John Doe',
      email: 'john@test.com',
      phone: '(555) 123-4567',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345'
    })
    
    renderWithRouter(<ClientDetail />, `/clients/${clientId}`)
    
    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeDefined()
      expect(screen.getByText('John Doe')).toBeDefined()
      expect(screen.getByText('john@test.com')).toBeDefined()
    })
  })

  it('shows related projects, invoices, and estimates', async () => {
    const clientId = await saveClient({ name: 'Test Company' })
    
    await saveProject({ name: 'Project 1', clientId, client: 'Test Company' })
    await saveInvoice({ 
      clientName: 'Test Company', 
      clientId,
      issueDate: '2024-01-01', 
      dueDate: '2024-01-31',
      lineItems: [],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'pending'
    })
    await saveEstimate({
      clientName: 'Test Company',
      clientId,
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [],
      subtotal: 200,
      taxRate: 0,
      taxAmount: 0,
      total: 200,
      status: 'draft'
    })
    
    renderWithRouter(<ClientDetail />, `/clients/${clientId}`)
    
    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeDefined()
    })
    
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeDefined()
    })
  })
})
