import { NavLink } from 'react-router-dom'

interface QuickActionProps {
  to: string
  icon: string
  label: string
}

const QuickAction = ({ to, icon, label }: QuickActionProps) => (
  <NavLink
    to={to}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.375rem',
      padding: '0.75rem 0.5rem',
      backgroundColor: 'var(--secondary-bg)',
      border: '2px solid var(--border-color)',
      borderRadius: '8px',
      textDecoration: 'none',
      color: 'var(--text-color)',
      minWidth: '70px',
      transition: 'border-color 0.2s, background-color 0.2s',
    }}
  >
    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'center' }}>{label}</span>
  </NavLink>
)

const QuickActions = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}
    >
      <QuickAction to="/logs/new" icon="📝" label="Daily Log" />
      <QuickAction to="/time" icon="⏱️" label="Time" />
      <QuickAction to="/expenses/new" icon="💵" label="Expense" />
      <QuickAction to="/tasking/new" icon="✅" label="Task" />
      <QuickAction to="/mileage/new" icon="🚗" label="Mileage" />
      <QuickAction to="/equipment" icon="🔧" label="Equipment" />
      <QuickAction to="/estimates/new" icon="📋" label="Estimate" />
      <QuickAction to="/invoices/new" icon="📄" label="Invoice" />
      <QuickAction to="/calendar" icon="📅" label="Calendar" />
    </div>
  )
}

export default QuickActions
