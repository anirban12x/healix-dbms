'use client'
import { useState, useEffect } from 'react'
import { QueryDisplay, LoadingSpinner } from '@/components/ui'
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchData = () => { fetch('/api/orders').then(r=>r.json()).then(d=>{ setOrders(d.orders||[]); setQuery(d.query||''); setLoading(false) }) }
  useEffect(()=>{ fetchData() },[])

  const updateStatus = async (orderId:number, status:string) => {
    await fetch('/api/orders', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ order_id:orderId, order_status:status }) })
    fetchData()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Order <span className="gradient-text">Management</span></h1>
      <QueryDisplay query={query} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Order ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Total</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {orders.slice(0,50).map((o:Record<string,unknown>) => {
              const cust = o.customer as {full_name:string}
              return (
                <tr key={o.order_id as number} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">#{o.order_id as number}</td>
                  <td className="px-4 py-3 text-sm">{cust?.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(o.order_date as string)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(o.order_status as string)}`}>{o.order_status as string}</span></td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(o.total_amount as number)}</td>
                  <td className="px-4 py-3">
                    <select value={o.order_status as string} onChange={e=>updateStatus(o.order_id as number, e.target.value)} className="text-xs px-2 py-1 rounded-lg border focus:border-primary-500 outline-none">
                      {['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
