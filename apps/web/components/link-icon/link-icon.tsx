'use client';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkIconProps {
  url: string;
  hiddenOnMobile?: boolean;
}

export function LinkIcon({ url, hiddenOnMobile = true }: LinkIconProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <button aria-label="View source" onClick={handleClick} className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-primary transition-colors hover:bg-primary/10">
      <span className={cn(hiddenOnMobile ? 'hidden sm:inline' : '')}>View Source</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </button>
  );
}

export default LinkIcon;
