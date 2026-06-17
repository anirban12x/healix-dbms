'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pill, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { GradientButton } from '@/components/ui'
import { AuthBackground } from '@/components/Decorations'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'customer' | 'admin'>('customer')
  const [email, setEmail] = useState('customer@healix.com')
  const [password, setPassword] = useState('customer123')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleChange = (newRole: 'customer' | 'admin') => {
    setRole(newRole)
    if (newRole === 'customer') {
      setEmail('customer@healix.com')
      setPassword('customer123')
    } else {
      setEmail('admin@healix.com')
      setPassword('admin123')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { 
        method: 'POST', 
        credentials: 'same-origin', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password, role }) 
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      // Force a full navigation so client components (eg. Navbar) re-check session
      window.location.href = role === 'admin' ? '/admin' : '/search'
    } catch { 
      setError('Something went wrong') 
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 relative overflow-hidden">
      
      {/* Left - GIF Animation (Entire Left Side) */}
      <div className="hidden lg:block w-1/2 relative bg-slate-100 overflow-hidden border-r border-slate-200 z-10">
        <img 
          src="/images/gif1.gif" 
          alt="Login Animation" 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallback = parent.querySelector('.gif-fallback');
              if (fallback) fallback.classList.remove('hidden');
            }
          }}
        />
        {/* Visual Fallback Container in case GIF is missing */}
        <div className="gif-fallback hidden absolute inset-0 bg-gradient-to-br from-violet-500/10 via-slate-50 to-pink-500/5 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-6 shadow-md">
            <Pill className="w-8 h-8 text-white animate-float" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Healix Portal</h1>
          <p className="text-slate-500 font-semibold text-sm max-w-sm mb-4 leading-relaxed">
            Placeholder for <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-xs">/images/login-animation.gif</code>
          </p>
          <div className="border border-dashed border-slate-300 rounded-2xl p-6 bg-white/60 max-w-xs shadow-sm">
            <span className="text-xs font-bold text-violet-650 uppercase tracking-widest">Awaiting Media Asset</span>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
              Place your custom pharmacy GIF animation at the path above to show it here.
              Here you will see a preview animation.
            </p>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-transparent z-10">
        {/* Colorful animations behind form */}
        <AuthBackground />

        <div className="w-full max-w-md relative z-10 glass rounded-[2rem] p-8 md:p-10 shadow-[0_15px_50px_-10px_rgba(139,92,246,0.12)] border border-slate-200 bg-white/85">
          <div className="flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shadow-md bg-white border border-slate-200/50 p-1">
              <img src="/images/logo.png" alt="Healix Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
              Healix
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1 text-center">Welcome Back</h2>
          <p className="text-sm text-slate-500 font-semibold mb-6 text-center">Sign in to your account to continue</p>

          {/* Role Selector */}
          <div className="bg-slate-200/80 border border-slate-200 rounded-2xl p-1 flex mb-6 shadow-inner">
            <button 
              type="button"
              onClick={() => handleRoleChange('customer')} 
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all click-feedback ${
                role === 'customer' 
                  ? 'bg-white shadow-sm text-primary-600 border border-slate-200/30' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Customer
            </button>
            <button 
              type="button"
              onClick={() => handleRoleChange('admin')} 
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all click-feedback ${
                role === 'admin' 
                  ? 'bg-white shadow-sm text-secondary-650 border border-slate-200/30' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Credentials hint */}
          <div className="bg-violet-50/80 border border-violet-100/60 rounded-2xl p-4 mb-6 text-xs text-left shadow-sm">
            <p className="font-extrabold text-violet-850 mb-1">Demo Credentials Prefilled:</p>
            <p className="text-slate-655 font-semibold">
              Role: <span className="font-bold text-slate-800 uppercase">{role}</span> • Email: <span className="font-bold text-slate-850">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5 text-left">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-750 px-4 py-3.5 rounded-xl text-xs font-bold leading-relaxed shadow-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Email address" 
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-250 focus:border-violet-500 focus:bg-white bg-white/70 outline-none transition-all font-semibold text-slate-800" 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type={showPass ? 'text' : 'password'} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Password" 
                required
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-250 focus:border-violet-500 focus:bg-white bg-white/70 outline-none transition-all font-semibold text-slate-800" 
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <GradientButton type="submit" disabled={loading} className="w-full py-4 text-sm font-extrabold mt-2 shadow-md hover:shadow-lg" size="lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </GradientButton>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500 font-semibold">
            Don&apos;t have an account? <Link href="/register" className="text-primary-600 font-bold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
