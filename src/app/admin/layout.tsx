'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Pill, LayoutDashboard, Users, Package, Boxes, ShoppingCart, CreditCard, Truck, Building2, FileText, BarChart3, ScrollText, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui'

const links = [
  { href: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { href: '/admin/customers', icon: <Users className="w-5 h-5" />, label: 'Customers' },
  { href: '/admin/medicines', icon: <Package className="w-5 h-5" />, label: 'Medicines' },
  { href: '/admin/inventory', icon: <Boxes className="w-5 h-5" />, label: 'Inventory' },
  { href: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders' },
  { href: '/admin/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
  { href: '/admin/deliveries', icon: <Truck className="w-5 h-5" />, label: 'Deliveries' },
  { href: '/admin/suppliers', icon: <Building2 className="w-5 h-5" />, label: 'Suppliers' },
  { href: '/admin/prescriptions', icon: <FileText className="w-5 h-5" />, label: 'Prescriptions' },
  { href: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
  { href: '/admin/audit-logs', icon: <ScrollText className="w-5 h-5" />, label: 'Audit Logs' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || d.role !== 'admin') {
          router.push('/login')
        } else {
          setLoading(false)
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/50 bg-white p-1">
              <img src="/images/logo.png" alt="Healix Logo" className="w-full h-full object-contain" />
            </div>
            <div><span className="text-xl font-bold gradient-text">Healix</span><p className="text-xs text-gray-400">Admin Panel</p></div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all', pathname === l.href ? 'gradient-bg text-white shadow-md shadow-primary-500/25' : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600')}>
              {l.icon}{l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}

