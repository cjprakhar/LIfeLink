import { Link, useLocation } from 'react-router-dom'
import {
  Home, Truck, Building2, History, User
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/ambulance', icon: Truck, label: 'Ambulance' },
  { to: '/hospitals', icon: Building2, label: 'Hospitals' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()

  function isActive(item) {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <nav className="cc-bottom-nav" aria-label="Bottom navigation">
      {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
        const active = isActive({ to, exact })
        return (
          <Link
            key={to}
            to={to}
            className={`cc-bottom-nav-item ${active ? 'cc-bottom-nav-item--active' : ''}`}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
