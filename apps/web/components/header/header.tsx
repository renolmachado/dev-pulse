'use client';

import { ArrowLeft, Newspaper, Filter } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../theme';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types/article';

interface HeaderProps {
  showBackButton?: boolean;
  articleCount?: number;
}

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: Category.LIFESTYLE_WELLNESS, label: 'Lifestyle & Wellness' },
  { value: Category.TECHNOLOGY_INNOVATION, label: 'Technology & Innovation' },
  { value: Category.SOFTWARE_ENGINEERING_DEVELOPMENT, label: 'Software Engineering' },
  { value: Category.BUSINESS_FINANCE, label: 'Business & Finance' },
  { value: Category.ARTS_ENTERTAINMENT, label: 'Arts & Entertainment' },
  { value: Category.NEWS_SOCIETY, label: 'News & Society' },
  { value: Category.SCIENCE_NATURE, label: 'Science & Nature' },
  { value: Category.POLITICS_GOVERNMENT, label: 'Politics & Government' },
  { value: Category.SPORTS_RECREATION, label: 'Sports & Recreation' },
  { value: Category.EDUCATION_CAREER, label: 'Education & Career' },
  { value: Category.HEALTH_MEDICINE, label: 'Health & Medicine' },
];

export function Header({ showBackButton = false, articleCount }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const category = event.target.value;
    if (category) {
      router.push(`/?category=${category}`);
    } else {
      router.push('/');
    }
  };

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
                  className="h-9 appearance-none rounded-md border border-input bg-background pl-9 pr-8 text-sm text-foreground transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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
