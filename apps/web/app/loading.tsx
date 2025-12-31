import { ArticleCardSkeleton } from '@/components/article-card-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-gradient-to-br from-primary to-purple-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6 text-center md:py-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">News Pulse</h1>
          <p className="mt-2 text-sm opacity-90 md:text-base">Loading your daily news...</p>
        </div>
      </header>

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
