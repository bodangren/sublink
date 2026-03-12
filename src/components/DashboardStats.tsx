import { useState } from 'react'
import { getTasks, getWaivers, getCOIs } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

const DashboardStats = () => {
  const [taskCount, setTaskCount] = useState(0)
  const [waiverCount, setWaiverCount] = useState(0)
  const [coiCount, setCoiCount] = useState(0)

  useAsyncEffect(
    async (isMounted) => {
      const tasks = await getTasks()
      const waivers = await getWaivers()
      const cois = await getCOIs()
      
      if (isMounted()) {
        setTaskCount(tasks.length)
        setWaiverCount(waivers.length)
        setCoiCount(cois.length)
      }
    },
    []
  )

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
