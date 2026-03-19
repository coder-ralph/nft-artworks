import formidable from 'formidable'
import fs from 'fs'
import FormData from 'form-data'
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false, // Required for multipart/form-data
  },
}

const PINATA_JWT = process.env.PINATA_JWT
const PINATA_GATEWAY = (process.env.PINATA_GATEWAY || 'gateway.pinata.cloud')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '')

const PINATA_FILE_URL = 'https://uploads.pinata.cloud/v3/files'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!PINATA_JWT) {
    return res.status(500).json({
      error: 'PINATA_JWT not configured. Add it to your Vercel environment variables.',
    })
  }

  try {
    const form = formidable({ maxFileSize: 50 * 1024 * 1024 })
    const [, files] = await form.parse(req)

    const fileArray = Array.isArray(files.file) ? files.file : [files.file]
    if (!fileArray[0]) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const file = fileArray[0]

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: `Invalid file type: ${file.mimetype}` })
    }

    const pinataForm = new FormData()
    pinataForm.append('file', fs.createReadStream(file.filepath), {
      filename: file.originalFilename || 'nft-image',
      contentType: file.mimetype,
    })

    // Required so the file is publicly accessible via gateway
    pinataForm.append('name', file.originalFilename || 'nft-image')
    pinataForm.append('network', 'public')

    const pinataRes = await axios.post(PINATA_FILE_URL, pinataForm, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        ...pinataForm.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })

    const cid = pinataRes.data?.data?.cid

    if (!cid) {
      return res.status(500).json({ error: 'Pinata returned no CID.' })
    }

    return res.status(200).json({
      IpfsHash: cid,
      url: `https://${PINATA_GATEWAY}/ipfs/${cid}`,
    })
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({
        error: `Pinata upload failed (${err.response.status}): ${JSON.stringify(err.response.data)}`,
      })
    }

    console.error('[upload-image]', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
