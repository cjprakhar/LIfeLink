import { Link } from 'react-router-dom'
import { User as UserIcon, ArrowLeft } from 'lucide-react'

export default function OperationsHeader({ connected }) {
  return (
    <header className="ops-header" role="banner">
      <div className="ops-header-inner">
        {/* Brand */}
        <Link to="/ops" className="ops-header-brand" aria-label="CareConnect Operations">
          <div className="ops-logo-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="ops-brand-text">
            <span className="ops-brand-name">CareConnect <span style={{ fontWeight: 600, color: 'var(--cc-teal)' }}>Operations</span></span>
            <span className="ops-brand-subtitle">Emergency Response Center</span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="ops-header-right">
          {/* Status indicator */}
          <div className="ops-status-label" title={connected ? 'Live connection active' : 'Connection lost'}>
            <span className={`ops-connection-dot ${connected ? 'connected' : 'disconnected'}`} />
            {connected ? 'Operational' : 'Disconnected'}
          </div>

          {/* Patient Portal link */}
          <Link to="/" className="ops-portal-link" aria-label="Go to Patient Portal">
            <ArrowLeft size={14} />
            <span>Patient Portal</span>
          </Link>

          {/* Profile */}
          <button type="button" className="ops-profile-btn" aria-label="Profile">
            <UserIcon size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
