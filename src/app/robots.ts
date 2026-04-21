import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/mock-exam/', '/category/', '/bookmarks/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
