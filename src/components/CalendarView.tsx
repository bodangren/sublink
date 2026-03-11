import { useState, useEffect, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { getTasks, getDailyLogs, getProjects } from '../db'
import type { Task, DailyLog, Project } from '../db'

interface CalendarItem {
  id: string
  type: 'task' | 'log' | 'project'
  title: string
  date: string
  projectId?: string
}

interface DayItems {
  tasks: CalendarItem[]
  logs: CalendarItem[]
  projects: CalendarItem[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        const [tasksData, logsData, projectsData] = await Promise.all([
          getTasks(),
          getDailyLogs(),
          getProjects(),
        ])
        if (mounted) {
          setTasks(tasksData)
          setLogs(logsData)
          setProjects(projectsData)
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const items: CalendarItem[] = []
    
    tasks.forEach(task => {
      const date = new Date(task.createdAt).toISOString().split('T')[0]
      items.push({
        id: task.id,
        type: 'task',
        title: task.title,
        date,
        projectId: task.projectId,
      })
    })
    
    logs.forEach(log => {
      items.push({
        id: log.id,
        type: 'log',
        title: log.project,
        date: log.date,
        projectId: log.projectId,
      })
    })
    
    projects.forEach(project => {
      if (project.endDate) {
        items.push({
          id: project.id,
          type: 'project',
          title: `${project.name} deadline`,
          date: project.endDate,
        })
      }
    })
    
    return items
  }, [tasks, logs, projects])

  const itemsByDate = useMemo(() => {
    const map = new Map<string, DayItems>()
    calendarItems.forEach(item => {
      const existing = map.get(item.date) || { tasks: [], logs: [], projects: [] }
      if (item.type === 'task') {
        existing.tasks.push(item)
      } else if (item.type === 'log') {
        existing.logs.push(item)
      } else {
        existing.projects.push(item)
      }
      map.set(item.date, existing)
    })
    return map
  }, [calendarItems])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startPadding = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const today = new Date().toISOString().split('T')[0]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(today)
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
  }

  const selectedDayItems = selectedDate ? itemsByDate.get(selectedDate) : null

  const renderDays = () => {
    const days = []
    
    for (let i = 0; i < startPadding; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty" />
      )
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayItems = itemsByDate.get(dateStr)
      const isToday = dateStr === today
      const isSelected = dateStr === selectedDate
      
      const hasTasks = dayItems && dayItems.tasks.length > 0
      const hasLogs = dayItems && dayItems.logs.length > 0
      const hasProjects = dayItems && dayItems.projects.length > 0
      
      days.push(
        <button
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
          <div className="indicators">
            {hasTasks && <span className="indicator task-indicator" title="Tasks" />}
            {hasLogs && <span className="indicator log-indicator" title="Daily Logs" />}
            {hasProjects && <span className="indicator project-indicator" title="Project Deadline" />}
          </div>
        </button>
      )
    }
    
    return days
  }

  if (loading) {
    return (
      <div className="container">
        <h1>Calendar</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Calendar</h1>
      
      <div className="calendar-nav">
        <button onClick={prevMonth} aria-label="Previous month">&lt;</button>
        <h2>{MONTHS[month]} {year}</h2>
        <button onClick={nextMonth} aria-label="Next month">&gt;</button>
        <button onClick={goToToday} className="today-btn">Today</button>
      </div>
      
      <div className="calendar-header">
        {DAYS.map(day => (
          <div key={day} className="calendar-header-cell">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {renderDays()}
      </div>

      <div className="calendar-legend">
        <span className="legend-item">
          <span className="indicator task-indicator" /> Tasks
        </span>
        <span className="legend-item">
          <span className="indicator log-indicator" /> Daily Logs
        </span>
        <span className="legend-item">
          <span className="indicator project-indicator" /> Deadlines
        </span>
      </div>
      
      {selectedDayItems && (
        <div className="day-detail">
          <h3>{selectedDate}</h3>
          
          {selectedDayItems.tasks.length === 0 && 
           selectedDayItems.logs.length === 0 && 
           selectedDayItems.projects.length === 0 ? (
            <p className="empty-message">No items scheduled</p>
          ) : (
            <>
              {selectedDayItems.projects.map(item => (
                <div key={item.id} className="day-item project-item">
                  <span className="item-icon">📅</span>
                  <NavLink to={`/projects/${item.id}`} className="item-link">
                    <span className="item-title">{item.title}</span>
                  </NavLink>
                </div>
              ))}
              
              {selectedDayItems.logs.map(item => (
                <div key={item.id} className="day-item log-item">
                  <span className="item-icon">📋</span>
                  <NavLink to={`/logs/${item.id}`} className="item-link">
                    <span className="item-title">{item.title}</span>
                  </NavLink>
                </div>
              ))}
              
              {selectedDayItems.tasks.map(item => (
                <div key={item.id} className="day-item task-item">
                  <span className="item-icon">✓</span>
                  <NavLink to={`/tasking/${item.id}`} className="item-link">
                    <span className="item-title">{item.title}</span>
                  </NavLink>
                </div>
              ))}
            </>
          )}
          
          <div className="quick-add">
            <NavLink to={`/logs/new?date=${selectedDate}`}>
              <button>Add Log</button>
            </NavLink>
            <NavLink to="/tasking/new">
              <button>Add Task</button>
            </NavLink>
          </div>
        </div>
      )}
      
      {!selectedDayItems && selectedDate && (
        <div className="day-detail">
          <h3>{selectedDate}</h3>
          <p className="empty-message">No items scheduled</p>
          <div className="quick-add">
            <NavLink to={`/logs/new?date=${selectedDate}`}>
              <button>Add Log</button>
            </NavLink>
            <NavLink to="/tasking/new">
              <button>Add Task</button>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  )
}
