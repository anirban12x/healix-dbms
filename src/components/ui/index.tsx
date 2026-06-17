'use client'
import { ReactNode, useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

export function SafeImage({ src, alt, className, ...props }: ImageProps & { fallbackSrc?: string }) {
  const [error, setError] = useState(false)
  const fallback = props.fallbackSrc || '/images/hero-pill.png'

  return (
    <Image
      {...props}
      src={error ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}

export function GlassCard({ children, className, hover = true }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={cn('glass rounded-2xl p-6 shadow-lg', hover && 'card-hover', className)}>
      {children}
    </div>
  )
}

export function GradientButton({ children, className, onClick, disabled, type = 'button', size = 'md' }: {
  children: ReactNode; className?: string; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={cn('gradient-bg text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100', sizes[size], className)}>
      {children}
    </button>
  )
}

export function Badge({ children, variant = 'default', className }: { children: ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' | 'default'; className?: string }) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
  }
  return <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', variants[variant], className)}>{children}</span>
}

export function StatCard({ title, value, icon, trend, color = 'primary' }: {
  title: string; value: string | number; icon: ReactNode; trend?: string; color?: 'primary' | 'secondary' | 'green' | 'red' | 'blue' | 'yellow'
}) {
  const colors = {
    primary: 'from-primary-500 to-primary-600', secondary: 'from-secondary-500 to-secondary-600',
    green: 'from-green-500 to-green-600', red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600', yellow: 'from-yellow-500 to-yellow-600',
  }
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md card-hover border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-1 font-medium">{trend}</p>}
        </div>
        <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white', colors[color])}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── SQL Formatter ────────────────────────────────────────────────────────────
function formatSQL(raw: string): string {
  // Collapse whitespace
  let sql = raw.replace(/\s+/g, ' ').trim()

  // 1. Uppercase all SQL keywords for consistency
  const allKeywords = [
    'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING',
    'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE FROM', 'DELETE', 'UNION ALL', 'UNION',
    'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'JOIN',
    'ON', 'AND', 'OR', 'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'ILIKE',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'CASE', 'WHEN',
    'THEN', 'ELSE', 'END', 'BETWEEN', 'EXISTS', 'ALL', 'ASC', 'DESC',
  ]
  allKeywords.forEach(kw => {
    sql = sql.replace(new RegExp(`\\b(${kw})\\b`, 'gi'), kw)
  })

  // 2. Put top-level clauses on their own line
  const topLevel = [
    'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING',
    'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE FROM', 'DELETE', 'UNION ALL', 'UNION',
  ]
  topLevel.forEach(kw => {
    sql = sql.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '\n$1')
  })

  // 3. Put sub-level keywords/joins on their own line, indented by 2 spaces
  // Matching joined keywords first (like LEFT JOIN) prevents splitting them into LEFT and JOIN.
  sql = sql.replace(/\b(LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL OUTER JOIN|CROSS JOIN|JOIN|ON|AND|OR)\b/g, '\n  $1')

  // 4. Format SELECT list to indent each column on its own line
  sql = sql.replace(/SELECT\n?([\s\S]*?)\nFROM/, (_m, cols) => {
    const colList = cols
      .split(',')
      .map((c: string) => '  ' + c.trim())
      .join(',\n')
    return `SELECT\n${colList}\nFROM`
  })

  // Clean trailing spaces and empty lines
  sql = sql.split('\n').map((l: string) => l.trimEnd()).join('\n').trim()

  return sql
}

// ─── Token-based Syntax Highlighter ──────────────────────────────────────────
interface Seg { text: string; cls?: string }
const TOKEN_RULES: { re: RegExp; cls: string }[] = [
  // String literals
  { re: /('(?:[^'\\]|\\.)*')/g,                                                                  cls: 'text-amber-300' },
  // Clauses (top-level)
  { re: /\b(SELECT|FROM|WHERE|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|DELETE|UNION ALL|UNION)\b/g, cls: 'text-violet-400 font-bold' },
  // Joins
  { re: /\b(LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL OUTER JOIN|CROSS JOIN|JOIN|ON)\b/g,             cls: 'text-sky-400 font-semibold' },
  // Operators & Logical
  { re: /\b(AND|OR|NOT|IN|LIKE|ILIKE|IS|BETWEEN|EXISTS|ALL|DISTINCT|AS)\b/g,                    cls: 'text-pink-400' },
  // Functions
  { re: /\b(COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END)\b/g,                                  cls: 'text-cyan-400 font-semibold' },
  // Constants / Sort
  { re: /\b(ASC|DESC|NULL)\b/g,                                                                   cls: 'text-orange-400' },
  // Numbers
  { re: /\b(\d+(?:\.\d+)?)\b/g,                                                                  cls: 'text-cyan-300' },
  // Operators
  { re: /(=|!=|<>|<=|>=|<|>)/g,                                                                  cls: 'text-slate-400' },
  // Table.column identifiers
  { re: /\b([a-z_]\w*\.[a-z_]\w*)\b/gi,                                                          cls: 'text-emerald-400' },
]

function tokenize(line: string): Seg[] {
  let segments: Seg[] = [{ text: line }]
  TOKEN_RULES.forEach(({ re, cls }) => {
    const next: Seg[] = []
    segments.forEach(seg => {
      if (seg.cls) { next.push(seg); return }
      let last = 0
      const r = new RegExp(re.source, re.flags)
      let m: RegExpExecArray | null
      let found = false
      while ((m = r.exec(seg.text)) !== null) {
        found = true
        if (m.index > last) next.push({ text: seg.text.slice(last, m.index) })
        next.push({ text: m[0], cls })
        last = m.index + m[0].length
      }
      if (found) {
        if (last < seg.text.length) next.push({ text: seg.text.slice(last) })
      } else {
        next.push(seg)
      }
    })
    segments = next
  })
  return segments
}

// ─── QueryDisplay Component ───────────────────────────────────────────────────
export function QueryDisplay({ query }: { query: string; title?: string }) {
  const [open, setOpen] = useState(false)
  if (!query) return null

  const formatted = formatSQL(query)
  const lines = formatted.split('\n')

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white mb-6">
      {/* Accordion Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors click-feedback"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">Show SQL Query</span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-full">Live</span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Terminal Accordion Panel */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '550px' : '0px' }}
      >
        <div className="bg-slate-950">
          {/* Header OS Bar */}
          <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-[11px] text-slate-500 font-mono ml-3 tracking-wider select-none">
              SQL — Healix Query Engine
            </span>
            <span className="ml-auto text-[10px] text-slate-600 font-mono select-none">
              {lines.length} line{lines.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Code Area */}
          <div className="flex overflow-auto max-h-[460px]">
            {/* Gutter Line Numbers */}
            <div
              aria-hidden="true"
              className="select-none flex-shrink-0 py-5 px-4 bg-slate-900/50 border-r border-slate-800 text-right font-mono text-xs leading-6 text-slate-600"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* SQL Monospace with syntax highlighting */}
            <pre className="flex-1 py-5 px-5 text-sm font-mono leading-6 overflow-x-auto whitespace-pre">
              {lines.map((line, li) => {
                const segs = tokenize(line)
                return (
                  <span key={li}>
                    {segs.map((seg, si) =>
                      seg.cls
                        ? <span key={si} className={seg.cls}>{seg.text}</span>
                        : <span key={si} className="text-slate-300">{seg.text}</span>
                    )}
                    {'\n'}
                  </span>
                )
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}
