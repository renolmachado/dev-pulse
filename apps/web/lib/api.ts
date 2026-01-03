import type { Article, ArticlesResponse, Category } from '../types/article';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchArticles(page: number = 1, limit: number = 20, category?: Category): Promise<ArticlesResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category) {
      params.append('category', category);
    }

    const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
    }

    const data: ArticlesResponse = await response.json();
    return data;
  } catch (error) {
    console.error(API_BASE_URL, 'API_BASE_URL');
    console.error('Error fetching articles:', error);
    throw new Error(error instanceof Error ? error.message : 'Unable to load articles. Please check your connection and try again.');
  }
}

export async function fetchArticleById(id: string): Promise<Article> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
    }

    const data: Article = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw new Error(error instanceof Error ? error.message : 'Unable to load article. Please check your connection and try again.');
  }
}

export async function fetchArticleByTitle(title: string): Promise<Article> {
  try {
    const encodedTitle = encodeURIComponent(title);

    const response = await fetch(`${API_BASE_URL}/articles/by-title/${encodedTitle}`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
    }

    const data: Article = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw new Error(error instanceof Error ? error.message : 'Unable to load article. Please check your connection and try again.');
  }
}
