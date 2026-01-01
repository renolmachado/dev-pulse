'use client';

import { ArticleCard } from '@/components/article-card/article-card';
import { ArticleCardSkeleton } from '@/components/article-card/article-card-skeleton';
import { useLoadMoreArticles } from './use-load-more-articles';

interface LoadMoreArticlesProps {
  initialPage: number;
  initialTotalPages: number;
  initialTotal: number;
}

export function LoadMoreArticles({ initialPage, initialTotalPages, initialTotal }: LoadMoreArticlesProps) {
  const { articles, isLoading, hasMore, observerTarget } = useLoadMoreArticles({ initialPage, initialTotalPages });

  return (
    <>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {hasMore && (
        <div ref={observerTarget} className="grid gap-4 md:gap-5">
          {isLoading && (
            <>
              <ArticleCardSkeleton />
              <ArticleCardSkeleton />
              <ArticleCardSkeleton />
            </>
          )}
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;ve reached the end! ({articles.length + initialPage * 20} of {initialTotal} articles)
          </p>
        </div>
      )}
    </>
  );
}
