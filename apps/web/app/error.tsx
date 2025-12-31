'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-gradient-to-br from-primary to-purple-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6 text-center md:py-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">News Pulse</h1>
          <p className="mt-2 text-sm opacity-90 md:text-base">Something went wrong</p>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-4 md:py-6">
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
          <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
          <h2 className="mb-3 text-2xl font-semibold">Oops! Failed to load articles</h2>
          <p className="mb-6 max-w-md text-muted-foreground">{error.message || 'An unexpected error occurred'}</p>
          <Button onClick={reset} size="lg">
            Try Again
          </Button>
        </div>
      </main>
    </div>
  );
}
