import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <article>
          {/* Image Skeleton */}
          <Skeleton className="mb-8 h-[400px] w-full rounded-lg" />

          {/* Title Skeleton */}
          <Skeleton className="mb-2 h-10 w-full" />
          <Skeleton className="mb-4 h-10 w-3/4" />

          {/* Metadata Skeleton */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>

          {/* Summary Skeleton */}
          <Card className="mb-6 border-l-4 border-l-primary bg-primary/5">
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>

          {/* Content Skeleton */}
          <div className="mb-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Button Skeleton */}
          <div className="mt-8 flex justify-center">
            <Skeleton className="h-12 w-64 rounded-lg" />
          </div>
        </article>
      </main>
    </div>
  );
}
