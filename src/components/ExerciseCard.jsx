import React from 'react'
import Recorder from './Recorder.jsx'

export default function ExerciseCard({ exercise }) {
  const {
    id,
    type,
    skill = 'speaking',
    question,
    examples = [],
    verbs = [],
    timeLimitSec,
    imageUrl, // 👈 importante
    title,
  } = exercise

  return (
    <article className="exercise">
      <header className="exercise-header">
        <div className="badge">{type?.toUpperCase?.() || 'EXAM'}</div>
        <div className="badge">{skill.charAt(0).toUpperCase() + skill.slice(1)}</div>
        <h3 className="question">{title || question}</h3>
      </header>

      {/* 👇 NUEVO: Mostrar imagen si existe */}
      {imageUrl ? (
        <figure className="my-3">
          <img
            src={imageUrl}
            alt={title || question}
            className="w-full max-h-48 object-cover rounded-lg border border-slate-700 shadow-md"
            loading="lazy"
            onError={(e) => {
              // si falla la carga, la ocultamos
              e.currentTarget.style.display = 'none'
            }}
          />
        </figure>
      ) : null}

      {verbs?.length ? (
        <div className="verbs">
          <strong>Verbos sugeridos:</strong>
          <span>{verbs.join(', ')}</span>
        </div>
      ) : null}

      {examples?.length ? (
        <div className="examples">
          <strong>Ejemplos (3):</strong>
          <ul>
            {examples.slice(0, 3).map((ej, idx) => (
              <li key={idx}>{ej}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* 🔊 Grabadora */}
      <Recorder filePrefix={`${id || type}-respuesta`} limitSec={timeLimitSec} />
    </article>
  )
}
