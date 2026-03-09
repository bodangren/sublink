import { jsPDF } from 'jspdf'
import type { Invoice } from '../db'
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

export const generateInvoicePDF = async (invoice: Invoice): Promise<Blob> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - PAGE_MARGIN * 2
  
  let y = addHeader(doc, 'SubLink', 'Professional Invoice', invoice.invoiceNumber)

  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text('Bill To:', PAGE_MARGIN, y)
  y += 6
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text(invoice.clientName, PAGE_MARGIN, y)
  doc.setFontSize(10)
  y += 6
  
  if (invoice.clientEmail) {
    doc.setTextColor(80, 80, 80)
    doc.text(invoice.clientEmail, PAGE_MARGIN, y)
    y += 6
  }
  
  if (invoice.clientAddress) {
    const addressLines = doc.splitTextToSize(invoice.clientAddress, contentWidth / 2)
    doc.text(addressLines, PAGE_MARGIN, y)
    y += addressLines.length * 5
  }
  
  y += 10

  drawStatusBadge(doc, invoice.status, pageWidth - PAGE_MARGIN - 40, y, 40)
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, PAGE_MARGIN, y + 3)
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, PAGE_MARGIN, y + 11)
  
  y += 25

  y = drawLineItemsTable(doc, invoice.lineItems, y)
  y = drawTotals(doc, invoice.subtotal, invoice.taxRate, invoice.taxAmount, invoice.total, y)

  if (invoice.notes) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = PAGE_MARGIN
    }
    
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text('Notes:', PAGE_MARGIN, y)
    y += 6
    
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth)
    doc.text(noteLines, PAGE_MARGIN, y)
  }

  addFooter(doc, 'Invoice', invoice.invoiceNumber)
  
  return doc.output('blob')
}

export { downloadPDF }
