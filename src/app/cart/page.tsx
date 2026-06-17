'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { GradientButton, QueryDisplay, LoadingSpinner } from '@/components/ui'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CartData { cart_id: number; cart_items: { cart_item_id: number; quantity: number; medicine: { medicine_id: number; medicine_name: string; price: number; manufacturer: string; strength: string; inventory: { stock_quantity: number } | null } }[] }

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchCart = () => { fetch('/api/cart').then(r => r.json()).then(d => { setCart(d.cart); setQuery(d.query || ''); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(() => { fetchCart() }, [])

  const updateQty = async (itemId: number, qty: number) => {
    await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cart_item_id: itemId, quantity: qty }) })
    fetchCart()
  }

  const removeItem = async (itemId: number) => {
    await fetch(`/api/cart?item_id=${itemId}`, { method: 'DELETE' })
    fetchCart()
  }

  const total = cart?.cart_items.reduce((sum, item) => sum + Number(item.medicine.price) * item.quantity, 0) || 0

  if (loading) return <><Navbar /><div className="pt-28"><LoadingSpinner /></div></>

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-12">
        <h1 className="text-4xl font-bold mb-2">Shopping <span className="gradient-text">Cart</span></h1>
        <QueryDisplay query={query} />

        {!cart || cart.cart_items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-500 mb-4">Your cart is empty</p>
            <GradientButton onClick={() => router.push('/search')}>Browse Medicines</GradientButton>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.cart_items.map(item => (
                <div key={item.cart_item_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-8 h-8 text-primary-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.medicine.medicine_name}</h3>
                    <p className="text-sm text-gray-500">{item.medicine.manufacturer} • {item.medicine.strength}</p>
                    <p className="text-lg font-bold gradient-text mt-1">{formatCurrency(item.medicine.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.cart_item_id, item.quantity - 1)} className="p-2 rounded-lg border hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                    <span className="px-3 font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.cart_item_id, item.quantity + 1)} className="p-2 rounded-lg border hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                  </div>
                  <p className="font-bold text-lg w-24 text-right">{formatCurrency(Number(item.medicine.price) * item.quantity)}</p>
                  <button onClick={() => removeItem(item.cart_item_id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit sticky top-28">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{formatCurrency(total >= 500 ? 0 : 49)}</span></div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span className="gradient-text">{formatCurrency(total + (total >= 500 ? 0 : 49))}</span></div>
              </div>
              <GradientButton onClick={() => router.push('/checkout')} className="w-full flex items-center justify-center gap-2">
                Checkout <ArrowRight className="w-5 h-5" />
              </GradientButton>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
