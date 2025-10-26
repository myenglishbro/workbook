import React, { useEffect, useMemo, useState } from 'react'
import Splash from './components/Splash.jsx'
import Accordion from './components/Accordion.jsx'
import ExerciseDetail from './components/ExerciseDetail.jsx'
import celpipSeed from './data/celpip.json'
import cambridgeSeed from './data/cambridge.json'
import ieltsSeed from './data/ielts.json'

// ---------- Helper ----------
function mergeById(oldArr = [], newArr = []) {
  const map = new Map(newArr.map(x => [x.id, { ...x }])) // nuevas preguntas base
  for (const it of oldArr) {
    const prev = map.get(it.id) || {}
    map.set(it.id, { ...prev, ...it }) // conserva datos antiguos, sobreescribe duplicados
  }
  return Array.from(map.values())
}

// ---------- Constantes ----------
const TYPES = [
  { id: 'celpip', label: 'CELPIP' },
  { id: 'cambridge', label: 'Cambridge' },
  { id: 'ielts', label: 'IELTS' }
]

const SKILLS = [
  { id: 'speaking', label: 'Speaking' },
  { id: 'listening', label: 'Listening' },
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' }
]

// Cada vez que cambies los JSON, solo sube la versión ↓
const STORAGE_KEY = 'speaking-app:data:v3'

const SEEDS = {
  celpip: celpipSeed,
  cambridge: cambridgeSeed,
  ielts: ieltsSeed
}

export default function App() {
  const [selected, setSelected] = useState('celpip')
  const [skill, setSkill] = useState('speaking')
  const [screen, setScreen] = useState('splash')
  const [selectedExercise, setSelectedExercise] = useState(null)

  // 🔄 Auto-merge entre localStorage y nuevos JSON
  const [datasets, setDatasets] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return SEEDS
    const parsed = JSON.parse(saved)
    return {
      celpip: mergeById(parsed.celpip, celpipSeed),
      cambridge: mergeById(parsed.cambridge, cambridgeSeed),
      ielts: mergeById(parsed.ielts, ieltsSeed)
    }
  })

  // Guardar cambios si hay actualización
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets))
  }, [datasets])

  const currentList = useMemo(() => {
    const all = datasets[selected] ?? []
    return all.filter(x => (x.skill || 'speaking') === skill)
  }, [datasets, selected, skill])

  // ---------- Render ----------
  if (screen === 'splash') {
    return (
      <div className="min-h-screen grid place-items-center px-4 py-8">
        <Splash
          types={TYPES}
          skills={SKILLS}
          defaultType={selected}
          defaultSkill={skill}
          onDone={({ type, skill: chosenSkill }) => {
            setSelected(type)
            setSkill(chosenSkill)
            setScreen('app')
            setSelectedExercise(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <header className="card sticky top-4 z-10 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="leading-tight">Speaking Trainer</h1>
          <p className="text-slate-300 text-sm">
            Práctica por examen y habilidad con grabación y descarga.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip-tw">{TYPES.find(t => t.id === selected)?.label}</span>
          <span className="chip-tw">{SKILLS.find(s => s.id === skill)?.label}</span>

          <div className="flex rounded-full border border-slate-700 overflow-hidden">
            <button
              className={`px-3 py-1 text-sm font-bold ${skill === 'speaking' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-200'}`}
              onClick={() => setSkill('speaking')}
            >
              Speaking
            </button>
            <button
              className={`px-3 py-1 text-sm font-bold ${skill === 'reading' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-200'}`}
              onClick={() => setSkill('reading')}
            >
              Reading
            </button>
            <button
              className={`px-3 py-1 text-sm font-bold ${skill === 'writing' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-200'}`}
              onClick={() => setSkill('writing')}
            >
              Writing
            </button>
          </div>

          <button className="btn-ghost-tw" onClick={() => setScreen('splash')}>
            Menú principal
          </button>
        </div>
      </header>

      <section className="text-slate-300">
        <strong className="text-slate-100">{TYPES.find(t => t.id === selected)?.label}</strong>
        {' '}· {SKILLS.find(s => s.id === skill)?.label} · {currentList.length} ejercicios
      </section>

      <div className="space-y-4">
        {!selectedExercise ? (
          <Accordion items={currentList} onSelect={(ex) => setSelectedExercise(ex)} />
        ) : (
          <ExerciseDetail exercise={selectedExercise} onBack={() => setSelectedExercise(null)} />
        )}
      </div>

      <footer className="text-slate-400 text-sm">
        Consejo: Los archivos JSON pueden contener 3 ejemplos de respuesta y verbos sugeridos por pregunta.
      </footer>
    </div>
  )
}
