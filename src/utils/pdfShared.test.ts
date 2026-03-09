import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatDateWithTime,
  formatShortDateFromStr,
  formatShortDateFromTimestamp,
  sanitizeFilename,
  getStatusColor,
  SUCCESS_COLOR,
  DANGER_COLOR,
  MUTED_COLOR,
  PURPLE_COLOR
} from './pdfShared'

describe('pdfShared utilities', () => {
  describe('formatCurrency', () => {
    it('formats zero as $0.00', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('formats positive amounts', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats large amounts with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })

    it('formats small amounts', () => {
      expect(formatCurrency(0.01)).toBe('$0.01')
    })
  })

  describe('formatDate', () => {
    it('formats date string to locale string', () => {
      const result = formatDate('2024-03-15')
      expect(result).toContain('March')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('formatDateWithTime', () => {
    it('formats timestamp with date and time', () => {
      const timestamp = new Date('2024-03-15T14:30:00').getTime()
      const result = formatDateWithTime(timestamp)
      expect(result).toContain('March')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('formatShortDateFromStr', () => {
    it('removes dashes from date string', () => {
      expect(formatShortDateFromStr('2024-03-15')).toBe('20240315')
    })
  })

  describe('formatShortDateFromTimestamp', () => {
    it('formats timestamp to YYYY-MM-DD', () => {
      const timestamp = new Date('2024-03-15T00:00:00').getTime()
      expect(formatShortDateFromTimestamp(timestamp)).toBe('2024-03-15')
    })

    it('pads single digit months and days', () => {
      const timestamp = new Date('2024-01-05T00:00:00').getTime()
      expect(formatShortDateFromTimestamp(timestamp)).toBe('2024-01-05')
    })
  })

  describe('sanitizeFilename', () => {
    it('removes special characters', () => {
      expect(sanitizeFilename('Test@File#Name!')).toBe('TestFileName')
    })

    it('replaces spaces with underscores', () => {
      expect(sanitizeFilename('test file name')).toBe('test_file_name')
    })

    it('truncates to 50 characters', () => {
      const longName = 'a'.repeat(100)
      expect(sanitizeFilename(longName)).toHaveLength(50)
    })

    it('trims whitespace after underscore conversion', () => {
      expect(sanitizeFilename('  test  ')).toBe('_test_')
    })

    it('preserves hyphens and alphanumeric (underscores removed)', () => {
      expect(sanitizeFilename('Test-File_123')).toBe('Test-File123')
    })
  })

  describe('getStatusColor', () => {
    it('returns success color for paid status', () => {
      expect(getStatusColor('paid')).toEqual(SUCCESS_COLOR)
    })

    it('returns success color for accepted status', () => {
      expect(getStatusColor('accepted')).toEqual(SUCCESS_COLOR)
    })

    it('returns danger color for overdue status', () => {
      expect(getStatusColor('overdue')).toEqual(DANGER_COLOR)
    })

    it('returns danger color for declined status', () => {
      expect(getStatusColor('declined')).toEqual(DANGER_COLOR)
    })

    it('returns purple color for converted status', () => {
      expect(getStatusColor('converted')).toEqual(PURPLE_COLOR)
    })

    it('returns muted color for unknown status', () => {
      expect(getStatusColor('draft')).toEqual(MUTED_COLOR)
      expect(getStatusColor('pending')).toEqual(MUTED_COLOR)
    })
  })
})
