import { useState, useEffect } from 'react'
import { DashboardLayout, KpiCard, StatusBadge, Spinner, Empty } from '../../components/Layout'
import { sellerApi, productApi } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Package, DollarSign, ShoppingBag, Trophy, Bell, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SellerWallet() {
  const [wallet, setWallet] = useState(null)
  const [txns,   setTxns]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([sellerApi.getWallet(), sellerApi.getTransactions()])
      .then(([w, t]) => { setWallet(w.data); setTxns(t.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout role="SELLER"><Spinner/></DashboardLayout>

  return (
    <DashboardLayout role="SELLER">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">💰 Wallet</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <KpiCard label="Available Balance" value={`$${(wallet?.balance||0).toFixed(2)}`} icon={DollarSign} color="green"/>
        <KpiCard label="Total Earned"      value={`$${(wallet?.totalEarned||0).toFixed(2)}`} icon={Trophy} color="purple"/>
      </div>
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Transaction History</h2>
        {txns.length === 0 ? <Empty message="No transactions yet"/> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-gray-500 text-left">
                <th className="pb-2">Date</th><th className="pb-2">Order</th>
                <th className="pb-2">Gross</th><th className="pb-2">Shipping</th>
                <th className="pb-2">Platform Fee</th><th className="pb-2 text-green-600">Net Credited</th>
              </tr></thead>
              <tbody>
                {txns.map(t => (
                  <tr key={t.id} className="border-b border-gray-50">
                    <td className="py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 text-gray-500">#{t.orderId?.slice(-8)}</td>
                    <td className="py-2">${t.grossAmount.toFixed(2)}</td>
                    <td className="py-2 text-red-500">-${t.shippingDeduction.toFixed(2)}</td>
                    <td className="py-2 text-red-500">-${t.platformFeeDeduction.toFixed(2)}</td>
                    <td className="py-2 font-bold text-green-600">+${t.netCredited.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}