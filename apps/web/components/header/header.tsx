'use client';

import { Suspense } from 'react';
import { ArrowLeft, Newspaper, Filter } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../theme';
import { useHeader } from './useHeader';

interface HeaderProps {
  showBackButton?: boolean;
  articleCount?: number;
}

function HeaderContent({ showBackButton = false, articleCount }: HeaderProps) {
  const { currentCategory, handleCategoryChange, categoryOptions, isPending } = useHeader();

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
          <div className="flex items-center gap-3">
            {!showBackButton && (
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={currentCategory}
                  onChange={handleCategoryChange}
                  disabled={isPending}
                  className="h-9 appearance-none rounded-md border border-input bg-background pl-9 pr-8 text-sm text-foreground transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-wait disabled:opacity-60">
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {isPending ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<div className="h-16 border-b bg-background/95" />}>
      <HeaderContent {...props} />
    </Suspense>
  );
}
