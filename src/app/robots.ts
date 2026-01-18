import { MetadataRoute } from 'next'

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezstampify.lchiki-lab.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/server/', '/_next/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
