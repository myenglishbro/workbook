﻿import React from 'react'
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
    imageUrl,
    title,
  } = exercise

  const pretty = (s) => {
    if (!Number.isFinite(s)) return null
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  const skillLabel = skill.charAt(0).toUpperCase() + skill.slice(1)

  return (
    <article className="c-card p-5 sm:p-6">
      {/* Header */}
      <header className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2">
        <span className="c-chip">{(type?.toUpperCase?.()) || 'EXAM'}</span>
        <span className="c-chip">{skillLabel}</span>
        {Number.isFinite(timeLimitSec) && (
          <span className="c-chip c-chip--ghost" title="Time limit">
            ⏱ {pretty(timeLimitSec)}
          </span>
        )}
      </header>

      {/* Title / Question */}
      <h3 className="text-xl sm:text-2xl font-extrabold text-[color:var(--text)] leading-snug preline">
        {title || question}
      </h3>

      {/* Image */}
      {imageUrl ? (
        <figure className="mt-4 overflow-hidden rounded-xl border border-[color:var(--panel-border)] bg-white">
          <img
            src={imageUrl}
            alt={title || question}
            className="w-full aspect-[16/9] object-cover transition-transform duration-300 hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </figure>
      ) : null}

      {/* Verbs */}
      {verbs?.length ? (
        <section className="mt-4">
          <h4 className="c-sec-title">Suggested verbs</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {verbs.slice(0, 12).map((v, i) => (
              <span key={i} className="c-tag">{v}</span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Examples */}
      {examples?.length ? (
        <section className="mt-4">
          <h4 className="c-sec-title">Examples (max 3)</h4>
          <ul className="mt-2 grid gap-2">
            {examples.slice(0, 3).map((ej, idx) => (
              <li key={idx} className="c-list-item preline">
                {ej}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Recorder */}
      <section className="mt-5">
        <h4 className="c-sec-title">Your response</h4>
        <div className="mt-2">
          <Recorder filePrefix={`${id || type}-respuesta`} limitSec={timeLimitSec} />
        </div>
      </section>
    </article>
  )
}
