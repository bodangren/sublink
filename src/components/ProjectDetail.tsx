import { useState, useEffect } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { getProject, getTasksByProject, getDailyLogsByProject, getWaiversByProject, deleteProject, getExpensesByProject, getTimeEntriesByProject, getSetting, DEFAULT_HOURLY_RATE } from '../db'
import type { Project, Task, DailyLog, Waiver, Expense, TimeEntry } from '../db'
import { formatCurrency } from '../hooks/useEditWrapper'
import { useConfirm } from '../hooks/useConfirm'
import { calculateProjectProfitability, formatHours, formatCurrency as formatProfitCurrency, formatPercent } from '../utils/profitability'

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [waivers, setWaivers] = useState<Waiver[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [hourlyRate, setHourlyRate] = useState<number>(parseFloat(DEFAULT_HOURLY_RATE))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    
    let mounted = true
    Promise.all([
      getProject(id),
      getTasksByProject(id),
      getDailyLogsByProject(id),
      getWaiversByProject(id),
      getExpensesByProject(id),
      getTimeEntriesByProject(id),
      getSetting('hourlyRate', DEFAULT_HOURLY_RATE)
    ]).then(([proj, taskList, logList, waiverList, expenseList, timeList, rate]) => {
      if (mounted) {
        setProject(proj || null)
        setTasks(taskList.sort((a, b) => b.updatedAt - a.updatedAt))
        setLogs(logList.sort((a, b) => b.date.localeCompare(a.date)))
        setWaivers(waiverList.sort((a, b) => b.createdAt - a.createdAt))
        setExpenses(expenseList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        setTimeEntries(timeList.sort((a, b) => b.startTime - a.startTime))
        setHourlyRate(parseFloat(rate) || parseFloat(DEFAULT_HOURLY_RATE))
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [id])

  const handleDelete = async () => {
    if (!project) return
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? Related items will keep their project name.',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (confirmed) {
      await deleteProject(project.id)
      navigate('/projects')
    }
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (!project) {
    return <div className="container"><p>Project not found.</p></div>
  }

  const getProjectStatus = () => {
    if (!project.startDate && !project.endDate) return 'active'
    const today = new Date().toISOString().split('T')[0]
    if (project.endDate && project.endDate < today) return 'completed'
    if (project.startDate && project.startDate > today) return 'upcoming'
    return 'active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745'
      case 'completed': return '#6c757d'
      case 'upcoming': return '#ffc107'
      default: return '#6c757d'
    }
  }

  const status = getProjectStatus()
  const statusColor = getStatusColor(status)

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <NavLink to="/projects">&larr; Back to Projects</NavLink>
      </div>

      <div style={{ 
        backgroundColor: 'var(--secondary-bg)', 
        padding: '1.5rem', 
        borderRadius: '4px',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0 }}>{project.name}</h1>
          <span style={{ 
            backgroundColor: statusColor, 
            color: '#fff', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {project.client && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Client</div>
              <div style={{ fontWeight: 'bold' }}>{project.client}</div>
            </div>
          )}
          {project.address && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Address</div>
              <div style={{ fontWeight: 'bold' }}>{project.address}</div>
            </div>
          )}
          {project.contractValue && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contract Value</div>
              <div style={{ fontWeight: 'bold' }}>${formatCurrency(project.contractValue)}</div>
            </div>
          )}
          {project.startDate && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Start Date</div>
              <div style={{ fontWeight: 'bold' }}>{new Date(project.startDate).toLocaleDateString()}</div>
            </div>
          )}
          {project.endDate && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>End Date</div>
              <div style={{ fontWeight: 'bold' }}>{new Date(project.endDate).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {project.notes && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notes</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{project.notes}</div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <NavLink to={`/logs/new?projectId=${project.id}`}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>+ Daily Log</button>
          </NavLink>
          <NavLink to={`/tasking/new?projectId=${project.id}`}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>+ Task</button>
          </NavLink>
          <NavLink to={`/waivers/new?projectId=${project.id}`}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>+ Waiver</button>
          </NavLink>
          <NavLink to={`/expenses/new?projectId=${project.id}`}>
            <button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>+ Expense</button>
          </NavLink>
          <NavLink to={`/projects/edit/${project.id}`}>
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
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{tasks.length}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tasks</div>
        </div>
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{logs.length}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Daily Logs</div>
        </div>
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{waivers.length}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Waivers</div>
        </div>
        <div style={{ 
          backgroundColor: 'var(--secondary-bg)', 
          padding: '1rem', 
          borderRadius: '4px',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(0)}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Expenses</div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'var(--secondary-bg)', 
        padding: '1.5rem', 
        borderRadius: '4px',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: 0 }}>Financial Summary</h2>
        {(() => {
          const profitability = calculateProjectProfitability(project, timeEntries, expenses, hourlyRate)
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contract Value</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {profitability.hasContractValue ? formatProfitCurrency(profitability.contractValue) : 'Not Set'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Labor ({formatHours(profitability.totalHours)})</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatProfitCurrency(profitability.laborCost)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expenses</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatProfitCurrency(profitability.totalExpenses)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Costs</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatProfitCurrency(profitability.totalCosts)}</div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: profitability.profitLoss >= 0 ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                borderRadius: '4px',
                borderLeft: `4px solid ${profitability.profitLoss >= 0 ? '#28a745' : '#dc3545'}`
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {profitability.profitLoss >= 0 ? 'Profit' : 'Loss'}
                  </div>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: profitability.profitLoss >= 0 ? '#28a745' : '#dc3545' 
                  }}>
                    {formatProfitCurrency(profitability.profitLoss)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Margin</div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: profitability.profitLoss >= 0 ? '#28a745' : '#dc3545' 
                  }}>
                    {formatPercent(profitability.marginPercent)}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Hourly rate: ${hourlyRate.toFixed(2)}/hr
              </div>
            </>
          )
        })()}
      </div>

      {expenses.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Recent Expenses</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {expenses.slice(0, 5).map(expense => (
              <li key={expense.id} style={{ 
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
                  <NavLink to={`/expenses/${expense.id}`} style={{ fontWeight: 'bold' }}>
                    {expense.description}
                  </NavLink>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(expense.date).toLocaleDateString()} - {expense.category}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>${expense.amount.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {logs.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Recent Daily Logs</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {logs.slice(0, 5).map(log => (
              <li key={log.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '0.75rem', 
                marginBottom: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <NavLink to={`/logs/${log.id}`} style={{ fontWeight: 'bold' }}>
                  {new Date(log.date).toLocaleDateString()}
                </NavLink>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {log.workPerformed.substring(0, 100)}{log.workPerformed.length > 100 ? '...' : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tasks.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Tasks</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tasks.slice(0, 5).map(task => (
              <li key={task.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '0.75rem', 
                marginBottom: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <NavLink to={`/tasking/${task.id}`} style={{ fontWeight: 'bold' }}>
                  {task.title}
                </NavLink>
                {task.description && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {task.description.substring(0, 100)}{task.description.length > 100 ? '...' : ''}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {waivers.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Lien Waivers</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {waivers.map(waiver => (
              <li key={waiver.id} style={{ 
                backgroundColor: 'var(--secondary-bg)', 
                padding: '0.75rem', 
                marginBottom: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: 'bold' }}>${waiver.amount}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {new Date(waiver.createdAt).toLocaleDateString()} - {waiver.subcontractorName}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tasks.length === 0 && logs.length === 0 && waivers.length === 0 && expenses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>No activity yet for this project.</p>
          <p>Use the buttons above to add daily logs, tasks, expenses, or waivers.</p>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
