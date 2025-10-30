import React, { useMemo, useState } from 'react'

function extractYouTubeId(urlOrId = '') {
  if (!urlOrId) return ''
  if (/^[a-zA-Z0-9_-]{10,}$/i.test(urlOrId) && !/\//.test(urlOrId)) return urlOrId
  const m = String(urlOrId).match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : ''
}

export default function ListeningQuiz({ videoUrl, youtubeId, questions = [], title = 'Listening' }) {
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  const normalized = useMemo(() => Array.isArray(questions) ? questions.filter(Boolean) : [], [questions])
  const vid = useMemo(() => extractYouTubeId(youtubeId || videoUrl), [youtubeId, videoUrl])

  function setAnswer(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function reset() {
    setAnswers({})
    setChecked(false)
  }

  function normalizeText(s) {
    return (s || '').toString().trim().toLowerCase()
  }

  function isCorrect(q, ans) {
    if (Array.isArray(q.options)) {
      if (typeof q.answer === 'number') return Number(ans) === q.answer
      if (typeof q.answer === 'string') return normalizeText(q.options[Number(ans)]) === normalizeText(q.answer)
      return false
    }
    if (typeof q.answer === 'string') return normalizeText(ans) === normalizeText(q.answer)
    return false
  }

  const results = useMemo(() => {
    if (!checked) return null
    const per = normalized.map(q => ({ id: q.id, ok: isCorrect(q, answers[q.id]) }))
    const score = per.reduce((acc, r) => acc + (r.ok ? 1 : 0), 0)
    return { per, score, total: normalized.length }
  }, [checked, normalized, answers])

  return (
    <div className="space-y-4">
      {vid ? (
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-[color:var(--panel-border)] bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${vid}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}

      <ol className="space-y-4 list-decimal pl-5">
        {normalized.map((q, idx) => {
          const user = answers[q.id]
          const ok = checked ? isCorrect(q, user) : null
          return (
            <li key={q.id || idx} className="p-3 rounded-xl border border-[color:var(--panel-border)] bg-white">
              <div className="text-[color:var(--text)] font-semibold mb-2 preline">{q.prompt || `Pregunta ${idx + 1}`}</div>
              {Array.isArray(q.options) ? (
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-2 p-2 rounded-lg border ${checked ? (Number(user) === oi ? (ok ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50') : 'border-[color:var(--panel-border)] bg-white') : 'border-[color:var(--panel-border)] bg-white hover:bg-[#F7FAFF]'}`}>
                      <input
                        type="radio"
                        name={q.id || `q-${idx}`}
                        checked={Number(user) === oi}
                        onChange={() => setAnswer(q.id, oi)}
                      />
                      <span className="text-[color:var(--text)]">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className={`w-full p-2 rounded-lg border ${checked ? (ok ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50') : 'border-[color:var(--panel-border)] bg-white hover:bg-[#F7FAFF]'} text-[color:var(--text)]`}
                  placeholder="Type your answer"
                  value={user || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}
              {checked && ok === false && q.explanation ? (
                <div className="text-[color:var(--muted)] text-sm mt-2">Hint: {q.explanation}</div>
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button className="btn-ghost-tw" onClick={() => setChecked(true)} disabled={!normalized.length}>Check answers</button>
        ) : (
          <>
            <button className="btn-ghost-tw" onClick={reset}>Reset</button>
            <span className="chip-tw">Puntuación: {results?.score ?? 0} / {results?.total ?? normalized.length}</span>
          </>
        )}
      </div>
    </div>
  )
}
