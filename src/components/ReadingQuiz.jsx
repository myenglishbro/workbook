import React, { useMemo, useState } from 'react'

export default function ReadingQuiz({
  imageUrl,
  questions = [],
  title = 'Reading',
  filePrefix = 'reading',
}) {
  // --------- original state/logic preserved ---------
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
    const per = normalized.map((q) => ({ id: q.id, ok: isCorrect(q, answers[q.id]) }))
    const score = per.reduce((acc, r) => acc + (r.ok ? 1 : 0), 0)
    return { per, score, total: normalized.length }
  }, [checked, normalized, answers])

  // derived UI-only info (no behavioral changes)
  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => v !== undefined && v !== '').length,
    [answers]
  )

  return (
    <div className="w-full">
      {/* Header / toolbar */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[color:var(--text)] tracking-tight">{title}</h2>
          <p className="text-[color:var(--muted)] text-sm mt-1">
            {normalized.length} {normalized.length === 1 ? 'question' : 'questions'} · {answeredCount}
            /{normalized.length} answered
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!checked ? (
            <button
              className="btn-ghost-tw bg-amber-500/20 border border-amber-500/40 text-amber-600 hover:bg-amber-500/30 hover:text-amber-700 transition"
              onClick={() => setChecked(true)}
              disabled={!normalized.length}
            >
              Check answers
            </button>
          ) : (
            <>
              <span className="hidden sm:inline-block rounded-full border border-emerald-600/50 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Score: {results?.score ?? 0} / {results?.total ?? normalized.length}
              </span>
              <button
                className="btn-ghost-tw border border-[color:var(--panel-border)] hover:bg-[#EEF3FF] text-[color:var(--text)]"
                onClick={reset}
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Two-column layout: image (sticky) + questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left: reading image */}
        {imageUrl ? (
          <aside className="lg:col-span-5">
            <div className="sticky top-4">
              <figure className="relative group">
                <img
                  src={imageUrl}
                  alt="Reading text"
                  className="w-full rounded-2xl border border-[color:var(--panel-border)] shadow-lg max-h-[520px] object-contain bg-white cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01]"
                  onClick={() => setZoomOpen(true)}
                  loading="lazy"
                />
                {/* zoom button */}
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-[color:var(--panel-border)] bg-white px-2.5 py-1.5 text-xs text-[color:var(--text)] backdrop-blur hover:bg-[#EEF3FF]"
                  title="Zoom"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                    <path strokeWidth="2" d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  </svg>
                  Zoom
                </button>
                <figcaption className="text-[color:var(--muted)] text-sm mt-2 italic text-center">{title}</figcaption>
              </figure>
            </div>

            {zoomOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setZoomOpen(false)}
              >
                <img
                  src={imageUrl}
                  alt="Zoom"
                  className="max-w-[92vw] max-h-[88vh] rounded-2xl shadow-2xl cursor-zoom-out transition-all"
                />
              </div>
            )}
          </aside>
        ) : (
          <aside className="lg:col-span-5" />
        )}

        {/* Right: questions list */}
        <main className="lg:col-span-7">
          <ol className="space-y-4 list-decimal pl-5">
            {normalized.map((q, idx) => {
              const user = answers[q.id]
              const ok = checked ? isCorrect(q, user) : null
              return (
                <li
                  key={q.id || idx}
                  className={[
                    'rounded-2xl border shadow-sm transition-colors duration-300',
                    checked
                      ? ok
                        ? 'border-emerald-500/70 bg-emerald-50'
                        : 'border-rose-500/70 bg-rose-50'
                      : 'border-[color:var(--panel-border)] bg-white hover:bg-[#F7FAFF]',
                  ].join(' ')}
                >
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="text-[color:var(--text)] font-semibold leading-snug preline">
                        {q.prompt || `Question ${idx + 1}`}
                      </div>
                      <span className="shrink-0 inline-flex items-center rounded-full border border-[color:var(--panel-border)] bg-white px-2 py-0.5 text-xs text-[color:var(--muted)]">
                        {idx + 1}/{normalized.length}
                      </span>
                    </div>

                    {Array.isArray(q.options) ? (
                      <div className="grid gap-2">
                        {q.options.map((opt, oi) => (
                          <label
                            key={oi}
                            className={[
                              'flex items-center gap-2 rounded-lg border p-2 transition-colors duration-300 cursor-pointer',
                              checked
                                ? Number(user) === oi
                                  ? ok
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-rose-500 bg-rose-50'
                                  : 'border-[color:var(--panel-border)] bg-white'
                                : 'border-[color:var(--panel-border)] bg-white hover:bg-[#F7FAFF]',
                            ].join(' ')}
                          >
                            <input
                              type="radio"
                              name={q.id || `q-${idx}`}
                              className="accent-amber-400"
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
                        className={[
                          'w-full rounded-lg border p-2 text-[color:var(--text)] placeholder-slate-500 transition-colors duration-300',
                          checked
                            ? ok
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-rose-500 bg-rose-50'
                            : 'border-[color:var(--panel-border)] bg-white hover:bg-[#F7FAFF]',
                        ].join(' ')}
                        placeholder="Type your answer"
                        value={user || ''}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                      />
                    )}

                    {checked && ok === false && q.explanation ? (
                      <div className="mt-2 text-sm text-[color:var(--muted)]">
                        <span className="mr-1">💡</span>
                        <span className="text-[color:var(--muted)]">Hint:</span> {q.explanation}
                      </div>
                    ) : null}
                  </div>
                </li>
              )}
            )}
          </ol>

          {/* bottom score chip for mobile */}
          {checked && (
            <div className="sm:hidden mt-4">
              <span className="inline-block rounded-full border border-emerald-600/50 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Score: {results?.score ?? 0} / {results?.total ?? normalized.length}
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
