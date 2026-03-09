import { jsPDF } from 'jspdf'
import type { Estimate } from '../db'
import {
  PAGE_MARGIN,
  formatDate,
  addHeader,
  addFooter,
  drawStatusBadge,
  drawLineItemsTable,
  drawTotals,
  downloadPDF
} from './pdfShared'

export const generateEstimatePDF = async (estimate: Estimate): Promise<Blob> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - PAGE_MARGIN * 2
  
  let y = addHeader(doc, 'SubLink', 'Professional Estimate', estimate.estimateNumber)

  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text('Bill To:', PAGE_MARGIN, y)
  y += 6
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text(estimate.clientName, PAGE_MARGIN, y)
  doc.setFontSize(10)
  y += 6
  
  if (estimate.clientEmail) {
    doc.setTextColor(80, 80, 80)
    doc.text(estimate.clientEmail, PAGE_MARGIN, y)
    y += 6
  }
  
  if (estimate.clientAddress) {
    const addressLines = doc.splitTextToSize(estimate.clientAddress, contentWidth / 2)
    doc.text(addressLines, PAGE_MARGIN, y)
    y += addressLines.length * 5
  }
  
  y += 10

  drawStatusBadge(doc, estimate.status, pageWidth - PAGE_MARGIN - 50, y, 50)
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`Issue Date: ${formatDate(estimate.issueDate)}`, PAGE_MARGIN, y + 3)
  doc.text(`Valid Until: ${formatDate(estimate.validUntilDate)}`, PAGE_MARGIN, y + 11)
  
  y += 25

  doc.setDrawColor(255, 193, 7)
  doc.setFillColor(255, 248, 225)
  doc.roundedRect(PAGE_MARGIN, y, contentWidth, 15, 3, 3, 'F')
  doc.setFontSize(10)
  doc.setTextColor(133, 100, 4)
  doc.text(`This estimate is valid until ${formatDate(estimate.validUntilDate)}`, PAGE_MARGIN + 10, y + 10)
  y += 25

  y = drawLineItemsTable(doc, estimate.lineItems, y)
  y = drawTotals(doc, estimate.subtotal, estimate.taxRate, estimate.taxAmount, estimate.total, y)

  if (estimate.notes) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = PAGE_MARGIN
    }
    
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text('Notes:', PAGE_MARGIN, y)
    y += 6
    
    const noteLines = doc.splitTextToSize(estimate.notes, contentWidth)
    doc.text(noteLines, PAGE_MARGIN, y)
  }

  addFooter(doc, 'Estimate', estimate.estimateNumber)
  
  return doc.output('blob')
}

export { downloadPDF }
