import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './index.css'
import WaiverForm from './components/WaiverForm'
import { getWaivers } from './db'

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
  const [waivers, setWaivers] = useState<any[]>([])

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

const Compliance = () => (
  <div className="container">
    <h1>Compliance Vault</h1>
    <p>Certificates of Insurance and more.</p>
  </div>
)

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
