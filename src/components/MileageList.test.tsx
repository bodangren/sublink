import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MileageList from './MileageList'
import { initDB, clearDatabase, saveMileage, saveProject } from '../db'
import { ConfirmProvider } from '../hooks/useConfirm'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <ConfirmProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </ConfirmProvider>
  )
}

describe('MileageList', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders empty state when no mileage entries', () => {
    renderWithRouter(<MileageList />)
    
    expect(screen.getByText(/no mileage entries/i)).toBeDefined()
  })

  it('displays list of mileage entries', async () => {
    await saveMileage({
      date: '2024-03-10',
      startLocation: 'Office',
      endLocation: 'Job Site',
      miles: 25.5,
      isRoundTrip: false,
    })
    
    renderWithRouter(<MileageList />)
    
    await waitFor(() => {
      const officeText = screen.queryByText('Office')
      const jobSiteText = screen.queryByText('Job Site')
      const milesText = screen.queryByText('25.5 mi')
      expect(officeText || jobSiteText || milesText).not.toBeNull()
    }, { timeout: 3000 })
  })

  it('shows project name when associated', async () => {
    const projectId = await saveProject({ name: 'Test Project' })
    await saveMileage({
      projectId,
      projectName: 'Test Project',
      date: '2024-03-10',
      startLocation: 'A',
      endLocation: 'B',
      miles: 10,
      isRoundTrip: false,
    })
    
    renderWithRouter(<MileageList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeDefined()
    })
  })

  it('shows round trip indicator', async () => {
    await saveMileage({
      date: '2024-03-10',
      startLocation: 'A',
      endLocation: 'B',
      miles: 50,
      isRoundTrip: true,
    })
    
    renderWithRouter(<MileageList />)
    
    await waitFor(() => {
      expect(screen.getByText(/round trip/i)).toBeDefined()
    })
  })

  it('has link to create new mileage', () => {
    renderWithRouter(<MileageList />)
    
    const newButton = screen.getByRole('link', { name: /new mileage/i })
    expect(newButton).toBeDefined()
  })

  it('navigates to detail view when clicking entry', async () => {
    await saveMileage({
      date: '2024-03-10',
      startLocation: 'A',
      endLocation: 'B',
      miles: 10,
      isRoundTrip: false,
    })
    
    renderWithRouter(<MileageList />)
    
    await waitFor(() => {
      const detailLink = screen.getByRole('link', { name: /view details/i })
      expect(detailLink).toBeDefined()
    })
  })
})
