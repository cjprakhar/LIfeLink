import { useState, useEffect, useCallback } from 'react'
import { History as HistoryIcon, MapPin, Clock, Truck, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import Footer from '../components/Footer'

const API_ROOT = 'http://localhost:5000/api'
const USER_ID_KEY = 'lifelink.tempUserId'

function getStoredUserId() {
  try { return localStorage.getItem(USER_ID_KEY) || null } catch { return null }
}

export default function History() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const userId = getStoredUserId()

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_ROOT}/sos-alerts`)
      if (!res.ok) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      const allAlerts = data.alerts || []
      // Filter to current user's alerts
      const mine = userId
        ? allAlerts.filter((a) => a.userId === userId)
        : allAlerts
      setAlerts(mine)
    } catch (err) {
      setError(err.message || 'Unable to load history.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <div className="page-container">
      <div className="page-hero page-hero--soft">
        <div className="section-inner">
          <div className="page-hero-content">
            <div className="page-hero-icon page-hero-icon--navy"><HistoryIcon size={28} /></div>
            <div>
              <h1 className="page-title">Request History</h1>
              <p className="page-subtitle">Your past emergency requests and their outcomes.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-inner page-body">
        <div className="history-list-header">
          <h2 className="history-list-title">
            {userId ? 'Your Requests' : 'All Requests'}
          </h2>
          <button type="button" className="cc-btn-ghost" onClick={fetchHistory} disabled={loading} aria-label="Refresh history">
            <RefreshCw size={15} className={loading ? 'spin-slow' : ''} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="cc-loading-state">
            <Loader2 size={28} className="spin-slow" />
            <span>Loading your history…</span>
          </div>
        )}

        {error && (
          <div className="cc-alert cc-alert--error">
            <AlertCircle size={16} />
            <span>{error} — Make sure the backend is running.</span>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="cc-empty-state">
            <HistoryIcon size={40} />
            <h3>No requests yet</h3>
            <p>
              {userId
                ? 'You have not submitted any SOS requests from this device.'
                : 'No emergency requests have been recorded.'}
            </p>
          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div className="history-list">
            {alerts.map((alert) => (
              <div key={alert.id} className="history-card">
                <div className="history-card-header">
                  <div className="history-card-date">
                    <Clock size={14} />
                    {alert.timestamp
                      ? new Date(alert.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                      : '—'}
                  </div>
                  <StatusBadge status={alert.status || 'pending'} />
                </div>
                <div className="history-card-body">
                  <div className="history-detail">
                    <MapPin size={14} />
                    <span>
                      {Number.isFinite(Number(alert.latitude))
                        ? `${Number(alert.latitude).toFixed(4)}, ${Number(alert.longitude).toFixed(4)}`
                        : 'Location unavailable'}
                    </span>
                  </div>
                  {alert.ambulanceId && (
                    <div className="history-detail">
                      <Truck size={14} />
                      <span>Ambulance assigned</span>
                    </div>
                  )}
                  {alert.description && (
                    <p className="history-description">"{alert.description}"</p>
                  )}
                </div>
                <div className="history-card-id">
                  ID: <span className="history-mono">{alert.id}</span>
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
