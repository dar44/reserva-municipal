import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/worker/', '/organizer/', '/(citizen)/'],
    },
    sitemap: 'https://dar44.netlify.app/sitemap.xml',
  }
}
