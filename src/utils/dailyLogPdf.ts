import { jsPDF } from 'jspdf'
import type { DailyLog } from '../db'

export const sanitizeFilename = (title: string): string => {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
    .trim()
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatShortDate = (dateStr: string): string => {
  return dateStr.replace(/-/g, '')
}

export const generateDailyLogPdf = async (log: DailyLog): Promise<void> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  
  let yPosition = margin
  
  doc.setFontSize(24)
  doc.setTextColor(0, 0, 0)
  doc.text('SubLink', margin, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Daily Construction Log', margin, yPosition)
  yPosition += 15
  
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 15
  
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  const projectLines = doc.splitTextToSize(log.project, contentWidth)
  doc.text(projectLines, margin, yPosition)
  yPosition += projectLines.length * 7 + 5
  
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(formatDate(log.date), margin, yPosition)
  yPosition += 15
  
  const addSection = (title: string, content: string, borderColor?: [number, number, number]) => {
    const remainingHeight = pageHeight - yPosition - margin
    if (remainingHeight < 40) {
      doc.addPage()
      yPosition = margin
    }
    
    if (borderColor) {
      doc.setDrawColor(...borderColor)
      doc.setLineWidth(0.5)
      doc.line(margin, yPosition, margin, yPosition + 3)
    }
    
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text(title, margin + (borderColor ? 3 : 0), yPosition)
    yPosition += 6
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const lines = doc.splitTextToSize(content, contentWidth - (borderColor ? 3 : 0))
    doc.text(lines, margin + (borderColor ? 3 : 0), yPosition)
    yPosition += lines.length * 5 + 10
    
    if (borderColor) {
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.2)
    }
  }
  
  addSection('Weather Conditions', log.weather)
  addSection('Work Performed', log.workPerformed)
  addSection('Personnel On Site', log.personnel)
  
  if (log.delays) {
    addSection('Delays / Issues', log.delays, [255, 68, 68])
  }
  
  if (log.equipment) {
    addSection('Equipment Used', log.equipment)
  }
  
  if (log.notes) {
    addSection('Additional Notes', log.notes)
  }
  
  yPosition += 10
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10
  
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
  
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `SubLink Daily Log | ${log.project} | Page ${i} of ${pageCount}`,
      margin,
      pageHeight - 10
    )
  }
  
  const sanitizedProject = sanitizeFilename(log.project)
  const dateStr = formatShortDate(log.date)
  const filename = `DailyLog_${sanitizedProject}_${dateStr}.pdf`
  
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
