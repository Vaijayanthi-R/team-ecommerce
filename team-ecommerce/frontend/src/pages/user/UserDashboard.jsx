import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
//
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">👋</p>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-500 mt-2">Use the navigation to browse, order, and manage your account.</p>
      </div>
    </div>
  )
}