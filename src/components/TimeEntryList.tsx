import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getTimeEntries, deleteTimeEntry, getProjects } from '../db'
import type { TimeEntry, Project } from '../db'
import { formatDuration } from '../hooks/useActiveTimer'

const TimeEntryList = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [projects, setProjects] = useState<Map<string, Project>>(new Map())
  const [filterProject, setFilterProject] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      const [entriesData, projectsData] = await Promise.all([
        getTimeEntries(),
        getProjects(),
      ])
      
      if (mounted) {
        const sorted = entriesData.sort((a, b) => b.startTime - a.startTime)
        setEntries(sorted)
        
        const projectMap = new Map<string, Project>()
        projectsData.forEach(p => projectMap.set(p.id, p))
        setProjects(projectMap)
        setLoading(false)
      }
    }
    
    loadData()
    
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      await deleteTimeEntry(id)
      setEntries(entries.filter(e => e.id !== id))
    }
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getProjectName = (projectId: string): string => {
    return projects.get(projectId)?.name || 'Unknown Project'
  }

  const filteredEntries = filterProject
    ? entries.filter(e => e.projectId === filterProject)
    : entries

  const totalDuration = filteredEntries.reduce((sum, e) => sum + e.duration, 0)

  const groupedByDate = filteredEntries.reduce((groups, entry) => {
    const date = formatDate(entry.startTime)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, TimeEntry[]>)

  if (loading) {
    return (
      <div className="container">
        <h1>Time Tracker</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Time Tracker</h1>

      <NavLink to="/time/new">
        <button>Add Entry</button>
      </NavLink>

      <div style={{ marginTop: '1rem' }}>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
          }}
        >
          <option value="">All Projects</option>
          {Array.from(projects.values()).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {filteredEntries.length > 0 && (
        <div style={{
          backgroundColor: 'var(--accent-color)',
          color: '#fff',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '1rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Time</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {formatDuration(totalDuration)}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        {Object.keys(groupedByDate).length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            No time entries yet. Start tracking your work!
          </p>
        ) : (
          Object.entries(groupedByDate).map(([date, dateEntries]) => {
            const dayTotal = dateEntries.reduce((sum, e) => sum + e.duration, 0)
            
            return (
              <div key={date} style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.5rem',
                }}>
                  <strong>{date}</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formatDuration(dayTotal)}
                  </span>
                </div>
                
                {dateEntries.map(entry => (
                  <div
                    key={entry.id}
                    style={{
                      backgroundColor: 'var(--secondary-bg)',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '0.5rem',
                    }}>
                      <div>
                        <strong style={{ color: 'var(--accent-color)' }}>
                          {formatDuration(entry.duration)}
                        </strong>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {getProjectName(entry.projectId)}
                        </div>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.5rem',
                        fontStyle: 'italic',
                      }}>
                        {entry.notes}
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.75rem',
                    }}>
                      <NavLink to={`/time/edit/${entry.id}`}>
                        <button style={{
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem',
                        }}>
                          Edit
                        </button>
                      </NavLink>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TimeEntryList
