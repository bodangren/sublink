import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EstimateList from './EstimateList'
import { initDB, clearDatabase, saveEstimate, saveProject } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfirmProvider>{component}</ConfirmProvider>
    </BrowserRouter>
  )
}

describe('EstimateList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders empty state when no estimates', () => {
    renderWithRouter(<EstimateList />)
    
    expect(screen.getByText(/no estimates/i)).toBeDefined()
    expect(screen.getByText(/new estimate/i)).toBeDefined()
  })

  it('displays list of estimates', async () => {
    await saveEstimate({
      clientName: 'Client A',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [{ id: '1', description: 'Item 1', quantity: 1, rate: 100, amount: 100 }],
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
      lineItems: [{ id: '2', description: 'Item 2', quantity: 2, rate: 50, amount: 100 }],
      subtotal: 100,
      taxRate: 0,
      taxAmount: 0,
      total: 100,
      status: 'sent',
    })

    renderWithRouter(<EstimateList />)
    
    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeDefined()
      expect(screen.getByText('Client B')).toBeDefined()
    })
  })

  it('displays estimate status badges', async () => {
    await saveEstimate({
      clientName: 'Draft Client',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      status: 'draft',
    })

    renderWithRouter(<EstimateList />)
    
    await waitFor(() => {
      expect(screen.getByText(/draft/i)).toBeDefined()
    })
  })

  it('filters estimates by status', async () => {
    await saveEstimate({
      clientName: 'Draft Estimate',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      status: 'draft',
    })
    
    await saveEstimate({
      clientName: 'Sent Estimate',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      status: 'sent',
    })

    renderWithRouter(<EstimateList />)
    
    await waitFor(() => {
      expect(screen.getByText('Draft Estimate')).toBeDefined()
      expect(screen.getByText('Sent Estimate')).toBeDefined()
    })
    
    const sentButtons = screen.getAllByRole('button', { name: /sent/i })
    const sentFilter = sentButtons.find(btn => btn.textContent?.includes('('))
    
    if (sentFilter) {
      fireEvent.click(sentFilter)
    }
    
    await waitFor(() => {
      expect(screen.getByText('Sent Estimate')).toBeDefined()
      expect(screen.queryByText('Draft Estimate')).toBeNull()
    })
  })

  it('displays formatted currency values', async () => {
    await saveEstimate({
      clientName: 'Test Client',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [{ id: '1', description: 'Item', quantity: 1, rate: 1234.56, amount: 1234.56 }],
      subtotal: 1234.56,
      taxRate: 0,
      taxAmount: 0,
      total: 1234.56,
      status: 'draft',
    })

    renderWithRouter(<EstimateList />)
    
    await waitFor(() => {
      expect(screen.getByText('$1,234.56')).toBeDefined()
    })
  })

  it('displays project name when linked', async () => {
    const projectId = await saveProject({ name: 'Test Project' })
    
    await saveEstimate({
      projectId,
      projectName: 'Test Project',
      clientName: 'Client',
      issueDate: '2024-01-01',
      validUntilDate: '2024-02-01',
      lineItems: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      status: 'draft',
    })

    renderWithRouter(<EstimateList />)
    
    await waitFor(() => {
      expect(screen.getByText(/test project/i)).toBeDefined()
    })
  })

  it('shows all status filter buttons', () => {
    renderWithRouter(<EstimateList />)
    
    expect(screen.getByRole('button', { name: /all/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /draft/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /accepted/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /declined/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /converted/i })).toBeDefined()
  })
})
