'use client'

import React from 'react'

export function LiquidGlassBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* SVG gooey filter definition */}
      <svg className="hidden" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 30 -12" 
              result="gooey" 
            />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
        </defs>
      </svg>

      {/* Gooey container with liquid blobs (extremely subtle for light theme readability) */}
      <div className="gooey-container opacity-[0.09]">
        <div className="absolute top-[8%] left-[15%] w-[380px] h-[380px] rounded-full bg-pink-450 animate-blob-1" />
        <div className="absolute top-[20%] right-[10%] w-[420px] h-[420px] rounded-full bg-violet-450 animate-blob-2" style={{ animationDelay: '-3s' }} />
        <div className="absolute bottom-[25%] left-[25%] w-[390px] h-[390px] rounded-full bg-cyan-450 animate-blob-3" style={{ animationDelay: '-6s' }} />
        <div className="absolute top-[55%] right-[30%] w-[340px] h-[340px] rounded-full bg-indigo-400 animate-blob-1" style={{ animationDelay: '-9s' }} />
      </div>

      {/* Static deep glows to enhance the depth */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-200/20 blur-[120px] mix-blend-multiply" />
      <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-pink-200/15 blur-[130px] mix-blend-multiply" />
      <div className="absolute top-1/2 left-10 w-[350px] h-[350px] rounded-full bg-cyan-100/20 blur-[100px] mix-blend-multiply" />
    </div>
  )
}

export function FloatingPills() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Glow Glass Pill 1 */}
      <div className="absolute top-[12%] left-[8%] animate-float opacity-40 select-none">
        <svg className="w-20 h-20 filter drop-shadow-[0_0_8px_rgba(219,39,119,0.25)]" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="20" width="48" height="24" rx="12" fill="rgba(219,39,119,0.05)" stroke="#db2777" strokeWidth="1.5" />
          <path d="M32 20V44" stroke="#db2777" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="20" cy="32" r="4" fill="#db2777" />
        </svg>
      </div>

      {/* Pill 2 (cyan neon) */}
      <div className="absolute top-[35%] right-[10%] animate-float-slow opacity-35 select-none">
        <svg className="w-16 h-16 filter drop-shadow-[0_0_8px_rgba(8,145,178,0.25)]" viewBox="0 0 64 64" fill="none">
          <rect x="20" y="8" width="24" height="48" rx="12" transform="rotate(45 32 32)" fill="rgba(8,145,178,0.05)" stroke="#0891b2" strokeWidth="1.5" />
          <path d="M18 46L46 18" stroke="#0891b2" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Capsule (violet neon) */}
      <div className="absolute bottom-[30%] left-[12%] animate-float-fast opacity-35 select-none">
        <svg className="w-24 h-12 filter drop-shadow-[0_0_8px_rgba(124,58,237,0.25)]" viewBox="0 0 80 40" fill="none">
          <rect x="1" y="1" width="78" height="38" rx="19" fill="rgba(124,58,237,0.05)" stroke="#7c3aed" strokeWidth="1.5"/>
          <path d="M40 1V39" stroke="#7c3aed" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Glowing medical cross/plus */}
      <div className="absolute bottom-[10%] right-[15%] animate-float-slow opacity-40 select-none">
        <svg className="w-16 h-16 filter drop-shadow-[0_0_8px_rgba(219,39,119,0.3)]" viewBox="0 0 56 56" fill="none">
          <rect x="22" y="6" width="12" height="44" rx="6" fill="#db2777" />
          <rect x="6" y="22" width="44" height="12" rx="6" fill="#db2777" />
        </svg>
      </div>

      {/* Small floaters */}
      <div className="absolute top-[50%] left-[25%] w-3 h-3 rounded-full bg-cyan-500 animate-float opacity-40 blur-[0.5px]" />
      <div className="absolute top-[20%] right-[30%] w-4 h-4 rounded-full bg-pink-500 animate-float-slow opacity-35 blur-[0.5px]" />
      <div className="absolute bottom-[40%] right-[25%] w-3 h-3 rounded-full bg-violet-500 animate-float-fast opacity-40 blur-[0.5px]" />
    </div>
  )
}

export function RotatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* 3D molecular bond shape rotating */}
      <div className="absolute top-[20%] right-[22%] w-48 h-48 animate-rotate-3d opacity-30 select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bonds */}
          <line x1="50" y1="50" x2="20" y2="30" stroke="rgba(15,23,42,0.12)" strokeWidth="2" />
          <line x1="50" y1="50" x2="80" y2="30" stroke="rgba(15,23,42,0.12)" strokeWidth="2" />
          <line x1="50" y1="50" x2="50" y2="85" stroke="rgba(15,23,42,0.12)" strokeWidth="2" />
          
          {/* Atoms / Nodes */}
          <circle cx="50" cy="50" r="10" fill="url(#violet-grad)" stroke="#7c3aed" strokeWidth="1" />
          <circle cx="20" cy="30" r="8" fill="url(#cyan-grad)" stroke="#0891b2" strokeWidth="1" />
          <circle cx="80" cy="30" r="8" fill="url(#pink-grad)" stroke="#db2777" strokeWidth="1" />
          <circle cx="50" cy="85" r="7" fill="rgba(15,23,42,0.08)" stroke="rgba(15,23,42,0.2)" strokeWidth="1" />

          {/* Gradients */}
          <defs>
            <radialGradient id="violet-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ddd6fe" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
            <radialGradient id="cyan-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c5f2f7" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
            <radialGradient id="pink-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#db2777" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Rotating DNA Helix element */}
      <div className="absolute bottom-[20%] left-[5%] w-40 h-40 animate-float-slow opacity-25 select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-rotate-3d" style={{ animationDuration: '30s' }} fill="none">
          <circle cx="50" cy="50" r="45" stroke="rgba(15,23,42,0.04)" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M30 30 C 45 40, 55 60, 70 70" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M70 30 C 55 40, 45 60, 30 70" stroke="#db2777" strokeWidth="1.5" strokeDasharray="3 3" />
          
          <circle cx="30" cy="30" r="4" fill="#0891b2" />
          <circle cx="70" cy="70" r="4" fill="#0891b2" />
          <circle cx="70" cy="30" r="4" fill="#db2777" />
          <circle cx="30" cy="70" r="4" fill="#db2777" />

          <circle cx="41" cy="38" r="3" fill="#0891b2" opacity="0.7" />
          <circle cx="59" cy="62" r="3" fill="#0891b2" opacity="0.7" />
          <circle cx="59" cy="38" r="3" fill="#db2777" opacity="0.7" />
          <circle cx="41" cy="62" r="3" fill="#db2777" opacity="0.7" />

          <line x1="41" y1="38" x2="59" y2="38" stroke="rgba(15,23,42,0.1)" strokeWidth="1" />
          <line x1="30" y1="30" x2="70" y2="30" stroke="rgba(15,23,42,0.1)" strokeWidth="1" />
          <line x1="30" y1="70" x2="70" y2="70" stroke="rgba(15,23,42,0.1)" strokeWidth="1" />
          <line x1="59" y1="62" x2="41" y2="62" stroke="rgba(15,23,42,0.1)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  )
}

export function GradientBlobs() {
  return <LiquidGlassBackground />
}

export function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-50/50">
      {/* Corner animated glowing blobs (strictly off-center, very soft, no overlap on inputs) */}
      <div className="absolute -top-[10%] -left-[10%] w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-pink-300/20 to-violet-300/10 blur-[80px] animate-blob-1" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-violet-350/20 to-cyan-300/10 blur-[90px] animate-blob-2" />
      <div className="absolute top-[40%] -right-[15%] w-[280px] h-[280px] rounded-full bg-gradient-to-br from-pink-200/15 to-indigo-300/10 blur-[80px] animate-blob-3" />

      {/* Floating Outlined SVGs to add premium details without bloat */}
      <div className="absolute top-[15%] right-[12%] animate-float opacity-30 select-none">
        <svg className="w-12 h-12 stroke-pink-500" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <rect x="2" y="9" width="20" height="6" rx="3" />
          <path d="M12 9v6" />
        </svg>
      </div>

      <div className="absolute bottom-[20%] left-[8%] animate-float-slow opacity-25 select-none">
        <svg className="w-16 h-16 stroke-violet-500" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20" strokeLinecap="round" />
        </svg>
      </div>

      <div className="absolute top-[45%] left-[10%] animate-float-fast opacity-20 select-none">
        <svg className="w-10 h-10 stroke-cyan-500" viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="absolute bottom-[12%] right-[15%] animate-float-fast opacity-30 select-none">
        <svg className="w-10 h-10 stroke-violet-500" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <rect x="6" y="2" width="12" height="20" rx="4" />
          <path d="M10 8h4M12 6v4" />
        </svg>
      </div>

      {/* Background Dots */}
      <div className="absolute top-[25%] left-[30%] w-2 h-2 rounded-full bg-pink-400 animate-pulse opacity-25" />
      <div className="absolute bottom-[35%] right-[25%] w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse opacity-30" />
      <div className="absolute top-[60%] right-[8%] w-2 h-2 rounded-full bg-violet-400 animate-pulse opacity-25" />
    </div>
  )
}

interface SectionDecorationsProps {
  className?: string
  color?: 'pink' | 'violet' | 'cyan'
}

export function SectionDecorations({ className = '', color = 'violet' }: SectionDecorationsProps) {
  const strokeColor = color === 'pink' ? '#db2777' : color === 'cyan' ? '#0891b2' : '#7c3aed';
  return (
    <div className={`absolute pointer-events-none select-none opacity-25 animate-float ${className}`}>
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5">
        <path d="M12 2v20M2 12h20" strokeLinecap="round" />
      </svg>
    </div>
  )
}
