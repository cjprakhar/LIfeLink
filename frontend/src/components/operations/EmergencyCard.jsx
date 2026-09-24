import {
  AlertTriangle,
  Clock,
  MapPin,
  Truck,
  User as UserIcon,
  Radio,
  RefreshCw,
  Loader2,
  Play,
  Square,
  Zap,
  CheckCircle2
} from 'lucide-react'
import StatusBadge from './StatusBadge'

function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function truncateId(id) {
  if (!id) return '—'
  if (id.length <= 16) return id
  return id.slice(0, 6) + '…' + id.slice(-4)
}

export default function EmergencyCard({
  alert,
  dispatch,
  ambulance,
  dispatchStatus,
  distanceKm,
  liveDistanceKm,
  isSelected,
  onSelect,
  onAccept,
  onComplete,
  onStartSim,
  onStopSim,
  acceptPending,
  completePending,
  acceptError,
  completeError,
  simActive,
  canSimulate,
  simulationIntervalMs
}) {
  const isActive = dispatchStatus === 'dispatched' || dispatchStatus === 'en-route' || dispatchStatus === 'pending'

  return (
    <article
      className={`ops-ecard status-${dispatchStatus} ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Emergency ${truncateId(alert.id)}, status ${dispatchStatus}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
    >
      {/* Active pulse dot */}
      {isActive && dispatchStatus !== 'completed' && (
        <span className="ops-ecard-active-dot" aria-hidden="true" />
      )}

      {/* Head: Badge + Time */}
      <div className="ops-ecard-head">
        <StatusBadge status={dispatchStatus === 'pending' ? 'sos' : dispatchStatus} />
        <span className="ops-ecard-time">
          <Clock size={12} />
          {formatTime(alert.timestamp)}
        </span>
      </div>

      {/* ID */}
      <div className="ops-ecard-id">
        <AlertTriangle size={14} style={{ color: 'var(--cc-emergency)' }} />
        SOS Emergency
        <span className="ops-ecard-id-code">{truncateId(alert.id)}</span>
      </div>

      {/* Location */}
      <div className="ops-ecard-location">
        <MapPin size={14} />
        {Number.isFinite(Number(alert.latitude))
          ? `${Number(alert.latitude).toFixed(4)}, ${Number(alert.longitude).toFixed(4)}`
          : 'Location unavailable'}
      </div>

      {/* Description */}
      {alert.description && (
        <div className="ops-ecard-description">
          {alert.description}
        </div>
      )}

      {/* Ambulance block — active dispatch */}
      {ambulance && dispatchStatus !== 'completed' ? (
        <div className="ops-ecard-amb">
          <div className="ops-ecard-amb-header">
            <StatusBadge status={dispatchStatus} />
            <span className="ops-ecard-amb-distance">
              {typeof distanceKm === 'number'
                ? `${distanceKm.toFixed(2)} km${typeof liveDistanceKm === 'number' ? ' (live)' : ''}`
                : ''}
            </span>
          </div>

          {ambulance.unitNumber && (
            <div className="ops-ecard-amb-info">
              <Truck size={13} />
              <span className="ops-row-label">Unit</span>
              <span className="ops-row-value">{ambulance.unitNumber}</span>
            </div>
          )}
          {ambulance.driverName && (
            <div className="ops-ecard-amb-info">
              <UserIcon size={13} />
              <span className="ops-row-label">Driver</span>
              <span className="ops-row-value">{ambulance.driverName}</span>
            </div>
          )}
          {ambulance.phone && (
            <div className="ops-ecard-amb-info">
              <Radio size={13} />
              <span className="ops-row-label">Contact</span>
              <span className="ops-row-value mono">{ambulance.phone}</span>
            </div>
          )}
          <div className="ops-ecard-amb-info">
            <RefreshCw size={13} className={simActive ? 'ops-spin-slow' : ''} />
            <span className="ops-row-label">Position</span>
            <span className="ops-row-value mono">
              {Number(ambulance.latitude).toFixed(4)}, {Number(ambulance.longitude).toFixed(4)}
            </span>
          </div>

          {/* Controls */}
          <div className="ops-controls">
            {dispatch?.status === 'dispatched' && (
              <button
                type="button"
                className="ops-ctrl-btn accept"
                disabled={acceptPending}
                onClick={(e) => { e.stopPropagation(); onAccept() }}
                aria-label="Accept and start dispatch"
              >
                {acceptPending
                  ? <Loader2 size={14} className="ops-spinner" />
                  : <Play size={14} />}
                Accept & Start
              </button>
            )}

            {dispatch?.status === 'en-route' && (
              <button
                type="button"
                className="ops-ctrl-btn complete"
                disabled={completePending}
                onClick={(e) => { e.stopPropagation(); onComplete() }}
                aria-label="Complete dispatch"
              >
                {completePending
                  ? <Loader2 size={14} className="ops-spinner" />
                  : <CheckCircle2 size={14} />}
                Complete
              </button>
            )}

            {canSimulate && (
              <>
                {simActive ? (
                  <button
                    type="button"
                    className="ops-ctrl-btn stop-sim"
                    onClick={(e) => { e.stopPropagation(); onStopSim() }}
                    aria-label="Stop simulation"
                  >
                    <Square size={14} />
                    Stop Sim
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ops-ctrl-btn simulate"
                    onClick={(e) => { e.stopPropagation(); onStartSim() }}
                    aria-label="Simulate ambulance movement"
                  >
                    <Zap size={14} />
                    Simulate
                  </button>
                )}
              </>
            )}
          </div>

          {acceptError && (
            <p className="ops-ctrl-error">
              <AlertTriangle size={12} />
              {acceptError}
            </p>
          )}
          {completeError && (
            <p className="ops-ctrl-error">
              <AlertTriangle size={12} />
              {completeError}
            </p>
          )}
          {canSimulate && simActive && (
            <p className="ops-ctrl-hint">
              <RefreshCw size={12} className="ops-spin-slow" />
              Simulation moving ambulance every {simulationIntervalMs} ms
            </p>
          )}
        </div>
      ) : ambulance && dispatchStatus === 'completed' ? (
        <div className="ops-ecard-completed">
          <StatusBadge status="completed" />
          <span className="ops-ecard-completed-time">
            {dispatch?.completedAt
              ? formatTime(dispatch.completedAt)
              : ''}
          </span>
        </div>
      ) : !ambulance && dispatchStatus === 'pending' ? (
        <div className="ops-ecard-no-amb">
          <AlertTriangle size={13} />
          No ambulance available — manual review required
        </div>
      ) : null}
    </article>
  )
}
