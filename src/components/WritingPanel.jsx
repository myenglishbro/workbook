import React, { useEffect, useRef, useState } from 'react'

export default function WritingPanel({
  filePrefix = 'writing',
  limitSec = 0,
  targetWords = 0,
  minWords = 0
}) {
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  function start() {
    if (running) return
    setRunning(true)
    timerRef.current = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1
        if (limitSec && next >= limitSec) {
          stop()
        }
        return next
      })
    }, 1000)
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setRunning(false)
  }

  function reset() {
    stop()
    setElapsed(0)
    setText('')
  }

  function wordsCount() {
    if (!text.trim()) return 0
    return text.trim().split(/\s+/).length
  }

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  function downloadTxt() {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filePrefix}-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const wc = wordsCount()
  const meetsMin = minWords ? wc >= minWords : true
  const nearTarget = targetWords ? Math.abs(wc - targetWords) <= 20 : false
  const timePct = limitSec ? Math.min(100, Math.floor((elapsed / limitSec) * 100)) : 0
  const wordPct = targetWords
    ? Math.min(100, Math.floor((wc / targetWords) * 100))
    : (minWords ? Math.min(100, Math.floor((wc / minWords) * 100)) : 0)

  function CircleTimer({ size = 40, stroke = 5, pct = 0 }) {
    const r = (size - stroke) / 2
    const c = 2 * Math.PI * r
    const off = c * (1 - Math.min(1, Math.max(0, pct / 100)))
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {/* track */}
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--panel-border)" strokeWidth={stroke} fill="none" />
        {/* progress */}
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke="var(--primary)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .2s linear' }}
        />
      </svg>
    )
  }

  return (
    <div className="c-card p-4 sm:p-5 space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {!running ? (
          <button className="btn-primary-tw w-full sm:w-auto" onClick={start}>Start</button>
        ) : (
          <button className="btn-ghost-tw w-full sm:w-auto" onClick={stop}>Stop</button>
        )}
        <button className="btn-ghost-tw w-full sm:w-auto" onClick={reset} disabled={running}>ReStart</button>

        <span
          className={[
            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold',
            'bg-[#EEF3FF] text-[#1E3A8A] border border-[color:var(--panel-border)]',
            running ? 'ring-1 ring-[color:var(--primary)]/30' : ''
          ].join(' ')}
        >
          {formatTime(elapsed)}{limitSec ? ` / ${formatTime(limitSec)}` : ''}
        </span>

        {limitSec ? <CircleTimer size={40} stroke={5} pct={timePct} /> : null}

        <div className="ml-auto flex items-center gap-2 text-[color:var(--muted)]">
          <span className="font-extrabold text-[color:var(--text)]">{wc}</span>
          <span>words</span>
          {minWords ? (
            <span className={[
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border',
              'bg-[#EAF7EE] text-[#1B8754] border-[color:var(--panel-border)]',
              meetsMin ? 'ring-1 ring-emerald-400/30' : ''
            ].join(' ')}>
              min {minWords}
            </span>
          ) : null}
          {targetWords ? (
            <span className={[
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border',
              'bg-[#FFF2D9] text-[#C66B00] border-[color:var(--panel-border)]',
              nearTarget ? 'ring-1 ring-amber-400/30' : ''
            ].join(' ')}>
              target {targetWords}
            </span>
          ) : null}
        </div>

        <button className="btn-ghost-tw" onClick={downloadTxt} disabled={!text}>Download</button>
      </div>

      {/* Progress bars (opcionales) */}
      {(limitSec || minWords || targetWords) && (
        <div className="grid gap-2">
          {limitSec ? (
            <div className="h-2 rounded-full bg-[#E9EEF7] overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${timePct}%`,
                  background: 'linear-gradient(90deg, var(--primary), #6B4DE6, #0F90B8)'
                }}
              />
            </div>
          ) : null}
          {(minWords || targetWords) ? (
            <div className="h-2 rounded-full bg-[#E9EEF7] overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${wordPct}%`,
                  background: 'linear-gradient(90deg, #1B8754, #C66B00, #0F90B8)'
                }}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Editor */}
      <textarea
        className={[
          'w-full min-h-[220px] resize-y p-4 rounded-2xl',
          'border border-[color:var(--panel-border)] bg-white text-[color:var(--text)]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40'
        ].join(' ')}
        placeholder="Write your answer here..."
        value={text}
        onChange={(e) => { setText(e.target.value); setTyping(true); setTimeout(() => setTyping(false), 900) }}
        disabled={limitSec && !running && elapsed >= limitSec}
      />

      {typing && (
        <div className="text-[color:var(--muted)] text-xs inline-flex items-center gap-2">
          <span>Typing</span>
          <span className="typing-dots" aria-hidden><span></span><span></span><span></span></span>
        </div>
      )}
    </div>
  )
}
