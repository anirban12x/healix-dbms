'use client'
import { useState, useEffect } from 'react'
import { QueryDisplay, LoadingSpinner } from '@/components/ui'
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchData = () => { fetch('/api/prescriptions').then(r=>r.json()).then(d=>{ setPrescriptions(d.prescriptions||[]); setQuery(d.query||''); setLoading(false) }) }
  useEffect(()=>{ fetchData() },[])

  const handleVerify = async (id:number, status:string) => {
    await fetch('/api/prescriptions', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prescription_id:id, verification_status:status }) })
    fetchData()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Prescription <span className="gradient-text">Verification</span></h1>
      <QueryDisplay query={query} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Prescription ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Doctor Info</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Issue Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {prescriptions.map((p:Record<string,unknown>) => {
              const cust = p.customer as {full_name:string} | null
              return (
                <tr key={p.prescription_id as number} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400"/>#{p.prescription_id as number}</td>
                  <td className="px-4 py-3 text-sm">{cust?.full_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm"><p className="font-medium">Dr. {p.doctor_name as string}</p><p className="text-xs text-gray-500">Reg: {p.doctor_registration_number as string}</p></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.issue_date as string)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(p.verification_status as string)}`}>{p.verification_status as string}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={()=>handleVerify(p.prescription_id as number, 'Verified')} className="px-3 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-semibold text-xs">Approve</button>
                      <button onClick={()=>handleVerify(p.prescription_id as number, 'Rejected')} className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs">Reject</button>
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
