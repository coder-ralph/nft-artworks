import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ImagePreviewModal({ nft, onClose }) {
  const [zoomed, setZoomed] = useState(false)
  const { metadata, imageUrl, metadataUri, metadataGatewayUrl } = nft

  const date = new Date(metadata.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Resolve metadata gateway URL (server → ipfs:// → none)
  const GATEWAY = (
    import.meta.env.VITE_PINATA_GATEWAY || 'gateway.pinata.cloud'
  ).replace(/^https?:\/\//, '').replace(/\/$/, '')

  function resolvedMetadataLink() {
    // Use server-provided gateway URL if available
    if (metadataGatewayUrl && metadataGatewayUrl.startsWith('https://')) {
      return metadataGatewayUrl
    }

    // Fallback: build from ipfs:// CID if valid
    if (metadataUri && metadataUri.startsWith('ipfs://')) {
      const cid = metadataUri.replace('ipfs://', '')
      if (cid.startsWith('Qm') || cid.startsWith('bafy') || cid.startsWith('bafk')) {
        return `https://${GATEWAY}/ipfs/${cid}`
      }
    }

    // No valid CID → hide link
    return null
  }

  const ipfsMetadataLink = resolvedMetadataLink()

  return (
    <AnimatePresence>
      <motion.div
        key="preview-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(4,6,10,0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          key="preview-modal"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 820,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', letterSpacing: '0.06em' }}>
              NFT PREVIEW
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text2)', cursor: 'pointer',
                fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </motion.button>
          </div>

          {/* Image */}
          <div style={{
            position: 'relative',
            background: 'var(--bg3)',
            maxHeight: '55vh',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <motion.img
              src={imageUrl}
              alt={metadata.name}
              animate={{ scale: zoomed ? 1.85 : 1 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={() => setZoomed((z) => !z)}
              style={{
                maxWidth: '100%', maxHeight: '55vh',
                objectFit: 'contain',
                cursor: zoomed ? 'zoom-out' : 'zoom-in',
                display: 'block',
              }}
            />
            <div style={{
              position: 'absolute', bottom: 10, right: 12,
              padding: '4px 10px', borderRadius: 6,
              background: 'rgba(0,0,0,0.6)',
              fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)',
              fontFamily: 'DM Mono, monospace',
              pointerEvents: 'none',
            }}>
              {zoomed ? 'click to zoom out' : 'click to zoom in'}
            </div>
          </div>

          {/* Metadata */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>
              {metadata.name}
            </div>

            {metadata.description && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.65 }}>
                {metadata.description}
              </div>
            )}

            {/* Attribute pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <AttributePill label="Category" value={metadata.category} />
              <AttributePill label="Uploaded" value={date} />
              {(metadata.attributes || [])
                .filter((a) => a.trait_type !== 'Category' && a.trait_type !== 'Price (ETH)')
                .map((a, i) => (
                  <AttributePill key={i} label={a.trait_type} value={a.value} />
                ))}
            </div>

            {/* Footer: price + IPFS link */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 14, borderTop: '1px solid var(--border)',
              flexWrap: 'wrap', gap: 10,
            }}>
              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #627eea, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#fff', fontWeight: 700,
                }}>
                  Ξ
                </div>
                <span style={{
                  fontSize: '1.65rem', fontWeight: 800,
                  fontFamily: 'DM Mono, monospace', letterSpacing: '-0.04em',
                  color: 'var(--text)',
                }}>
                  {metadata.price?.value ?? '0'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                  ETH
                </span>
              </div>

              {/* Show link only if CID is valid */}
              {ipfsMetadataLink ? (
                <a
                  href={ipfsMetadataLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--text3)',
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
                >
                  🔗 View metadata on IPFS
                </a>
              ) : (
                <span style={{
                  fontSize: '0.72rem',
                  fontFamily: 'DM Mono, monospace',
                  color: 'var(--text3)',
                  opacity: 0.5,
                }}>
                  Local only — not pinned to IPFS
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function AttributePill({ label, value }) {
  return (
    <div style={{
      padding: '6px 14px', borderRadius: 8,
      background: 'var(--surface)', border: '1px solid var(--border)',
      fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', color: 'var(--text2)',
    }}>
      {label}:{' '}
      <span style={{ color: 'var(--accent2)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
