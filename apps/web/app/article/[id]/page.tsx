import { fetchArticleById } from '@/lib/api';
import { Clock, User, ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const article = await fetchArticleById(id);
    return {
      title: article.title || 'Article Details',
      description: article.summary || article.description || 'Read the full article',
    };
  } catch {
    return {
      title: 'Article Not Found',
    };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  let article;

  try {
    article = await fetchArticleById(id);
  } catch {
    notFound();
  }

  if (!article) {
    notFound();
  }

  const formattedDate = Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(article.publishedAt));

  const formattedTime = Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(article.publishedAt));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-br from-primary to-purple-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm hover:underline opacity-90 hover:opacity-100 transition-opacity">
            <ArrowLeft className="h-4 w-4" />
            Back to News Feed
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <article>
          {/* Article Image */}
          {article.urlToImage && (
            <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-lg bg-muted">
              <Image src={article.urlToImage} alt={article.title || 'Article image'} fill className="object-cover" sizes="(max-width: 1200px) 100vw, 1200px" priority />
            </div>
          )}

          {/* Article Title */}
          <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl">{article.title || 'Untitled'}</h1>

          {/* Article Metadata */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {article.author && (
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="font-medium">{article.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <time dateTime={article.publishedAt}>
                {formattedDate} • {formattedTime}
              </time>
            </div>
          </div>

          {/* Article Summary */}
          {article.summary && (
            <Card className="mb-6 border-l-4 border-l-primary bg-primary/5">
              <CardContent className="p-4">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Summary</h2>
                <p className="text-base leading-relaxed text-foreground">{article.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Article Description */}
          {article.description && !article.summary && (
            <div className="mb-6">
              <p className="text-lg leading-relaxed text-muted-foreground">{article.description}</p>
            </div>
          )}

          {/* Article Content */}
          {article.content && (
            <div className="mb-8 prose prose-slate max-w-none">
              <h2 className="text-xl font-semibold mb-4">Full Content</h2>
              <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">{article.content}</div>
            </div>
          )}

          {/* Read Original Article Link */}
          <div className="mt-8 flex justify-center">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg">
              Read Original Article
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </article>

        {/* Additional Info */}
        {article.description && article.summary && (
          <Card className="mt-8 bg-muted/50">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Original Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{article.description}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
