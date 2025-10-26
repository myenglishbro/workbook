import React, { useRef, useState } from 'react'

const parseJsonFile = async (file) => {
  const text = await file.text()
  return JSON.parse(text)
}

function normalizePayload(payload, selectedType, selectedSkill) {
  // Accepts: Array<Exercise> or { type, exercises } or { exercises }
  if (Array.isArray(payload)) {
    return payload.map((x) => ({ ...x, type: x.type || selectedType, skill: x.skill || selectedSkill }))
  }
  if (payload && Array.isArray(payload.exercises)) {
    const type = payload.type || selectedType
    return payload.exercises.map((x) => ({ ...x, type: x.type || type, skill: x.skill || selectedSkill }))
  }
  return []
}

export default function UploadPanel({ onMerge, selectedType, selectedSkill }) {
  const [status, setStatus] = useState('')
  const inputRef = useRef(null)

  async function handleFiles(files) {
    const file = files?.[0]
    if (!file) return
    try {
      const json = await parseJsonFile(file)
      const items = normalizePayload(json, selectedType, selectedSkill)
      if (!items.length) {
        setStatus('Formato de JSON no reconocido')
        return
      }
      onMerge(items)
      setStatus(`Cargado: ${items.length} ejercicios añadidos`)
      if (inputRef.current) inputRef.current.value = ''
    } catch (e) {
      console.error(e)
      setStatus('Error leyendo JSON')
    }
  }

  return (
    <div className="upload-panel">
      <label className="file-label">
        <span>Subir JSON para "{selectedType}" · "{selectedSkill}"</span>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      <p className="hint">
        Estructura: ver ejemplos en src/data/*.json. Puedes incluir 3 respuestas y verbos por pregunta.
      </p>
      {status && <p className="status">{status}</p>}
    </div>
  )
}
