import { ArticleCard } from '@/components/article-card/article-card';
import { Header } from '@/components/header';
import { LoadMoreArticles } from '@/components/article-list';
import { fetchArticles } from '@/lib/api';
import { Category } from '@/types/article';

interface HomeProps {
  searchParams: Promise<{
    category?: Category;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const { articles, total, page, totalPages } = await fetchArticles(1, 20, params.category);

  return (
    <div className="min-h-screen bg-background">
      <Header articleCount={total} />

      <main className="container mx-auto max-w-4xl px-4 py-4 md:py-6">
        <div className="grid gap-4 md:gap-5">
          {articles.map((article, index) => (
            <ArticleCard key={article.id} article={article} priority={index < 2} />
          ))}

          {articles.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-center text-base text-muted-foreground">No articles available yet. Check back soon!</p>
            </div>
          )}

          {articles.length > 0 && <LoadMoreArticles initialPage={page} initialTotalPages={totalPages} initialTotal={total} />}
        </div>
      </main>
    </div>
  );
}
