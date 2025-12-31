'use client';
import { ExternalLink } from 'lucide-react';

interface LinkIconProps {
  url: string;
}

export function LinkIcon({ url }: LinkIconProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-primary transition-colors hover:bg-primary/10">
      <span className="hidden sm:inline">View Source</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export default LinkIcon;
