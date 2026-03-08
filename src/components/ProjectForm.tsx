import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveProject, getProject, updateProject } from '../db'

interface ProjectFormProps {
  editId?: string
  initialData?: {
    name: string
    client?: string
    address?: string
    contractValue?: string
    startDate?: string
    endDate?: string
    notes?: string
  }
}

const ProjectForm = ({ editId, initialData }: ProjectFormProps) => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    client: initialData?.client || '',
    address: initialData?.address || '',
    contractValue: initialData?.contractValue || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    notes: initialData?.notes || ''
  })

  useEffect(() => {
    if (editId && !initialData) {
      getProject(editId).then(project => {
        if (project) {
          setFormData({
            name: project.name,
            client: project.client || '',
            address: project.address || '',
            contractValue: project.contractValue || '',
            startDate: project.startDate || '',
            endDate: project.endDate || '',
            notes: project.notes || ''
          })
        }
      })
    }
  }, [editId, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Project name is required')
      return
    }

    setSaving(true)
    try {
      if (editId) {
        await updateProject(editId, formData)
      } else {
        await saveProject(formData)
      }
      navigate('/projects')
    } catch (error) {
      console.error('Failed to save project:', error)
      alert('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container">
      <h1>{editId ? 'Edit Project' : 'New Project'}</h1>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Johnson Residence Kitchen Remodel"
            required
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="client" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Client
          </label>
          <input
            type="text"
            id="client"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            placeholder="e.g., ABC Construction, John Smith"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Address
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g., 123 Main St, Anytown, ST 12345"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="contractValue" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Contract Value
          </label>
          <input
            type="text"
            id="contractValue"
            value={formData.contractValue}
            onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
            placeholder="e.g., 25000"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="startDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="endDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="notes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about this project..."
            rows={4}
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={saving} style={{ flex: 1 }}>
            {saving ? 'Saving...' : (editId ? 'Update Project' : 'Create Project')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/projects')} 
            style={{ flex: 1, backgroundColor: '#6c757d', color: '#fff' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
