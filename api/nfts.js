const PINATA_JWT = process.env.PINATA_JWT
const PINATA_GATEWAY = (process.env.PINATA_GATEWAY || 'gateway.pinata.cloud')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '')

// Legacy Pinata pin listing endpoint
const PINATA_PIN_LIST_URL = 'https://api.pinata.cloud/data/pinList'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!PINATA_JWT) {
    return res.status(500).json({ error: 'PINATA_JWT not configured.' })
  }

  try {
    // Metadata is pinned via pinJSONToIPFS → use legacy pinList
    const listUrl = `${PINATA_PIN_LIST_URL}?status=pinned&pageLimit=1000`

    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
    })

    if (!listRes.ok) {
      const text = await listRes.text()
      console.error('[nfts] Pinata pinList error:', text)
      return res.status(listRes.status).json({
        error: `Pinata pin list failed (${listRes.status}): ${text}`,
      })
    }

    const listData = await listRes.json()
    const allPins = listData?.rows ?? []

    // Only keep "<name>-metadata"
    const metadataPins = allPins
      .filter(
        (row) =>
          typeof row?.metadata?.name === 'string' &&
          row.metadata.name.endsWith('-metadata')
      )
      .sort(
        (a, b) =>
          new Date(b.date_pinned || 0).getTime() - new Date(a.date_pinned || 0).getTime()
      )

    if (metadataPins.length === 0) {
      return res.status(200).json([])
    }

    const CONCURRENCY = 10
    const nftRecords = []

    for (let i = 0; i < metadataPins.length; i += CONCURRENCY) {
      const batch = metadataPins.slice(i, i + CONCURRENCY)

      const results = await Promise.allSettled(
        batch.map(async (row) => {
          const cid = row.ipfs_pin_hash
          const metadataUrl = `https://${PINATA_GATEWAY}/ipfs/${cid}`

          const metaRes = await fetch(metadataUrl, {
            headers: { Accept: 'application/json' },
          })

          if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status} for ${cid}`)

          const metadata = await metaRes.json()

          // Minimal validation
          if (!metadata.name || !metadata.image || !metadata.price) {
            throw new Error(`Incomplete metadata for CID ${cid}`)
          }

          // Resolve image CID → gateway URL
          const imageCid = String(metadata.image).replace('ipfs://', '')
          const imageUrl = `https://${PINATA_GATEWAY}/ipfs/${imageCid}`

          return {
            id: cid,
            metadata,
            imageUrl,
            metadataUri: `ipfs://${cid}`,
            metadataGatewayUrl: metadataUrl,
            isDemo: false,
          }
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          nftRecords.push(result.value)
        } else {
          console.warn('[nfts] Skipped one metadata pin:', result.reason?.message)
        }
      }
    }

    console.log(`[nfts] Returning ${nftRecords.length} NFTs from Pinata`)
    return res.status(200).json(nftRecords)
  } catch (err) {
    console.error('[nfts] Unexpected error:', err.message)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
