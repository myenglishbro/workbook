import React from 'react'

export default function SkillSelector({ skills, selected, onChange }) {
  return (
    <div className="type-selector">
      <label htmlFor="skill">Habilidad:</label>
      <select id="skill" value={selected} onChange={(e) => onChange(e.target.value)}>
        {skills.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}

