import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import {
  ShoppingCart, Heart, Package, LogOut, Bell, Menu, X,
  Store, BarChart2, Wallet, Users, ClipboardList, Shield,
  Home, Sun, Moon
} from 'lucide-react'
import { useState } from 'react'
//...
// ── Theme Toggle ──────────────────────────────────────────────────────────────
export function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme()
  return (
    <button onClick={toggle} aria-label="Toggle dark mode"
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
        bg-gray-100 hover:bg-gray-200 text-gray-600
        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 ${className}`}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-primary">🛍 Marketplace</Link>

        <div className="hidden md:flex items-center gap-5">
          <Link to="/shop" className="text-gray-600 dark:text-gray-300 hover:text-primary text-sm font-medium">
            Shop
          </Link>
          {user ? (
            <>
              {user.role === 'USER' && (
                <>
                  <Link to="/wishlist" className="text-gray-500 dark:text-gray-400 hover:text-primary"><Heart size={20} /></Link>
                  <Link to="/orders"   className="text-gray-500 dark:text-gray-400 hover:text-primary"><Package size={20} /></Link>
                  <Link to="/cart"     className="relative text-gray-500 dark:text-gray-400 hover:text-primary">
                    <ShoppingCart size={20} />
                    {count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">{user.firstName}</span>
              <ThemeToggle />
              <button onClick={() => { logout(); navigate('/login') }}
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link to="/login"    className="btn-secondary text-sm">Login</Link>
              <Link to="/register" className="btn-primary  text-sm">Sign Up</Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(o => !o)}>
            {open
              ? <X    size={22} className="text-gray-700 dark:text-gray-300" />
              : <Menu size={22} className="text-gray-700 dark:text-gray-300" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex flex-col gap-3 bg-white dark:bg-gray-900">
          <Link to="/shop" className="text-sm text-gray-700 dark:text-gray-300">Shop</Link>
          {user ? (
            <>
              {user.role === 'USER' && (
                <>
                  <Link to="/cart"     className="text-sm text-gray-700 dark:text-gray-300">Cart ({count})</Link>
                  <Link to="/wishlist" className="text-sm text-gray-700 dark:text-gray-300">Wishlist</Link>
                  <Link to="/orders"   className="text-sm text-gray-700 dark:text-gray-300">Orders</Link>
                </>
              )}
              <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-red-500 text-left">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="text-sm text-gray-700 dark:text-gray-300">Login</Link>
              <Link to="/register" className="text-sm text-gray-700 dark:text-gray-300">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SELLER_LINKS = [
  { to: '/seller',           icon: Home,        label: 'Dashboard' },
  { to: '/seller/products',  icon: Store,       label: 'My Products' },
  { to: '/seller/analytics', icon: BarChart2,   label: 'Analytics' },
  { to: '/seller/wallet',    icon: Wallet,      label: 'Wallet' },
  { to: '/seller/profile',   icon: Users,       label: 'Profile & Certs' },
]
const ADMIN_LINKS = [
  { to: '/admin',           icon: Home,          label: 'Dashboard' },
  { to: '/admin/sellers',   icon: Users,         label: 'Sellers' },
  { to: '/admin/products',  icon: Store,         label: 'Products' },
  { to: '/admin/orders',    icon: ClipboardList, label: 'Orders' },
]
const SUPER_LINKS = [
  { to: '/superadmin',         icon: Home,          label: 'Dashboard' },
  { to: '/superadmin/admins',  icon: Shield,        label: 'Admins' },
  { to: '/superadmin/logs',    icon: ClipboardList, label: 'Audit Logs' },
  { to: '/admin/sellers',      icon: Users,         label: 'Sellers' },
  { to: '/admin/products',     icon: Store,         label: 'Products' },
  { to: '/admin/orders',       icon: ClipboardList, label: 'Orders' },
]

export function Sidebar({ role }) {
  const location = useLocation()
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const links = role === 'SELLER' ? SELLER_LINKS : role === 'SUPER_ADMIN' ? SUPER_LINKS : ADMIN_LINKS

  return (
    <aside className="sidebar w-56 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <Link to="/" className="text-lg font-bold text-primary">🛍 Marketplace</Link>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">
          {role?.toLowerCase().replace('_', ' ')}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${location.pathname === to
                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <ThemeToggle />
          <span className="text-sm text-gray-500 dark:text-gray-400">Dark mode</span>
        </div>
        <button onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400
                     hover:text-red-500 dark:hover:text-red-400 w-full px-3 py-2 rounded-lg
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}

// ── DashboardLayout ───────────────────────────────────────────────────────────
export function DashboardLayout({ children, role }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Sidebar role={role} />
      <main className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        {children}
      </main>
    </div>
  )
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const s = status?.toLowerCase()
  return <span className={`badge-${s}`}>{status}</span>
}

// ── KpiCard ───────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, icon: Icon, color = 'purple', sub }) {
  const colors = {
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    teal:   'bg-teal-50   text-teal-600   dark:bg-teal-900/30   dark:text-teal-400',
    amber:  'bg-amber-50  text-amber-600  dark:bg-amber-900/30  dark:text-amber-400',
    green:  'bg-green-50  text-green-600  dark:bg-green-900/30  dark:text-green-400',
    blue:   'bg-blue-50   text-blue-600   dark:bg-blue-900/30   dark:text-blue-400',
    red:    'bg-red-50    text-red-600    dark:bg-red-900/30    dark:text-red-400',
  }
  return (
    <div className="card flex items-center gap-4">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

// ── Empty ─────────────────────────────────────────────────────────────────────
export function Empty({ message = 'Nothing here yet' }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600">
      <Package size={40} className="mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  )
}