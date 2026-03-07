import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getTasks } from '../db'
import type { Task } from '../db'

const RecentTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    let mounted = true
    const loadTasks = async () => {
      const allTasks = await getTasks()
      const sorted = allTasks.sort((a, b) => b.createdAt - a.createdAt)
      const recent = sorted.slice(0, 5)
      if (mounted) {
        setTasks(recent)
      }
    }
    loadTasks()
    return () => { mounted = false }
  }, [])

  if (tasks.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Tasks</h3>
        </div>
        <p className="card-text">No tasks yet. Create your first task to get started.</p>
        <NavLink to="/tasking/new">
          <button className="card-button">Create Task</button>
        </NavLink>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Tasks</h3>
      </div>
      <ul className="card-list">
        {tasks.map(task => (
          <li key={task.id} className="card-list-item">
            <NavLink to={`/tasking/${task.id}`} className="item-link">
              <div className="item-header">
                <span className="item-title">{task.title}</span>
              </div>
              <div className="item-details">
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
      <NavLink to="/tasking" className="card-link">
        <button className="card-button">View All Tasks</button>
      </NavLink>
    </div>
  )
}

export default RecentTasks
