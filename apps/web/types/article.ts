export enum Category {
  LIFESTYLE_WELLNESS = 'LIFESTYLE_WELLNESS',
  TECHNOLOGY_INNOVATION = 'TECHNOLOGY_INNOVATION',
  SOFTWARE_ENGINEERING_DEVELOPMENT = 'SOFTWARE_ENGINEERING_DEVELOPMENT',
  BUSINESS_FINANCE = 'BUSINESS_FINANCE',
  ARTS_ENTERTAINMENT = 'ARTS_ENTERTAINMENT',
  NEWS_SOCIETY = 'NEWS_SOCIETY',
  SCIENCE_NATURE = 'SCIENCE_NATURE',
  POLITICS_GOVERNMENT = 'POLITICS_GOVERNMENT',
  SPORTS_RECREATION = 'SPORTS_RECREATION',
  EDUCATION_CAREER = 'EDUCATION_CAREER',
  HEALTH_MEDICINE = 'HEALTH_MEDICINE',
}

export enum Language {
  EN = 'EN',
  ES = 'ES',
  PT = 'PT',
}

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
  keywords: string[];
  category: Category;
  language: Language;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}
