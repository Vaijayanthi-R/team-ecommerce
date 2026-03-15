import { useState, useEffect } from 'react'
import { DashboardLayout, KpiCard, StatusBadge, Spinner, Empty } from '../../components/Layout'
import { sellerApi, productApi } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Package, DollarSign, ShoppingBag, Trophy, Bell, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SellerAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sellerApi.getAnalytics().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout role="SELLER"><Spinner/></DashboardLayout>

  return (
    <DashboardLayout role="SELLER">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📊 Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Revenue"      value={`$${(stats?.totalRevenue||0).toFixed(2)}`} icon={DollarSign} color="green"/>
        <KpiCard label="Orders"       value={stats?.totalOrders||0}                      icon={ShoppingBag} color="blue"/>
        <KpiCard label="Units Sold"   value={stats?.totalUnitsSold||0}                   icon={Package}    color="purple"/>
        <KpiCard label="Top Product"  value={stats?.topProductName||'—'}                 icon={Trophy}     color="amber"/>
      </div>

      <div className="card mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Revenue Over Time</h2>
        {stats?.monthlyBreakdown?.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{ fontSize: 12 }}/>
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`}/>
              <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Revenue']}/>
              <Line type="monotone" dataKey="revenue" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill:'#6C63FF', r:5 }}/>
            </LineChart>
          </ResponsiveContainer>
        ) : <Empty message="No sales data yet"/>}
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Monthly Breakdown</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-gray-500 text-left"><th className="pb-2">Month</th><th className="pb-2">Orders</th><th className="pb-2">Revenue</th></tr></thead>
          <tbody>
            {(stats?.monthlyBreakdown||[]).map(m => (
              <tr key={m.month} className="border-b border-gray-50">
                <td className="py-2">{m.month}</td>
                <td className="py-2">{m.orders}</td>
                <td className="py-2 font-medium">${m.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}