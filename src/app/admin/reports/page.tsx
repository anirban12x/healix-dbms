'use client'
import { useState, useEffect } from 'react'
import { QueryDisplay, LoadingSpinner } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export default function AdminReportsPage() {
  const [data, setData] = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/reports').then(r=>r.json()).then(d=>{ setData(d); setLoading(false) }).catch(()=>setLoading(false)) }, [])

  if (loading) return <LoadingSpinner />

  const stats = (data?.stats || {}) as Record<string,number>
  const charts = (data?.charts || {}) as Record<string,unknown[]>
  const queries = (data?.queries || {}) as Record<string,string>

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold">DBMS Project <span className="gradient-text">Reports</span></h1><p className="text-gray-500">Comprehensive analytical reports generated from database views and queries</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(queries).map(([key,val]) => (
          <QueryDisplay key={key} query={val} />
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><p className="text-sm text-gray-500 font-medium">Total Revenue</p><p className="text-3xl font-bold mt-1 text-primary-500">{formatCurrency(stats.totalRevenue||0)}</p></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><p className="text-sm text-gray-500 font-medium">Inventory Asset Value</p><p className="text-3xl font-bold mt-1 text-secondary-500">{formatCurrency(stats.inventoryValue||0)}</p></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><p className="text-sm text-gray-500 font-medium">Low Stock Items</p><p className="text-3xl font-bold mt-1 text-yellow-600">{stats.lowStockCount||0}</p></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><p className="text-sm text-gray-500 font-medium">Expired Medicines</p><p className="text-3xl font-bold mt-1 text-red-600">{stats.expiredCount||0}</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Selling Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Top Selling Medicines</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b text-gray-500"><th className="px-4 py-2 text-left">Medicine Name</th><th className="px-4 py-2 text-right">Units Sold</th><th className="px-4 py-2 text-right">Revenue</th></tr></thead>
              <tbody>
                {((charts.topMedicines as {name:string;sold:number;revenue:number}[]) || []).map((m,i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50"><td className="px-4 py-3 font-semibold">{m.name}</td><td className="px-4 py-3 text-right">{m.sold}</td><td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(m.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Revenue Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Monthly Revenue Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b text-gray-500"><th className="px-4 py-2 text-left">Month</th><th className="px-4 py-2 text-right">Orders</th><th className="px-4 py-2 text-right">Revenue</th></tr></thead>
              <tbody>
                {((charts.monthlyRevenue as {month:string;orders:number;revenue:number}[]) || []).map((m,i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{new Date(m.month).toLocaleDateString('en', { year:'numeric', month:'long' })}</td>
                    <td className="px-4 py-3 text-right">{m.orders}</td>
                    <td className="px-4 py-3 text-right font-medium text-primary-500">{formatCurrency(m.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}
