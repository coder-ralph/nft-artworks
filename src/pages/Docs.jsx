import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Static documentation page for NFT Artworks.
// ─── Content ──────────────────────────────────────────────────────────────────

const NAV = [
  {
    group: 'Overview',
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'features',     label: 'Features'     },
      { id: 'tech-stack',   label: 'Tech Stack'   },
    ],
  },
  {
    group: 'Guides',
    items: [
      { id: 'requirements', label: 'Requirements' },
      { id: 'local-setup',  label: 'Local Setup'  },
      { id: 'env-vars',     label: 'Environment Variables' },
      { id: 'deployment',   label: 'Deployment'   },
    ],
  },
]

const SECTIONS = {
  introduction: {
    title: 'Introduction',
    content: [
      {
        type: 'p',
        text: 'NFT Artworks is a modern Web3 gallery application for uploading, organizing, and displaying NFT artwork stored on IPFS. Built with React and Vite, it uses Pinata V3 for image uploads and the legacy pinJSONToIPFS endpoint for metadata pinning to the public IPFS network.',
      },
      {
        type: 'p',
        text: 'Every uploaded NFT generates an ERC-721 compatible metadata JSON — including name, description, category, and ETH price — all stored on IPFS, never in a centralized database.',
      },
      {
        type: 'callout',
        variant: 'info',
        text: 'This app is production-ready and Vercel-deployable. Pinata credentials are handled server-side — they are never exposed to the browser.',
      },
      {
        type: 'h3',
        text: 'How it works',
      },
      {
        type: 'steps',
        items: [
          'User uploads an image and fills in name, category, and ETH price.',
          'Image is sent to the secure /api/upload-image route and uploaded to Pinata (V3).',
          'ERC-721 metadata JSON is generated and pinned via /api/upload-metadata.',
          'Gallery fetches NFTs from /api/nfts, which reads metadata directly from Pinata.',
          'All images are served via your dedicated Pinata gateway URL.',
        ],
      },
    ],
  },

  features: {
    title: 'Features',
    content: [
      {
        type: 'feature-list',
        items: [
          { icon: '⬡', title: 'IPFS Upload via Pinata', desc: 'Images are uploaded via Pinata V3 (/v3/files) and metadata is pinned via pinJSONToIPFS. The gallery reads directly from Pinata.' },
          { icon: '📋', title: 'ERC-721 Metadata', desc: 'Auto-generated metadata follows the ERC-721 standard — compatible with OpenSea, Rarible, Thirdweb, and any wallet.' },
          { icon: '🖼', title: 'Responsive Gallery', desc: 'Masonry-style grid with search by name/category, filter chips, and four sort modes: newest, oldest, price high→low, price low→high.' },
          { icon: '🔍', title: 'Image Preview Modal', desc: 'Click any NFT card to open a full-screen preview with click-to-zoom, metadata attributes, and a direct link to the metadata on IPFS.' },
          { icon: '🌗', title: 'Dark / Light Theme', desc: 'Toggle between dark and light mode. Preference is persisted in localStorage across sessions.' },
          { icon: '🔐', title: 'Secure API Proxy', desc: 'PINATA_JWT is only ever read by the server. It is never included in the Vite build or sent to the browser.' },
          { icon: '🚀', title: 'Vercel-Ready', desc: 'The /api folder contains Vercel serverless functions for Pinata uploads. One-click deploy.' },
          { icon: '📱', title: 'Mobile Responsive', desc: 'The gallery, upload modal, and navigation are all fully responsive and tested on mobile.' },
        ],
      },
    ],
  },

  'tech-stack': {
    title: 'Tech Stack',
    content: [
      {
        type: 'table',
        headers: ['Layer', 'Technology', 'Purpose'],
        rows: [
          ['Frontend',    'React 18 + Vite 5',          'UI framework and build tool'],
          ['Styling',     'TailwindCSS 3 + CSS vars',   'Utility classes and custom design tokens'],
          ['Animation',   'Framer Motion',              'Page transitions and card animations'],
          ['Toasts',      'react-hot-toast',            'Upload success / error notifications'],
          ['IPFS',        'Pinata V3 + Legacy Pinning', 'V3 for image uploads, pinJSONToIPFS for metadata'],
          ['Backend',     'Express + Vercel Functions', 'Secure server-side Pinata proxy'],
          ['HTTP',        'axios',                      'Node.js stream-safe HTTP client for uploads'],
          ['Persistence', 'Pinata (IPFS)', 'NFT metadata stored on IPFS and fetched via API'],
        ],
      },
      {
        type: 'h3',
        text: 'Pinata API usage',
      },
      {
        type: 'p',
        text: 'This app uses a mixed Pinata setup: V3 for image uploads and the legacy JSON pinning endpoint for NFT metadata.',
      },
      {
        type: 'table',
        headers: ['Data type', 'API', 'Source of truth'],
        rows: [
          ['Image', '/v3/files (V3)', 'IPFS file'],
          ['Metadata', '/pinning/pinJSONToIPFS (Legacy)', 'IPFS JSON'],
          ['Gallery', '/data/pinList', 'Pinata index of metadata'],
        ],
      },
            {
        type: 'callout',
        variant: 'warn',
        text: 'Image uploads must explicitly set network: "public". Metadata uses the legacy pinJSONToIPFS endpoint.',
      },
    ],
  },

  requirements: {
    title: 'Requirements',
    content: [
      {
        type: 'h3',
        text: 'System Requirements',
      },
      {
        type: 'checklist',
        items: [
          'Node.js ≥ 18',
          'npm ≥ 9',
          'A Pinata account (free tier is sufficient)',
          'Git (for version control and Vercel deployment)',
        ],
      },
      {
        type: 'h3',
        text: 'Pinata API Key Setup',
      },
      {
        type: 'steps',
        items: [
          'Go to app.pinata.cloud/keys and click "New Key".',
          'Give it a name (e.g. nft-artworks). Keep Admin OFF.',
          'Under V3 Resources, set Files → Write.',
          'Under Legacy → Pinning, enable pinJSONToIPFS.',
          'Under Data → enable pinList.',
          'Click Create and immediately copy the JWT token — it is only shown once.',
          'Add it to your .env file as PINATA_JWT=your_token_here.',
        ],
      },
      {
        type: 'table',
        headers: ['Feature', 'Endpoint', 'Permission needed'],
        rows: [
          ['Image upload', '/v3/files', 'Files → Write'],
          ['Metadata JSON', '/pinning/pinJSONToIPFS', 'pinJSONToIPFS'],
          ['Gallery listing', '/data/pinList', 'pinList'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        text: 'This app uses a hybrid Pinata setup: metadata is pinned via legacy pinJSONToIPFS, while the gallery is built dynamically by querying /data/pinList. This ensures NFTs persist across refreshes and devices.',
      },
    ],
  },

  'local-setup': {
    title: 'Local Setup',
    content: [
      {
        type: 'h3',
        text: '1. Install dependencies',
      },
      {
        type: 'code',
        lang: 'bash',
        text: `npm install`,
      },
      {
        type: 'h3',
        text: '2. Configure environment',
      },
      {
        type: 'code',
        lang: 'bash',
        text: 'cp .env.example .env',
      },
      {
        type: 'p',
        text: 'Then edit .env and fill in your values (see Environment Variables).',
      },
      {
        type: 'h3',
        text: '3. Start both servers',
      },
      {
        type: 'code',
        lang: 'bash',
        text: `# Terminal 1 — API server (proxies to Pinata)
node server.cjs

# Terminal 2 — Vite dev server
npm run dev`,
      },
      {
        type: 'p',
        text: 'Open http://localhost:5173 in your browser.',
      },
      {
        type: 'h3',
        text: 'Verify it\'s working',
      },
      {
        type: 'checklist',
        items: [
          'server.cjs prints "JWT: ✓ configured" and shows your gateway domain',
          'The app loads at localhost:5173',
          'Clicking "Mint NFT" opens the upload modal',
          'After upload, terminal shows successful image and metadata pin logs',
          'The new NFT appears and remains after refresh (loaded from Pinata)',
          'Pinata dashboard shows the uploaded files and metadata',
        ],
      },
    ],
  },

  'env-vars': {
    title: 'Environment Variables',
    content: [
      {
        type: 'p',
        text: 'Copy .env.example to .env and fill in the values below. Never commit .env to Git.',
      },
      {
        type: 'table',
        headers: ['Variable', 'Used by', 'Required', 'Description'],
        rows: [
          ['PINATA_JWT',          'server.cjs, /api/*', 'Yes', 'JWT token from Pinata — never sent to browser'],
          ['PINATA_GATEWAY',      'server.cjs, /api/*', 'Yes', 'Your Pinata gateway domain (no https://)'],
          ['VITE_PINATA_GATEWAY', 'pinataService.js',   'Yes', 'Same gateway — exposed to Vite via import.meta.env'],
          ['API_PORT',            'server.cjs',         'No',  'Local Express port (default: 3001)'],
        ],
      },
      {
        type: 'code',
        lang: 'env',
        text: `PINATA_JWT=your_pinata_jwt_token_here
PINATA_GATEWAY=your-pinata-gateway.mypinata.cloud
VITE_PINATA_GATEWAY=your-pinata-gateway.mypinata.cloud
API_PORT=3001`,
      },
      {
        type: 'callout',
        variant: 'warn',
        text: 'PINATA_JWT must also be set in Vercel environment variables for production uploads to work. VITE_PINATA_GATEWAY must also be set so the browser resolves image URLs correctly.',
      },
    ],
  },

  deployment: {
    title: 'Deployment',
    content: [
      {
        type: 'h3',
        text: 'Push to GitHub',
      },
      {
        type: 'code',
        lang: 'bash',
        text: `git init
git add .
git commit -m "feat: NFT Artworks — production ready"
git remote add origin https://github.com/YOUR_USERNAME/nft-artworks.git
git branch -M main
git push -u origin main`,
      },
      {
        type: 'h3',
        text: 'Deploy on Vercel',
      },
      {
        type: 'steps',
        items: [
          'Go to vercel.com/new and click "Import Git Repository".',
          'Select your nft-artworks repo.',
          'Framework preset: Vite. Build command: npm run build. Output: dist.',
          'Open "Environment Variables" and add: PINATA_JWT, PINATA_GATEWAY, VITE_PINATA_GATEWAY.',
          'Click Deploy.',
          'After deploy, update the og:url and og:image URLs in index.html with your live Vercel domain, then redeploy.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        text: 'The /api folder contains Vercel serverless functions that are automatically detected. No additional configuration is needed.',
      },
      {
        type: 'h3',
        text: 'Common Deployment Issues',
      },
      {
        type: 'table',
        headers: ['Issue', 'Fix'],
        rows: [
          ['Upload returns 500',        'Check Vercel → Project → Settings → Environment Variables'],
          ['Images not loading',        'Confirm VITE_PINATA_GATEWAY is set in Vercel env vars'],
          ['Metadata returns 403',      'Ensure the JWT has pinJSONToIPFS permission enabled'],
          ['Files uploaded as private', 'Ensure image upload sends network: "public"'],
          ['OG image not previewing',   'SVG support varies by platform — verify the URL is publicly accessible'],
          ['NFT disappears after refresh', 'Ensure pinList permission is enabled and /api/nfts uses /data/pinList'],
        ],
      },
    ],
  },
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

function renderContent(blocks, isMobile) {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'p':
        return (
          <p
            key={i}
            style={{
              fontSize: isMobile ? '0.88rem' : '0.9rem',
              color: 'var(--text2)',
              lineHeight: 1.75,
              marginBottom: 14,
            }}
          >
            {block.text}
          </p>
        )

      case 'h3':
        return (
          <h3
            key={i}
            style={{
              fontSize: isMobile ? '0.98rem' : '1rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginTop: 28,
              marginBottom: 10,
              letterSpacing: '-0.01em',
            }}
          >
            {block.text}
          </h3>
        )

      case 'code':
        return (
          <div key={i} style={{ marginBottom: 16 }}>
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {block.lang && (
                <div
                  style={{
                    padding: '6px 14px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.68rem',
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--text3)',
                    letterSpacing: '0.06em',
                    background: 'var(--surface)',
                  }}
                >
                  {block.lang.toUpperCase()}
                </div>
              )}
              <pre
                style={{
                  margin: 0,
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  fontSize: isMobile ? '0.76rem' : '0.82rem',
                  fontFamily: 'DM Mono, monospace',
                  color: 'var(--accent2)',
                  overflowX: 'auto',
                  lineHeight: 1.7,
                  whiteSpace: 'pre',
                }}
              >
                {block.text}
              </pre>
            </div>
          </div>
        )

      case 'callout':
        const calloutColors = {
          info: { bg: 'rgba(61,126,255,0.08)', border: 'rgba(61,126,255,0.3)', icon: 'ℹ', color: 'var(--accent2)' },
          warn: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', icon: '⚠', color: '#f59e0b' },
        }
        const c = calloutColors[block.variant] || calloutColors.info
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: isMobile ? '12px 14px' : '12px 16px',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
            <p
              style={{
                margin: 0,
                fontSize: isMobile ? '0.82rem' : '0.85rem',
                color: 'var(--text2)',
                lineHeight: 1.65,
              }}
            >
              {block.text}
            </p>
          </div>
        )

      case 'steps':
        return (
          <ol
            key={i}
            style={{
              paddingLeft: 0,
              marginBottom: 16,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {block.items.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'DM Mono, monospace',
                    marginTop: 1,
                  }}
                >
                  {idx + 1}
                </span>
                <span
                  style={{
                    fontSize: isMobile ? '0.84rem' : '0.875rem',
                    color: 'var(--text2)',
                    lineHeight: 1.65,
                    paddingTop: 2,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ol>
        )

      case 'checklist':
        return (
          <ul
            key={i}
            style={{
              paddingLeft: 0,
              marginBottom: 16,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}
          >
            {block.items.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2, fontSize: '0.9rem' }}>✓</span>
                <span
                  style={{
                    fontSize: isMobile ? '0.84rem' : '0.875rem',
                    color: 'var(--text2)',
                    lineHeight: 1.6,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        )

      case 'table':
        return (
          <div
            key={i}
            style={{
              overflowX: 'auto',
              marginBottom: 20,
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}
          >
            <table
              style={{
                width: '100%',
                minWidth: isMobile ? 560 : '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr>
                  {block.headers.map((h, hi) => (
                    <th
                      key={hi}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--text3)',
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.72rem',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        background: 'var(--bg2)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: '9px 12px',
                          color: ci === 0 ? 'var(--accent2)' : 'var(--text2)',
                          fontFamily: ci === 0 ? 'DM Mono, monospace' : 'inherit',
                          fontSize: ci === 0 ? '0.8rem' : '0.85rem',
                          verticalAlign: 'top',
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'feature-list':
        return (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 14,
              marginBottom: 16,
            }}
          >
            {block.items.map((item, fi) => (
              <div
                key={fi}
                style={{
                  padding: '14px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{item.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text3)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )

      case 'comparison':
        return (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[block.left, block.right].map((side, si) => (
              <div
                key={si}
                style={{
                  padding: '14px 16px',
                  background: si === 0 ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
                  border: `1px solid ${si === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'DM Mono, monospace',
                    color: si === 0 ? '#ef4444' : '#22c55e',
                    marginBottom: 10,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  {side.label}
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                  }}
                >
                  {side.items.map((item, ii) => (
                    <li
                      key={ii}
                      style={{
                        fontSize: '0.78rem',
                        fontFamily: 'DM Mono, monospace',
                        color: 'var(--text2)',
                        lineHeight: 1.5,
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  })
}

function NavContent({ activeId, onSelect }) {
  return (
    <>
      {NAV.map((group) => (
        <div key={group.group} style={{ marginBottom: 8 }}>
          <div
            style={{
              padding: '0 16px 6px',
              fontSize: '0.68rem',
              fontFamily: 'DM Mono, monospace',
              color: 'var(--text3)',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}
          >
            {group.group.toUpperCase()}
          </div>

          {group.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                background: activeId === item.id ? 'var(--accent-glow)' : 'transparent',
                border: 'none',
                borderLeft: `2px solid ${activeId === item.id ? 'var(--accent)' : 'transparent'}`,
                color: activeId === item.id ? 'var(--accent2)' : 'var(--text2)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'Syne, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (activeId !== item.id) e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={(e) => {
                if (activeId !== item.id) e.currentTarget.style.color = 'var(--text2)'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Docs({ onClose }) {
  const [activeId, setActiveId] = useState('introduction')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const section = SECTIONS[activeId]

  const flatNavItems = useMemo(
    () => NAV.flatMap((group) => group.items),
    []
  )

  const currentIndex = flatNavItems.findIndex((item) => item.id === activeId)
  const prevItem = currentIndex > 0 ? flatNavItems[currentIndex - 1] : null
  const nextItem = currentIndex < flatNavItems.length - 1 ? flatNavItems[currentIndex + 1] : null

  const goToSection = (id) => {
    setActiveId(id)
    setMobileNavOpen(false)
  }

  // Keyboard close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (mobileNavOpen) {
          setMobileNavOpen(false)
          return
        }
        onClose()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobileNavOpen, onClose])

  // Responsive breakpoint
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)')

    const update = (event) => {
      setIsMobile(event.matches)
      if (!event.matches) setMobileNavOpen(false)
    }

    setIsMobile(media.matches)

    if (media.addEventListener) {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  // Reset content scroll when changing sections
  useEffect(() => {
    const content = document.getElementById('docs-content-scroll')
    if (content) content.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeId])

  // Lock scroll behind mobile drawer
  useEffect(() => {
    if (!mobileNavOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileNavOpen])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          minHeight: 56,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 24px',
          gap: 12,
          flexShrink: 0,
          background: 'var(--bg2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 10 : 16,
            minWidth: 0,
            flex: 1,
          }}
        >
          {isMobile && (
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              style={{
                width: 38,
                height: 38,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ☰
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text3)',
              fontSize: isMobile ? '0.74rem' : '0.82rem',
              fontFamily: 'DM Mono, monospace',
              padding: 0,
              transition: 'color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
          >
            ← Back
          </button>

          {!isMobile && <div style={{ width: 1, height: 18, background: 'var(--border)' }} />}

          <span
            style={{
              fontSize: isMobile ? '0.78rem' : '0.82rem',
              color: 'var(--text2)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            NFT Artworks — Documentation
          </span>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'DM Mono, monospace',
            color: 'var(--text3)',
            flexShrink: 0,
          }}
        >
          v1.0
        </span>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* ── Desktop Sidebar ── */}
        {!isMobile && (
          <aside
            style={{
              width: 240,
              flexShrink: 0,
              borderRight: '1px solid var(--border)',
              overflowY: 'auto',
              padding: '20px 0',
              background: 'var(--bg2)',
            }}
          >
            <NavContent activeId={activeId} onSelect={goToSection} />
          </aside>
        )}

        {/* ── Mobile Drawer ── */}
        <AnimatePresence>
          {isMobile && mobileNavOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileNavOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 5,
                  background: 'rgba(0,0,0,0.55)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />

              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'tween', duration: 0.22 }}
                style={{
                  position: 'absolute',
                  top: 56,
                  left: 0,
                  bottom: 0,
                  width: 'min(280px, 82vw)',
                  zIndex: 6,
                  borderRight: '1px solid var(--border)',
                  background: 'var(--bg2)',
                  overflowY: 'auto',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                }}
              >
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    position: 'sticky',
                    top: 0,
                    background: 'var(--bg2)',
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontFamily: 'DM Mono, monospace',
                      color: 'var(--text3)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    DOCUMENTATION MENU
                  </span>

                  <button
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation menu"
                    style={{
                      width: 34,
                      height: 34,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      color: 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ padding: '14px 0 22px' }}>
                  <NavContent activeId={activeId} onSelect={goToSection} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main
          id="docs-content-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            minWidth: 0,
            padding: isMobile ? '20px 16px 28px' : '36px 48px',
          }}
        >
          <div style={{ width: '100%', maxWidth: isMobile ? '100%' : 820 }}>
            {isMobile && (
              <div
                style={{
                  marginBottom: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text3)',
                  fontSize: '0.72rem',
                  fontFamily: 'DM Mono, monospace',
                }}
              >
                <span>Section</span>
                <span style={{ color: 'var(--text)' }}>{section.title}</span>
              </div>
            )}

            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <h1
                style={{
                  fontSize: isMobile ? '1.95rem' : '1.65rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--text)',
                  marginBottom: 6,
                  lineHeight: 1.05,
                  wordBreak: 'break-word',
                }}
              >
                {section.title}
              </h1>

              <div
                style={{
                  width: 40,
                  height: 3,
                  borderRadius: 2,
                  background: 'var(--accent)',
                  marginBottom: isMobile ? 22 : 28,
                }}
              />

              {renderContent(section.content, isMobile)}

              {/* ── Previous / Next buttons ── */}
              <div
                style={{
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: '1px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: 12,
                }}
              >
                <button
                  onClick={() => prevItem && goToSection(prevItem.id)}
                  disabled={!prevItem}
                  style={{
                    minHeight: 54,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: prevItem ? 'var(--surface)' : 'transparent',
                    color: prevItem ? 'var(--text)' : 'var(--text3)',
                    cursor: prevItem ? 'pointer' : 'not-allowed',
                    opacity: prevItem ? 1 : 0.5,
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'DM Mono, monospace',
                      color: 'var(--text3)',
                    }}
                  >
                    PREVIOUS
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {prevItem ? `← ${prevItem.label}` : 'No previous section'}
                  </span>
                </button>

                <button
                  onClick={() => nextItem && goToSection(nextItem.id)}
                  disabled={!nextItem}
                  style={{
                    minHeight: 54,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: nextItem ? 'var(--surface)' : 'transparent',
                    color: nextItem ? 'var(--text)' : 'var(--text3)',
                    cursor: nextItem ? 'pointer' : 'not-allowed',
                    opacity: nextItem ? 1 : 0.5,
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'DM Mono, monospace',
                      color: 'var(--text3)',
                    }}
                  >
                    NEXT
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {nextItem ? `${nextItem.label} →` : 'No next section'}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </motion.div>
  )
}
