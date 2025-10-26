import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './tailwind.css'
import './styles.css'

const el = document.getElementById('root')
const root = createRoot(el)
root.render(<App />)
