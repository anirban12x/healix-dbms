'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pill, Mail, Lock, User, Phone, MapPin } from 'lucide-react'
import { GradientButton } from '@/components/ui'
import { AuthBackground } from '@/components/Decorations'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', gender: 'Male', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      router.push('/search')
    } catch { 
      setError('Something went wrong') 
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-slate-50 text-slate-900 overflow-hidden">
      {/* Moving blobs, glowing gradients, and medical SVGs */}
      <AuthBackground />

      <div className="w-full max-w-lg relative z-10">
        {/* Card Frame */}
        <div className="glass rounded-[2rem] p-8 md:p-10 shadow-[0_15px_50px_-10px_rgba(139,92,246,0.12)] border border-slate-200 bg-white/85">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shadow-md bg-white border border-slate-200/50 p-1">
              <img src="/images/logo.png" alt="Healix Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
              Healix
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center mb-1">Create Account</h2>
          <p className="text-sm text-slate-500 font-semibold mb-6 text-center">Join Healix for a premium healthcare experience</p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3.5 rounded-xl text-xs font-bold leading-relaxed shadow-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={form.full_name} 
                onChange={e => setForm({...form, full_name: e.target.value})} 
                placeholder="Full Name" 
                required 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-250 focus:border-violet-500 focus:bg-white bg-white/70 outline-none transition-all font-semibold text-slate-800" 
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                placeholder="Email address" 
                required 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-250 focus:border-violet-500 focus:bg-white bg-white/70 outline-none transition-all font-semibold text-slate-800" 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                placeholder="Password (min. 6 characters)" 
                required 
                minLength={6} 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-250 focus:border-violet-500 focus:bg-white bg-white/70 outline-none transition-all font-semibold text-slate-800" 
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="tel" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                placeholder="Phone number" 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-250 focus:border-violet-500 focus:bg-white bg-white/70 outline-none transition-all font-semibold text-slate-800" 
              />
            </div>

            <div className="relative">
              <select 
                value={form.gender} 
                onChange={e => setForm({...form, gender: e.target.value})} 
                className="w-full px-4 py-3.5 rounded-xl border border-slate-250 focus:border-violet-500 focus:bg-white bg-white/70 outline-none transition-all font-semibold text-slate-800"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})} 
                placeholder="Shipping Address" 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-250 focus:border-violet-500 focus:bg-white bg-white/70 outline-none transition-all font-semibold text-slate-800" 
              />
            </div>

            <GradientButton type="submit" disabled={loading} className="w-full py-4 text-sm font-extrabold mt-2 shadow-md hover:shadow-lg" size="lg">
              {loading ? 'Creating Account...' : 'Create Account'}
            </GradientButton>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500 font-semibold">
            Already have an account? <Link href="/login" className="text-primary-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
