import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export const CATEGORIES = [
  'Art',
  'PFP',
  'Music',
  'Photography',
  'Gaming',
  'Metaverse',
  'Utility',
  'Domain',
]

const ALL_CATEGORIES = ['All', ...CATEGORIES]

export default function CategoryFilter({ active, onSelect, sort, onSortChange }) {
  const [viewport, setViewport] = useState(() => getViewport())

  useEffect(() => {
    const update = () => setViewport(getViewport())

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const isMobile = viewport === 'mobile'
  const isTablet = viewport === 'tablet'
  const isDesktop = viewport === 'desktop'

  if (isMobile) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 12,
          flex: 1,
          minWidth: 0,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          {ALL_CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(cat)}
              style={{
                padding: '0 14px',
                height: 40,
                borderRadius: 11,
                border: `1px solid ${active === cat ? 'var(--accent)' : 'var(--border)'}`,
                background: active === cat ? 'var(--accent-glow)' : 'var(--surface)',
                color: active === cat ? 'var(--accent2)' : 'var(--text2)',
                fontFamily: 'Syne, sans-serif',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Sort select */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'stretch',
            width: '100%',
          }}
        >
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              height: 44,
              padding: '0 14px',
              borderRadius: 11,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text2)',
              fontFamily: 'Syne, sans-serif',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'var(--transition)',
              width: '100%',
              minWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-hi">Price: High → Low</option>
            <option value="price-lo">Price: Low → High</option>
          </select>
        </div>
      </div>
    )
  }

  if (isTablet) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 12,
          flex: '1 1 100%',
          minWidth: 0,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          {ALL_CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(cat)}
              style={{
                padding: '0 16px',
                height: 44,
                borderRadius: 12,
                border: `1px solid ${active === cat ? 'var(--accent)' : 'var(--border)'}`,
                background: active === cat ? 'var(--accent-glow)' : 'var(--surface)',
                color: active === cat ? 'var(--accent2)' : 'var(--text2)',
                fontFamily: 'Syne, sans-serif',
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Sort select */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              height: 44,
              minWidth: 220,
              maxWidth: 280,
              padding: '0 14px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text2)',
              fontFamily: 'Syne, sans-serif',
              fontSize: '0.92rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'var(--transition)',
              boxSizing: 'border-box',
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-hi">Price: High → Low</option>
            <option value="price-lo">Price: Low → High</option>
          </select>
        </div>
      </div>
    )
  }

  if (isDesktop) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flex: 1,
          minWidth: 0,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            minWidth: 0,
            flex: 1,
          }}
        >
          {ALL_CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(cat)}
              style={{
                padding: '0 16px',
                height: 50,
                borderRadius: 14,
                border: `1px solid ${active === cat ? 'var(--accent)' : 'var(--border)'}`,
                background: active === cat ? 'var(--accent-glow)' : 'var(--surface)',
                color: active === cat ? 'var(--accent2)' : 'var(--text2)',
                fontFamily: 'Syne, sans-serif',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Sort select */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              height: 50,
              minWidth: 210,
              padding: '0 16px',
              borderRadius: 14,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text2)',
              fontFamily: 'Syne, sans-serif',
              fontSize: '0.95rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'var(--transition)',
              boxSizing: 'border-box',
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-hi">Price: High → Low</option>
            <option value="price-lo">Price: Low → High</option>
          </select>
        </div>
      </div>
    )
  }

  return null
}

function getViewport() {
  const width = window.innerWidth

  if (width <= 480) return 'mobile'
  if (width <= 1024) return 'tablet'
  return 'desktop'
}
