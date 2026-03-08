import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getProjects, deleteProject } from '../db'
import type { Project } from '../db'

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    let mounted = true
    getProjects().then(data => {
      if (mounted) setProjects(data.sort((a, b) => b.updatedAt - a.updatedAt))
    })
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? Related items will keep their project name.')) {
      await deleteProject(id)
      const data = await getProjects()
      setProjects(data.sort((a, b) => b.updatedAt - a.updatedAt))
    }
  }

  const getProjectStatus = (project: Project) => {
    if (!project.startDate && !project.endDate) return 'active'
    const today = new Date().toISOString().split('T')[0]
    if (project.endDate && project.endDate < today) return 'completed'
    if (project.startDate && project.startDate > today) return 'upcoming'
    return 'active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745'
      case 'completed': return '#6c757d'
      case 'upcoming': return '#ffc107'
      default: return '#6c757d'
    }
  }

  return (
    <div className="container">
      <h1>Projects</h1>
      <NavLink to="/projects/new">
        <button>New Project</button>
      </NavLink>
      
      <div style={{ marginTop: '2rem' }}>
        {projects.length === 0 ? (
          <p>No projects yet. Create your first project to organize your work.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {projects.map(project => {
              const status = getProjectStatus(project)
              const statusColor = getStatusColor(status)
              
              return (
                <li key={project.id} style={{ 
                  backgroundColor: 'var(--secondary-bg)', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  borderLeft: `4px solid ${statusColor}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{project.name}</strong>
                      {project.client && <div><small>{project.client}</small></div>}
                    </div>
                    <span style={{ 
                      backgroundColor: statusColor, 
                      color: '#fff', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {status}
                    </span>
                  </div>
                  {project.address && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {project.address}
                    </div>
                  )}
                  {project.contractValue && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Contract: ${project.contractValue}
                    </div>
                  )}
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <NavLink to={`/projects/${project.id}`}>
                      <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View</button>
                    </NavLink>
                    <NavLink to={`/projects/edit/${project.id}`}>
                      <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Edit</button>
                    </NavLink>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff' }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ProjectList
