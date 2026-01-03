import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, User, Sparkles, Hash, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/types/article';
import LinkIcon from '../link-icon/link-icon';

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
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

  const formattedCategory = article.category
    ? article.category
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : 'Unknown';

  return (
    <Link href={articleUrl} className="grid">
      <Card className="group cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" role="button" tabIndex={0}>
        {article.urlToImage && (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <Image
              src={article.urlToImage}
              alt={article.title || 'Article image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              priority={priority}
              loading={priority ? undefined : 'lazy'}
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="line-clamp-3 text-lg font-semibold leading-tight text-foreground">{article.title || 'Untitled'}</h2>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Tag className="h-3 w-3" />
                {formattedCategory}
              </span>
            </div>
          </div>

          {article.summary && (
            <div className="mb-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">AI Summary</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{article.summary}</p>
            </div>
          )}

          {article.description && (
            <div>
              {article.summary && <p className="mb-1 text-xs font-medium text-muted-foreground">Original Description</p>}
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.description}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3 min-w-0 w-full">
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
          </div>

          <LinkIcon url={article.url} />
        </CardFooter>
      </Card>
    </Link>
  );
}
