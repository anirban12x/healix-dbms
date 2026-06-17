'use client'
import { useState, useEffect } from 'react'
import { GradientButton, QueryDisplay, LoadingSpinner, Modal } from '@/components/ui'
import { Plus, Edit, Trash2, Pill } from 'lucide-react'
import { formatCurrency, getStatusColor } from '@/lib/utils'

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Record<string,unknown>[]>([])
  const [categories, setCategories] = useState<{category_id:number;category_name:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({medicine_name:'',strength:'',manufacturer:'',price:'',requires_prescription:false,category_id:'',expiry_date:'',stock_quantity:'',reorder_level:'10',description:''})

  const fetchData = () => { fetch('/api/medicines?limit=200').then(r=>r.json()).then(d=>{ setMedicines(d.medicines||[]); setQuery(d.query||''); setLoading(false) }) }
  useEffect(()=>{ fetchData(); fetch('/api/categories').then(r=>r.json()).then(d=>setCategories(d.categories||[])) },[])

  const handleAdd = async (e:React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/medicines', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    setShowAdd(false); fetchData()
  }

  const handleDelete = async (id:number) => {
    if(!confirm('Delete this medicine?')) return
    await fetch(`/api/medicines/${id}`, { method:'DELETE' })
    fetchData()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div><h1 className="text-3xl font-bold">Medicine <span className="gradient-text">Management</span></h1><p className="text-gray-500">{medicines.length} medicines</p></div>
        <GradientButton onClick={()=>setShowAdd(true)} className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add Medicine</GradientButton>
      </div>
      <QueryDisplay query={query} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Medicine</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Rx</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
            </tr></thead>
            <tbody>
              {medicines.map((m:Record<string,unknown>) => {
                const inv = m.inventory as {stock_quantity:number}|null
                const cat = m.category as {category_name:string}|null
                return (
                  <tr key={m.medicine_id as number} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="font-semibold text-sm">{m.medicine_name as string}</p><p className="text-xs text-gray-500">{m.manufacturer as string} • {m.strength as string}</p></td>
                    <td className="px-4 py-3 text-sm">{cat?.category_name||'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(m.price as number)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${!inv||inv.stock_quantity===0?'bg-red-100 text-red-800':inv.stock_quantity<20?'bg-yellow-100 text-yellow-800':'bg-green-100 text-green-800'}`}>{inv?.stock_quantity??0}</span></td>
                    <td className="px-4 py-3">{m.requires_prescription ? <span className="text-primary-500 text-xs font-semibold">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                    <td className="px-4 py-3"><button onClick={()=>handleDelete(m.medicine_id as number)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4"/></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Add Medicine">
        <form onSubmit={handleAdd} className="space-y-4">
          <input type="text" value={form.medicine_name} onChange={e=>setForm({...form,medicine_name:e.target.value})} placeholder="Medicine Name" required className="w-full px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={form.strength} onChange={e=>setForm({...form,strength:e.target.value})} placeholder="Strength" className="px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
            <input type="text" value={form.manufacturer} onChange={e=>setForm({...form,manufacturer:e.target.value})} placeholder="Manufacturer" className="px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Price" required className="px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
            <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="px-4 py-3 rounded-xl border focus:border-primary-500 outline-none">
              <option value="">Category</option>{categories.map(c=><option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" value={form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})} placeholder="Stock Qty" className="px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
            <input type="date" value={form.expiry_date} onChange={e=>setForm({...form,expiry_date:e.target.value})} className="px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.requires_prescription} onChange={e=>setForm({...form,requires_prescription:e.target.checked})} className="rounded" /><span className="text-sm">Requires Prescription</span></label>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" rows={3} className="w-full px-4 py-3 rounded-xl border focus:border-primary-500 outline-none" />
          <GradientButton type="submit" className="w-full">Add Medicine</GradientButton>
        </form>
      </Modal>


    </div>
  )
}
