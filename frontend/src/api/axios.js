import axios from 'axios'

const api = axios.create({
  baseURL: "https://team-ecommerce.onrender.com/api"
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

// ── Products (public) ─────────────────────────────────────────────────────────
export const productApi = {
  list:        (search)  => api.get('/products', { params: search ? { search } : {} }),
  filter:      (params)  => api.get('/products/filter', { params }),
  categories:  ()        => api.get('/products/categories'),
  getById:     (id)      => api.get(`/products/${id}`),
  bestSellers: (limit=10)=> api.get('/analytics/best-sellers', { params: { limit } }),
  imageUrl:    (fileId)  => `${baseURL}/api/products/image/${fileId}`,
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewApi = {
  getForProduct:    (productId)                  => api.get(`/reviews/product/${productId}`),
  checkEligibility: (productId)                  => api.get(`/reviews/product/${productId}/eligibility`),
  submit:           (productId, rating, comment) => api.post(`/reviews/product/${productId}`, null, { params: { rating, comment } }),
  update:           (reviewId,  rating, comment) => api.put(`/reviews/${reviewId}`, null, { params: { rating, comment } }),
  delete:           (reviewId)                   => api.delete(`/reviews/${reviewId}`),
  mine:             ()                           => api.get('/reviews/mine'),
}

// ── User ──────────────────────────────────────────────────────────────────────
export const userApi = {
  me:               ()          => api.get('/user/me'),
  getWishlist:      ()          => api.get('/user/wishlist'),
  addWishlist:      (productId) => api.post(`/user/wishlist/${productId}`),
  removeWishlist:   (productId) => api.delete(`/user/wishlist/${productId}`),
  getNotifications: ()          => api.get('/user/notifications'),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  create:    (data)       => api.post('/orders', data),
  myOrders:  ()           => api.get('/orders'),
  getById:   (id)         => api.get(`/orders/${id}`),
  cancel:    (id)         => api.patch(`/orders/${id}/cancel`),
  all:       ()           => api.get('/orders/all'),
  setStatus: (id, status) => api.patch(`/orders/${id}/status`, null, { params: { status } }),
}

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentApi = {
  initiate: (orderId) => api.post('/payments/initiate', { orderId }),
}

// ── Seller ────────────────────────────────────────────────────────────────────
export const sellerApi = {
  getProfile:       ()         => api.get('/seller/profile'),
  updateProfile:    (data)     => api.put('/seller/profile', data),
  uploadCert:       (fd)       => api.post('/seller/certificates', fd),
  myProducts:       ()         => api.get('/seller/products'),
  addProduct:       (fd)       => api.post('/seller/products', fd),
  submitUpdate:     (id, fd)   => api.put(`/seller/products/${id}/update`, fd),
  deleteProduct:    (id)       => api.delete(`/seller/products/${id}`),
  getWallet:        ()         => api.get('/seller/wallet'),
  getTransactions:  ()         => api.get('/seller/wallet/transactions'),
  getAnalytics:     ()         => api.get('/seller/analytics'),
  getNotifications: ()         => api.get('/seller/notifications'),
  markNotifRead:    (id)       => api.put(`/seller/notifications/${id}/read`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  // Sellers
  allSellers:      ()              => api.get('/admin/sellers'),
  pendingSellers:  ()              => api.get('/admin/sellers/pending'),
  approveSeller:   (id)            => api.put(`/admin/sellers/${id}/approve`),
  rejectSeller:    (id, remarks)   => api.put(`/admin/sellers/${id}/reject`, { remarks }),
  certUrl:         (fileId)        => `/api/admin/sellers/certificates/${fileId}`,
  // Products — new listings
  pendingProducts: ()              => api.get('/admin/products/pending'),
  approveProduct:  (id)            => api.put(`/admin/products/${id}/approve`),
  rejectProduct:   (id, remarks)   => api.put(`/admin/products/${id}/reject`, { remarks }),
  // Products — seller update requests
  pendingUpdates:  ()              => api.get('/admin/products/pending-updates'),
  approveUpdate:   (id)            => api.put(`/admin/products/${id}/approve-update`),
  rejectUpdate:    (id, remarks)   => api.put(`/admin/products/${id}/reject-update`, { remarks }),
}

// ── Super Admin ───────────────────────────────────────────────────────────────
export const superAdminApi = {
  createAdmin:   (data) => api.post('/super-admin/admins', data),
  listAdmins:    ()     => api.get('/super-admin/admins'),
  auditLogs:     ()     => api.get('/super-admin/audit-logs'),
  platformStats: ()     => api.get('/super-admin/analytics'),
}
