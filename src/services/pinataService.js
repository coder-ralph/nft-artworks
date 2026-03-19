// Gateway from env (fallback to public Pinata gateway)
const PINATA_GATEWAY = (
  import.meta.env.VITE_PINATA_GATEWAY || 'gateway.pinata.cloud'
).replace(/^https?:\/\//, '').replace(/\/$/, '')

/**
 * Convert ipfs:// or CID → HTTPS gateway URL
 */
export function resolveIPFS(ipfsUriOrCid) {
  if (!ipfsUriOrCid) return ''
  const cid = ipfsUriOrCid.replace('ipfs://', '').replace(/^\/ipfs\//, '')
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`
}

/**
 * Upload image via backend proxy (keeps Pinata credentials server-side)
 */
export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || `Image upload failed (${response.status})`)
  }

  const data = await response.json()

  return {
    hash: data.IpfsHash,
    // Prefer server URL, fallback to client gateway
    url: data.url || resolveIPFS(data.IpfsHash),
  }
}

/**
 * Upload metadata via backend proxy
 */
export async function uploadMetadata(metadata) {
  const response = await fetch('/api/upload-metadata', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(metadata),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || `Metadata upload failed (${response.status})`)
  }

  const data = await response.json()

  return {
    hash:       data.IpfsHash,
    uri:        `ipfs://${data.IpfsHash}`,
    gatewayUrl: resolveIPFS(data.IpfsHash),
  }
}
