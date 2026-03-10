import { useState, useEffect } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { getClient, deleteClient, getProjectsByClient, getInvoicesByClient, getEstimatesByClient } from '../db'
import type { Client, Project, Invoice, Estimate } from '../db'
import { useConfirm } from '../hooks/useConfirm'

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    
    let mounted = true
    Promise.all([
      getClient(id),
      getProjectsByClient(id),
      getInvoicesByClient(id),
      getEstimatesByClient(id)
    ]).then(([clientData, projectList, invoiceList, estimateList]) => {
      if (mounted) {
        setClient(clientData || null)
        setProjects(projectList.sort((a, b) => b.updatedAt - a.updatedAt))
        setInvoices(invoiceList.sort((a, b) => b.createdAt - a.createdAt))
        setEstimates(estimateList.sort((a, b) => b.createdAt - a.createdAt))
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [id])

  const handleDelete = async () => {
    if (!client) return
    const confirmed = await confirm({
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client? This will not delete related projects, invoices, or estimates.',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteClient(client.id)
      navigate('/clients')
    }
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (!client) {
    return <div className="container"><p>Client not found.</p></div>
  }

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <NavLink to="/clients">&larr; Back to Clients</NavLink>
      </div>

      <div style={{ 
        backgroundColor: 'var(--secondary-bg)', 
        padding: '1.5rem', 
        borderRadius: '4px',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{ margin: 0, marginBottom: '1rem' }}>{client.name}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {client.contactPerson && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contact Person</div>
              <div style={{ fontWeight: 'bold' }}>{client.contactPerson}</div>
            </div>
          )}
          {client.email && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email</div>
              <div style={{ fontWeight: 'bold' }}>{client.email}</div>
            </div>
          )}
          {client.phone && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone</div>
              <div style={{ fontWeight: 'bold' }}>{client.phone}</div>
            </div>
          )}
        </div>

        {(client.address || client.city || client.state || client.zip) && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Address</div>
            <div style={{ fontWeight: 'bold' }}>
              {client.address && <div>{client.address}</div>}
              <div>{[client.city, client.state, client.zip].filter(Boolean).join(', ')}</div>
            </div>
          </div>
        )}

        {client.notes && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notes</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{client.notes}</div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <NavLink to={`/projects/new?clientId=${client.id}`}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>+ Project</button>
          </NavLink>
          <NavLink to={`/invoices/new?clientId=${client.id}`}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>+ Invoice</button>
          </NavLink>
          <NavLink to={`/estimates/new?clientId=${client.id}`}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>+ Estimate</button>
          </NavLink>
          <NavLink to={`/clients/edit/${client.id}`}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff' }}>Edit</button>
          </NavLink>
          <button 
            onClick={handleDelete}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff' }}
          >
            Delete
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{projects.length}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Projects</div>
        </div>
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{invoices.length}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Invoices</div>
        </div>
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>${totalInvoiced.toFixed(0)}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Invoiced</div>
        </div>
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>${totalPaid.toFixed(0)}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Paid</div>
        </div>
      </div>

      {estimates.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Estimates</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {estimates.map(estimate => (
              <li key={estimate.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '0.75rem', 
                marginBottom: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <NavLink to={`/estimates/${estimate.id}`} style={{ fontWeight: 'bold' }}>
                    {estimate.estimateNumber}
                  </NavLink>
                  {estimate.projectName && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {estimate.projectName}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(estimate.issueDate).toLocaleDateString()} - Status: {estimate.status}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>${estimate.total.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {invoices.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Invoices</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {invoices.map(invoice => (
              <li key={invoice.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '0.75rem', 
                marginBottom: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <NavLink to={`/invoices/${invoice.id}`} style={{ fontWeight: 'bold' }}>
                    {invoice.invoiceNumber}
                  </NavLink>
                  {invoice.projectName && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {invoice.projectName}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(invoice.issueDate).toLocaleDateString()} - Status: {invoice.status}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>${invoice.total.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Projects</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {projects.map(project => (
              <li key={project.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '0.75rem', 
                marginBottom: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <NavLink to={`/projects/${project.id}`} style={{ fontWeight: 'bold' }}>
                  {project.name}
                </NavLink>
                {project.address && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {project.address}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {projects.length === 0 && invoices.length === 0 && estimates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>No activity yet for this client.</p>
          <p>Use the buttons above to add projects, invoices, or estimates.</p>
        </div>
      )}
    </div>
  )
}

export default ClientDetail
