import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PhotoCapture from './PhotoCapture'
import { initDB, clearDatabase } from '../db'
import 'fake-indexeddb/auto'

vi.mock('../utils/gps', () => ({
  getGPSLocation: vi.fn(() => Promise.resolve({ latitude: 40.7128, longitude: -74.0060 })),
  createWatermarkText: vi.fn(() => '40.712800, -74.006000 | 2024-03-15'),
}))

vi.mock('../utils/watermark', () => ({
  applyWatermark: vi.fn((data: string) => Promise.resolve(data)),
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('PhotoCapture', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
  })

  it('renders camera capture button', () => {
    renderWithRouter(<PhotoCapture taskId="test-task-id" taskTitle="Test Task" />)
    const buttons = screen.getAllByRole('button', { name: /take photo/i })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('shows task title', () => {
    renderWithRouter(<PhotoCapture taskId="test-task-id" taskTitle="Install Fixtures" />)
    expect(screen.getByText('Install Fixtures')).toBeDefined()
  })

  it('shows photo count', async () => {
    renderWithRouter(<PhotoCapture taskId="test-task-id" taskTitle="Test Task" />)
    await waitFor(() => {
      expect(screen.getByText(/0 photo/i)).toBeDefined()
    })
  })
})
