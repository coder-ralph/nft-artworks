export function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
    }}>
      {/* Image area */}
      <div
        className="animate-shimmer"
        style={{ aspectRatio: '1', width: '100%' }}
      />
      {/* Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="animate-shimmer" style={{ height: 18, borderRadius: 6, width: '70%' }} />
        <div className="animate-shimmer" style={{ height: 13, borderRadius: 6, width: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div className="animate-shimmer" style={{ height: 13, borderRadius: 6, width: '38%' }} />
          <div className="animate-shimmer" style={{ height: 13, borderRadius: 6, width: '28%' }} />
        </div>
      </div>
    </div>
  )
}

/**
 * Render N skeleton cards in a grid.
 */
export default function Loader({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}
