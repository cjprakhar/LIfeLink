import { useState, useEffect, useCallback } from 'react'
import { Truck, MapPin, RefreshCw, CheckCircle, AlertCircle, Activity } from 'lucide-react'
import Footer from '../components/Footer'

const API_ROOT = 'http://localhost:5000/api'

export default function Ambulance() {
  const [ambulances, setAmbulances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAmbulances = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_ROOT}/ambulances`)
      if (!res.ok) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      setAmbulances(data.ambulances || [])
    } catch (err) {
      setError(err.message || 'Unable to load ambulances.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAmbulances()
  }, [fetchAmbulances])

  const available = ambulances.filter((a) => a.isAvailable)
  const dispatched = ambulances.filter((a) => !a.isAvailable)

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-hero page-hero--teal">
        <div className="section-inner">
          <div className="page-hero-content">
            <div className="page-hero-icon"><Truck size={28} /></div>
            <div>
              <h1 className="page-title">Ambulance Services</h1>
              <p className="page-subtitle">
                Use the SOS button below to request emergency transport. Available units are shown here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-inner page-body">
        {/* SOS instruction card */}
        <div className="ambulance-sos-card">
          <div className="ambulance-sos-card-icon">
            <AlertCircle size={24} />
          </div>
          <div className="ambulance-sos-card-text">
            <h2>Need an ambulance now?</h2>
            <p>
              Tap the red <strong>SOS</strong> button at the bottom-left of your screen. Your location
              will be automatically detected and the nearest available ambulance will be dispatched.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="ambulance-metrics">
          <div className="amb-metric amb-metric--good">
            <CheckCircle size={20} />
            <span className="amb-metric-value">{loading ? '—' : available.length}</span>
            <span className="amb-metric-label">Available</span>
          </div>
          <div className="amb-metric amb-metric--info">
            <Truck size={20} />
            <span className="amb-metric-value">{loading ? '—' : dispatched.length}</span>
            <span className="amb-metric-label">Dispatched</span>
          </div>
          <div className="amb-metric amb-metric--neutral">
            <Activity size={20} />
            <span className="amb-metric-value">{loading ? '—' : ambulances.length}</span>
            <span className="amb-metric-label">Total Fleet</span>
          </div>
        </div>

        {/* Fleet list */}
        <div className="ambulance-section-header">
          <h2 className="ambulance-section-title">Fleet Status</h2>
          <button type="button" className="cc-btn-ghost" onClick={fetchAmbulances} disabled={loading} aria-label="Refresh ambulance list">
            <RefreshCw size={15} className={loading ? 'spin-slow' : ''} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="cc-alert cc-alert--error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading && !error && (
          <div className="cc-loading-state">
            <RefreshCw size={24} className="spin-slow" />
            <span>Loading fleet status…</span>
          </div>
        )}

        {!loading && !error && ambulances.length === 0 && (
          <div className="cc-empty-state">
            <Truck size={36} />
            <h3>No fleet data</h3>
            <p>The backend may be unavailable. Try refreshing.</p>
          </div>
        )}

        {!loading && ambulances.length > 0 && (
          <div className="ambulance-grid">
            {ambulances.map((amb) => (
              <div
                key={amb.id}
                className={`ambulance-card ${amb.isAvailable ? 'ambulance-card--available' : 'ambulance-card--dispatched'}`}
              >
                <div className="ambulance-card-header">
                  <div className="ambulance-card-unit">
                    <Truck size={16} />
                    <span>{amb.unitNumber || amb.id}</span>
                  </div>
                  <span className={`ambulance-availability ${amb.isAvailable ? 'available' : 'unavailable'}`}>
                    {amb.isAvailable ? 'Available' : 'Dispatched'}
                  </span>
                </div>
                <div className="ambulance-card-body">
                  {amb.driverName && (
                    <div className="ambulance-detail">
                      <span className="ambulance-detail-label">Driver</span>
                      <span className="ambulance-detail-value">{amb.driverName}</span>
                    </div>
                  )}
                  {amb.equipmentLevel && (
                    <div className="ambulance-detail">
                      <span className="ambulance-detail-label">Level</span>
                      <span className="ambulance-detail-value">{amb.equipmentLevel}</span>
                    </div>
                  )}
                  {amb.baseStation && (
                    <div className="ambulance-detail">
                      <span className="ambulance-detail-label">Base</span>
                      <span className="ambulance-detail-value">{amb.baseStation}</span>
                    </div>
                  )}
                  {amb.phone && (
                    <div className="ambulance-detail">
                      <span className="ambulance-detail-label">Contact</span>
                      <span className="ambulance-detail-value">{amb.phone}</span>
                    </div>
                  )}
                  <div className="ambulance-detail">
                    <span className="ambulance-detail-label">Position</span>
                    <span className="ambulance-detail-value ambulance-detail-mono">
                      <MapPin size={12} />
                      {Number(amb.latitude).toFixed(4)}, {Number(amb.longitude).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
