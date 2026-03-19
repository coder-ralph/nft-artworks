import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import ImageCard from '../components/ImageCard'
import Loader from '../components/Loader'
import { loadNFTs } from '../utils/storage'

export default function Gallery({ newNFT, onPreview, onOpenUpload }) {
  const [nfts,            setNfts]            = useState([])
  const [loading,         setLoading]         = useState(true)
  const [search,          setSearch]          = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory,  setActiveCategory]  = useState('All')
  const [sort,            setSort]            = useState('newest')
  const [isMobile,        setIsMobile]        = useState(() => window.innerWidth <= 480)
  const debounceRef = useRef(null)

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

  // Fetch from shared API on mount; fall back to localStorage
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/nfts')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) setNfts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.warn('[Gallery] /api/nfts unavailable, using localStorage:', err.message)
        if (!cancelled) setNfts(loadNFTs())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Prepend newly minted NFT immediately (optimistic — don't wait for re-fetch)
  useEffect(() => {
    if (!newNFT) return
    setNfts((prev) => {
      if (prev.find((n) => n.id === newNFT.id)) return prev
      return [newNFT, ...prev]
    })
  }, [newNFT])

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  // Derived: filtered + sorted
  const filtered = nfts
    .filter((n) => {
      const q = debouncedSearch.toLowerCase()
      if (q && !n.metadata.name.toLowerCase().includes(q) && !n.metadata.category.toLowerCase().includes(q))
        return false
      if (activeCategory !== 'All' && n.metadata.category !== activeCategory)
        return false
      return true
    })
    .sort((a, b) => {
      switch (sort) {
        case 'newest':   return new Date(b.metadata.created_at) - new Date(a.metadata.created_at)
        case 'oldest':   return new Date(a.metadata.created_at) - new Date(b.metadata.created_at)
        case 'price-hi': return parseFloat(b.metadata.price.value) - parseFloat(a.metadata.price.value)
        case 'price-lo': return parseFloat(a.metadata.price.value) - parseFloat(b.metadata.price.value)
        default:         return 0
      }
    })

  const catCount = [...new Set(nfts.map((n) => n.metadata.category))].length
  const sectionPad = isMobile ? 16 : 32

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* ── Hero ── */}
      <section
        style={{
          padding: isMobile ? '36px 16px 28px' : '60px 32px 44px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: isMobile ? 280 : 420,
            height: isMobile ? 280 : 420,
            borderRadius: '50%',
            background: 'rgba(61,126,255,0.1)',
            filter: 'blur(80px)',
            top: isMobile ? -80 : -120,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: isMobile ? 220 : 300,
            height: isMobile ? 220 : 300,
            borderRadius: '50%',
            background: 'rgba(139,92,246,0.07)',
            filter: 'blur(80px)',
            top: 40,
            right: isMobile ? '-10%' : '8%',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: isMobile ? '6px 12px' : '5px 14px',
            borderRadius: 100,
            border: '1px solid var(--border2)',
            background: 'var(--surface)',
            fontSize: isMobile ? '0.68rem' : '0.72rem',
            fontFamily: 'DM Mono, monospace',
            color: 'var(--text2)',
            marginBottom: isMobile ? 16 : 18,
            letterSpacing: '0.05em',
            maxWidth: '100%',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
            lineHeight: 1.4,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--success)',
              animation: 'pulse-dot 2s infinite',
              flexShrink: 0,
            }}
          />
          IPFS-POWERED · ERC-721 COMPATIBLE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            fontSize: isMobile ? 'clamp(2rem, 12vw, 3rem)' : 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: isMobile ? 0.98 : 1.05,
            background: 'linear-gradient(135deg, var(--text) 0%, var(--text2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: isMobile ? 18 : 14,
            maxWidth: isMobile ? 320 : 'none',
            marginInline: 'auto',
            textWrap: 'balance',
          }}
        >
          Discover &amp; Mint
          <br />
          Digital Artworks
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            color: 'var(--text2)',
            fontSize: isMobile ? '0.96rem' : '1rem',
            maxWidth: isMobile ? 310 : 460,
            margin: `0 auto ${isMobile ? 24 : 28}px`,
            lineHeight: 1.75,
          }}
        >
          Upload your creations to IPFS, assign ETH pricing, and explore the decentralized gallery.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'auto 1px auto 1px auto',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: isMobile ? 0 : 24,
            maxWidth: isMobile ? 360 : 'fit-content',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <Stat val={nfts.length} label="Total NFTs" />
          <StatDivider mobile={isMobile} />
          <Stat val={nfts.length} label="Minted by You" />
          <StatDivider mobile={isMobile} />
          <Stat val={catCount} label="Categories" />
        </motion.div>
      </section>

      {/* ── Toolbar ── */}
      <div
        style={{
          padding: `0 ${sectionPad}px 22px`,
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter
          active={activeCategory}
          onSelect={setActiveCategory}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {/* ── Grid ── */}
      <section style={{ padding: `0 ${sectionPad}px 80px` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
            gap: 12,
          }}
        >
          <span style={{ fontSize: isMobile ? '0.9rem' : '0.95rem', fontWeight: 700, color: 'var(--text2)' }}>
            Gallery
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'DM Mono, monospace', color: 'var(--text3)' }}>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'minmax(0, 1fr)'
              : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {loading ? (
            <Loader count={3} />
          ) : nfts.length === 0 ? (
            // No NFTs minted yet — prompt user to mint their first
            <EmptyGallery onOpenUpload={onOpenUpload} />
          ) : filtered.length === 0 ? (
            // NFTs exist but none match current filter/search
            <EmptyFilter query={debouncedSearch} category={activeCategory} />
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((nft) => (
                <ImageCard key={nft.id} nft={nft} onPreview={onPreview} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  )
}

function Stat({ val, label }) {
  return (
    <div
      style={{
        textAlign: 'center',
        minWidth: 0,
        padding: '0 8px',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(1.45rem, 4vw, 1.8rem)',
          fontWeight: 800,
          color: 'var(--text)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {val}
      </div>
      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--text3)',
          fontFamily: 'DM Mono, monospace',
          letterSpacing: '0.12em',
          lineHeight: 1.5,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function StatDivider({ mobile }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 1,
        height: mobile ? '100%' : 36,
        minHeight: mobile ? 52 : 36,
        background: 'var(--border)',
        justifySelf: 'center',
      }}
    />
  )
}

function EmptyGallery({ onOpenUpload }) {
  return (
    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.4 }}>⬡</div>
      <h3 style={{ fontSize: '1.1rem', color: 'var(--text2)', marginBottom: 10, fontWeight: 700 }}>
        No NFTs yet
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text3)', marginBottom: 24 }}>
        Mint your first NFT to get started. It will be pinned to public IPFS.
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpenUpload}
        style={{
          padding: '0 24px',
          height: 40,
          borderRadius: 10,
          background: 'var(--accent)',
          border: 'none',
          color: '#fff',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '0.875rem',
          cursor: 'pointer',
          boxShadow: '0 0 20px var(--accent-glow)',
        }}
      >
        + Mint Your First NFT
      </motion.button>
    </div>
  )
}

function EmptyFilter({ query, category }) {
  return (
    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
      <div style={{ fontSize: '2.8rem', marginBottom: 14, opacity: 0.45 }}>🔍</div>
      <h3 style={{ fontSize: '1.05rem', color: 'var(--text2)', marginBottom: 8, fontWeight: 700 }}>
        No results
      </h3>
      <p style={{ fontSize: '0.85rem' }}>
        {query
          ? `No NFTs matching "${query}"`
          : `No NFTs in category "${category}"`}
      </p>
    </div>
  )
}

