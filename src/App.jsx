import React, { useEffect, useMemo, useState } from 'react'
import { BookOpen, Mic, Headphones, Eye, PenLine, Home, ChevronRight, Keyboard } from 'lucide-react'
import Splash from './components/Splash.jsx'
import Accordion from './components/Accordion.jsx'
import ExerciseDetail from './components/ExerciseDetail.jsx'
import celpipSpeaking from './data/celpip.speaking.json'
import celpipReading from './data/celpip.reading.json'
import celpipListening from './data/celpip.listening.json'
import celpipWriting from './data/celpip.writing.json'
import cambridgeSpeaking from './data/cambridge.speaking.json'
import cambridgeReading from './data/cambridge.reading.json'
import cambridgeListening from './data/cambridge.listening.json'
import cambridgeWriting from './data/cambridge.writing.json'
import cambridgeType from './data/cambridge.type.json'
import ieltsSpeaking from './data/ielts.speaking.json'
import ieltsReading from './data/ielts.reading.json'
import ieltsListening from './data/ielts.listening.json'
import ieltsWriting from './data/ielts.writing.json'
import duolingoSpeaking from './data/duolingo.speaking.json'
import duolingoReading from './data/duolingo.reading.json'
import duolingoListening from './data/duolingo.listening.json'
import duolingoWriting from './data/duolingo.writing.json'
import duolingoType from './data/duolingo.type.json'
import celpipType from './data/celpip.type.json'
import ieltsType from './data/ielts.type.json'

// ---------------- Small UI helpers ----------------
const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
    {children}
  </span>
)

// ---------------- Helpers ----------------
function mergeById(oldArr = [], newArr = []) {
  const map = new Map(newArr.map((x) => [x.id, { ...x }])) // nuevas preguntas base
  for (const it of oldArr) {
    const prev = map.get(it.id) || {}
    map.set(it.id, { ...prev, ...it }) // conserva datos antiguos, sobreescribe duplicados
  }
  return Array.from(map.values())
}
function asArray(x) {
  if (Array.isArray(x)) return x
  if (x == null) return []
  return [x]
}

// ---------------- Constantes ----------------
const TYPES = [
  { id: 'celpip', label: 'CELPIP' },
  { id: 'cambridge', label: 'Cambridge' },
  { id: 'ielts', label: 'IELTS' },
  { id: 'duolingo', label: 'Duolingo' },
]

const SKILLS = [
  { id: 'speaking', label: 'Speaking', icon: Mic, short: 'Speak' },
  { id: 'listening', label: 'Listening', icon: Headphones, short: 'Listen' },
  { id: 'reading', label: 'Reading', icon: Eye, short: 'Read' },
  { id: 'writing', label: 'Writing', icon: PenLine, short: 'Write' },
  { id: 'type', label: 'Type', icon: Keyboard, short: 'Type' },
]

// Cada vez que cambies los JSON, solo sube la versión ↓
const STORAGE_KEY = 'speaking-app:data:v5'

const SEEDS = {
  celpip: [
    ...asArray(celpipSpeaking),
    ...asArray(celpipReading),
    ...asArray(celpipListening),
    ...asArray(celpipWriting),
    ...asArray(celpipType),
  ],
  cambridge: [
    ...asArray(cambridgeSpeaking),
    ...asArray(cambridgeReading),
    ...asArray(cambridgeListening),
    ...asArray(cambridgeWriting),
    ...asArray(cambridgeType),
  ],
  ielts: [
    ...asArray(ieltsSpeaking),
    ...asArray(ieltsReading),
    ...asArray(ieltsListening),
    ...asArray(ieltsWriting),
    ...asArray(ieltsType),
  ],
  duolingo: [
    ...asArray(duolingoSpeaking),
    ...asArray(duolingoReading),
    ...asArray(duolingoListening),
    ...asArray(duolingoWriting),
    ...asArray(duolingoType),
  ],
}

export default function App() {
  const [selected, setSelected] = useState('celpip')
  const [skill, setSkill] = useState('speaking')
  const [screen, setScreen] = useState('splash')
  const [selectedExercise, setSelectedExercise] = useState(null)

  // 🔁 Auto-merge entre localStorage y nuevos JSON
  const [datasets, setDatasets] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return SEEDS
    const parsed = JSON.parse(saved)
    return {
      celpip: mergeById(parsed.celpip, SEEDS.celpip),
      cambridge: mergeById(parsed.cambridge, SEEDS.cambridge),
      ielts: mergeById(parsed.ielts, SEEDS.ielts),
      duolingo: mergeById(parsed.duolingo, SEEDS.duolingo),
    }
  })

  // Guardar cambios si hay actualización
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets))
  }, [datasets])

  function changeSkill(next) {
    setSkill(next)
    setSelectedExercise(null)
  }

  const currentList = useMemo(() => {
    const all = datasets[selected] ?? []
    return all.filter((x) => (x.skill || 'speaking') === skill)
  }, [datasets, selected, skill])

  // ---------------- Render ----------------
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

  const SelectedSkillIcon = SKILLS.find((s) => s.id === skill)?.icon || BookOpen
  const selectedTypeLabel = TYPES.find((t) => t.id === selected)?.label || ''

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <header className="sticky top-4 z-10 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur px-4 py-4 shadow-md shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white leading-tight">
              <SelectedSkillIcon className="h-6 w-6 text-amber-300" />
              Speaking Trainer
              <Chip>
                <BookOpen className="h-3.5 w-3.5" /> v5
              </Chip>
            </h1>
            <p className="mt-1 text-slate-300 text-sm">
              Práctica por examen y habilidad con grabación y descarga.
            </p>
          </div>

          {/* Right controls */}
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <span className="chip-tw">{selectedTypeLabel}</span>
            <span className="chip-tw flex items-center gap-1">
              <SelectedSkillIcon className="h-4 w-4" /> {SKILLS.find((s) => s.id === skill)?.label}
            </span>

            {/* Segmented control */}
            <div className="flex rounded-full border border-slate-700 overflow-hidden">
              {SKILLS.map((s) => (
                <button
                  key={s.id}
                  className={[
                    'px-3 py-1 text-sm font-bold flex items-center gap-1.5',
                    skill === s.id ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-200 hover:bg-slate-700',
                  ].join(' ')}
                  onClick={() => changeSkill(s.id)}
                  title={s.label}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.short}</span>
                </button>
              ))}
            </div>

            <button className="btn-ghost-tw" onClick={() => setScreen('splash')}>
              <span className="inline-flex items-center gap-1">
                <Home className="h-4 w-4" /> Main menu
              </span>
            </button>
          </div>
        </div>

        {/* Breadcrumb-ish line */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span>Ruta:</span>
          <span className="inline-flex items-center gap-1">
            <span>{selectedTypeLabel}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="inline-flex items-center gap-1"><SelectedSkillIcon className="h-3.5 w-3.5" /> {SKILLS.find((s) => s.id === skill)?.label}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{currentList.length} ejercicios</span>
          </span>
        </div>
      </header>

      {/* Summary strip */}
      <section className="flex flex-wrap items-center gap-2 text-slate-300">
        <strong className="text-slate-100">{selectedTypeLabel}</strong>
        <span>·</span>
        <span className="inline-flex items-center gap-1"><SelectedSkillIcon className="h-4 w-4" /> {SKILLS.find((s) => s.id === skill)?.label}</span>
        <span>·</span>
        <Chip>
          {currentList.length} {currentList.length === 1 ? 'exercise' : 'exercises'}
        </Chip>
      </section>

      {/* Main content */}
      <div className="space-y-4">
        {!selectedExercise ? (
          <Accordion items={currentList} onSelect={(ex) => setSelectedExercise(ex)} />
        ) : (
          <ExerciseDetail exercise={selectedExercise} onBack={() => setSelectedExercise(null)} />
        )}
      </div>

      {/* Footer tip */}
      <footer className="text-slate-400 text-sm">
        Tip: Los JSON pueden incluir hasta <strong>3 respuestas ejemplo</strong> y <strong>verbos sugeridos</strong> por pregunta.
      </footer>
    </div>
  )
}

