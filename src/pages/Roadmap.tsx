import { Link } from 'react-router-dom'
import { ArrowRight, Hammer } from 'lucide-react'
import type { NavItem } from '../lib/nav'
import { PageHeader } from '../components/ui'

/** Placeholder for modules scheduled in a later roadmap milestone (see PLAN.md). */
export default function Roadmap({ item }: { item: NavItem }) {
  return (
    <>
      <PageHeader eyebrow={`Milestone ${item.milestone}`} title={item.label} />
      <div className="card relative overflow-hidden p-8 md:p-12 animate-rise">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-teal-soft blur-2xl" aria-hidden />
        <div className="relative max-w-xl">
          <span className="grid size-12 place-items-center rounded-2xl bg-white text-teal-brand shadow-sm ring-1 ring-line">
            <item.icon className="size-5" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold">Next on the roadmap</h2>
          <p className="mt-2 text-ink-soft">{item.blurb}</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink-mute">
            <Hammer className="size-4" /> Built on the shared relational schema, so this module uses the same records and alerts you see elsewhere.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link to="/app/records" className="btn btn-primary">
              Log a health record <ArrowRight className="size-4" />
            </Link>
            <Link to="/app/analytics" className="btn btn-ghost">
              Explore analytics
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
