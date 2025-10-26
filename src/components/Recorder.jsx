import React, { useEffect, useRef, useState, useMemo } from "react";

export default function RecorderPro({
  // Por defecto NO mostramos nada en la izquierda a menos que envíes contenido
  title = "",
  instructions = "",
  filePrefix = "grabacion",
  limitSec = 0,
  sttDefaultLang = typeof window !== "undefined" ? (navigator.language || "es-ES") : "es-ES",
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
      setError("No se pudo acceder al micrófono. Revisa permisos del navegador.");
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

  return (
    <div className={`w-full grid ${showLeft ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4 md:gap-6`}>
      {/* Izquierda: SOLO si envías contenido */}
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

      {/* Derecha: panel de grabación */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-6 shadow flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {!recording ? (
            <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow" onClick={startRecording}>
              ● Grabar
            </button>
          ) : (
            <button className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow" onClick={stopRecording}>
              ■ Detener
            </button>
          )}

          <span
            className={`px-3 py-1 rounded-full text-sm font-mono ${recording ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400" : "bg-slate-800 text-slate-300"}`}
            title={limitSec ? `${formatTime(elapsed)} / ${formatTime(limitSec)}` : formatTime(elapsed)}
          >
            {formatTime(elapsed)}{limitSec ? ` / ${formatTime(limitSec)}` : ""}
          </span>

          {limitSec > 0 && (
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-2 bg-amber-400 transition-[width] duration-200" style={{ width: `${progressPct}%` }} />
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <label className="text-slate-300 text-sm">Idioma STT</label>
            <select
              className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg px-2 py-1"
              value={recLang}
              onChange={(e) => setRecLang(e.target.value)}
              disabled={recording}
              title="Idioma del reconocimiento de voz"
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
              STT activo
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
          <div className="text-slate-400 text-xs mb-2">Transcripción (en vivo)</div>
          <div className="space-y-2">
            <div className="text-slate-100 text-sm leading-relaxed">
              {transcriptFinal}
              {transcriptInterim && <span className="text-slate-300/80 italic">{" "}{transcriptInterim}</span>}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm disabled:opacity-50" onClick={copyTranscript} disabled={!transcriptFinal && !transcriptInterim}>
                Copiar texto
              </button>
              <button className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm disabled:opacity-50" onClick={downloadTranscript} disabled={!transcriptFinal && !transcriptInterim}>
                Guardar TXT
              </button>
              <button className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm" onClick={() => { setTranscriptFinal(""); setTranscriptInterim(""); }} title="Limpiar transcripción">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">Nota: El reconocimiento de voz depende del soporte del navegador (Chrome recomendado).</p>
      </section>
    </div>
  );
}
