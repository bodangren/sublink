import { useState, type ReactNode } from 'react'

interface DashboardSectionProps {
  title: string
  icon?: string
  badge?: string | number
  badgeColor?: string
  action?: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  children: ReactNode
}

const DashboardSection = ({
  title,
  icon,
  badge,
  badgeColor,
  action,
  collapsible = false,
  defaultCollapsed = false,
  variant = 'default',
  children,
}: DashboardSectionProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const variantStyles = {
    default: {},
    success: { borderColor: 'var(--success-color)' },
    warning: { borderColor: 'var(--accent-color)' },
    danger: { borderColor: 'var(--error-color)' },
  }

  const headerIconColors = {
    default: 'var(--accent-color)',
    success: 'var(--success-color)',
    warning: 'var(--accent-color)',
    danger: 'var(--error-color)',
  }

  return (
    <div
      className="dashboard-section"
      style={{
        backgroundColor: 'var(--secondary-bg)',
        border: '2px solid var(--border-color)',
        borderRadius: '8px',
        marginBottom: '1rem',
        overflow: 'hidden',
        ...variantStyles[variant],
      }}
    >
      <div
        onClick={() => collapsible && setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1rem',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-color)',
          cursor: collapsible ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon && (
            <span style={{ fontSize: '1.25rem', color: headerIconColors[variant] }}>
              {icon}
            </span>
          )}
          <h3 style={{ margin: 0, padding: 0, fontSize: '1rem', color: 'var(--text-color)' }}>
            {title}
          </h3>
          {badge !== undefined && (
            <span
              style={{
                backgroundColor: badgeColor || 'var(--accent-color)',
                color: '#000',
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {action}
          {collapsible && (
            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-color)',
                transition: 'transform 0.2s',
                display: 'inline-block',
                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              }}
            >
              ▼
            </span>
          )}
        </div>
      </div>
      {!collapsed && <div style={{ padding: '1rem' }}>{children}</div>}
    </div>
  )
}

export default DashboardSection
