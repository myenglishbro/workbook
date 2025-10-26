import React, { useState } from 'react'

/**
 * UI refresh only — logic preserved.
 * - Cleaner layout with gradient background shell
 * - Stepper indicator
 * - Responsive grid cards with selected state
 * - Better focus/hover states and a sticky action bar
 * - Fixed Spanish accent encoding
 * - Keeps your custom btn classes: btn-primary-tw, btn-ghost-tw
 */
export default function Splash({
  types,
  skills,
  onDone,
  defaultType = 'celpip',
  defaultSkill = 'speaking',
}) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState(defaultType)
  const [skill, setSkill] = useState(defaultSkill)

  function proceed() {
    if (step === 1) setStep(2)
    else onDone({ type, skill })
  }

  return (
    <div className="w-full min-h-[70vh] px-4 py-8 sm:py-12 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            ¿Qué quieres estudiar hoy?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            {step === 1 ? 'Selecciona el tipo de examen' : 'Elige la habilidad a practicar'}
          </p>
        </div>

        {/* Stepper */}
        <ol className="mb-6 sm:mb-8 flex items-center justify-center gap-3 sm:gap-6" aria-label="Progreso">
          {[1, 2].map((n) => (
            <li key={n} className="flex items-center gap-2">
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold',
                  n <= step
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400',
                ].join(' ')}
                aria-current={n === step ? 'step' : undefined}
              >
                {n}
              </span>
              {n === 1 && (
                <span className="hidden sm:inline text-xs text-slate-400">Tipo</span>
              )}
              {n === 2 && (
                <span className="hidden sm:inline text-xs text-slate-400">Habilidad</span>
              )}
            </li>
          ))}
        </ol>

        {/* Card Container */}
        <div className="card w-full rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/20 backdrop-blur p-4 sm:p-6">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {types.map((t) => {
                  const selected = type === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      aria-pressed={selected}
                      className={[
                        'group relative text-left rounded-xl border transition-all',
                        'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/60',
                        'p-4 sm:p-5',
                        selected ? 'ring-2 ring-amber-400/70 border-amber-400/50' : 'ring-0',
                      ].join(' ')}
                    >
                      {/* Check badge when selected */}
                      <span
                        className={[
                          'absolute right-3 top-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full border text-[10px] font-semibold',
                          selected
                            ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                            : 'border-slate-700 bg-slate-800 text-slate-500',
                        ].join(' ')}
                        aria-hidden
                      >
                        {selected ? '✓' : '•'}
                      </span>

                      <div className="text-base sm:text-lg font-semibold text-white">
                        {t.label}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        Preparación específica
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Action bar */}
              <div className="sticky bottom-0 mt-5 flex justify-end">
                <button className="btn-primary-tw" onClick={proceed}>
                  Continuar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {skills.map((s) => {
                  const selected = skill === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkill(s.id)}
                      aria-pressed={selected}
                      className={[
                        'group relative text-left rounded-xl border transition-all',
                        'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/60',
                        'p-4 sm:p-5',
                        selected ? 'ring-2 ring-amber-400/70 border-amber-400/50' : 'ring-0',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'absolute right-3 top-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full border text-[10px] font-semibold',
                          selected
                            ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                            : 'border-slate-700 bg-slate-800 text-slate-500',
                        ].join(' ')}
                        aria-hidden
                      >
                        {selected ? '✓' : '•'}
                      </span>

                      <div className="text-base sm:text-lg font-semibold text-white">
                        {s.label}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">Enfoque por habilidad</div>
                    </button>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 mt-5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end sm:gap-2">
                <button className="btn-ghost-tw" onClick={() => setStep(1)}>
                  Atrás
                </button>
                <button className="btn-primary-tw" onClick={proceed}>
                  Empezar
                </button>
              </div>
            </>
          )}
        </div>

        {/* Small tips */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Puedes cambiar tu selección antes de continuar.
        </p>
      </div>
    </div>
  )
}
