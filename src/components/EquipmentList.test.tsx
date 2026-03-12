import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EquipmentList from './EquipmentList'
import { initDB, clearDatabase, saveEquipment } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      <ConfirmProvider>
        {component}
      </ConfirmProvider>
    </MemoryRouter>
  )
}

describe('EquipmentList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders empty state when no equipment', async () => {
    renderWithRouter(<EquipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no equipment found/i)).toBeInTheDocument()
    })
  })

  it('displays equipment list', async () => {
    await saveEquipment({
      name: 'DeWalt Drill',
      category: 'power_tool',
      status: 'active',
    })
    await saveEquipment({
      name: 'Claw Hammer',
      category: 'hand_tool',
      status: 'active',
    })

    renderWithRouter(<EquipmentList />)

    await waitFor(() => {
      expect(screen.getByText('DeWalt Drill')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('Claw Hammer')).toBeInTheDocument()
    })
  })

  it('shows total equipment value header', async () => {
    renderWithRouter(<EquipmentList />)

    await waitFor(() => {
      expect(screen.getByText(/total active equipment value/i)).toBeInTheDocument()
    })
  })

  it('filters by category', async () => {
    await saveEquipment({ name: 'Power Drill', category: 'power_tool', status: 'active' })
    await saveEquipment({ name: 'Claw Hammer', category: 'hand_tool', status: 'active' })

    renderWithRouter(<EquipmentList />)

    await waitFor(() => {
      expect(screen.getByText('Power Drill')).toBeInTheDocument()
      expect(screen.getByText('Claw Hammer')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/category:/i), { target: { value: 'hand_tool' } })

    await waitFor(() => {
      expect(screen.queryByText('Power Drill')).not.toBeInTheDocument()
      expect(screen.getByText('Claw Hammer')).toBeInTheDocument()
    })
  })

  it('filters by status', async () => {
    await saveEquipment({ name: 'Active Tool', category: 'power_tool', status: 'active' })
    await saveEquipment({ name: 'Broken Tool', category: 'power_tool', status: 'in_repair' })

    renderWithRouter(<EquipmentList />)

    await waitFor(() => {
      expect(screen.getByText('Active Tool')).toBeInTheDocument()
      expect(screen.getByText('Broken Tool')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/status:/i), { target: { value: 'in_repair' } })

    await waitFor(() => {
      expect(screen.queryByText('Active Tool')).not.toBeInTheDocument()
      expect(screen.getByText('Broken Tool')).toBeInTheDocument()
    })
  })

  it('shows equipment with project assignment', async () => {
    await saveEquipment({
      name: 'Site Drill',
      category: 'power_tool',
      status: 'active',
      currentProjectId: 'project-1',
      currentProjectName: 'Kitchen Remodel',
    })

    renderWithRouter(<EquipmentList />)

    await waitFor(() => {
      expect(screen.getByText('Site Drill')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText(/Kitchen Remodel/)).toBeInTheDocument()
    })
  })

  it('shows overdue maintenance indicator', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    await saveEquipment({
      name: 'Needs Service',
      category: 'power_tool',
      status: 'active',
      nextMaintenanceDate: yesterday.toISOString().split('T')[0],
    })

    renderWithRouter(<EquipmentList />)

    await waitFor(() => {
      expect(screen.getByText('Needs Service')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText(/overdue/i)).toBeInTheDocument()
    })
  })
})
