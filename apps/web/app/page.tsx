import { ArticleCard } from '@/components/article-card';
import { fetchArticles } from '@/lib/api';

export default async function Home() {
  const { articles, total, page, totalPages } = await fetchArticles(1, 20);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-gradient-to-br from-primary to-purple-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6 text-center md:py-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">News Pulse</h1>
          <p className="mt-2 text-sm opacity-90 md:text-base">Your daily dose of news • {total} articles</p>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-4 md:py-6">
        <div className="grid gap-4 md:gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}

          {articles.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-center text-base text-muted-foreground">No articles available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </main>

      {totalPages > 1 && (
        <footer className="border-t py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
        </footer>
      )}
    </div>
  );
}
