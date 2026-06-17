'use client'
import { useState, useEffect } from 'react'
import { QueryDisplay, LoadingSpinner } from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchData = () => { fetch('/api/deliveries').then(r=>r.json()).then(d=>{ setDeliveries(d.deliveries||[]); setQuery(d.query||''); setLoading(false) }) }
  useEffect(()=>{ fetchData() },[])

  const updateStatus = async (deliveryId:number, status:string) => {
    await fetch('/api/deliveries', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ delivery_id:deliveryId, delivery_status:status }) })
    fetchData()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Delivery <span className="gradient-text">Management</span></h1>
      <QueryDisplay query={query} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Delivery ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Order ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Address</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Fee</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Estimated Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {deliveries.map((d:Record<string,unknown>) => {
              const order = d.order as {customer:{full_name:string, address:string}} | null
              return (
                <tr key={d.delivery_id as number} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">#{d.delivery_id as number}</td>
                  <td className="px-4 py-3">#{d.order_id as number}</td>
                  <td className="px-4 py-3 text-sm">{order?.customer?.full_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" title={d.delivery_address as string}>{d.delivery_address as string || order?.customer?.address || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(d.delivery_fee as number)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.delivery_status === 'Delivered' ? 'bg-green-100 text-green-800' : d.delivery_status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{d.delivery_status as string}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(d.delivery_date as string || d.created_at as string)}</td>
                  <td className="px-4 py-3">
                    <select value={d.delivery_status as string} onChange={e=>updateStatus(d.delivery_id as number, e.target.value)} className="text-xs px-2 py-1 rounded-lg border focus:border-primary-500 outline-none">
                      {['Processing','Shipped','Delivered','Failed'].map(s=><option key={s} value={s}>{s}</option>)}
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
