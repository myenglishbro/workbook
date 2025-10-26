import React, { useEffect, useState } from 'react'
import Recorder from './Recorder.jsx'
import WritingPanel from './WritingPanel.jsx'
import ReadingQuiz from './ReadingQuiz.jsx' // 👈 usa ReadingQuiz

export default function ExerciseDetail({ exercise, onBack }) {
  const {
    id,
    type,
    skill = 'speaking',
    title,
    question,
    examples = [],
    verbs = [],
    timeLimitSec,
    targetWords,
    minWords,
    imageUrl,
    questions = [], // para ReadingQuiz si tu JSON las trae
  } = exercise

  const [zoomOpen, setZoomOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setZoomOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="card">
      <div className="px-4 py-4 border-b border-slate-800 bg-slate-900/40">
        <div className="flex gap-2 mb-2">
          <span className="chip-tw">{type?.toUpperCase?.()}</span>
          <span className="chip-tw">{skill[0].toUpperCase() + skill.slice(1)}</span>
          {exercise.task != null ? <span className="chip-tw">Task {exercise.task}</span> : null}
        </div>
        <h2 className="mb-1">{title || question}</h2>
        <p className="text-slate-300 text-sm m-0">{question}</p>
        <div className="mt-3">
          <button className="btn-ghost-tw" onClick={onBack}>Volver al listado</button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Imagen opcional SOLO cuando no es Reading (evita duplicados) */}
        {imageUrl && skill !== 'reading' ? (
          <div>
            <img
              src={imageUrl}
              alt="Imagen del ejercicio"
              className="w-full max-h-72 object-cover rounded-2xl border border-slate-800 cursor-zoom-in shadow-md hover:scale-[1.01] transition-transform duration-300"
              onClick={() => setZoomOpen(true)}
              loading="lazy"
            />
            {zoomOpen && (
              <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                onClick={() => setZoomOpen(false)}
                role="dialog"
                aria-modal="true"
              >
                <img
                  src={imageUrl}
                  alt="Imagen ampliada"
                  className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl cursor-zoom-out"
                />
              </div>
            )}
          </div>
        ) : null}

        {verbs?.length ? (
          <div className="text-slate-300">
            <strong className="text-slate-100">Verbos sugeridos:</strong> <span>{verbs.join(', ')}</span>
          </div>
        ) : null}

        {examples?.length ? (
          <div>
            <strong>Ejemplos:</strong>
            <ul className="list-disc pl-5 mt-2 text-slate-300">
              {examples.slice(0, 3).map((ej, idx) => (
                <li key={idx}>{ej}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Cuerpo según skill */}
        {skill === 'writing' ? (
          <div>
            <WritingPanel
              filePrefix={`${id || type}-writing`}
              limitSec={timeLimitSec}
              targetWords={targetWords}
              minWords={minWords}
            />
          </div>
        ) : skill === 'reading' ? (
          <div className="space-y-3">
            <ReadingQuiz
              imageUrl={imageUrl}                   // 👈 ahora la imagen la maneja ReadingQuiz
              title={title || question}
              questions={questions}                 // si tu JSON incluye preguntas
              filePrefix={`${id || type}-reading`}
            />
          </div>
        ) : (
          <div>
            <Recorder filePrefix={`${id || type}-respuesta`} limitSec={timeLimitSec} />
          </div>
        )}
      </div>
    </div>
  )
}
