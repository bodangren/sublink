import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveClient, getClient, updateClient } from '../db'

interface ClientFormProps {
  editId?: string
}

const ClientForm = ({ editId }: ClientFormProps) => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  })

  useEffect(() => {
    if (editId) {
      getClient(editId).then(client => {
        if (client) {
          setFormData({
            name: client.name,
            contactPerson: client.contactPerson || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            city: client.city || '',
            state: client.state || '',
            zip: client.zip || '',
            notes: client.notes || ''
          })
        }
      })
    }
  }, [editId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Client name is required')
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        zip: formData.zip.trim() || undefined,
        notes: formData.notes.trim() || undefined
      }

      if (editId) {
        await updateClient(editId, dataToSave)
      } else {
        await saveClient(dataToSave)
      }
      navigate('/clients')
    } catch (error) {
      console.error('Failed to save client:', error)
      alert('Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container">
      <h1>{editId ? 'Edit Client' : 'New Client'}</h1>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Client Name / Company *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., ABC Construction, John Smith"
            required
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="contactPerson" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Contact Person
          </label>
          <input
            type="text"
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            placeholder="e.g., Jane Doe"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g., contact@abc.com"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g., (555) 123-4567"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Street Address
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g., 123 Main St"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., Anytown"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              State
            </label>
            <input
              type="text"
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g., CA"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="zip" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              ZIP
            </label>
            <input
              type="text"
              id="zip"
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              placeholder="e.g., 12345"
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
            placeholder="Any additional notes about this client..."
            rows={4}
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={saving} style={{ flex: 1 }}>
            {saving ? 'Saving...' : (editId ? 'Update Client' : 'Create Client')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/clients')} 
            style={{ flex: 1, backgroundColor: '#6c757d', color: '#fff' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClientForm
