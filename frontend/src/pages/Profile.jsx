import { User, Phone, Shield, Settings, Info } from 'lucide-react'
import Footer from '../components/Footer'

const USER_ID_KEY = 'lifelink.tempUserId'

function getStoredUserId() {
  try { return localStorage.getItem(USER_ID_KEY) || null } catch { return null }
}

export default function Profile() {
  const userId = getStoredUserId()

  return (
    <div className="page-container">
      <div className="page-hero page-hero--soft">
        <div className="section-inner">
          <div className="page-hero-content">
            <div className="page-hero-icon page-hero-icon--navy"><User size={28} /></div>
            <div>
              <h1 className="page-title">Your Profile</h1>
              <p className="page-subtitle">Manage your personal information and emergency preferences.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-inner page-body">
        {/* Identity card */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <User size={18} />
            <h2>Personal Information</h2>
          </div>
          <div className="profile-field">
            <span className="profile-field-label">Device ID</span>
            <span className="profile-field-value profile-field-mono">{userId || 'Not set'}</span>
          </div>
          <div className="profile-field">
            <span className="profile-field-label">Name</span>
            <span className="profile-field-value profile-field-placeholder">Not configured</span>
          </div>
          <div className="profile-field">
            <span className="profile-field-label">Phone</span>
            <span className="profile-field-value profile-field-placeholder">Not configured</span>
          </div>
          <div className="cc-alert cc-alert--info profile-alert">
            <Info size={14} />
            <span>
              Full profile management including authentication and name storage is coming in a future update.
            </span>
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <Phone size={18} />
            <h2>Emergency Contacts</h2>
          </div>
          <div className="cc-empty-state profile-empty">
            <Phone size={28} />
            <h3>No contacts added</h3>
            <p>Emergency contact management will be available in a future update.</p>
          </div>
        </div>

        {/* Emergency numbers */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <Shield size={18} />
            <h2>Emergency Numbers</h2>
          </div>
          <div className="emergency-numbers-grid">
            <a href="tel:112" className="emergency-number-item">
              <span className="emergency-number">112</span>
              <span className="emergency-number-label">National Emergency</span>
            </a>
            <a href="tel:108" className="emergency-number-item emergency-number-item--teal">
              <span className="emergency-number">108</span>
              <span className="emergency-number-label">Ambulance (India)</span>
            </a>
            <a href="tel:101" className="emergency-number-item emergency-number-item--red">
              <span className="emergency-number">101</span>
              <span className="emergency-number-label">Fire</span>
            </a>
            <a href="tel:100" className="emergency-number-item emergency-number-item--blue">
              <span className="emergency-number">100</span>
              <span className="emergency-number-label">Police</span>
            </a>
          </div>
        </div>

        {/* Preferences */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <Settings size={18} />
            <h2>Preferences</h2>
          </div>
          <div className="cc-alert cc-alert--info profile-alert">
            <Info size={14} />
            <span>Notification and location preferences will be configurable in a future update.</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
