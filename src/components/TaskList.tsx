import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getTasks, deleteTask, getPhotoCountByTask, getProjects } from '../db'
import type { Task, Project } from '../db'

interface TaskWithPhotoCount extends Task {
  photoCount: number
  projectName?: string
}

const TaskList = () => {
  const [tasks, setTasks] = useState<TaskWithPhotoCount[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      const [taskList, projectList] = await Promise.all([
        getTasks(),
        getProjects()
      ])
      const projectMap = new Map(projectList.map(p => [p.id, p.name]))
      const tasksWithCounts = await Promise.all(
        taskList.map(async (task) => ({
          ...task,
          photoCount: await getPhotoCountByTask(task.id),
          projectName: task.projectId ? projectMap.get(task.projectId) : undefined
        }))
      )
      if (mounted) {
        setProjects(projectList)
        setTasks(tasksWithCounts.sort((a, b) => b.createdAt - a.createdAt))
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task? All photos will also be deleted.')) {
      await deleteTask(id)
      const taskList = await getTasks()
      const projectMap = new Map(projects.map(p => [p.id, p.name]))
      const tasksWithCounts = await Promise.all(
        taskList.map(async (task) => ({
          ...task,
          photoCount: await getPhotoCountByTask(task.id),
          projectName: task.projectId ? projectMap.get(task.projectId) : undefined
        }))
      )
      setTasks(tasksWithCounts.sort((a, b) => b.createdAt - a.createdAt))
    }
  }

  return (
    <div className="container">
      <h1>Photo-Verified Tasks</h1>
      <NavLink to="/tasking/new">
        <button>New Task</button>
      </NavLink>
      
      <div style={{ marginTop: '2rem' }}>
        {tasks.length === 0 ? (
          <p>No tasks yet. Create your first task to start documenting work.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tasks.map(task => (
              <li key={task.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '1rem', 
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{task.title}</strong>
                    {task.projectName && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--accent-color)' }}>
                        {task.projectName}
                      </div>
                    )}
                    <small style={{ color: 'var(--text-secondary)' }}>
                      {new Date(task.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <span style={{ 
                    backgroundColor: 'var(--accent-color)', 
                    color: '#fff', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {task.photoCount} photo{task.photoCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {task.description}
                  {task.contractReference && (
                    <>
                      <br/>
                      <strong>Contract:</strong> {task.contractReference}
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <NavLink to={`/tasking/${task.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                      View & Add Photos
                    </button>
                  </NavLink>
                  <NavLink to={`/tasking/edit/${task.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Edit</button>
                  </NavLink>
                  <button 
                    onClick={() => handleDelete(task.id)}
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

export default TaskList
