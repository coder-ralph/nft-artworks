import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Navbar({ darkMode, onToggleTheme, onOpenUpload, onOpenDocs }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 480)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 480px)')

    const update = (event) => setIsMobile(event.matches)

    setIsMobile(media.matches)

    if (media.addEventListener) {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 10 : 16,
        padding: isMobile ? '0 12px' : '0 32px',
        minHeight: isMobile ? 74 : 64,
        background: darkMode ? 'rgba(8,11,18,0.88)' : 'rgba(240,244,252,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 10,
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            width: isMobile ? 28 : 32,
            height: isMobile ? 28 : 32,
            borderRadius: isMobile ? 9 : 8,
            background: 'linear-gradient(135deg, #3d7eff, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 14 : 16,
            boxShadow: '0 0 16px var(--accent-glow)',
            flexShrink: 0,
          }}
        >
          ⬡
        </div>

        <span
          style={{
            fontWeight: 800,
            fontSize: isMobile ? '0.9rem' : '1.1rem',
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            lineHeight: isMobile ? 1.05 : 1,
            display: '-webkit-box',
            WebkitLineClamp: isMobile ? 2 : 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: isMobile ? 130 : 'none',
          }}
        >
          NFT Artworks
        </span>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 10,
          flexShrink: 0,
        }}
      >
        {/* Docs link */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenDocs}
          title="Documentation"
          style={{
            padding: isMobile ? '0 12px' : '0 14px',
            height: isMobile ? 34 : 36,
            borderRadius: 9,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text2)',
            cursor: 'pointer',
            fontSize: isMobile ? '0.78rem' : '0.82rem',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'var(--transition)',
            flexShrink: 0,
          }}
        >
          Docs
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleTheme}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: isMobile ? 34 : 36,
            height: isMobile ? 34 : 36,
            borderRadius: 9,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text2)',
            cursor: 'pointer',
            fontSize: isMobile ? 15 : 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            flexShrink: 0,
          }}
        >
          {darkMode ? '☀' : '☽'}
        </motion.button>

        {/* Mint CTA */}
        <motion.button
          whileHover={{ scale: 1.03, filter: 'brightness(1.12)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenUpload}
          style={{
            padding: isMobile ? '0 14px' : '0 20px',
            height: isMobile ? 42 : 36,
            borderRadius: 12,
            background: 'var(--accent)',
            border: 'none',
            color: '#fff',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 6 : 7,
            boxShadow: '0 0 20px var(--accent-glow)',
            letterSpacing: '0.01em',
            lineHeight: 1.05,
            flexShrink: 0,
            minWidth: isMobile ? 96 : 'auto',
          }}
        >
          <span style={{ fontSize: isMobile ? '0.95rem' : '1rem', lineHeight: 1 }}>+</span>
          <span
            style={{
              display: 'inline-block',
              textAlign: 'center',
              whiteSpace: isMobile ? 'normal' : 'nowrap',
            }}
          >
            Mint NFT
          </span>
        </motion.button>
      </div>
    </motion.nav>
  )
}
