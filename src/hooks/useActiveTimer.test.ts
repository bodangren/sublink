import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useActiveTimer, formatDuration, formatTime, getStoredTimer } from './useActiveTimer'

describe('useActiveTimer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('starts with no active timer', () => {
    const { result } = renderHook(() => useActiveTimer())
    
    expect(result.current.activeTimer).toBeNull()
    expect(result.current.isRunning).toBe(false)
    expect(result.current.elapsedSeconds).toBe(0)
  })

  it('starts a timer', () => {
    const { result } = renderHook(() => useActiveTimer())
    
    act(() => {
      result.current.startTimer('project-1', 'Test Project')
    })
    
    expect(result.current.activeTimer).not.toBeNull()
    expect(result.current.activeTimer?.projectId).toBe('project-1')
    expect(result.current.activeTimer?.projectName).toBe('Test Project')
    expect(result.current.isRunning).toBe(true)
  })

  it('stores timer in localStorage', () => {
    const { result } = renderHook(() => useActiveTimer())
    
    act(() => {
      result.current.startTimer('project-1', 'Test Project')
    })
    
    const stored = getStoredTimer()
    expect(stored).not.toBeNull()
    expect(stored?.projectId).toBe('project-1')
  })

  it('stops timer and returns entry data', () => {
    const { result } = renderHook(() => useActiveTimer())
    
    act(() => {
      result.current.startTimer('project-1', 'Test Project')
    })
    
    expect(result.current.activeTimer).not.toBeNull()
    
    const entry = result.current.stopTimer()
    
    expect(entry).not.toBeNull()
    if (entry) {
      expect(entry.projectId).toBe('project-1')
      expect(entry.duration).toBeGreaterThanOrEqual(0)
    }
    expect(getStoredTimer()).toBeNull()
  })

  it('clears timer without saving', () => {
    const { result } = renderHook(() => useActiveTimer())
    
    act(() => {
      result.current.startTimer('project-1', 'Test Project')
    })
    
    act(() => {
      result.current.clearTimer()
    })
    
    expect(result.current.activeTimer).toBeNull()
    expect(result.current.isRunning).toBe(false)
    expect(getStoredTimer()).toBeNull()
  })

  it('starts timer with optional task and notes', () => {
    const { result } = renderHook(() => useActiveTimer())
    
    act(() => {
      result.current.startTimer('project-1', 'Test Project', 'task-1', 'Working on X')
    })
    
    expect(result.current.activeTimer?.taskId).toBe('task-1')
    expect(result.current.activeTimer?.notes).toBe('Working on X')
  })
})

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(30)).toBe('30s')
    expect(formatDuration(59)).toBe('59s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1m 0s')
    expect(formatDuration(90)).toBe('1m 30s')
    expect(formatDuration(3599)).toBe('59m 59s')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(3600)).toBe('1h 0m')
    expect(formatDuration(3661)).toBe('1h 1m')
    expect(formatDuration(7325)).toBe('2h 2m')
  })
})

describe('formatTime', () => {
  it('formats time in 12-hour format', () => {
    const date = new Date('2024-01-15T14:30:00')
    const formatted = formatTime(date)
    expect(formatted).toMatch(/2:30/)
  })
})
