import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  X,
  Loader2,
  SendHorizonal,
  MapPin,
  Truck,
  PhoneCall,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  User as UserIcon
} from 'lucide-react'

const SOS_API = 'http://localhost:5000/api/sos'
const USER_ID_KEY = 'lifelink.tempUserId'

function getOrCreateUserId() {
  try {
    const existing = localStorage.getItem(USER_ID_KEY)
    if (existing) return existing
  } catch {
    // localStorage may be unavailable (private mode / disabled storage)
  }
  const id = 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
  try {
    localStorage.setItem(USER_ID_KEY, id)
  } catch {
    // localStorage may be unavailable (private mode / disabled storage)
  }
  return id
}

export default function SOSPanel() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('idle') // idle | locating | loc-error | confirm | sending | sent | send-error
  const [userId] = useState(() => getOrCreateUserId())
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [description, setDescription] = useState('')
  const [sendError, setSendError] = useState(null)
  const [sentAlert, setSentAlert] = useState(null)

  useEffect(() => {
    if (!open) return
    if (step === 'confirm' || step === 'sent' || step === 'send-error' || step === 'loc-error') return
    if (latitude != null && longitude != null) {
      setStep('confirm')
      return
    }
    requestLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function requestLocation() {
    setStep('locating')
    setLocationError(null)
    if (!navigator || !navigator.geolocation) {
      setLocationError(
        'Geolocation is not supported by this browser. Please use a modern browser or enable location services.'
      )
      setStep('loc-error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setStep('confirm')
      },
      (err) => {
        let message = 'Unable to determine your location.'
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message =
              'Location permission was denied. Please enable location access for this site in your browser settings, then try again.'
            break
          case err.POSITION_UNAVAILABLE:
            message =
              'Location information is unavailable. Ensure GPS / network location is enabled on your device.'
            break
          case err.TIMEOUT:
            message = 'Location request timed out. Please try again.'
            break
        }
        setLocationError(message)
        setStep('loc-error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  function resetAll() {
    setLatitude(null)
    setLongitude(null)
    setLocationError(null)
    setDescription('')
    setSendError(null)
    setSentAlert(null)
    setStep('idle')
    setOpen(false)
  }

  function goBackToConfirm() {
    setSendError(null)
    setStep('confirm')
  }

  async function submitSOS() {
    if (latitude == null || longitude == null) {
      setLocationError('Location is required to send SOS.')
      setStep('loc-error')
      return
    }
    setStep('sending')
    setSendError(null)
    try {
      const payload = {
        userId,
        latitude: Number(latitude),
        longitude: Number(longitude)
      }
      const desc = description.trim()
      if (desc) payload.description = desc

      const res = await fetch(SOS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Request failed (status ${res.status}).`)
      }
      if (!data.alert) {
        throw new Error('Server did not return SOS alert information.')
      }
      setSentAlert(data.alert)
      setStep('sent')
    } catch (err) {
      setSendError(
        err.message ||
          'Unable to contact LifeLink backend. Ensure the server is running at http://localhost:5000 and try again.'
      )
      setStep('send-error')
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setStep('idle')
          setSendError(null)
          setLocationError(null)
          setSentAlert(null)
        }}
        className="sos-fab"
        aria-label="Send SOS emergency"
        title="Trigger emergency SOS"
      >
        <span className="sos-fab-pulse" aria-hidden="true" />
        <span className="sos-fab-pulse sos-fab-pulse-2" aria-hidden="true" />
        <div className="sos-fab-icon">
          <AlertTriangle size={28} strokeWidth={2.6} />
          <span className="sos-fab-label">SOS</span>
        </div>
      </button>
    )
  }

  return (
    <div className="sos-panel-overlay" onClick={resetAll}>
      <aside className="sos-panel" onClick={(e) => e.stopPropagation()}>
        <header className="sos-panel-header">
          <div className="sos-panel-title">
            <div className={`sos-icon-wrap ${step === 'sending' || step === 'locating' ? 'spin' : ''}`}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3>Emergency SOS</h3>
              <p>Dispatch the nearest available ambulance</p>
            </div>
          </div>
          <button
            type="button"
            className="sos-close"
            onClick={resetAll}
            aria-label="Close SOS panel"
          >
            <X size={18} />
          </button>
        </header>

        <div className="sos-banner">
          <PhoneCall size={14} />
          <span>
            If this is a life-threatening emergency, <strong>call emergency services</strong> in addition to using this system.
          </span>
        </div>

        <div className="sos-body">
          {step === 'locating' && (
            <div className="sos-state">
              <Loader2 size={44} className="spinner" />
              <h4>Acquiring your location…</h4>
              <p>
                Please allow location access when prompted. High-accuracy mode is used to ensure the
                fastest possible dispatch.
              </p>
              <div className="sos-user-id">
                <UserIcon size={14} />
                <span className="label">Your ID</span>
                <span className="mono">{userId}</span>
              </div>
            </div>
          )}

          {step === 'loc-error' && (
            <div className="sos-state">
              <div className="sos-badgem warn">
                <AlertTriangle size={26} />
              </div>
              <h4>Location unavailable</h4>
              <p className="sos-err-text">{locationError}</p>
              <div className="sos-actions">
                <button type="button" className="sos-btn ghost" onClick={requestLocation}>
                  <MapPin size={16} />
                  Retry location
                </button>
                <button type="button" className="sos-btn danger secondary" onClick={resetAll}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="sos-form">
              <div className="sos-coords-card">
                <div className="sos-coords-head">
                  <MapPin size={16} />
                  <span>Location detected</span>
                </div>
                <div className="sos-coords">
                  <span className="mono">{Number(latitude).toFixed(6)}</span>
                  <span className="sos-coords-sep">,</span>
                  <span className="mono">{Number(longitude).toFixed(6)}</span>
                </div>
              </div>

              <label className="sos-field">
                <span className="sos-field-label">
                  Emergency details <span className="sos-optional">(optional)</span>
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the emergency: injuries, symptoms, number of people, hazards, access notes…"
                  rows={4}
                  maxLength={500}
                />
                <div className="sos-count">{description.length}/500</div>
              </label>

              <div className="sos-user-id">
                <UserIcon size={14} />
                <span className="label">User ID</span>
                <span className="mono">{userId}</span>
              </div>

              <div className="sos-confirm-note">
                <AlertTriangle size={14} />
                <span>
                  Confirming will broadcast your location and dispatch the nearest available ambulance.
                </span>
              </div>

              <div className="sos-actions">
                <button
                  type="button"
                  className="sos-btn danger primary"
                  onClick={submitSOS}
                  disabled={latitude == null || longitude == null}
                >
                  <SendHorizonal size={16} />
                  Send SOS now
                </button>
                <button
                  type="button"
                  className="sos-btn ghost"
                  onClick={requestLocation}
                >
                  <ChevronLeft size={16} />
                  Re-check location
                </button>
              </div>
            </div>
          )}

          {step === 'sending' && (
            <div className="sos-state">
              <Loader2 size={44} className="spinner" />
              <h4>Broadcasting SOS…</h4>
              <p>Alerting nearby units and transmitting your exact coordinates.</p>
            </div>
          )}

          {step === 'send-error' && (
            <div className="sos-state">
              <div className="sos-badgem bad">
                <AlertTriangle size={26} />
              </div>
              <h4>Could not send SOS</h4>
              <p className="sos-err-text">{sendError}</p>
              <p className="sos-hint">
                If you need immediate help, call emergency services right now.
              </p>
              <div className="sos-actions">
                <button type="button" className="sos-btn danger primary" onClick={submitSOS}>
                  <SendHorizonal size={16} />
                  Try again
                </button>
                <button type="button" className="sos-btn ghost" onClick={goBackToConfirm}>
                  <ChevronLeft size={16} />
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 'sent' && sentAlert && (
            <div className="sos-state">
              <div className="sos-badgem good">
                <CheckCircle2 size={26} />
              </div>
              <h4>SOS sent successfully</h4>

              <div className="sos-result-grid">
                <div className="sos-result-item">
                  <span className="label">SOS ID</span>
                  <span className="value mono">{sentAlert.id}</span>
                </div>
                <div className="sos-result-item">
                  <span className="label">Status</span>
                  <span className={`value status status-${sentAlert.status || 'pending'}`}>
                    {(sentAlert.status || 'pending').toUpperCase()}
                  </span>
                </div>
                <div className="sos-result-item">
                  <span className="label">Coordinates</span>
                  <span className="value mono">
                    {Number(sentAlert.latitude).toFixed(4)},{' '}
                    {Number(sentAlert.longitude).toFixed(4)}
                  </span>
                </div>
                {sentAlert.timestamp && (
                  <div className="sos-result-item">
                    <span className="label">Sent at</span>
                    <span className="value mono">
                      {new Date(sentAlert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              {sentAlert.ambulance ? (
                <div className="sos-ambulance-card">
                  <div className="sos-ambulance-head">
                    <Truck size={16} />
                    <strong>Ambulance dispatched</strong>
                    <span className="sos-distance">
                      {Number(sentAlert.ambulance.distanceKm).toFixed(2)} km away
                    </span>
                  </div>
                  <div className="sos-result-grid">
                    {sentAlert.ambulance.unitNumber && (
                      <div className="sos-result-item">
                        <span className="label">Unit</span>
                        <span className="value mono">{sentAlert.ambulance.unitNumber}</span>
                      </div>
                    )}
                    <div className="sos-result-item">
                      <span className="label">Unit ID</span>
                      <span className="value mono">{sentAlert.ambulance.id}</span>
                    </div>
                    {sentAlert.ambulance.driverName && (
                      <div className="sos-result-item">
                        <span className="label">Driver</span>
                        <span className="value">{sentAlert.ambulance.driverName}</span>
                      </div>
                    )}
                    {sentAlert.ambulance.equipmentLevel && (
                      <div className="sos-result-item">
                        <span className="label">Level</span>
                        <span className="value">{sentAlert.ambulance.equipmentLevel}</span>
                      </div>
                    )}
                    {sentAlert.ambulance.phone && (
                      <div className="sos-result-item">
                        <span className="label">Contact</span>
                        <span className="value mono">{sentAlert.ambulance.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="sos-warn-card">
                  <AlertTriangle size={16} />
                  <span>
                    No available ambulance has been auto-assigned yet. Operators are reviewing your
                    alert and will contact you.
                  </span>
                </div>
              )}

              <div className="sos-actions">
                <button type="button" className="sos-btn ghost" onClick={resetAll}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
