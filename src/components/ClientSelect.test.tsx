import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ClientSelect from './ClientSelect'
import { initDB, saveClient, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

describe('ClientSelect', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows placeholder when no client selected', () => {
    const handleChange = () => {}
    render(<ClientSelect onChange={handleChange} placeholder="Select a client..." />)
    
    expect(screen.getByPlaceholderText(/Select a client/)).toBeDefined()
  })

  it('displays selected client', async () => {
    const clientId = await saveClient({ name: 'Test Company', email: 'test@example.com' })
    
    const handleChange = () => {}
    render(<ClientSelect value={clientId} onChange={handleChange} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeDefined()
      expect(screen.getByText('test@example.com')).toBeDefined()
    })
  })

  it('filters clients by search', async () => {
    await saveClient({ name: 'Alpha Corp' })
    await saveClient({ name: 'Beta Inc' })
    
    const handleChange = () => {}
    render(<ClientSelect onChange={handleChange} />)
    
    const input = screen.getByPlaceholderText(/Select/)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Alpha' } })
    
    await waitFor(() => {
      expect(screen.getByText('Alpha Corp')).toBeDefined()
      expect(screen.queryByText('Beta Inc')).toBeNull()
    })
  })

  it('calls onChange when client is selected', async () => {
    const clientId = await saveClient({ name: 'Test Company' })
    
    let selectedId: string | undefined
    let selectedClient: any
    
    const handleChange = (id: string | undefined, client: any) => {
      selectedId = id
      selectedClient = client
    }
    
    render(<ClientSelect onChange={handleChange} />)
    
    const input = screen.getByPlaceholderText(/Select/)
    fireEvent.focus(input)
    
    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeDefined()
    })
    
    fireEvent.click(screen.getByText('Test Company'))
    
    await waitFor(() => {
      expect(selectedId).toBe(clientId)
      expect(selectedClient?.name).toBe('Test Company')
    })
  })

  it('clears selection when clear button clicked', async () => {
    const clientId = await saveClient({ name: 'Test Company' })
    
    let selectedId: string | undefined = clientId
    
    const handleChange = (id: string | undefined) => {
      selectedId = id
    }
    
    render(<ClientSelect value={clientId} onChange={handleChange} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeDefined()
    })
    
    fireEvent.click(screen.getByText(/Clear/i))
    
    await waitFor(() => {
      expect(selectedId).toBeUndefined()
    })
  })
})
