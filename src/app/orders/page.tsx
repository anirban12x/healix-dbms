'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Badge, QueryDisplay, LoadingSpinner } from '@/components/ui'
import { Package, Calendar, CreditCard } from 'lucide-react'
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => { fetch('/api/orders').then(r=>r.json()).then(d=>{ setOrders(d.orders||[]); setQuery(d.query||''); setLoading(false) }) }, [])

  if (loading) return <><Navbar /><div className="pt-28"><LoadingSpinner /></div></>

  return (
    <main className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-12">
        <h1 className="text-4xl font-bold mb-2">My <span className="gradient-text">Orders</span></h1>
        <QueryDisplay query={query} />
        {orders.length === 0 ? <p className="text-center text-gray-500 py-16">No orders yet</p> : (
          <div className="space-y-4">
            {orders.map((order:Record<string,unknown>) => {
              const items = order.order_items as {medicine:{medicine_name:string};quantity:number;item_total:number}[]
              const payment = order.payment as {payment_status:string;payment_mode:string}|null
              const delivery = order.delivery as {delivery_status:string}|null
              return (
                <div key={order.order_id as number} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-primary-500" />
                      <div>
                        <p className="font-bold">Order #{order.order_id as number}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDateTime(order.order_date as string)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status as string)}`}>{order.order_status as string}</span>
                      {payment && <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.payment_status)}`}>{payment.payment_status}</span>}
                      {delivery && <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(delivery.delivery_status)}`}>{delivery.delivery_status}</span>}
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    {items?.map((item,i) => (
                      <div key={i} className="flex justify-between text-sm"><span>{item.medicine.medicine_name} × {item.quantity}</span><span className="font-medium">{formatCurrency(item.item_total)}</span></div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500"><CreditCard className="w-4 h-4" />{payment?.payment_mode || 'Pending'}</div>
                    <p className="text-xl font-bold gradient-text">{formatCurrency(order.total_amount as number)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
