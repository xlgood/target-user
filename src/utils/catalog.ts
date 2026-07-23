export type CatalogKey = 'accounts' | 'services'

export const catalogKeys: CatalogKey[] = ['accounts', 'services']

export const isCatalogKey = (value: unknown): value is CatalogKey =>
  typeof value === 'string' && catalogKeys.includes(value as CatalogKey)

export const catalogFromRoute = (value: unknown): CatalogKey | null => {
  const raw = Array.isArray(value) ? value[0] : value
  return isCatalogKey(raw) ? raw : null
}

export const catalogPath = (catalog: CatalogKey, categorySlug?: string) => {
  const suffix = categorySlug ? `/categories/${encodeURIComponent(categorySlug)}` : ''
  return `/${catalog}${suffix}`
}

const knownPlatforms = new Set([
  'facebook', 'instagram', 'tiktok', 'youtube', 'x', 'vk', 'spotify', 'discord', 'twitch', 'reddit',
  'linkedin', 'github', 'quora', 'whatsapp', 'line-voom', 'threads', 'gmail', 'outlook', 'hotmail', 'overseas-email',
])

// Imported catalog categories have a local SVG cover. Fall back to that cover
// for categories created before the icon field was populated.
export const categoryImagePath = (category: { icon?: string | null; slug?: string } | undefined | null) => {
  const icon = String(category?.icon || '').trim()
  if (icon) return icon
  const platform = String(category?.slug || '').trim().toLowerCase().replace(/^platform-/, '')
  return `/uploads/catalog/${knownPlatforms.has(platform) ? platform : 'social'}.svg`
}
