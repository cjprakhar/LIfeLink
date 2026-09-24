import { AlertTriangle, Truck, CheckCircle2, Clock, Radio } from 'lucide-react'

const CONFIG = {
  pending: { label: 'Pending', className: 'pending', icon: Clock },
  dispatched: { label: 'Dispatched', className: 'dispatched', icon: Truck },
  'en-route': { label: 'En Route', className: 'en-route', icon: Radio },
  completed: { label: 'Completed', className: 'completed', icon: CheckCircle2 },
  sos: { label: 'SOS', className: 'sos', icon: AlertTriangle },
  available: { label: 'Available', className: 'available', icon: CheckCircle2 }
}

export default function StatusBadge({ status, showIcon = true }) {
  const cfg = CONFIG[status] || CONFIG.pending
  const Icon = cfg.icon

  return (
    <span className={`ops-badge ${cfg.className}`} role="status" aria-label={cfg.label}>
      {showIcon && <Icon size={11} />}
      {cfg.label}
    </span>
  )
}
