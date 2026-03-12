import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveChangeOrder, updateChangeOrder, getProjects } from '../db'
import type { Project, ChangeOrderStatus } from '../db'

interface ChangeOrderFormProps {
  editId?: string
  initialData?: {
    projectId?: string
    projectName?: string
    description: string
    costAdjustment: number
    reason: string
    contractReference?: string
    status: ChangeOrderStatus
    notes?: string
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const ChangeOrderForm = ({ editId, initialData }: ChangeOrderFormProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState(initialData?.projectId || searchParams.get('projectId') || '')
  const [projectName, setProjectName] = useState(initialData?.projectName || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [costAdjustment, setCostAdjustment] = useState(initialData?.costAdjustment?.toString() || '')
  const [reason, setReason] = useState(initialData?.reason || '')
  const [contractReference, setContractReference] = useState(initialData?.contractReference || '')
  const [status, setStatus] = useState<ChangeOrderStatus>(initialData?.status || 'draft')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setProjectName(project.name)
      }
    } else {
      setProjectName('')
    }
  }, [projectId, projects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!projectId) {
      setError('Please select a project')
      return
    }

    if (!description.trim()) {
      setError('Please enter a description of the change')
      return
    }

    if (!reason.trim()) {
      setError('Please enter a reason for the change')
      return
    }

    const costValue = parseFloat(costAdjustment)
    if (isNaN(costValue)) {
      setError('Please enter a valid cost adjustment')
      return
    }

    setLoading(true)

    try {
      const changeOrderData = {
        projectId,
        projectName,
        description: description.trim(),
        costAdjustment: costValue,
        reason: reason.trim(),
        contractReference: contractReference.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      }

      if (editId) {
        await updateChangeOrder(editId, changeOrderData)
        navigate('/change-orders/' + editId)
      } else {
        const result = await saveChangeOrder(changeOrderData)
        navigate('/change-orders/' + result.id)
      }
    } catch (err) {
      setError('Failed to save change order')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const parsedCost = parseFloat(costAdjustment) || 0

  return (
    <div className="container">
      <h1>{editId ? 'Edit Change Order' : 'Create Change Order'}</h1>

      <form aria-label="change order form" onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="project" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Project *
          </label>
          <select
            id="project"
            aria-label="Project"
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
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Description of Change *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the scope change in detail..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="costAdjustment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Cost Adjustment ($) *
          </label>
          <input
            id="costAdjustment"
            type="number"
            value={costAdjustment}
            onChange={(e) => setCostAdjustment(e.target.value)}
            required
            placeholder="Enter positive for additions, negative for deductions"
            step="0.01"
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
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '0.75rem', 
            backgroundColor: parsedCost >= 0 ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
            borderRadius: '4px',
            color: parsedCost >= 0 ? '#28a745' : '#dc3545',
            fontWeight: 'bold',
          }}>
            {parsedCost >= 0 ? 'Addition: ' : 'Deduction: '}
            {formatCurrency(Math.abs(parsedCost))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="reason" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Reason / Justification *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Why is this change necessary?"
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="contractReference" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Contract Reference (Optional)
          </label>
          <input
            id="contractReference"
            type="text"
            value={contractReference}
            onChange={(e) => setContractReference(e.target.value)}
            placeholder="e.g., Section 2.3, Exhibit A, etc."
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ChangeOrderStatus)}
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
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="notes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes or comments..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
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
            {loading ? 'Saving...' : (editId ? 'Update Change Order' : 'Create Change Order')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChangeOrderForm
