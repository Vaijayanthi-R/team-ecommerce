import { useState, useEffect } from 'react'
import { DashboardLayout, StatusBadge, Spinner, Empty } from '../../components/Layout'
import { adminApi, productApi } from '../../api/axios'
import { CheckCircle, XCircle, Package, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

function RejectModal({ title, onConfirm, onClose }) {
  const [remarks, setRemarks] = useState('')
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Reject — {title}</h2>
        <textarea
          className="input mb-4"
          rows={4}
          placeholder="Reason for rejection (required)…"
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!remarks.trim()) { toast.error('Please provide a reason'); return }
              onConfirm(remarks)
            }}
            className="btn-danger flex-1"
          >
            Confirm Rejection
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function DiffRow({ label, oldVal, newVal }) {
  const changed = String(oldVal) !== String(newVal)
  return (
    <div className={`flex items-start gap-2 py-1.5 text-sm ${changed ? 'bg-amber-50 dark:bg-amber-900/10 -mx-3 px-3 rounded-lg' : ''}`}>
      <span className="text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 text-xs pt-0.5">{label}</span>
      {changed ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="line-through text-gray-400 dark:text-gray-500">{oldVal}</span>
          <ArrowRight size={12} className="text-amber-500 flex-shrink-0" />
          <span className="font-medium text-amber-700 dark:text-amber-300">{newVal}</span>
        </div>
      ) : (
        <span className="text-gray-600 dark:text-gray-300">{oldVal}</span>
      )}
    </div>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [pendingUpdates, setPendingUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('NEW')
  const [rejectTarget, setRejectTarget] = useState(null)

  useEffect(() => {
    Promise.all([
      adminApi.pendingProducts(),
      adminApi.pendingUpdates()
    ]).then(([p, u]) => {
      setProducts(p.data || [])
      setPendingUpdates(u.data || [])
    }).catch(err => toast.error(err.message))
    .finally(() => setLoading(false))
  }, [])

  const approve = async id => {
    try {
      const res = await adminApi.approveProduct(id)
      setProducts(prev => prev.map(x => x.id === id ? res.data : x))
      toast.success('Product approved and live!')
    } catch (err) { toast.error(err.message) }
  }

  const reject = async (id, remarks) => {
    try {
      const res = await adminApi.rejectProduct(id, remarks)
      setProducts(prev => prev.map(x => x.id === id ? res.data : x))
      setRejectTarget(null)
      toast.success('Product rejected')
    } catch (err) { toast.error(err.message) }
  }

  const approveUpdate = async id => {
    try {
      await adminApi.approveUpdate(id)
      setPendingUpdates(prev => prev.filter(x => x.id !== id))
      toast.success('Update approved and live!')
    } catch (err) { toast.error(err.message) }
  }

  const rejectUpdate = async (id, remarks) => {
    try {
      await adminApi.rejectUpdate(id, remarks)
      setPendingUpdates(prev =>
        prev.map(x => x.id === id ? { ...x, hasPendingUpdate: false, pendingUpdate: null } : x)
      )
      setRejectTarget(null)
      toast.success('Update rejected')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <DashboardLayout role="ADMIN">
      {rejectTarget && (
        <RejectModal
          title={rejectTarget.name}
          onConfirm={r => rejectTarget.isUpdate ? rejectUpdate(rejectTarget.id, r) : reject(rejectTarget.id, r)}
          onClose={() => setRejectTarget(null)}
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Product Approval</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'NEW',     label: 'New Products',   count: products.length },
          { key: 'UPDATES', label: 'Pending Updates', count: pendingUpdates.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2
              ${tab === t.key
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : tab === 'NEW' ? (
        products.length === 0 ? (
          <Empty message="No new products pending — all caught up! ✅" />
        ) : (
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="card">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {product.imageFileIds?.[0]
                      ? <img src={productApi.imageUrl(product.imageFileIds[0])} alt={product.name} className="w-full h-full object-cover" />
                      : <Package size={28} className="text-gray-300 dark:text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{product.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.category} · by {product.sellerName}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-bold text-gray-900 dark:text-gray-100">${product.price?.toFixed(2)}</span>
                          {product.discountPercent > 0 && <span className="text-green-600 dark:text-green-400">-{product.discountPercent}% off</span>}
                          <span className="text-gray-500 dark:text-gray-400">{product.availableQuantity} in stock</span>
                        </div>
                      </div>
                      {product.status === 'PENDING' ? (
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <button onClick={() => approve(product.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm hover:bg-green-100">
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button onClick={() => setRejectTarget({ id: product.id, name: product.name, isUpdate: false })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-100">
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={product.status} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        pendingUpdates.length === 0 ? (
          <Empty message="No pending product updates — all caught up! ✅" />
        ) : (
          <div className="space-y-4">
            {pendingUpdates.map(product => {
              const upd = product.pendingUpdate
              if (!upd) return null
              return (
                <div key={product.id} className="card border-l-4 border-amber-400 dark:border-amber-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{product.name}</h3>
                        <span className="badge-update">Update pending</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        by {product.sellerName} · Submitted {new Date(upd.submittedAt).toLocaleDateString()}
                      </p>
                      {upd.sellerNote && (
                        <p className="text-sm text-primary mt-1 italic">"{upd.sellerNote}"</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <button onClick={() => approveUpdate(product.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm hover:bg-green-100">
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => setRejectTarget({ id: product.id, name: product.name, isUpdate: true })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-100">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Current (Live)</p>
                      <DiffRow label="Name"     oldVal={product.name}              newVal={upd.name} />
                      <DiffRow label="Category" oldVal={product.category}          newVal={upd.category} />
                      <DiffRow label="Price"    oldVal={`$${product.price}`}       newVal={`$${upd.price}`} />
                      <DiffRow label="Stock"    oldVal={product.availableQuantity} newVal={upd.availableQuantity} />
                      <DiffRow label="Discount" oldVal={`${product.discountPercent || 0}%`} newVal={`${upd.discountPercent || 0}%`} />
                    </div>
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4">
                      <p className="text-xs font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wide mb-3">Proposed Changes</p>
                      <DiffRow label="Name"     oldVal={product.name}              newVal={upd.name} />
                      <DiffRow label="Category" oldVal={product.category}          newVal={upd.category} />
                      <DiffRow label="Price"    oldVal={`$${product.price}`}       newVal={`$${upd.price}`} />
                      <DiffRow label="Stock"    oldVal={product.availableQuantity} newVal={upd.availableQuantity} />
                      <DiffRow label="Discount" oldVal={`${product.discountPercent || 0}%`} newVal={`${upd.discountPercent || 0}%`} />
                    </div>
                  </div>

                  {product.description !== upd.description && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-sm">
                      <p className="text-xs font-semibold text-amber-500 mb-1">Description changed</p>
                      <p className="text-gray-400 dark:text-gray-500 line-through text-xs mb-1">{product.description}</p>
                      <p className="text-gray-700 dark:text-gray-200">{upd.description}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </DashboardLayout>
  )
}