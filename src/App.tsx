import { BrowserRouter, HashRouter, Routes, Route, NavLink } from 'react-router-dom'
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
import RecentInvoices from './components/RecentInvoices'
import ProjectList from './components/ProjectList'
import ProjectForm from './components/ProjectForm'
import ProjectDetail from './components/ProjectDetail'
import TimeEntryList from './components/TimeEntryList'
import TimeEntryForm from './components/TimeEntryForm'
import TimeSummary from './components/TimeSummary'
import ActiveTimer from './components/ActiveTimer'
import InvoiceList from './components/InvoiceList'
import InvoiceForm from './components/InvoiceForm'
import InvoiceDetail from './components/InvoiceDetail'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseDetail from './components/ExpenseDetail'
import RecentExpenses from './components/RecentExpenses'
import EstimateForm from './components/EstimateForm'
import EstimateList from './components/EstimateList'
import EstimateDetail from './components/EstimateDetail'
import RecentEstimates from './components/RecentEstimates'
import RecentPayments from './components/RecentPayments'
import RecentMileage from './components/RecentMileage'
import MileageList from './components/MileageList'
import MileageForm from './components/MileageForm'
import MileageDetail from './components/MileageDetail'
import MileageSummary from './components/MileageSummary'
import ClientList from './components/ClientList'
import ClientForm from './components/ClientForm'
import ClientDetail from './components/ClientDetail'
import Settings from './components/Settings'
import { getWaivers, getCOIs, deleteCOI, getTasks, getDailyLog, getProjects, getTimeEntry, getInvoice, getExpense, getEstimates, getAllMileage } from './db'
import type { Waiver, Certificate, Task, DailyLog, Project, TimeEntry, Invoice, Expense, Estimate, MileageEntry, Client } from './db'
import { getCOIStatus, getStatusColor, getStatusLabel } from './utils/coiStatus'
import { useItemId, useTaskIdFromPath, useEditItem, formatCurrency } from './hooks/useEditWrapper'
import { ConfirmProvider, useConfirm } from './hooks/useConfirm'

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
      <RecentExpenses />
      <RecentMileage />
      <RecentEstimates />
      <RecentPayments />
      <RecentInvoices />
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
        <NavLink to="/expenses/new">
          <button style={{ marginTop: '0.5rem' }}>New Expense</button>
        </NavLink>
        <NavLink to="/compliance/new">
          <button style={{ marginTop: '0.5rem' }}>Add Certificate</button>
        </NavLink>
        <NavLink to="/mileage/new">
          <button style={{ marginTop: '0.5rem' }}>Log Mileage</button>
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
  const confirm = useConfirm()

  useEffect(() => {
    let mounted = true
    getCOIs().then(data => {
      if (mounted) setCOIs(data)
    })
    return () => { mounted = false }
  }, [])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Certificate',
      message: 'Are you sure you want to delete this certificate?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
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
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    if (id && id.trim() !== '') {
      getDailyLog(id).then(data => {
        if (mounted) {
          setLog(data || null)
          setLoading(false)
        }
      })
    } else {
      setLoading(false)
    }
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!log) {
    return (
      <div className="container">
        <p>Daily log not found.</p>
        <NavLink to="/logs"><button>Back to Logs</button></NavLink>
      </div>
    )
  }

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

  if (!id || id.trim() === '') {
    return (
      <div className="container">
        <p>Daily log not found.</p>
        <NavLink to="/logs"><button>Back to Logs</button></NavLink>
      </div>
    )
  }

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
    clientId: project.clientId || '',
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

const InvoiceEditWrapper = () => {
  const id = useItemId() || ''
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getInvoice(id).then(data => {
      if (mounted) {
        setInvoice(data || null)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!invoice) return <div className="container"><p>Invoice not found.</p></div>

  return <InvoiceForm editId={id} initialData={{
    projectId: invoice.projectId,
    projectName: invoice.projectName,
    clientId: invoice.clientId,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientAddress: invoice.clientAddress,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    lineItems: invoice.lineItems,
    subtotal: invoice.subtotal,
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount,
    total: invoice.total,
    notes: invoice.notes,
    status: invoice.status,
  }} />
}

const ExpenseDetailWrapper = () => {
  const id = useItemId() || ''
  return <ExpenseDetail expenseId={id} />
}

const ExpenseEditWrapper = () => {
  const id = useItemId() || ''
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getExpense(id).then(data => {
      if (mounted) {
        setExpense(data || null)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!expense) return <div className="container"><p>Expense not found.</p></div>

  return <ExpenseForm editId={id} initialData={{
    projectId: expense.projectId || '',
    taskId: expense.taskId || '',
    description: expense.description,
    category: expense.category,
    amount: expense.amount.toString(),
    vendor: expense.vendor || '',
    date: expense.date,
    billable: expense.billable,
    notes: expense.notes || ''
  }} />
}

const EstimateDetailWrapper = () => {
  const id = useItemId() || ''
  return <EstimateDetail estimateId={id} />
}

const EstimateEditWrapper = () => {
  const id = useItemId() || ''
  const { item: estimate, loading } = useEditItem<Estimate>(id, getEstimates, (e: Estimate, id: string) => e.id === id)

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!estimate) return <div className="container"><p>Estimate not found.</p></div>

  return <EstimateForm editId={id} initialData={{ 
    projectId: estimate.projectId || '',
    projectName: estimate.projectName || '',
    clientId: estimate.clientId || '',
    clientName: estimate.clientName,
    clientEmail: estimate.clientEmail || '',
    clientAddress: estimate.clientAddress || '',
    issueDate: estimate.issueDate,
    validUntilDate: estimate.validUntilDate,
    lineItems: estimate.lineItems,
    subtotal: estimate.subtotal,
    taxRate: estimate.taxRate,
    taxAmount: estimate.taxAmount,
    total: estimate.total,
    notes: estimate.notes || '',
    status: estimate.status,
  }} />
}

const MileageEditWrapper = () => {
  const id = useItemId() || ''
  const { item: mileage, loading } = useEditItem<MileageEntry>(id, getAllMileage, (m: MileageEntry, id: string) => m.id === id)

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!mileage) return <div className="container"><p>Mileage entry not found.</p></div>

  return <MileageForm editId={id} initialData={{ 
    projectId: mileage.projectId || '',
    projectName: mileage.projectName || '',
    date: mileage.date,
    startLocation: mileage.startLocation,
    endLocation: mileage.endLocation,
    startCoords: mileage.startCoords,
    endCoords: mileage.endCoords,
    miles: mileage.miles.toString(),
    purpose: mileage.purpose || '',
    notes: mileage.notes || '',
    isRoundTrip: mileage.isRoundTrip,
  }} />
}

const ClientEditWrapper = () => {
  const id = useItemId() || ''
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    import('./db').then(({ getClient }) => {
      getClient(id).then(data => {
        if (mounted) {
          setClient(data || null)
          setLoading(false)
        }
      })
    })
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!client) return <div className="container"><p>Client not found.</p></div>

  return <ClientForm editId={id} />
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
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/new" element={<InvoiceForm />} />
        <Route path="/invoices/edit/:id" element={<InvoiceEditWrapper />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/expenses/new" element={<ExpenseForm />} />
        <Route path="/expenses/edit/:id" element={<ExpenseEditWrapper />} />
        <Route path="/expenses/:id" element={<ExpenseDetailWrapper />} />
        <Route path="/estimates" element={<EstimateList />} />
        <Route path="/estimates/new" element={<EstimateForm />} />
        <Route path="/estimates/edit/:id" element={<EstimateEditWrapper />} />
        <Route path="/estimates/:id" element={<EstimateDetailWrapper />} />
        <Route path="/mileage" element={<MileageList />} />
        <Route path="/mileage/new" element={<MileageForm />} />
        <Route path="/mileage/edit/:id" element={<MileageEditWrapper />} />
        <Route path="/mileage/:id" element={<MileageDetail />} />
        <Route path="/mileage/summary" element={<MileageSummary />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/edit/:id" element={<ClientEditWrapper />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/settings" element={<Settings />} />
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
      <NavLink to="/projects" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Projects</span>
      </NavLink>
      <NavLink to="/clients" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Clients</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span>Settings</span>
      </NavLink>
    </nav>
  </div>
)

function App() {
  if (import.meta.env.VITE_ROUTER_MODE === 'hash') {
    return (
      <HashRouter>
        <ConfirmProvider>
          <AppShell />
        </ConfirmProvider>
      </HashRouter>
    )
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ConfirmProvider>
        <AppShell />
      </ConfirmProvider>
    </BrowserRouter>
  )
}

export default App
