import { useState, useEffect, useMemo } from 'react'
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

  useEffect(() => {
    getClients().then(data => {
      setClients(data.sort((a, b) => a.name.localeCompare(b.name)))
    })
  }, [])

  const selectedClient = useMemo(() => {
    if (value) {
      return clients.find(c => c.id === value) || null
    }
    return null
  }, [value, clients])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (client: Client) => {
    onChange(client.id, client)
    setSearchQuery('')
    setShowDropdown(false)
  }

  const handleClear = () => {
    onChange(undefined, undefined)
    setSearchQuery('')
  }

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="mb-2 font-bold">
          {label}{required && ' *'}
        </label>
      )}
      
      {selectedClient ? (
        <div className="selected-item">
          <div className="selected-item-info">
            <div className="selected-item-name">{selectedClient.name}</div>
            {selectedClient.email && (
              <div className="selected-item-detail">{selectedClient.email}</div>
            )}
          </div>
          <button 
            type="button"
            onClick={handleClear}
            className="btn-clear"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="relative">
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
          />
          
          {showDropdown && filteredClients.length > 0 && (
            <ul className="dropdown">
              {filteredClients.map(client => (
                <li
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className="dropdown-item"
                >
                  <div className="font-bold">{client.name}</div>
                  {client.email && (
                    <div className="text-sm">{client.email}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
          
          {showDropdown && searchQuery && filteredClients.length === 0 && (
            <div className="dropdown p-3">
              No clients found. Create a new client first.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClientSelect
