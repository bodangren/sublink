import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardStats from './DashboardStats'
import { initDB, saveTask, saveWaiver, saveCOI, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

describe('DashboardStats', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('displays zero counts when no items exist', async () => {
    render(<DashboardStats />)
    
    await waitFor(() => {
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBe(3)
    })
  })

  it('displays correct task count', async () => {
    await saveTask({ title: 'Task 1', description: 'Description 1' })
    await saveTask({ title: 'Task 2', description: 'Description 2' })
    await saveTask({ title: 'Task 3', description: 'Description 3' })
    
    render(<DashboardStats />)
    
    await waitFor(() => {
      const taskCard = screen.getByText('Tasks').parentElement
      expect(taskCard?.textContent).toContain('3')
    })
  })

  it('displays correct waiver count', async () => {
    await saveWaiver({
      projectName: 'Project 1',
      subcontractorName: 'Sub 1',
      amount: '1000',
      date: '2026-03-08',
      signature: 'data:image/png;base64,signature'
    })
    await saveWaiver({
      projectName: 'Project 2',
      subcontractorName: 'Sub 2',
      amount: '2000',
      date: '2026-03-08',
      signature: 'data:image/png;base64,signature'
    })
    
    render(<DashboardStats />)
    
    await waitFor(() => {
      const waiverCard = screen.getByText('Waivers').parentElement
      expect(waiverCard?.textContent).toContain('2')
    })
  })

  it('displays correct COI count', async () => {
    await saveCOI({
      insuranceCompany: 'Ins Co 1',
      policyNumber: 'POL1',
      policyType: 'General Liability',
      effectiveDate: '2026-01-01',
      expirationDate: '2026-12-31',
      coverageAmount: '1000000'
    })
    
    render(<DashboardStats />)
    
    await waitFor(() => {
      const coiCard = screen.getByText('Certificates').parentElement
      expect(coiCard?.textContent).toContain('1')
    })
  })

  it('displays all three stat cards', async () => {
    render(<DashboardStats />)
    
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeDefined()
      expect(screen.getByText('Waivers')).toBeDefined()
      expect(screen.getByText('Certificates')).toBeDefined()
    })
  })
})
