import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'
//...
// User pages
import UserDashboard  from './pages/user/UserDashboard'
import ProductListing from './pages/user/ProductListing'
import ProductDetail  from './pages/user/ProductDetail'
import Cart           from './pages/user/Cart'
import Wishlist       from './pages/user/Wishlist'
import OrderHistory   from './pages/user/OrderHistory'

// Seller pages
import SellerDashboard  from './pages/seller/SellerDashboard'
import SellerProducts   from './pages/seller/SellerProducts'
import SellerAnalytics  from './pages/seller/SellerAnalytics'
import SellerWallet     from './pages/seller/SellerWallet'
import SellerProfile    from './pages/seller/SellerProfile'

// Admin pages
import AdminDashboard       from './pages/admin/AdminDashboard'
import AdminSellers         from './pages/admin/AdminSellers'
import AdminProducts        from './pages/admin/AdminProducts'
import AdminOrders          from './pages/admin/AdminOrders'

// Super Admin pages
import SuperAdminDashboard  from './pages/superadmin/SuperAdminDashboard'
import SuperAdminAdmins     from './pages/superadmin/SuperAdminAdmins'
import SuperAdminAuditLogs  from './pages/superadmin/SuperAdminAuditLogs'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleHome() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  switch (user.role) {
    case 'SUPER_ADMIN': return <Navigate to="/superadmin" replace />
    case 'ADMIN':       return <Navigate to="/admin" replace />
    case 'SELLER':      return <Navigate to="/seller" replace />
    default:            return <Navigate to="/shop" replace />
  }
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/"         element={<RoleHome />} />

      {/* Shop (users) */}
      <Route path="/shop"          element={<ProductListing />} />
      <Route path="/shop/:id"      element={<ProductDetail />} />

      {/* Protected user routes */}
      <Route path="/cart" element={
        <ProtectedRoute><Cart /></ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute><Wishlist /></ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute><OrderHistory /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['USER']}><UserDashboard /></ProtectedRoute>
      } />

      {/* Seller routes */}
      <Route path="/seller" element={
        <ProtectedRoute roles={['SELLER']}><SellerDashboard /></ProtectedRoute>
      } />
      <Route path="/seller/products" element={
        <ProtectedRoute roles={['SELLER']}><SellerProducts /></ProtectedRoute>
      } />
      <Route path="/seller/analytics" element={
        <ProtectedRoute roles={['SELLER']}><SellerAnalytics /></ProtectedRoute>
      } />
      <Route path="/seller/wallet" element={
        <ProtectedRoute roles={['SELLER']}><SellerWallet /></ProtectedRoute>
      } />
      <Route path="/seller/profile" element={
        <ProtectedRoute roles={['SELLER']}><SellerProfile /></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN','SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/sellers" element={
        <ProtectedRoute roles={['ADMIN','SUPER_ADMIN']}><AdminSellers /></ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute roles={['ADMIN','SUPER_ADMIN']}><AdminProducts /></ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute roles={['ADMIN','SUPER_ADMIN']}><AdminOrders /></ProtectedRoute>
      } />

      {/* Super Admin routes */}
      <Route path="/superadmin" element={
        <ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>
      } />
      <Route path="/superadmin/admins" element={
        <ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminAdmins /></ProtectedRoute>
      } />
      <Route path="/superadmin/logs" element={
        <ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminAuditLogs /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}