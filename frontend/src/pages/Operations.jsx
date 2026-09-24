import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import {
  AlertTriangle,
  Truck,
  Clock,
  MapPin,
  User as UserIcon,
  Radio,
  Activity,
  CheckCircle2,
  Loader2,
  Play,
  Square,
  Zap,
  RefreshCw
} from 'lucide-react'
import TriageChat from '../components/TriageChat'
import SOSPanel from '../components/SOSPanel'
import '../App.css'

const DEFAULT_CENTER = [13.0358, 77.597]
const DEFAULT_ZOOM = 12
const INDIA_MAP_BOUNDS = [[6, 68], [37, 98]]
const INDIA_REGION = {
  minLat: Number(import.meta.env.VITE_INDIA_MIN_LAT || 8),
  maxLat: Number(import.meta.env.VITE_INDIA_MAX_LAT || 35),
  minLng: Number(import.meta.env.VITE_INDIA_MIN_LNG || 68),
  maxLng: Number(import.meta.env.VITE_INDIA_MAX_LNG || 90)
}
const LOCATION_API_ROOT = 'http://localhost:5000/api'
const SIMULATION_INTERVAL_MS = 800
const SIMULATION_STEP_RATIO = 0.08
const STOP_DISTANCE_METERS = 50

const sosIcon = L.divIcon({
  className: 'custom-marker sos-marker',
  html: `<div style="background:#dc2626;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(220,38,38,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

const ambulanceIcon = L.divIcon({
  className: 'custom-marker ambulance-marker',
  html: `<div style="background:#2563eb;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(37,99,235,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

const completedIcon = L.divIcon({
  className: 'custom-marker completed-marker',
  html: `<div style="background:#16a34a;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px rgba(22,163,74,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
})

const enRouteIcon = L.divIcon({
  className: 'custom-marker enroute-marker',
  html: `<div style="background:#f59e0b;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(245,158,11,0.2);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

function isInSupportedRegion(item) {
  const lat = Number(item?.latitude)
  const lng = Number(item?.longitude)
  return (
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= INDIA_REGION.minLat && lat <= INDIA_REGION.maxLat &&
    lng >= INDIA_REGION.minLng && lng <= INDIA_REGION.maxLng
  )
}

function MapAutoFit({ alerts, ambulances }) {
  const map = useMap()
  const didInit = useRef(false)
  const lastFitKey = useRef('')

  useEffect(() => {
    const all = []
    alerts.forEach((a) => {
      const lat = Number(a.latitude)
      const lng = Number(a.longitude)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) all.push([lat, lng])
    })
    ambulances.filter(isInSupportedRegion).forEach((a) => {
      const lat = Number(a.latitude)
      const lng = Number(a.longitude)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) all.push([lat, lng])
    })
    const fitKey = all.map(([lat, lng]) => `${lat.toFixed(4)},${lng.toFixed(4)}`).join('|')
    if (all.length === 0) {
      if (!didInit.current) map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      didInit.current = true
      return
    }
    if (fitKey === lastFitKey.current) return
    lastFitKey.current = fitKey
    if (all.length === 1) {
      map.setView(all[0], Math.max(map.getZoom(), 14), { animate: true })
      return
    }
    map.fitBounds(all, { padding: [60, 60], maxZoom: 15 })
  }, [alerts, ambulances, map])

  return null
}

function statusLabel(status) {
  switch (status) {
    case 'en-route':
      return 'En route'
    case 'dispatched':
      return 'Dispatched'
    case 'completed':
      return 'Completed'
    case 'pending':
    default:
      return 'Pending'
  }
}

function statusPillClass(status) {
  switch (status) {
    case 'en-route':
      return 'status-enroute'
    case 'completed':
      return 'status-completed'
    case 'dispatched':
      return 'status-dispatched'
    case 'pending':
    default:
      return 'status-pending'
  }
}

function ambulanceMarkerFor(ambulance, dispatchStatus) {
  if (dispatchStatus === 'completed') return completedIcon
  if (dispatchStatus === 'en-route') return enRouteIcon
  return ambulanceIcon
}

function metersBetween(aLat, aLng, bLat, bLng) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
}

function Operations() {
  const [sosAlerts, setSosAlerts] = useState([])
  const [dispatchedAmbulances, setDispatchedAmbulances] = useState([])
  const [allAmbulances, setAllAmbulances] = useState([])
  const [dispatches, setDispatches] = useState([])
  const [ambulanceLiveDistance, setAmbulanceLiveDistance] = useState({})
  const dispatchesRef = useRef([])
  const simTimersRef = useRef({})
  const allAmbulancesRef = useRef([])
  const dispatchedAmbulancesRef = useRef([])
  const [pendingControls, setPendingControls] = useState({})
  const [controlErrors, setControlErrors] = useState({})
  const [simulating, setSimulating] = useState({})
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  // Refs are kept synchronously in-sync inside the setter callbacks below.
  // This avoids the one-tick stale window that a separate useEffect would introduce.
  const [connected, setConnected] = useState(false)
  const [initialStateLoaded, setInitialStateLoaded] = useState(false)

  useEffect(() => {
    const socket = io('http://localhost:5000')

    function upsertAlert(prev, incoming) {
      if (!incoming) return prev
      const next = prev.filter((a) => a.id !== incoming.id)
      return [incoming, ...next]
    }

    function upsertAmbulance(prev, incoming) {
      if (!incoming || !incoming.id) return prev
      const next = prev.filter((a) => a.id !== incoming.id)
      return [incoming, ...next]
    }

    function upsertDispatch(prev, incoming) {
      if (!incoming || !incoming.id) return prev
      const next = prev.filter((d) => d.id !== incoming.id)
      return [incoming, ...next]
    }

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('initial-state', ({ ambulances = [], alerts = [], dispatches: inDispatches = [] }) => {
      allAmbulancesRef.current = ambulances
      setAllAmbulances(ambulances)
      setSosAlerts(alerts)
      dispatchesRef.current = inDispatches
      setDispatches(inDispatches)

      const dispatchedIds = new Set(
        inDispatches
          .filter((d) => d.status !== 'completed')
          .map((d) => d.ambulanceId)
      )
      const activeAmbs = alerts
        .filter((a) => a.ambulance)
        .map((a) => a.ambulance)
      const byId = new Map()
      activeAmbs.forEach((amb) => {
        if (amb && dispatchedIds.has(amb.id)) byId.set(amb.id, amb)
      })
      const dispatched = Array.from(byId.values())
      dispatchedAmbulancesRef.current = dispatched
      setDispatchedAmbulances(dispatched)
      setInitialStateLoaded(true)
    })

    socket.on('sos-alert', (payload) => {
      if (!payload) return
      setSosAlerts((prev) => upsertAlert(prev, payload))
      setDispatches((prev) => {
        if (!payload.dispatchId) return prev
        const dispatch = prev.find((d) => d.id === payload.dispatchId)
        if (dispatch) return prev
        const next = upsertDispatch(prev, {
          id: payload.dispatchId,
          alertId: payload.id,
          ambulanceId: payload.ambulanceId,
          userId: payload.userId,
          pickupLatitude: payload.latitude,
          pickupLongitude: payload.longitude,
          distanceKm: payload.ambulance?.distanceKm,
          status: payload.status || 'dispatched',
          createdAt: payload.timestamp
        })
        dispatchesRef.current = next
        return next
      })
      if (payload.ambulance && payload.status !== 'completed') {
        setDispatchedAmbulances((prev) => {
          const next = upsertAmbulance(prev, payload.ambulance)
          dispatchedAmbulancesRef.current = next
          return next
        })
      }
      if (payload.ambulance) {
        setAllAmbulances((prev) => {
          const exists = prev.some((a) => a.id === payload.ambulance.id)
          const next = !exists
            ? upsertAmbulance(prev, payload.ambulance)
            : prev.map((a) =>
                a.id === payload.ambulance.id ? { ...a, ...payload.ambulance } : a
              )
          allAmbulancesRef.current = next
          return next
        })
      }
    })

    socket.on('dispatch-updated', ({ dispatch, ambulance, alert }) => {
      if (dispatch) {
        setDispatches((prev) => {
          const next = upsertDispatch(prev, dispatch)
          dispatchesRef.current = next
          return next
        })
        // Merge status into the existing alert rather than replacing it,
        // so we never lose the enriched ambulance/dispatchId fields.
        setSosAlerts((prev) =>
          prev.map((a) =>
            a.id === dispatch.alertId
              ? { ...a, status: dispatch.status, dispatchId: dispatch.id }
              : a
          )
        )
      }
      if (alert) {
        // Merge the bare alert from the server with the existing enriched record.
        setSosAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id ? { ...a, ...alert } : a
          )
        )
      }
      if (ambulance) {
        setAllAmbulances((prev) => {
          const next = prev.map((a) => (a.id === ambulance.id ? { ...a, ...ambulance } : a))
          allAmbulancesRef.current = next
          return next
        })
        if (dispatch?.status === 'completed') {
          setDispatchedAmbulances((prev) => {
            const next = prev.filter((a) => a.id !== ambulance.id)
            dispatchedAmbulancesRef.current = next
            return next
          })
        } else {
          setDispatchedAmbulances((prev) => {
            const next = upsertAmbulance(prev, ambulance)
            dispatchedAmbulancesRef.current = next
            return next
          })
        }
      } else if (dispatch?.status === 'completed') {
        const related = dispatchesRef.current.find((d) => d.id === dispatch.id) || dispatch
        setDispatchedAmbulances((prev) => {
          const next = prev.filter((a) => a.id !== related.ambulanceId)
          dispatchedAmbulancesRef.current = next
          return next
        })
      }
    })

    socket.on('ambulance-location-updated', (amb) => {
      if (!amb || !amb.id) return
      setAllAmbulances((prev) => {
        const exists = prev.some((a) => a.id === amb.id)
        const next = !exists
          ? [amb, ...prev]
          : prev.map((a) =>
              a.id === amb.id ? { ...a, ...amb, _lastUpdatedAt: amb.updatedAt ?? Date.now() } : a
            )
        allAmbulancesRef.current = next
        return next
      })
      setDispatchedAmbulances((prev) => {
        const exists = prev.some((a) => a.id === amb.id)
        if (!exists) return prev
        const next = prev.map((a) =>
          a.id === amb.id ? { ...a, ...amb, _lastUpdatedAt: amb.updatedAt ?? Date.now() } : a
        )
        dispatchedAmbulancesRef.current = next
        return next
      })
      if (typeof amb.distanceKm === 'number') {
        setAmbulanceLiveDistance((prev) => ({ ...prev, [amb.id]: amb.distanceKm }))
      }
    })

    return () => {
      socket.disconnect()
      Object.values(simTimersRef.current).forEach((timer) => clearInterval(timer))
      simTimersRef.current = {}
    }
  }, [])

  function setPendingFor(key, value) {
    setPendingControls((prev) => ({ ...prev, [key]: value }))
  }

  function setErrorFor(key, value) {
    setControlErrors((prev) => ({ ...prev, [key]: value }))
  }

  async function acceptDispatch(dispatchId) {
    const key = `accept:${dispatchId}`
    setPendingFor(key, true)
    setErrorFor(key, null)
    try {
      const res = await fetch(`${LOCATION_API_ROOT}/dispatches/${dispatchId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`)
      setErrorFor(key, null)
    } catch (err) {
      setErrorFor(key, err.message || 'Failed to accept dispatch.')
    } finally {
      setPendingFor(key, false)
    }
  }

  async function completeDispatch(dispatchId) {
    const key = `complete:${dispatchId}`
    setPendingFor(key, true)
    setErrorFor(key, null)
    try {
      const res = await fetch(`${LOCATION_API_ROOT}/dispatches/${dispatchId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`)
      if (simTimersRef.current[dispatchId]) {
        clearInterval(simTimersRef.current[dispatchId])
        delete simTimersRef.current[dispatchId]
        setSimulating((prev) => {
          const next = { ...prev }
          delete next[dispatchId]
          return next
        })
      }
      setErrorFor(key, null)
    } catch (err) {
      setErrorFor(key, err.message || 'Failed to complete dispatch.')
    } finally {
      setPendingFor(key, false)
    }
  }

  async function sendAmbulanceLocationUpdate(ambulanceId, latitude, longitude) {
    return fetch(`${LOCATION_API_ROOT}/ambulances/${ambulanceId}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude })
    })
  }

  function startSimulation(dispatchId, alert, ambulance, pickupLat, pickupLng) {
    if (simTimersRef.current[dispatchId]) return
    setSimulating((prev) => ({ ...prev, [dispatchId]: true }))

    function getCurrentAmbulance() {
      const id = ambulance.id
      return (
        allAmbulancesRef.current.find((a) => a.id === id) ||
        dispatchedAmbulancesRef.current.find((a) => a.id === id) ||
        ambulance
      )
    }

    const step = () => {
      const currentAmbulance = getCurrentAmbulance()
      const ambLat = Number(currentAmbulance.latitude)
      const ambLng = Number(currentAmbulance.longitude)
      if (Number.isNaN(ambLat) || Number.isNaN(ambLng)) return
      const distMeters = metersBetween(ambLat, ambLng, pickupLat, pickupLng)
      if (distMeters < STOP_DISTANCE_METERS) {
        clearInterval(simTimersRef.current[dispatchId])
        delete simTimersRef.current[dispatchId]
        setSimulating((prev) => {
          const next = { ...prev }
          delete next[dispatchId]
          return next
        })
        return
      }
      const nextLat = ambLat + (pickupLat - ambLat) * SIMULATION_STEP_RATIO
      const nextLng = ambLng + (pickupLng - ambLng) * SIMULATION_STEP_RATIO
      sendAmbulanceLocationUpdate(ambulance.id, nextLat, nextLng).catch(() => {})
    }

    const starting = getCurrentAmbulance()
    const distMeters = metersBetween(
      Number(starting.latitude),
      Number(starting.longitude),
      pickupLat,
      pickupLng
    )
    if (distMeters < STOP_DISTANCE_METERS) {
      setSimulating((prev) => {
        const next = { ...prev }
        delete next[dispatchId]
        return next
      })
      return
    }
    step()
    simTimersRef.current[dispatchId] = setInterval(step, SIMULATION_INTERVAL_MS)
  }

  function stopSimulation(dispatchId) {
    if (simTimersRef.current[dispatchId]) {
      clearInterval(simTimersRef.current[dispatchId])
      delete simTimersRef.current[dispatchId]
    }
    setSimulating((prev) => {
      const next = { ...prev }
      delete next[dispatchId]
      return next
    })
  }

  const visibleAlerts = sosAlerts.filter(isInSupportedRegion)
  const activeAlerts = visibleAlerts.filter((alert) => (alert.status || 'pending') !== 'completed')
  const visibleDispatchedAmbulances = dispatchedAmbulances.filter(isInSupportedRegion)
  const metrics = [
    { label: 'Active emergencies', value: activeAlerts.length, tone: 'danger' },
    { label: 'Available units', value: allAmbulances.filter((amb) => amb.isAvailable && isInSupportedRegion(amb)).length, tone: 'good' },
    { label: 'Dispatched', value: dispatches.filter((dispatch) => dispatch.status === 'dispatched').length, tone: 'blue' },
    { label: 'En route', value: dispatches.filter((dispatch) => dispatch.status === 'en-route').length, tone: 'warn' },
    { label: 'Completed', value: dispatches.filter((dispatch) => dispatch.status === 'completed').length, tone: 'muted' }
  ]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <Activity size={26} strokeWidth={2.4} />
          <div>
            <h1>CareConnect Operations</h1>
            <p className="subtitle">Emergency Operations · Bengaluru Region</p>
          </div>
        </div>
        <div className="header-right">
          <Link to="/" className="ctrl-btn ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
            ← Patient Portal
          </Link>
          {!initialStateLoaded && connected && (
            <div className="status-chip syncing" title="Receiving initial state…">
              <Loader2 size={14} className="spinner" />
              <span>Syncing…</span>
            </div>
          )}
          <div
            className={`status-chip ${connected ? 'connected' : 'disconnected'}`}
            title={connected ? 'Socket.IO connected' : 'Socket.IO disconnected — backend may be unavailable'}
          >
            <Radio size={14} />
            <span>{connected ? 'Backend live' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <section className="metrics-bar" aria-label="Operational summary">
        {metrics.map((metric) => (
          <div className={`metric metric-${metric.tone}`} key={metric.label}>
            <span className="metric-value">{metric.value}</span>
            <span className="metric-label">{metric.label}</span>
          </div>
        ))}
      </section>

      <div className="dashboard-body">
        <aside className="sidebar">
          <div className="sidebar-header">
            <AlertTriangle size={18} />
            <h2>Active Dispatches</h2>
            <span className="badge">{activeAlerts.length}</span>
          </div>

          <div className="sidebar-list">
            {!connected && visibleAlerts.length === 0 && (
              <div className="banner disconnected-banner">
                <Radio size={14} />
                <span>
                  Backend is unreachable. SOS submissions and live updates will be unavailable until it
                  returns.
                </span>
              </div>
            )}
            {visibleAlerts.length === 0 && connected && (
              <p className="empty">No emergencies. Waiting for SOS signals…</p>
            )}
            {visibleAlerts.map((alert) => {
              const dispatch = dispatches.find((d) => d.alertId === alert.id)
              const dispatchStatus = dispatch?.status || alert.status || 'pending'
              const alertAmb = alert.ambulance
                ? alert.ambulance
                : allAmbulances.find((a) => a.id === alert.ambulanceId) || null
              const liveDistanceKm = ambulanceLiveDistance[alertAmb?.id]
              const distanceKm =
                typeof liveDistanceKm === 'number'
                  ? liveDistanceKm
                  : (dispatch?.distanceKm ?? alertAmb?.distanceKm)
              const isActive = dispatchStatus === 'dispatched' || dispatchStatus === 'en-route'
              const acceptPending = dispatch?.id ? pendingControls[`accept:${dispatch.id}`] : false
              const completePending = dispatch?.id ? pendingControls[`complete:${dispatch.id}`] : false
              const acceptError = dispatch?.id ? controlErrors[`accept:${dispatch.id}`] : null
              const completeError = dispatch?.id ? controlErrors[`complete:${dispatch.id}`] : null
              const simActive = dispatch?.id ? Boolean(simulating[dispatch.id]) : false
              const canSimulate =
                isActive &&
                alertAmb &&
                dispatch &&
                Number.isFinite(Number(alert.latitude)) &&
                Number.isFinite(Number(alert.longitude))
              return (
                <article
                  key={alert.id || alert.timestamp}
                  className={`dispatch-card ${selectedAlertId === alert.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAlertId(alert.id)}
                >
                  <div className="dispatch-head">
                    <div className="pill sos">
                      <AlertTriangle size={12} />
                      SOS
                    </div>
                    <div className="time">
                      <Clock size={12} />
                      {alert.timestamp
                        ? new Date(alert.timestamp).toLocaleTimeString()
                        : '—'}
                    </div>
                  </div>

                  <div className="row">
                    <AlertTriangle size={14} />
                    <span className="label">SOS ID</span>
                    <span className="value mono">{alert.id}</span>
                  </div>
                  <div className="row">
                    <UserIcon size={14} />
                    <span className="label">User ID</span>
                    <span className="value mono">{alert.userId}</span>
                  </div>
                  <div className="row">
                    <MapPin size={14} />
                    <span className="label">Pickup</span>
                    <span className="value mono">
                      {Number.isFinite(Number(alert.latitude))
                        ? Number(alert.latitude).toFixed(4)
                        : '—'}
                      ,{' '}
                      {Number.isFinite(Number(alert.longitude))
                        ? Number(alert.longitude).toFixed(4)
                        : '—'}
                    </span>
                  </div>
                  <div className="row">
                    <Activity size={14} />
                    <span className="label">Status</span>
                    <span className={`value pill status-pill ${statusPillClass(dispatchStatus)}`}>
                      {statusLabel(dispatchStatus)}
                    </span>
                  </div>

                  {alert.description && (
                    <p className="description">“{alert.description}”</p>
                  )}

                  {alertAmb && dispatchStatus !== 'completed' ? (
                    <div className="ambulance-block">
                      <div className="dispatch-head mt">
                        <div className={`pill ${dispatchStatus === 'en-route' ? 'enroute' : 'amb'}`}>
                          <Truck size={12} />
                          {dispatchStatus === 'en-route' ? 'En route' : 'Dispatched'}
                        </div>
                        <div className="distance">
                          {typeof distanceKm === 'number'
                            ? `${distanceKm.toFixed(2)} km${typeof liveDistanceKm === 'number' ? ' (live)' : ''}`
                            : ''}
                        </div>
                      </div>
                      {alertAmb.unitNumber && (
                        <div className="row">
                          <Truck size={14} />
                          <span className="label">Unit</span>
                          <span className="value mono">{alertAmb.unitNumber}</span>
                        </div>
                      )}
                      <div className="row">
                        <Truck size={14} />
                        <span className="label">Unit ID</span>
                        <span className="value mono">{alertAmb.id}</span>
                      </div>
                      {alertAmb.driverName && (
                        <div className="row">
                          <UserIcon size={14} />
                          <span className="label">Driver</span>
                          <span className="value">{alertAmb.driverName}</span>
                        </div>
                      )}
                      {alertAmb.phone && (
                        <div className="row">
                          <Radio size={14} />
                          <span className="label">Contact</span>
                          <span className="value mono">{alertAmb.phone}</span>
                        </div>
                      )}
                      <div className="row">
                        <RefreshCw size={14} className={simActive ? 'spin-slow' : ''} />
                        <span className="label">Current pos</span>
                        <span className="value mono">
                          {Number(alertAmb.latitude).toFixed(4)},{' '}
                          {Number(alertAmb.longitude).toFixed(4)}
                        </span>
                      </div>

                      <div className="dispatch-controls">
                        {dispatch?.status === 'dispatched' && (
                          <button
                            type="button"
                            className="ctrl-btn primary"
                            disabled={acceptPending}
                            onClick={() => dispatch.id && acceptDispatch(dispatch.id)}
                          >
                            {acceptPending ? (
                              <Loader2 size={14} className="spinner" />
                            ) : (
                              <Play size={14} />
                            )}
                            Accept &amp; start
                          </button>
                        )}
                        {(dispatch?.status === 'en-route' ||
                          (dispatch?.status === 'dispatched' && acceptError === null && alertAmb)) && (
                          <>
                            {dispatch?.status === 'en-route' && (
                              <button
                                type="button"
                                className="ctrl-btn good"
                                disabled={completePending}
                                onClick={() => dispatch.id && completeDispatch(dispatch.id)}
                              >
                                {completePending ? (
                                  <Loader2 size={14} className="spinner" />
                                ) : (
                                  <CheckCircle2 size={14} />
                                )}
                                Complete
                              </button>
                            )}
                            {canSimulate && (
                              <>
                                {simActive ? (
                                  <button
                                    type="button"
                                    className="ctrl-btn warn"
                                    onClick={() => dispatch.id && stopSimulation(dispatch.id)}
                                  >
                                    <Square size={14} />
                                    Stop sim
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="ctrl-btn sim"
                                    onClick={() =>
                                      dispatch.id &&
                                      startSimulation(
                                        dispatch.id,
                                        alert,
                                        alertAmb,
                                        Number(alert.latitude),
                                        Number(alert.longitude)
                                      )
                                    }
                                  >
                                    <Zap size={14} />
                                    Simulate movement
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>

                      {acceptError && (
                        <p className="ctrl-error">
                          <AlertTriangle size={12} />
                          {acceptError}
                        </p>
                      )}
                      {completeError && (
                        <p className="ctrl-error">
                          <AlertTriangle size={12} />
                          {completeError}
                        </p>
                      )}
                      {canSimulate && simActive && (
                        <p className="ctrl-hint">
                          <RefreshCw size={12} className="spin-slow" />
                          Simulation is moving the ambulance toward the pickup point every{' '}
                          {SIMULATION_INTERVAL_MS} ms.
                        </p>
                      )}
                    </div>
                  ) : alertAmb && dispatchStatus === 'completed' ? (
                    <div className="ambulance-block completed-block">
                      <div className="dispatch-head mt">
                        <div className="pill good">
                          <CheckCircle2 size={12} />
                          Completed
                        </div>
                        {dispatch?.completedAt && (
                          <div className="distance done">
                            {new Date(dispatch.completedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : !alertAmb && dispatchStatus === 'pending' ? (
                    <p className="warn">
                      <AlertTriangle size={12} />
                      No ambulance available — manual review required
                    </p>
                  ) : null}
                </article>
              )
            })}
          </div>
        </aside>

        <main className="map-wrap">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            className="leaflet-map"
            scrollWheelZoom
            maxBounds={INDIA_MAP_BOUNDS}
            maxBoundsViscosity={0.85}
            worldCopyJump={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapAutoFit alerts={activeAlerts} ambulances={visibleDispatchedAmbulances} />

            {visibleAlerts.map((alert) => {
              const lat = Number(alert.latitude)
              const lng = Number(alert.longitude)
              if (Number.isNaN(lat) || Number.isNaN(lng)) return null
              const dispatch = dispatches.find((d) => d.alertId === alert.id)
              const status = dispatch?.status || alert.status || 'pending'
              const isCompleted = status === 'completed'
              return (
                <div key={`sos-${alert.id || alert.timestamp}`}>
                  {!isCompleted && (
                    <Circle
                      center={[lat, lng]}
                      radius={300}
                      pathOptions={{
                        color: '#dc2626',
                        fillColor: '#dc2626',
                        fillOpacity: 0.08,
                        weight: 1.5
                      }}
                    />
                  )}
                  {isCompleted ? (
                    <Marker position={[lat, lng]} icon={completedIcon} eventHandlers={{ click: () => setSelectedAlertId(alert.id) }}>
                      <Popup>
                        <strong>Completed SOS</strong>
                        <br />
                        User: {alert.userId}
                        <br />
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                        <br />
                        {alert.timestamp
                          ? new Date(alert.timestamp).toLocaleString()
                          : ''}
                      </Popup>
                    </Marker>
                  ) : (
                    <Marker position={[lat, lng]} icon={sosIcon} eventHandlers={{ click: () => setSelectedAlertId(alert.id) }}>
                      <Popup>
                        <strong>SOS Alert</strong>
                        <br />
                        ID: <span style={{ fontFamily: 'monospace' }}>{alert.id}</span>
                        <br />
                        User: {alert.userId}
                        <br />
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                        <br />
                        {alert.timestamp
                          ? new Date(alert.timestamp).toLocaleTimeString()
                          : ''}
                        {alert.description && (
                          <>
                            <br />
                            Notes: {alert.description.slice(0, 60)}
                            {alert.description.length > 60 ? '…' : ''}
                          </>
                        )}
                      </Popup>
                    </Marker>
                  )}
                </div>
              )
            })}

            {visibleDispatchedAmbulances.map((amb) => {
              const lat = Number(amb.latitude)
              const lng = Number(amb.longitude)
              if (Number.isNaN(lat) || Number.isNaN(lng)) return null
              const dispatch = dispatches.find((d) => d.ambulanceId === amb.id)
              const status = dispatch?.status || 'dispatched'
              const icon = ambulanceMarkerFor(amb, status)
              return (
                <Marker key={`amb-${amb.id}`} position={[lat, lng]} icon={icon}>
                  <Popup>
                    <strong>
                      {amb.unitNumber ? `Ambulance ${amb.unitNumber}` : `Ambulance ${amb.id}`}
                    </strong>
                    <br />
                    Status: {statusLabel(status)}
                    <br />
                    {amb.driverName && <>Driver: {amb.driverName}<br /></>}
                    {amb.equipmentLevel && <>Level: {amb.equipmentLevel}<br /></>}
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>

          <div className="legend">
            <div className="legend-item">
              <span className="dot sos" />
              SOS Emergency
            </div>
            <div className="legend-item">
              <span className="dot amb" />
              Dispatched
            </div>
            <div className="legend-item">
              <span className="dot enroute" />
              En route
            </div>
            <div className="legend-item">
              <span className="dot good" />
              Completed
            </div>
          </div>
        </main>
      </div>

      <SOSPanel />
      <TriageChat />
    </div>
  )
}

export default Operations
