import { AlertTriangle, Truck, Navigation, Clock, CheckCircle2 } from 'lucide-react'

const STAT_DEFS = [
  {
    key: 'active',
    label: 'Active Emergencies',
    desc: 'Currently requiring attention',
    icon: AlertTriangle,
    tone: 'danger'
  },
  {
    key: 'available',
    label: 'Available Units',
    desc: 'Ready for dispatch',
    icon: Truck,
    tone: 'teal'
  },
  {
    key: 'dispatched',
    label: 'Dispatched',
    desc: 'Assigned and waiting',
    icon: Navigation,
    tone: 'blue'
  },
  {
    key: 'enroute',
    label: 'En Route',
    desc: 'Moving to pickup',
    icon: Clock,
    tone: 'amber'
  },
  {
    key: 'completed',
    label: 'Completed',
    desc: 'Successfully resolved',
    icon: CheckCircle2,
    tone: 'green'
  }
]

export default function OperationsStats({ metrics }) {
  return (
    <section className="ops-stats" aria-label="Operational summary">
      <div className="ops-stats-grid">
        {STAT_DEFS.map((def) => {
          const value = metrics[def.key] ?? 0
          const Icon = def.icon
          return (
            <div className="ops-stat-card" key={def.key}>
              <div className={`ops-stat-icon ${def.tone}`}>
                <Icon size={20} />
              </div>
              <div className="ops-stat-content">
                <span className="ops-stat-value">{value}</span>
                <span className="ops-stat-label">{def.label}</span>
                <span className="ops-stat-desc">{def.desc}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
