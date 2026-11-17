import { metricById } from '../data/api'

export const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const fmtShort = (iso: string) =>
  new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export const fmtValue = (metricId: number, v: number) => {
  const m = metricById(metricId)
  return v.toLocaleString('en-US', { minimumFractionDigits: m.decimals, maximumFractionDigits: m.decimals })
}

export const relative = (iso: string, now: Date) => {
  const diff = (now.getTime() - new Date(iso).getTime()) / 36e5
  if (diff < 1) return 'just now'
  if (diff < 24) return `${Math.round(diff)} h ago`
  const days = Math.round(diff / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

/** yyyy-mm-dd for a date n days before `base`. */
export const isoDaysAgo = (base: Date, n: number) => {
  const d = new Date(base)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
