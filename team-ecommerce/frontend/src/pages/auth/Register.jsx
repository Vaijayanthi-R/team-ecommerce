import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/axios'
import { ThemeToggle } from '../../components/Layout'
import toast from 'react-hot-toast'
//
export default function Register() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'USER' })
  const [loading, setLoading] = useState(false)
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.register(form)
      login(res.data)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🛍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join our marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First name</label>
              <input className="input" placeholder="John" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last name</label>
              <input className="input" placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (optional)</label>
            <input className="input" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {['USER', 'SELLER'].map(r => (
                <button key={r} type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors
                    ${form.role === r
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary'}`}>
                  {r === 'USER' ? '🛒 Shop' : '🏪 Sell'}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'SELLER' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
              ℹ️ You'll need to upload business certificates after registration for admin verification.
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}