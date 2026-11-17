import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts'
import { fmtShort } from '../lib/format'

/** Validated categorical pair (CVD-safe on the light surface). Fixed order: series 1 = teal, series 2 = violet. */
export const SERIES = ['#0b8f80', '#6b4fb8'] as const
export const GRID = '#e8ecea'
export const AXIS = '#7d8b95'
export const LIMIT = '#b4434f'

export interface SeriesDef { key: string; label: string }

function ChartTooltip({ active, payload, label, unit, decimals }: TooltipProps<number, string> & { unit: string; decimals: number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">{fmtShort(String(label))}</p>
      {payload.map((p) => (
        <p key={p.dataKey as string} className="flex items-center gap-2 text-ink-soft">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}
          <span className="num ml-auto pl-3 font-semibold text-ink">
            {Number(p.value).toFixed(decimals)} {unit}
          </span>
        </p>
      ))}
    </div>
  )
}

/**
 * Line chart for one metric (or two series on the SAME scale, e.g. systolic/diastolic).
 * Threshold lines come from the patient's configured alert rules.
 */
export function TrendChart({
  data, series, unit, decimals = 0, limits = [], height = 260, compact = false,
}: {
  data: object[]
  series: SeriesDef[]
  unit: string
  decimals?: number
  limits?: { y: number; label: string }[]
  height?: number
  compact?: boolean
}) {
  return (
    <div style={{ height }} role="img" aria-label={`${series.map((s) => s.label).join(' and ')} over time`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: compact ? 4 : 56, bottom: 0, left: compact ? -24 : -8 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmtShort} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={36} />
          <YAxis tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={48} />
          <Tooltip content={<ChartTooltip unit={unit} decimals={decimals} />} cursor={{ stroke: AXIS, strokeDasharray: '3 3' }} />
          {limits.map((l) => (
            <ReferenceLine key={l.label + l.y} y={l.y} stroke={LIMIT} strokeDasharray="4 4" strokeOpacity={0.7}
              label={compact ? undefined : { value: l.label, position: 'right', fill: LIMIT, fontSize: 10.5 }} />
          ))}
          {series.map((s, i) => (
            <Line key={s.key} dataKey={s.key} name={s.label} type="monotone" stroke={SERIES[i]} strokeWidth={2} dot={false}
              activeDot={{ r: 4.5, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Legend({ series }: { series: SeriesDef[] }) {
  if (series.length < 2) return null
  return (
    <div className="flex flex-wrap gap-4 text-xs text-ink-soft">
      {series.map((s, i) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ background: SERIES[i] }} /> {s.label}
        </span>
      ))}
    </div>
  )
}
