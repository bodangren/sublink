import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getAllMileage, deleteMileage, getProjects } from '../db'
import type { MileageEntry, Project } from '../db'
import { useConfirm } from '../hooks/useConfirm'

interface MileageWithProject extends MileageEntry {
  projectName?: string
}

const MileageList = () => {
  const [mileage, setMileage] = useState<MileageWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filterProject, setFilterProject] = useState<string>('')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      const [mileageList, projectList] = await Promise.all([
        getAllMileage(),
        getProjects()
      ])
      const projectMap = new Map(projectList.map(p => [p.id, p.name]))
      const mileageWithProjects = mileageList.map(entry => ({
        ...entry,
        projectName: entry.projectId ? projectMap.get(entry.projectId) : undefined
      }))
      if (mounted) {
        setProjects(projectList)
        setMileage(mileageWithProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const getFilteredMileage = () => {
    return mileage.filter(entry => {
      if (filterProject && entry.projectId !== filterProject) return false
      if (filterStartDate && entry.date < filterStartDate) return false
      if (filterEndDate && entry.date > filterEndDate) return false
      return true
    })
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Mileage Entry',
      message: 'Are you sure you want to delete this mileage entry?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteMileage(id)
      const mileageList = await getAllMileage()
      const projectMap = new Map(projects.map(p => [p.id, p.name]))
      const mileageWithProjects = mileageList.map(entry => ({
        ...entry,
        projectName: entry.projectId ? projectMap.get(entry.projectId) : undefined
      }))
      setMileage(mileageWithProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    }
  }

  const filteredMileage = getFilteredMileage()
  const totalMiles = filteredMileage.reduce((sum, entry) => sum + entry.miles, 0)

  return (
    <div className="container">
      <h1>Mileage</h1>
      <NavLink to="/mileage/new">
        <button>New Mileage</button>
      </NavLink>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="filterProject" style={{ marginRight: '0.5rem' }}>Project:</label>
          <select
            id="filterProject"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filterStartDate" style={{ marginRight: '0.5rem' }}>Start Date:</label>
          <input
            type="date"
            id="filterStartDate"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="filterEndDate" style={{ marginRight: '0.5rem' }}>End Date:</label>
          <input
            type="date"
            id="filterEndDate"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
      </div>

      {filteredMileage.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          <strong>Total: {totalMiles.toFixed(1)} mi</strong>
        </div>
      )}

      {filteredMileage.length === 0 ? (
        <p style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
          No mileage entries found.
        </p>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          {filteredMileage.map(entry => (
            <div key={entry.id} style={{ 
              padding: '1rem', 
              border: '1px solid #ddd', 
              marginBottom: '0.5rem', 
              borderRadius: '4px',
              backgroundColor: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {entry.startLocation} → {entry.endLocation}
                    {entry.isRoundTrip && (
                      <span style={{ 
                        marginLeft: '0.5rem', 
                        fontSize: '0.85rem', 
                        backgroundColor: '#4caf50',
                        color: 'white',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '3px'
                      }}>
                        Round Trip
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#666', marginTop: '0.25rem' }}>
                    {new Date(entry.date).toLocaleDateString()}
                    {entry.projectName && (
                      <span style={{ marginLeft: '0.5rem', color: '#1976d2' }}>
                        • {entry.projectName}
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1976d2' }}>
                    {entry.miles.toFixed(1)} mi
                  </div>
                  {entry.purpose && (
                    <div style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                      {entry.purpose}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <NavLink to={`/mileage/${entry.id}`}>
                    <button style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>View Details</button>
                  </NavLink>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#f44336', color: 'white' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MileageList
