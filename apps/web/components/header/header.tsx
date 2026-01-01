'use client';

import { ArrowLeft, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../theme';

interface HeaderProps {
  showBackButton?: boolean;
  articleCount?: number;
}

export function Header({ showBackButton = false, articleCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">News Pulse</h1>
                {articleCount !== undefined && <p className="text-xs text-muted-foreground">{articleCount} articles</p>}
              </div>
            </Link>
            {showBackButton && (
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Feed</span>
              </Link>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
