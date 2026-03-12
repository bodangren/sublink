import { useState, useEffect } from 'react'
import { getEquipment } from '../db'
import type { Equipment } from '../db'
import EquipmentForm from './EquipmentForm'

interface EquipmentEditWrapperProps {
  editId: string
}

const EquipmentEditWrapper = ({ editId }: EquipmentEditWrapperProps) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getEquipment(editId).then(data => {
      if (mounted) {
        setEquipment(data || null)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [editId])

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!equipment) return <div className="container"><p>Equipment not found.</p></div>

  return (
    <EquipmentForm
      editId={editId}
      initialData={{
        name: equipment.name,
        description: equipment.description || '',
        category: equipment.category,
        serialNumber: equipment.serialNumber || '',
        modelNumber: equipment.modelNumber || '',
        purchaseDate: equipment.purchaseDate || '',
        purchasePrice: equipment.purchasePrice?.toString() || '',
        currentProjectId: equipment.currentProjectId || '',
        currentProjectName: equipment.currentProjectName || '',
        maintenanceIntervalDays: equipment.maintenanceIntervalDays?.toString() || '',
        maintenanceNotes: equipment.maintenanceNotes || '',
        status: equipment.status,
      }}
    />
  )
}

export default EquipmentEditWrapper
