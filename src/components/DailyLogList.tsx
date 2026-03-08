import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getDailyLogs, deleteDailyLog } from '../db'
import type { DailyLog } from '../db'
import { useConfirm } from '../hooks/useConfirm'

const DailyLogList = () => {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    getDailyLogs().then(data => {
      if (mounted) {
        setLogs(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Daily Log',
      message: 'Are you sure you want to delete this daily log?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteDailyLog(id)
      const data = await getDailyLogs()
      setLogs(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="container"><p>Loading logs...</p></div>
  }

  return (
    <div className="container">
      <h1>Daily Logs</h1>
      <NavLink to="/logs/new">
        <button>New Daily Log</button>
      </NavLink>
      
      <div style={{ marginTop: '2rem' }}>
        {logs.length === 0 ? (
          <p>No daily logs recorded yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {logs.map(log => (
              <li key={log.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '1rem', 
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{log.project}</strong><br/>
                    <small style={{ color: 'var(--accent-color)' }}>{formatDate(log.date)}</small>
                  </div>
                  <span style={{ 
                    backgroundColor: '#333', 
                    color: '#fff', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    {log.weather}
                  </span>
                </div>
                <p style={{ 
                  margin: '0.75rem 0', 
                  fontSize: '0.9rem',
                  color: '#ccc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const
                }}>
                  {log.workPerformed}
                </p>
                <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.75rem' }}>
                  Crew: {log.personnel}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <NavLink to={`/logs/${log.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View</button>
                  </NavLink>
                  <NavLink to={`/logs/edit/${log.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#666' }}>Edit</button>
                  </NavLink>
                  <button 
                    onClick={() => handleDelete(log.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff' }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default DailyLogList
