'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { Badge, GradientButton, QueryDisplay, LoadingSpinner, SafeImage } from '@/components/ui'
import { Pill, ShoppingCart, ArrowLeft, Package, Calendar, Building2, Shield } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface MedicineData {
  medicine_name: string;
  strength?: string;
  manufacturer?: string;
  price: number;
  expiry_date?: string;
  requires_prescription: boolean;
  description?: string;
  inventory?: { stock_quantity: number; reorder_level: number };
  category?: { category_name: string };
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

export default function MedicineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [med, setMed] = useState<MedicineData | null>(null)
  const [query, setQuery] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    fetch(`/api/medicines/${id}`)
      .then(r => r.json())
      .then(d => { 
        setMed(d.medicine); 
        setQuery(d.query) 
      })
  }, [id])

  const addToCart = async () => {
    await fetch('/api/cart', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ medicine_id: parseInt(id), quantity: qty }) 
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!med) return <><Navbar /><div className="pt-28"><LoadingSpinner /></div></>

  const inv = med.inventory
  const cat = med.category

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-12">
        <Link href="/search" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-500 mb-4 transition-colors font-bold click-feedback">
          <ArrowLeft className="w-5 h-5" /> Back to Medicines
        </Link>
        <QueryDisplay query={query} />
        <div className="grid md:grid-cols-2 gap-12 text-left">
          {/* Medicine Real Image */}
          <div className="relative w-full h-80 bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 shadow-md">
            <SafeImage 
              src={getMedicineImage(med.medicine_name, cat?.category_name || '')} 
              alt={med.medicine_name} 
              fill 
              className="object-cover" 
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {inv && inv.stock_quantity > 0 ? <Badge variant="success">In Stock ({inv.stock_quantity})</Badge> : <Badge variant="error">Out of Stock</Badge>}
              {med.requires_prescription && <Badge variant="info">Prescription Required</Badge>}
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{med.medicine_name as string}</h1>
            <p className="text-sm text-slate-550 font-bold mb-6">{med.strength as string}</p>
            <div className="space-y-3.5 mb-6 text-sm font-semibold">
              <div className="flex items-center gap-3 text-slate-700">
                <Building2 className="w-5 h-5 text-slate-450" />
                <span>{med.manufacturer as string}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Package className="w-5 h-5 text-slate-450" />
                <span>{cat?.category_name || 'General'}</span>
              </div>
              {med.expiry_date && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-slate-450" />
                  <span>Expires: {formatDate(med.expiry_date as string)}</span>
                </div>
              )}
              {med.requires_prescription && (
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary-550" />
                  <span className="text-primary-600 font-bold">Requires valid prescription upload</span>
                </div>
              )}
            </div>
            <p className="text-4xl font-black gradient-text mb-6">{formatCurrency(med.price as number)}</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-slate-250 bg-white rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-slate-600 hover:bg-slate-50 font-bold transition-colors click-feedback">-</button>
                <span className="px-4 py-3 font-extrabold text-slate-800">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-slate-655 hover:bg-slate-50 font-bold transition-colors click-feedback">+</button>
              </div>
              <GradientButton onClick={addToCart} disabled={!inv || inv.stock_quantity === 0} className="flex-1 flex items-center justify-center gap-2 font-bold py-3.5 shadow-md hover:shadow-lg">
                <ShoppingCart className="w-5 h-5" /> {added ? 'Added!' : 'Add to Cart'}
              </GradientButton>
            </div>
            {med.description && (
              <div className="pt-6 border-t border-slate-200/60">
                <h3 className="font-extrabold text-slate-900 mb-2">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{med.description as string}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
