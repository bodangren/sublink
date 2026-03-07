import { describe, it, expect } from 'vitest'
import { getDaysUntilExpiration, getCOIStatus, getStatusColor, getStatusLabel } from './coiStatus'

describe('coiStatus utilities', () => {
  describe('getDaysUntilExpiration', () => {
    it('returns positive days for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 45)
      const days = getDaysUntilExpiration(futureDate.toISOString().split('T')[0])
      expect(days).toBeGreaterThanOrEqual(44)
      expect(days).toBeLessThanOrEqual(46)
    })

    it('returns negative days for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)
      const days = getDaysUntilExpiration(pastDate.toISOString().split('T')[0])
      expect(days).toBeLessThanOrEqual(-9)
      expect(days).toBeGreaterThanOrEqual(-11)
    })

    it('returns 0 for today', () => {
      const today = new Date().toISOString().split('T')[0]
      const days = getDaysUntilExpiration(today)
      expect(Math.abs(days)).toBe(0)
    })
  })

  describe('getCOIStatus', () => {
    it('returns "expired" for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)
      const status = getCOIStatus(pastDate.toISOString().split('T')[0])
      expect(status).toBe('expired')
    })

    it('returns "expiring" for dates within 30 days', () => {
      const nearFuture = new Date()
      nearFuture.setDate(nearFuture.getDate() + 15)
      const status = getCOIStatus(nearFuture.toISOString().split('T')[0])
      expect(status).toBe('expiring')
    })

    it('returns "active" for dates more than 30 days away', () => {
      const farFuture = new Date()
      farFuture.setDate(farFuture.getDate() + 60)
      const status = getCOIStatus(farFuture.toISOString().split('T')[0])
      expect(status).toBe('active')
    })

    it('returns "expiring" for exactly 30 days', () => {
      const thirtyDays = new Date()
      thirtyDays.setDate(thirtyDays.getDate() + 30)
      const status = getCOIStatus(thirtyDays.toISOString().split('T')[0])
      expect(status).toBe('expiring')
    })

    it('returns "active" for exactly 31 days', () => {
      const thirtyOneDays = new Date()
      thirtyOneDays.setDate(thirtyOneDays.getDate() + 31)
      const status = getCOIStatus(thirtyOneDays.toISOString().split('T')[0])
      expect(status).toBe('active')
    })
  })

  describe('getStatusColor', () => {
    it('returns green for active status', () => {
      expect(getStatusColor('active')).toBe('#28a745')
    })

    it('returns orange for expiring status', () => {
      expect(getStatusColor('expiring')).toBe('#ff9800')
    })

    it('returns red for expired status', () => {
      expect(getStatusColor('expired')).toBe('#dc3545')
    })
  })

  describe('getStatusLabel', () => {
    it('returns "Active" for active status', () => {
      expect(getStatusLabel('active')).toBe('Active')
    })

    it('returns "Expiring Soon" for expiring status', () => {
      expect(getStatusLabel('expiring')).toBe('Expiring Soon')
    })

    it('returns "Expired" for expired status', () => {
      expect(getStatusLabel('expired')).toBe('Expired')
    })
  })
})
