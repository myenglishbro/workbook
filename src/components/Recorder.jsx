import React, { useEffect, useRef, useState, useMemo } from "react";

export default function RecorderPro({
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

  // Keep refs to latest objects so unmount cleanup can stop them
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recognizerRef = useRef(null);
  useEffect(() => { mediaRecorderRef.current = mediaRecorder; }, [mediaRecorder]);
  useEffect(() => { streamRef.current = stream; }, [stream]);
  useEffect(() => { recognizerRef.current = recognizer; }, [recognizer]);

  // Cleanup only on unmount (avoid killing timer on state changes)
  useEffect(() => {
    return () => {
      stopTimer();
      safeStop(mediaRecorderRef.current);
      stopStream(streamRef.current);
      safeStop(recognizerRef.current);
    };
  }, []);

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
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
      setError("Mic permission denied or unavailable. Check browser settings.");
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
  const remaining = limitSec ? Math.max(0, limitSec - elapsed) : 0;

  // Heatmap helpers (normaliza con/ sin tildes)
  const norm = (s = "") => s.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
  const spokenText = `${transcriptFinal} ${transcriptInterim}`.trim();
  const spokenTokens = useMemo(() => new Set(norm(spokenText).split(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]+/).filter(Boolean)), [spokenText]);
  const normalizedTargets = useMemo(
    () => (Array.isArray(expectedKeywords) ? expectedKeywords : []).map(norm).filter(Boolean),
    [expectedKeywords]
  );
  const foundMap = useMemo(() => {
    const m = new Map();
    for (const kw of normalizedTargets) m.set(kw, spokenTokens.has(kw));
    return m;
  }, [normalizedTargets, spokenTokens]);

  // Circle timer (usa tokens del tema)
  const CircleTimer = ({ size = 44, stroke = 5, pct = 0, warning = false }) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.min(1, Math.max(0, pct / 100)));
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--panel-border)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={warning ? 'var(--primary)' : '#1B8754'}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .2s linear' }}
        />
      </svg>
    );
  };

  return (
    <div className={`w-full grid ${showLeft ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4 md:gap-6`}>
      {/* Left (opcional) */}
      {showLeft && (
        <section className="rounded-2xl border border-[color:var(--panel-border)] bg-white p-5 shadow">
          {title?.trim() && (
            <header className="mb-3">
              <h2 className="text-[color:var(--text)] text-xl font-extrabold tracking-tight">{title}</h2>
            </header>
          )}
          {instructions?.trim() && (
            <div className="max-w-none text-[color:var(--text)]">
              <pre className="whitespace-pre-wrap break-words bg-white rounded-xl p-4 border border-[color:var(--panel-border)] text-[.95rem] leading-6">
{instructions}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* Right: recorder */}
      <section className="rounded-2xl border border-[color:var(--panel-border)] bg-white p-5 shadow flex flex-col gap-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {!recording ? (
            <button
              className="btn-solid-emerald w-full sm:w-auto"
              onClick={startRecording}
            >
              ● Record
            </button>
          ) : (
            <button
              className="btn-solid-rose w-full sm:w-auto"
              onClick={stopRecording}
            >
              ■ Stop
            </button>
          )}

          <span
            className={[
              "time-chip font-mono",
              recording ? "time-chip--live" : ""
            ].join(" ")}
            title={limitSec
              ? `${formatTime(remaining)} restantes (usados: ${formatTime(elapsed)} / total: ${formatTime(limitSec)})`
              : formatTime(elapsed)}
          >
            {limitSec ? formatTime(remaining) : formatTime(elapsed)}{limitSec ? ` / ${formatTime(limitSec)}` : ""}
          </span>

          {limitSec > 0 && (
            <CircleTimer size={44} stroke={5} pct={progressPct} warning={recording && progressPct >= 75} />
          )}

          {limitSec > 0 && (
            <div className="flex-1 h-2 rounded-full bg-[#E9EEF7] overflow-hidden min-w-[140px]">
              <div className="h-2 progress-grad" style={{ width: `${progressPct}%` }} />
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <label className="text-[color:var(--muted)] text-sm">STT language</label>
            <select
              className="select-soft"
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

            <label className="inline-flex items-center gap-2 text-[color:var(--muted)] text-sm">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={sttEnabled}
                onChange={(e) => setSttEnabled(e.target.checked)}
                disabled={recording}
              />
              STT enabled
            </label>
          </div>
        </div>

        {error && (
          <p className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#FFE8EA] text-[#9B1C31] border border-[#F7C2CA]">
            ⚠️ {error}
          </p>
        )}

        {audioURL && (
          <div className="flex items-center gap-3">
            <audio controls src={audioURL} className="w-full" />
            <a className="btn-soft" href={audioURL} download={filename}>
              ⬇️ Descargar audio
            </a>
          </div>
        )}

        {recording && (
          <div className="flex items-center gap-2 text-[color:var(--muted)]">
            <span className="text-xs">Live</span>
            <div className="eq-bars" aria-hidden>
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </div>
          </div>
        )}

        {/* Transcripción */}
        <div className="rounded-xl border border-[color:var(--panel-border)] bg-white p-4">
          <div className="text-[color:var(--muted)] text-xs mb-2 font-semibold">Live transcription</div>

          <div className="space-y-3">
            <div className="text-[color:var(--text)] text-sm leading-relaxed">
              {transcriptFinal}
              {transcriptInterim && (
                <span className="text-[color:var(--muted)]/85 italic">{" "}{transcriptInterim}</span>
              )}
            </div>

            {normalizedTargets.length ? (
              <div className="pt-1">
                <div className="text-xs text-[color:var(--muted)] mb-1 font-semibold">Pronunciation heatmap</div>
                <div className="flex flex-wrap gap-1.5">
                  {normalizedTargets.map((kw) => {
                    const ok = foundMap.get(kw);
                    return (
                      <span
                        key={kw}
                        className={[
                          'kw-chip',
                          ok ? 'kw-ok' : 'kw-bad'
                        ].join(' ')}
                        title={ok ? 'Detected ✓' : 'Not detected'}
                      >
                        {kw} {ok ? '✓' : '✗'}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <button className="btn-soft" onClick={copyTranscript} disabled={!transcriptFinal && !transcriptInterim}>
                📋 Copy text
              </button>
              <button className="btn-soft" onClick={downloadTranscript} disabled={!transcriptFinal && !transcriptInterim}>
                ⤓ Download TXT
              </button>
              <button
                className="btn-soft"
                onClick={() => { setTranscriptFinal(""); setTranscriptInterim(""); }}
                title="Clear transcription"
              >
                🗑 Clear
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[color:var(--muted)]">
          Note: Speech recognition depends on browser support (Chrome recommended).
        </p>
      </section>
    </div>
  );
}
