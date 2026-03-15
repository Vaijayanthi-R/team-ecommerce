import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { productApi, orderApi, paymentApi } from '../../api/axios'
import { Navbar } from '../../components/Layout'
import { ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
//
export default function Cart() {
  const { items, removeItem, updateQty, clearCart, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)

  const handleCheckout = async () => {
    if (!address.trim()) { toast.error('Please enter a shipping address'); return }
    setPlacing(true)
    try {
      const orderRes = await orderApi.create({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address
      })
      await paymentApi.initiate(orderRes.data.id)
      clearCart()
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">🛒 Your Cart</h1>
        {items.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
            <p className="mb-4">Your cart is empty</p>
            <button onClick={() => navigate('/shop')} className="btn-primary">Shop Now</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {items.map(item => (
                <div key={item.productId} className="card flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageFileIds?.[0]
                      ? <img src={productApi.imageUrl(item.imageFileIds[0])} alt={item.productName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100">-</button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                  <p className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
              ))}
            </div>
            <div className="card h-fit">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                {items.map(i => (
                  <div key={i.productId} className="flex justify-between text-gray-600">
                    <span>{i.productName} ×{i.quantity}</span>
                    <span>${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
              <textarea className="input text-sm mb-3" rows={3}
                placeholder="Shipping address…"
                value={address} onChange={e => setAddress(e.target.value)} />
              {!user && <p className="text-sm text-amber-600 mb-2">Please log in to checkout</p>}
              <button onClick={handleCheckout} disabled={!user || placing} className="btn-primary w-full">
                {placing ? 'Placing…' : 'Place Order'}
              </button>
              <button onClick={clearCart} className="btn-secondary w-full mt-2 text-sm">Clear Cart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}