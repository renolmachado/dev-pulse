'use client';
import { ExternalLink } from 'lucide-react';

interface LinkIconProps {
  url: string;
}

export function LinkIcon({ url }: LinkIconProps) {
  // return null;
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };
  return (
    <button onClick={handleClick} className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-primary transition-colors hover:bg-primary/10">
      <span className="sm:inline">View Source</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </button>
  );
}

export default LinkIcon;
