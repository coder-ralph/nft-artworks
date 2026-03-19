import { motion } from 'framer-motion'

export default function ImageCard({ nft, onPreview }) {
  const { metadata, imageUrl, isDemo } = nft
  const date = new Date(metadata.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onPreview(nft)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'var(--bg3)' }}>
        <motion.img
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4 }}
          src={imageUrl}
          alt={metadata.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(8,11,18,0.72) 0%, transparent 55%)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 16,
          }}
        >
          <span style={{
            padding: '7px 18px', borderRadius: 8,
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff', fontSize: '0.8rem', fontWeight: 600,
          }}>
            Preview
          </span>
        </motion.div>

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          padding: '3px 10px', borderRadius: 6,
          background: 'rgba(8,11,18,0.76)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.68rem', fontFamily: 'DM Mono, monospace',
          color: 'var(--text2)', letterSpacing: '0.04em',
        }}>
          {metadata.category}
        </div>

        {/* Demo badge */}
        {isDemo && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            padding: '3px 8px', borderRadius: 6,
            background: 'var(--gold-dim)', border: '1px solid var(--gold)',
            fontSize: '0.65rem', fontFamily: 'DM Mono, monospace',
            color: 'var(--gold)', letterSpacing: '0.04em',
          }}>
            DEMO
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{
          fontSize: '0.95rem', fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          letterSpacing: '-0.01em',
        }}>
          {metadata.name}
        </div>
        <div style={{
          fontSize: '0.77rem', color: 'var(--text3)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 12, lineHeight: 1.4,
        }}>
          {metadata.description}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12, borderTop: '1px solid var(--border)',
        }}>
          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'linear-gradient(135deg, #627eea, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: '#fff', fontWeight: 700,
            }}>
              Ξ
            </div>
            <span style={{
              fontSize: '0.95rem', fontWeight: 700,
              color: 'var(--text)', fontFamily: 'DM Mono, monospace',
              letterSpacing: '-0.02em',
            }}>
              {metadata.price?.value ?? '0'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
              ETH
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
            {date}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
