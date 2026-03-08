import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveTask, updateTask, getProjects, getTask } from '../db'
import type { Project } from '../db'

interface TaskData {
  title: string
  description: string
  contractReference: string
  projectId: string
}

interface TaskFormProps {
  editId?: string
  initialData?: TaskData
}

const TaskForm = ({ editId, initialData }: TaskFormProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState<TaskData>(initialData || {
    title: '',
    description: '',
    contractReference: '',
    projectId: searchParams.get('projectId') || ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  useEffect(() => {
    if (editId && !initialData) {
      getTask(editId).then(task => {
        if (task) {
          setFormData({
            title: task.title,
            description: task.description,
            contractReference: task.contractReference || '',
            projectId: task.projectId || ''
          })
        }
      })
    }
  }, [editId, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        ...(formData.contractReference && { contractReference: formData.contractReference }),
        ...(formData.projectId && { projectId: formData.projectId })
      }
      
      if (editId) {
        await updateTask(editId, taskData)
      } else {
        await saveTask(taskData)
      }
      navigate('/tasking')
    } catch (err) {
      setError('Failed to save task. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h2>{editId ? 'Edit Task' : 'New Task'}</h2>
      {error && (
        <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="projectId">Project (Optional)</label>
        <select 
          id="projectId"
          name="projectId" 
          value={formData.projectId} 
          onChange={handleChange}
        >
          <option value="">No Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label htmlFor="title">Title</label>
        <input 
          id="title"
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          placeholder="e.g. Install bathroom fixtures"
          required
        />

        <label htmlFor="description">Description</label>
        <textarea 
          id="description"
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Describe the work to be documented..."
          rows={4}
          required
        />

        <label htmlFor="contractReference">Contract Reference (Optional)</label>
        <input 
          id="contractReference"
          type="text" 
          name="contractReference" 
          value={formData.contractReference} 
          onChange={handleChange} 
          placeholder="e.g. CONTRACT-2024-001"
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (editId ? 'Update Task' : 'Save Task')}
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/tasking')}
          style={{ backgroundColor: '#444', color: '#fff', marginLeft: '0.5rem' }}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

export default TaskForm
