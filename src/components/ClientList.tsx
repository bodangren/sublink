import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getClients, deleteClient } from '../db'
import type { Client } from '../db'
import { useConfirm } from '../hooks/useConfirm'

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    getClients().then(data => {
      if (mounted) setClients(data.sort((a, b) => a.name.localeCompare(b.name)))
    })
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client? This will not delete related projects, invoices, or estimates.',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteClient(id)
      const data = await getClients()
      setClients(data.sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container">
      <h1>Clients</h1>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
        <NavLink to="/clients/new">
          <button>New Client</button>
        </NavLink>
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}
        />
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        {filteredClients.length === 0 ? (
          <p>{searchQuery ? 'No clients match your search.' : 'No clients yet. Create your first client to organize your contacts.'}</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredClients.map(client => (
              <li key={client.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '1rem', 
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{client.name}</strong>
                    {client.contactPerson && <div><small>{client.contactPerson}</small></div>}
                  </div>
                </div>
                {(client.email || client.phone) && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {client.email && <span style={{ marginRight: '1rem' }}>{client.email}</span>}
                    {client.phone && <span>{client.phone}</span>}
                  </div>
                )}
                {(client.city || client.state) && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {[client.city, client.state, client.zip].filter(Boolean).join(', ')}
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <NavLink to={`/clients/${client.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View</button>
                  </NavLink>
                  <NavLink to={`/clients/edit/${client.id}`}>
                    <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Edit</button>
                  </NavLink>
                  <button 
                    onClick={() => handleDelete(client.id)}
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

export default ClientList
