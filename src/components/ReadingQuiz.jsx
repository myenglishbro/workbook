import React, { useMemo, useState } from 'react'

export default function ReadingQuiz({
  imageUrl,
  questions = [],
  title = 'Reading',
  filePrefix = 'reading',
}) {
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)

  const normalized = useMemo(
    () => (Array.isArray(questions) ? questions.filter(Boolean) : []),
    [questions]
  )

  const normalizeText = (s) => (s || '').toString().trim().toLowerCase()

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function reset() {
    setAnswers({})
    setChecked(false)
  }

  function isCorrect(q, ans) {
    if (Array.isArray(q.options)) {
      if (typeof q.answer === 'number') return Number(ans) === q.answer
      if (typeof q.answer === 'string')
        return normalizeText(q.options[Number(ans)]) === normalizeText(q.answer)
      return false
    }
    if (typeof q.answer === 'string')
      return normalizeText(ans) === normalizeText(q.answer)
    return false
  }

  const results = useMemo(() => {
    if (!checked) return null
    const per = normalized.map((q) => ({
      id: q.id,
      ok: isCorrect(q, answers[q.id]),
    }))
    const score = per.reduce((acc, r) => acc + (r.ok ? 1 : 0), 0)
    return { per, score, total: normalized.length }
  }, [checked, normalized, answers])

  return (
    <div className="space-y-6">
      {/* Imagen Ãºnica (agrandada) con zoom */}
      {imageUrl ? (
        <div className="relative group">
          <img
            src={imageUrl}
            alt="Reading text"
            className="w-full rounded-2xl border border-slate-800 shadow-lg max-h-[500px] object-contain bg-slate-950 cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
            onClick={() => setZoomOpen(true)}
            loading="lazy"
          />
          <figcaption className="text-slate-400 text-sm mt-1 italic text-center">
            {title}
          </figcaption>

          {zoomOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setZoomOpen(false)}
            >
              <img
                src={imageUrl}
                alt="Zoom"
                className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl cursor-zoom-out transition-all duration-300"
              />
            </div>
          )}
        </div>
      ) : null}

      {/* Preguntas */}
      <ol className="space-y-4 list-decimal pl-5">
        {normalized.map((q, idx) => {
          const user = answers[q.id]
          const ok = checked ? isCorrect(q, user) : null
          return (
            <li
              key={q.id || idx}
              className={`p-4 rounded-2xl border transition-colors duration-300 ${
                checked
                  ? ok
                    ? 'border-emerald-500/70 bg-emerald-950/30'
                    : 'border-rose-500/70 bg-rose-950/20'
                  : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900/80'
              } shadow-sm`}
            >
              <div className="text-slate-100 font-semibold mb-3">
                {q.prompt || `Pregunta ${idx + 1}`}
              </div>

              {Array.isArray(q.options) ? (
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors duration-300 cursor-pointer ${
                        checked
                          ? Number(user) === oi
                            ? ok
                              ? 'border-emerald-500 bg-emerald-900/20'
                              : 'border-rose-500 bg-rose-900/20'
                            : 'border-slate-700 bg-slate-900'
                          : 'border-slate-700 bg-slate-900 hover:bg-slate-800/70'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id || `q-${idx}`}
                        checked={Number(user) === oi}
                        onChange={() => setAnswer(q.id, oi)}
                      />
                      <span className="text-slate-200">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${
                    checked
                      ? ok
                        ? 'border-emerald-500 bg-emerald-900/20'
                        : 'border-rose-500 bg-rose-900/20'
                      : 'border-slate-700 bg-slate-900 hover:bg-slate-800/60'
                  } text-slate-100 placeholder-slate-500`}
                  placeholder="Type your answer"
                  value={user || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}

              {checked && ok === false && q.explanation ? (
                <div className="text-slate-300 text-sm mt-2 italic">
                  ðŸ’¡ <span className="text-slate-400">Hint:</span> {q.explanation}
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 justify-between mt-6">
        {!checked ? (
          <button
            className="btn-ghost-tw bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/40 hover:text-white transition"
            onClick={() => setChecked(true)}
            disabled={!normalized.length}
          >
            Check answers
          </button>
        ) : (
          <>
            <button
              className="btn-ghost-tw border border-slate-600 hover:bg-slate-800 text-slate-200"
              onClick={reset}
            >
              Reset
            </button>
            <span className="chip-tw bg-emerald-900/30 border border-emerald-600/50 text-emerald-300 font-semibold px-3 py-1 rounded-full">
              PuntuaciÃ³n: {results?.score ?? 0} / {results?.total ?? normalized.length}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

