import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './index.css'
import WaiverForm from './components/WaiverForm'
import COIForm from './components/COIForm'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskDetail from './components/TaskDetail'
import { getWaivers, getCOIs, deleteCOI, getTasks } from './db'
import type { Waiver, Certificate, Task } from './db'
import { getCOIStatus, getStatusColor, getStatusLabel } from './utils/coiStatus'
import { useItemId, useTaskIdFromPath, useEditItem, formatCurrency } from './hooks/useEditWrapper'

const Home = () => {
  const [taskCount, setTaskCount] = useState(0)

  useEffect(() => {
    let mounted = true
    getTasks().then(tasks => {
      if (mounted) setTaskCount(tasks.length)
    })
    return () => { mounted = false }
  }, [])

  return (
    <div className="container">
      <h1>SubLink</h1>
      <p>Rugged utility for subcontractors.</p>
      <div style={{ marginTop: '2rem' }}>
        <NavLink to="/tasking/new">
          <button>Quick Task + Photo</button>
        </NavLink>
        <NavLink to="/waivers/new">
          <button style={{ marginTop: '0.5rem' }}>New Lien Waiver</button>
        </NavLink>
        <NavLink to="/compliance/new">
          <button style={{ marginTop: '0.5rem' }}>Add Certificate</button>
        </NavLink>
      </div>
      {taskCount > 0 && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--secondary-bg)', borderRadius: '4px' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            You have <strong style={{ color: 'var(--accent-color)' }}>{taskCount}</strong> active task{taskCount !== 1 ? 's' : ''}
          </p>
          <NavLink to="/tasking" style={{ display: 'inline-block', marginTop: '0.5rem' }}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View Tasks</button>
          </NavLink>
        </div>
      )}
    </div>
  )
}

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
                    Coverage: ${formatCurrency(coi.coverageAmount)}
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
  const id = useItemId() || ''
  const { item: coi, loading } = useEditItem<Certificate>(id, getCOIs, (c: Certificate, id: string) => c.id === id)

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!coi) return <div className="container"><p>Certificate not found.</p></div>

  return <COIForm editId={id} initialData={coi} />
}

const Tasking = () => <TaskList />

const TaskEditWrapper = () => {
  const id = useItemId() || ''
  const { item: task, loading } = useEditItem<Task>(id, getTasks, (t: Task, id: string) => t.id === id)

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!task) return <div className="container"><p>Task not found.</p></div>

  return <TaskForm editId={id} initialData={{ 
    title: task.title, 
    description: task.description, 
    contractReference: task.contractReference || '' 
  }} />
}

const TaskDetailWrapper = () => {
  const id = useTaskIdFromPath()

  if (!id) return <div className="container"><p>Task not found.</p></div>

  return <TaskDetail taskId={id} />
}

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
        <Route path="/tasking/new" element={<TaskForm />} />
        <Route path="/tasking/edit/:id" element={<TaskEditWrapper />} />
        <Route path="/tasking/:id" element={<TaskDetailWrapper />} />
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
