import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useUpload, UPLOAD_STEPS } from '../hooks/useUpload'
import { CATEGORIES } from './CategoryFilter'
import { buildMetadata } from '../utils/metadataBuilder'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILES = 5

// ─── Demo-mode mock upload (no Pinata keys) ───────────────────────────────────
async function mockMint({ file, name, description, category, price, setStepState }) {
  const steps = ['image', 'metadata', 'pin', 'finalize']
  for (const id of steps) {
    setStepState(id, 'active')
    await delay(650)
    setStepState(id, 'done')
  }
  const demoHash = `demo-${Date.now()}`
  const metadata = buildMetadata({ name, description, imageHash: demoHash, category, price })
  const previewUrl = await readFileAsDataURL(file)
  return {
    id: demoHash,
    metadata,
    imageUrl: previewUrl,
    metadataUri: `ipfs://demo-meta-${demoHash}`,
    isDemo: false,
  }
}

export default function UploadModal({ onClose, onSuccess }) {
  // ── form state ──
  const [files,       setFiles]       = useState([])
  const [previews,    setPreviews]    = useState([])
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState('Art')
  const [price,       setPrice]       = useState('')
  const [errors,      setErrors]      = useState({})
  const [dragging,    setDragging]    = useState(false)
  const [demoMode,    setDemoMode]    = useState(false)

  const { uploading, steps, mint, reset } = useUpload()

  // track step states for demo mode
  const stepStateRef = useRef({})
  const [demoSteps, setDemoSteps] = useState(
    UPLOAD_STEPS.map((s) => ({ ...s, state: 'waiting' }))
  )

  const setDemoStepState = useCallback((id, state) => {
    setDemoSteps((prev) => prev.map((s) => (s.id === id ? { ...s, state } : s)))
  }, [])

  // Detect demo mode: if API routes are unavailable or keys not set
  // We detect this lazily on first submit attempt

  // ── file handling ──
  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming)
      .filter((f) => ACCEPTED_TYPES.includes(f.type))
      .slice(0, MAX_FILES)

    if (valid.length < Array.from(incoming).length) {
      toast.error('Some files were skipped (only PNG, JPG, GIF, WEBP allowed)')
    }

    setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES))

    valid.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target.result].slice(0, MAX_FILES))
      reader.readAsDataURL(f)
    })
  }, [])

  const removeFile = (i) => {
    setFiles((p) => p.filter((_, idx) => idx !== i))
    setPreviews((p) => p.filter((_, idx) => idx !== i))
  }

  // ── validation ──
  const validate = () => {
    const e = {}
    if (!files.length) e.files = 'Please select at least one image'
    if (!name.trim())  e.name  = 'Name is required'
    const p = parseFloat(price)
    if (!price || isNaN(p) || p <= 0)  e.price = 'Price must be a positive number'
    if (p > 999999)                    e.price = 'Price exceeds reasonable limit'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── submit ──
  const handleSubmit = async () => {
    if (!validate()) return

    const params = {
      file:        files[0],
      name:        name.trim(),
      description: description.trim(),
      category,
      price,
    }

    try {
      let nft

      // Try real upload first; fall back to demo if API not configured
      try {
        nft = await mint(params)
        toast.success('NFT minted and pinned to IPFS! 🎉')
      } catch (err) {
        // If the /api routes don't exist (local dev without server), demo mode
        if (err.message.includes('Failed to fetch') || err.message.includes('404')) {
          setDemoMode(true)
          reset()
          setDemoSteps(UPLOAD_STEPS.map((s) => ({ ...s, state: 'waiting' })))
          nft = await mockMint({ ...params, setStepState: setDemoStepState })
          toast.success('NFT minted (demo mode — start the API server for real IPFS)')
        } else {
          throw err
        }
      }

      onSuccess(nft)
      onClose()
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`)
    }
  }

  // ── keyboard close ──
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !uploading) onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, uploading])

  // ── body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const activeSteps = demoMode ? demoSteps : steps
  const isUploading = uploading || (demoMode && demoSteps.some((s) => s.state === 'active'))

  return (
    <AnimatePresence>
      <motion.div
        key="upload-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isUploading ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(4,6,10,0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          key="upload-modal"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 520,
            maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '22px 24px 0',
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Mint NFT Artwork
              </div>
              {demoMode && (
                <div style={{ fontSize: '0.7rem', color: 'var(--warn)', fontFamily: 'DM Mono, monospace', marginTop: 3 }}>
                  ⚠ Demo mode — API server not running
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={!isUploading ? onClose : undefined}
              disabled={isUploading}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text2)', cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </motion.button>
          </div>

          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* ── Drop zone ── */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragging(false)
                addFiles(e.dataTransfer.files)
              }}
              style={{
                border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`,
                borderRadius: 'var(--radius)',
                padding: '28px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'var(--accent-glow)' : 'var(--surface)',
                transition: 'var(--transition)',
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                multiple
                disabled={isUploading}
                onChange={(e) => addFiles(e.target.files)}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🖼</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text2)' }}>
                Drop images here or{' '}
                <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>browse</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 4, fontFamily: 'DM Mono, monospace' }}>
                PNG · JPG · GIF · WEBP &nbsp;·&nbsp; Max {MAX_FILES} files
              </div>

              {/* Thumbnails */}
              {previews.length > 0 && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, justifyContent: 'center' }}
                >
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img
                        src={src}
                        alt=""
                        style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border)' }}
                      />
                      {!isUploading && (
                        <button
                          onClick={() => removeFile(i)}
                          style={{
                            position: 'absolute', top: -6, right: -6,
                            width: 18, height: 18, borderRadius: '50%',
                            background: 'var(--error)', border: 'none',
                            color: '#fff', fontSize: 9, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.files && <ErrorMsg>{errors.files}</ErrorMsg>}

            {/* ── Name ── */}
            <Field label="NFT Name">
              <input
                className="field-input"
                placeholder="e.g. Cosmic Drift #001"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUploading}
                style={inputStyle}
                onFocus={focusStyle} onBlur={blurStyle}
              />
              {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
            </Field>

            {/* ── Description ── */}
            <Field label="Description">
              <textarea
                placeholder="Describe your NFT…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                style={{ ...inputStyle, height: 72, padding: '10px 14px', resize: 'vertical' }}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </Field>

            {/* ── Category ── */}
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
                style={inputStyle}
                onFocus={focusStyle} onBlur={blurStyle}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>

            {/* ── Price ── */}
            <Field label="Default Price (in ETH)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                <input
                  type="number"
                  min="0"
                  step="0.000001"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => {
                    let v = e.target.value
                    if (v.includes('.')) {
                      const [int, dec] = v.split('.')
                      if (dec.length > 6) v = `${int}.${dec.slice(0, 6)}`
                    }
                    setPrice(v)
                  }}
                  disabled={isUploading}
                  style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <div style={{
                  height: 42, padding: '0 14px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', background: 'var(--surface2)',
                  color: 'var(--text3)', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center',
                }}>
                  ETH
                </div>
              </div>
              {errors.price && <ErrorMsg>{errors.price}</ErrorMsg>}
            </Field>

            {/* ── Upload Progress ── */}
            {isUploading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeSteps.map((s) => (
                  <StepRow key={s.id} step={s} />
                ))}
              </div>
            )}

            {/* ── Submit ── */}
            <motion.button
              whileHover={!isUploading ? { scale: 1.02, filter: 'brightness(1.1)' } : {}}
              whileTap={!isUploading ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={isUploading}
              style={{
                width: '100%', height: 46, borderRadius: 'var(--radius)',
                background: 'var(--accent)', border: 'none', color: '#fff',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                opacity: isUploading ? 0.6 : 1,
                boxShadow: '0 0 24px var(--accent-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'var(--transition)',
              }}
            >
              {isUploading ? 'Minting…' : '⬡  Mint NFT'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: '0.72rem', fontWeight: 700, color: 'var(--text2)',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        fontFamily: 'DM Mono, monospace',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function ErrorMsg({ children }) {
  return (
    <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontFamily: 'DM Mono, monospace' }}>
      ⚠ {children}
    </div>
  )
}

const STEP_ICONS = { waiting: null, active: '↻', done: '✓', error: '✕' }
const STEP_COLORS = { waiting: 'var(--surface2)', active: 'var(--accent)', done: 'var(--success)', error: 'var(--error)' }

function StepRow({ step }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 14px', borderRadius: 'var(--radius)',
      background: step.state === 'done'   ? 'rgba(34,197,94,0.08)'
                : step.state === 'active' ? 'var(--accent-glow)'
                : step.state === 'error'  ? 'rgba(239,68,68,0.08)'
                : 'var(--surface)',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: STEP_COLORS[step.state] || 'var(--surface2)',
        color: step.state !== 'waiting' ? '#fff' : 'var(--text3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
        animation: step.state === 'active' ? 'spin 1s linear infinite' : 'none',
        fontFamily: 'DM Mono, monospace',
      }}>
        {STEP_ICONS[step.state] || '·'}
      </div>
      <span style={{
        fontSize: '0.82rem',
        color: step.state === 'active' ? 'var(--accent2)'
             : step.state === 'done'   ? 'var(--success)'
             : step.state === 'error'  ? 'var(--error)'
             : 'var(--text2)',
        fontWeight: step.state === 'active' ? 600 : 400,
      }}>
        {step.label}
      </span>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const inputStyle = {
  height: 42, borderRadius: 'var(--radius)',
  border: '1px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text)', padding: '0 14px',
  fontFamily: 'Syne, sans-serif', fontSize: '0.875rem',
  outline: 'none', width: '100%', transition: 'var(--transition)',
}

const focusStyle = (e) => {
  e.target.style.borderColor = 'var(--accent)'
  e.target.style.boxShadow  = '0 0 0 3px var(--accent-glow)'
}
const blurStyle = (e) => {
  e.target.style.borderColor = 'var(--border)'
  e.target.style.boxShadow  = 'none'
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise((r) => setTimeout(r, ms)) }

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
