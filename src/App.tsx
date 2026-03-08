import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './index.css'
import WaiverForm from './components/WaiverForm'
import COIForm from './components/COIForm'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskDetail from './components/TaskDetail'
import DailyLogForm from './components/DailyLogForm'
import DailyLogList from './components/DailyLogList'
import DailyLogDetail from './components/DailyLogDetail'
import TodayLogStatus from './components/TodayLogStatus'
import DashboardStats from './components/DashboardStats'
import ExpiringCOIs from './components/ExpiringCOIs'
import RecentTasks from './components/RecentTasks'
import RecentWaivers from './components/RecentWaivers'
import ProjectList from './components/ProjectList'
import ProjectForm from './components/ProjectForm'
import ProjectDetail from './components/ProjectDetail'
import TimeEntryList from './components/TimeEntryList'
import TimeEntryForm from './components/TimeEntryForm'
import TimeSummary from './components/TimeSummary'
import ActiveTimer from './components/ActiveTimer'
import { getWaivers, getCOIs, deleteCOI, getTasks, getDailyLogs, getProjects, getTimeEntry } from './db'
import type { Waiver, Certificate, Task, DailyLog, Project, TimeEntry } from './db'
import { getCOIStatus, getStatusColor, getStatusLabel } from './utils/coiStatus'
import { useItemId, useTaskIdFromPath, useEditItem, formatCurrency } from './hooks/useEditWrapper'

const Home = () => {
  return (
    <div className="container">
      <h1>SubLink</h1>
      <p>Rugged utility for subcontractors.</p>
      <ActiveTimer compact />
      <DashboardStats />
      <TimeSummary />
      <TodayLogStatus />
      <ExpiringCOIs />
      <RecentTasks />
      <RecentWaivers />
      <div style={{ marginTop: '2rem' }}>
        <NavLink to="/logs/new">
          <button>New Daily Log</button>
        </NavLink>
        <NavLink to="/tasking/new">
          <button style={{ marginTop: '0.5rem' }}>Quick Task + Photo</button>
        </NavLink>
        <NavLink to="/waivers/new">
          <button style={{ marginTop: '0.5rem' }}>New Lien Waiver</button>
        </NavLink>
        <NavLink to="/compliance/new">
          <button style={{ marginTop: '0.5rem' }}>Add Certificate</button>
        </NavLink>
      </div>
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
    contractReference: task.contractReference || '',
    projectId: task.projectId || ''
  }} />
}

const TaskDetailWrapper = () => {
  const id = useTaskIdFromPath()

  if (!id) return <div className="container"><p>Task not found.</p></div>

  return <TaskDetail taskId={id} />
}

const Logs = () => <DailyLogList />

const DailyLogEditWrapper = () => {
  const id = useItemId() || ''
  const { item: log, loading } = useEditItem<DailyLog>(id, getDailyLogs, (l: DailyLog, id: string) => l.id === id)

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!log) return <div className="container"><p>Daily log not found.</p></div>

  return <DailyLogForm editId={id} initialData={{ 
    date: log.date, 
    project: log.project, 
    projectId: log.projectId || '',
    weather: log.weather, 
    workPerformed: log.workPerformed, 
    delays: log.delays || '', 
    personnel: log.personnel, 
    equipment: log.equipment || '', 
    notes: log.notes || '' 
  }} />
}

const DailyLogDetailWrapper = () => {
  const id = useItemId() || ''

  if (!id) return <div className="container"><p>Daily log not found.</p></div>

  return <DailyLogDetail logId={id} />
}

const ProjectEditWrapper = () => {
  const id = useItemId() || ''
  const { item: project, loading } = useEditItem<Project>(id, getProjects, (p: Project, id: string) => p.id === id)

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!project) return <div className="container"><p>Project not found.</p></div>

  return <ProjectForm editId={id} initialData={{ 
    name: project.name, 
    client: project.client || '', 
    address: project.address || '', 
    contractValue: project.contractValue || '', 
    startDate: project.startDate || '', 
    endDate: project.endDate || '', 
    notes: project.notes || '' 
  }} />
}

const Time = () => <TimeEntryList />

const TimeEntryEditWrapper = () => {
  const id = useItemId() || ''
  const [entry, setEntry] = useState<TimeEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getTimeEntry(id).then(data => {
      if (mounted) {
        setEntry(data || null)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!entry) return <div className="container"><p>Time entry not found.</p></div>

  const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp).toISOString().slice(0, 16)
  }

  return <TimeEntryForm editId={id} initialData={{ 
    projectId: entry.projectId, 
    taskId: entry.taskId || '', 
    startTime: formatDateTime(entry.startTime), 
    endTime: formatDateTime(entry.endTime), 
    notes: entry.notes || '' 
  }} />
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
        <Route path="/logs" element={<Logs />} />
        <Route path="/logs/new" element={<DailyLogForm />} />
        <Route path="/logs/edit/:id" element={<DailyLogEditWrapper />} />
        <Route path="/logs/:id" element={<DailyLogDetailWrapper />} />
        <Route path="/tasking" element={<Tasking />} />
        <Route path="/tasking/new" element={<TaskForm />} />
        <Route path="/tasking/edit/:id" element={<TaskEditWrapper />} />
        <Route path="/tasking/:id" element={<TaskDetailWrapper />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/edit/:id" element={<ProjectEditWrapper />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/time" element={<Time />} />
        <Route path="/time/new" element={<TimeEntryForm />} />
        <Route path="/time/edit/:id" element={<TimeEntryEditWrapper />} />
      </Routes>
    </div>
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Home</span>
      </NavLink>
      <NavLink to="/time" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Time</span>
      </NavLink>
      <NavLink to="/logs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Logs</span>
      </NavLink>
      <NavLink to="/tasking" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Tasks</span>
      </NavLink>
      <NavLink to="/projects" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Projects</span>
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
