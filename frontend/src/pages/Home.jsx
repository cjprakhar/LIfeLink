import { Link } from 'react-router-dom'
import { Truck, ShieldAlert, HeartPulse, Building2, Phone, MapPin, Activity, Shield, Zap } from 'lucide-react'
import ServiceCard from '../components/ServiceCard'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="home-page">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            Emergency services · Bengaluru Region
          </div>
          <h1 id="hero-heading" className="hero-heading">
            Healthcare and emergency<br />
            assistance, <span className="hero-heading-accent">connected.</span>
          </h1>
          <p className="hero-subtext">
            Immediate ambulance dispatch, AI-powered triage guidance, and access to nearby
            healthcare facilities — all in one place.
          </p>
          <div className="hero-ctas">
            <Link to="/ambulance" className="hero-cta-primary">
              <Truck size={18} />
              Book an Ambulance
            </Link>
            <Link to="/hospitals" className="hero-cta-secondary">
              <Building2 size={18} />
              Find a Hospital
            </Link>
            <Link to="/ambulance" className="hero-cta-sos" aria-label="Emergency SOS">
              <ShieldAlert size={18} />
              SOS
            </Link>
          </div>
        </div>

        {/* Decorative graphic */}
        <div className="hero-graphic" aria-hidden="true">
          <div className="hero-graphic-ring hero-graphic-ring--1" />
          <div className="hero-graphic-ring hero-graphic-ring--2" />
          <div className="hero-graphic-ring hero-graphic-ring--3" />
          <div className="hero-graphic-cross">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="22" y="4" width="12" height="48" rx="4" fill="#0F766E" opacity="0.9" />
              <rect x="4" y="22" width="48" height="12" rx="4" fill="#0F766E" opacity="0.9" />
            </svg>
          </div>
          <div className="hero-graphic-pulse" />
          <svg className="hero-ecg" viewBox="0 0 200 60" fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M0 30 L30 30 L40 10 L52 52 L62 18 L74 30 L200 30" />
          </svg>
        </div>
      </section>

      {/* ── Quick Services ───────────────────────────────────────── */}
      <section className="section services-section" aria-labelledby="services-heading">
        <div className="section-inner">
          <div className="section-header">
            <h2 id="services-heading" className="section-title">What do you need?</h2>
            <p className="section-subtitle">Fast access to the care and assistance that matters most.</p>
          </div>
          <div className="services-grid">
            <ServiceCard
              icon={<Truck size={26} />}
              title="Book an Ambulance"
              description="Request emergency transport and track your assigned ambulance in real time."
              to="/ambulance"
              iconBg="#EFF6FF"
              iconColor="#2563EB"
            />
            <ServiceCard
              icon={<ShieldAlert size={26} />}
              title="Emergency SOS"
              description="Send your location instantly and request immediate emergency assistance."
              to="/ambulance"
              iconBg="#FEF2F2"
              iconColor="#DC2626"
              emergency
            />
            <ServiceCard
              icon={<HeartPulse size={26} />}
              title="AI Triage"
              description="Get initial symptom guidance while you decide your next emergency step."
              to="/triage"
              iconBg="#F0FDFA"
              iconColor="#0F766E"
            />
            <ServiceCard
              icon={<Building2 size={26} />}
              title="Find a Hospital"
              description="Discover healthcare facilities, clinics, and emergency centres near you."
              to="/hospitals"
              iconBg="#F4FAF9"
              iconColor="#0B1F3A"
            />
          </div>
        </div>
      </section>

      {/* ── Why CareConnect ──────────────────────────────────────── */}
      <section className="section features-section" aria-labelledby="features-heading">
        <div className="section-inner">
          <div className="section-header">
            <h2 id="features-heading" className="section-title">Why CareConnect?</h2>
            <p className="section-subtitle">Built for emergencies. Designed for every patient.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <Zap size={22} />
              </div>
              <h3>Fastest Dispatch</h3>
              <p>Our system locates the nearest available ambulance using real-time GPS and dispatches it in seconds.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#F0FDFA', color: '#0F766E' }}>
                <Activity size={22} />
              </div>
              <h3>Live Tracking</h3>
              <p>Follow your assigned ambulance on a live map from dispatch to your location.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#FFF7ED', color: '#D97706' }}>
                <HeartPulse size={22} />
              </div>
              <h3>AI Triage Support</h3>
              <p>Get immediate, safety-first symptom guidance from our AI assistant while help is on the way.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#F4FAF9', color: '#0B1F3A' }}>
                <MapPin size={22} />
              </div>
              <h3>Location-Aware</h3>
              <p>All services are automatically calibrated to your current location for the fastest possible response.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Emergency Support ────────────────────────────────────── */}
      <section className="emergency-support-section" aria-labelledby="support-heading">
        <div className="section-inner">
          <div className="emergency-support-content">
            <div className="emergency-support-text">
              <div className="emergency-support-icon">
                <Shield size={28} />
              </div>
              <h2 id="support-heading">Always here when it matters most</h2>
              <p>
                CareConnect is designed to be your first point of contact in a medical emergency.
                While our system works to get you help, remember to also call your local emergency number.
              </p>
              <div className="emergency-support-ctas">
                <Link to="/ambulance" className="support-cta-primary">
                  <Truck size={16} />
                  Request Ambulance Now
                </Link>
                <Link to="/triage" className="support-cta-secondary">
                  <HeartPulse size={16} />
                  AI Symptom Check
                </Link>
              </div>
            </div>
            <div className="emergency-support-callout">
              <Phone size={20} />
              <p>
                <strong>Life-threatening emergency?</strong><br />
                Call <strong>112</strong> (India national emergency) immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
