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

// -------- Small UI helper --------
const Chip = ({ children }) => <span className="c-chip">{children}</span>

// -------- Helpers --------
function mergeById(oldArr = [], newArr = []) {
  const map = new Map(newArr.map((x) => [x.id, { ...x }]))
  for (const it of oldArr) {
    const prev = map.get(it.id) || {}
    map.set(it.id, { ...prev, ...it })
  }
  return Array.from(map.values())
}
function asArray(x) {
  if (Array.isArray(x)) return x
  if (x == null) return []
  return [x]
}

// -------- Constantes --------
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

  // 🌈 Activa tema CELTESPIP (light)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'celtespip-light')
  }, [])

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

  // -------- Render --------
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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="c-card px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold tracking-tight">
                <SelectedSkillIcon className="h-6 w-6 text-[color:var(--primary)]" />
                Speaking Trainer
                <Chip><BookOpen className="h-3.5 w-3.5" /> v5</Chip>
              </h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Práctica por examen y habilidad con grabación y descarga.
              </p>
            </div>

            {/* Right controls */}
            <div className="flex flex-wrap items-center gap-3 justify-end">
              <span className="c-chip" style={{ background: 'rgba(62,100,255,.12)', color: '#1E3A8A' }}>
                {selectedTypeLabel}
              </span>
              <span className="c-chip">
                <SelectedSkillIcon className="h-4 w-4 text-[color:var(--primary)]" />
                {SKILLS.find((s) => s.id === skill)?.label}
              </span>

              {/* Segmented control (light) */}
              <div className="flex rounded-full border border-[color:var(--panel-border)] bg-white overflow-hidden">
                {SKILLS.map((s) => (
                  <button
                    key={s.id}
                    className={[
                      'px-3 py-1 text-sm font-semibold flex items-center gap-1.5 transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40',
                      skill === s.id
                        ? 'bg-[color:var(--primary)] text-white'
                        : 'text-[color:var(--muted)] hover:bg-[#EEF3FF]'
                    ].join(' ')}
                    onClick={() => changeSkill(s.id)}
                    title={
                      s.id === 'speaking' ? '🎙️ Practice real IELTS/CELPIP-style questions with recording and feedback.' :
                      s.id === 'listening' ? '🎧 Watch/Listen and answer comprehension questions.' :
                      s.id === 'reading' ? '📖 Read and choose/type the correct answers.' :
                      s.id === 'writing' ? '✍️ Timed writing tasks with word targets.' :
                      s.id === 'type' ? '⌨️ Type the missing word in context.' : s.label
                    }
                  >
                    <s.icon className={`h-3.5 w-3.5 ${skill === s.id ? 'text-white' : 'text-[color:var(--primary)]'}`} />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.short}</span>
                  </button>
                ))}
              </div>

              <button
                className="inline-flex items-center gap-1 rounded-full border border-[color:var(--panel-border)] bg-white px-3 py-1 text-[color:var(--text)] hover:bg-[#EEF3FF] transition"
                onClick={() => setScreen('splash')}
              >
                <Home className="h-4 w-4 text-[color:var(--primary)]" /> Main menu
              </button>
            </div>
          </div>

          {/* Breadcrumb-ish line */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
            <span>Ruta:</span>
            <span className="inline-flex items-center gap-1">
              <span>{selectedTypeLabel}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="inline-flex items-center gap-1">
                <SelectedSkillIcon className="h-3.5 w-3.5 text-[color:var(--primary)]" />
                {SKILLS.find((s) => s.id === skill)?.label}
              </span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{currentList.length} ejercicios</span>
            </span>
          </div>
        </header>

        {/* Summary strip */}
        <section className="flex flex-wrap items-center gap-3 text-[color:var(--muted)]">
          <strong className="text-[color:var(--text)]">{selectedTypeLabel}</strong>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <SelectedSkillIcon className="h-4 w-4 text-[color:var(--primary)]" />
            {SKILLS.find((s) => s.id === skill)?.label}
          </span>
          <span>·</span>
          <span className="c-chip" style={{ background: 'rgba(62,100,255,.12)', color: '#1E3A8A' }}>
            {currentList.length} {currentList.length === 1 ? 'exercise' : 'exercises'}
          </span>
        </section>

        {/* Main content */}
        <div className="space-y-4">
          {!selectedExercise ? (
            <div className="c-card p-3">
              <Accordion items={currentList} onSelect={(ex) => setSelectedExercise(ex)} />
            </div>
          ) : (
            <div className="c-card">
              <ExerciseDetail exercise={selectedExercise} onBack={() => setSelectedExercise(null)} />
            </div>
          )}
        </div>

        {/* Footer tip */}
        <footer className="text-sm text[--muted] text-[color:var(--muted)]">
          Tip: Los JSON pueden incluir hasta <strong>3 respuestas ejemplo</strong> y <strong>verbos sugeridos</strong> por pregunta.
        </footer>
      </div>
    </div>
  )
}
