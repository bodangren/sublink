import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EquipmentForm from './EquipmentForm'
import { initDB, clearDatabase, saveEquipment, getEquipment, saveProject } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactNode, initialEntries?: string[]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  )
}

describe('EquipmentForm', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders new equipment form', async () => {
    renderWithRouter(<EquipmentForm />)
    
    expect(screen.getByText('New Equipment')).toBeInTheDocument()
    expect(screen.getByLabelText(/equipment name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('shows required field indicator for name', async () => {
    renderWithRouter(<EquipmentForm />)

    const nameInput = screen.getByLabelText(/equipment name \*/i)
    expect(nameInput).toHaveAttribute('required')
  })

  it('populates form with initial data in edit mode', async () => {
    const id = await saveEquipment({
      name: 'Existing Drill',
      category: 'power_tool',
      status: 'active',
      description: 'A test drill',
    })

    const equipment = await getEquipment(id)
    renderWithRouter(
      <EquipmentForm editId={id} initialData={{
        name: equipment!.name,
        description: equipment!.description || '',
        category: equipment!.category,
        serialNumber: equipment!.serialNumber || '',
        modelNumber: equipment!.modelNumber || '',
        purchaseDate: equipment!.purchaseDate || '',
        purchasePrice: equipment!.purchasePrice?.toString() || '',
        currentProjectId: equipment!.currentProjectId || '',
        currentProjectName: equipment!.currentProjectName || '',
        maintenanceIntervalDays: equipment!.maintenanceIntervalDays?.toString() || '',
        maintenanceNotes: equipment!.maintenanceNotes || '',
        status: equipment!.status,
      }} />
    )

    expect(screen.getByDisplayValue('Existing Drill')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A test drill')).toBeInTheDocument()
    expect(screen.getByText('Edit Equipment')).toBeInTheDocument()
  })

  it('pre-selects project from URL parameter', async () => {
    const projectId = await saveProject({
      name: 'Test Project',
    })

    renderWithRouter(<EquipmentForm />, ['/new?projectId=' + projectId])

    await waitFor(() => {
      const projectSelect = screen.getByLabelText(/assign to project/i)
      expect(projectSelect).toHaveValue(projectId)
    })
  })

  it('has correct category options', async () => {
    renderWithRouter(<EquipmentForm />)

    expect(screen.getByText('Power Tool')).toBeInTheDocument()
    expect(screen.getByText('Hand Tool')).toBeInTheDocument()
    expect(screen.getByText('Heavy Equipment')).toBeInTheDocument()
    expect(screen.getByText('Safety Gear')).toBeInTheDocument()
    expect(screen.getByText('Vehicle')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('has correct status options', async () => {
    renderWithRouter(<EquipmentForm />)

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('In Repair')).toBeInTheDocument()
    expect(screen.getByText('Retired/Lost')).toBeInTheDocument()
  })

  it('has cancel button that navigates back', async () => {
    renderWithRouter(<EquipmentForm />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
})
