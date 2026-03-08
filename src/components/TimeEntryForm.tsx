import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTimeEntry, updateTimeEntry, getProjects, getTasksByProject } from '../db'
import type { Project, Task } from '../db'

interface TimeEntryFormProps {
  editId?: string
  initialData?: {
    projectId: string
    taskId?: string
    startTime: string
    endTime: string
    notes: string
  }
}

const TimeEntryForm = ({ editId, initialData }: TimeEntryFormProps) => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [projectId, setProjectId] = useState(initialData?.projectId || '')
  const [taskId, setTaskId] = useState(initialData?.taskId || '')
  const [startTime, setStartTime] = useState(initialData?.startTime || '')
  const [endTime, setEndTime] = useState(initialData?.endTime || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  useEffect(() => {
    if (projectId) {
      getTasksByProject(projectId).then(setTasks)
    } else {
      setTasks([])
    }
    setTaskId('')
  }, [projectId])

  const calculateDuration = (): number => {
    if (!startTime || !endTime) return 0
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    return Math.max(0, Math.floor((end - start) / 1000))
  }

  const formatDurationDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!projectId) {
      setError('Please select a project')
      return
    }

    if (!startTime || !endTime) {
      setError('Please enter start and end times')
      return
    }

    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()

    if (end <= start) {
      setError('End time must be after start time')
      return
    }

    setLoading(true)

    try {
      const duration = Math.floor((end - start) / 1000)

      if (editId) {
        await updateTimeEntry(editId, {
          projectId,
          taskId: taskId || undefined,
          startTime: start,
          endTime: end,
          duration,
          notes: notes || undefined,
        })
      } else {
        await saveTimeEntry({
          projectId,
          taskId: taskId || undefined,
          startTime: start,
          endTime: end,
          duration,
          notes: notes || undefined,
        })
      }

      navigate('/time')
    } catch (err) {
      setError('Failed to save time entry')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const duration = calculateDuration()

  const getDefaultDateTime = (offsetHours: number = 0): string => {
    const now = new Date()
    now.setHours(now.getHours() + offsetHours)
    now.setMinutes(0, 0, 0)
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="container">
      <h1>{editId ? 'Edit Time Entry' : 'Add Time Entry'}</h1>

      <form aria-label="time entry form" onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        {error && (
          <div style={{
            backgroundColor: '#dc3545',
            color: '#fff',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="project" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Project *
          </label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
            }}
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {tasks.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="task" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Task (optional)
            </label>
            <select
              id="task"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            >
              <option value="">No specific task</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="startTime" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Start Time *
          </label>
          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="endTime" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            End Time *
          </label>
          <input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
            }}
          />
        </div>

        {duration > 0 && (
          <div style={{
            backgroundColor: 'var(--accent-color)',
            color: '#fff',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            <strong>Duration: {formatDurationDisplay(duration)}</strong>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="notes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you work on?"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              minHeight: '80px',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/time')}
            style={{
              flex: 1,
              backgroundColor: 'var(--secondary-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 2,
              backgroundColor: 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              padding: '1rem',
              borderRadius: '4px',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Saving...' : (editId ? 'Update Entry' : 'Save Entry')}
          </button>
        </div>
      </form>

      {!editId && !startTime && !endTime && (
        <div style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => {
              setStartTime(getDefaultDateTime(-2))
              setEndTime(getDefaultDateTime(0))
            }}
            style={{
              width: '100%',
              backgroundColor: 'var(--secondary-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Quick Fill: Last 2 Hours
          </button>
        </div>
      )}
    </div>
  )
}

export default TimeEntryForm
