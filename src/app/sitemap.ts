import { MetadataRoute } from 'next'
import { SEO_LAST_MODIFIED, getSiteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()

  return [
    {
      url: `${siteUrl}`,
      lastModified: SEO_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          'ja-JP': `${siteUrl}`,
        },
      },
    },
    {
      url: `${siteUrl}/what-is-google-cloud-cdl`,
      lastModified: SEO_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          'ja-JP': `${siteUrl}/what-is-google-cloud-cdl`,
        },
      },
    },
    {
      url: `${siteUrl}/study-guide`,
      lastModified: SEO_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          'ja-JP': `${siteUrl}/study-guide`,
        },
      },
    },
    {
      url: `${siteUrl}/exam-tips`,
      lastModified: SEO_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          'ja-JP': `${siteUrl}/exam-tips`,
        },
      },
    },
    {
      url: `${siteUrl}/category-explanations`,
      lastModified: SEO_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          'ja-JP': `${siteUrl}/category-explanations`,
        },
      },
    },
  ]
}
