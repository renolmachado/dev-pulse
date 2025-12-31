import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/types/article';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(article.publishedAt));

  const formattedTime = Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(article.publishedAt));

  // Create URL-friendly title
  const articleUrl = article.title ? `/article/${encodeURIComponent(article.title)}` : `/article/${article.id}`;

  return (
    <Link href={articleUrl} className="block">
      <Card className="group cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" role="button" tabIndex={0}>
        {article.urlToImage && (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <Image
              src={article.urlToImage}
              alt={article.title || 'Article image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            />
          </div>
        )}

        <CardContent className="p-4">
          <h2 className="mb-3 line-clamp-3 text-lg font-semibold leading-tight text-foreground">{article.title || 'Untitled'}</h2>

          {(article.summary || article.description) && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.summary || article.description}</p>}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          {article.author && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate font-medium">{article.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="h-3.5 w-3.5" />
            <time dateTime={article.publishedAt}>
              {formattedDate} • {formattedTime}
            </time>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
