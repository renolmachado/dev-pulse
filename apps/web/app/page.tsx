import { ArticleCard } from '@/components/article-card/article-card';
import { Header } from '@/components/header';
import { fetchArticles } from '@/lib/api';

export default async function Home() {
  const { articles, total, page, totalPages } = await fetchArticles(1, 20);

  return (
    <div className="min-h-screen bg-background">
      <Header articleCount={total} />

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
