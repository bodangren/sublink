import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getAllEquipment, deleteEquipment, getProjects, getTotalEquipmentValue } from '../db'
import type { Equipment, Project, EquipmentCategory, EquipmentStatus } from '../db'
import { useConfirm } from '../hooks/useConfirm'

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  power_tool: 'Power Tool',
  hand_tool: 'Hand Tool',
  heavy_equipment: 'Heavy Equipment',
  safety_gear: 'Safety Gear',
  vehicle: 'Vehicle',
  other: 'Other',
}

const CATEGORY_COLORS: Record<EquipmentCategory, string> = {
  power_tool: '#f57c00',
  hand_tool: '#1976d2',
  heavy_equipment: '#7b1fa2',
  safety_gear: '#388e3c',
  vehicle: '#c62828',
  other: '#757575',
}

const STATUS_LABELS: Record<EquipmentStatus, string> = {
  active: 'Active',
  in_repair: 'In Repair',
  retired: 'Retired',
}

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  active: '#388e3c',
  in_repair: '#f57c00',
  retired: '#757575',
}

const EquipmentList = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filterProject, setFilterProject] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [totalValue, setTotalValue] = useState<number>(0)
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      const [equipmentList, projectList, value] = await Promise.all([
        getAllEquipment(),
        getProjects(),
        getTotalEquipmentValue(),
      ])
      if (mounted) {
        setProjects(projectList)
        setEquipment(equipmentList)
        setTotalValue(value)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const getFilteredEquipment = () => {
    return equipment.filter(item => {
      if (filterProject && item.currentProjectId !== filterProject) return false
      if (filterCategory && item.category !== filterCategory) return false
      if (filterStatus && item.status !== filterStatus) return false
      return true
    })
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Equipment',
      message: 'Are you sure you want to delete this equipment? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (confirmed) {
      await deleteEquipment(id)
      const [equipmentList, value] = await Promise.all([
        getAllEquipment(),
        getTotalEquipmentValue(),
      ])
      setEquipment(equipmentList)
      setTotalValue(value)
    }
  }

  const filteredEquipment = getFilteredEquipment()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="container">
      <h1>Equipment</h1>
      <NavLink to="/equipment/new">
        <button>Add Equipment</button>
      </NavLink>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--secondary-bg)', borderRadius: '4px' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Active Equipment Value</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
          {formatCurrency(totalValue)}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="filterCategory" style={{ marginRight: '0.5rem' }}>Category:</label>
          <select
            id="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterStatus" style={{ marginRight: '0.5rem' }}>Status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterProject" style={{ marginRight: '0.5rem' }}>Project:</label>
          <select
            id="filterProject"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="__inventory__">In Inventory</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {filteredEquipment.length === 0 ? (
          <p>No equipment found. Add your tools and equipment to track them across job sites.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredEquipment.map(item => (
              <li key={item.id} style={{
                backgroundColor: 'var(--secondary-bg)',
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                borderLeft: `4px solid ${CATEGORY_COLORS[item.category]}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.125rem' }}>{item.name}</strong>
                    {item.description && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      backgroundColor: STATUS_COLORS[item.status],
                      color: '#fff',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <span style={{
                    backgroundColor: CATEGORY_COLORS[item.category],
                    color: '#fff',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginRight: '0.5rem',
                  }}>
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  {item.currentProjectName && (
                    <span style={{ marginRight: '0.5rem' }}>
                      <strong>At:</strong> {item.currentProjectName}
                    </span>
                  )}
                  {!item.currentProjectId && (
                    <span style={{ color: 'var(--accent-color)' }}>In Inventory</span>
                  )}
                  {item.purchasePrice && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      <strong>Value:</strong> {formatCurrency(item.purchasePrice)}
                    </span>
                  )}
                </div>
                {item.nextMaintenanceDate && item.status === 'active' && (
                  <div style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                    <strong>Next Maintenance:</strong>{' '}
                    <span style={{
                      color: new Date(item.nextMaintenanceDate) <= new Date() ? '#dc3545' : 'var(--text-secondary)',
                    }}>
                      {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                      {new Date(item.nextMaintenanceDate) <= new Date() && ' (Overdue)'}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <NavLink to={`/equipment/${item.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                      View
                    </button>
                  </NavLink>
                  <NavLink to={`/equipment/edit/${item.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Edit</button>
                  </NavLink>
                  <button
                    onClick={() => handleDelete(item.id)}
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

export default EquipmentList
