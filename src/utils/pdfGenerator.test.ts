import { describe, it, expect } from 'vitest'
import { 
  sanitizeFilename, 
  formatDate, 
  formatShortDate,
  generatePDFFilename
} from './pdfGenerator'

describe('sanitizeFilename', () => {
  it('removes special characters', () => {
    expect(sanitizeFilename('Test@Task#123')).toBe('TestTask123')
  })

  it('replaces spaces with underscores', () => {
    expect(sanitizeFilename('Install bathroom fixtures')).toBe('Install_bathroom_fixtures')
  })

  it('truncates long titles', () => {
    const longTitle = 'A'.repeat(100)
    expect(sanitizeFilename(longTitle).length).toBeLessThanOrEqual(50)
  })

  it('handles empty string', () => {
    expect(sanitizeFilename('')).toBe('')
  })

  it('preserves hyphens', () => {
    expect(sanitizeFilename('Task-123')).toBe('Task-123')
  })

  it('handles multiple spaces', () => {
    expect(sanitizeFilename('Test   Multiple    Spaces')).toBe('Test_Multiple_Spaces')
  })
})

describe('formatDate', () => {
  it('formats timestamp to readable date', () => {
    const timestamp = new Date('2024-03-15T14:30:00').getTime()
    const result = formatDate(timestamp)
    expect(result).toContain('March')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('includes time', () => {
    const timestamp = new Date('2024-03-15T14:30:00').getTime()
    const result = formatDate(timestamp)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

describe('formatShortDate', () => {
  it('formats timestamp to ISO date string', () => {
    const timestamp = new Date('2024-03-15T14:30:00').getTime()
    expect(formatShortDate(timestamp)).toBe('2024-03-15')
  })

  it('handles different dates', () => {
    const timestamp = new Date('2024-12-25T00:00:00').getTime()
    expect(formatShortDate(timestamp)).toBe('2024-12-25')
  })
})

describe('generatePDFFilename', () => {
  it('generates correct filename format', () => {
    const task = {
      id: 'test-id',
      title: 'Install Fixtures',
      description: 'Test description',
      createdAt: new Date('2024-03-15').getTime(),
      updatedAt: new Date('2024-03-15').getTime()
    }
    
    const filename = generatePDFFilename(task)
    expect(filename).toBe('SubLink_Install_Fixtures_2024-03-15.pdf')
  })

  it('sanitizes special characters in title', () => {
    const task = {
      id: 'test-id',
      title: 'Task@#$%Name',
      description: 'Test',
      createdAt: new Date('2024-03-15').getTime(),
      updatedAt: new Date('2024-03-15').getTime()
    }
    
    const filename = generatePDFFilename(task)
    expect(filename).not.toMatch(/[@#$%]/)
    expect(filename).toMatch(/^SubLink_.*\.pdf$/)
  })
})
