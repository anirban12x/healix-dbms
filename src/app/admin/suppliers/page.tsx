'use client'
import { useState, useEffect } from 'react'
import { GradientButton, QueryDisplay, LoadingSpinner, Modal } from '@/components/ui'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ supplier_name: '', email: '', phone: '', address: '' })

  const fetchData = () => { fetch('/api/suppliers').then(r=>r.json()).then(d=>{ setSuppliers(d.suppliers||[]); setQuery(d.query||''); setLoading(false) }) }
  useEffect(()=>{ fetchData() },[])

  const handleAdd = async (e:React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/suppliers', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    setShowAdd(false); setForm({ supplier_name: '', email: '', phone: '', address: '' }); fetchData()
  }

  const handleDelete = async (id:number) => {
    if (!confirm('Delete this supplier?')) return
    await fetch(`/api/suppliers?id=${id}`, { method:'DELETE' })
    fetchData()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div><h1 className="text-3xl font-bold">Supplier <span className="gradient-text">Management</span></h1><p className="text-gray-500">{suppliers.length} suppliers</p></div>
        <GradientButton onClick={()=>setShowAdd(true)} className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add Supplier</GradientButton>
      </div>
      <QueryDisplay query={query} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Supplier Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Address</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {suppliers.map((s:Record<string,unknown>) => (
              <tr key={s.supplier_id as number} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-sm">{s.supplier_name as string}</td>
                <td className="px-4 py-3 text-sm">{s.email as string}</td>
                <td className="px-4 py-3 text-sm">{s.phone as string || 'N/A'}</td>
                <td className="px-4 py-3 text-sm max-w-xs truncate" title={s.address as string}>{s.address as string || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={()=>handleDelete(s.supplier_id as number)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Add Supplier">
        <form onSubmit={handleAdd} className="space-y-4">
          <input type="text" value={form.supplier_name} onChange={e=>setForm({...form, supplier_name:e.target.value})} placeholder="Supplier Name" required className="w-full px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
          <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" required className="w-full px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
          <input type="text" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Phone" className="w-full px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
          <textarea value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder="Address" rows={3} className="w-full px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
          <GradientButton type="submit" className="w-full">Add Supplier</GradientButton>
        </form>
      </Modal>


    </div>
  )
}
