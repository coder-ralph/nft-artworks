import { useEffect, useState } from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Search NFTs…' }) {
  const [viewport, setViewport] = useState(() => getViewport())

  useEffect(() => {
    const update = () => setViewport(getViewport())

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const isMobile = viewport === 'mobile'
  const isTablet = viewport === 'tablet'

  return (
    <div
      style={{
        position: 'relative',
        flex: isMobile || isTablet ? '1 1 100%' : '0 0 380px',
        minWidth: 0,
        width: isMobile || isTablet ? '100%' : 380,
        maxWidth: isMobile || isTablet ? '100%' : 380,
        alignSelf: isMobile || isTablet ? 'stretch' : 'center',
      }}
    >
      {/* Search icon */}
      <svg
        style={{
          position: 'absolute',
          left: isMobile ? 14 : 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text3)',
          pointerEvents: 'none',
          zIndex: 2,
          display: 'block',
        }}
        width={isMobile ? '16' : '17'}
        height={isMobile ? '16' : '17'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: isMobile ? 44 : 50,
          borderRadius: isMobile ? 12 : 14,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
          padding: isMobile ? '0 14px 0 42px' : '0 16px 0 48px',
          fontFamily: 'Syne, sans-serif',
          fontSize: isMobile ? '0.95rem' : '0.95rem',
          outline: 'none',
          transition: 'var(--transition)',
          boxSizing: 'border-box',
          display: 'block',
          lineHeight: 1,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

function getViewport() {
  const width = window.innerWidth

  if (width <= 480) return 'mobile'
  if (width <= 1024) return 'tablet'
  return 'desktop'
}
