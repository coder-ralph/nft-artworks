import { useState, useCallback } from 'react'
import { uploadImage, uploadMetadata } from '../services/pinataService'
import { buildMetadata } from '../utils/metadataBuilder'

export const UPLOAD_STEPS = [
  { id: 'image',    label: 'Uploading image to IPFS'  },
  { id: 'metadata', label: 'Building NFT metadata'    },
  { id: 'pin',      label: 'Pinning metadata to IPFS' },
  { id: 'finalize', label: 'Finalizing NFT record'    },
]

// step state: 'waiting' | 'active' | 'done' | 'error'
function initSteps() {
  return UPLOAD_STEPS.map((s) => ({ ...s, state: 'waiting' }))
}

export function useUpload() {
  const [uploading,   setUploading]   = useState(false)
  const [steps,       setSteps]       = useState(initSteps())
  const [uploadError, setUploadError] = useState(null)

  const setStepState = useCallback((id, state) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, state } : s)),
    )
  }, [])

  /**
   * Run the full upload flow.
   *
   * @param {{ file: File, name: string, description: string, category: string, price: string }} params
   * @returns {Promise<Object>} NFT record
   */
  const mint = useCallback(async ({ file, name, description, category, price }) => {
    setUploading(true)
    setUploadError(null)
    setSteps(initSteps())

    try {
      // Step 1 — Upload image
      setStepState('image', 'active')
      const { hash: imageHash, url: imageUrl } = await uploadImage(file)
      setStepState('image', 'done')

      // Step 2 — Build metadata
      setStepState('metadata', 'active')
      const metadata = buildMetadata({ name, description, imageHash, category, price })
      await delay(350) // brief pause so UI is readable
      setStepState('metadata', 'done')

      // Step 3 — Upload metadata
      setStepState('pin', 'active')
      const { uri: metadataUri, gatewayUrl: metadataGatewayUrl } = await uploadMetadata(metadata)
      setStepState('pin', 'done')

      // Step 4 — Finalize
      setStepState('finalize', 'active')
      await delay(300)
      setStepState('finalize', 'done')

      const nftRecord = {
        id:          imageHash,
        metadata,
        imageUrl,
        metadataUri,
        metadataGatewayUrl,
        isDemo:      false,
      }

      return nftRecord
    } catch (err) {
      const msg = err.message || 'Upload failed'
      setUploadError(msg)
      // Mark any active step as errored
      setSteps((prev) =>
        prev.map((s) => (s.state === 'active' ? { ...s, state: 'error' } : s)),
      )
      throw err
    } finally {
      setUploading(false)
    }
  }, [setStepState])

  const reset = useCallback(() => {
    setUploading(false)
    setSteps(initSteps())
    setUploadError(null)
  }, [])

  return { uploading, steps, uploadError, mint, reset }
}

// ─── helpers ───────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
