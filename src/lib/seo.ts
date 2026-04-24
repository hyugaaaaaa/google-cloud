const DEFAULT_DEV_SITE_URL = 'http://localhost:3000'

function normalizeBaseUrl(raw: string): string {
  if (!raw) return DEFAULT_DEV_SITE_URL
  const trimmed = raw.trim()
  if (!trimmed) return DEFAULT_DEV_SITE_URL

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  return `https://${trimmed}`
}

export function getSiteUrl(): string {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envSiteUrl && envSiteUrl.trim()) {
    return normalizeBaseUrl(envSiteUrl)
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl && vercelUrl.trim()) {
    return normalizeBaseUrl(vercelUrl)
  }

  return DEFAULT_DEV_SITE_URL
}

export function toAbsoluteUrl(pathname: string): string {
  const base = getSiteUrl().replace(/\/+$/, '')
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${path}`
}

// Update this date when major SEO content changes.
export const SEO_LAST_MODIFIED = new Date('2026-04-24T00:00:00.000Z')
