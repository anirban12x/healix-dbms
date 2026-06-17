'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCart, User, Search, Menu, X, Pill, LogOut, FileText, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    // Check auth
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUser(d))
      .catch(() => { })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 pt-4 ${scrolled ? 'translate-y-0' : 'translate-y-2'}`}>
      <nav className={`max-w-7xl mx-auto rounded-3xl transition-all duration-500 ${
        scrolled 
          ? 'navbar-gradient-border py-3 px-6' 
          : 'bg-white/95 backdrop-blur-md border border-slate-200/80 py-4 px-8 shadow-md'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.05)] border border-slate-200/50 group-hover:scale-105 transition-all duration-300 bg-white p-1">
              <img src="/images/logo.png" alt="Healix Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Healix
            </span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="relative text-slate-700 hover:text-primary-650 font-bold transition-colors text-sm hover:scale-105 click-feedback group flex flex-col items-center">
              Home
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary-500 scale-0 group-hover:scale-100 transition-transform duration-200" />
            </Link>
            <Link href="/search" className="relative text-slate-700 hover:text-primary-650 font-bold transition-colors text-sm hover:scale-105 click-feedback group flex flex-col items-center">
              Medicines
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-secondary-500 scale-0 group-hover:scale-100 transition-transform duration-200" />
            </Link>
            {user && (
              <Link href="/orders" className="relative text-slate-700 hover:text-primary-650 font-bold transition-colors text-sm hover:scale-105 click-feedback flex items-center gap-1.5 group">
                <ShoppingBag className="w-4 h-4 text-primary-500" /> Orders
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary-500 scale-0 group-hover:scale-100 transition-transform duration-200" />
              </Link>
            )}
            {user && (
              <Link href="/prescriptions" className="relative text-slate-700 hover:text-primary-650 font-bold transition-colors text-sm hover:scale-105 click-feedback flex items-center gap-1.5 group">
                <FileText className="w-4 h-4 text-violet-500" /> Prescriptions
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-violet-500 scale-0 group-hover:scale-100 transition-transform duration-200" />
              </Link>
            )}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/search" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all hover:scale-105 click-feedback">
              <Search className="w-4 h-4 text-slate-700" />
            </Link>
            
            {user ? (
              <>
                <Link href="/cart" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all hover:scale-105 relative click-feedback">
                  <ShoppingCart className="w-4 h-4 text-slate-700" />
                </Link>
                <Link href={user.role === 'admin' ? '/admin' : '/profile'} className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-500/10 to-pink-500/10 hover:from-violet-500/20 hover:to-pink-500/20 border border-pink-200/80 transition-all hover:scale-105 text-slate-900 font-bold text-sm px-4 flex items-center gap-2 click-feedback">
                  <User className="w-4 h-4 text-violet-500" />
                  {user.name.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100/80 text-red-650 hover:text-red-700 transition-all click-feedback">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-750 hover:text-slate-950 font-bold text-sm transition-colors hover:scale-105 click-feedback px-3">
                  Login
                </Link>
                <Link href="/register" className="gradient-bg text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:scale-105 transition-all click-feedback">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button className="md:hidden p-2 rounded-xl bg-slate-100 border border-slate-200/80" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden max-w-7xl mx-auto mt-2 rounded-3xl glass-premium border border-slate-200/80 p-6 space-y-4 shadow-lg bg-white/95"
          >
            <Link href="/" className="block py-2.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold transition-all" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/search" className="block py-2.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold transition-all" onClick={() => setMenuOpen(false)}>Medicines</Link>
            
            {user ? (
              <>
                <Link href="/orders" className="block py-2.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold transition-all" onClick={() => setMenuOpen(false)}>Orders</Link>
                <Link href="/prescriptions" className="block py-2.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold transition-all" onClick={() => setMenuOpen(false)}>Prescriptions</Link>
                <Link href="/cart" className="block py-2.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold transition-all" onClick={() => setMenuOpen(false)}>Cart</Link>
                <Link href="/profile" className="block py-2.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-bold transition-all" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left py-2.5 px-4 rounded-xl hover:bg-red-50 text-red-650 font-bold transition-all">Logout</button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" className="block text-center py-2.5 rounded-xl border border-slate-200/80 text-slate-800 font-bold hover:bg-slate-50" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" className="block text-center py-2.5 rounded-xl gradient-bg text-white font-bold" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
