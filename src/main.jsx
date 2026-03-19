import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#161f30',
          color:      '#e8edf5',
          border:     '1px solid #1f2d47',
          fontFamily: 'Syne, sans-serif',
          fontSize:   '0.875rem',
          borderRadius: '10px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#161f30' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#161f30' },
        },
        duration: 4000,
      }}
    />
  </React.StrictMode>,
)
