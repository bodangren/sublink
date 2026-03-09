import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getDailyLogByDate, getPhotoCountByDailyLog } from '../db'

const TodayLogStatus = () => {
  const [hasTodayLog, setHasTodayLog] = useState<boolean | null>(null)
  const [photoCount, setPhotoCount] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    const today = new Date().toISOString().split('T')[0]
    getDailyLogByDate(today).then(async log => {
      if (mounted) {
        setHasTodayLog(!!log)
        if (log) {
          const count = await getPhotoCountByDailyLog(log.id)
          if (mounted) {
            setPhotoCount(count)
          }
        }
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
        <p className="card-text">
          You've created your daily log for today.
          {photoCount > 0 && ` (${photoCount} photo${photoCount !== 1 ? 's' : ''})`}
        </p>
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
