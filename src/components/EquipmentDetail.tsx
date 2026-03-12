import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getEquipment, deleteEquipment, logEquipmentMaintenance, assignEquipmentToProject, getProjects } from '../db'
import type { Equipment, Project } from '../db'
import { useConfirm } from '../hooks/useConfirm'

interface EquipmentDetailProps {
  equipmentId: string
}

const CATEGORY_LABELS: Record<string, string> = {
  power_tool: 'Power Tool',
  hand_tool: 'Hand Tool',
  heavy_equipment: 'Heavy Equipment',
  safety_gear: 'Safety Gear',
  vehicle: 'Vehicle',
  other: 'Other',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  in_repair: 'In Repair',
  retired: 'Retired',
}

const STATUS_COLORS: Record<string, string> = {
  active: '#388e3c',
  in_repair: '#f57c00',
  retired: '#757575',
}

const EquipmentDetail = ({ equipmentId }: EquipmentDetailProps) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [maintenanceNotes, setMaintenanceNotes] = useState('')
  const [maintenancePerformedBy, setMaintenancePerformedBy] = useState('')
  const [assignProjectId, setAssignProjectId] = useState('')
  const confirm = useConfirm()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      const [equipmentData, projectList] = await Promise.all([
        getEquipment(equipmentId),
        getProjects(),
      ])
      if (mounted) {
        setEquipment(equipmentData || null)
        setProjects(projectList)
        setAssignProjectId(equipmentData?.currentProjectId || '')
        setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [equipmentId])

  const handleDelete = async () => {
    if (!equipment) return
    const confirmed = await confirm({
      title: 'Delete Equipment',
      message: `Are you sure you want to delete "${equipment.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (confirmed) {
      await deleteEquipment(equipment.id)
      navigate('/equipment')
    }
  }

  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipment || !maintenanceNotes.trim()) return

    await logEquipmentMaintenance(equipment.id, {
      notes: maintenanceNotes.trim(),
      performedBy: maintenancePerformedBy.trim() || undefined,
    })

    const updated = await getEquipment(equipmentId)
    setEquipment(updated || null)
    setShowMaintenanceForm(false)
    setMaintenanceNotes('')
    setMaintenancePerformedBy('')
  }

  const handleAssignProject = async () => {
    if (!equipment) return

    if (assignProjectId === equipment.currentProjectId) return

    const project = projects.find(p => p.id === assignProjectId)
    await assignEquipmentToProject(equipment.id, project?.id, project?.name)

    const updated = await getEquipment(equipmentId)
    setEquipment(updated || null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="container">
        <p>Equipment not found.</p>
        <NavLink to="/equipment"><button>Back to Equipment</button></NavLink>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>{equipment.name}</h1>
        <span style={{
          backgroundColor: STATUS_COLORS[equipment.status],
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontWeight: 'bold',
        }}>
          {STATUS_LABELS[equipment.status]}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <NavLink to={`/equipment/edit/${equipment.id}`}>
          <button>Edit</button>
        </NavLink>
        <button onClick={handleDelete} style={{ backgroundColor: '#dc3545', color: '#fff' }}>
          Delete
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Details</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div>
            <strong>Category:</strong> {CATEGORY_LABELS[equipment.category]}
          </div>
          {equipment.description && (
            <div>
              <strong>Description:</strong> {equipment.description}
            </div>
          )}
          {equipment.serialNumber && (
            <div>
              <strong>Serial Number:</strong> {equipment.serialNumber}
            </div>
          )}
          {equipment.modelNumber && (
            <div>
              <strong>Model Number:</strong> {equipment.modelNumber}
            </div>
          )}
          {equipment.purchaseDate && (
            <div>
              <strong>Purchase Date:</strong> {new Date(equipment.purchaseDate).toLocaleDateString()}
            </div>
          )}
          {equipment.purchasePrice && (
            <div>
              <strong>Purchase Price:</strong> {formatCurrency(equipment.purchasePrice)}
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Assignment</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={assignProjectId}
            onChange={(e) => setAssignProjectId(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">In Inventory (No Project)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button onClick={handleAssignProject} disabled={assignProjectId === equipment.currentProjectId}>
            Update
          </button>
        </div>
        {equipment.assignedDate && equipment.currentProjectName && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Assigned on {new Date(equipment.assignedDate).toLocaleDateString()}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Maintenance</h3>
          {equipment.status === 'active' && (
            <button onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}>
              {showMaintenanceForm ? 'Cancel' : 'Log Maintenance'}
            </button>
          )}
        </div>

        {showMaintenanceForm && (
          <form onSubmit={handleLogMaintenance} style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: '4px' }}>
            <label htmlFor="maintenanceNotes">Maintenance Notes *</label>
            <textarea
              id="maintenanceNotes"
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              placeholder="Describe what was done..."
              rows={3}
              required
            />
            <label htmlFor="performedBy">Performed By (Optional)</label>
            <input
              id="performedBy"
              type="text"
              value={maintenancePerformedBy}
              onChange={(e) => setMaintenancePerformedBy(e.target.value)}
              placeholder="Name or initials"
            />
            <button type="submit" style={{ marginTop: '0.5rem' }}>
              Save Maintenance Log
            </button>
          </form>
        )}

        <div style={{ marginTop: '1rem' }}>
          {equipment.maintenanceIntervalDays && (
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>Interval:</strong> Every {equipment.maintenanceIntervalDays} days
            </div>
          )}
          {equipment.lastMaintenanceDate && (
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>Last Maintenance:</strong> {new Date(equipment.lastMaintenanceDate).toLocaleDateString()}
            </div>
          )}
          {equipment.nextMaintenanceDate && equipment.status === 'active' && (
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>Next Maintenance:</strong>{' '}
              <span style={{
                color: new Date(equipment.nextMaintenanceDate) <= new Date() ? '#dc3545' : 'var(--text-secondary)',
              }}>
                {new Date(equipment.nextMaintenanceDate).toLocaleDateString()}
                {new Date(equipment.nextMaintenanceDate) <= new Date() && ' (Overdue)'}
              </span>
            </div>
          )}
          {equipment.maintenanceNotes && (
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>Notes:</strong> {equipment.maintenanceNotes}
            </div>
          )}
        </div>
      </div>

      {equipment.maintenanceHistory && equipment.maintenanceHistory.length > 0 && (
        <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0 }}>Maintenance History</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {equipment.maintenanceHistory.slice().reverse().map((log, index) => (
              <li key={index} style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                backgroundColor: 'var(--bg)',
                borderRadius: '4px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong>{new Date(log.date).toLocaleDateString()}</strong>
                  {log.performedBy && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      by {log.performedBy}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem' }}>{log.notes}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <NavLink to="/equipment"><button>Back to Equipment</button></NavLink>
      </div>
    </div>
  )
}

export default EquipmentDetail
