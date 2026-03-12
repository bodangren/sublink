import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveEquipment, updateEquipment, getProjects } from '../db'
import type { Project, EquipmentCategory, EquipmentStatus } from '../db'

interface EquipmentData {
  name: string
  description: string
  category: EquipmentCategory
  serialNumber: string
  modelNumber: string
  purchaseDate: string
  purchasePrice: string
  currentProjectId: string
  currentProjectName: string
  maintenanceIntervalDays: string
  maintenanceNotes: string
  status: EquipmentStatus
}

interface EquipmentFormProps {
  editId?: string
  initialData?: EquipmentData
}

const EQUIPMENT_CATEGORIES: { value: EquipmentCategory; label: string }[] = [
  { value: 'power_tool', label: 'Power Tool' },
  { value: 'hand_tool', label: 'Hand Tool' },
  { value: 'heavy_equipment', label: 'Heavy Equipment' },
  { value: 'safety_gear', label: 'Safety Gear' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
]

const EQUIPMENT_STATUS: { value: EquipmentStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'in_repair', label: 'In Repair' },
  { value: 'retired', label: 'Retired/Lost' },
]

const EquipmentForm = ({ editId, initialData }: EquipmentFormProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState<EquipmentData>(initialData || {
    name: '',
    description: '',
    category: 'power_tool',
    serialNumber: '',
    modelNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    currentProjectId: searchParams.get('projectId') || '',
    currentProjectName: '',
    maintenanceIntervalDays: '',
    maintenanceNotes: '',
    status: 'active',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value
    const project = projects.find(p => p.id === projectId)
    setFormData(prev => ({
      ...prev,
      currentProjectId: projectId,
      currentProjectName: project?.name || '',
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formData.name.trim()) {
      setError('Equipment name is required')
      setIsSubmitting(false)
      return
    }

    const purchasePrice = formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined
    if (formData.purchasePrice && (isNaN(purchasePrice!) || purchasePrice! < 0)) {
      setError('Please enter a valid purchase price')
      setIsSubmitting(false)
      return
    }

    const maintenanceIntervalDays = formData.maintenanceIntervalDays
      ? parseInt(formData.maintenanceIntervalDays)
      : undefined
    if (formData.maintenanceIntervalDays && (isNaN(maintenanceIntervalDays!) || maintenanceIntervalDays! < 1)) {
      setError('Maintenance interval must be a positive number')
      setIsSubmitting(false)
      return
    }

    try {
      const equipmentData = {
        name: formData.name.trim(),
        category: formData.category,
        status: formData.status,
        ...(formData.description && { description: formData.description }),
        ...(formData.serialNumber && { serialNumber: formData.serialNumber }),
        ...(formData.modelNumber && { modelNumber: formData.modelNumber }),
        ...(formData.purchaseDate && { purchaseDate: formData.purchaseDate }),
        ...(purchasePrice !== undefined && { purchasePrice }),
        ...(formData.currentProjectId && {
          currentProjectId: formData.currentProjectId,
          currentProjectName: formData.currentProjectName,
          assignedDate: new Date().toISOString().split('T')[0],
        }),
        ...(maintenanceIntervalDays !== undefined && { maintenanceIntervalDays }),
        ...(formData.maintenanceNotes && { maintenanceNotes: formData.maintenanceNotes }),
      }

      if (editId) {
        await updateEquipment(editId, equipmentData)
      } else {
        await saveEquipment(equipmentData)
      }
      navigate('/equipment')
    } catch (err) {
      setError('Failed to save equipment. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h2>{editId ? 'Edit Equipment' : 'New Equipment'}</h2>
      {error && (
        <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Equipment Name *</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. DeWalt Cordless Drill"
          required
        />

        <label htmlFor="category">Category *</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          {EQUIPMENT_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <label htmlFor="status">Status *</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          {EQUIPMENT_STATUS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of the equipment..."
          rows={2}
        />

        <label htmlFor="serialNumber">Serial Number (Optional)</label>
        <input
          id="serialNumber"
          type="text"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          placeholder="e.g. SN-12345678"
        />

        <label htmlFor="modelNumber">Model Number (Optional)</label>
        <input
          id="modelNumber"
          type="text"
          name="modelNumber"
          value={formData.modelNumber}
          onChange={handleChange}
          placeholder="e.g. DCD791D2"
        />

        <label htmlFor="purchaseDate">Purchase Date (Optional)</label>
        <input
          id="purchaseDate"
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
        />

        <label htmlFor="purchasePrice">Purchase Price $ (Optional)</label>
        <input
          id="purchasePrice"
          type="number"
          name="purchasePrice"
          value={formData.purchasePrice}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
        />

        <label htmlFor="currentProjectId">Assign to Project (Optional)</label>
        <select
          id="currentProjectId"
          name="currentProjectId"
          value={formData.currentProjectId}
          onChange={handleProjectChange}
        >
          <option value="">In Inventory (No Project)</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label htmlFor="maintenanceIntervalDays">Maintenance Interval (Days)</label>
        <input
          id="maintenanceIntervalDays"
          type="number"
          name="maintenanceIntervalDays"
          value={formData.maintenanceIntervalDays}
          onChange={handleChange}
          placeholder="e.g. 90 for every 90 days"
          min="1"
        />

        <label htmlFor="maintenanceNotes">Maintenance Notes (Optional)</label>
        <textarea
          id="maintenanceNotes"
          name="maintenanceNotes"
          value={formData.maintenanceNotes}
          onChange={handleChange}
          placeholder="Special maintenance instructions..."
          rows={2}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (editId ? 'Update Equipment' : 'Save Equipment')}
        </button>

        <button
          type="button"
          onClick={() => navigate('/equipment')}
          style={{ backgroundColor: '#444', color: '#fff', marginLeft: '0.5rem' }}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

export default EquipmentForm
