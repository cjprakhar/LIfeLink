/**
 * StatusBadge — coloured pill badge for dispatch / request status
 */
const STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'status-badge--warning' },
  dispatched: { label: 'Dispatched', className: 'status-badge--info' },
  'en-route': { label: 'En Route', className: 'status-badge--enroute' },
  completed: { label: 'Completed', className: 'status-badge--success' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`status-badge ${cfg.className}`} aria-label={`Status: ${cfg.label}`}>
      {cfg.label}
    </span>
  )
}
