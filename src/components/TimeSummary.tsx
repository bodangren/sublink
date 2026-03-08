import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getTotalDurationToday, getProjects } from '../db'
import type { Project } from '../db'
import { useActiveTimer, formatDuration, getStoredTimer } from '../hooks/useActiveTimer'

const TimeSummary = () => {
  const [totalToday, setTotalToday] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const { elapsedSeconds, startTimer, isRunning } = useActiveTimer()

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      const [duration, projectsData] = await Promise.all([
        getTotalDurationToday(),
        getProjects(),
      ])
      
      if (mounted) {
        setTotalToday(duration)
        setProjects(projectsData)
      }
    }
    
    loadData()
    
    const interval = setInterval(() => {
      getTotalDurationToday().then(d => {
        if (mounted) setTotalToday(d)
      })
    }, 60000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const handleStartTimer = (projectId: string, projectName: string) => {
    startTimer(projectId, projectName)
    setShowProjectPicker(false)
  }

  const storedTimer = getStoredTimer()
  const hasRunningTimer = isRunning || storedTimer

  return (
    <div style={{
      backgroundColor: 'var(--secondary-bg)',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
    }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Time Today</h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: 'var(--accent-color)',
          }}>
            {formatDuration(totalToday + (hasRunningTimer ? elapsedSeconds : 0))}
          </div>
          {hasRunningTimer && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--accent-color)',
                borderRadius: '50%',
                animation: 'pulse 1s infinite',
              }}></span>
              Timer running
            </div>
          )}
        </div>
        
        {!hasRunningTimer && (
          <button
            onClick={() => setShowProjectPicker(!showProjectPicker)}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Start
          </button>
        )}
      </div>

      {showProjectPicker && !hasRunningTimer && (
        <div style={{
          marginTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem',
        }}>
          <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Select project:
          </div>
          {projects.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              No projects yet. Create one first.
            </p>
          ) : (
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleStartTimer(p.id, p.name)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.25rem',
                    backgroundColor: 'var(--primary-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)',
      }}>
        <NavLink
          to="/time"
          style={{
            fontSize: '0.875rem',
            color: 'var(--accent-color)',
            textDecoration: 'none',
          }}
        >
          View all entries →
        </NavLink>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default TimeSummary
