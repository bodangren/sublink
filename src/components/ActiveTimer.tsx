import { useState } from 'react'
import { useActiveTimer, formatDuration, formatTime } from '../hooks/useActiveTimer'
import { saveTimeEntry } from '../db'
import { useConfirm } from '../hooks/useConfirm'

interface ActiveTimerProps {
  onStop?: () => void
  compact?: boolean
}

const ActiveTimerComponent = ({ onStop, compact = false }: ActiveTimerProps) => {
  const { activeTimer, elapsedSeconds, stopTimer, clearTimer, isRunning } = useActiveTimer()
  const confirm = useConfirm()
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [stopping, setStopping] = useState(false)

  const handleStop = async () => {
    if (!activeTimer) return
    
    setStopping(true)
    const entry = stopTimer()
    
    if (entry) {
      await saveTimeEntry({
        ...entry,
        notes: notes || entry.notes,
      })
    }
    
    setStopping(false)
    setShowNotes(false)
    setNotes('')
    onStop?.()
  }

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: 'Discard Timer',
      message: 'Discard this timer? Time will not be saved.',
      confirmLabel: 'Discard',
      variant: 'warning'
    })
    if (confirmed) {
      clearTimer()
      setShowNotes(false)
      setNotes('')
    }
  }

  if (!isRunning || !activeTimer) {
    return null
  }

  const startTime = new Date(activeTimer.startTime)

  if (compact) {
    return (
      <div style={{
        backgroundColor: 'var(--accent-color)',
        color: '#fff',
        padding: '0.75rem 1rem',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            {formatDuration(elapsedSeconds)}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
            {activeTimer.projectName}
          </div>
        </div>
        <button
          onClick={handleStop}
          disabled={stopping}
          style={{
            backgroundColor: '#fff',
            color: 'var(--accent-color)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: stopping ? 'wait' : 'pointer',
          }}
        >
          Stop
        </button>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'var(--secondary-bg)',
      border: '2px solid var(--accent-color)',
      borderRadius: '8px',
      padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--accent-color)' }}>Timer Running</h3>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
            {activeTimer.projectName}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
            {formatDuration(elapsedSeconds)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Started {formatTime(startTime)}
          </div>
        </div>
      </div>

      {!showNotes ? (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => setShowNotes(true)}
            style={{
              flex: 1,
              backgroundColor: 'var(--secondary-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add Notes
          </button>
          <button
            onClick={handleStop}
            disabled={stopping}
            style={{
              flex: 2,
              backgroundColor: 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: stopping ? 'wait' : 'pointer',
            }}
          >
            {stopping ? 'Saving...' : 'Stop & Save'}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What are you working on?"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)',
              minHeight: '80px',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => setShowNotes(false)}
              style={{
                flex: 1,
                backgroundColor: 'var(--secondary-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleStop}
              disabled={stopping}
              style={{
                flex: 2,
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: stopping ? 'wait' : 'pointer',
              }}
            >
              {stopping ? 'Saving...' : 'Stop & Save'}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleCancel}
        style={{
          width: '100%',
          marginTop: '0.75rem',
          backgroundColor: 'transparent',
          color: '#dc3545',
          border: '1px solid #dc3545',
          padding: '0.5rem',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Discard Timer
      </button>
    </div>
  )
}

export default ActiveTimerComponent
