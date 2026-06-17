'use client'
import { useState, useEffect } from 'react'
import { QueryDisplay, LoadingSpinner } from '@/components/ui'
import { Users, Crown, Mail, Phone } from 'lucide-react'
import { getStatusColor, formatDate } from '@/lib/utils'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => { fetch('/api/customers').then(r=>r.json()).then(d=>{ setCustomers(d.customers||[]); setQuery(d.query||''); setLoading(false) }) }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Customer <span className="gradient-text">Management</span></h1><p className="text-gray-500">{customers.length} total customers</p></div>
      </div>
      <QueryDisplay query={query} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tier</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Points</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
            </tr></thead>
            <tbody>
              {customers.map((c:Record<string,unknown>) => (
                <tr key={c.customer_id as number} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white text-sm font-bold">{(c.full_name as string).charAt(0)}</div><div><p className="font-semibold">{c.full_name as string}</p><p className="text-sm text-gray-500">{c.email as string}</p></div></div></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.phone as string || 'N/A'}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.membership_tier === 'Premium' ? 'bg-primary-100 text-primary-800' : c.membership_tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{c.membership_tier as string}</span></td>
                  <td className="px-6 py-4 font-medium">{c.reward_points as number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(c.created_at as string)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
