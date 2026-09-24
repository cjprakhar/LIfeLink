import { useState } from 'react'
import { AlertTriangle, Radio, CheckCircle2 } from 'lucide-react'
import EmergencyCard from './EmergencyCard'

export default function EmergencyQueue({
  visibleAlerts,
  activeAlerts,
  dispatches,
  allAmbulances,
  ambulanceLiveDistance,
  selectedAlertId,
  setSelectedAlertId,
  pendingControls,
  controlErrors,
  simulating,
  acceptDispatch,
  completeDispatch,
  startSimulation,
  stopSimulation,
  connected,
  simulationIntervalMs
}) {
  const [filter, setFilter] = useState('all')

  const filteredAlerts = filter === 'all'
    ? visibleAlerts
    : visibleAlerts.filter((alert) => {
        const dispatch = dispatches.find((d) => d.alertId === alert.id)
        const status = dispatch?.status || alert.status || 'pending'
        return status === filter
      })

  return (
    <aside className="ops-queue" aria-label="Emergency dispatch queue">
      <div className="ops-queue-header">
        <AlertTriangle size={18} style={{ color: 'var(--cc-emergency)' }} />
        <h2 className="ops-queue-title">Active Emergencies</h2>
        <span className={`ops-queue-badge ${activeAlerts.length === 0 ? 'zero' : ''}`}>
          {activeAlerts.length}
        </span>
        <select
          className="ops-queue-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter emergencies by status"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="dispatched">Dispatched</option>
          <option value="en-route">En Route</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="ops-queue-list">
        {!connected && visibleAlerts.length === 0 && (
          <div className="ops-disconnected-banner">
            <Radio size={14} />
            <span>
              Backend is unreachable. SOS submissions and live updates will be unavailable until it returns.
            </span>
          </div>
        )}

        {filteredAlerts.length === 0 && connected && (
          <div className="ops-empty-state">
            <div className="ops-empty-icon">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="ops-empty-title">All Clear</h3>
            <p className="ops-empty-desc">
              {filter === 'all'
                ? 'No active emergencies. Monitoring for SOS signals…'
                : `No ${filter} emergencies found.`}
            </p>
          </div>
        )}

        {filteredAlerts.map((alert) => {
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
          const canSimulate =
            isActive &&
            alertAmb &&
            dispatch &&
            Number.isFinite(Number(alert.latitude)) &&
            Number.isFinite(Number(alert.longitude))

          return (
            <EmergencyCard
              key={alert.id || alert.timestamp}
              alert={alert}
              dispatch={dispatch}
              ambulance={alertAmb}
              dispatchStatus={dispatchStatus}
              distanceKm={distanceKm}
              liveDistanceKm={liveDistanceKm}
              isSelected={selectedAlertId === alert.id}
              onSelect={() => setSelectedAlertId(alert.id)}
              onAccept={() => dispatch?.id && acceptDispatch(dispatch.id)}
              onComplete={() => dispatch?.id && completeDispatch(dispatch.id)}
              onStartSim={() =>
                dispatch?.id &&
                startSimulation(
                  dispatch.id,
                  alert,
                  alertAmb,
                  Number(alert.latitude),
                  Number(alert.longitude)
                )
              }
              onStopSim={() => dispatch?.id && stopSimulation(dispatch.id)}
              acceptPending={dispatch?.id ? pendingControls[`accept:${dispatch.id}`] : false}
              completePending={dispatch?.id ? pendingControls[`complete:${dispatch.id}`] : false}
              acceptError={dispatch?.id ? controlErrors[`accept:${dispatch.id}`] : null}
              completeError={dispatch?.id ? controlErrors[`complete:${dispatch.id}`] : null}
              simActive={dispatch?.id ? Boolean(simulating[dispatch.id]) : false}
              canSimulate={canSimulate}
              simulationIntervalMs={simulationIntervalMs}
            />
          )
        })}
      </div>
    </aside>
  )
}
