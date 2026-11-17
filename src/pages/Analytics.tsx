import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Table2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Disclaimer, PageHeader, Skeleton } from '../components/ui'
import { AXIS, GRID, Legend, SERIES, TrendChart } from '../components/charts'
import { useSession } from '../context/session'
import { useData } from '../lib/useData'
import { bucket, getRecords, getRules, metricByKey, seriesFor, summarize, TODAY, type Summary } from '../data/api'
import type { MetricKey } from '../data/fixtures'
import { fmtShort, isoDaysAgo } from '../lib/format'

const TABS: { key: MetricKey; label: string }[] = [
  { key: 'heart_rate', label: 'Heart rate' },
  { key: 'bp_systolic', label: 'Blood pressure' },
  { key: 'glucose', label: 'Blood glucose' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'steps', label: 'Steps' },
  { key: 'weight', label: 'Weight' },
]
const RANGES = [7, 30, 90, 120]
type Grain = 'day' | 'week' | 'month'

function Delta({ now, prev, decimals }: { now: number; prev: number | undefined; decimals: number }) {
  if (prev === undefined) return <span className="text-ink-mute">no earlier data</span>
  const diff = now - prev
  const pct = (diff / prev) * 100
  const Icon = Math.abs(pct) < 1.5 ? ArrowRight : diff > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className="inline-flex items-center gap-0.5 text-ink-soft">
      <Icon className="size-3.5" /> {diff > 0 ? '+' : ''}{diff.toFixed(decimals)} ({pct > 0 ? '+' : ''}{pct.toFixed(1)}%) vs previous period
    </span>
  )
}

export default function Analytics() {
  const { session } = useSession()
  const pid = session!.patientId
  const [params, setParams] = useSearchParams()
  const initial = (params.get('metric') as MetricKey) ?? 'glucose'
  const [tab, setTab] = useState<MetricKey>(TABS.some((t) => t.key === initial) ? initial : initial === 'bp_diastolic' ? 'bp_systolic' : 'glucose')
  const [days, setDays] = useState(30)
  const [grain, setGrain] = useState<Grain>('day')
  const [asTable, setAsTable] = useState(false)

  const metric = metricByKey(tab)
  const isBP = tab === 'bp_systolic'
  const dia = metricByKey('bp_diastolic')

  // Fetch current window + the previous window of equal length for comparison
  const { data: rows } = useData(() => getRecords({ patientId: pid, from: isoDaysAgo(TODAY, days * 2), order: 'asc' }), [pid, days])
  const { data: rules } = useData(() => getRules(pid), [pid])

  const view = useMemo(() => {
    if (!rows) return null
    const cutoff = isoDaysAgo(TODAY, days)
    const cur = rows.filter((r) => r.recorded_at.slice(0, 10) > cutoff)
    const prev = rows.filter((r) => r.recorded_at.slice(0, 10) <= cutoff)
    const daily = seriesFor(cur, metric.metric_id)
    const dailyDia = isBP ? seriesFor(cur, dia.metric_id) : []
    const g = (pts: typeof daily) => (grain === 'day' ? pts : bucket(pts, grain))
    const a = g(daily)
    const b = new Map(g(dailyDia).map((p) => [p.date, p.value]))
    return {
      chart: a.map((p) => ({ date: p.date, v: p.value, ...(isBP ? { d: b.get(p.date) ?? NaN } : {}) })),
      s: summarize(daily),
      sPrev: summarize(seriesFor(prev, metric.metric_id)),
      sDia: isBP ? summarize(dailyDia) : null,
      weekly: bucket(daily, 'week').map((p) => ({ date: p.date, v: p.value })),
    }
  }, [rows, days, grain, metric.metric_id, isBP, dia.metric_id])

  const rule = rules?.find((r) => r.metric_id === metric.metric_id)
  const limits = [
    ...(rule?.upper_threshold != null ? [{ y: rule.upper_threshold, label: `Upper ${rule.upper_threshold}` }] : []),
    ...(rule?.lower_threshold != null ? [{ y: rule.lower_threshold, label: `Lower ${rule.lower_threshold}` }] : []),
  ]
  const series = isBP ? [{ key: 'v', label: 'Systolic' }, { key: 'd', label: 'Diastolic' }] : [{ key: 'v', label: metric.metric_name }]
  const unit = isBP ? 'mmHg' : metric.unit
  const dec = metric.decimals

  const choose = (k: MetricKey) => {
    setTab(k)
    setParams({ metric: k }, { replace: true })
  }

  const statTiles = (s: Summary, label?: string) => [
    { k: 'Average', v: s.avg },
    { k: 'Lowest', v: s.min },
    { k: 'Highest', v: s.max },
  ].map((t) => (
    <div key={t.k + (label ?? '')} className="card p-4">
      <p className="text-xs font-medium text-ink-soft">{t.k}{label ? ` · ${label}` : ''}</p>
      <p className="num mt-1.5 text-2xl font-semibold">{t.v.toLocaleString('en-US', { maximumFractionDigits: dec, minimumFractionDigits: dec })} <span className="text-xs font-medium text-ink-mute">{unit}</span></p>
    </div>
  ))

  return (
    <>
      <PageHeader eyebrow="Module 9 · Analytics" title="Health analytics" description="Trends calculated from your stored readings. Pick a metric, a time range and how to group it." />

      {/* Controls: one row */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => choose(t.key)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${tab === t.key ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <div className="flex rounded-xl border border-line bg-white p-1">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setDays(r)} className={`num rounded-lg px-2.5 py-1.5 text-xs font-semibold ${days === r ? 'bg-teal-soft text-teal-brand' : 'text-ink-soft'}`}>{r}d</button>
            ))}
          </div>
          <div className="flex rounded-xl border border-line bg-white p-1">
            {(['day', 'week', 'month'] as Grain[]).map((g) => (
              <button key={g} onClick={() => setGrain(g)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize ${grain === g ? 'bg-teal-soft text-teal-brand' : 'text-ink-soft'}`}>{g === 'day' ? 'Daily' : g === 'week' ? 'Weekly' : 'Monthly'}</button>
            ))}
          </div>
          <button className="btn btn-ghost !py-1.5" onClick={() => setAsTable(!asTable)} aria-pressed={asTable}>
            {asTable ? <BarChart3 className="size-4" /> : <Table2 className="size-4" />} {asTable ? 'Chart' : 'Table'}
          </button>
        </div>
      </div>

      {!view ? (
        <Skeleton className="h-[420px]" />
      ) : !view.s ? (
        <div className="card p-10 text-center text-ink-soft">No {metric.metric_name.toLowerCase()} readings in this period.</div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
            <div className="card p-6 animate-rise">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">{isBP ? 'Blood pressure' : metric.metric_name} · last {days} days</h2>
                  <p className="text-xs text-ink-mute">
                    {grain === 'day' ? 'Daily average' : grain === 'week' ? 'Weekly average (weeks start Monday)' : 'Monthly average'}, {unit}
                    {limits.length > 0 && ' · dashed lines are your configured alert thresholds'}
                  </p>
                </div>
                <Legend series={series} />
              </div>
              <div className="mt-4">
                {asTable ? (
                  <div className="max-h-[320px] overflow-y-auto rounded-xl border border-line">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-canvas text-left text-[11px] uppercase tracking-wider text-ink-mute">
                        <tr><th className="px-4 py-2">Period</th>{series.map((s) => <th key={s.key} className="px-4 py-2 text-right">{s.label}</th>)}</tr>
                      </thead>
                      <tbody>
                        {[...view.chart].reverse().map((p) => (
                          <tr key={p.date} className="border-t border-line">
                            <td className="px-4 py-2">{fmtShort(p.date)}</td>
                            <td className="num px-4 py-2 text-right">{p.v.toFixed(dec)}</td>
                            {isBP && <td className="num px-4 py-2 text-right">{Number(p.d).toFixed(0)}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <TrendChart data={view.chart} series={series} unit={unit} decimals={grain === 'day' ? dec : Math.max(dec, 1)} limits={limits} height={320} />
                )}
              </div>
            </div>

            {/* Trend panel */}
            <div className="card flex flex-col gap-5 p-6 animate-rise [animation-delay:60ms]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">Trend in period</p>
                <p className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold">
                  {Math.abs(view.s.changePct) < 1.5 ? <><ArrowRight className="size-6 text-ink-mute" /> Steady</> : view.s.changePct > 0 ? <><ArrowUpRight className="size-6 text-amber-brand" /> Rising</> : <><ArrowDownRight className="size-6 text-teal-brand" /> Falling</>}
                </p>
                <p className="num mt-1 text-sm text-ink-soft">
                  {view.s.first.toFixed(dec)} → {view.s.last.toFixed(dec)} {unit} ({view.s.changePct > 0 ? '+' : ''}{view.s.changePct.toFixed(1)}%)
                </p>
                <p className="mt-1 text-[11px] text-ink-mute">Average of the first vs last quarter of the period</p>
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">Historical comparison</p>
                <p className="num mt-2 text-sm"><Delta now={view.s.avg} prev={view.sPrev?.avg} decimals={dec} /></p>
                <p className="mt-1 text-[11px] text-ink-mute">Average this {days}-day period vs the {days} days before it</p>
              </div>
              <div className="border-t border-line pt-4 text-sm text-ink-soft">
                <p className="num"><span className="font-semibold text-ink">{view.s.count}</span> days with readings</p>
                {rule && (
                  <p className="mt-1 text-xs">Thresholds set by {rule.set_by}: {rule.lower_threshold ?? '–'} to {rule.upper_threshold ?? '–'} {metric.unit}</p>
                )}
              </div>
              <div className="mt-auto"><Disclaimer>Figures summarise recorded values only. Missing days are not estimated. Discuss changes with your doctor.</Disclaimer></div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{statTiles(view.s, isBP ? 'systolic' : undefined)}</div>
          {view.sDia && <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">{statTiles(view.sDia, 'diastolic')}</div>}

          {/* Weekly summary */}
          <div className="card mt-6 p-6">
            <h2 className="font-display text-lg font-semibold">Weekly summary</h2>
            <p className="text-xs text-ink-mute">Average {isBP ? 'systolic BP' : metric.metric_name.toLowerCase()} per week, {unit}</p>
            <div className="mt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view.weekly} margin={{ top: 8, right: 4, bottom: 0, left: -8 }} barCategoryGap={6}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => `w/c ${fmtShort(d)}`} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={24} />
                  <YAxis tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} width={48} domain={[0, 'auto']} />
                  <Tooltip
                    cursor={{ fill: 'rgba(23,34,43,0.04)' }}
                    formatter={(v) => [`${Number(v).toFixed(dec)} ${unit}`, 'Weekly average']}
                    labelFormatter={(d) => `Week of ${fmtShort(String(d))}`}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e3e8e6', fontSize: 12 }}
                  />
                  <Bar dataKey="v" fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </>
  )
}
