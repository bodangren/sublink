import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveDailyLog, updateDailyLog, getProjects, getDailyLog } from '../db'
import type { Project } from '../db'

interface DailyLogData {
  date: string
  project: string
  projectId: string
  weather: string
  workPerformed: string
  delays: string
  personnel: string
  equipment: string
  notes: string
}

interface DailyLogFormProps {
  editId?: string
  initialData?: DailyLogData
}

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

const DailyLogForm = ({ editId, initialData }: DailyLogFormProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState<DailyLogData>(initialData || {
    date: getTodayDate(),
    project: '',
    projectId: searchParams.get('projectId') || '',
    weather: '',
    workPerformed: '',
    delays: '',
    personnel: '',
    equipment: '',
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  useEffect(() => {
    if (editId && !initialData) {
      getDailyLog(editId).then(log => {
        if (log) {
          setFormData({
            date: log.date,
            project: log.project,
            projectId: log.projectId || '',
            weather: log.weather,
            workPerformed: log.workPerformed,
            delays: log.delays || '',
            personnel: log.personnel,
            equipment: log.equipment || '',
            notes: log.notes || ''
          })
        }
      })
    }
  }, [editId, initialData])

  useEffect(() => {
    if (!editId && !initialData && formData.projectId) {
      const selectedProject = projects.find(p => p.id === formData.projectId)
      if (selectedProject) {
        setFormData(prev => ({ ...prev, project: selectedProject.name }))
      }
    }
  }, [formData.projectId, projects, editId, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'projectId') {
      const selectedProject = projects.find(p => p.id === value)
      setFormData(prev => ({ 
        ...prev, 
        projectId: value, 
        project: selectedProject ? selectedProject.name : '' 
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const logData = {
        date: formData.date,
        project: formData.project,
        weather: formData.weather,
        workPerformed: formData.workPerformed,
        personnel: formData.personnel,
        ...(formData.projectId && { projectId: formData.projectId }),
        ...(formData.delays && { delays: formData.delays }),
        ...(formData.equipment && { equipment: formData.equipment }),
        ...(formData.notes && { notes: formData.notes }),
      }
      
      if (editId) {
        await updateDailyLog(editId, logData)
      } else {
        await saveDailyLog(logData)
      }
      navigate('/logs')
    } catch (err) {
      setError('Failed to save daily log. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h2>{editId ? 'Edit Daily Log' : 'New Daily Log'}</h2>
      {error && (
        <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="date">Date</label>
        <input 
          id="date"
          type="date" 
          name="date" 
          value={formData.date} 
          onChange={handleChange} 
          required
        />

        <label htmlFor="projectId">Project (Optional)</label>
        <select 
          id="projectId"
          name="projectId" 
          value={formData.projectId} 
          onChange={handleChange}
        >
          <option value="">Select Project or Enter Manually Below</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label htmlFor="project">Project / Job Site Name</label>
        <input 
          id="project"
          type="text" 
          name="project" 
          value={formData.project} 
          onChange={handleChange} 
          placeholder="e.g. Downtown Office Building - 4th Floor"
          required
        />

        <label htmlFor="weather">Weather Conditions</label>
        <input 
          id="weather"
          type="text" 
          name="weather" 
          value={formData.weather} 
          onChange={handleChange} 
          placeholder="e.g. Sunny, 72F, Light Wind"
          required
        />

        <label htmlFor="workPerformed">Work Performed</label>
        <textarea 
          id="workPerformed"
          name="workPerformed" 
          value={formData.workPerformed} 
          onChange={handleChange} 
          placeholder="Describe the work completed today..."
          rows={4}
          required
        />

        <label htmlFor="delays">Delays / Issues (Optional)</label>
        <textarea 
          id="delays"
          name="delays" 
          value={formData.delays} 
          onChange={handleChange} 
          placeholder="Document any delays, material shortages, or issues..."
          rows={2}
        />

        <label htmlFor="personnel">Personnel On Site</label>
        <input 
          id="personnel"
          type="text" 
          name="personnel" 
          value={formData.personnel} 
          onChange={handleChange} 
          placeholder="e.g. John (Foreman), Mike, Sarah, Carlos"
          required
        />

        <label htmlFor="equipment">Equipment Used (Optional)</label>
        <input 
          id="equipment"
          type="text" 
          name="equipment" 
          value={formData.equipment} 
          onChange={handleChange} 
          placeholder="e.g. Crane, Forklift, Scissor Lift"
        />

        <label htmlFor="notes">Additional Notes (Optional)</label>
        <textarea 
          id="notes"
          name="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          placeholder="Any other relevant information..."
          rows={2}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (editId ? 'Update Log' : 'Save Log')}
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/logs')}
          style={{ backgroundColor: '#444', color: '#fff', marginLeft: '0.5rem' }}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

export default DailyLogForm
