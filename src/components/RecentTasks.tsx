import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getTasks } from '../db'
import type { Task } from '../db'
import { useAsyncEffect } from '../hooks/useAsyncEffect'

interface RecentTasksProps {
  inline?: boolean
}

const RecentTasks = ({ inline = false }: RecentTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([])

  useAsyncEffect(
    async (isMounted) => {
      const allTasks = await getTasks()
      const sorted = allTasks.sort((a, b) => b.createdAt - a.createdAt)
      const recent = sorted.slice(0, 5)
      if (isMounted()) {
        setTasks(recent)
      }
    },
    []
  )

  const content = tasks.length === 0 ? (
    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
      No tasks yet. <NavLink to="/tasking/new" style={{ color: 'var(--accent-color)' }}>Create one</NavLink>
    </p>
  ) : (
    <>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map(task => (
          <li
            key={task.id}
            style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <NavLink
              to={`/tasking/${task.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{task.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
      <NavLink
        to="/tasking"
        style={{
          display: 'block',
          textAlign: 'center',
          color: 'var(--accent-color)',
          textDecoration: 'none',
          fontSize: '0.875rem',
          paddingTop: '0.75rem',
        }}
      >
        View All Tasks →
      </NavLink>
    </>
  )

  if (inline) {
    return <div>{content}</div>
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Tasks</h3>
      </div>
      {content}
    </div>
  )
}

export default RecentTasks
