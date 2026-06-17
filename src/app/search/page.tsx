'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { GlassCard, Badge, QueryDisplay, LoadingSpinner, GradientButton, SafeImage } from '@/components/ui'
import { Search, Filter, ShoppingCart, AlertTriangle, Pill } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Medicine { 
  medicine_id: number; 
  medicine_name: string; 
  strength: string; 
  manufacturer: string; 
  price: number; 
  requires_prescription: boolean; 
  image_url: string; 
  category: { category_name: string } | null; 
  inventory: { stock_quantity: number; reorder_level: number } | null 
}

const getMedicineImage = (name: string, categoryName: string = '') => {
  const n = name.toLowerCase();
  const c = categoryName.toLowerCase();
  if (n.includes('paracetamol') || n.includes('acetaminophen') || n.includes('ibuprofen') || n.includes('aspirin') || n.includes('pain') || c.includes('pain')) {
    return 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('cough') || n.includes('syrup') || c.includes('syrup') || n.includes('liquid') || n.includes('soothe')) {
    return 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('moisturizer') || n.includes('cream') || n.includes('lotion') || c.includes('derm') || c.includes('skin') || n.includes('shield') || n.includes('gel')) {
    return 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('vitamin') || n.includes('vital') || n.includes('omega') || n.includes('melatonin') || c.includes('vitamin') || c.includes('supplement')) {
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
  }
  if (n.includes('amoxicillin') || n.includes('penicillin') || n.includes('cipro') || c.includes('antibiotic')) {
    return 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1607619056574-7b8d304a3b24?w=500&auto=format&fit=crop&q=60';
}

function SearchContent() {
  const searchParams = useSearchParams()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [categories, setCategories] = useState<{category_id:number;category_name:string}[]>([])
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState('medicine_name')
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState<number | null>(null)

  useEffect(() => { 
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || [])) 
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    params.set('sort', sort)
    fetch(`/api/medicines?${params}`)
      .then(r => r.json())
      .then(d => { 
        setMedicines(d.medicines || []); 
        setQuery(d.query || ''); 
        setLoading(false) 
      })
  }, [search, category, sort])

  const addToCart = async (medicineId: number) => {
    setAdding(medicineId)
    await fetch('/api/cart', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ medicine_id: medicineId, quantity: 1 }) 
    })
    setTimeout(() => setAdding(null), 1000)
  }

  const getStockBadge = (inv: Medicine['inventory']) => {
    if (!inv || inv.stock_quantity === 0) return <Badge variant="error">Out of Stock</Badge>
    if (inv.stock_quantity < inv.reorder_level) return <Badge variant="warning">Low Stock</Badge>
    return <Badge variant="success">In Stock</Badge>
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-left">
          Browse <span className="gradient-text">Medicines</span>
        </h1>
        <p className="text-slate-550 mb-4 font-semibold text-left">Find genuine medicines at the best prices</p>
        <QueryDisplay query={query} />

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search medicines..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-250 bg-white focus:border-violet-500 outline-none font-semibold text-slate-800" 
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="px-4 py-3.5 rounded-xl border border-slate-250 bg-white focus:border-violet-500 outline-none font-semibold text-slate-800"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
            </select>
          </div>
          <select 
            value={sort} 
            onChange={e => setSort(e.target.value)} 
            className="px-4 py-3.5 rounded-xl border border-slate-250 bg-white focus:border-violet-500 outline-none font-semibold text-slate-800"
          >
            <option value="medicine_name">Name A-Z</option>
            <option value="price_asc">Price: Low-High</option>
            <option value="price_desc">Price: High-Low</option>
          </select>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setCategory('')} 
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all click-feedback ${
              !category 
                ? 'gradient-bg text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-655 hover:border-violet-300'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button 
              key={c.category_id} 
              onClick={() => setCategory(String(c.category_id))} 
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all click-feedback ${
                category === String(c.category_id) 
                  ? 'gradient-bg text-white shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-655 hover:border-violet-350'
              }`}
            >
              {c.category_name}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <p className="text-sm text-slate-500 mb-6 font-semibold text-left">{medicines.length} medicines found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {medicines.map(med => (
                <Link key={med.medicine_id} href={`/medicine/${med.medicine_id}`} className="block">
                  <GlassCard className="bg-white border border-slate-200/80 relative group flex flex-col justify-between p-5 rounded-3xl transition-all duration-300 card-hover shadow-sm text-left h-full cursor-pointer">
                    <div>
                      {/* Medicine Real image */}
                      <div className="relative w-full h-40 bg-slate-100 rounded-2xl overflow-hidden mb-4 border border-slate-200/40">
                        <SafeImage 
                          src={getMedicineImage(med.medicine_name, med.category?.category_name || '')} 
                          alt={med.medicine_name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <span className="font-extrabold text-slate-900 group-hover:text-primary-650 transition-colors line-clamp-1">{med.medicine_name}</span>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">{med.manufacturer}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 font-medium">{med.strength} • {med.category?.category_name || 'General'}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        {getStockBadge(med.inventory)}
                        {med.requires_prescription && <Badge variant="info">Rx Required</Badge>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-slate-200/60">
                      <span className="text-2xl font-extrabold gradient-text">{formatCurrency(med.price)}</span>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(med.medicine_id); }} 
                        disabled={!med.inventory || med.inventory.stock_quantity === 0}
                        className="gradient-bg text-white p-3 rounded-xl hover:shadow-[0_0_12px_rgba(236,72,153,0.3)] hover:scale-105 transition-all disabled:opacity-50 click-feedback"
                      >
                        {adding === med.medicine_id ? '✓' : <ShoppingCart className="w-5 h-5" />}
                      </button>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
            {medicines.length === 0 && (
              <div className="text-center py-16">
                <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xl font-bold text-slate-500">No medicines found</p>
                <p className="text-slate-400 font-semibold mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
        <QueryDisplay query={query} />
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="pt-28 flex justify-center"><LoadingSpinner /></div>
      </main>
    }>
      <SearchContent />
    </Suspense>
  )
}
