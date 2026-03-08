import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SignatureCanvas from 'react-signature-canvas'
import { jsPDF } from 'jspdf'
import { saveWaiver, getProjects } from '../db'
import type { Project } from '../db'

interface WaiverData {
  projectName: string
  projectId: string
  subcontractorName: string
  amount: string
  date: string
}

const WaiverForm = () => {
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState<WaiverData>({
    projectName: '',
    projectId: searchParams.get('projectId') || '',
    subcontractorName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState<string | null>(null)
  const sigPad = useRef<SignatureCanvas>(null)

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'projectId') {
      const selectedProject = projects.find(p => p.id === value)
      setFormData(prev => ({ 
        ...prev, 
        projectId: value, 
        projectName: selectedProject ? selectedProject.name : '' 
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const clearSignature = () => {
    sigPad.current?.clear()
  }

  const generatePDF = () => {
    if (sigPad.current?.isEmpty()) {
      setError('Please provide a signature first.')
      return
    }
    setError(null)

    const doc = new jsPDF()
    const signatureImage = sigPad.current?.getTrimmedCanvas().toDataURL('image/png')

    if (signatureImage) {
      saveWaiver({
        projectName: formData.projectName,
        projectId: formData.projectId || undefined,
        subcontractorName: formData.subcontractorName,
        amount: formData.amount,
        date: formData.date,
        signature: signatureImage,
      })
    }

    doc.setFontSize(22)
    doc.text('LIEN WAIVER', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.text(`Project Name: ${formData.projectName}`, 20, 40)
    doc.text(`Subcontractor: ${formData.subcontractorName}`, 20, 50)
    doc.text(`Amount: $${formData.amount}`, 20, 60)
    doc.text(`Date: ${formData.date}`, 20, 70)

    doc.text('I hereby certify that I have been paid in full for all labor, materials, and services', 20, 90)
    doc.text('provided to the project as of the date specified above.', 20, 100)

    doc.text('Signature:', 20, 120)
    if (signatureImage) {
      doc.addImage(signatureImage, 'PNG', 20, 130, 100, 40)
    }

    doc.save(`LienWaiver_${formData.projectName.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div className="container">
      <h2>New Lien Waiver</h2>
      {error && (
        <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={(e) => e.preventDefault()}>
        <label>Project (Optional)</label>
        <select 
          name="projectId" 
          value={formData.projectId} 
          onChange={handleChange}
        >
          <option value="">Select Project or Enter Manually Below</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label>Project Name</label>
        <input 
          type="text" 
          name="projectName" 
          value={formData.projectName} 
          onChange={handleChange} 
          placeholder="e.g. Oak Street Residential"
          required
        />

        <label>Subcontractor Name</label>
        <input 
          type="text" 
          name="subcontractorName" 
          value={formData.subcontractorName} 
          onChange={handleChange} 
          placeholder="e.g. Apex Plumbing"
          required
        />

        <label>Payment Amount ($)</label>
        <input 
          type="number" 
          name="amount" 
          value={formData.amount} 
          onChange={handleChange} 
          placeholder="0.00"
          required
        />

        <label>Date</label>
        <input 
          type="date" 
          name="date" 
          value={formData.date} 
          onChange={handleChange} 
          required
        />

        <label>Signature</label>
        <div className="signature-container">
          <SignatureCanvas 
            ref={sigPad}
            penColor='black'
            canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
          />
        </div>
        <button type="button" onClick={clearSignature} style={{ backgroundColor: '#444', color: '#fff' }}>
          Clear Signature
        </button>

        <button type="button" onClick={generatePDF}>
          Generate & Download PDF
        </button>
      </form>
    </div>
  )
}

export default WaiverForm
