import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ExpiringCOIs from './ExpiringCOIs'
import { initDB, saveCOI, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ExpiringCOIs', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('displays message when no COIs are expiring', async () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    
    await saveCOI({
      insuranceCompany: 'Ins Co',
      policyNumber: 'POL1',
      policyType: 'General Liability',
      effectiveDate: '2026-01-01',
      expirationDate: futureDate.toISOString().split('T')[0],
      coverageAmount: '1000000'
    })
    
    renderWithRouter(<ExpiringCOIs />)
    
    await waitFor(() => {
      expect(screen.getByText(/all certificates up to date/i)).toBeDefined()
    })
  })

  it('displays COIs expiring within 30 days', async () => {
    const expiringDate = new Date()
    expiringDate.setDate(expiringDate.getDate() + 15)
    
    await saveCOI({
      insuranceCompany: 'Expiring Ins Co',
      policyNumber: 'POL-EXPIRING',
      policyType: 'General Liability',
      effectiveDate: '2025-01-01',
      expirationDate: expiringDate.toISOString().split('T')[0],
      coverageAmount: '1000000'
    })
    
    renderWithRouter(<ExpiringCOIs />)
    
    await waitFor(() => {
      expect(screen.getByText('Expiring Ins Co')).toBeDefined()
    })
  })

  it('displays expired COIs', async () => {
    const expiredDate = new Date()
    expiredDate.setDate(expiredDate.getDate() - 5)
    
    await saveCOI({
      insuranceCompany: 'Expired Ins Co',
      policyNumber: 'POL-EXPIRED',
      policyType: 'General Liability',
      effectiveDate: '2025-01-01',
      expirationDate: expiredDate.toISOString().split('T')[0],
      coverageAmount: '1000000'
    })
    
    renderWithRouter(<ExpiringCOIs />)
    
    await waitFor(() => {
      expect(screen.getByText('Expired Ins Co')).toBeDefined()
    })
  })

  it('shows warning icon for expiring items', async () => {
    const expiringDate = new Date()
    expiringDate.setDate(expiringDate.getDate() + 15)
    
    await saveCOI({
      insuranceCompany: 'Expiring Ins Co',
      policyNumber: 'POL-EXPIRING',
      policyType: 'General Liability',
      effectiveDate: '2025-01-01',
      expirationDate: expiringDate.toISOString().split('T')[0],
      coverageAmount: '1000000'
    })
    
    renderWithRouter(<ExpiringCOIs />)
    
    await waitFor(() => {
      expect(screen.getByText(/expiring soon/i)).toBeDefined()
    })
  })
})
