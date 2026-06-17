'use client'
import { useState, useEffect } from 'react'
import { QueryDisplay, LoadingSpinner } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => { fetch('/api/audit-logs').then(r=>r.json()).then(d=>{ setLogs(d.logs||[]); setQuery(d.query||''); setLoading(false) }) }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">System <span className="gradient-text">Audit Logs</span></h1>
      <QueryDisplay query={query} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Log ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Action Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Table Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Performed By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Description</th>
            </tr></thead>
            <tbody>
              {logs.map((log:Record<string,unknown>) => (
                <tr key={log.log_id as number} className="border-b hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 font-semibold">#{log.log_id as number}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{log.action_type as string}</span></td>
                  <td className="px-4 py-3 text-gray-600">{log.table_name as string}</td>
                  <td className="px-4 py-3 text-gray-600">{log.performed_by as string}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(log.action_time as string)}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{log.description as string}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No audit logs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
