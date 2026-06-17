'use client'
import { useState, useEffect } from 'react'
import { QueryDisplay, LoadingSpinner } from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchData = () => { fetch('/api/payments').then(r=>r.json()).then(d=>{ setPayments(d.payments||[]); setQuery(d.query||''); setLoading(false) }) }
  useEffect(()=>{ fetchData() },[])

  const updateStatus = async (paymentId:number, status:string) => {
    await fetch('/api/payments', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ payment_id:paymentId, payment_status:status }) })
    fetchData()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Payment <span className="gradient-text">Management</span></h1>
      <QueryDisplay query={query} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Payment ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Order ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Mode</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {payments.map((p:Record<string,unknown>) => {
              const order = p.order as {customer:{full_name:string}} | null
              return (
                <tr key={p.payment_id as number} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">#{p.payment_id as number}</td>
                  <td className="px-4 py-3">#{p.order_id as number}</td>
                  <td className="px-4 py-3 text-sm">{order?.customer?.full_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{p.payment_mode as string}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.payment_amount as number)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.payment_status === 'Successful' ? 'bg-green-100 text-green-800' : p.payment_status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.payment_status as string}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(p.payment_date as string)}</td>
                  <td className="px-4 py-3">
                    <select value={p.payment_status as string} onChange={e=>updateStatus(p.payment_id as number, e.target.value)} className="text-xs px-2 py-1 rounded-lg border focus:border-primary-500 outline-none">
                      {['Pending','Successful','Failed'].map(s=><option key={s} value={s}>{s}</option>)}
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
