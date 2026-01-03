import { useEffect, useRef, useState, useCallback } from 'react';
import type { Article, Category } from '@/types/article';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface UseLoadMoreArticlesProps {
  initialPage: number;
  initialTotalPages: number;
  category: Category | undefined;
}

export const useLoadMoreArticles = ({ initialPage, initialTotalPages, category }: UseLoadMoreArticlesProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPage < initialTotalPages);

  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreArticles = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: '20',
      });

      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();

      setArticles((prev) => [...prev, ...data.articles]);
      setPage(data.page);
      setHasMore(data.page < data.totalPages);
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, category]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMoreArticles();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreArticles, hasMore, isLoading]);

  return { articles, page, isLoading, hasMore, observerTarget };
};
