import { fetchArticleByTitle } from '@/lib/api';
import { Clock, User, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import LinkIcon from '@/components/link-icon/link-icon';

interface ArticlePageProps {
  params: Promise<{
    title: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const { title } = await params;
    const decodedTitle = decodeURIComponent(title);
    const article = await fetchArticleByTitle(decodedTitle);
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
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);
  let article;

  try {
    article = await fetchArticleByTitle(decodedTitle);
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
      <Header showBackButton />

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
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Summary</h2>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Generated</span>
                  </div>
                </div>
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
            <LinkIcon url={article.url} />
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
