import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Prisma } from '@repo/database';

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
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectQueue('news-processing') private newsQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async fetchNews() {
    try {
      this.logger.log('Fetching news...');

      const params = new URLSearchParams();
      params.append('sortBy', 'publishedAt');
      params.append('apiKey', process.env.NEWS_API_API_KEY ?? '');
      params.append('q', ',');
      params.append('language', 'en');
      params.append('language', 'es');
      params.append('language', 'pt');
      params.append('page', '2');

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

      await this.newsQueue.add('process-news', articlesData, {
        attempts: 3,
        backoff: 5000,
        removeOnComplete: true,
      });
    } catch (error) {
      // TODO Send error to Sentry
      this.logger.error(error);
      throw error;
    }
  }
}
