import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * ServiceCard — quick-action card for the home page grid
 * @param {object} props
 * @param {React.ReactNode} props.icon
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.to - react-router link target
 * @param {string} props.iconBg - CSS colour for icon background
 * @param {string} props.iconColor - CSS colour for icon stroke
 * @param {boolean} [props.emergency] - highlight with emergency styling
 */
export default function ServiceCard({ icon, title, description, to, iconBg, iconColor, emergency = false }) {
  return (
    <Link
      to={to}
      className={`service-card ${emergency ? 'service-card--emergency' : ''}`}
      aria-label={title}
    >
      <div className="service-card-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="service-card-body">
        <h3 className="service-card-title">{title}</h3>
        <p className="service-card-desc">{description}</p>
      </div>
      <div className="service-card-arrow">
        <ArrowRight size={16} />
      </div>
    </Link>
  )
}
