import { useState, useEffect } from 'react'
import { DashboardLayout, KpiCard, Spinner, Empty } from '../../components/Layout'
import { superAdminApi } from '../../api/axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Shield, Users, DollarSign, ShoppingBag, Store, Package, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Super Admin Dashboard ─────────────────────────────────────────────────────
export function SuperAdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    superAdminApi.platformStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout role="SUPER_ADMIN"><Spinner /></DashboardLayout>

  const topProducts = stats?.topProducts ?? []

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
          <p className="text-sm text-gray-500">Full platform governance</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        <KpiCard label="Platform GMV"    value={`$${(stats?.totalGmv||0).toFixed(0)}`} icon={DollarSign} color="green" />
        <KpiCard label="Total Orders"    value={stats?.totalOrders   ?? 0}              icon={ShoppingBag} color="blue" />
        <KpiCard label="Total Users"     value={stats?.totalUsers    ?? 0}              icon={Users}      color="purple" />
        <KpiCard label="Total Sellers"   value={stats?.totalSellers  ?? 0}              icon={Store}      color="amber" />
        <KpiCard label="Total Products"  value={stats?.totalProducts ?? 0}              icon={Package}    color="teal" />
      </div>

      {/* Best sellers bar chart */}
      {topProducts.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">🏆 Top 10 Best Selling Products</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} margin={{ left: 0, right: 20, top: 5, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [v, n === 'totalUnitsSold' ? 'Units Sold' : n]} />
              <Bar dataKey="totalUnitsSold" fill="#6C63FF" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card border-l-4 border-purple-400">
          <h3 className="font-bold text-gray-900 mb-1">Admin Management</h3>
          <p className="text-sm text-gray-500 mb-3">Add new admins, view existing admin accounts.</p>
          <a href="/superadmin/admins" className="btn-primary text-sm inline-block">Manage Admins →</a>
        </div>
        <div className="card border-l-4 border-blue-400">
          <h3 className="font-bold text-gray-900 mb-1">Audit Logs</h3>
          <p className="text-sm text-gray-500 mb-3">Complete trace of all platform activity.</p>
          <a href="/superadmin/logs" className="btn-primary text-sm inline-block">View Logs →</a>
        </div>
        <div className="card border-l-4 border-green-400">
          <h3 className="font-bold text-gray-900 mb-1">Seller Oversight</h3>
          <p className="text-sm text-gray-500 mb-3">Review all seller verifications and products.</p>
          <a href="/admin/sellers" className="btn-primary text-sm inline-block">Seller Panel →</a>
        </div>
      </div>
    </DashboardLayout>
  )
}

// ── Admin Management ──────────────────────────────────────────────────────────
export function SuperAdminAdmins() {
  const [admins,  setAdmins]  = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    superAdminApi.listAdmins().then(r => setAdmins(r.data)).finally(() => setLoading(false))
  }, [])

  const handleCreate = async e => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await superAdminApi.createAdmin({ ...form, role: 'ADMIN' })
      setAdmins(a => [res.data, ...a])
      setShowForm(false)
      setForm({ firstName:'', lastName:'', email:'', password:'' })
      toast.success('Admin account created!')
    } catch (err) { toast.error(err.message) }
    finally { setCreating(false) }
  }

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Accounts</h1>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border border-purple-200">
          <h2 className="font-bold text-gray-900 mb-4">Create New Admin</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input className="input" required value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="input" required value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input className="input" type="password" required minLength={6} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create Admin'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Spinner /> : admins.length === 0 ? (
        <Empty message="No admin accounts yet. Create the first one above." />
      ) : (
        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{admin.firstName} {admin.lastName}</p>
                <p className="text-sm text-gray-500">{admin.email}</p>
              </div>
              <div className="text-right">
                <span className="badge-approved">ADMIN</span>
                <p className="text-xs text-gray-400 mt-1">
                  Since {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
const ACTION_COLORS = {
  USER_REGISTERED:      'bg-blue-100 text-blue-700',
  SELLER_APPROVED:      'bg-green-100 text-green-700',
  SELLER_REJECTED:      'bg-red-100 text-red-700',
  PRODUCT_APPROVED:     'bg-green-100 text-green-700',
  PRODUCT_REJECTED:     'bg-red-100 text-red-700',
  PRODUCT_CREATED:      'bg-purple-100 text-purple-700',
  ORDER_CREATED:        'bg-blue-100 text-blue-700',
  ORDER_STATUS_CHANGED: 'bg-amber-100 text-amber-700',
  PAYMENT_SUCCEEDED:    'bg-green-100 text-green-700',
  CERT_UPLOADED:        'bg-teal-100 text-teal-700',
}

export function SuperAdminAuditLogs() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('ALL')

  useEffect(() => {
    superAdminApi.auditLogs().then(r => setLogs(r.data)).finally(() => setLoading(false))
  }, [])

  const actionTypes = [...new Set(logs.map(l => l.action))]

  const filtered = logs.filter(l => {
    const matchAction = filter === 'ALL' || l.action === filter
    const matchSearch = !search ||
      l.detail?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId?.toLowerCase().includes(search.toLowerCase())
    return matchAction && matchSearch
  })

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📋 Audit Logs</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search logs…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input md:w-56" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Actions</option>
            {actionTypes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total Events"    value={logs.length}    icon={Package}  color="blue" />
        <KpiCard label="Showing"         value={filtered.length} icon={Search}  color="purple" />
        <KpiCard label="Action Types"    value={actionTypes.length} icon={Shield} color="amber" />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <Empty message="No logs match your filter" /> : (
        <div className="card">
          <div className="space-y-0">
            {filtered.map((log, i) => (
              <div key={log.id}
                className={`flex items-start gap-4 py-3 ${i < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {i < filtered.length - 1 && <div className="w-px h-6 bg-gray-100 mt-1" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-400">{log.entityId?.slice(-10)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5 line-clamp-1">{log.detail}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    By {log.performedBy?.slice(-8)} · {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}