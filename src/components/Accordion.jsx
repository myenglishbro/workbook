import React, { useState } from 'react'

// Logic preserved — only UI/UX styling tweaks with Tailwind.
function groupByTask(items) {
  const map = new Map()
  for (const it of items || []) {
    const task = it.task ?? 1
    if (!map.has(task)) map.set(task, [])
    map.get(task).push(it)
  }
  return Array.from(map.entries()).sort((a, b) => Number(a[0]) - Number(b[0]))
}

export default function Accordion({ items, onSelect }) {
  const [open, setOpen] = useState(new Set())
  const grouped = groupByTask(items)

  function toggle(task) {
    setOpen((prev) => {
      const n = new Set(prev)
      if (n.has(task)) n.delete(task)
      else n.add(task)
      return n
    })
  }

  if (!items?.length)
    return (
      <p className="text-slate-400 italic text-sm">No exercises available.</p>
    )

  return (
    <div className="space-y-4">
      {grouped.map(([task, list]) => {
        const isOpen = open.has(task)
        return (
          <section
            key={task}
            className={[
              'rounded-2xl border bg-slate-900/60 backdrop-blur',
              'border-slate-800 shadow-sm shadow-black/10 overflow-hidden',
              isOpen ? 'ring-1 ring-amber-400/20' : '',
            ].join(' ')}
          >
            {/* Header */}
            <button
              type="button"
              className={[
                'w-full grid grid-cols-[1fr_auto_28px] items-center gap-3 px-4 sm:px-5 py-3.5',
                'text-left transition-colors border-b border-slate-800',
                'hover:bg-slate-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
              ].join(' ')}
              onClick={() => toggle(task)}
              aria-expanded={isOpen}
              aria-controls={`panel-${task}`}
              id={`header-${task}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
                  {task}
                </span>
                <span className="font-semibold text-slate-100 truncate">Task {task}</span>
              </div>

              <span className="inline-flex items-center gap-2 text-slate-300 text-sm">
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs">
                  {list.length} {list.length === 1 ? 'exercise' : 'exercises'}
                </span>
              </span>

              <span
                className={[
                  'h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-700',
                  'bg-slate-800 text-slate-300 transition-transform',
                  isOpen ? 'rotate-180' : '',
                ].join(' ')}
                aria-hidden
              >
                {/* Chevron */}
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .92 1.17l-4.25 3.37a.75.75 0 0 1-.92 0L5.21 8.4a.75.75 0 0 1 .02-1.19z" clipRule="evenodd" />
                </svg>
              </span>
            </button>

            {/* Panel */}
            {isOpen && (
              <div
                className="px-3 sm:px-4 py-3 sm:py-4"
                id={`panel-${task}`}
                role="region"
                aria-labelledby={`header-${task}`}
              >
                <ul className="space-y-2.5">
                  {list.map((ex) => (
                    <li key={ex.id}>
                      <button
                        type="button"
                        className={[
                          'w-full text-left rounded-xl border p-3.5 sm:p-4 transition',
                          'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
                          'hover:-translate-y-0.5',
                        ].join(' ')}
                        onClick={() => onSelect?.(ex)}
                        title="Open exercise"
                      >
                        <span className="block font-semibold text-slate-100 truncate">
                          {ex.title || ex.question || 'Exercise'}
                        </span>
                        {(ex.question || ex.subtitle) && (
                          <span className="block text-slate-400 text-sm mt-0.5 line-clamp-2">
                            {ex.subtitle || ex.question}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
