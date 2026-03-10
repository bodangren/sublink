import { jsPDF } from 'jspdf'
import type { Expense, ExpenseCategory } from '../db'
import {
  PAGE_MARGIN,
  formatCurrency,
  formatDate,
  addHeader,
  addFooter,
  downloadPDF
} from './pdfShared'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materials: 'Materials',
  fuel: 'Fuel',
  equipment_rental: 'Equipment Rental',
  subcontractor: 'Subcontractor',
  other: 'Other'
}

export interface CategoryTotals {
  materials: number
  fuel: number
  equipment_rental: number
  subcontractor: number
  other: number
}

export const getCategoryTotals = (expenses: Expense[]): CategoryTotals => {
  const totals: CategoryTotals = {
    materials: 0,
    fuel: 0,
    equipment_rental: 0,
    subcontractor: 0,
    other: 0
  }
  
  for (const expense of expenses) {
    totals[expense.category] += expense.amount
  }
  
  return totals
}

export const generateExpensePDF = async (
  expenses: Expense[],
  startDate: string,
  endDate: string,
  projectNames?: Map<string, string>
): Promise<Blob> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - PAGE_MARGIN * 2
  
  let y = addHeader(doc, 'SubLink', 'Expense Report', `${formatDate(startDate)} - ${formatDate(endDate)}`)

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const categoryTotals = getCategoryTotals(expenses)

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Report Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, PAGE_MARGIN, y)
  y += 10

  doc.setFillColor(227, 242, 253)
  doc.rect(PAGE_MARGIN, y, contentWidth, 35, 'F')
  
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Summary by Category', PAGE_MARGIN + 5, y + 10)
  
  doc.setFontSize(9)
  const summaryY = y + 18
  const categories: ExpenseCategory[] = ['materials', 'fuel', 'equipment_rental', 'subcontractor', 'other']
  const leftCol = PAGE_MARGIN + 5
  const rightCol = pageWidth / 2 + 10
  
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    const x = i < 3 ? leftCol : rightCol
    const rowY = i < 3 ? summaryY + (i * 5) : summaryY + ((i - 3) * 5)
    
    if (categoryTotals[cat] > 0) {
      doc.text(`${CATEGORY_LABELS[cat]}: ${formatCurrency(categoryTotals[cat])}`, x, rowY)
    }
  }
  
  y += 42

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Expenses: ${formatCurrency(totalAmount)}`, PAGE_MARGIN, y)
  y += 15

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text('Date', PAGE_MARGIN, y)
  doc.text('Description', PAGE_MARGIN + 25, y)
  doc.text('Category', PAGE_MARGIN + 85, y)
  doc.text('Amount', pageWidth - PAGE_MARGIN - 10, y, { align: 'right' })
  
  y += 2
  doc.setDrawColor(200, 200, 200)
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y)
  y += 8

  const byProject = new Map<string, Expense[]>()
  expenses.forEach(expense => {
    const key = expense.projectId 
      ? (projectNames?.get(expense.projectId) || 'Unknown Project')
      : 'No Project'
    if (!byProject.has(key)) {
      byProject.set(key, [])
    }
    byProject.get(key)!.push(expense)
  })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(8)

  for (const [projectName, projectExpenses] of byProject) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = PAGE_MARGIN
    }

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(25, 118, 210)
    doc.text(projectName, PAGE_MARGIN, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)

    for (const expense of projectExpenses) {
      if (y > pageHeight - 20) {
        doc.addPage()
        y = PAGE_MARGIN
      }

      doc.text(formatDate(expense.date), PAGE_MARGIN, y)
      
      const descLines = doc.splitTextToSize(expense.description, 55)
      doc.text(descLines[0] || '', PAGE_MARGIN + 25, y)
      
      doc.text(CATEGORY_LABELS[expense.category], PAGE_MARGIN + 85, y)
      doc.text(formatCurrency(expense.amount), pageWidth - PAGE_MARGIN - 10, y, { align: 'right' })
      
      y += 6
    }

    const projectTotal = projectExpenses.reduce((sum, e) => sum + e.amount, 0)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text(`Subtotal: ${formatCurrency(projectTotal)}`, pageWidth - PAGE_MARGIN - 10, y, { align: 'right' })
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
  doc.text(`Grand Total: ${formatCurrency(totalAmount)}`, pageWidth - PAGE_MARGIN - 10, y, { align: 'right' })

  addFooter(doc, 'Expense Report', `${formatDate(startDate)} - ${formatDate(endDate)}`)
  
  return doc.output('blob')
}

export const generateExpensePDFFilename = (dateStr: string): string => {
  return `SubLink_Expenses_${dateStr}.pdf`
}

export { downloadPDF }
