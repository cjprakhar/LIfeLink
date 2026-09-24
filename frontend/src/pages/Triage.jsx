import TriageChat from '../components/TriageChat'
import { HeartPulse, AlertTriangle, Shield } from 'lucide-react'

export default function Triage() {
  return (
    <div className="triage-page-wrapper">
      {/* Header */}
      <div className="triage-page-header">
        <div className="triage-page-header-inner section-inner">
          <div className="triage-page-title-row">
            <div className="page-hero-icon page-hero-icon--teal">
              <HeartPulse size={24} />
            </div>
            <div>
              <h1 className="page-title">AI Triage Assistant</h1>
              <p className="page-subtitle">Initial symptom guidance from CareConnect AI.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety banner */}
      <div className="triage-safety-banner">
        <div className="section-inner">
          <div className="triage-safety-inner">
            <AlertTriangle size={16} />
            <span>
              <strong>Medical disclaimer:</strong> This AI assistant provides initial guidance only.
              It does not replace a doctor or emergency responder. For life-threatening emergencies,
              call <strong>112</strong> immediately.
            </span>
          </div>
        </div>
      </div>

      {/* Full chat panel */}
      <div className="triage-page-body section-inner">
        <div className="triage-page-chat-wrap">
          <TriageChat alwaysOpen />
        </div>

        {/* Side info */}
        <aside className="triage-page-info">
          <div className="triage-info-card">
            <Shield size={20} />
            <h3>When to call 112</h3>
            <ul>
              <li>Chest pain or heart attack symptoms</li>
              <li>Difficulty breathing</li>
              <li>Unconsciousness</li>
              <li>Severe bleeding</li>
              <li>Stroke symptoms</li>
              <li>Severe allergic reaction</li>
              <li>Seizures</li>
              <li>Major trauma or injury</li>
            </ul>
          </div>
          <div className="triage-info-card triage-info-card--soft">
            <HeartPulse size={20} />
            <h3>What this tool does</h3>
            <p>
              Helps you assess symptom severity and provides step-by-step first-aid guidance
              while emergency services are on their way.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
