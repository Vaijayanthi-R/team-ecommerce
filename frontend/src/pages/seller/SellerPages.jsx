import { useState, useEffect } from 'react'
import { DashboardLayout, KpiCard, StatusBadge, Spinner, Empty } from '../../components/Layout'
import { sellerApi, productApi } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Package, DollarSign, ShoppingBag, Trophy, Bell, Upload, Plus, Trash2, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Seller Dashboard ──────────────────────────────────────────────────────────
export function SellerDashboard() {
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

// ── Seller Products ───────────────────────────────────────────────────────────

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
// ── Seller Analytics ──────────────────────────────────────────────────────────
export function SellerAnalytics() {
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

// ── Seller Wallet ─────────────────────────────────────────────────────────────
export function SellerWallet() {
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

// ── Seller Profile & Certs ────────────────────────────────────────────────────
export function SellerProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [certFile, setCertFile] = useState(null)
  const [certType, setCertType] = useState('FSSAI')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    sellerApi.getProfile().then(r => { setProfile(r.data); setForm(r.data) }).finally(() => setLoading(false))
  }, [])

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await sellerApi.updateProfile(form)
      setProfile(res.data); toast.success('Profile updated!')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleUploadCert = async () => {
    if (!certFile) { toast.error('Select a file first'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', certFile)
    fd.append('certType', certType)
    try {
      const res = await sellerApi.uploadCert(fd)
      setProfile(res.data); setCertFile(null)
      toast.success('Certificate uploaded!')
    } catch (err) { toast.error(err.message) }
    finally { setUploading(false) }
  }

  if (loading) return <DashboardLayout role="SELLER"><Spinner/></DashboardLayout>

  const certTypes = ['FSSAI', 'ISI', 'BUSINESS_LICENSE', 'GST_CERTIFICATE', 'TRADE_LICENSE', 'OTHER']

  return (
    <DashboardLayout role="SELLER">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🏪 Profile & Certificates</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Business Details</h2>
          <div className="mb-3 flex items-center gap-2">
            <StatusBadge status={profile.status}/>
            {profile.adminRemarks && <p className="text-xs text-gray-400">{profile.adminRemarks}</p>}
          </div>
          <form onSubmit={handleSave} className="space-y-3">
            {[['businessName','Business Name'],['businessEmail','Business Email'],['phone','Phone'],['address','Address'],['gstNumber','GST Number']].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input className="input" value={form[field]||''} onChange={e => setForm(f=>({...f,[field]:e.target.value}))}/>
              </div>
            ))}
            <button type="submit" className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
          </form>
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">📄 Certificates</h2>
          <div className="space-y-3 mb-6">
            {profile.certificates?.length === 0 && <Empty message="No certificates uploaded yet"/>}
            {profile.certificates?.map((cert, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{cert.certType}</p>
                  <p className="text-xs text-gray-400">{cert.fileName} · {new Date(cert.uploadedAt).toLocaleDateString()}</p>
                </div>
                <a href={`/api/admin/sellers/certificates/${cert.fileId}`} target="_blank" rel="noreferrer"
                  className="text-xs text-primary hover:underline">View</a>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">Upload New Certificate</h3>
            <select className="input mb-2" value={certType} onChange={e => setCertType(e.target.value)}>
              {certTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} className="input mb-3"/>
            <button onClick={handleUploadCert} disabled={uploading} className="btn-primary w-full flex items-center justify-center gap-2">
              <Upload size={16}/> {uploading ? 'Uploading…' : 'Upload Certificate'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}