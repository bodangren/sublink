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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.75rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--secondary-bg)',
        border: '2px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1rem 0.75rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--accent-color)',
          lineHeight: 1,
        }}>
          {taskCount}
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-color)',
          marginTop: '0.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Tasks
        </div>
      </div>
      <div style={{
        backgroundColor: 'var(--secondary-bg)',
        border: '2px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1rem 0.75rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--accent-color)',
          lineHeight: 1,
        }}>
          {waiverCount}
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-color)',
          marginTop: '0.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Waivers
        </div>
      </div>
      <div style={{
        backgroundColor: 'var(--secondary-bg)',
        border: '2px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1rem 0.75rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--accent-color)',
          lineHeight: 1,
        }}>
          {coiCount}
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-color)',
          marginTop: '0.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Certs
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
