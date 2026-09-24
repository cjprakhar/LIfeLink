import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AlertTriangle, User, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Home', exact: true },
    { to: '/ambulance', label: 'Ambulance' },
    { to: '/hospitals', label: 'Hospitals' },
    { to: '/triage', label: 'AI Triage' },
    { to: '/history', label: 'History' },
    { to: '/ops', label: 'Operations' },
  ]

  function isActive(link) {
    if (link.exact) return location.pathname === link.to
    return location.pathname.startsWith(link.to)
  }

  return (
    <header className="cc-navbar" role="banner">
      <div className="cc-navbar-inner">
        {/* Logo */}
        <Link to="/" className="cc-navbar-logo" aria-label="CareConnect Home">
          <div className="cc-logo-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="cc-logo-text">CareConnect</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="cc-navbar-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={`cc-nav-link ${isActive(link) ? 'cc-nav-link--active' : ''}`}
              aria-current={isActive(link) ? 'page' : undefined}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="cc-navbar-right">
          <Link to="/profile" className="cc-nav-icon-btn" aria-label="Profile">
            <User size={18} />
          </Link>
          <Link to="/ambulance" className="cc-sos-nav-btn" aria-label="Emergency SOS">
            <AlertTriangle size={15} />
            <span>SOS</span>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="cc-hamburger"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="cc-mobile-menu" role="navigation" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`cc-mobile-link ${isActive(link) ? 'cc-mobile-link--active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/ambulance" className="cc-sos-nav-btn cc-sos-mobile-btn" onClick={() => setMobileOpen(false)}>
            <AlertTriangle size={16} />
            Emergency SOS
          </Link>
        </div>
      )}
    </header>
  )
}
