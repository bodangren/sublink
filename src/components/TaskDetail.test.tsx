import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TaskDetail from './TaskDetail'
import { initDB, clearDatabase, saveTask, savePhoto } from '../db'
import 'fake-indexeddb/auto'

vi.mock('../utils/gps', () => ({
  getGPSLocation: vi.fn(() => Promise.resolve({ latitude: 40.7128, longitude: -74.0060 })),
  createWatermarkText: vi.fn(() => '40.712800, -74.006000 | 2024-03-15'),
}))

vi.mock('../utils/watermark', () => ({
  applyWatermark: vi.fn((data: string) => Promise.resolve(data)),
}))

vi.mock('../utils/pdfGenerator', () => ({
  generateTaskPDF: vi.fn(() => Promise.resolve(new Blob())),
  downloadPDF: vi.fn(),
  generatePDFFilename: vi.fn(() => 'test.pdf'),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('TaskDetail', () => {
  beforeEach(async () => {
    await initDB()
    await clearDatabase()
    mockNavigate.mockClear()
  })

  it('shows loading state initially', () => {
    renderWithRouter(<TaskDetail taskId="non-existent" />)
    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('shows task not found for non-existent task', async () => {
    renderWithRouter(<TaskDetail taskId="non-existent" />)
    await waitFor(() => {
      expect(screen.getByText('Task not found.')).toBeDefined()
    })
  })

  it('displays task title and description', async () => {
    const taskId = await saveTask({
      title: 'Install Fixtures',
      description: 'Install bathroom fixtures in unit 4B',
    })
    renderWithRouter(<TaskDetail taskId={taskId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Install Fixtures')).toBeDefined()
      expect(screen.getByText('Install bathroom fixtures in unit 4B')).toBeDefined()
    })
  })

  it('shows photo count', async () => {
    const taskId = await saveTask({
      title: 'Test Task',
      description: 'Test description',
    })
    renderWithRouter(<TaskDetail taskId={taskId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/0 photo/i)).toBeDefined()
    })
  })

  it('shows contract reference when present', async () => {
    const taskId = await saveTask({
      title: 'Test Task',
      description: 'Test description',
      contractReference: 'CONTRACT-2024-001',
    })
    renderWithRouter(<TaskDetail taskId={taskId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/CONTRACT-2024-001/)).toBeDefined()
    })
  })

  it('displays photos from the gallery', async () => {
    const taskId = await saveTask({
      title: 'Test Task',
      description: 'Test description',
    })
    
    await savePhoto({
      taskId,
      imageData: 'data:image/png;base64,test',
      capturedAt: Date.now(),
      watermarkData: 'Test watermark',
    })
    
    renderWithRouter(<TaskDetail taskId={taskId} />)
    
    await waitFor(() => {
      expect(screen.getByText(/1 photo/i)).toBeDefined()
    })
  })

  it('shows take photo button', async () => {
    const taskId = await saveTask({
      title: 'Test Task',
      description: 'Test description',
    })
    renderWithRouter(<TaskDetail taskId={taskId} />)
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /take photo/i })
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('shows edit and delete buttons', async () => {
    const taskId = await saveTask({
      title: 'Test Task',
      description: 'Test description',
    })
    renderWithRouter(<TaskDetail taskId={taskId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeDefined()
      expect(screen.getByText('Delete Task')).toBeDefined()
    })
  })

  it('navigates back to tasks on back button click', async () => {
    const taskId = await saveTask({
      title: 'Test Task',
      description: 'Test description',
    })
    renderWithRouter(<TaskDetail taskId={taskId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Back to Tasks')).toBeDefined()
    })
    
    const backButton = screen.getByText('Back to Tasks')
    fireEvent.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/tasking')
  })

  it('shows export PDF button', async () => {
    const taskId = await saveTask({
      title: 'Test Task',
      description: 'Test description',
    })
    renderWithRouter(<TaskDetail taskId={taskId} />)
    
    await waitFor(() => {
      expect(screen.getByText('Export PDF Report')).toBeDefined()
    })
  })
})
