/**
 * Builds an ERC-721 / ERC-1155 compatible NFT metadata JSON object.
 * Price is embedded inside the metadata — never stored separately.
 *
 * Compatible with: OpenSea, Thirdweb, Alchemy, Rarible metadata standards.
 */

/**
 * @param {Object} params
 * @param {string} params.name         - Display name of the NFT
 * @param {string} params.description  - Description text
 * @param {string} params.imageHash    - IPFS CID of the uploaded image
 * @param {string} params.category     - Category label (Art, Music, etc.)
 * @param {string|number} params.price - Price value in ETH (e.g. "0.05")
 * @returns {Object} NFT metadata JSON
 */
export function buildMetadata({ name, description, imageHash, category, price }) {
  const priceValue = parseFloat(price)

  if (isNaN(priceValue) || priceValue <= 0) {
    throw new Error('Invalid price: must be a positive number')
  }

  return {
    // Core fields (ERC-721 standard)
    name:        name?.trim() || 'NFT Artwork',
    description: description?.trim() || 'Uploaded from NFT Artworks app',
    image:       `ipfs://${imageHash}`,

    // Extended fields
    category,
    price: {
      value:    priceValue,
      currency: 'ETH',
    },
    created_at: new Date().toISOString(),

    // OpenSea / marketplace attributes array
    attributes: [
      { trait_type: 'Category', value: category },
      { trait_type: 'Price (ETH)', value: priceValue },
    ],
  }
}
