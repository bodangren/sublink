import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveCOI, updateCOI } from '../db'

interface COIData {
  insuranceCompany: string
  policyNumber: string
  policyType: string
  effectiveDate: string
  expirationDate: string
  coverageAmount: string
  notes?: string
}

interface COIFormProps {
  editId?: string
  initialData?: COIData
}

const COIForm = ({ editId, initialData }: COIFormProps) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<COIData>(initialData || {
    insuranceCompany: '',
    policyNumber: '',
    policyType: 'General Liability',
    effectiveDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    coverageAmount: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editId) {
        await updateCOI(editId, formData)
      } else {
        await saveCOI(formData)
      }
      navigate('/compliance')
    } catch (error) {
      alert('Failed to save certificate. Please try again.')
      console.error(error)
    }
  }

  return (
    <div className="container">
      <h2>{editId ? 'Edit Certificate' : 'Add New Certificate'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="insuranceCompany">Insurance Company</label>
        <input 
          id="insuranceCompany"
          type="text" 
          name="insuranceCompany" 
          value={formData.insuranceCompany} 
          onChange={handleChange} 
          placeholder="e.g. State Farm"
          required
        />

        <label htmlFor="policyNumber">Policy Number</label>
        <input 
          id="policyNumber"
          type="text" 
          name="policyNumber" 
          value={formData.policyNumber} 
          onChange={handleChange} 
          placeholder="e.g. GL-12345-67890"
          required
        />

        <label htmlFor="policyType">Policy Type</label>
        <select 
          id="policyType"
          name="policyType" 
          value={formData.policyType} 
          onChange={handleChange}
          required
        >
          <option value="General Liability">General Liability</option>
          <option value="Workers Compensation">Workers Compensation</option>
          <option value="Commercial Auto">Commercial Auto</option>
          <option value="Umbrella">Umbrella</option>
          <option value="Professional Liability">Professional Liability</option>
        </select>

        <label htmlFor="effectiveDate">Effective Date</label>
        <input 
          id="effectiveDate"
          type="date" 
          name="effectiveDate" 
          value={formData.effectiveDate} 
          onChange={handleChange} 
          required
        />

        <label htmlFor="expirationDate">Expiration Date</label>
        <input 
          id="expirationDate"
          type="date" 
          name="expirationDate" 
          value={formData.expirationDate} 
          onChange={handleChange} 
          required
        />

        <label htmlFor="coverageAmount">Coverage Amount ($)</label>
        <input 
          id="coverageAmount"
          type="number" 
          name="coverageAmount" 
          value={formData.coverageAmount} 
          onChange={handleChange} 
          placeholder="1000000"
          required
        />

        <label htmlFor="notes">Notes (Optional)</label>
        <textarea 
          id="notes"
          name="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          placeholder="Additional details..."
          rows={3}
        />

        <button type="submit">
          {editId ? 'Update Certificate' : 'Save Certificate'}
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/compliance')}
          style={{ backgroundColor: '#444', color: '#fff', marginLeft: '0.5rem' }}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

export default COIForm
