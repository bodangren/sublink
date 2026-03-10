import { useState, useEffect } from 'react'
import { getClients } from '../db'
import type { Client } from '../db'

interface ClientSelectProps {
  value?: string
  onChange: (clientId: string | undefined, client: Client | undefined) => void
  placeholder?: string
  required?: boolean
  label?: string
  id?: string
}

const ClientSelect = ({ value, onChange, placeholder = 'Select a client...', required, label, id = 'client' }: ClientSelectProps) => {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  useEffect(() => {
    getClients().then(data => {
      setClients(data.sort((a, b) => a.name.localeCompare(b.name)))
    })
  }, [])

  useEffect(() => {
    if (value) {
      const client = clients.find(c => c.id === value)
      setSelectedClient(client || null)
    } else {
      setSelectedClient(null)
    }
  }, [value, clients])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (client: Client) => {
    setSelectedClient(client)
    onChange(client.id, client)
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleClear = () => {
    setSelectedClient(null)
    onChange(undefined, undefined)
    setSearchQuery('')
  }

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <label htmlFor={id} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          {label}{required && ' *'}
        </label>
      )}
      
      {selectedClient ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.75rem',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          backgroundColor: 'var(--secondary-bg)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>{selectedClient.name}</div>
            {selectedClient.email && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedClient.email}</div>
            )}
          </div>
          <button 
            type="button"
            onClick={handleClear}
            style={{ 
              padding: '0.25rem 0.5rem', 
              fontSize: '0.875rem',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            id={id}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={placeholder}
            required={required && !selectedClient}
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
          
          {showDropdown && filteredClients.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              listStyle: 'none',
              padding: 0,
              margin: 0,
              maxHeight: '200px',
              overflowY: 'auto',
              backgroundColor: 'var(--secondary-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {filteredClients.map(client => (
                <li
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-color)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'inherit'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{client.name}</div>
                  {client.email && (
                    <div style={{ fontSize: '0.875rem' }}>{client.email}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
          
          {showDropdown && searchQuery && filteredClients.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              padding: '0.75rem',
              backgroundColor: 'var(--secondary-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px'
            }}>
              No clients found. Create a new client first.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClientSelect
