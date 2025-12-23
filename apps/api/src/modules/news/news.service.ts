import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import type { Article } from '@repo/database';
import type { Prisma } from '@repo/database/generated/prisma/client';

import { PrismaService } from '../utils/prisma.service';

interface NewsAPIArticle {
  author: string | null;
  content: string | null;
  description: string | null;
  publishedAt: string;
  title: string | null;
  url: string;
  urlToImage: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

@Injectable()
export class NewsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async getNews(): Promise<Article[]> {
    try {
      const params = new URLSearchParams();
      // params.append('from', '2025-12-21');
      // params.append('to', '2025-12-21');
      params.append('sortBy', 'publishedAt');
      params.append('apiKey', process.env.NEWS_API_API_KEY ?? '');
      params.append('q', ',');
      params.append('language', 'en');
      params.append('language', 'es');
      params.append('language', 'pt');
      params.append('page', '2');

      // params.append('category', 'business');

      const response = await this.httpService.axiosRef.get<NewsAPIResponse>(
        `https://newsapi.org/v2/everything?${params.toString()}`,
      );

      const articlesData: Prisma.ArticleCreateManyInput[] =
        response.data.articles.map((article) => ({
          author: article.author,
          content: article.content,
          description: article.description,
          publishedAt: new Date(article.publishedAt),
          title: article.title ?? 'No title',
          url: article.url,
          urlToImage: article.urlToImage,
        }));

      await this.prismaService.client.article.createMany({
        data: articlesData,
        skipDuplicates: true,
      });

      const urls = articlesData.map((a) => a.url);

      return this.prismaService.client.article.findMany({
        where: {
          url: {
            in: urls,
          },
        },
      });
    } catch (error) {
      // TODO Send error to Sentry
      console.error(error);
      throw error;
    }
  }
}
