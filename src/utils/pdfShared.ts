import { jsPDF } from 'jspdf'

export const BRAND_COLOR: [number, number, number] = [0, 102, 153]
export const SUCCESS_COLOR: [number, number, number] = [40, 167, 69]
export const DANGER_COLOR: [number, number, number] = [220, 53, 69]
export const WARNING_COLOR: [number, number, number] = [255, 193, 7]
export const MUTED_COLOR: [number, number, number] = [108, 117, 125]
export const PURPLE_COLOR: [number, number, number] = [111, 66, 193]

export const PAGE_MARGIN = 20

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateWithTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatShortDateFromStr = (dateStr: string): string => {
  return dateStr.replace(/-/g, '')
}

export const formatShortDateFromTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const sanitizeFilename = (title: string): string => {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
    .trim()
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
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

export const addHeader = (
  doc: jsPDF, 
  title: string, 
  subtitle: string,
  referenceNumber?: string
): number => {
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = PAGE_MARGIN

  doc.setFontSize(24)
  doc.setTextColor(...BRAND_COLOR)
  doc.text(title, PAGE_MARGIN, y)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(subtitle, PAGE_MARGIN, y + 8)
  
  if (referenceNumber) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(referenceNumber, pageWidth - PAGE_MARGIN, y, { align: 'right' })
  }
  
  y += 25

  doc.setDrawColor(200, 200, 200)
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y)
  
  return y + 15
}

export const addFooter = (
  doc: jsPDF,
  documentType: string,
  referenceNumber: string
): void => {
  const pageCount = doc.getNumberOfPages()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `SubLink ${documentType} | ${referenceNumber} | Page ${i} of ${pageCount}`,
      PAGE_MARGIN,
      pageHeight - 10
    )
  }
}

export const getStatusColor = (status: string): [number, number, number] => {
  switch (status) {
    case 'paid':
    case 'accepted':
      return SUCCESS_COLOR
    case 'overdue':
    case 'declined':
      return DANGER_COLOR
    case 'converted':
      return PURPLE_COLOR
    default:
      return MUTED_COLOR
  }
}

export const drawStatusBadge = (
  doc: jsPDF,
  status: string,
  x: number,
  y: number,
  width: number = 40
): void => {
  const statusText = status.toUpperCase()
  const color = getStatusColor(status)
  
  doc.setFillColor(...color)
  doc.roundedRect(x, y, width, 10, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(statusText, x + width / 2, y + 6.5, { align: 'center' })
}

export const drawLineItemsTable = (
  doc: jsPDF,
  lineItems: Array<{ description: string; quantity: number; rate: number; amount: number }>,
  startY: number
): number => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - PAGE_MARGIN * 2
  let y = startY

  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(...BRAND_COLOR)
  doc.rect(PAGE_MARGIN, y, contentWidth, 8, 'F')
  
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Description', PAGE_MARGIN + 5, y + 5.5)
  doc.text('Qty', pageWidth - PAGE_MARGIN - 130, y + 5.5)
  doc.text('Rate', pageWidth - PAGE_MARGIN - 90, y + 5.5)
  doc.text('Amount', pageWidth - PAGE_MARGIN - 10, y + 5.5, { align: 'right' })
  
  y += 12

  doc.setTextColor(0, 0, 0)
  for (const item of lineItems) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = PAGE_MARGIN
    }
    
    doc.setDrawColor(230, 230, 230)
    doc.setFillColor(250, 250, 250)
    doc.rect(PAGE_MARGIN, y - 2, contentWidth, 10, 'FD')
    
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    
    const descLines = doc.splitTextToSize(item.description, contentWidth - 180)
    doc.text(descLines[0] || '', PAGE_MARGIN + 5, y + 4)
    doc.text(String(item.quantity), pageWidth - PAGE_MARGIN - 130, y + 4)
    doc.text(formatCurrency(item.rate), pageWidth - PAGE_MARGIN - 90, y + 4)
    doc.text(formatCurrency(item.amount), pageWidth - PAGE_MARGIN - 10, y + 4, { align: 'right' })
    
    y += 12
  }

  return y
}

export const drawTotals = (
  doc: jsPDF,
  subtotal: number,
  taxRate: number,
  taxAmount: number,
  total: number,
  startY: number
): number => {
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = startY + 5

  doc.setDrawColor(200, 200, 200)
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y)
  y += 10

  doc.setFillColor(245, 245, 245)
  doc.roundedRect(pageWidth - PAGE_MARGIN - 100, y - 5, 100, 45, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text('Subtotal:', pageWidth - PAGE_MARGIN - 95, y + 5)
  doc.text(formatCurrency(subtotal), pageWidth - PAGE_MARGIN - 10, y + 5, { align: 'right' })
  
  if (taxRate > 0) {
    doc.text(`Tax (${taxRate}%):`, pageWidth - PAGE_MARGIN - 95, y + 15)
    doc.text(formatCurrency(taxAmount), pageWidth - PAGE_MARGIN - 10, y + 15, { align: 'right' })
  }
  
  doc.setDrawColor(200, 200, 200)
  const lineY = y + (taxRate > 0 ? 22 : 12)
  doc.line(pageWidth - PAGE_MARGIN - 95, lineY, pageWidth - PAGE_MARGIN - 10, lineY)
  
  doc.setFontSize(12)
  doc.setTextColor(...BRAND_COLOR)
  const totalY = y + (taxRate > 0 ? 32 : 22)
  doc.text('Total:', pageWidth - PAGE_MARGIN - 95, totalY)
  doc.text(formatCurrency(total), pageWidth - PAGE_MARGIN - 10, totalY, { align: 'right' })

  return y + (taxRate > 0 ? 55 : 45)
}
