import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Gallery from './pages/Gallery'
import Docs from './pages/Docs'
import UploadModal from './components/UploadModal'
import ImagePreviewModal from './components/ImagePreviewModal'
import { loadTheme, saveTheme, saveNFT } from './utils/storage'

export default function App() {
  const [darkMode,   setDarkMode]   = useState(() => loadTheme() === 'dark')
  const [showUpload, setShowUpload] = useState(false)
  const [previewNFT, setPreviewNFT] = useState(null)
  const [latestNFT,  setLatestNFT]  = useState(null)
  const [showDocs,   setShowDocs]   = useState(false)
  const [isMobile,   setIsMobile]   = useState(() => window.innerWidth <= 640)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')

    const update = (event) => setIsMobile(event.matches)

    setIsMobile(media.matches)

    if (media.addEventListener) {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  const toggleTheme = () => {
    const next = !darkMode
    setDarkMode(next)
    saveTheme(next ? 'dark' : 'light')
  }

  const handleMintSuccess = (nft) => {
    // Optimistic update; Pinata remains source of truth
    saveNFT(nft)
    setLatestNFT(nft)
  }

  return (
    <div
      className={darkMode ? '' : 'light'}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenUpload={() => setShowUpload(true)}
        onOpenDocs={() => setShowDocs(true)}
      />

      <main style={{ flex: 1 }}>
        <Gallery
          newNFT={latestNFT}
          onPreview={setPreviewNFT}
          onOpenUpload={() => setShowUpload(true)}
        />
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: isMobile ? '18px 16px 22px' : '18px 32px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: '0.75rem',
          color: 'var(--text3)',
          fontFamily: 'DM Mono, monospace',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? 10 : 18,
            width: '100%',
          }}
        >
          <button
            onClick={() => setShowDocs(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--text3)',
              cursor: 'pointer',
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.75rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text2)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
          >
            Docs
          </button>

          <a
            href="https://github.com/coder-ralph/nft-artworks"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text3)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text2)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
          >
            Source Code
          </a>

          <a
            href="https://docs.pinata.cloud"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text3)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text2)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
          >
            Pinata Docs
          </a>

          <a
            href="https://eips.ethereum.org/EIPS/eip-721"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text3)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text2)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
          >
            ERC-721
          </a>
        </div>

        <span style={{ display: 'block', width: '100%' }}>
          © {new Date().getFullYear()} NFT Artworks. All rights reserved.
        </span>
      </footer>

      {/* ── Modals ── */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleMintSuccess}
        />
      )}

      {previewNFT && (
        <ImagePreviewModal
          nft={previewNFT}
          onClose={() => setPreviewNFT(null)}
        />
      )}

      {/* ── Docs ── */}
      <AnimatePresence>
        {showDocs && (
          <Docs onClose={() => setShowDocs(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

