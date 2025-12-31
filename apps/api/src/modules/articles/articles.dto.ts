import type { Article } from '@repo/database';

export type GetArticlesResponseDto = {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
};
