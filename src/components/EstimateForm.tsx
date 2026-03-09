import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveEstimate, updateEstimate, getProjects } from '../db'
import type { Project, EstimateLineItem } from '../db'

interface EstimateFormProps {
  editId?: string
  initialData?: {
    projectId?: string
    projectName?: string
    clientName: string
    clientEmail?: string
    clientAddress?: string
    issueDate: string
    validUntilDate: string
    lineItems: EstimateLineItem[]
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
    notes?: string
    status: 'draft' | 'sent' | 'accepted' | 'declined' | 'converted'
  }
}

const createEmptyLineItem = (): EstimateLineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  rate: 0,
  amount: 0,
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const EstimateForm = ({ editId, initialData }: EstimateFormProps) => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState(initialData?.projectId || '')
  const [projectName, setProjectName] = useState(initialData?.projectName || '')
  const [clientName, setClientName] = useState(initialData?.clientName || '')
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || '')
  const [clientAddress, setClientAddress] = useState(initialData?.clientAddress || '')
  const [issueDate, setIssueDate] = useState(initialData?.issueDate || new Date().toISOString().split('T')[0])
  const [validUntilDate, setValidUntilDate] = useState(initialData?.validUntilDate || '')
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>(initialData?.lineItems || [createEmptyLineItem()])
  const [taxRate, setTaxRate] = useState(initialData?.taxRate || 0)
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [status, setStatus] = useState<'draft' | 'sent' | 'accepted' | 'declined'>(initialData?.status === 'converted' ? 'draft' : (initialData?.status || 'draft'))
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
        if (project.client && !initialData?.clientName) {
          setClientName(project.client)
        }
        if (project.address && !initialData?.clientAddress) {
          setClientAddress(project.address)
        }
      }
    } else {
      setProjectName('')
    }
  }, [projectId, projects, initialData?.clientName, initialData?.clientAddress])

  useEffect(() => {
    if (issueDate && !initialData?.validUntilDate) {
      const validUntil = new Date(issueDate)
      validUntil.setDate(validUntil.getDate() + 30)
      setValidUntilDate(validUntil.toISOString().split('T')[0])
    }
  }, [issueDate, initialData?.validUntilDate])

  const updateLineItem = (id: string, updates: Partial<EstimateLineItem>) => {
    setLineItems(items =>
      items.map(item => {
        if (item.id !== id) return item
        const updated = { ...item, ...updates }
        updated.amount = updated.quantity * updated.rate
        return updated
      })
    )
  }

  const addLineItem = () => {
    setLineItems(items => [...items, createEmptyLineItem()])
  }

  const removeLineItem = (id: string) => {
    setLineItems(items => {
      if (items.length === 1) return items
      return items.filter(item => item.id !== id)
    })
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!clientName.trim()) {
      setError('Please enter a client name')
      return
    }

    if (!issueDate || !validUntilDate) {
      setError('Please enter issue and valid until dates')
      return
    }

    const validItems = lineItems.filter(item => item.description.trim() && item.amount > 0)
    if (validItems.length === 0) {
      setError('Please add at least one line item with a description and amount')
      return
    }

    setLoading(true)

    try {
      const estimateData = {
        projectId: projectId || undefined,
        projectName: projectName || undefined,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        issueDate,
        validUntilDate,
        lineItems: validItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes: notes.trim() || undefined,
        status,
      }

      if (editId) {
        await updateEstimate(editId, estimateData)
      } else {
        await saveEstimate(estimateData)
      }

      navigate('/estimates')
    } catch (err) {
      setError('Failed to save estimate')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>{editId ? 'Edit Estimate' : 'Create Estimate'}</h1>

      <form aria-label="estimate form" onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
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
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Project (Optional)
          </h3>
          <select
            id="project"
            aria-label="Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
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
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Client Information
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="clientName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Client Name *
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="Company or person name"
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
            <label htmlFor="clientEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Client Email
            </label>
            <input
              id="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="email@example.com"
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
            <label htmlFor="clientAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Client Address
            </label>
            <textarea
              id="clientAddress"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Street, City, State, ZIP"
              rows={2}
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
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Estimate Dates
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="issueDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Issue Date *
              </label>
              <input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
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
            <div>
              <label htmlFor="validUntilDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Valid Until *
              </label>
              <input
                id="validUntilDate"
                type="date"
                value={validUntilDate}
                onChange={(e) => setValidUntilDate(e.target.value)}
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
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Line Items
          </h3>

          {lineItems.map((item, index) => (
            <div key={item.id} style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              backgroundColor: 'var(--secondary-bg)', 
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 'bold' }}>Item {index + 1}</span>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                  placeholder="Description"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--primary-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--primary-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                    Rate ($)
                  </label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateLineItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--primary-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                    Amount
                  </label>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--secondary-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }}>
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLineItem}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--secondary-bg)',
              color: 'var(--text-primary)',
              border: '1px dashed var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            + Add Line Item
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Totals
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="taxRate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Tax Rate (%)
            </label>
            <input
              id="taxRate"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.1"
              style={{
                width: '150px',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--accent-color)', 
            color: '#fff', 
            borderRadius: '4px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Tax ({taxRate}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '0.5rem' }}>
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'sent' | 'accepted' | 'declined')}
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
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="notes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional terms, conditions, or notes for the client"
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
            onClick={() => navigate('/estimates')}
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
            {loading ? 'Saving...' : (editId ? 'Update Estimate' : 'Create Estimate')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EstimateForm
