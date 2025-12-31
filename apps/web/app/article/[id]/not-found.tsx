import { ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-br from-primary to-purple-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm hover:underline opacity-90 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News Feed
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <FileQuestion className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-3xl font-bold text-foreground">Article Not Found</h1>
          <p className="mb-6 text-lg text-muted-foreground">
            The article you're looking for doesn't exist or has been removed.
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
