'use client'
import { useState, useEffect } from 'react'
import { StatCard, QueryDisplay, LoadingSpinner } from '@/components/ui'
import { Users, Package, ShoppingCart, CreditCard, Truck, AlertTriangle, TrendingUp, Crown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const COLORS = ['#ec4899','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444']

export default function AdminDashboard() {
  const [data, setData] = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/reports').then(r=>r.json()).then(d=>{ setData(d); setLoading(false) }).catch(()=>setLoading(false)) }, [])

  if (loading) return <LoadingSpinner />

  const stats = (data?.stats || {}) as Record<string,number>
  const charts = (data?.charts || {}) as Record<string,unknown[]>
  const queries = (data?.queries || {}) as Record<string,string>

  return (
    <div>
      <div className="mb-4"><h1 className="text-3xl font-bold">Admin <span className="gradient-text">Dashboard</span></h1><p className="text-gray-500">Overview of your pharmacy management system</p></div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {Object.entries(queries).map(([key,val]) => (
          <QueryDisplay key={key} query={val} />
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue||0)} icon={<TrendingUp className="w-6 h-6"/>} color="primary" />
        <StatCard title="Total Orders" value={stats.totalOrders||0} icon={<ShoppingCart className="w-6 h-6"/>} color="secondary" />
        <StatCard title="Total Medicines" value={stats.totalMedicines||0} icon={<Package className="w-6 h-6"/>} color="blue" />
        <StatCard title="Total Customers" value={stats.totalCustomers||0} icon={<Users className="w-6 h-6"/>} color="green" />
        <StatCard title="Premium Customers" value={stats.premiumCustomers||0} icon={<Crown className="w-6 h-6"/>} color="yellow" />
        <StatCard title="Pending Deliveries" value={stats.pendingDeliveries||0} icon={<Truck className="w-6 h-6"/>} color="blue" />
        <StatCard title="Low Stock Alerts" value={stats.lowStockCount||0} icon={<AlertTriangle className="w-6 h-6"/>} color="red" />
        <StatCard title="Expired Medicines" value={stats.expiredCount||0} icon={<AlertTriangle className="w-6 h-6"/>} color="red" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={(charts.monthlyRevenue as {month:string;revenue:number;orders:number}[]) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tickFormatter={(v:string)=>new Date(v).toLocaleDateString('en',{month:'short'})} />
              <YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} dot={{fill:'#ec4899'}} name="Revenue" />
              <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3} dot={{fill:'#8b5cf6'}} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={(charts.ordersByStatus as {status:string;count:number}[]) || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({name,percent}:{name?:string;percent?:number})=>`${name || ''} ${((percent||0)*100).toFixed(0)}%`}>
                {((charts.ordersByStatus as unknown[]) || []).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Top Selling Medicines</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(charts.topMedicines as {name:string;sold:number}[]) || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" /><YAxis type="category" dataKey="name" width={120} tick={{fontSize:12}} /><Tooltip />
              <Bar dataKey="sold" fill="#ec4899" radius={[0,8,8,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={(charts.paymentStats as {status:string;count:number}[]) || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                {((charts.paymentStats as unknown[]) || []).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
