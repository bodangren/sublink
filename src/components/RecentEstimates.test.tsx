import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RecentEstimates from './RecentEstimates'
import { initDB, clearDatabase, saveEstimate } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('RecentEstimates', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('returns null when no estimates exist', () => {
    const { container } = renderWithRouter(<RecentEstimates />)
    expect(container.firstChild).toBeNull()
  })

  it('displays recent estimates', async () => {
    await saveEstimate({
      clientName: 'Client A',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [{ id: '1', description: 'Item', quantity: 1, rate: 100, amount: 100 }],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'draft',
    })
    
    await saveEstimate({
      clientName: 'Client B',
      issueDate: '2024-01-02',
      validUntilDate: '2024-02-02',
      lineItems: [{ id: '2', description: 'Item', quantity: 1, rate: 200, amount: 200 }],
      subtotal: 200,
      taxRate: 0,
      taxAmount: 0,
      total: 200,
      status: 'sent',
    })

    renderWithRouter(<RecentEstimates />)
    
    await waitFor(() => {
      expect(screen.getByText(/recent estimates/i)).toBeDefined()
      expect(screen.getByText('Client A')).toBeDefined()
      expect(screen.getByText('Client B')).toBeDefined()
    })
  })

  it('displays status badges with correct colors', async () => {
    await saveEstimate({
      clientName: 'Test Client',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      status: 'accepted',
    })

    renderWithRouter(<RecentEstimates />)
    
    await waitFor(() => {
      expect(screen.getByText(/accepted/i)).toBeDefined()
    })
  })

  it('displays formatted currency', async () => {
    await saveEstimate({
      clientName: 'Currency Client',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [{ id: '1', description: 'Item', quantity: 1, rate: 1234.56, amount: 1234.56 }],
      subtotal: 1234.56,
      taxRate: 0,
      taxAmount: 0,
      total: 1234.56,
      status: 'draft',
    })

    renderWithRouter(<RecentEstimates />)
    
    await waitFor(() => {
      expect(screen.getByText('$1,234.56')).toBeDefined()
    })
  })

  it('limits to 5 estimates', async () => {
    for (let i = 1; i <= 7; i++) {
      await saveEstimate({
        clientName: `Client ${i}`,
        issueDate: `2024-01-0${i}`,
        validUntilDate: '2024-02-01',
        lineItems: [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 0,
        status: 'draft',
      })
    }

    renderWithRouter(<RecentEstimates />)
    
    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBe(5)
    })
  })

  it('has view all estimates link', async () => {
    await saveEstimate({
      clientName: 'Test Client',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      status: 'draft',
    })

    renderWithRouter(<RecentEstimates />)
    
    await waitFor(() => {
      expect(screen.getByText(/view all estimates/i)).toBeDefined()
    })
  })
})
