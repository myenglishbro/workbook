import React, { useEffect, useRef, useState, useMemo } from "react";

export default function RecorderPro({
  // Left column shows nothing unless you pass content
  title = "",
  instructions = "",
  filePrefix = "recording",
  limitSec = 0,
  sttDefaultLang = typeof window !== "undefined" ? (navigator.language || "es-ES") : "es-ES",
  expectedKeywords = [],
}) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [mimeType, setMimeType] = useState(() => {
    if (typeof MediaRecorder !== "undefined") {
      if (MediaRecorder.isTypeSupported?.("audio/webm")) return "audio/webm";
      if (MediaRecorder.isTypeSupported?.("audio/mp4")) return "audio/mp4";
      if (MediaRecorder.isTypeSupported?.("audio/ogg")) return "audio/ogg";
    }
    return "audio/webm";
  });

  const [sttEnabled, setSttEnabled] = useState(true);
  const [recLang, setRecLang] = useState(sttDefaultLang);
  const [recognizer, setRecognizer] = useState(null);
  const [transcriptFinal, setTranscriptFinal] = useState("");
  const [transcriptInterim, setTranscriptInterim] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      stopTimer();
      safeStop(mediaRecorder);
      stopStream(stream);
      safeStop(recognizer);
    };
  }, [mediaRecorder, stream, recognizer]);

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }
  function startTimer() {
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((t) => {
        const next = t + 1;
        if (limitSec && next >= limitSec) stopRecording();
        return next;
      });
    }, 1000);
  }
  function stopTimer() { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; }
  function stopStream(s) { try { s?.getTracks?.().forEach((t) => t.stop()); } catch {} }
  function safeStart(o) { try { o?.start?.(); } catch {} }
  function safeStop(o) { try { o?.stop?.(); } catch {} }

  const filename = useMemo(() => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
    return `${filePrefix}-${ts}.${ext}`;
  }, [mimeType, filePrefix]);

  function buildRecognizer(lang) {
    const SR = (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
    if (!SR) return null;
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event) => {
      let interim = "";
      const finals = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finals.push(res[0].transcript);
        else interim += res[0].transcript;
      }
      if (finals.length) setTranscriptFinal((cur) => (cur ? cur + " " : "") + finals.join(" "));
      setTranscriptInterim(interim);
    };
    rec.onerror = () => {};
    rec.onend = () => { if (recording && sttEnabled) safeStart(rec); };
    return rec;
  }

  function startSTT() {
    if (!sttEnabled) return;
    const rec = buildRecognizer(recLang);
    setRecognizer(rec);
    safeStart(rec);
  }

  async function startRecording() {
    setError("");
    setAudioURL("");
    setTranscriptFinal("");
    setTranscriptInterim("");
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const mr = new MediaRecorder(userStream, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stopTimer();
        setRecording(false);
        setMediaRecorder(null);
        setRecognizer(null);
        stopStream(userStream);
        setStream(null);
      };
      mr.start();
      setMediaRecorder(mr);
      setStream(userStream);
      setRecording(true);
      startTimer();
      startSTT();
    } catch (e) {
      console.error(e);
      setError("Could not access the microphone. Check browser permissions.");
      setRecording(false);
      stopTimer();
      stopStream(stream);
    }
  }

  function stopRecording() {
    safeStop(mediaRecorder);
    safeStop(recognizer);
  }

  function copyTranscript() {
    const text = `${transcriptFinal} ${transcriptInterim}`.trim();
    if (!text) return;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
    else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
    }
  }

  function downloadTranscript() {
    const text = `${transcriptFinal} ${transcriptInterim}`.trim();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `${filePrefix}-transcripcion-${ts}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const showLeft = Boolean(title?.trim() || instructions?.trim());
  const progressPct = limitSec ? Math.min(100, Math.round((elapsed / limitSec) * 100)) : 0;

  // Heatmap helpers
  const norm = (s = "") => s.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
  const spokenText = `${transcriptFinal} ${transcriptInterim}`.trim();
  const spokenTokens = useMemo(() => new Set(norm(spokenText).split(/[^a-zA-Záéíóúñü]+/).filter(Boolean)), [spokenText]);
  const normalizedTargets = useMemo(() => (Array.isArray(expectedKeywords) ? expectedKeywords : []).map(norm).filter(Boolean), [expectedKeywords]);
  const foundMap = useMemo(() => {
    const m = new Map();
    for (const kw of normalizedTargets) m.set(kw, spokenTokens.has(kw));
    return m;
  }, [normalizedTargets, spokenTokens]);

  // Circle timer component
  const CircleTimer = ({ size = 44, stroke = 5, pct = 0, warning = false }) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.min(1, Math.max(0, pct / 100)));
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={size/2} cy={size/2} r={r} stroke="#0f172a" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke={warning ? '#f59e0b' : '#22c55e'}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.2s linear' }}
        />
      </svg>
    );
  };

  return (
    <div className={`w-full grid ${showLeft ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4 md:gap-6`}>
      {/* Izquierda: SOLO si envÃ­as contenido */}
      {showLeft && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 shadow">
          {/* Sin textos de relleno */}
          {title?.trim() && (
            <header className="mb-3">
              <h2 className="text-slate-100 text-lg md:text-xl font-semibold">{title}</h2>
            </header>
          )}
          {instructions?.trim() && (
            <div className="prose prose-invert max-w-none text-slate-200">
              <pre className="whitespace-pre-wrap break-words bg-slate-900/60 rounded-xl p-4 border border-slate-800">
{instructions}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* Derecha: panel de grabaciÃ³n */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 shadow flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {!recording ? (
            <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow w-full sm:w-auto" onClick={startRecording}>
              â— Record
            </button>
          ) : (
            <button className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow w-full sm:w-auto" onClick={stopRecording}>
              â–  Stop
            </button>
          )}

          <span
            className={`px-3 py-1 rounded-full text-sm font-mono ${recording ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400" : "bg-slate-800 text-slate-300"}`}
            title={limitSec ? `${formatTime(elapsed)} / ${formatTime(limitSec)}` : formatTime(elapsed)}
          >
            {formatTime(elapsed)}{limitSec ? ` / ${formatTime(limitSec)}` : ""}
          </span>

          {limitSec > 0 && (
            <CircleTimer size={44} stroke={5} pct={progressPct} warning={recording && progressPct >= 75} />
          )}

          {limitSec > 0 && (
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-2 bg-amber-400 transition-[width] duration-200" style={{ width: `${progressPct}%` }} />
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <label className="text-slate-300 text-sm">STT language</label>
            <select
              className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg px-2 py-1"
              value={recLang}
              onChange={(e) => setRecLang(e.target.value)}
              disabled={recording}
              title="Speech recognition language"
            >
              <option value="es-ES">es-ES</option>
              <option value="en-US">en-US</option>
              <option value="en-CA">en-CA</option>
              <option value="pt-BR">pt-BR</option>
              <option value="fr-FR">fr-FR</option>
              <option value={sttDefaultLang}>{sttDefaultLang}</option>
            </select>

            <label className="inline-flex items-center gap-2 text-slate-300 text-sm">
              <input type="checkbox" className="accent-emerald-500" checked={sttEnabled} onChange={(e) => setSttEnabled(e.target.checked)} disabled={recording} />
              STT enabled
            </label>
          </div>
        </div>

        {error && <p className="text-rose-400 text-sm">{error}</p>}

        {audioURL && (
          <div className="flex items-center gap-3">
            <audio controls src={audioURL} className="w-full" />
            <a className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm" href={audioURL} download={filename}>
              Descargar audio
            </a>
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="text-slate-400 text-xs mb-2">Live transcription</div>
          <div className="space-y-2">
            <div className="text-slate-100 text-sm leading-relaxed">
              {transcriptFinal}
              {transcriptInterim && <span className="text-slate-300/80 italic">{" "}{transcriptInterim}</span>}
            </div>

            {normalizedTargets.length ? (
              <div className="pt-2">
                <div className="text-xs text-slate-400 mb-1">Pronunciation heatmap</div>
                <div className="flex flex-wrap gap-1.5">
                  {normalizedTargets.map((kw) => {
                    const ok = foundMap.get(kw);
                    return (
                      <span key={kw} className={[
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs',
                        ok ? 'border-emerald-600/50 bg-emerald-900/30 text-emerald-300' : 'border-rose-600/50 bg-rose-900/20 text-rose-300'
                      ].join(' ')}>
                        {kw}
                        {ok ? '✓' : '•'}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <button className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm disabled:opacity-50" onClick={copyTranscript} disabled={!transcriptFinal && !transcriptInterim}>
                Copy text
              </button>
              <button className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm disabled:opacity-50" onClick={downloadTranscript} disabled={!transcriptFinal && !transcriptInterim}>
                Download TXT
              </button>
              <button className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm" onClick={() => { setTranscriptFinal(""); setTranscriptInterim(""); }} title="Clear transcripciÃ³n">
                Clear
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">Note: Speech recognition depends on browser support (Chrome recommended).</p>
      </section>
    </div>
  );
}

