import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, productApi } from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { Navbar } from '../../components/Layout'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
//
export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    userApi.getWishlist().then(async res => {
      const ids = res.data
      if (!ids?.length) { setLoading(false); return }
      const products = await Promise.all(
        ids.map(id => productApi.getById(id).then(r => r.data).catch(() => null))
      )
      setItems(products.filter(Boolean))
    }).finally(() => setLoading(false))
  }, [])

  const remove = async (productId) => {
    await userApi.removeWishlist(productId)
    setItems(prev => prev.filter(p => p.id !== productId))
    toast.success('Removed from wishlist')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">❤️ Wishlist</h1>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-gray-200 dark:bg-gray-800" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <Heart size={48} className="mx-auto mb-4 opacity-20" />
            <p className="mb-4">Your wishlist is empty</p>
            <button onClick={() => navigate('/shop')} className="btn-primary">Discover Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(p => (
              <div key={p.id} className="card">
                <div className="h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/shop/${p.id}`)}>
                  {p.imageFileIds?.[0]
                    ? <img src={productApi.imageUrl(p.imageFileIds[0])} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>}
                </div>
                <p className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{p.name}</p>
                <p className="font-bold text-gray-900 mb-3">${p.effectivePrice.toFixed(2)}</p>
                <button onClick={() => { addItem(p); toast.success('Added to cart!') }}
                  className="btn-primary w-full text-sm mb-2">Add to Cart</button>
                <button onClick={() => remove(p.id)} className="btn-secondary w-full text-sm">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}