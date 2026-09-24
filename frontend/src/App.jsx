import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import SOSPanel from './components/SOSPanel'
import TriageChat from './components/TriageChat'

import Home from './pages/Home'
import Ambulance from './pages/Ambulance'
import Hospitals from './pages/Hospitals'
import Triage from './pages/Triage'
import Emergency from './pages/Emergency'
import Profile from './pages/Profile'
import History from './pages/History'
import Operations from './pages/Operations'

import './App.css'

export default function App() {
  const location = useLocation()
  const isOps = location.pathname.startsWith('/ops')

  // Operations Dashboard has its own complete full-screen layout
  if (isOps) {
    return (
      <Routes>
        <Route path="/ops" element={<Operations />} />
        <Route path="*" element={<Navigate to="/ops" replace />} />
      </Routes>
    )
  }

  return (
    <div className="cc-app-shell">
      <Navbar />

      <main className="cc-main-content" id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ambulance" element={<Ambulance />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/triage" element={<Triage />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />

      {/* Floating emergency actions accessible throughout patient portal */}
      <SOSPanel />
      {location.pathname !== '/triage' && <TriageChat />}
    </div>
  )
}
