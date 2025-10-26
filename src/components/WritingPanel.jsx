import React, { useEffect, useRef, useState } from 'react'

export default function WritingPanel({ filePrefix = 'writing', limitSec = 0, targetWords = 0, minWords = 0 }) {
  const [text, setText] = useState('')
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
  const wordPct = targetWords ? Math.min(100, Math.floor((wc / targetWords) * 100)) : (minWords ? Math.min(100, Math.floor((wc / minWords) * 100)) : 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!running ? (
          <button className="btn-primary-tw" onClick={start}>Iniciar</button>
        ) : (
          <button className="btn-ghost-tw" onClick={stop}>Detener</button>
        )}
        <button className="btn-ghost-tw" onClick={reset} disabled={running}>Reiniciar</button>
        <span className={`chip-tw ${running ? 'ring-1 ring-amber-400' : ''}`}>{formatTime(elapsed)}{limitSec ? ` / ${formatTime(limitSec)}` : ''}</span>
        <div className="ml-auto flex items-center gap-2 text-slate-300">
          <span className="font-bold text-amber-300">{wc}</span>
          <span>palabras</span>
          {minWords ? <span className={`chip-tw ${meetsMin ? 'ring-1 ring-emerald-400' : ''}`}>min {minWords}</span> : null}
          {targetWords ? <span className={`chip-tw ${nearTarget ? 'ring-1 ring-amber-400' : ''}`}>objetivo {targetWords}</span> : null}
        </div>
        <button className="btn-ghost-tw" onClick={downloadTxt} disabled={!text}>Descargar</button>
      </div>
      {(limitSec || minWords || targetWords) && (
        <div className="grid gap-2">
          {limitSec ? (
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 via-fuchsia-400 to-cyan-400" style={{width: `${timePct}%`}} /></div>
          ) : null}
          {(minWords || targetWords) ? (
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-cyan-400" style={{width: `${wordPct}%`}} /></div>
          ) : null}
        </div>
      )}
      <textarea
        className="w-full min-h-[220px] resize-y p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl text-slate-100"
        placeholder="Escribe tu respuesta aquí..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={limitSec && !running && elapsed >= limitSec}
      />
    </div>
  )
}
