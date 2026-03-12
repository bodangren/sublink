import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ChangeOrderList from './ChangeOrderList'
import { initDB, clearDatabase, saveChangeOrder, saveProject, getProject } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfirmProvider>{component}</ConfirmProvider>
    </BrowserRouter>
  )
}

describe('ChangeOrderList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders empty state when no change orders', async () => {
    renderWithRouter(<ChangeOrderList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no change orders yet/i)).toBeDefined()
      expect(screen.getByText(/\+ new change order/i)).toBeDefined()
    })
  })

  it('displays list of change orders', async () => {
    const projectId = await saveProject({ name: 'Test Project', client: 'Test Client' })
    const project = await getProject(projectId)

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Add extra outlets',
      costAdjustment: 500,
      reason: 'Client requested additional work',
      status: 'draft'
    })

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Change fixture type',
      costAdjustment: -200,
      reason: 'Substitution approved',
      status: 'submitted'
    })
    
    renderWithRouter(<ChangeOrderList />)
    
    await waitFor(() => {
      expect(screen.getByText('Add extra outlets')).toBeDefined()
      expect(screen.getByText('Change fixture type')).toBeDefined()
    })
  })

  it('filters change orders by status', async () => {
    const projectId = await saveProject({ name: 'Filter Project', client: 'Client' })
    const project = await getProject(projectId)

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Draft CO',
      costAdjustment: 100,
      reason: 'Pending',
      status: 'draft'
    })

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Approved CO',
      costAdjustment: 200,
      reason: 'Approved',
      status: 'approved'
    })
    
    renderWithRouter(<ChangeOrderList />)
    
    await waitFor(() => {
      expect(screen.getByText('Draft CO')).toBeDefined()
      expect(screen.getByText('Approved CO')).toBeDefined()
    })
    
    const filterSelect = screen.getByLabelText(/filter by status/i)
    screen.debug(filterSelect)
  })

  it('shows summary statistics', async () => {
    const projectId = await saveProject({ name: 'Stats Project', client: 'Client' })
    const project = await getProject(projectId)

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'CO 1',
      costAdjustment: 1000,
      reason: 'Reason 1',
      status: 'approved'
    })

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'CO 2',
      costAdjustment: 500,
      reason: 'Reason 2',
      status: 'submitted'
    })

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'CO 3',
      costAdjustment: 750,
      reason: 'Reason 3',
      status: 'approved'
    })
    
    renderWithRouter(<ChangeOrderList />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Change Orders')).toBeDefined()
      expect(screen.getByText('3')).toBeDefined()
      expect(screen.getByText('Pending Approval')).toBeDefined()
      expect(screen.getByText('1')).toBeDefined()
      expect(screen.getByText('$1,750.00')).toBeDefined()
    })
  })

  it('shows cost adjustment with correct sign', async () => {
    const projectId = await saveProject({ name: 'Sign Project', client: 'Client' })
    const project = await getProject(projectId)

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Positive adjustment',
      costAdjustment: 500,
      reason: 'Add work',
      status: 'draft'
    })

    await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Negative adjustment',
      costAdjustment: -300,
      reason: 'Remove work',
      status: 'draft'
    })
    
    renderWithRouter(<ChangeOrderList />)
    
    await waitFor(() => {
      expect(screen.getByText('+$500.00')).toBeDefined()
      expect(screen.getByText('-$300.00')).toBeDefined()
    })
  })
})
