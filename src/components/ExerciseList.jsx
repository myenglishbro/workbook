import React from 'react'
import ExerciseCard from './ExerciseCard.jsx'

export default function ExerciseList({ items }) {
  if (!items || items.length === 0) {
    return <p className="empty">No hay ejercicios aún. Sube un JSON o cambia de examen.</p>
  }
  return (
    <div className="exercise-list">
      {items.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} />)
      )}
    </div>
  )
}

