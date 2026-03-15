import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { Navbar } from '../../components/Layout'
import { Stars } from '../../components/common/StarRating'
import { Search, ShoppingCart, Trophy, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
//
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col">
      <div className="w-full h-44 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 overflow-hidden relative flex-shrink-0">
        {product.imageFileIds?.[0] ? (
          <img src={productApi.imageUrl(product.imageFileIds[0])} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {product.bestSeller && (
          <div className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Trophy size={10} /> #{product.bestSellerRank}
          </div>
        )}
        {product.discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discountPercent}%
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{product.category}</p>
        <Link to={`/shop/${product.id}`}
          className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary line-clamp-2 mb-1 text-sm">
          {product.name}
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.sellerName}</p>
        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.averageRating} size={13} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.averageRating > 0 ? `${product.averageRating.toFixed(1)} (${product.totalReviews})` : 'No reviews'}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${product.effectivePrice.toFixed(2)}</span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button onClick={() => onAddToCart(product)} disabled={product.availableQuantity === 0}
            className="bg-primary/10 dark:bg-primary/20 text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-40">
            <ShoppingCart size={16} />
          </button>
        </div>
        {product.availableQuantity === 0 && (
          <p className="text-xs text-red-400 dark:text-red-500 mt-1">Out of stock</p>
        )}
      </div>
    </div>
  )
}

function FilterPanel({ filters, setFilters, categories, onClose }) {
  const [local, setLocal] = useState(filters)
  const set = (k, v) => setLocal(f => ({ ...f, [k]: v }))
  const apply = () => { setFilters(local); onClose?.() }
  const reset = () => {
    const c = { category: '', minPrice: '', maxPrice: '', minRating: 0, sortBy: 'newest' }
    setLocal(c); setFilters(c); onClose?.()
  }

  return (
    <div className="filter-panel">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Filters</h3>
        <button onClick={reset} className="text-xs text-primary hover:underline">Reset all</button>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {['', ...categories].map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="cat" checked={local.category === cat}
                onChange={() => set('category', cat)} className="accent-primary" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{cat || 'All Categories'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range ($)</label>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" min={0} className="input text-sm"
            value={local.minPrice} onChange={e => set('minPrice', e.target.value)} />
          <span className="text-gray-400 dark:text-gray-500">—</span>
          <input type="number" placeholder="Max" min={0} className="input text-sm"
            value={local.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Rating</label>
        <div className="space-y-1.5">
          {[0, 4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rating" checked={Number(local.minRating) === r}
                onChange={() => set('minRating', r)} className="accent-primary" />
              {r === 0
                ? <span className="text-sm text-gray-700 dark:text-gray-300">Any rating</span>
                : <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                    <Stars rating={r} size={13} /> & up
                  </span>}
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
        <select className="input text-sm" value={local.sortBy} onChange={e => set('sortBy', e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>

      <button onClick={apply} className="btn-primary w-full">Apply Filters</button>
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = []
  for (let i = Math.max(0, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 0} className="page-btn">
        <ChevronLeft size={16} />
      </button>

      {Math.max(0, page - 2) > 0 && (
        <>
          <button onClick={() => onChange(0)} className="page-btn">1</button>
          {page - 2 > 1 && <span className="text-gray-400 dark:text-gray-500 text-sm">…</span>}
        </>
      )}

      {pages.map(p => (
        p === page
          ? <span key={p} className="page-btn-active">{p + 1}</span>
          : <button key={p} onClick={() => onChange(p)} className="page-btn">{p + 1}</button>
      ))}

      {Math.min(totalPages - 1, page + 2) < totalPages - 2 && (
        <span className="text-gray-400 dark:text-gray-500 text-sm">…</span>
      )}
      {Math.min(totalPages - 1, page + 2) < totalPages - 1 && (
        <button onClick={() => onChange(totalPages - 1)} className="page-btn">{totalPages}</button>
      )}

      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} className="page-btn">
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default function ProductListing() {
  const { addItem } = useCart()
  const [result, setResult] = useState(null)
  const [bestSellers, setBestSellers] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', minRating: 0, sortBy: 'newest' })
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)

  const fetchProducts = useCallback(async (pg = 0, s = search, f = filters) => {
    setLoading(true)
    try {
      const params = {
        ...(s && { search: s }),
        ...(f.category && { category: f.category }),
        ...(f.minPrice && { minPrice: f.minPrice }),
        ...(f.maxPrice && { maxPrice: f.maxPrice }),
        ...(f.minRating && { minRating: f.minRating }),
        sortBy: f.sortBy, page: pg, size: 12
      }
      const res = await productApi.filter(params)
      setResult(res.data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    productApi.bestSellers(6).then(r => setBestSellers(r.data))
    productApi.categories().then(r => setCategories(r.data))
  }, [])

  useEffect(() => { fetchProducts(0, search, filters) }, [filters])

  const handleSearch = e => { e.preventDefault(); setPage(0); fetchProducts(0, search, filters) }
  const handlePageChange = p => { setPage(p); fetchProducts(p, search, filters); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleFilterChange = f => { setFilters(f); setPage(0); fetchProducts(0, search, f) }
  const handleAddToCart = p => { if (p.availableQuantity === 0) { toast.error('Out of stock'); return } addItem(p); toast.success('Added to cart!') }
  const activeCount = [filters.category, filters.minPrice, filters.maxPrice, filters.minRating > 0 ? 1 : ''].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary/10 to-sky-950 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Discover amazing products</h1>
          <p className="text-white/80 mb-6 text-sm">Thousands of verified sellers, one marketplace</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-10 bg-white text-gray-900"
                placeholder="Search products, categories…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary px-5">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Best Sellers */}
        {bestSellers.length > 0 && !search && !activeCount && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Best Sellers</h2>
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                Updated hourly
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
            </div>
            <hr className="mt-10 border-gray-200 dark:border-gray-800" />
          </section>
        )}

        <div className="flex gap-6">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <FilterPanel filters={filters} setFilters={handleFilterChange} categories={categories} />
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-900 dark:text-gray-100">
                  {search ? `"${search}"` : filters.category || 'All Products'}
                </h2>
                {result && (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {result.totalElements} products
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {filters.category && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 dark:bg-primary/20 text-primary px-2 py-1 rounded-full">
                    {filters.category}
                    <button onClick={() => handleFilterChange({ ...filters, category: '' })}><X size={11} /></button>
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                    ≥{filters.minRating}★
                    <button onClick={() => handleFilterChange({ ...filters, minRating: 0 })}><X size={11} /></button>
                  </span>
                )}
                <button onClick={() => setShowFilter(true)}
                  className="lg:hidden flex items-center gap-2 btn-secondary text-sm">
                  <SlidersHorizontal size={15} /> Filters {activeCount > 0 && `(${activeCount})`}
                </button>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-800" />
                ))}
              </div>
            ) : result?.content?.length === 0 ? (
              <div className="text-center py-24 text-gray-400 dark:text-gray-600">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-medium">No products found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {result?.content?.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
              </div>
            )}

            {/* Pagination */}
            {result && <Pagination page={page} totalPages={result.totalPages} onChange={handlePageChange} />}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilter(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 overflow-y-auto p-4 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Filters</h3>
              <button onClick={() => setShowFilter(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <FilterPanel filters={filters} setFilters={handleFilterChange}
              categories={categories} onClose={() => setShowFilter(false)} />
          </div>
        </div>
      )}
    </div>
  )
}