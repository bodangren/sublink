import { useState, useEffect, useCallback } from 'react'

export interface ActiveTimer {
  projectId: string
  projectName: string
  taskId?: string
  startTime: number
  notes?: string
}

const STORAGE_KEY = 'sublink-active-timer'

export const getStoredTimer = (): ActiveTimer | null => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

const getInitialTimer = (): ActiveTimer | null => {
  return getStoredTimer()
}

const getInitialElapsed = (): number => {
  const stored = getStoredTimer()
  if (!stored) return 0
  return Math.floor((Date.now() - stored.startTime) / 1000)
}

export const useActiveTimer = () => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(getInitialTimer)
  const [elapsedSeconds, setElapsedSeconds] = useState(getInitialElapsed)

  useEffect(() => {
    if (!activeTimer) {
      return
    }

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - activeTimer.startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTimer])

  const startTimer = useCallback((projectId: string, projectName: string, taskId?: string, notes?: string) => {
    const timer: ActiveTimer = {
      projectId,
      projectName,
      taskId,
      startTime: Date.now(),
      notes,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timer))
    setActiveTimer(timer)
    setElapsedSeconds(0)
  }, [])

  const stopTimer = useCallback(() => {
    if (!activeTimer) return null
    
    const entry = {
      projectId: activeTimer.projectId,
      taskId: activeTimer.taskId,
      startTime: activeTimer.startTime,
      endTime: Date.now(),
      duration: Math.floor((Date.now() - activeTimer.startTime) / 1000),
      notes: activeTimer.notes,
    }
    
    localStorage.removeItem(STORAGE_KEY)
    setActiveTimer(null)
    setElapsedSeconds(0)
    
    return entry
  }, [activeTimer])

  const clearTimer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setActiveTimer(null)
    setElapsedSeconds(0)
  }, [])

  const updateTimerNotes = useCallback((notes: string) => {
    if (!activeTimer) return
    const updated = { ...activeTimer, notes }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setActiveTimer(updated)
  }, [activeTimer])

  return {
    activeTimer,
    elapsedSeconds,
    startTimer,
    stopTimer,
    clearTimer,
    updateTimerNotes,
    isRunning: !!activeTimer,
  }
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
