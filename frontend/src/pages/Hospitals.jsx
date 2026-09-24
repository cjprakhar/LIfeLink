import { Building2, Search, MapPin, Phone, AlertCircle, Info } from 'lucide-react'
import Footer from '../components/Footer'

const FILTERS = ['All', 'Hospital', 'Clinic', 'Emergency', 'Specialty']

export default function Hospitals() {
  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-hero page-hero--navy">
        <div className="section-inner">
          <div className="page-hero-content">
            <div className="page-hero-icon"><Building2 size={28} /></div>
            <div>
              <h1 className="page-title">Find Healthcare Near You</h1>
              <p className="page-subtitle">
                Locate hospitals, clinics, and emergency facilities in your area.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-inner page-body">
        {/* Search */}
        <div className="hospitals-search-bar">
          <Search size={18} className="hospitals-search-icon" />
          <input
            type="search"
            placeholder="Search hospitals, clinics, or specialties…"
            className="hospitals-search-input"
            aria-label="Search healthcare facilities"
          />
        </div>

        {/* Filters */}
        <div className="hospitals-filters" role="group" aria-label="Facility type filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`hospitals-filter-btn ${f === 'All' ? 'hospitals-filter-btn--active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Info banner */}
        <div className="cc-alert cc-alert--info">
          <Info size={16} />
          <span>
            Hospital directory integration is coming soon. This page will display verified healthcare
            facilities near your location.
          </span>
        </div>

        {/* Layout preview */}
        <div className="hospitals-layout">
          <div className="hospitals-list">
            {/* Empty state */}
            <div className="cc-empty-state">
              <Building2 size={40} />
              <h3>No facilities listed yet</h3>
              <p>
                Healthcare facility data will be populated here once the directory service is connected.
                In an emergency, please call 112.
              </p>
            </div>
          </div>

          <div className="hospitals-map-panel">
            <div className="hospitals-map-placeholder">
              <MapPin size={32} />
              <span>Map will show nearby facilities</span>
              <p className="hospitals-map-hint">
                Location-based facility search will be available when the directory service launches.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency callout */}
        <div className="hospitals-emergency-callout">
          <AlertCircle size={20} />
          <div>
            <strong>Medical emergency?</strong>
            <p>Don't wait. Use the SOS button below or call 112 for immediate emergency assistance.</p>
          </div>
          <div className="hospitals-callout-numbers">
            <a href="tel:112" className="callout-number">
              <Phone size={14} /> 112
            </a>
            <a href="tel:108" className="callout-number callout-number--teal">
              <Phone size={14} /> 108 Ambulance
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
