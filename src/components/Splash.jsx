import React, { useState, useMemo } from 'react'
import { BookOpen, Mic, Headphones, Eye, PenLine, Keyboard, GraduationCap, Globe2, Sparkles, MessageSquare } from 'lucide-react'

/**
 * CELTESPIP Light + Icon chips pastel por TYPE y SKILL
 * - Lógica intacta
 * - Estilo claro con cards blancas
 * - Chips color pastel en los dos pasos
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

  // 🎨 Colores pastel y iconos por skill
  const SKILL_COLORS = useMemo(() => ({
    speaking:  { bg: '#E7F0FF', fg: 'var(--primary)', icon: Mic },
    listening: { bg: '#F0EAFE', fg: '#6B4DE6', icon: Headphones },
    reading:   { bg: '#EAF7EE', fg: '#1B8754', icon: Eye },
    writing:   { bg: '#FFF3E6', fg: '#C66B00', icon: PenLine },
    type:      { bg: '#EAF9FF', fg: '#0F90B8', icon: Keyboard },
    default:   { bg: '#EEF3FF', fg: 'var(--primary)', icon: BookOpen },
  }), [])

  // 🎓 Colores pastel y iconos por tipo de examen
  const TYPE_COLORS = useMemo(() => ({
    celpip:    { bg: '#EAF9FF', fg: '#0F90B8', icon: MessageSquare },
    cambridge: { bg: '#FFF3E6', fg: '#C66B00', icon: GraduationCap },
    ielts:     { bg: '#E7F0FF', fg: 'var(--primary)', icon: BookOpen },
    duolingo:  { bg: '#F0EAFE', fg: '#6B4DE6', icon: Sparkles },
    default:   { bg: '#EEF3FF', fg: 'var(--primary)', icon: Globe2 },
  }), [])

  function proceed() {
    if (step === 1) setStep(2)
    else onDone({ type, skill })
  }

  function IconChip({ icon: Icon, bg, fg }) {
    return (
      <span
        className="inline-grid place-items-center rounded-2xl w-10 h-10 mr-2"
        style={{ background: bg, color: fg }}
        aria-hidden
      >
        <Icon className="w-5 h-5" />
      </span>
    )
  }

  return (
    <div className="w-full min-h-[70vh] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[color:var(--text)]">
            ¿Qué quieres estudiar hoy?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[color:var(--muted)]">
            {step === 1 ? 'Selecciona el tipo de examen' : 'Elige la habilidad a practicar'}
          </p>
        </div>

        {/* Stepper */}
        <ol className="mb-6 sm:mb-8 flex items-center justify-center gap-4 sm:gap-6" aria-label="Progreso">
          {[1, 2].map((n) => (
            <li key={n} className="flex items-center gap-2">
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold',
                  n <= step
                    ? 'border-[color:var(--primary)] bg-[#EEF3FF] text-[color:var(--primary)]'
                    : 'border-[color:var(--panel-border)] bg-white text-[color:var(--muted)]',
                ].join(' ')}
                aria-current={n === step ? 'step' : undefined}
              >
                {n}
              </span>
              {n === 1 && <span className="hidden sm:inline text-xs text-[color:var(--muted)]">Tipo</span>}
              {n === 2 && <span className="hidden sm:inline text-xs text-[color:var(--muted)]">Habilidad</span>}
            </li>
          ))}
        </ol>

        {/* Card principal */}
        <div className="c-card w-full p-4 sm:p-6">
          {step === 1 ? (
            <>
              {/* TIPOS DE EXAMEN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {types.map((t) => {
                  const selected = type === t.id
                  const colors = TYPE_COLORS[t.id] || TYPE_COLORS.default
                  const Icon = colors.icon
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      aria-pressed={selected}
                      className={[
                        'group relative text-left rounded-xl border transition-all',
                        'bg-white border-[color:var(--panel-border)] hover:bg-[#F7FAFF] hover:border-[color:var(--primary)]/30',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40',
                        'p-4 sm:p-5',
                        selected ? 'ring-2 ring-[color:var(--primary)]/50 border-[color:var(--primary)]/50' : 'ring-0',
                      ].join(' ')}
                    >
                      {/* Check badge */}
                      <span
                        className={[
                          'absolute right-3 top-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full border text-[10px] font-semibold',
                          selected
                            ? 'border-[color:var(--primary)] bg-[#EEF3FF] text-[color:var(--primary)]'
                            : 'border-[color:var(--panel-border)] bg-white text-[color:var(--muted)]',
                        ].join(' ')}
                      >
                        {selected ? '✓' : '•'}
                      </span>

                      <div className="flex items-center">
                        <IconChip icon={Icon} bg={colors.bg} fg={colors.fg} />
                        <div>
                          <div className="text-base sm:text-lg font-extrabold text-[color:var(--text)]">
                            {t.label}
                          </div>
                          <div className="mt-1 text-sm text-[color:var(--muted)]">
                            Preparación específica
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Action bar */}
              <div className="sticky bottom-0 mt-5 flex justify-end">
                <button className="btn-primary-tw" onClick={proceed}>Continuar</button>
              </div>
            </>
          ) : (
            <>
              {/* SKILLS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {skills.map((s) => {
                  const selected = skill === s.id
                  const colors = SKILL_COLORS[s.id] || SKILL_COLORS.default
                  const Icon = colors.icon
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkill(s.id)}
                      aria-pressed={selected}
                      className={[
                        'group relative text-left rounded-xl border transition-all',
                        'bg-white border-[color:var(--panel-border)] hover:bg-[#F7FAFF] hover:border-[color:var(--primary)]/30',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40',
                        'p-4 sm:p-5',
                        selected ? 'ring-2 ring-[color:var(--primary)]/50 border-[color:var(--primary)]/50' : 'ring-0',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'absolute right-3 top-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full border text-[10px] font-semibold',
                          selected
                            ? 'border-[color:var(--primary)] bg-[#EEF3FF] text-[color:var(--primary)]'
                            : 'border-[color:var(--panel-border)] bg-white text-[color:var(--muted)]',
                        ].join(' ')}
                      >
                        {selected ? '✓' : '•'}
                      </span>

                      <div className="flex items-center">
                        <IconChip icon={Icon} bg={colors.bg} fg={colors.fg} />
                        <div>
                          <div className="text-base sm:text-lg font-extrabold text-[color:var(--text)]">
                            {s.label}
                          </div>
                          <div className="mt-1 text-sm text-[color:var(--muted)]">
                            Enfoque por habilidad
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Action bar */}
              <div className="sticky bottom-0 mt-5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end sm:gap-2">
                <div className="text-xs text-[color:var(--muted)] sm:mr-auto sm:self-center">Paso {step} de 2</div>
                <button className="btn-ghost-tw" onClick={() => setStep(1)}>Atrás</button>
                <button className="btn-primary-tw" onClick={proceed}>Empezar</button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--muted)]">
          Puedes cambiar tu selección antes de continuar.
        </p>
      </div>
    </div>
  )
}
