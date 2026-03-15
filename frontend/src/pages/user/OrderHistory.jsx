import { useState, useEffect } from 'react'
import { orderApi } from '../../api/axios'
import { Navbar } from '../../components/Layout'
import { Package } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  CREATED:   'badge-created',
  CONFIRMED: 'badge-confirmed',
  SHIPPED:   'badge-shipped',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled'
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.myOrders().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const cancel = async (id) => {
    try {
      await orderApi.cancel(id)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o))
      toast.success('Order cancelled')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">📦 My Orders</h1>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-200 dark:bg-gray-800" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                    </p>
                  </div>
                  <span className={STATUS_BADGE[order.status] ?? 'badge-pending'}>{order.status}</span>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600">
                      <span>{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                      <span>${item.subtotal?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <div>
                    <p className="font-bold text-gray-900">Total: ${order.totalAmount?.toFixed(2)}</p>
                    {order.shippingAddress && (
                      <p className="text-xs text-gray-400 mt-0.5">📍 {order.shippingAddress}</p>
                    )}
                  </div>
                  {order.status === 'CREATED' && (
                    <button onClick={() => cancel(order.id)} className="btn-danger text-sm px-3 py-1.5">
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <span className="text-xs text-green-600 font-medium">✅ Delivered</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}