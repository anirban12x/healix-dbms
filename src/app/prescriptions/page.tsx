'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { GradientButton, QueryDisplay, LoadingSpinner } from '@/components/ui'
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ doctor_name:'', doctor_registration_number:'', issue_date:'' })

  const fetchData = () => { fetch('/api/prescriptions').then(r=>r.json()).then(d=>{ setPrescriptions(d.prescriptions||[]); setQuery(d.query||''); setLoading(false) }) }
  useEffect(()=>{ fetchData() },[])

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/prescriptions', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    setShowForm(false); setForm({doctor_name:'',doctor_registration_number:'',issue_date:''}); fetchData()
  }

  const statusIcon = (s:string) => {
    if (s === 'Verified') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (s === 'Rejected') return <XCircle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-yellow-500" />
  }

  if (loading) return <><Navbar /><div className="pt-28"><LoadingSpinner /></div></>

  return (
    <main className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">My <span className="gradient-text">Prescriptions</span></h1>
          <GradientButton onClick={()=>setShowForm(!showForm)} className="flex items-center gap-2"><Upload className="w-5 h-5" /> Upload</GradientButton>
        </div>
        <QueryDisplay query={query} />

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4">
            <input type="text" value={form.doctor_name} onChange={e=>setForm({...form,doctor_name:e.target.value})} placeholder="Doctor Name" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none" />
            <input type="text" value={form.doctor_registration_number} onChange={e=>setForm({...form,doctor_registration_number:e.target.value})} placeholder="Doctor Registration Number" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none" />
            <input type="date" value={form.issue_date} onChange={e=>setForm({...form,issue_date:e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none" />
            <GradientButton type="submit">Submit Prescription</GradientButton>
          </form>
        )}

        <div className="space-y-4">
          {prescriptions.map((p:Record<string,unknown>) => {
            const issueDate = p.issue_date as string | undefined
            return (
              <div key={p.prescription_id as number} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-primary-500" /></div>
                <div className="flex-1">
                  <p className="font-bold">Prescription #{p.prescription_id as number}</p>
                  <p className="text-sm text-gray-500">Dr. {p.doctor_name as string} • Reg: {p.doctor_registration_number as string}</p>
                  {issueDate && <p className="text-sm text-gray-400">Issued: {formatDate(issueDate)}</p>}
                </div>
              <div className="flex items-center gap-2">
                {statusIcon(p.verification_status as string)}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(p.verification_status as string)}`}>{p.verification_status as string}</span>
              </div>
            </div>
          )
          })}
          {prescriptions.length === 0 && <p className="text-center text-gray-500 py-16">No prescriptions uploaded yet</p>}
        </div>

      </div>
    </main>
  )
}
