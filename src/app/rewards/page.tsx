'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { QueryDisplay, LoadingSpinner } from '@/components/ui'
import { Gift, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Record<string,unknown>[]>([])
  const [customer, setCustomer] = useState<{reward_points:number;membership_tier:string}|null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => { fetch('/api/rewards').then(r=>r.json()).then(d=>{ setRewards(d.rewards||[]); setCustomer(d.customer); setQuery(d.query||''); setLoading(false) }) }, [])

  if (loading) return <><Navbar /><div className="pt-28"><LoadingSpinner /></div></>

  return (
    <main className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-12">
        <h1 className="text-4xl font-bold mb-2">My <span className="gradient-text">Rewards</span></h1>
        <QueryDisplay query={query} />
        
        {customer && (
          <div className="gradient-bg rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-20"><Gift className="w-32 h-32" /></div>
            <div className="relative z-10">
              <p className="text-lg opacity-90 mb-2">Total Reward Points</p>
              <p className="text-5xl font-bold mb-4">{customer.reward_points}</p>
              <div className="flex items-center gap-2"><Star className="w-5 h-5" /><span className="font-semibold">{customer.membership_tier} Member</span></div>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="space-y-3">
          {rewards.map((r:Record<string,unknown>, i:number) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(r.points_earned as number) > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {(r.points_earned as number) > 0 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{(r.points_earned as number) > 0 ? `Earned ${r.points_earned} points` : `Used ${r.points_used} points`}</p>
                <p className="text-sm text-gray-500">{formatDateTime(r.transaction_date as string)}</p>
              </div>
              <span className={`font-bold ${(r.points_earned as number) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(r.points_earned as number) > 0 ? `+${r.points_earned}` : `-${r.points_used}`}
              </span>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
