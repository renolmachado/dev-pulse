import { ArticleCardSkeleton } from '@/components/article-card/article-card-skeleton';
import { Header } from '@/components/header';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-4 md:py-6">
        <div className="grid gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
