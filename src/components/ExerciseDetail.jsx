﻿import React, { useEffect, useState } from 'react'
import Recorder from './Recorder.jsx'
import WritingPanel from './WritingPanel.jsx'
import ReadingQuiz from './ReadingQuiz.jsx'
import ListeningQuiz from './ListeningQuiz.jsx'

// Small local component: sample answers with tabs (B2/C1/C2)
function SamplesTabs({ examples = [] }) {
  const [tab, setTab] = useState(0)
  const labels = ['B2', 'C1', 'C2']
  const current = examples[tab] || ''
  return (
    <div className="mt-2">
      <div className="flex rounded-full border border-[color:var(--panel-border)] bg-white overflow-hidden w-fit">
        {labels.map((lbl, i) => (
          <button
            key={lbl}
            type="button"
            onClick={() => setTab(i)}
            className={[
              'px-3 py-1 text-sm font-semibold transition-colors',
              i === tab ? 'bg-[color:var(--primary)] text-white' : 'text-[color:var(--muted)] hover:bg-[#EEF3FF]'
            ].join(' ')}
          >
            {lbl}
          </button>
        ))}
      </div>
      <div className="mt-3 text-[color:var(--text)] text-sm leading-relaxed">
        {current || '—'}
      </div>
    </div>
  )
}

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
    questions = [],
    videoUrl,
    youtubeId,
    examinerTip,
  } = exercise

  const [zoomOpen, setZoomOpen] = useState(false)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setZoomOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="card">
      <div className="px-4 py-4 border-b border-[color:var(--panel-border)] bg-white">
        <div className="flex gap-2 mb-2">
          <span className="chip-tw">{type?.toUpperCase?.()}</span>
          <span className="chip-tw">{skill[0].toUpperCase() + skill.slice(1)}</span>
          {exercise.task != null ? <span className="chip-tw">Task {exercise.task}</span> : null}
          {exercise.level ? (
            <span className="chip-tw">
              {exercise.level}
            </span>
          ) : null}
        </div>
        <h2 className="mb-1">{title || question}</h2>
        <p className="text-[color:var(--muted)] text-sm m-0">{question}</p>
        <div className="mt-3">
          <button className="btn-ghost-tw" onClick={onBack}>Back to list</button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Imagen opcional cuando no es Reading (evita duplicado) */}
        {imageUrl && skill !== 'reading' ? (
          <div>
            <img
              src={imageUrl}
              alt="Exercise image"
              className="w-full max-h-72 object-cover rounded-2xl border border-[color:var(--panel-border)] cursor-zoom-in shadow-md hover:scale-[1.01] transition-transform duration-300"
              onClick={() => setZoomOpen(true)}
              loading="lazy"
            />
            {zoomOpen && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setZoomOpen(false)} role="dialog" aria-modal="true">
                <img src={imageUrl} alt="Zoomed image" className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl cursor-zoom-out" />
              </div>
            )}
          </div>
        ) : null}

        {verbs?.length ? (
          <div className="text-[color:var(--muted)]">
            <strong className="text-[color:var(--text)]">Suggested verbs:</strong> <span>{verbs.join(', ')}</span>
          </div>
        ) : null}

        {examples?.length ? (
          <div>
            <details className="rounded-xl border border-[color:var(--panel-border)] bg-white p-3">
              <summary className="cursor-pointer text-[color:var(--text)]">View sample answer</summary>
              <SamplesTabs examples={examples} />
            </details>
          </div>
        ) : null}

        {/* Tips del examinador */}
        <details className="rounded-xl border border-[color:var(--panel-border)] bg-white p-3">
          <summary className="cursor-pointer text-[color:var(--text)]">Tips del examinador</summary>
          <div className="mt-2 text-[color:var(--muted)] text-sm">
            <p className="m-0">{examinerTip || 'Avoid repeating "because" too often. Try "since", "as", or "due to". Vary sentence length and connect ideas clearly.'}</p>
          </div>
        </details>

        {/* Body by skill */}
        {skill === 'writing' ? (
          <div>
            <WritingPanel filePrefix={`${id || type}-writing`} limitSec={timeLimitSec} targetWords={targetWords} minWords={minWords} />
          </div>
        ) : skill === 'reading' ? (
          <div className="space-y-3">
            <ReadingQuiz imageUrl={imageUrl} title={title || question} questions={questions} />
          </div>
        ) : skill === 'listening' ? (
          <div className="space-y-3">
            <ListeningQuiz videoUrl={videoUrl} youtubeId={youtubeId} title={title || question} questions={questions} />
          </div>
        ) : skill === 'type' ? (
          <div className="space-y-3">
            <ReadingQuiz imageUrl={imageUrl} title={title || question} questions={questions} />
          </div>
        ) : (
          <div>
            <Recorder filePrefix={`${id || type}-respuesta`} limitSec={timeLimitSec} expectedKeywords={verbs} />
          </div>
        )}
      </div>
    </div>
  )
}
