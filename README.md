Speaking Trainer (React)

Resumen
- App de React para practicar speaking y writing (CELPIP, Cambridge, IELTS) con splash (Examen → Habilidad), menú principal, acordeón por Task, y vistas de detalle específicas: grabador + timer para Speaking, editor con contador de palabras + timer para Writing. Estética neutra 3D (sin colores fuertes).
- Sube archivos JSON para agregar ejercicios por tipo de examen.
- Incluye grabación por micrófono, reproducción y descarga del audio.
- Cada ejercicio muestra 3 ejemplos de respuesta y verbos sugeridos desde el JSON.

Requisitos
- Node.js 18+

Instalación
1) cd speaking-app
2) npm install
3) npm run dev

Estructura del JSON
- Puedes subir:
  a) Un array de ejercicios: [ { ... }, { ... } ]
  b) Un objeto con ejercicios: { "type": "celpip|cambridge|ielts", "exercises": [ { ... } ] }

Campos por ejercicio
- id: string único
- type: "celpip" | "cambridge" | "ielts" (opcional al subir; se infiere del seleccionado)
- skill: "speaking" | "listening" | "reading" | "writing" (opcional; por defecto la habilidad seleccionada)
- question: string (la consigna/pregunta)
- verbs: string[] (sugerencias de verbos)
- examples: string[] (3 ejemplos de respuestas)
- timeLimitSec: number (segundos, opcional)

Ejemplo mínimo (array)
[
  {
    "id": "celpip-101",
    "type": "celpip",
    "skill": "speaking",
    "question": "Describe tu vecindario.",
    "verbs": ["describe", "live", "enjoy"],
    "examples": [
      "Vivo en un barrio tranquilo y verde.",
      "Hay parques y tiendas cerca de casa.",
      "Me gusta caminar por las tardes."
    ],
    "timeLimitSec": 90
  }
]

Uso
- Inicio: splash en dos pasos (Examen → Habilidad). Luego verás el acordeón por Task.
- Speaking: graba tu respuesta (timer, reproducción y descarga .webm; transcripción opcional).
- Writing: escribe en el editor (contador de palabras, timer, descarga .txt).
- Menú superior: "Menú principal" para cambiar examen/habilidad.

Notas
- Campos por ejercicio: id, type, skill (speaking|writing), task, title, question, verbs, examples, timeLimitSec, targetWords, minWords (estos dos últimos para writing).
- Grabación usa MediaRecorder (necesita permisos de micrófono). Transcripción (Web Speech API) en navegadores compatibles.
