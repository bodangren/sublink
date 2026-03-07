import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PhotoGallery from './PhotoGallery'
import type { TaskPhoto } from '../db'

const createMockPhoto = (overrides?: Partial<TaskPhoto>): TaskPhoto => ({
  id: 'test-photo-id',
  taskId: 'test-task-id',
  imageData: 'data:image/png;base64,test',
  capturedAt: Date.now(),
  watermarkData: 'Test watermark',
  ...overrides,
})

describe('PhotoGallery', () => {
  it('shows empty state when no photos', () => {
    render(<PhotoGallery photos={[]} />)
    expect(screen.getByText('No photos yet.')).toBeDefined()
  })

  it('displays photos in a grid', () => {
    const photos = [
      createMockPhoto({ id: 'photo-1' }),
      createMockPhoto({ id: 'photo-2' }),
    ]
    render(<PhotoGallery photos={photos} />)
    
    const images = screen.getAllByAltText('Task photo')
    expect(images.length).toBe(2)
  })

  it('shows capture time for each photo', () => {
    const testTime = new Date('2024-03-15T14:30:00').getTime()
    const photos = [
      createMockPhoto({ capturedAt: testTime }),
    ]
    render(<PhotoGallery photos={photos} />)
    
    expect(screen.getByText(/2:30/)).toBeDefined()
  })

  it('opens fullscreen view when photo is clicked', () => {
    const photos = [
      createMockPhoto({ id: 'photo-1' }),
    ]
    render(<PhotoGallery photos={photos} />)
    
    const photoItem = screen.getByAltText('Task photo').parentElement
    if (photoItem) {
      fireEvent.click(photoItem)
    }
    
    expect(screen.getByAltText('Full size photo')).toBeDefined()
    expect(screen.getByText(/Tap anywhere to close/i)).toBeDefined()
  })

  it('closes fullscreen view when clicked', () => {
    const photos = [
      createMockPhoto({ id: 'photo-1' }),
    ]
    render(<PhotoGallery photos={photos} />)
    
    const photoItem = screen.getByAltText('Task photo').parentElement
    if (photoItem) {
      fireEvent.click(photoItem)
    }
    
    expect(screen.getByAltText('Full size photo')).toBeDefined()
    
    const overlay = screen.getByAltText('Full size photo').parentElement
    if (overlay) {
      fireEvent.click(overlay)
    }
    
    expect(screen.queryByAltText('Full size photo')).toBeNull()
  })

  it('shows GPS coordinates in fullscreen when available', () => {
    const photos = [
      createMockPhoto({ 
        latitude: 40.7128, 
        longitude: -74.0060 
      }),
    ]
    render(<PhotoGallery photos={photos} />)
    
    const photoItem = screen.getByAltText('Task photo').parentElement
    if (photoItem) {
      fireEvent.click(photoItem)
    }
    
    expect(screen.getByText(/GPS:/)).toBeDefined()
    expect(screen.getByText(/40.712800/)).toBeDefined()
  })

  it('does not show GPS coordinates when not available', () => {
    const photos = [
      createMockPhoto(),
    ]
    render(<PhotoGallery photos={photos} />)
    
    const photoItem = screen.getByAltText('Task photo').parentElement
    if (photoItem) {
      fireEvent.click(photoItem)
    }
    
    expect(screen.queryByText(/GPS:/)).toBeNull()
  })
})
