export type COIStatus = 'active' | 'expiring' | 'expired'

export function getDaysUntilExpiration(expirationDate: string): number {
  const now = new Date()
  const exp = new Date(expirationDate)
  const diffTime = exp.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getCOIStatus(expirationDate: string): COIStatus {
  const daysUntilExpiration = getDaysUntilExpiration(expirationDate)
  
  if (daysUntilExpiration < 0) return 'expired'
  if (daysUntilExpiration <= 30) return 'expiring'
  return 'active'
}

export function getStatusColor(status: COIStatus): string {
  switch (status) {
    case 'active':
      return '#28a745'
    case 'expiring':
      return '#ff9800'
    case 'expired':
      return '#dc3545'
  }
}

export function getStatusLabel(status: COIStatus): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'expiring':
      return 'Expiring Soon'
    case 'expired':
      return 'Expired'
  }
}
