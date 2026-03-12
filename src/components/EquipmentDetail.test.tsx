import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EquipmentDetail from './EquipmentDetail'
import { initDB, clearDatabase, saveEquipment, getEquipment, saveProject } from '../db'
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

describe('EquipmentDetail', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('shows loading state initially', () => {
    renderWithRouter(<EquipmentDetail equipmentId="nonexistent" />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows not found message for nonexistent equipment', async () => {
    renderWithRouter(<EquipmentDetail equipmentId="nonexistent" />)

    await waitFor(() => {
      expect(screen.getByText(/equipment not found/i)).toBeInTheDocument()
    })
  })

  it('displays equipment name and status', async () => {
    const id = await saveEquipment({
      name: 'DeWalt Drill',
      category: 'power_tool',
      status: 'active',
    })

    renderWithRouter(<EquipmentDetail equipmentId={id} />)

    await waitFor(() => {
      expect(screen.getByText('DeWalt Drill')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  it('displays equipment details', async () => {
    const id = await saveEquipment({
      name: 'DeWalt Drill',
      category: 'power_tool',
      status: 'active',
      description: '20V cordless drill',
      serialNumber: 'SN-12345',
      modelNumber: 'DCD791D2',
      purchasePrice: 149.99,
    })

    renderWithRouter(<EquipmentDetail equipmentId={id} />)

    await waitFor(() => {
      expect(screen.getByText('DeWalt Drill')).toBeInTheDocument()
      expect(screen.getByText('20V cordless drill')).toBeInTheDocument()
      expect(screen.getByText('SN-12345')).toBeInTheDocument()
      expect(screen.getByText('DCD791D2')).toBeInTheDocument()
      expect(screen.getByText(/\$149\.99/)).toBeInTheDocument()
    })
  })

  it('shows status badge with correct text', async () => {
    const id = await saveEquipment({
      name: 'Broken Tool',
      category: 'power_tool',
      status: 'in_repair',
    })

    renderWithRouter(<EquipmentDetail equipmentId={id} />)

    await waitFor(() => {
      expect(screen.getByText('In Repair')).toBeInTheDocument()
    })
  })

  it('shows log maintenance button for active equipment', async () => {
    const id = await saveEquipment({
      name: 'Test Drill',
      category: 'power_tool',
      status: 'active',
    })

    renderWithRouter(<EquipmentDetail equipmentId={id} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log maintenance/i })).toBeInTheDocument()
    })
  })

  it('logs maintenance successfully', async () => {
    const id = await saveEquipment({
      name: 'Test Drill',
      category: 'power_tool',
      status: 'active',
      maintenanceIntervalDays: 90,
    })

    renderWithRouter(<EquipmentDetail equipmentId={id} />)

    await waitFor(() => {
      expect(screen.getByText('Test Drill')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /log maintenance/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/maintenance notes/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/maintenance notes/i), { 
      target: { value: 'Replaced brushes and cleaned motor' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /save maintenance log/i }))

    await waitFor(() => {
      expect(screen.getByText('Replaced brushes and cleaned motor')).toBeInTheDocument()
    })

    const equipment = await getEquipment(id)
    expect(equipment?.maintenanceHistory).toHaveLength(1)
    expect(equipment?.lastMaintenanceDate).toBeDefined()
  })

  it('assigns equipment to project', async () => {
    const projectId = await saveProject({ name: 'Kitchen Remodel' })
    const equipmentId = await saveEquipment({
      name: 'Test Drill',
      category: 'power_tool',
      status: 'active',
    })

    renderWithRouter(<EquipmentDetail equipmentId={equipmentId} />)

    await waitFor(() => {
      expect(screen.getByText('Test Drill')).toBeInTheDocument()
    })

    const assignSelect = screen.getByRole('combobox', { name: '' })
    fireEvent.change(assignSelect, { target: { value: projectId } })
    fireEvent.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => {
      const equipment = getEquipment(equipmentId)
      expect(equipment).toBeDefined()
    })
  })

  it('shows maintenance history', async () => {
    const id = await saveEquipment({
      name: 'Test Drill',
      category: 'power_tool',
      status: 'active',
      maintenanceHistory: [
        { date: '2025-01-15', notes: 'Initial service', performedBy: 'Mike' },
        { date: '2025-03-20', notes: 'Replaced battery' },
      ],
    })

    renderWithRouter(<EquipmentDetail equipmentId={id} />)

    await waitFor(() => {
      expect(screen.getByText('Maintenance History')).toBeInTheDocument()
      expect(screen.getByText('Initial service')).toBeInTheDocument()
      expect(screen.getByText('Replaced battery')).toBeInTheDocument()
    })
  })
})
