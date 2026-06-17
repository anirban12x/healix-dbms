'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { GradientButton, QueryDisplay } from '@/components/ui'
import { CreditCard, CheckCircle, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<{cart_items:{cart_item_id:number;quantity:number;medicine:{medicine_name:string;price:number}}[]}|null>(null)
  const [paymentMode, setPaymentMode] = useState('Online')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<number|null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => { fetch('/api/cart').then(r=>r.json()).then(d=>setCart(d.cart)) }, [])

  const total = cart?.cart_items.reduce((s,i)=>s+Number(i.medicine.price)*i.quantity,0)||0
  const deliveryFee = total >= 500 ? 0 : 49

  const handlePayment = async () => {
    setProcessing(true)
    // Create order from cart
    const items = cart!.cart_items.map(i=>({medicine_id:(i as unknown as {medicine:{medicine_id:number}}).medicine.medicine_id || 0, quantity:i.quantity}))
    const orderRes = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({items}) })
    const orderData = await orderRes.json()
    if (!orderData.order) { setProcessing(false); return }
    const oid = orderData.order.order_id
    setOrderId(oid)

    // Process payment (dummy - always successful)
    const payRes = await fetch('/api/payments', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({order_id:oid,payment_mode:paymentMode}) })
    const payData = await payRes.json()
    setQuery(payData.query || '')

    // Clear cart
    await fetch('/api/cart?clear=1', { method:'DELETE' })
    setProcessing(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50"><Navbar />
        <div className="max-w-lg mx-auto px-6 pt-28 text-center">
          <QueryDisplay query={query} />
          <div className="bg-white rounded-3xl p-12 shadow-lg">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-14 h-14 text-green-500" /></div>
            <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
            <p className="text-gray-500 mb-2">Order #{orderId} placed successfully</p>
            <p className="text-gray-500 mb-8">Your order will be delivered soon.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm">
              <p><span className="font-semibold">Amount Paid:</span> {formatCurrency(total + deliveryFee)}</p>
              <p><span className="font-semibold">Payment Mode:</span> {paymentMode}</p>
              <p><span className="font-semibold">Status:</span> <span className="text-green-600 font-semibold">Successful</span></p>
            </div>
            <div className="flex gap-4">
              <GradientButton onClick={()=>router.push('/orders')} className="flex-1">View Orders</GradientButton>
              <button onClick={()=>router.push('/search')} className="flex-1 border-2 border-primary-500 text-primary-600 rounded-full py-3 font-semibold hover:bg-primary-50">Continue Shopping</button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-12">
        <h1 className="text-4xl font-bold mb-2">Checkout</h1>
        <QueryDisplay query={query} />
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Order Items</h3>
              {cart?.cart_items.map((item,i) => (
                <div key={i} className="flex justify-between py-3 border-b last:border-0">
                  <div><p className="font-medium">{item.medicine.medicine_name}</p><p className="text-sm text-gray-500">Qty: {item.quantity}</p></div>
                  <p className="font-semibold">{formatCurrency(Number(item.medicine.price)*item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Online','UPI','Card','COD'].map(m => (
                  <button key={m} onClick={()=>setPaymentMode(m)} className={`p-4 rounded-xl border-2 font-medium transition-all ${paymentMode===m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{m}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
              <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(deliveryFee)}</span></div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span className="gradient-text">{formatCurrency(total+deliveryFee)}</span></div>
              </div>
              <GradientButton onClick={handlePayment} disabled={processing||!cart?.cart_items.length} className="w-full flex items-center justify-center gap-2" size="lg">
                <ShoppingBag className="w-5 h-5" /> {processing ? 'Processing...' : 'Pay Now'}
              </GradientButton>
              <p className="text-xs text-gray-400 text-center mt-3">*Dummy payment - always successful</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
