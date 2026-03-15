import { useState, useEffect } from 'react'
import { DashboardLayout, KpiCard, StatusBadge, Spinner, Empty } from '../../components/Layout'
import { sellerApi, productApi } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Package, DollarSign, ShoppingBag, Trophy, Bell, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SellerProfile() {
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