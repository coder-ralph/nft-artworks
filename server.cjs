'use strict'

const express  = require('express')
const cors     = require('cors')
const multer   = require('multer')
const FormData = require('form-data')
const axios    = require('axios')
const fs       = require('fs')
const path     = require('path')
const dotenv   = require('dotenv')

dotenv.config()

const app  = express()
const PORT = process.env.API_PORT || 3001

// Credentials and config
const PINATA_JWT     = process.env.PINATA_JWT
const PINATA_GATEWAY = (process.env.PINATA_GATEWAY || 'gateway.pinata.cloud').replace(/\/$/, '')

if (!PINATA_JWT) {
  console.warn('\x1b[33m[server] ⚠  PINATA_JWT not set in .env — uploads will fail.\x1b[0m')
  console.warn('[server]    Add PINATA_JWT=your_jwt_token to your .env file.')
  console.warn('[server]    Get it from: https://app.pinata.cloud/keys\n')
}

// Pinata endpoints
const PINATA_FILE_URL = 'https://uploads.pinata.cloud/v3/files'
const PINATA_JSON_URL = 'https://api.pinata.cloud/v3/ipfs/json'

// Middleware
app.use(cors())
app.use(express.json())

// Multer needs a temp directory for incoming uploads
const TMP_DIR = path.join(__dirname, 'tmp')
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

// Write uploads to disk and allow image MIME types only
const upload = multer({
  dest: TMP_DIR,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: PNG, JPG, GIF, WEBP`))
    }
  },
})

// POST /api/upload-image
app.post('/api/upload-image', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided. Send the image as field "file" in multipart/form-data.' })
  }

  if (!PINATA_JWT) {
    fs.unlink(req.file.path, () => {})
    return res.status(500).json({ error: 'PINATA_JWT not configured on server.' })
  }

  try {
    const form = new FormData()

    // Image binary
    form.append('file', fs.createReadStream(req.file.path), {
      filename:    req.file.originalname || 'nft-image',
      contentType: req.file.mimetype,
    })

    // Dashboard label
    form.append('name', req.file.originalname || 'nft-image')

    // Keep file publicly accessible on IPFS
    form.append('network', 'public')

    console.log(`[upload-image] Uploading "${req.file.originalname}" (${req.file.mimetype}, ${req.file.size} bytes) → public IPFS…`)

    const pinataRes = await axios.post(PINATA_FILE_URL, form, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        ...form.getHeaders(),
      },
      maxBodyLength:    Infinity,
      maxContentLength: Infinity,
    })

    // Remove temp file after upload
    fs.unlink(req.file.path, () => {})

    // V3 response: { data: { id, name, cid, size, mime_type, network, ... } }
    const cid = pinataRes.data?.data?.cid

    if (!cid) {
      console.error('[upload-image] No CID in Pinata response:', pinataRes.data)
      return res.status(500).json({ error: 'Pinata returned no CID. Check API key has Files → Write permission.' })
    }

    console.log(`[upload-image] ✓ Pinned (public): ${cid}`)

    // Return CID plus gateway URL
    return res.json({
      IpfsHash: cid,
      url: `https://${PINATA_GATEWAY}/ipfs/${cid}`,
    })

  } catch (err) {
    fs.unlink(req.file?.path ?? '', () => {})
    if (err.response) {
      const status = err.response.status
      const body   = JSON.stringify(err.response.data)
      console.error(`[upload-image] Pinata error ${status}:`, body)
      return res.status(status).json({ error: `Pinata upload failed (${status}): ${body}` })
    }
    console.error('[upload-image] Unexpected error:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

// POST /api/upload-metadata
app.post('/api/upload-metadata', async (req, res) => {
  const metadata = req.body

  if (!metadata || typeof metadata !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object.' })
  }
  if (!metadata.name)          return res.status(400).json({ error: 'metadata.name is required.' })
  if (!metadata.image)         return res.status(400).json({ error: 'metadata.image is required.' })
  if (!metadata.price?.value)  return res.status(400).json({ error: 'metadata.price.value is required.' })

  if (!PINATA_JWT) {
    return res.status(500).json({ error: 'PINATA_JWT not configured on server.' })
  }

  try {
    // Public metadata with gallery-discovery naming convention
    const payload = {
      content: metadata,
      name:    `${metadata.name}-metadata`,
      network: 'public',
    }

    console.log(`[upload-metadata] Pinning metadata for "${metadata.name}" → public IPFS…`)

    const pinataRes = await axios.post(PINATA_JSON_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${PINATA_JWT}`,
      },
    })

    // V3 response: { data: { id, name, cid, network, ... } }
    const cid = pinataRes.data?.data?.cid

    if (!cid) {
      console.error('[upload-metadata] No CID in Pinata response:', pinataRes.data)
      return res.status(500).json({ error: 'Pinata returned no CID for metadata.' })
    }

    console.log(`[upload-metadata] ✓ Pinned (public): ${cid}`)

    return res.json({ IpfsHash: cid })

  } catch (err) {
    if (err.response) {
      const status = err.response.status
      const body   = JSON.stringify(err.response.data)
      console.error(`[upload-metadata] Pinata error ${status}:`, body)
      return res.status(status).json({ error: `Pinata metadata pin failed (${status}): ${body}` })
    }
    console.error('[upload-metadata] Unexpected error:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

// GET /api/nfts
// Mirrors api/nfts.js and keeps JWT server-side
app.get('/api/nfts', async (_req, res) => {
  if (!PINATA_JWT) {
    return res.status(500).json({ error: 'PINATA_JWT not configured.' })
  }

  try {
    // List public files, newest first
    const listRes = await axios.get(
      'https://api.pinata.cloud/v3/files?network=public&order=DESC&pageSize=1000',
      { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
    )

    const allFiles = listRes.data?.data?.files ?? []

    // Keep only "<name>-metadata" files
    const metadataFiles = allFiles.filter(
      (f) => typeof f.name === 'string' && f.name.endsWith('-metadata')
    )

    if (metadataFiles.length === 0) {
      return res.json([])
    }

    // Fetch metadata in batches
    const CONCURRENCY = 10
    const nftRecords  = []

    for (let i = 0; i < metadataFiles.length; i += CONCURRENCY) {
      const batch = metadataFiles.slice(i, i + CONCURRENCY)

      const results = await Promise.allSettled(
        batch.map(async (file) => {
          const metadataUrl = `https://${PINATA_GATEWAY}/ipfs/${file.cid}`
          const metaRes     = await axios.get(metadataUrl)
          const metadata    = metaRes.data

          if (!metadata.name || !metadata.image || !metadata.price) {
            throw new Error(`Incomplete metadata for CID ${file.cid}`)
          }

          const imageCid = metadata.image.replace('ipfs://', '')
          const imageUrl = `https://${PINATA_GATEWAY}/ipfs/${imageCid}`

          return {
            id:                 file.cid,
            metadata,
            imageUrl,
            metadataUri:        `ipfs://${file.cid}`,
            metadataGatewayUrl: metadataUrl,
            isDemo:             false,
          }
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          nftRecords.push(result.value)
        } else {
          console.warn('[nfts] Skipped metadata file:', result.reason?.message)
        }
      }
    }

    nftRecords.sort((a, b) =>
      new Date(b.metadata.created_at) - new Date(a.metadata.created_at)
    )

    console.log(`[nfts] Returning ${nftRecords.length} NFTs from Pinata`)
    res.json(nftRecords)

  } catch (err) {
    if (err.response) {
      const status = err.response.status
      console.error(`[nfts] Pinata error ${status}:`, JSON.stringify(err.response.data))
      return res.status(status).json({ error: `Pinata list failed (${status})` })
    }
    console.error('[nfts] Unexpected error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`\x1b[32m[server] API running → http://localhost:${PORT}\x1b[0m`)
  console.log('[server] Pinata V3 API | JWT auth | axios transport | public IPFS')
  console.log('[server] Routes:')
  console.log('[server]   POST /api/upload-image    → uploads.pinata.cloud/v3/files')
  console.log('[server]   POST /api/upload-metadata → api.pinata.cloud/v3/ipfs/json')
  console.log(`[server] JWT:     ${PINATA_JWT     ? '\x1b[32m✓ configured\x1b[0m' : '\x1b[31m✗ MISSING\x1b[0m'}`)
  console.log(`[server] Gateway: \x1b[36m${PINATA_GATEWAY}\x1b[0m`)
})
