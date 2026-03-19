const PINATA_JWT = process.env.PINATA_JWT
const PINATA_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

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
    const metadata = req.body

    // Basic shape validation
    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' })
    }
    if (!metadata.name) return res.status(400).json({ error: 'metadata.name is required' })
    if (!metadata.image) return res.status(400).json({ error: 'metadata.image is required' })
    if (!metadata.price?.value) {
      return res.status(400).json({ error: 'metadata.price.value is required' })
    }

    const payload = {
      pinataContent: metadata,
      // Naming convention used for gallery discovery ("-metadata" filter)
      pinataMetadata: {
        name: `${metadata.name}-metadata`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    }

    const pinataRes = await fetch(PINATA_JSON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify(payload),
    })

    const responseText = await pinataRes.text()

    if (!pinataRes.ok) {
      console.error('[upload-metadata] Pinata error:', responseText)
      return res.status(pinataRes.status).json({
        error: `Pinata metadata pin failed (${pinataRes.status}): ${responseText}`,
      })
    }

    const pinataData = JSON.parse(responseText)
    const cid = pinataData?.IpfsHash

    if (!cid) {
      return res.status(500).json({ error: 'Pinata returned no CID for metadata.' })
    }

    return res.status(200).json({ IpfsHash: cid })
  } catch (err) {
    console.error('[upload-metadata]', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
