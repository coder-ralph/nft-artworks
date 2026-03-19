const STORAGE_KEY = 'nft-artworks-v1'

/**
 * Load persisted NFTs from localStorage.
 * @returns {Array} Array of NFT record objects
 */
export function loadNFTs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.warn('[storage] Failed to load NFTs:', err)
    return []
  }
}

/**
 * Persist an NFT record to localStorage.
 * @param {Object} nft - NFT record to prepend
 */
export function saveNFT(nft) {
  try {
    const existing = loadNFTs()
    // Prepend newest first; deduplicate by id
    const deduped = [nft, ...existing.filter((n) => n.id !== nft.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped))
  } catch (err) {
    console.warn('[storage] Failed to save NFT:', err)
  }
}

/**
 * Replace the entire NFT list in localStorage.
 * @param {Array} nfts
 */
export function saveAllNFTs(nfts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nfts))
  } catch (err) {
    console.warn('[storage] Failed to save all NFTs:', err)
  }
}

/**
 * Remove all stored NFTs.
 */
export function clearNFTs() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Load dark/light mode preference.
 * @returns {'dark'|'light'}
 */
export function loadTheme() {
  try {
    return localStorage.getItem('nft-theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/**
 * Persist dark/light mode preference.
 * @param {'dark'|'light'} theme
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem('nft-theme', theme)
  } catch {
    // ignore
  }
}
