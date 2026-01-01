import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <FileQuestion className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-3xl font-bold text-foreground">Article Not Found</h1>
          <p className="mb-6 text-lg text-muted-foreground">
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to News Feed
          </Link>
        </div>
      </main>
    </div>
  );
}
