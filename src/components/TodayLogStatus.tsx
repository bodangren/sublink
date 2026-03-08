import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getDailyLogByDate } from '../db'

const TodayLogStatus = () => {
  const [hasTodayLog, setHasTodayLog] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    const today = new Date().toISOString().split('T')[0]
    getDailyLogByDate(today).then(log => {
      if (mounted) {
        setHasTodayLog(!!log)
      }
    })
    return () => { mounted = false }
  }, [])

  if (hasTodayLog === null) {
    return null
  }

  if (hasTodayLog) {
    return (
      <div className="dashboard-card success-card">
        <div className="card-header">
          <span className="card-icon">✓</span>
          <h3>Today's Log Complete</h3>
        </div>
        <p className="card-text">You've created your daily log for today.</p>
        <NavLink to="/logs" className="card-link">
          <button className="card-button">View Logs</button>
        </NavLink>
      </div>
    )
  }

  return (
    <div className="dashboard-card warning-card">
      <div className="card-header">
        <span className="card-icon">!</span>
        <h3>Daily Log Pending</h3>
      </div>
      <p className="card-text">Don't forget to create your daily log.</p>
      <NavLink to="/logs/new" className="card-link">
        <button className="card-button">Create Log</button>
      </NavLink>
    </div>
  )
}

export default TodayLogStatus
