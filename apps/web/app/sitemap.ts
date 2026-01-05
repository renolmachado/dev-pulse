import type { MetadataRoute } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

interface Article {
  id: string;
  title: string | null;
  publishedAt: string;
  updatedAt: string;
  url: string;
}

async function getAllArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles?limit=10000`, {
      next: { revalidate: 1 * 60 * 60 },
    });

    if (!response.ok) {
      console.error('Failed to fetch articles for sitemap:', response.status);
      return [];
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = articles
    .filter((article) => article.title)
    .map((article) => ({
      url: `${SITE_URL}/article/${encodeURIComponent(article.title!)}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...articlePages];
}
