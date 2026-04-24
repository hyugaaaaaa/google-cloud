import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/mock-exam/', '/category/', '/bookmarks/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
