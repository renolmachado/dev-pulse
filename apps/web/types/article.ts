export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Article {
  id: string;
  author: string | null;
  content: string | null;
  description: string | null;
  publishedAt: string;
  title: string | null;
  url: string;
  urlToImage: string | null;
  status: ProcessingStatus;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}
