import { useState, useEffect } from 'react'
import { DashboardLayout, StatusBadge, Spinner, Empty } from '../../components/Layout'
import { sellerApi, productApi } from '../../api/axios'
import { Plus, Trash2, Edit3, X, RefreshCw, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

function ProductForm({ initial, onSubmit, onCancel, isUpdate }) {
  const [form, setForm] = useState(initial || {
    name: '', description: '', category: '', price: '', availableQuantity: '', discountPercent: ''
  })
  const [images, setImages] = useState([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('product', new Blob([JSON.stringify({
        name: form.name, description: form.description, category: form.category,
        price: Number(form.price), availableQuantity: Number(form.availableQuantity),
        discountPercent: form.discountPercent ? Number(form.discountPercent) : null
      })], { type: 'application/json' }))
      images.forEach(img => fd.append('images', img))
      if (isUpdate) fd.append('sellerNote', note)
      await onSubmit(fd)
    } finally { setSaving(false) }
  }

  return (
    <div className="card mb-6 border border-primary/30 dark:border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 dark:text-gray-100">
          {isUpdate ? '✏️ Submit Update for Review' : '➕ New Product'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20}/></button>
      </div>

      {isUpdate && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
          ℹ️ Changes will go to admin for review. Your live product stays unchanged until approved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
          <input className="input" placeholder="Must be globally unique" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
          <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
          <input className="input" placeholder="e.g. Electronics" value={form.category} onChange={e => set('category', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($) *</label>
          <input className="input" type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity *</label>
          <input className="input" type="number" min="0" value={form.availableQuantity} onChange={e => set('availableQuantity', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount %</label>
          <input className="input" type="number" min="0" max="100" placeholder="Optional" value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isUpdate ? 'New Images (optional — leave blank to keep current)' : 'Product Images'}
          </label>
          <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))} className="input" />
        </div>
        {isUpdate && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note to admin (optional)</label>
            <input className="input" placeholder="Explain what you changed and why…" value={note} onChange={e => setNote(e.target.value)} />
          </div>
        )}
        <div className="col-span-2 flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Submitting…' : isUpdate ? 'Submit for Re-review' : 'Submit for Approval'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function SellerProducts() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showAdd,  setShowAdd]  = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  useEffect(() => {
    sellerApi.myProducts().then(r => setProducts(r.data)).finally(() => setLoading(false))
  }, [])

  const handleAdd = async fd => {
    try {
      const res = await sellerApi.addProduct(fd)
      setProducts(p => [res.data, ...p])
      setShowAdd(false)
      toast.success('Product submitted for approval!')
    } catch (err) { toast.error(err.message) }
  }

  const handleUpdate = async fd => {
    try {
      const res = await sellerApi.submitUpdate(editProduct.id, fd)
      setProducts(p => p.map(x => x.id === editProduct.id ? res.data : x))
      setEditProduct(null)
      toast.success('Update submitted for admin review!')
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this product?')) return
    try {
      await sellerApi.deleteProduct(id)
      setProducts(p => p.filter(x => x.id !== id))
      toast.success('Product deleted')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <DashboardLayout role="SELLER">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Products</h1>
        <button onClick={() => { setShowAdd(true); setEditProduct(null) }}
          className="btn-primary flex items-center gap-2">
          <Plus size={16}/> Add Product
        </button>
      </div>

      {showAdd && !editProduct && (
        <ProductForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} isUpdate={false} />
      )}

      {editProduct && (
        <ProductForm
          initial={{
            name: editProduct.name,
            description: editProduct.description,
            category: editProduct.category,
            price: editProduct.price,
            availableQuantity: editProduct.availableQuantity,
            discountPercent: editProduct.discountPercent || ''
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditProduct(null)}
          isUpdate />
      )}

      {loading ? <Spinner /> : products.length === 0 ? (
        <Empty message="No products yet. Add your first product!" />
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="card flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                {p.imageFileIds?.[0]
                  ? <img src={productApi.imageUrl(p.imageFileIds[0])} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                  {p.bestSeller && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">🏆 #{p.bestSellerRank}</span>
                  )}
                  {p.hasPendingUpdate && (
                    <span className="badge-update flex items-center gap-1"><Clock size={10}/> Update pending</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {p.category} · ${p.effectivePrice?.toFixed(2)} · {p.availableQuantity} in stock
                </p>
                {p.adminRemarks && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Admin note: {p.adminRemarks}</p>
                )}
                {p.hasPendingUpdate && p.pendingUpdate && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Pending: {p.pendingUpdate.name} · ${p.pendingUpdate.price}
                    {p.pendingUpdate.sellerNote && ` · "${p.pendingUpdate.sellerNote}"`}
                  </p>
                )}
              </div>

              <StatusBadge status={p.status} />

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.status === 'ACTIVE' && !p.hasPendingUpdate && (
                  <button onClick={() => { setEditProduct(p); setShowAdd(false) }}
                    title="Update product"
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Edit3 size={16}/>
                  </button>
                )}
                {p.status === 'ACTIVE' && p.hasPendingUpdate && (
                  <button onClick={() => { setEditProduct(p); setShowAdd(false) }}
                    title="Edit pending update"
                    className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                    <RefreshCw size={16}/>
                  </button>
                )}
                <button onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}