import { ShieldAlert, Activity, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function Emergency() {

  return (
    <div className="page-container">
      <div className="page-hero page-hero--emergency">
        <div className="section-inner">
          <div className="page-hero-content">
            <div className="page-hero-icon page-hero-icon--red"><ShieldAlert size={28} /></div>
            <div>
              <h1 className="page-title">Emergency Status</h1>
              <p className="page-subtitle">
                View your active emergency request and assigned ambulance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-inner page-body">
        {/* Info: no persistent session tracking yet */}
        <div className="cc-alert cc-alert--info">
          <AlertTriangle size={16} />
          <span>
            Active emergency tracking across page refreshes requires authentication, which is coming
            in a future update. Use the <strong>SOS button</strong> to send a new request and view
            the assigned ambulance immediately after submission.
          </span>
        </div>

        {/* SOS CTA */}
        <div className="emergency-page-cta-card">
          <div className="emergency-page-cta-icon">
            <ShieldAlert size={32} />
          </div>
          <h2>Need help right now?</h2>
          <p>
            Tap the <strong>SOS</strong> button at the bottom-left of your screen to immediately
            request emergency ambulance dispatch to your current location.
          </p>
          <div className="emergency-page-ctas">
            <Link to="/ambulance" className="hero-cta-sos emergency-page-cta-sos">
              <ShieldAlert size={18} />
              Open SOS Panel
            </Link>
            <Link to="/history" className="cc-btn-ghost">
              <Activity size={16} />
              View History
            </Link>
          </div>
        </div>

        {/* Emergency numbers */}
        <div className="emergency-numbers-callout">
          <h3>Emergency Numbers</h3>
          <div className="emergency-numbers-grid">
            <a href="tel:112" className="emergency-number-item">
              <span className="emergency-number">112</span>
              <span className="emergency-number-label">National Emergency</span>
            </a>
            <a href="tel:108" className="emergency-number-item emergency-number-item--teal">
              <span className="emergency-number">108</span>
              <span className="emergency-number-label">Ambulance</span>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
