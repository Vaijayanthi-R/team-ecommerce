import { useState, useEffect } from 'react'
import { DashboardLayout, KpiCard, StatusBadge, Spinner, Empty } from '../../components/Layout'
import { adminApi, orderApi } from '../../api/axios'
import api from '../../api/axios'
import { Users, Store, ClipboardList, CheckCircle, XCircle, Eye, FileText, Package } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [counts, setCounts] = useState({ pendingSellers: 0, pendingProducts: 0, totalOrders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.pendingSellers(),
      adminApi.pendingProducts(),
      orderApi.all()
    ]).then(([s, p, o]) => {
      setCounts({
        pendingSellers:  s.data?.length  ?? 0,
        pendingProducts: p.data?.length  ?? 0,
        totalOrders:     o.data?.length  ?? 0
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout role="ADMIN"><Spinner /></DashboardLayout>

  return (
    <DashboardLayout role="ADMIN">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Manage sellers, products and orders</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Pending Sellers"  value={counts.pendingSellers}  icon={Users}         color="amber" sub="Awaiting verification" />
        <KpiCard label="Pending Products" value={counts.pendingProducts} icon={Store}         color="purple" sub="Awaiting approval" />
        <KpiCard label="Total Orders"     value={counts.totalOrders}     icon={ClipboardList} color="blue"  sub="All time" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card border-l-4 border-amber-400">
          <h3 className="font-bold text-gray-900 mb-1">Seller Verification</h3>
          <p className="text-sm text-gray-500 mb-3">Review business certificates and approve or reject seller accounts.</p>
          <a href="/admin/sellers" className="btn-primary text-sm inline-block">Review Sellers →</a>
        </div>
        <div className="card border-l-4 border-purple-400">
          <h3 className="font-bold text-gray-900 mb-1">Product Approval</h3>
          <p className="text-sm text-gray-500 mb-3">Review new product listings before they go live on the storefront.</p>
          <a href="/admin/products" className="btn-primary text-sm inline-block">Review Products →</a>
        </div>
        <div className="card border-l-4 border-blue-400">
          <h3 className="font-bold text-gray-900 mb-1">Order Management</h3>
          <p className="text-sm text-gray-500 mb-3">View all orders and advance their status through the lifecycle.</p>
          <a href="/admin/orders" className="btn-primary text-sm inline-block">Manage Orders →</a>
        </div>
      </div>
    </DashboardLayout>
  )
}
// ── Certificate viewer — fetches via Axios (carries auth token) ───────────────
function CertModal({ certs, onClose }) {
  const [active,   setActive]   = useState(0)
  const [blobUrl,  setBlobUrl]  = useState(null)
  const [mimeType, setMimeType] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
 
  const cert = certs[active]
 
  // Whenever the active cert changes, fetch it as a blob through Axios
  useEffect(() => {
    if (!cert) return
 
    // Revoke previous blob URL to free memory
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setBlobUrl(null)
    setLoading(true)
    setError(null)
 
    // Use the Axios instance — it automatically sends the Authorization header
    api.get(`/admin/sellers/certificates/${cert.fileId}`, {
      responseType: 'blob'
    })
    .then(blob => {
      const mime = blob.type || 'application/octet-stream'
      const url  = URL.createObjectURL(blob)
      setMimeType(mime)
      setBlobUrl(url)
    })
    .catch(err => {
      setError(err.message)
    })
    .finally(() => setLoading(false))
 
    // Cleanup on unmount
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [active, cert?.fileId])
 
  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = cert.fileName || `certificate-${cert.certType}`
    a.click()
  }
 
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
 
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">📄 Certificates</h2>
          <div className="flex items-center gap-2">
            {blobUrl && (
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline px-2 py-1">
                <Download size={13} /> Download
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>
        </div>
 
        {/* Tab strip — multiple certs */}
        {certs.length > 1 && (
          <div className="flex gap-2 px-6 pt-4 flex-wrap">
            {certs.map((c, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${active === i
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {c.certType}
              </button>
            ))}
          </div>
        )}
 
        {/* Cert info row */}
        <div className="px-6 py-3 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cert.certType}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{cert.fileName}</span>
          {cert.uploadedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              Uploaded {new Date(cert.uploadedAt).toLocaleDateString()}
            </span>
          )}
        </div>
 
        {/* Viewer */}
        <div className="flex-1 overflow-hidden p-4 min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-gray-400 dark:text-gray-500">Loading certificate…</p>
            </div>
          )}
 
          {error && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
              <p className="font-medium">Failed to load certificate</p>
              <p className="text-xs text-gray-400">{error}</p>
            </div>
          )}
 
          {!loading && !error && blobUrl && (
            mimeType?.includes('pdf') ? (
              <iframe
                src={blobUrl}
                className="w-full h-[500px] rounded-lg border border-gray-200 dark:border-gray-700"
                title={cert.certType}
              />
            ) : (
              <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4 min-h-[300px]">
                <img
                  src={blobUrl}
                  alt={cert.certType}
                  className="max-h-[460px] max-w-full rounded-lg object-contain"
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
 
// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ title, onConfirm, onClose }) {
  const [remarks, setRemarks] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Reject — {title}</h2>
        <textarea className="input mb-4" rows={4}
          placeholder="Reason for rejection (required)…"
          value={remarks} onChange={e => setRemarks(e.target.value)} />
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!remarks.trim()) { toast.error('Please provide a reason'); return }
              onConfirm(remarks)
            }}
            className="btn-danger flex-1">
            Confirm Rejection
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  )
}
 
// ── Admin Sellers ─────────────────────────────────────────────────────────────
export default function AdminSellers() {
  const [sellers,      setSellers]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [certModal,    setCertModal]    = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [tab,          setTab]          = useState('PENDING')
 
  useEffect(() => {
    adminApi.allSellers()
      .then(r => setSellers(r.data || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])
 
  const filtered = sellers.filter(s => tab === 'ALL' || s.status === tab)
 
  const approve = async id => {
    try {
      const res = await adminApi.approveSeller(id)
      setSellers(s => s.map(x => x.id === id ? res.data : x))
      toast.success('Seller approved!')
    } catch (err) { toast.error(err.message) }
  }
 
  const reject = async (id, remarks) => {
    try {
      const res = await adminApi.rejectSeller(id, remarks)
      setSellers(s => s.map(x => x.id === id ? res.data : x))
      setRejectTarget(null)
      toast.success('Seller rejected')
    } catch (err) { toast.error(err.message) }
  }
 
  return (
    <DashboardLayout role="ADMIN">
      {certModal    && <CertModal certs={certModal} onClose={() => setCertModal(null)} />}
      {rejectTarget && (
        <RejectModal
          title={rejectTarget.name}
          onConfirm={r => reject(rejectTarget.id, r)}
          onClose={() => setRejectTarget(null)} />
      )}
 
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Seller Verification
      </h1>
 
      {/* Tab filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${tab === t
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {t}
            {t !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({sellers.filter(s => s.status === t).length})
              </span>
            )}
          </button>
        ))}
      </div>
 
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <Empty message={`No ${tab.toLowerCase()} sellers`} />
      ) : (
        <div className="space-y-4">
          {filtered.map(seller => (
            <div key={seller.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">
                      {seller.businessName || 'Unnamed Business'}
                    </h3>
                    <StatusBadge status={seller.status} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {seller.businessEmail}{seller.phone ? ` · ${seller.phone}` : ''}
                  </p>
                  {seller.address && (
                    <p className="text-sm text-gray-400 dark:text-gray-500">{seller.address}</p>
                  )}
                  {seller.gstNumber && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      GST: {seller.gstNumber}
                    </p>
                  )}
                  {seller.adminRemarks && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      Rejection reason: {seller.adminRemarks}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Registered {new Date(seller.createdAt).toLocaleDateString()}
                  </p>
                </div>
 
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  {/* Certificate button */}
                  {seller.certificates?.length > 0 ? (
                    <button
                      onClick={() => setCertModal(seller.certificates)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20
                                 text-blue-700 dark:text-blue-400 rounded-lg text-sm
                                 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <FileText size={14} />
                      View {seller.certificates.length} Certificate{seller.certificates.length > 1 ? 's' : ''}
                    </button>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400
                                     bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
                      ⚠ No certificates uploaded
                    </span>
                  )}
 
                  {seller.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(seller.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20
                                   text-green-700 dark:text-green-400 rounded-lg text-sm
                                   hover:bg-green-100 dark:hover:bg-green-900/30">
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => setRejectTarget({ id: seller.id, name: seller.businessName })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20
                                   text-red-700 dark:text-red-400 rounded-lg text-sm
                                   hover:bg-red-100 dark:hover:bg-red-900/30">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

// ── Admin Products ────────────────────────────────────────────────────────────
export function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('ALL')

  const STATUS_FLOW = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  useEffect(() => {
    orderApi.all().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const advance = async (id, newStatus) => {
    try {
      const res = await orderApi.setStatus(id, newStatus)
      setOrders(o => o.map(x => x.id === id ? res.data : x))
      toast.success(`Order moved to ${newStatus}`)
    } catch (err) { toast.error(err.message) }
  }

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current)
    if (idx < 0 || idx >= STATUS_FLOW.length - 2) return null
    return STATUS_FLOW[idx + 1]
  }

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  return (
    <DashboardLayout role="ADMIN">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', ...STATUS_FLOW].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s} {s !== 'ALL' && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <Empty message="No orders found" /> : (
        <div className="space-y-3">
          {filtered.map(order => {
            const next = nextStatus(order.status)
            return (
              <div key={order.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm text-gray-500">#{order.id.slice(-10)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {order.userEmail} · {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <div className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm text-gray-600">
                          {item.productName} ×{item.quantity}
                          <span className="text-gray-400 ml-1">(${item.subtotal.toFixed(2)})</span>
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">📍 {order.shippingAddress}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 mb-3">${order.totalAmount.toFixed(2)}</p>
                    {next && (
                      <button onClick={() => advance(order.id, next)}
                        className="btn-primary text-xs px-3 py-1.5">
                        Mark {next} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
