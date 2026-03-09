import { jsPDF } from 'jspdf'
import type { Estimate } from '../db'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const generateEstimatePDF = async (estimate: Estimate): Promise<Blob> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  
  let y = margin

  doc.setFontSize(24)
  doc.setTextColor(0, 102, 153)
  doc.text('SubLink', margin, y)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Professional Estimate', margin, y + 8)
  
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text(estimate.estimateNumber, pageWidth - margin, y, { align: 'right' })
  y += 25

  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 15

  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text('Bill To:', margin, y)
  y += 6
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text(estimate.clientName, margin, y)
  doc.setFontSize(10)
  y += 6
  
  if (estimate.clientEmail) {
    doc.setTextColor(80, 80, 80)
    doc.text(estimate.clientEmail, margin, y)
    y += 6
  }
  
  if (estimate.clientAddress) {
    const addressLines = doc.splitTextToSize(estimate.clientAddress, contentWidth / 2)
    doc.text(addressLines, margin, y)
    y += addressLines.length * 5
  }
  
  y += 10

  const statusText = estimate.status.toUpperCase()
  const statusColor = estimate.status === 'accepted' ? [40, 167, 69] : 
                      estimate.status === 'declined' ? [220, 53, 69] :
                      estimate.status === 'converted' ? [111, 66, 193] : [108, 117, 125]
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
  doc.roundedRect(pageWidth - margin - 50, y, 50, 10, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(statusText, pageWidth - margin - 25, y + 6.5, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`Issue Date: ${formatDate(estimate.issueDate)}`, margin, y + 3)
  doc.text(`Valid Until: ${formatDate(estimate.validUntilDate)}`, margin, y + 11)
  
  y += 25

  doc.setDrawColor(255, 193, 7)
  doc.setFillColor(255, 248, 225)
  doc.roundedRect(margin, y, contentWidth, 15, 3, 3, 'F')
  doc.setFontSize(10)
  doc.setTextColor(133, 100, 4)
  doc.text(`This estimate is valid until ${formatDate(estimate.validUntilDate)}`, margin + 10, y + 10)
  y += 25

  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(0, 102, 153)
  doc.rect(margin, y, contentWidth, 8, 'F')
  
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Description', margin + 5, y + 5.5)
  doc.text('Qty', pageWidth - margin - 130, y + 5.5)
  doc.text('Rate', pageWidth - margin - 90, y + 5.5)
  doc.text('Amount', pageWidth - margin - 10, y + 5.5, { align: 'right' })
  
  y += 12

  doc.setTextColor(0, 0, 0)
  for (const item of estimate.lineItems) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = margin
    }
    
    doc.setDrawColor(230, 230, 230)
    doc.setFillColor(250, 250, 250)
    doc.rect(margin, y - 2, contentWidth, 10, 'FD')
    
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    
    const descLines = doc.splitTextToSize(item.description, contentWidth - 180)
    doc.text(descLines[0] || '', margin + 5, y + 4)
    doc.text(String(item.quantity), pageWidth - margin - 130, y + 4)
    doc.text(formatCurrency(item.rate), pageWidth - margin - 90, y + 4)
    doc.text(formatCurrency(item.amount), pageWidth - margin - 10, y + 4, { align: 'right' })
    
    y += 12
  }

  y += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  doc.setFillColor(245, 245, 245)
  doc.roundedRect(pageWidth - margin - 100, y - 5, 100, 45, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text('Subtotal:', pageWidth - margin - 95, y + 5)
  doc.text(formatCurrency(estimate.subtotal), pageWidth - margin - 10, y + 5, { align: 'right' })
  
  if (estimate.taxRate > 0) {
    doc.text(`Tax (${estimate.taxRate}%):`, pageWidth - margin - 95, y + 15)
    doc.text(formatCurrency(estimate.taxAmount), pageWidth - margin - 10, y + 15, { align: 'right' })
  }
  
  doc.setDrawColor(200, 200, 200)
  const lineY = y + (estimate.taxRate > 0 ? 22 : 12)
  doc.line(pageWidth - margin - 95, lineY, pageWidth - margin - 10, lineY)
  
  doc.setFontSize(12)
  doc.setTextColor(0, 102, 153)
  const totalY = y + (estimate.taxRate > 0 ? 32 : 22)
  doc.text('Total:', pageWidth - margin - 95, totalY)
  doc.text(formatCurrency(estimate.total), pageWidth - margin - 10, totalY, { align: 'right' })

  y += (estimate.taxRate > 0 ? 55 : 45)

  if (estimate.notes) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = margin
    }
    
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text('Notes:', margin, y)
    y += 6
    
    const noteLines = doc.splitTextToSize(estimate.notes, contentWidth)
    doc.text(noteLines, margin, y)
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `SubLink Estimate | ${estimate.estimateNumber} | Page ${i} of ${pageCount}`,
      margin,
      pageHeight - 10
    )
  }
  
  return doc.output('blob')
}

export const downloadPDF = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
