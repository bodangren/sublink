import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ChangeOrderDetail from './ChangeOrderDetail'
import { initDB, clearDatabase, saveChangeOrder, saveProject, getProject, getChangeOrder } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (id: string) => {
  return render(
    <MemoryRouter initialEntries={[`/change-orders/${id}`]}>
      <ConfirmProvider>
        <Routes>
          <Route path="/change-orders/:id" element={<ChangeOrderDetail />} />
        </Routes>
      </ConfirmProvider>
    </MemoryRouter>
  )
}

describe('ChangeOrderDetail', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows loading initially', () => {
    renderWithRouter('test-id')
    
    expect(screen.getByText(/loading/i)).toBeDefined()
  })

  it('shows not found when change order does not exist', async () => {
    renderWithRouter('nonexistent-id')
    
    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeDefined()
    })
  })

  it('displays change order details', async () => {
    const projectId = await saveProject({ name: 'Detail Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Install additional electrical outlets',
      costAdjustment: 1500,
      reason: 'Client requested extra outlets in kitchen',
      contractReference: 'Section 3.2',
      status: 'draft',
      notes: 'Coordinate with plumber'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText(result.changeOrderNumber)).toBeDefined()
      expect(screen.getByText('Install additional electrical outlets')).toBeDefined()
      expect(screen.getByText('Client requested extra outlets in kitchen')).toBeDefined()
      expect(screen.getByText('Section 3.2')).toBeDefined()
      expect(screen.getByText('Coordinate with plumber')).toBeDefined()
    })
  })

  it('shows cost adjustment with correct formatting', async () => {
    const projectId = await saveProject({ name: 'Cost Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Positive cost change',
      costAdjustment: 2500,
      reason: 'Added scope',
      status: 'draft'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('+$2,500.00')).toBeDefined()
    })
  })

  it('shows negative cost adjustment correctly', async () => {
    const projectId = await saveProject({ name: 'Neg Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Negative cost change',
      costAdjustment: -800,
      reason: 'Reduced scope',
      status: 'draft'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('-$800.00')).toBeDefined()
    })
  })

  it('shows submit button for draft change orders', async () => {
    const projectId = await saveProject({ name: 'Draft Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Draft CO',
      costAdjustment: 100,
      reason: 'Test',
      status: 'draft'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('Submit for Approval')).toBeDefined()
    })
  })

  it('shows approve and reject buttons for submitted change orders', async () => {
    const projectId = await saveProject({ name: 'Submitted Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Submitted CO',
      costAdjustment: 100,
      reason: 'Test',
      status: 'submitted'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('Mark as Approved')).toBeDefined()
      expect(screen.getByText('Mark as Rejected')).toBeDefined()
    })
  })

  it('does not show status transition buttons for approved orders', async () => {
    const projectId = await saveProject({ name: 'Approved Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Approved CO',
      costAdjustment: 100,
      reason: 'Test',
      status: 'approved'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('approved')).toBeDefined()
      expect(screen.queryByText('Mark as Approved')).toBeNull()
      expect(screen.queryByText('Mark as Rejected')).toBeNull()
    })
  })

  it('does not show status transition buttons for rejected orders', async () => {
    const projectId = await saveProject({ name: 'Rejected Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Rejected CO',
      costAdjustment: 100,
      reason: 'Test',
      status: 'rejected'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('rejected')).toBeDefined()
      expect(screen.queryByText('Mark as Approved')).toBeNull()
      expect(screen.queryByText('Mark as Rejected')).toBeNull()
    })
  })

  it('shows edit and delete buttons', async () => {
    const projectId = await saveProject({ name: 'Edit Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Editable CO',
      costAdjustment: 100,
      reason: 'Test',
      status: 'draft'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeDefined()
      expect(screen.getByText('Delete')).toBeDefined()
    })
  })

  it('displays project link when project is associated', async () => {
    const projectId = await saveProject({ name: 'Linked Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Linked CO',
      costAdjustment: 100,
      reason: 'Test',
      status: 'draft'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('Linked Project')).toBeDefined()
    })
  })

  it('changes status from draft to submitted on confirm', async () => {
    const projectId = await saveProject({ name: 'Status Project', client: 'Client' })
    const project = await getProject(projectId)

    const result = await saveChangeOrder({
      projectId: projectId,
      projectName: project!.name,
      description: 'Status CO',
      costAdjustment: 100,
      reason: 'Test',
      status: 'draft'
    })

    renderWithRouter(result.id)
    
    await waitFor(() => {
      expect(screen.getByText('Submit for Approval')).toBeDefined()
    })
    
    fireEvent.click(screen.getByText('Submit for Approval'))
    
    await waitFor(() => {
      expect(screen.getByText(/change status to submitted/i)).toBeDefined()
    })
    
    const updateButtons = screen.getAllByRole('button', { name: /update/i })
    fireEvent.click(updateButtons[updateButtons.length - 1])
    
    await waitFor(async () => {
      const updated = await getChangeOrder(result.id)
      expect(updated!.status).toBe('submitted')
    })
  })
})
