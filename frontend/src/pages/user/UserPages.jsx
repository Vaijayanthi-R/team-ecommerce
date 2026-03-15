// ── ProductDetail.jsx ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productApi, userApi, paymentApi, orderApi } from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { Navbar } from '../../components/Layout'
import { ShoppingCart, Heart, Trophy, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export function ReviewCard({ review, isOwn, onEdit, onDelete }) {
  return (
    <div className="border-b border-gray-50 pb-5 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {review.userName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{review.userName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars rating={review.rating} size={13} />
              <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              {review.updatedAt && <span className="text-xs text-gray-300">(edited)</span>}
            </div>
          </div>
        </div>
        {isOwn && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(review)} className="text-gray-400 hover:text-primary"><Edit2 size={15}/></button>
            <button onClick={() => onDelete(review.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={15}/></button>
          </div>
        )}
      </div>
      {review.comment && <p className="text-sm text-gray-600 mt-3 leading-relaxed ml-12">{review.comment}</p>}
    </div>
  )
}
 
export function RatingBreakdown({ reviews }) {
  if (!reviews.length) return null
  const counts = [5,4,3,2,1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }))
  const total = reviews.length
  return (
    <div className="space-y-1.5">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-3">{star}</span>
          <Stars rating={star} size={11} />
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: total ? `${(count/total)*100}%` : '0%' }} />
          </div>
          <span className="text-xs text-gray-400 w-4">{count}</span>
        </div>
      ))}
    </div>
  )
}
 
export function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
 
  const [product,     setProduct]     = useState(null)
  const [reviews,     setReviews]     = useState([])
  const [eligibility, setEligibility] = useState({ canReview: false, alreadyReviewed: false })
  const [qty,         setQty]         = useState(1)
 
  // Review form state
  const [showForm,   setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // review being edited
  const [rating,     setRating]     = useState(0)
  const [comment,    setComment]    = useState('')
  const [submitting, setSubmitting] = useState(false)
 
  useEffect(() => {
    productApi.getById(id).then(r => setProduct(r.data))
    reviewApi.getForProduct(id).then(r => setReviews(r.data))
    if (user) {
      reviewApi.checkEligibility(id).then(r => setEligibility(r.data))
    }
  }, [id, user])
 
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0
 
  const handleSubmitReview = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return }
    setSubmitting(true)
    try {
      if (editTarget) {
        const res = await reviewApi.update(editTarget.id, rating, comment)
        setReviews(prev => prev.map(r => r.id === editTarget.id ? res.data : r))
        toast.success('Review updated!')
      } else {
        const res = await reviewApi.submit(id, rating, comment)
        setReviews(prev => [res.data, ...prev])
        setEligibility(e => ({ ...e, alreadyReviewed: true }))
        // Update product rating display
        setProduct(p => ({ ...p,
          averageRating: [...reviews, res.data].reduce((s,r)=>s+r.rating,0) / (reviews.length+1),
          totalReviews: reviews.length + 1
        }))
        toast.success('Review submitted!')
      }
      setShowForm(false); setEditTarget(null); setRating(0); setComment('')
    } catch (err) { toast.error(err.message) }
    finally { setSubmitting(false) }
  }
 
  const handleEdit = (review) => {
    setEditTarget(review); setRating(review.rating); setComment(review.comment || ''); setShowForm(true)
  }
 
  const handleDelete = async (reviewId) => {
    if (!confirm('Delete your review?')) return
    await reviewApi.delete(reviewId)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
    setEligibility(e => ({ ...e, alreadyReviewed: false }))
    toast.success('Review deleted')
  }
 
  if (!product) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center p-20">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
      </div>
    </div>
  )
 
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm">
          <ArrowLeft size={16}/> Back
        </button>
 
        {/* Product info */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-2xl overflow-hidden h-80 flex items-center justify-center border border-gray-100">
            {product.imageFileIds?.[0]
              ? <img src={productApi.imageUrl(product.imageFileIds[0])} alt={product.name} className="w-full h-full object-cover"/>
              : <span className="text-6xl">📦</span>}
          </div>
 
          <div className="card">
            {product.bestSeller && (
              <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-3">
                <Trophy size={16}/> #{product.bestSellerRank} Best Seller
              </div>
            )}
            <p className="text-sm text-gray-400 mb-1">{product.category}</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-3">by {product.sellerName}</p>
 
            {/* Rating summary */}
            <div className="flex items-center gap-2 mb-4">
              <Stars rating={product.averageRating || avgRating} size={16} />
              <span className="text-sm font-medium text-gray-700">
                {(product.averageRating || avgRating) > 0
                  ? (product.averageRating || avgRating).toFixed(1)
                  : 'No ratings yet'}
              </span>
              {reviews.length > 0 && (
                <span className="text-sm text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              )}
            </div>
 
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{product.description}</p>
 
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-bold text-gray-900">${product.effectivePrice.toFixed(2)}</span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded-full">-{product.discountPercent}%</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {product.availableQuantity > 0 ? `${product.availableQuantity} in stock` : 'Out of stock'}
            </p>
 
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700">Qty:</label>
              <select className="input w-20" value={qty} onChange={e => setQty(Number(e.target.value))}>
                {[...Array(Math.min(10, product.availableQuantity))].map((_,i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </div>
 
            <button onClick={() => { addItem(product, qty); toast.success('Added to cart!') }}
              disabled={product.availableQuantity === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-2">
              <ShoppingCart size={18}/> Add to Cart
            </button>
            {user && (
              <button onClick={async () => { await userApi.addWishlist(product.id); toast.success('Added to wishlist!') }}
                className="btn-secondary w-full flex items-center justify-center gap-2">
                <Heart size={18}/> Wishlist
              </button>
            )}
          </div>
        </div>
 
        {/* Reviews section */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
 
          {/* Rating overview */}
          {reviews.length > 0 && (
            <div className="flex gap-8 mb-8 p-5 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                <Stars rating={avgRating} size={18} />
                <p className="text-sm text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1">
                <RatingBreakdown reviews={reviews} />
              </div>
            </div>
          )}
 
          {/* Write review section */}
          {user && eligibility.canReview && !eligibility.alreadyReviewed && !showForm && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-3">You purchased this product — share your experience!</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Write a Review</button>
            </div>
          )}
 
          {user && !eligibility.canReview && !reviews.find(r => r.userId === user.userId) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
              📦 Purchase and receive this product to leave a review.
            </div>
          )}
 
          {/* Review form */}
          {showForm && (
            <div className="mb-8 p-5 border border-gray-200 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-4">
                {editTarget ? 'Edit your review' : 'Write a review'}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your rating *</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
                <textarea className="input" rows={4}
                  placeholder="Share your honest experience with this product…"
                  value={comment} onChange={e => setComment(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSubmitReview} disabled={submitting || rating === 0} className="btn-primary">
                  {submitting ? 'Submitting…' : editTarget ? 'Update Review' : 'Submit Review'}
                </button>
                <button onClick={() => { setShowForm(false); setEditTarget(null); setRating(0); setComment('') }}
                  className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}
 
          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-3">⭐</p>
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm">Be the first to review this product</p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review}
                  isOwn={user && review.userId === user.userId}
                  onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Cart.jsx ──────────────────────────────────────────────────────────────────
export function Cart() {
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
      const order = orderRes.data
      const payRes = await paymentApi.initiate(order.id)
      clearCart()
      toast.success('Order placed! Proceed to payment.')
      navigate('/orders')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        {items.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-20"/>
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/shop')} className="btn-primary mt-4">Shop Now</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {items.map(item => (
                <div key={item.productId} className="card flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageFileIds?.[0]
                      ? <img src={productApi.imageUrl(item.imageFileIds[0])} alt={item.productName} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100">-</button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
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
              <textarea className="input text-sm mb-3" rows={3} placeholder="Shipping address…"
                value={address} onChange={e => setAddress(e.target.value)} />
              {!user && <p className="text-sm text-amber-600 mb-2">Please log in to checkout</p>}
              <button onClick={handleCheckout} disabled={!user || placing}
                className="btn-primary w-full">{placing ? 'Placing…' : 'Place Order'}</button>
              <button onClick={clearCart} className="btn-secondary w-full mt-2 text-sm">Clear Cart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Wishlist.jsx ──────────────────────────────────────────────────────────────
export function Wishlist() {
  const [items, setItems] = useState([])
  const { addItem } = useCart()

  useEffect(() => {
    userApi.getWishlist().then(async res => {
      const ids = res.data
      const products = await Promise.all(ids.map(id => productApi.getById(id).then(r => r.data)))
      setItems(products)
    })
  }, [])

  const remove = async (productId) => {
    await userApi.removeWishlist(productId)
    setItems(i => i.filter(p => p.id !== productId))
    toast.success('Removed from wishlist')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">❤️ Wishlist</h1>
        {items.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <Heart size={48} className="mx-auto mb-4 opacity-20"/>
            <p>Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(p => (
              <div key={p.id} className="card">
                <div className="h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {p.imageFileIds?.[0]
                    ? <img src={productApi.imageUrl(p.imageFileIds[0])} alt={p.name} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>}
                </div>
                <p className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">{p.name}</p>
                <p className="font-bold text-gray-900 mb-3">${p.effectivePrice.toFixed(2)}</p>
                <button onClick={() => { addItem(p); toast.success('Added to cart!') }} className="btn-primary w-full text-sm mb-2">Add to Cart</button>
                <button onClick={() => remove(p.id)} className="btn-secondary w-full text-sm">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── OrderHistory.jsx ──────────────────────────────────────────────────────────
export function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.myOrders().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const cancel = async (id) => {
    try {
      await orderApi.cancel(id)
      setOrders(o => o.map(ord => ord.id === id ? { ...ord, status: 'CANCELLED' } : ord))
      toast.success('Order cancelled')
    } catch (err) { toast.error(err.message) }
  }

  const statusColors = { CREATED:'badge-created', CONFIRMED:'badge-confirmed', SHIPPED:'badge-shipped', DELIVERED:'badge-delivered', CANCELLED:'badge-cancelled' }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">📦 My Orders</h1>
        {loading ? <div className="animate-pulse space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="card h-24 bg-gray-100"/>)}</div>
        : orders.length === 0 ? (
          <div className="card text-center py-16 text-gray-400"><p>No orders yet</p></div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Order #{order.id.slice(-8)}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={statusColors[order.status]}>{order.status}</span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600">
                      <span>{item.productName} ×{item.quantity}</span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-bold text-gray-900">Total: ${order.totalAmount.toFixed(2)}</span>
                  {(order.status === 'CREATED') && (
                    <button onClick={() => cancel(order.id)} className="btn-danger text-sm px-3 py-1">Cancel</button>
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