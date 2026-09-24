/**
 * MetricCard — Reusable component for metrics / statistics
 * @param {object} props
 * @param {string|number} props.value - Metric value to display
 * @param {string} props.label - Metric label
 * @param {string} [props.tone] - Tone ('default' | 'danger' | 'good' | 'blue' | 'warn' | 'teal')
 * @param {React.ReactNode} [props.icon] - Optional icon
 * @param {string} [props.subtext] - Optional helper text
 */
export default function MetricCard({
  value,
  label,
  tone = 'default',
  icon = null,
  subtext = null,
  className = ''
}) {
  return (
    <div className={`cc-metric-card cc-metric-card--${tone} ${className}`}>
      {icon && <div className="cc-metric-icon">{icon}</div>}
      <div className="cc-metric-content">
        <span className="cc-metric-value">{value}</span>
        <span className="cc-metric-label">{label}</span>
        {subtext && <span className="cc-metric-subtext">{subtext}</span>}
      </div>
    </div>
  )
}
