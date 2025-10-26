import React, { useState } from 'react'

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
    <div className="w-full">
      <div className="card w-full max-w-4xl mx-auto p-6">
        <h1 className="mb-3">¿Qué quieres estudiar hoy?</h1>
        {step === 1 ? (
          <>
            <p className="text-slate-300 mb-3">Selecciona el tipo de examen</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {types.map((t) => (
                <button
                  key={t.id}
                  className={`card text-left p-4 transition hover:-translate-y-0.5 ${type === t.id ? 'ring-2 ring-amber-400' : ''}`}
                  onClick={() => setType(t.id)}
                  aria-pressed={type === t.id}
                >
                  <div className="text-base font-semibold">{t.label}</div>
                  <div className="text-slate-400 text-sm mt-1">Preparación específica</div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-primary-tw" onClick={proceed}>Continuar</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-slate-300 mb-3">Elige la habilidad</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {skills.map((s) => (
                <button
                  key={s.id}
                  className={`card text-left p-4 transition hover:-translate-y-0.5 ${skill === s.id ? 'ring-2 ring-amber-400' : ''}`}
                  onClick={() => setSkill(s.id)}
                  aria-pressed={skill === s.id}
                >
                  <div className="text-base font-semibold">{s.label}</div>
                  <div className="text-slate-400 text-sm mt-1">Foco por destreza</div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-ghost-tw" onClick={() => setStep(1)}>Atrás</button>
              <button className="btn-primary-tw" onClick={proceed}>Empezar</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
