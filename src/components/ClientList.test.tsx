import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ClientList from './ClientList'
import { initDB, saveClient, clearDatabase } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <ConfirmProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </ConfirmProvider>
  )
}

describe('ClientList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows empty state when no clients', async () => {
    renderWithRouter(<ClientList />)
    
    await waitFor(() => {
      expect(screen.getByText(/No clients yet/)).toBeDefined()
    })
  })

  it('displays list of clients', async () => {
    await saveClient({ name: 'Client A' })
    await saveClient({ name: 'Client B' })
    
    renderWithRouter(<ClientList />)
    
    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeDefined()
      expect(screen.getByText('Client B')).toBeDefined()
    })
  })

  it('filters clients by search', async () => {
    await saveClient({ name: 'Alpha Corp' })
    await saveClient({ name: 'Beta Inc' })
    
    renderWithRouter(<ClientList />)
    
    await waitFor(() => {
      expect(screen.getByText('Alpha Corp')).toBeDefined()
      expect(screen.getByText('Beta Inc')).toBeDefined()
    })
    
    const searchInput = screen.getByPlaceholderText(/Search clients/)
    fireEvent.change(searchInput, { target: { value: 'Alpha' } })
    
    await waitFor(() => {
      expect(screen.getByText('Alpha Corp')).toBeDefined()
      expect(screen.queryByText('Beta Inc')).toBeNull()
    })
  })
})
