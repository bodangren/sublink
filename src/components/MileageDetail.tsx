import { useState, useEffect } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { getMileage, deleteMileage } from '../db'
import type { MileageEntry } from '../db'
import { useConfirm } from '../hooks/useConfirm'

const MileageDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mileage, setMileage] = useState<MileageEntry | null>(null)
  const confirm = useConfirm()

  useEffect(() => {
    if (id) {
      getMileage(id).then(m => m ? setMileage(m) : null)
    }
  }, [id])

  const handleDelete = async () => {
    if (!id) return
    
    const confirmed = await confirm({
      title: 'Delete Mileage Entry',
      message: 'Are you sure you want to delete this mileage entry?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    
    if (confirmed) {
      await deleteMileage(id)
      navigate('/mileage')
    }
  }

  if (!mileage) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container">
      <h1>Mileage Entry Details</h1>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Route:</strong> {mileage.startLocation} → {mileage.endLocation}
          {mileage.isRoundTrip && (
            <span style={{ 
              marginLeft: '0.5rem', 
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '0.2rem 0.5rem',
              borderRadius: '3px',
              fontSize: '0.85rem'
            }}>
              Round Trip
            </span>
          )}
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Date:</strong> {new Date(mileage.date).toLocaleDateString()}
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Distance:</strong> {mileage.miles.toFixed(1)} miles
        </div>
        
        {mileage.projectName && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Project:</strong> 
            <NavLink to={`/projects/${mileage.projectId}`} style={{ marginLeft: '0.5rem' }}>
              {mileage.projectName}
            </NavLink>
          </div>
        )}
        
        {mileage.purpose && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Purpose:</strong> {mileage.purpose}
          </div>
        )}
        
        {mileage.notes && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Notes:</strong> {mileage.notes}
          </div>
        )}
        
        {mileage.startCoords && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Start Coordinates:</strong> {mileage.startCoords.lat.toFixed(6)}, {mileage.startCoords.lng.toFixed(6)}
          </div>
        )}
        
        {mileage.endCoords && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>End Coordinates:</strong> {mileage.endCoords.lat.toFixed(6)}, {mileage.endCoords.lng.toFixed(6)}
          </div>
        )}
        
        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
          <div>Created: {new Date(mileage.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(mileage.updatedAt).toLocaleString()}</div>
        </div>
      </div>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <NavLink to={`/mileage/${id}/edit`}>
          <button className="button-primary">Edit</button>
        </NavLink>
        <button onClick={handleDelete} style={{ backgroundColor: '#f44336', color: 'white' }}>
          Delete
        </button>
        <NavLink to="/mileage">
          <button className="button-secondary">Back to List</button>
        </NavLink>
      </div>
    </div>
  )
}

export default MileageDetail
