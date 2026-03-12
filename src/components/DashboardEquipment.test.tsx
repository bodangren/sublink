import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardEquipment from './DashboardEquipment'
import * as db from '../db'

vi.mock('../db', () => ({
  getEquipmentNeedingMaintenance: vi.fn(),
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('DashboardEquipment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows message when no equipment needs maintenance', async () => {
    vi.mocked(db.getEquipmentNeedingMaintenance).mockResolvedValue([])
    
    renderWithRouter(<DashboardEquipment />)
    
    await waitFor(() => {
      expect(screen.getByText('All equipment is up to date on maintenance.')).toBeInTheDocument()
    })
  })

  it('displays equipment needing maintenance', async () => {
    const equipment = [
      {
        id: '1',
        name: 'Circular Saw',
        description: 'DeWalt 7-1/4"',
        category: 'power_tool' as const,
        status: 'active' as const,
        nextMaintenanceDate: '2026-03-15',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]
    
    vi.mocked(db.getEquipmentNeedingMaintenance).mockResolvedValue(equipment)
    
    renderWithRouter(<DashboardEquipment />)
    
    await waitFor(() => {
      expect(screen.getByText('Circular Saw')).toBeInTheDocument()
      expect(screen.getByText(/Next maintenance:/)).toBeInTheDocument()
    })
  })

  it('shows view and edit buttons for equipment', async () => {
    const equipment = [
      {
        id: '1',
        name: 'Drill',
        category: 'power_tool' as const,
        status: 'active' as const,
        nextMaintenanceDate: '2026-03-10',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]
    
    vi.mocked(db.getEquipmentNeedingMaintenance).mockResolvedValue(equipment)
    
    renderWithRouter(<DashboardEquipment />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
  })

  it('links to equipment list', async () => {
    vi.mocked(db.getEquipmentNeedingMaintenance).mockResolvedValue([])
    
    renderWithRouter(<DashboardEquipment />)
    
    await waitFor(() => {
      expect(screen.getByText('Equipment')).toBeInTheDocument()
    })
  })

  it('limits display to 3 items', async () => {
    const equipment = [
      { id: '1', name: 'Item 1', category: 'power_tool' as const, status: 'active' as const, nextMaintenanceDate: '2026-03-10', createdAt: Date.now(), updatedAt: Date.now() },
      { id: '2', name: 'Item 2', category: 'power_tool' as const, status: 'active' as const, nextMaintenanceDate: '2026-03-10', createdAt: Date.now(), updatedAt: Date.now() },
      { id: '3', name: 'Item 3', category: 'power_tool' as const, status: 'active' as const, nextMaintenanceDate: '2026-03-10', createdAt: Date.now(), updatedAt: Date.now() },
      { id: '4', name: 'Item 4', category: 'power_tool' as const, status: 'active' as const, nextMaintenanceDate: '2026-03-10', createdAt: Date.now(), updatedAt: Date.now() },
    ]
    
    vi.mocked(db.getEquipmentNeedingMaintenance).mockResolvedValue(equipment)
    
    renderWithRouter(<DashboardEquipment />)
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
      expect(screen.queryByText('Item 4')).not.toBeInTheDocument()
    })
  })
})
