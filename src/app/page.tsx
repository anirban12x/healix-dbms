'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Upload, ArrowRight, ShieldCheck, Clock, Award, Star, 
  MessageSquare, Send, Sparkles, Plus, Check, Pill, ChevronLeft, 
  ChevronRight, Play, AlertCircle, FileText, CheckCircle2, ChevronRightCircle
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { LiquidGlassBackground, RotatingShapes, SectionDecorations } from '@/components/Decorations'
import { GradientButton, SafeImage } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

// Mock autocomplete medicines
const MOCK_MEDICINES = [
  { id: '1', name: 'Paracetamol 500mg', type: 'Tablet', price: 4.99, category: 'Painkiller' },
  { id: '2', name: 'Amoxicillin 250mg', type: 'Capsule', price: 12.50, category: 'Antibiotic' },
  { id: '3', name: 'Ibuprofen 400mg', type: 'Tablet', price: 5.99, category: 'Painkiller' },
  { id: '4', name: 'Atorvastatin 10mg', type: 'Tablet', price: 18.20, category: 'Cholesterol' },
  { id: '5', name: 'Metformin 500mg', type: 'Tablet', price: 9.80, category: 'Diabetes' },
  { id: '6', name: 'Cetirizine 10mg', type: 'Tablet', price: 3.50, category: 'Allergy' },
  { id: '7', name: 'Omeprazole 20mg', type: 'Capsule', price: 8.40, category: 'Acidity' },
]

// Mock medicine shelf
const SHELF_MEDICINES = [
  { id: 'm1', name: 'Healix MultiVitals', desc: 'Daily multivitamins for immune support & energy booster.', price: 19.99, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 128, type: 'violet' },
  { id: 'm2', name: 'Soothe Cough Syrup', desc: 'Fast-acting herbal honey formula for chesty cough relief.', price: 9.50, image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60', rating: 4.6, reviews: 84, type: 'pink' },
  { id: 'm3', name: 'DermaShield Moisturizer', desc: 'Clinical strength eczema repair and deep skin hydration.', price: 24.99, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 212, type: 'cyan' },
  { id: 'm4', name: 'SleepWell Melatonin 5mg', desc: 'Natural cherry-flavored sleep aid to promote restful sleep.', price: 14.99, image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 96, type: 'emerald' },
]

// Categories
const CATEGORIES = [
  { name: 'Pain Relief', count: '140+ Products', icon: '⚡', color: 'from-pink-500/10 to-rose-500/10', style: 'card-pink' },
  { name: 'Antibiotics', count: '85+ Products', icon: '🦠', color: 'from-violet-500/10 to-purple-500/10', style: 'card-violet' },
  { name: 'Cardiovascular', count: '62+ Products', icon: '❤️', color: 'from-red-500/10 to-orange-500/10', style: 'card-pink' },
  { name: 'Vitamins & Supps', count: '210+ Products', icon: '🌿', color: 'from-emerald-500/10 to-green-500/10', style: 'card-emerald' },
  { name: 'Diabetes Care', count: '45+ Products', icon: '🩸', color: 'from-cyan-500/10 to-blue-500/10', style: 'card-cyan' },
]

// Testimonials
const TESTIMONIALS = [
  { name: 'Sarah Jenkins', role: 'Verified Customer', text: 'Healix transformed how I buy my chronic medication. The AI pharmacist verified my prescription in minutes, and the shipping was fast!', rating: 5 },
  { name: 'Dr. James Carter', role: 'Medical Consultant', text: 'The verification framework Healix uses is top-notch. It ensures maximum patient safety and reduces pharmacy dispensing errors.', rating: 5 },
  { name: 'Alex Rivera', role: 'Verified Customer', text: 'Fast, secure, and incredibly beautiful interface. Ordering medication feels like a futuristic experience. High recommend!', rating: 5 }
]

export default function HomePage() {
  // Autocomplete Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<typeof MOCK_MEDICINES>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Medicine shelf click feedbacks
  const [cartState, setCartState] = useState<Record<string, 'idle' | 'adding' | 'added'>>({})

  // Chatbot State
  const [messages, setMessages] = useState([
    { id: '1', type: 'bot', text: 'Hello! I am your Healix AI Pharmacist. How can I help you today? You can ask me about medication details, side effects, or upload a prescription.' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Prescription Upload State
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [ocrLogs, setOcrLogs] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Testimonials Slider
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Click outside listener for search autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto scroll chat
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Handle autocomplete input
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (val.trim().length > 1) {
      const filtered = MOCK_MEDICINES.filter(m => 
        m.name.toLowerCase().includes(val.toLowerCase()) || 
        m.category.toLowerCase().includes(val.toLowerCase())
      )
      setSuggestions(filtered)
      setShowDropdown(true)
    } else {
      setSuggestions([])
      setShowDropdown(false)
    }
  }

  const triggerBotResponse = (userText: string) => {
    if (!userText.trim()) return

    const newMsgUser = { id: Date.now().toString(), type: 'user', text: userText }
    setMessages(prev => [...prev, newMsgUser])
    setInputMessage('')
    setIsTyping(true)

    // Simulate response based on keywords
    setTimeout(() => {
      let botText = "I apologize, but I didn't fully understand that. As an AI Pharmacist, I can assist you with details about Paracetamol, Omeprazole, prescription verification, or delivery timelines."
      const query = userText.toLowerCase()

      if (query.includes('cold') || query.includes('fever') || query.includes('paracetamol')) {
        botText = "For cold and mild fever symptoms, Paracetamol 500mg is commonly taken (1 tablet every 4-6 hours as needed, max 4g/day). Please avoid other medications containing acetaminophen to prevent accidental overdose."
      } else if (query.includes('prescription') || query.includes('upload')) {
        botText = "You can upload a scanned image or PDF of your doctor's prescription directly in our portal below. Our advanced AI-OCR engine will immediately extract the medicines for pharmacists to review."
      } else if (query.includes('delivery') || query.includes('shipping')) {
        botText = "We offer express delivery: within 2 hours for urban zones, and guaranteed next-day delivery nationwide. Orders containing verified prescriptions are fast-tracked automatically."
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', text: botText }])
      setIsTyping(false)
    }, 1200)
  }

  const handleChatSuggest = (prompt: string) => {
    triggerBotResponse(prompt)
  }

  const handleAddToCart = (id: string) => {
    setCartState(prev => ({ ...prev, [id]: 'adding' }))
    setTimeout(() => {
      setCartState(prev => ({ ...prev, [id]: 'added' }))
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: 1, quantity: 1 })
      }).catch(() => {})

      setTimeout(() => {
        setCartState(prev => ({ ...prev, [id]: 'idle' }))
      }, 1500)
    }, 800)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPrescriptionFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPrescriptionFile(e.target.files[0])
    }
  }

  const processPrescriptionFile = (file: File) => {
    setSelectedFile(file)
    setUploadState('uploading')
    setProgress(10)
    setOcrLogs([])

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer)
          triggerOcrSimulation()
          return 100
        }
        return p + 25
      })
    }, 300)
  }

  const triggerOcrSimulation = () => {
    setUploadState('processing')
    const logs = [
      'Establishing secure SSL tunnel connection...',
      'Running AI layout analysis & noise removal...',
      'Running optical character recognition (OCR)...',
      'Matching extracted keywords against drug registry...',
      'Validating medical doctor registration credentials...',
      'Verification analysis complete. Awaiting pharmacist approval.'
    ]

    logs.forEach((log, index) => {
      setTimeout(() => {
        setOcrLogs(prev => [...prev, log])
        if (index === logs.length - 1) {
          setTimeout(() => {
            setUploadState('success')
            fetch('/api/prescriptions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image_url: '/uploads/pres.jpg', status: 'Pending' })
            }).catch(() => {})
          }, 1000)
        }
      }, (index + 1) * 700)
    })
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-x-hidden pt-24">
      {/* Navbar visibility */}
      <Navbar />

      {/* Immersive background decoration */}
      <LiquidGlassBackground />
      <RotatingShapes />

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-6 pt-12 lg:pt-20 pb-16 z-20">
        {/* Additional Glowing blobs in Hero Section */}
        <div className="absolute top-[10%] left-[10%] w-[320px] h-[320px] rounded-full bg-pink-400/20 blur-[90px] animate-blob-1" />
        <div className="absolute bottom-[20%] right-[15%] w-[360px] h-[360px] rounded-full bg-violet-450/20 blur-[100px] animate-blob-2" />
        <div className="absolute top-[40%] left-[40%] w-[250px] h-[250px] rounded-full bg-cyan-300/15 blur-[80px] animate-blob-3" />

        {/* Floating Icons for Hero */}
        <SectionDecorations className="top-10 left-[5%] animate-float" color="pink" />
        <SectionDecorations className="top-40 right-[15%] animate-float-slow" color="cyan" />
        <SectionDecorations className="bottom-12 left-[30%] animate-float-fast" color="violet" />

        {/* Small floating shape details */}
        <div className="absolute top-[25%] right-[32%] animate-float-fast opacity-30 select-none">
          <svg className="w-8 h-8 stroke-pink-500" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <rect x="2" y="9" width="20" height="6" rx="3" />
            <path d="M12 9v6" />
          </svg>
        </div>

        <div className="absolute bottom-[35%] left-[8%] animate-float-slow opacity-25 select-none">
          <svg className="w-10 h-10 stroke-violet-500" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <path d="M12 2v20M2 12h20" strokeLinecap="round" />
          </svg>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading and Search */}
          <div className="lg:col-span-7 space-y-8 text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-pink-100/80 border border-pink-200/60 text-pink-700 text-xs font-extrabold select-none shadow-sm">
              <Sparkles className="w-4 h-4 text-pink-600 animate-pulse" />
              <span>Next-Gen Pharmacy Experience</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
              Your Health, <span className="gradient-text">Redefined</span> & Verified in Real-Time
            </h1>
            
            <p className="text-lg text-slate-650 font-semibold max-w-2xl leading-relaxed">
              Upload doctor prescriptions for instant smart-verification, consult our dedicated AI pharmacist assistant, and purchase genuine medications with guaranteed next-day delivery.
            </p>

            {/* Interactive Autocomplete Search Box */}
            <div ref={searchRef} className="relative max-w-xl">
              <div className="glass-premium rounded-2xl p-2.5 flex items-center shadow-lg border border-slate-200">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="w-5 h-5 text-slate-600" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    placeholder="Search medicines, categories, or symptoms..." 
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-bold text-base"
                  />
                </div>
                <GradientButton className="rounded-xl px-7 py-3.5 text-sm font-extrabold" onClick={() => window.location.href = `/search?q=${searchQuery}`}>
                  Search
                </GradientButton>
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showDropdown && suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-30 bg-white"
                  >
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-left">
                      Suggested Medicines
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {suggestions.map((med) => (
                        <li key={med.id}>
                          <Link href={`/search?q=${med.name}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-100 transition-colors text-left group">
                            <div>
                              <p className="font-bold text-slate-850 group-hover:text-primary-600 transition-colors">{med.name}</p>
                              <span className="text-xs text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full font-bold">{med.category}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-slate-900">{formatCurrency(med.price)}</span>
                              <p className="text-[10px] text-slate-400 font-bold">{med.type}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="text-xs font-bold bg-pink-50 text-pink-700 border border-pink-100 px-4 py-2 rounded-full shadow-sm">⚡ Over 500+ Medicines Available</span>
              <span className="text-xs font-bold bg-violet-50 text-violet-750 border border-violet-100 px-4 py-2 rounded-full shadow-sm">🛡️ 100% Genuine Certified Drugs</span>
            </div>
          </div>

          {/* Right Column: Dynamic Graphic & Stats */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient neon backdrop ring */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-pink-400/25 to-violet-400/20 blur-[60px] animate-pulse-glow" />
            
            {/* Transparent Floating Capsule Frame */}
            <div className="relative z-10 glass-premium rounded-[2.5rem] p-6 shadow-2xl border border-slate-200/80 animate-float max-w-[460px] w-full">
              <div className="relative h-[380px] w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-white flex items-center justify-center border border-slate-200/50">
                <Image 
                  src="/images/gif2.gif" 
                  alt="Healix Pharmacy Tech" 
                  fill
                  className="object-contain p-4 filter drop-shadow-[0_20px_40px_rgba(219,39,119,0.15)] animate-float-slow"
                  unoptimized
                  priority
                />
              </div>

              {/* Float badge inside frame */}
              <div className="absolute -bottom-4 -right-4 glass-premium rounded-2xl p-4 shadow-xl border border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 font-extrabold">FDA APPROVED</p>
                  <p className="text-sm font-extrabold text-slate-800">100% Safe Drugs</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Statistics Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '99.8%', label: 'Extraction Accuracy', style: 'border-pink-250 bg-gradient-to-tr from-pink-50/20 to-white' },
            { num: '2 Hours', label: 'Urban Express Delivery', style: 'border-violet-250 bg-gradient-to-tr from-violet-50/20 to-white' },
            { num: '15,000+', label: 'Verified Prescriptions', style: 'border-cyan-250 bg-gradient-to-tr from-cyan-50/20 to-white' },
            { num: '4.9/5★', label: 'Customer Rating', style: 'border-emerald-250 bg-gradient-to-tr from-emerald-50/20 to-white' }
          ].map((stat, idx) => (
            <div key={idx} className={`rounded-2xl p-6 text-center shadow-md border ${stat.style}`}>
              <h3 className="text-3xl font-black gradient-text">{stat.num}</h3>
              <p className="text-xs text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Core Section: Shelf & AI Assistant */}
      <section className="relative z-20 w-full border-y border-slate-200/60 py-20 bg-gradient-to-tr from-violet-50/40 via-slate-50 to-pink-50/30">
        <div className="max-w-7xl mx-auto px-6">
          
          <SectionDecorations className="top-10 right-[10%] animate-float" color="pink" />
          <SectionDecorations className="bottom-12 left-[8%] animate-float-slow" color="violet" />

          <div className="grid lg:grid-cols-12 gap-10">
            
            {/* Left Side: Medicine Shelf (Product Showcase) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Featured Wellness <span className="gradient-text">Shelf</span>
                  <Pill className="w-6 h-6 text-primary-500 animate-float-slow" />
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-semibold">Genuine non-prescription drugs and wellness items, fast checkout ready.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {SHELF_MEDICINES.map((med) => {
                  const buttonState = cartState[med.id] || 'idle'
                  const cardClass = med.type === 'pink' ? 'card-pink' : med.type === 'cyan' ? 'card-cyan' : med.type === 'emerald' ? 'card-emerald' : 'card-violet'
                  
                  return (
                    <div key={med.id} className={`rounded-3xl p-5 shadow-sm border transition-all duration-300 card-hover flex flex-col justify-between text-left group ${cardClass}`}>
                      <div>
                        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200/40">
                          <SafeImage src={med.image} alt={med.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute top-3 right-3 text-xs font-bold bg-white/95 backdrop-blur-sm text-slate-850 px-2.5 py-1 rounded-full border border-slate-200/30 shadow-sm">Free Express</span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                          <span className="text-xs font-bold text-slate-700">{med.rating}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">({med.reviews} reviews)</span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-650 transition-colors mb-2">{med.name}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 font-medium">{med.desc}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3.5 border-t border-slate-200/60">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price</span>
                          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(med.price)}</p>
                        </div>
                        
                        <button 
                          onClick={() => handleAddToCart(med.id)}
                          disabled={buttonState !== 'idle'}
                          className={`click-feedback px-4.5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                            buttonState === 'added'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : buttonState === 'adding'
                              ? 'bg-slate-200 text-slate-500 cursor-wait'
                              : 'bg-white hover:bg-slate-55 text-slate-800 border border-slate-250 shadow-sm hover:shadow-md'
                          }`}
                        >
                          {buttonState === 'added' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Added
                            </>
                          ) : buttonState === 'adding' ? (
                            'Adding...'
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-primary-500" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Side: AI Pharmacist Assistant Widget */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-[2rem] border border-violet-200/70 shadow-[0_12px_40px_rgba(139,92,246,0.08)] overflow-hidden h-[620px] text-left">
              <div className="p-5 bg-gradient-to-r from-violet-650 to-pink-650 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white/60 bg-white shadow-sm animate-float">
                    <Image src="/images/pharmacist.png" alt="Healix Pharmacist" fill className="object-cover" />
                    <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm flex items-center gap-1">
                      AI Pharmacist Widget <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
                    </h3>
                    <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Clinical Guidance Agent</span>
                  </div>
                </div>
                <div className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 uppercase tracking-wider">
                  Active Support
                </div>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-semibold leading-relaxed shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200/70 text-slate-800 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200/70 rounded-2xl rounded-bl-none p-4 text-xs font-semibold text-slate-450 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      AI Pharmacist is analyzing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-slate-200 bg-white/80 flex flex-wrap gap-1.5">
                {[
                  '💊 What is Paracetamol used for?',
                  '📄 How to upload prescription?',
                  '🚚 Check delivery times'
                ].map((prompt, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleChatSuggest(prompt)}
                    className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors click-feedback"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); triggerBotResponse(inputMessage); }}
                className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask clinical queries or dosage questions..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-violet-500 font-semibold"
                />
                <button 
                  type="submit" 
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all disabled:opacity-40 disabled:pointer-events-none click-feedback"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>
        </div>
      </section>

      {/* Prescription Upload Portal */}
      <section className="relative z-20 w-full py-16 border-b border-slate-200/50 bg-gradient-to-tr from-emerald-50/25 via-slate-50 to-cyan-50/20">
        <div className="max-w-7xl mx-auto px-6">
          
          <SectionDecorations className="top-10 left-[15%] animate-float" color="cyan" />
          <SectionDecorations className="bottom-12 right-[8%] animate-float-slow" color="pink" />

          <div className="glass-premium rounded-[2.5rem] p-8 md:p-12 shadow-lg border border-slate-200/80 bg-white/80">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-5 text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 border border-violet-200/50 text-violet-750 text-xs font-extrabold shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-violet-600" />
                  <span>Encrypted HIPAA Verification</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                  Smart Prescription <span className="gradient-text">Uploader</span>
                </h2>
                <p className="text-sm text-slate-655 leading-relaxed font-semibold">
                  Got a doctor&apos;s slip? Drag and drop it here. Our AI system will extract drug details instantly. Registered pharmacists review and approve each entry in real-time.
                </p>
                
                <div className="space-y-3.5">
                  {[
                    'Automated OCR key extraction (dosage, doctor details)',
                    'Real-time licensed clinical pharmacist approval',
                    'Encrypted HIPAA storage keeping medical records safe'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-xs text-slate-700 font-extrabold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,application/pdf" 
                />
                
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] cursor-pointer ${
                    uploadState === 'idle' 
                      ? 'border-slate-350 hover:border-violet-400 bg-slate-50/50 hover:bg-white' 
                      : 'border-violet-400 bg-white shadow-md'
                  }`}
                >
                  {uploadState === 'idle' && (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border border-slate-200/80 shadow-sm animate-float">
                        <Upload className="w-8 h-8 text-slate-600" />
                      </div>
                      <h3 className="font-extrabold text-slate-850 text-lg">Select Doctor Slip</h3>
                      <p className="text-xs text-slate-500 mt-1 font-bold">Drag & Drop prescription file or Click to browse (PDF, JPEG, PNG)</p>
                    </>
                  )}

                  {uploadState === 'uploading' && (
                    <div className="w-full max-w-md space-y-4">
                      <p className="font-extrabold text-slate-850 text-base">Uploading prescription file...</p>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-600 to-pink-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-xs font-bold text-slate-400">{progress}% completed</p>
                    </div>
                  )}

                  {uploadState === 'processing' && (
                    <div className="w-full max-w-md text-left space-y-3.5">
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <p className="font-bold text-slate-850 text-sm">AI-OCR Extracting Prescription...</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-[10px] text-slate-655 h-36 overflow-y-auto space-y-1">
                        {ocrLogs.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-violet-500">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadState === 'success' && (
                    <div className="text-center space-y-4 max-w-md">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-md">
                        <Check className="w-7 h-7 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-850">Slip Uploaded Successfully!</h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        Our system successfully parsed the medicine codes. A licensed clinical pharmacist is auditing the dosage now. You will receive notification within 10-15 minutes.
                      </p>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3 text-left shadow-sm">
                        <FileText className="w-5 h-5 text-emerald-650" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{selectedFile?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{(selectedFile ? selectedFile.size / 1024 : 0).toFixed(1)} KB • OCR status matched</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setUploadState('idle'); setSelectedFile(null); }}
                        className="text-xs font-bold text-slate-600 hover:text-slate-850 hover:underline"
                      >
                        Upload another prescription
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-16">
        <div className="text-left mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">Browse our inventory catalog grouped by critical medicine categories.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link key={idx} href={`/search?category=${cat.name}`} className={`rounded-3xl p-5 shadow-sm border card-hover text-center flex flex-col items-center justify-center group click-feedback ${cat.style}`}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {cat.icon}
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-primary-650 transition-colors">{cat.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-20 w-full py-16 border-t border-slate-200/50 bg-gradient-to-br from-pink-50/20 via-slate-50 to-violet-50/20">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">What People <span className="gradient-text">Say</span></h2>
            <p className="text-sm text-slate-500 mt-1 font-semibold">Read testimonials from customers and medical professionals using our system.</p>
          </div>

          <div className="relative">
            <div className="glass-premium rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-slate-200/80 text-left relative overflow-hidden bg-white/90">
              <div className="flex items-center gap-1.5 mb-6">
                {[...Array(TESTIMONIALS[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 stroke-amber-400" />
                ))}
              </div>

              <p className="text-base md:text-lg text-slate-700 italic font-bold leading-relaxed mb-6">
                &ldquo;{TESTIMONIALS[currentTestimonial].text}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                <div>
                  <p className="font-extrabold text-slate-900">{TESTIMONIALS[currentTestimonial].name}</p>
                  <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">{TESTIMONIALS[currentTestimonial].role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentTestimonial(prev => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors click-feedback"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentTestimonial(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors click-feedback"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-12">
        <div className="rounded-[2.5rem] p-10 md:p-14 bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-pink-200/50 text-center space-y-6 shadow-md">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
            Ready to Experience the <span className="gradient-text">Healix</span> Core?
          </h2>
          <p className="text-sm md:text-base text-slate-655 max-w-xl mx-auto font-semibold leading-relaxed">
            Create an account to track prescriptions, earn medicine purchase rewards, and manage your family health profile.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/register" className="gradient-bg text-white px-8 py-3.5 rounded-full font-bold text-sm hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:scale-105 transition-all click-feedback">
              Create Free Account
            </Link>
            <Link href="/search" className="bg-white hover:bg-slate-50 text-slate-800 px-8 py-3.5 rounded-full font-bold text-sm border border-slate-250 shadow-sm hover:shadow-md transition-all click-feedback">
              Browse Medicines
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
