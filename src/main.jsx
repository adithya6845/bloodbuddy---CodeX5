import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './storage.js'
import './index.css'

// Create the root element
const rootElement = document.getElementById('root')

// Render the app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
