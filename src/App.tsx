import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './index.css'
import WaiverForm from './components/WaiverForm'
import COIForm from './components/COIForm'
import { getWaivers, getCOIs, deleteCOI } from './db'
import type { Waiver, Certificate } from './db'
import { getCOIStatus, getStatusColor, getStatusLabel } from './utils/coiStatus'

// Placeholder components
const Home = () => (
  <div className="container">
    <h1>SubLink</h1>
    <p>Rugged utility for subcontractors.</p>
    <div style={{ marginTop: '2rem' }}>
      <button onClick={() => window.location.href = '/waivers'}>New Lien Waiver</button>
    </div>
  </div>
)

const Waivers = () => {
  const [waivers, setWaivers] = useState<Waiver[]>([])

  useEffect(() => {
    getWaivers().then(setWaivers)
  }, [])

  return (
    <div className="container">
      <h1>Lien Waivers</h1>
      <NavLink to="/waivers/new">
        <button>Create New Waiver</button>
      </NavLink>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>History</h3>
        {waivers.length === 0 ? (
          <p>No waivers generated yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {waivers.map(w => (
              <li key={w.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '1rem', 
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <strong>{w.projectName}</strong><br/>
                {w.subcontractorName} - ${w.amount}<br/>
                <small>{new Date(w.createdAt).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const Compliance = () => {
  const [cois, setCOIs] = useState<Certificate[]>([])

  useEffect(() => {
    let mounted = true
    getCOIs().then(data => {
      if (mounted) setCOIs(data)
    })
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      await deleteCOI(id)
      const data = await getCOIs()
      setCOIs(data)
    }
  }

  return (
    <div className="container">
      <h1>Compliance Vault</h1>
      <NavLink to="/compliance/new">
        <button>Add Certificate</button>
      </NavLink>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Certificates of Insurance</h3>
        {cois.length === 0 ? (
          <p>No certificates on file.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cois.map(coi => {
              const status = getCOIStatus(coi.expirationDate)
              const statusColor = getStatusColor(status)
              const statusLabel = getStatusLabel(status)
              
              return (
                <li key={coi.id} style={{ 
                  backgroundColor: 'var(--secondary-bg)', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  borderLeft: `4px solid ${statusColor}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <strong>{coi.insuranceCompany}</strong><br/>
                      <small>{coi.policyType}</small>
                    </div>
                    <span style={{ 
                      backgroundColor: statusColor, 
                      color: '#fff', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Policy: {coi.policyNumber}<br/>
                    Expires: {new Date(coi.expirationDate).toLocaleDateString()}<br/>
                    Coverage: ${parseInt(coi.coverageAmount).toLocaleString()}
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <NavLink to={`/compliance/edit/${coi.id}`}>
                      <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Edit</button>
                    </NavLink>
                    <button 
                      onClick={() => handleDelete(coi.id)}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff' }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

const COIEditWrapper = () => {
  const [coi, setCOI] = useState<Certificate | null>(null)
  const id = window.location.pathname.split('/').pop()

  useEffect(() => {
    const loadCOI = async () => {
      if (id) {
        const cois = await getCOIs()
        const found = cois.find(c => c.id === id)
        if (found) setCOI(found)
      }
    }
    loadCOI()
  }, [id])

  if (!coi) return <div className="container"><p>Loading...</p></div>

  return <COIForm editId={id} initialData={coi} />
}

const Tasking = () => (
  <div className="container">
    <h1>Photo-Verified Tasks</h1>
    <p>Proof of work with GPS & timestamps.</p>
  </div>
)

const AppShell = () => (
  <div className="app-shell">
    <div className="content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/waivers" element={<Waivers />} />
        <Route path="/waivers/new" element={<WaiverForm />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/compliance/new" element={<COIForm />} />
        <Route path="/compliance/edit/:id" element={<COIEditWrapper />} />
        <Route path="/tasking" element={<Tasking />} />
      </Routes>
    </div>
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Home</span>
      </NavLink>
      <NavLink to="/waivers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Waivers</span>
      </NavLink>
      <NavLink to="/compliance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Compliance</span>
      </NavLink>
      <NavLink to="/tasking" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Tasks</span>
      </NavLink>
    </nav>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
