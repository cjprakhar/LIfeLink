import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="cc-footer" role="contentinfo">
      <div className="cc-footer-inner">
        <div className="cc-footer-brand">
          <div className="cc-footer-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span>CareConnect</span>
          </div>
          <p className="cc-footer-tagline">
            Emergency healthcare and assistance, connected.
          </p>
        </div>

        <div className="cc-footer-links">
          <div className="cc-footer-col">
            <h4>Services</h4>
            <Link to="/ambulance">Book Ambulance</Link>
            <Link to="/hospitals">Find Hospitals</Link>
            <Link to="/triage">AI Triage</Link>
            <Link to="/emergency">Emergency</Link>
          </div>
          <div className="cc-footer-col">
            <h4>Account</h4>
            <Link to="/profile">Profile</Link>
            <Link to="/history">History</Link>
          </div>
        </div>
      </div>

      <div className="cc-footer-bottom">
        <div className="cc-footer-bottom-inner">
          <div className="cc-footer-disclaimer">
            <Shield size={13} />
            <span>
              CareConnect is not a substitute for emergency services. In a life-threatening situation,
              always call your local emergency number immediately.
            </span>
          </div>
          <span className="cc-footer-copy">© {new Date().getFullYear()} CareConnect</span>
        </div>
      </div>
    </footer>
  )
}
