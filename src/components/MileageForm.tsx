import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveMileage, updateMileage, getProjects, getMileage } from '../db'
import type { Project } from '../db'

interface MileageData {
  projectId: string
  projectName: string
  date: string
  startLocation: string
  endLocation: string
  startCoords?: { lat: number; lng: number }
  endCoords?: { lat: number; lng: number }
  miles: string
  purpose: string
  notes: string
  isRoundTrip: boolean
}

interface MileageFormProps {
  editId?: string
  initialData?: MileageData
}

const MileageForm = ({ editId, initialData }: MileageFormProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState<MileageData>(initialData || {
    projectId: searchParams.get('projectId') || '',
    projectName: '',
    date: new Date().toISOString().split('T')[0],
    startLocation: '',
    endLocation: '',
    startCoords: undefined,
    endCoords: undefined,
    miles: '',
    purpose: '',
    notes: '',
    isRoundTrip: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  useEffect(() => {
    if (editId && !initialData) {
      getMileage(editId).then(mileage => {
        if (mileage) {
          setFormData({
            projectId: mileage.projectId || '',
            projectName: mileage.projectName || '',
            date: mileage.date,
            startLocation: mileage.startLocation,
            endLocation: mileage.endLocation,
            startCoords: mileage.startCoords,
            endCoords: mileage.endCoords,
            miles: mileage.miles.toString(),
            purpose: mileage.purpose || '',
            notes: mileage.notes || '',
            isRoundTrip: mileage.isRoundTrip,
          })
        }
      })
    }
  }, [editId, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'projectId') {
      const selectedProject = projects.find(p => p.id === value)
      setFormData(prev => ({
        ...prev,
        projectId: value,
        projectName: selectedProject?.name || '',
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          startCoords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }))
        setGpsError(null)
      },
      (err) => {
        setGpsError(`Could not capture location: ${err.message}`)
      }
    )
  }

  const validateForm = (): boolean => {
    if (!formData.startLocation.trim()) {
      setError('Start location is required')
      return false
    }
    if (!formData.endLocation.trim()) {
      setError('End location is required')
      return false
    }
    const milesNum = parseFloat(formData.miles)
    if (isNaN(milesNum) || milesNum <= 0) {
      setError('Miles must be a positive number')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const mileageData = {
        projectId: formData.projectId || undefined,
        projectName: formData.projectName || undefined,
        date: formData.date,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        startCoords: formData.startCoords,
        endCoords: formData.endCoords,
        miles: parseFloat(formData.miles),
        purpose: formData.purpose || undefined,
        notes: formData.notes || undefined,
        isRoundTrip: formData.isRoundTrip,
      }

      if (editId) {
        await updateMileage(editId, mileageData)
      } else {
        await saveMileage(mileageData)
      }

      navigate('/mileage')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mileage entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-container">
      <h2>{editId ? 'Edit Mileage Entry' : 'Log Mileage'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectId">Project</label>
          <select
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
          >
            <option value="">No Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="startLocation">Start Location *</label>
          <input
            type="text"
            id="startLocation"
            name="startLocation"
            value={formData.startLocation}
            onChange={handleChange}
            placeholder="e.g., Office, Home"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endLocation">End Location *</label>
          <input
            type="text"
            id="endLocation"
            name="endLocation"
            value={formData.endLocation}
            onChange={handleChange}
            placeholder="e.g., Job Site, Client Office"
            required
          />
        </div>

        <div className="form-group">
          <button type="button" onClick={captureLocation} className="button-secondary">
            📍 Capture Current Location
          </button>
          {formData.startCoords && (
            <div className="gps-info">
              Location captured: {formData.startCoords.lat.toFixed(6)}, {formData.startCoords.lng.toFixed(6)}
            </div>
          )}
          {gpsError && <div className="error-message">{gpsError}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="miles">Miles *</label>
          <input
            type="number"
            id="miles"
            name="miles"
            value={formData.miles}
            onChange={handleChange}
            placeholder="e.g., 25.5"
            step="0.1"
            min="0"
            required
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isRoundTrip"
              checked={formData.isRoundTrip}
              onChange={handleChange}
            />
            Round Trip
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="purpose">Purpose</label>
          <input
            type="text"
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="e.g., Site inspection, Material pickup"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Additional notes..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="button-primary">
            {isSubmitting ? 'Saving...' : (editId ? 'Update Mileage' : 'Log Mileage')}
          </button>
          <button type="button" onClick={() => navigate('/mileage')} className="button-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default MileageForm
