import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export const LOCATION_API_ROOT = 'http://localhost:5000/api'
export const SOCKET_URL = 'http://localhost:5000'
export const DEFAULT_CENTER = [13.0358, 77.597]
export const DEFAULT_ZOOM = 12
export const INDIA_MAP_BOUNDS = [[6, 68], [37, 98]]
export const INDIA_REGION = {
  minLat: Number(import.meta.env.VITE_INDIA_MIN_LAT || 8),
  maxLat: Number(import.meta.env.VITE_INDIA_MAX_LAT || 35),
  minLng: Number(import.meta.env.VITE_INDIA_MIN_LNG || 68),
  maxLng: Number(import.meta.env.VITE_INDIA_MAX_LNG || 90)
}

const SIMULATION_INTERVAL_MS = 800
const SIMULATION_STEP_RATIO = 0.08
const STOP_DISTANCE_METERS = 50

export function isInSupportedRegion(item) {
  const lat = Number(item?.latitude)
  const lng = Number(item?.longitude)
  return (
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= INDIA_REGION.minLat && lat <= INDIA_REGION.maxLat &&
    lng >= INDIA_REGION.minLng && lng <= INDIA_REGION.maxLng
  )
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

/**
 * useSocket — manages the Socket.IO connection and all operational state.
 * Used by Operations.jsx. Patient pages use REST APIs independently.
 */
export function useSocket() {
  const [sosAlerts, setSosAlerts] = useState([])
  const [dispatchedAmbulances, setDispatchedAmbulances] = useState([])
  const [allAmbulances, setAllAmbulances] = useState([])
  const [dispatches, setDispatches] = useState([])
  const [ambulanceLiveDistance, setAmbulanceLiveDistance] = useState({})
  const [connected, setConnected] = useState(false)
  const [initialStateLoaded, setInitialStateLoaded] = useState(false)
  const [pendingControls, setPendingControls] = useState({})
  const [controlErrors, setControlErrors] = useState({})
  const [simulating, setSimulating] = useState({})
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  const dispatchesRef = useRef([])
  const simTimersRef = useRef({})
  const allAmbulancesRef = useRef([])
  const dispatchedAmbulancesRef = useRef([])

  useEffect(() => {
    const socket = io(SOCKET_URL)

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
        inDispatches.filter((d) => d.status !== 'completed').map((d) => d.ambulanceId)
      )
      const activeAmbs = alerts.filter((a) => a.ambulance).map((a) => a.ambulance)
      const byId = new Map()
      activeAmbs.forEach((amb) => { if (amb && dispatchedIds.has(amb.id)) byId.set(amb.id, amb) })
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
          id: payload.dispatchId, alertId: payload.id,
          ambulanceId: payload.ambulanceId, userId: payload.userId,
          pickupLatitude: payload.latitude, pickupLongitude: payload.longitude,
          distanceKm: payload.ambulance?.distanceKm,
          status: payload.status || 'dispatched', createdAt: payload.timestamp
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
            : prev.map((a) => a.id === payload.ambulance.id ? { ...a, ...payload.ambulance } : a)
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
        setSosAlerts((prev) => prev.map((a) =>
          a.id === dispatch.alertId ? { ...a, status: dispatch.status, dispatchId: dispatch.id } : a
        ))
      }
      if (alert) {
        setSosAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, ...alert } : a))
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
          : prev.map((a) => a.id === amb.id ? { ...a, ...amb, _lastUpdatedAt: amb.updatedAt ?? Date.now() } : a)
        allAmbulancesRef.current = next
        return next
      })
      setDispatchedAmbulances((prev) => {
        const exists = prev.some((a) => a.id === amb.id)
        if (!exists) return prev
        const next = prev.map((a) => a.id === amb.id ? { ...a, ...amb, _lastUpdatedAt: amb.updatedAt ?? Date.now() } : a)
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

  function setPendingFor(key, value) { setPendingControls((prev) => ({ ...prev, [key]: value })) }
  function setErrorFor(key, value) { setControlErrors((prev) => ({ ...prev, [key]: value })) }

  async function acceptDispatch(dispatchId) {
    const key = `accept:${dispatchId}`
    setPendingFor(key, true); setErrorFor(key, null)
    try {
      const res = await fetch(`${LOCATION_API_ROOT}/dispatches/${dispatchId}/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
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
    setPendingFor(key, true); setErrorFor(key, null)
    try {
      const res = await fetch(`${LOCATION_API_ROOT}/dispatches/${dispatchId}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`)
      if (simTimersRef.current[dispatchId]) {
        clearInterval(simTimersRef.current[dispatchId])
        delete simTimersRef.current[dispatchId]
        setSimulating((prev) => { const next = { ...prev }; delete next[dispatchId]; return next })
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      const cur = getCurrentAmbulance()
      const ambLat = Number(cur.latitude); const ambLng = Number(cur.longitude)
      if (Number.isNaN(ambLat) || Number.isNaN(ambLng)) return
      const distMeters = metersBetween(ambLat, ambLng, pickupLat, pickupLng)
      if (distMeters < STOP_DISTANCE_METERS) {
        clearInterval(simTimersRef.current[dispatchId])
        delete simTimersRef.current[dispatchId]
        setSimulating((prev) => { const next = { ...prev }; delete next[dispatchId]; return next })
        return
      }
      const nextLat = ambLat + (pickupLat - ambLat) * SIMULATION_STEP_RATIO
      const nextLng = ambLng + (pickupLng - ambLng) * SIMULATION_STEP_RATIO
      sendAmbulanceLocationUpdate(ambulance.id, nextLat, nextLng).catch(() => {})
    }
    const starting = getCurrentAmbulance()
    const distMeters = metersBetween(Number(starting.latitude), Number(starting.longitude), pickupLat, pickupLng)
    if (distMeters < STOP_DISTANCE_METERS) {
      setSimulating((prev) => { const next = { ...prev }; delete next[dispatchId]; return next })
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
    setSimulating((prev) => { const next = { ...prev }; delete next[dispatchId]; return next })
  }

  return {
    sosAlerts, allAmbulances, dispatchedAmbulances, dispatches,
    ambulanceLiveDistance, connected, initialStateLoaded,
    pendingControls, controlErrors, simulating,
    selectedAlertId, setSelectedAlertId,
    acceptDispatch, completeDispatch, sendAmbulanceLocationUpdate,
    startSimulation, stopSimulation
  }
}
