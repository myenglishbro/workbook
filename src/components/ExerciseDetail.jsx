import React from 'react'
import Recorder from './Recorder.jsx'
import WritingPanel from './WritingPanel.jsx'

export default function ExerciseDetail({ exercise, onBack }) {
  const { id, type, skill = 'speaking', title, question, examples = [], verbs = [], timeLimitSec, targetWords, minWords } = exercise
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

      <div className="p-4 space-y-3">
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

        {skill === 'writing' ? (
          <div>
            <WritingPanel filePrefix={`${id || type}-writing`} limitSec={timeLimitSec} targetWords={targetWords} minWords={minWords} />
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
