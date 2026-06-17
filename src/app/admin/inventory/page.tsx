'use client'
import { useState, useEffect } from 'react'
import { GradientButton, QueryDisplay, LoadingSpinner } from '@/components/ui'
import { Package, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchData = () => { fetch('/api/inventory').then(r=>r.json()).then(d=>{ setInventory(d.inventory||[]); setQuery(d.query||''); setLoading(false) }) }
  useEffect(()=>{ fetchData() },[])

  const updateStock = async (id:number, currentQty:number, change:number) => {
    const newQty = Math.max(0, currentQty + change)
    await fetch('/api/inventory', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ inventory_id:id, stock_quantity:newQty }) })
    fetchData()
  }

  if (loading) return <LoadingSpinner />

  const lowStock = inventory.filter((i:Record<string,unknown>) => (i.stock_quantity as number) < (i.reorder_level as number))
  const outOfStock = inventory.filter((i:Record<string,unknown>) => (i.stock_quantity as number) === 0)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Inventory <span className="gradient-text">Management</span></h1>
      <p className="text-gray-500 mb-2">{inventory.length} items tracked • {lowStock.length} low stock • {outOfStock.length} out of stock</p>
      <QueryDisplay query={query} />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><p className="text-sm text-gray-500">Total Items</p><p className="text-3xl font-bold gradient-text">{inventory.length}</p></div>
        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200"><p className="text-sm text-yellow-700">Low Stock</p><p className="text-3xl font-bold text-yellow-600">{lowStock.length}</p></div>
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200"><p className="text-sm text-red-700">Out of Stock</p><p className="text-3xl font-bold text-red-600">{outOfStock.length}</p></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Medicine</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Stock</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Reorder Level</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {inventory.map((inv:Record<string,unknown>) => {
              const med = inv.medicine as {medicine_name:string;manufacturer:string;price:number;category?:{category_name:string}}
              const qty = inv.stock_quantity as number
              const reorder = inv.reorder_level as number
              return (
                <tr key={inv.inventory_id as number} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="font-semibold text-sm">{med.medicine_name}</p><p className="text-xs text-gray-500">{med.manufacturer} • {formatCurrency(med.price)}</p></td>
                  <td className="px-4 py-3 font-bold text-lg">{qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{reorder}</td>
                  <td className="px-4 py-3">
                    {qty === 0 ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Out of Stock</span>
                     : qty < reorder ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Low Stock</span>
                     : <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">In Stock</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>updateStock(inv.inventory_id as number, qty, 10)} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Add 10"><ArrowUp className="w-4 h-4"/></button>
                      <button onClick={()=>updateStock(inv.inventory_id as number, qty, -10)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Remove 10"><ArrowDown className="w-4 h-4"/></button>
                    </div>
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
