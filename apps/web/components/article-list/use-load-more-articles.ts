import { useEffect, useRef, useState, useCallback } from 'react';
import type { Article } from '@/types/article';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface UseLoadMoreArticlesProps {
  initialPage: number;
  initialTotalPages: number;
}

export const useLoadMoreArticles = ({ initialPage, initialTotalPages }: UseLoadMoreArticlesProps) => {
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
      const response = await fetch(`${API_BASE_URL}/articles?page=${nextPage}&limit=20`);

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
  }, [page, isLoading, hasMore]);

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
