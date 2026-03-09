import { jsPDF } from 'jspdf'
import type { MileageEntry } from '../db'
import {
  PAGE_MARGIN,
  formatDate,
  addHeader,
  addFooter,
  downloadPDF
} from './pdfShared'

const MILEAGE_RATE_2024 = 0.67

export const generateMileagePDF = async (
  entries: MileageEntry[],
  startDate: string,
  endDate: string
): Promise<Blob> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - PAGE_MARGIN * 2
  
  let y = addHeader(doc, 'SubLink', 'Mileage Report', `${formatDate(startDate)} - ${formatDate(endDate)}`)

  const totalMiles = entries.reduce((sum, entry) => sum + entry.miles, 0)
  const totalCost = totalMiles * MILEAGE_RATE_2024

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Report Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, PAGE_MARGIN, y)
  y += 8
  doc.text(`Mileage Rate: $${MILEAGE_RATE_2024.toFixed(2)} per mile (2024 IRS Standard)`, PAGE_MARGIN, y)
  y += 10

  doc.setFillColor(227, 242, 253)
  doc.rect(PAGE_MARGIN, y, contentWidth, 25, 'F')
  
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Summary', PAGE_MARGIN + 5, y + 10)
  
  doc.setFontSize(11)
  doc.text(`Total Miles: ${totalMiles.toFixed(1)}`, PAGE_MARGIN + 5, y + 20)
  doc.text(`Estimated Deduction: $${totalCost.toFixed(2)}`, pageWidth / 2, y + 20)
  
  y += 35

  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text('Date', PAGE_MARGIN, y)
  doc.text('Route', PAGE_MARGIN + 30, y)
  doc.text('Miles', pageWidth - PAGE_MARGIN - 35, y)
  doc.text('Cost', pageWidth - PAGE_MARGIN - 15, y)
  
  y += 2
  doc.setDrawColor(200, 200, 200)
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y)
  y += 8

  const byProject = new Map<string, MileageEntry[]>()
  entries.forEach(entry => {
    const key = entry.projectName || 'No Project'
    if (!byProject.has(key)) {
      byProject.set(key, [])
    }
    byProject.get(key)!.push(entry)
  })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)

  for (const [projectName, projectEntries] of byProject) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = PAGE_MARGIN
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(25, 118, 210)
    doc.text(projectName, PAGE_MARGIN, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)

    for (const entry of projectEntries) {
      if (y > pageHeight - 20) {
        doc.addPage()
        y = PAGE_MARGIN
      }

      doc.text(formatDate(entry.date), PAGE_MARGIN, y)
      
      const route = `${entry.startLocation} → ${entry.endLocation}${entry.isRoundTrip ? ' (RT)' : ''}`
      const routeLines = doc.splitTextToSize(route, 80)
      doc.text(routeLines, PAGE_MARGIN + 30, y)
      
      doc.text(entry.miles.toFixed(1), pageWidth - PAGE_MARGIN - 35, y)
      doc.text(`$${(entry.miles * MILEAGE_RATE_2024).toFixed(2)}`, pageWidth - PAGE_MARGIN - 15, y)
      
      y += Math.max(6, routeLines.length * 5)
    }

    const projectTotal = projectEntries.reduce((sum, e) => sum + e.miles, 0)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text(`Subtotal: ${projectTotal.toFixed(1)} mi`, pageWidth - PAGE_MARGIN - 50, y)
    y += 10
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
  }

  if (y > pageHeight - 30) {
    doc.addPage()
    y = PAGE_MARGIN
  }

  y += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y)
  y += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Miles: ${totalMiles.toFixed(1)}`, PAGE_MARGIN, y)
  doc.text(`Total Deduction: $${totalCost.toFixed(2)}`, pageWidth - PAGE_MARGIN - 50, y)

  addFooter(doc, 'Mileage Report', `${formatDate(startDate)} - ${formatDate(endDate)}`)
  
  return doc.output('blob')
}

export { downloadPDF }
