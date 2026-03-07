import { useState, useEffect } from 'react'
import { getTasks, getWaivers, getCOIs } from '../db'

const DashboardStats = () => {
  const [taskCount, setTaskCount] = useState(0)
  const [waiverCount, setWaiverCount] = useState(0)
  const [coiCount, setCoiCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const loadStats = async () => {
      const tasks = await getTasks()
      const waivers = await getWaivers()
      const cois = await getCOIs()
      
      if (mounted) {
        setTaskCount(tasks.length)
        setWaiverCount(waivers.length)
        setCoiCount(cois.length)
      }
    }
    loadStats()
    return () => { mounted = false }
  }, [])

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-number">{taskCount}</div>
        <div className="stat-label">Tasks</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{waiverCount}</div>
        <div className="stat-label">Waivers</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{coiCount}</div>
        <div className="stat-label">Certificates</div>
      </div>
    </div>
  )
}

export default DashboardStats
