import { useState, useEffect } from 'react'
import { DashboardLayout, KpiCard, StatusBadge, Spinner, Empty } from '../../components/Layout'
import { sellerApi, productApi } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Package, DollarSign, ShoppingBag, Trophy, Bell, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SellerDashboard() {
  const { user } = useAuth()
  const [stats,  setStats]  = useState(null)
  const [notifs, setNotifs] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      sellerApi.getProfile(),
      sellerApi.getAnalytics(),
      sellerApi.getNotifications()
    ]).then(([p, s, n]) => {
      setProfile(p.data); setStats(s.data); setNotifs(n.data)
    }).finally(() => setLoading(false))
  }, [])

  const unread = notifs.filter(n => !n.read)

  if (loading) return <DashboardLayout role="SELLER"><Spinner /></DashboardLayout>

  return (
    <DashboardLayout role="SELLER">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">
            {profile?.status === 'APPROVED'
              ? '✅ Your seller account is verified'
              : profile?.status === 'PENDING'
              ? '⏳ Account pending admin verification'
              : '❌ Account rejected — check your profile'}
          </p>
        </div>
        {unread.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
            <Bell size={16}/> {unread.length} new notification{unread.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Best-seller notifications */}
      {unread.filter(n => n.type === 'BEST_SELLER').map(n => (
        <div key={n.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><Trophy size={20} className="text-amber-500"/><p className="text-sm font-medium text-amber-900">{n.message}</p></div>
          <button onClick={async () => { await sellerApi.markNotifRead(n.id); setNotifs(prev => prev.map(x => x.id === n.id ? {...x, read:true} : x)) }}
            className="text-xs text-amber-600 hover:underline">Dismiss</button>
        </div>
      ))}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Revenue"   value={`$${(stats?.totalRevenue||0).toFixed(2)}`} icon={DollarSign} color="green" />
        <KpiCard label="Total Orders"    value={stats?.totalOrders||0}                      icon={ShoppingBag} color="blue" />
        <KpiCard label="Units Sold"      value={stats?.totalUnitsSold||0}                   icon={Package}    color="purple" />
        <KpiCard label="Top Product"     value={stats?.topProductName||'—'}                 icon={Trophy}     color="amber" sub={`${stats?.topProductUnitsSold||0} units`}/>
      </div>

      {/* Revenue chart */}
      {stats?.monthlyBreakdown?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{ fontSize: 12 }}/>
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`}/>
              <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Revenue']}/>
              <Line type="monotone" dataKey="revenue" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF', r:4 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent notifications */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Recent Notifications</h2>
        {notifs.length === 0 ? <Empty message="No notifications yet"/> : (
          <div className="space-y-3">
            {notifs.slice(0,8).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${n.read ? 'bg-gray-50' : 'bg-primary/5 border border-primary/20'}`}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? '#d1d5db' : '#6C63FF'}}/>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}