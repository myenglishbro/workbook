import React from 'react'

export default function TypeSelector({ types, selected, onChange }) {
  return (
    <div className="type-selector">
      <label htmlFor="type">Examen:</label>
      <select id="type" value={selected} onChange={(e) => onChange(e.target.value)}>
        {types.map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
    </div>
  )
}

