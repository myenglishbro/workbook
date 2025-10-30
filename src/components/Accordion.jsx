import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Lógica idéntica — solo UI/UX (light theme)
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

  if (!items?.length) {
    return <p className="text-[color:var(--muted)] italic text-sm">No exercises available.</p>
  }

  return (
    <div className="space-y-4">
      {grouped.map(([task, list]) => {
        const isOpen = open.has(task)
        return (
          <section
            key={task}
            className={[
              'c-card overflow-hidden transition-shadow',
              isOpen ? 'ring-1 ring-[color:var(--primary)]/10' : ''
            ].join(' ')}
          >
            {/* Header */}
            <button
              type="button"
              className={[
                'w-full grid grid-cols-[1fr_auto_32px] items-center gap-3 px-4 sm:px-5 py-3.5',
                'text-left border-b border-[color:var(--panel-border)]',
                'hover:bg-[#F7FAFF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 rounded-t-[20px]'
              ].join(' ')}
              onClick={() => toggle(task)}
              aria-expanded={isOpen}
              aria-controls={`panel-${task}`}
              id={`header-${task}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-grid place-items-center h-6 w-6 rounded-full border border-[color:var(--panel-border)] bg-white text-xs font-bold text-[color:var(--primary)]">
                  {task}
                </span>
                <span className="font-extrabold text-[color:var(--text)] truncate">
                  Task {task}
                </span>
              </div>

              <span className="inline-flex items-center gap-2 text-[color:var(--muted)] text-sm">
                <span className="px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#1E3A8A] text-xs font-bold">
                  {list.length} {list.length === 1 ? 'exercise' : 'exercises'}
                </span>
              </span>

              <span
                className={[
                  'h-8 w-8 inline-grid place-items-center rounded-md border border-[color:var(--panel-border)] bg-white text-[color:var(--muted)] transition-transform',
                  isOpen ? 'rotate-180' : ''
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
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="px-3 sm:px-4 py-3 sm:py-4"
                  id={`panel-${task}`}
                  role="region"
                  aria-labelledby={`header-${task}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ul className="space-y-2.5">
                    {list.map((ex) => (
                      <motion.li
                        key={ex.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <motion.button
                          type="button"
                          className={[
                            'w-full text-left rounded-xl border p-3.5 sm:p-4 transition',
                            'bg-white border-[color:var(--panel-border)] hover:bg-[#F7FAFF] hover:border-[color:var(--primary)]/30',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40'
                          ].join(' ')}
                          onClick={() => onSelect?.(ex)}
                          title="Open exercise"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20, duration: 0.12 }}
                        >
                          <div className="flex items-center gap-2">
                <span className="block font-extrabold text-[color:var(--text)] truncate preline">
                  {ex.title || ex.question || 'Exercise'}
                </span>

                            {/* Badge por nivel (pastel) */}
                            {(() => {
                              const lvl = ex.level || (ex.task >= 3 ? 'Advanced' : ex.task === 2 ? 'Intermediate' : 'Beginner')
                              const cls =
                                lvl === 'Advanced'
                                  ? 'bg-[#F6E8FF] text-[#6B4DE6]'
                                  : lvl === 'Intermediate'
                                  ? 'bg-[#FFF2D9] text-[#C66B00]'
                                  : 'bg-[#EAF7EE] text-[#1B8754]'
                              return (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>
                                  {lvl}
                                </span>
                              )
                            })()}
                          </div>

                          {(ex.question || ex.subtitle) && (
                            <span className="block text-[color:var(--muted)] text-sm mt-0.5 line-clamp-2 preline">
                              {ex.subtitle || ex.question}
                            </span>
                          )}

                          {/* Mini progress opcional si envías ex.progress (0–100) */}
                          {typeof ex.progress === 'number' && (
                            <div className="mt-2">
                              <div className="h-1.5 rounded-full bg-[#E9EEF7] overflow-hidden">
                                <span
                                  className="block h-full bg-[color:var(--primary)]"
                                  style={{ width: `${Math.min(100, Math.max(0, ex.progress))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </motion.button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )
      })}
    </div>
  )
}
