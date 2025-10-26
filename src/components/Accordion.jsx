import React, { useState } from 'react'

function groupByTask(items) {
  const map = new Map()
  for (const it of items || []) {
    const task = it.task ?? 1
    if (!map.has(task)) map.set(task, [])
    map.get(task).push(it)
  }
  return Array.from(map.entries()).sort((a,b) => Number(a[0]) - Number(b[0]))
}

export default function Accordion({ items, onSelect }) {
  const [open, setOpen] = useState(new Set())
  const grouped = groupByTask(items)

  function toggle(task) {
    setOpen(prev => {
      const n = new Set(prev)
      if (n.has(task)) n.delete(task); else n.add(task)
      return n
    })
  }

  if (!items?.length) return <p className="text-slate-400">No hay ejercicios disponibles.</p>

  return (
    <div className="space-y-3">
      {grouped.map(([task, list]) => {
        const isOpen = open.has(task)
        return (
          <section key={task} className="card overflow-hidden">
            <button
              className="w-full grid grid-cols-[1fr_auto_24px] items-center gap-3 px-4 py-3 border-b border-slate-800 text-left hover:bg-slate-800/30 transition"
              onClick={() => toggle(task)}
              aria-expanded={isOpen}
              aria-controls={`panel-${task}`}
              id={`header-${task}`}
            >
              <div className="font-bold">Task {task}</div>
              <span className="text-slate-300 text-sm">{list.length} ejercicios</span>
              <span className={`transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden>▾</span>
            </button>
            {isOpen && (
              <div className="px-3 py-3" id={`panel-${task}`} role="region" aria-labelledby={`header-${task}`}>
                <ul className="space-y-2">
                  {list.map((ex) => (
                    <li key={ex.id}>
                      <button
                        className="w-full text-left card px-3 py-3 hover:-translate-y-0.5 transition"
                        onClick={() => onSelect?.(ex)}
                        title="Abrir ejercicio"
                      >
                        <span className="block font-semibold">{ex.title || ex.question || 'Ejercicio'}</span>
                        {(ex.question || ex.subtitle) && (
                          <span className="block text-slate-400 text-sm mt-0.5">{ex.subtitle || ex.question}</span>
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

