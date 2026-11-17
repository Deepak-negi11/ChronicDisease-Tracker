import { useEffect, type ReactNode } from 'react'
import { Info, X } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--color-teal-brand)" />
        <path d="M5 17h5l2.5-6 4 11 3-8 2 3H27" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-[15px] font-semibold tracking-tight text-ink">Chronic Disease Tracker</span>
          <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-mute">AI-based · rule-driven</span>
        </span>
      )}
    </span>
  )
}

type Tone = 'teal' | 'blue' | 'violet' | 'amber' | 'rose' | 'neutral'
const tones: Record<Tone, string> = {
  teal: 'bg-teal-soft text-teal-brand',
  blue: 'bg-blue-soft text-blue-brand',
  violet: 'bg-violet-soft text-violet-brand',
  amber: 'bg-amber-soft text-amber-brand',
  rose: 'bg-rose-soft text-rose-brand',
  neutral: 'bg-canvas text-ink-soft border border-line',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${tones[tone]}`}>{children}</span>
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-rise">
      <div>
        {eyebrow && <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-teal-brand">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-[2.15rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint, icon, tone = 'teal', delay = 0 }: { label: string; value: ReactNode; hint?: ReactNode; icon: ReactNode; tone?: Tone; delay?: number }) {
  return (
    <div className="card p-5 animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-ink-soft">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="num mt-3 text-[1.9rem] font-semibold leading-none tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-2 text-xs text-ink-mute">{hint}</p>}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-line/70 ${className}`} />
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-teal-soft text-teal-brand">{icon}</span>
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-ink-soft">{children}</div>}
    </div>
  )
}

/** Shown wherever alerts or analysis appear — the product never diagnoses. */
export function Disclaimer({ children }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-xs text-ink-soft">
      <Info className="mt-px size-3.5 shrink-0 text-blue-brand" />
      <span>{children ?? 'Informational only. Alerts and summaries are based on thresholds configured by your care team and are not a diagnosis or emergency assessment.'}</span>
    </p>
  )
}

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`card max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 animate-rise sm:rounded-b-[1.25rem] ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-mute hover:bg-canvas hover:text-ink" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toast({ message, tone = 'teal', onDone }: { message: string | null; tone?: 'teal' | 'amber'; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 4200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])
  if (!message) return null
  return (
    <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 animate-rise">
      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${tone === 'amber' ? 'bg-amber-brand' : 'bg-ink'}`}>{message}</div>
    </div>
  )
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
      {children}
    </label>
  )
}
