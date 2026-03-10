import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ClientForm from './ClientForm'
import { initDB, saveClient, getClients, clearDatabase } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <ConfirmProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </ConfirmProvider>
  )
}

describe('ClientForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders form with all fields', () => {
    renderWithRouter(<ClientForm />)
    
    expect(screen.getByLabelText(/Client Name/i)).toBeDefined()
    expect(screen.getByLabelText(/Contact Person/i)).toBeDefined()
    expect(screen.getByLabelText(/Email/i)).toBeDefined()
    expect(screen.getByLabelText(/Phone/i)).toBeDefined()
    expect(screen.getByLabelText(/Street Address/i)).toBeDefined()
    expect(screen.getByLabelText(/City/i)).toBeDefined()
    expect(screen.getByLabelText(/State/i)).toBeDefined()
    expect(screen.getByLabelText(/ZIP/i)).toBeDefined()
    expect(screen.getByLabelText(/Notes/i)).toBeDefined()
  })

  it('creates a new client', async () => {
    renderWithRouter(<ClientForm />)
    
    const nameInput = screen.getByLabelText(/Client Name/i)
    fireEvent.change(nameInput, { target: { value: 'Test Company' } })
    
    const submitButton = screen.getByText(/Create Client/i)
    fireEvent.click(submitButton)
    
    await waitFor(async () => {
      const clients = await getClients()
      expect(clients.length).toBe(1)
      expect(clients[0].name).toBe('Test Company')
    })
  })

  it('shows edit mode when editId is provided', async () => {
    const clientId = await saveClient({ 
      name: 'Existing Company', 
    })
    
    renderWithRouter(<ClientForm editId={clientId} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Company')).toBeDefined()
      expect(screen.getByText(/Update Client/i)).toBeDefined()
    })
  })
})
