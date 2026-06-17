'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { LoadingSpinner } from '@/components/ui'
import { User, Mail, Phone, MapPin, Calendar, Star, Shield } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/auth/me').then(r=>r.json()).then(d=>{ setUser(d); setLoading(false) }).catch(()=>setLoading(false)) }, [])

  if (loading) return <><Navbar /><div className="pt-28"><LoadingSpinner /></div></>
  if (!user) return <><Navbar /><div className="pt-28 text-center"><p>Please login to view profile</p></div></>

  return (
    <main className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="gradient-bg h-32 relative">
            <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-primary-500" />
            </div>
          </div>
          <div className="pt-16 px-8 pb-8">
            <h1 className="text-2xl font-bold">{user.name as string}</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1"><Mail className="w-4 h-4" />{user.email as string}</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-600"><Shield className="w-5 h-5 text-primary-500" /><span className="font-medium">Role: {user.role as string}</span></div>
              <div className="flex items-center gap-3 text-gray-600"><Star className="w-5 h-5 text-yellow-500" /><span className="font-medium">ID: {user.id as number}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
