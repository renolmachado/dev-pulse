import { Injectable, Logger } from '@nestjs/common';
import { Article, ProcessingStatus } from '@repo/database';

import { AiService } from '../utils/ai.service';
import { PrismaService } from '../utils/prisma.service';

@Injectable()
export class NewsProcessorService {
  private readonly logger = new Logger(NewsProcessorService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly prismaService: PrismaService,
  ) {}

  public async processNews(articles: Article[]): Promise<void> {
    const articlesInDatabase = await this.prismaService.client.article.findMany(
      {
        where: {
          url: {
            in: articles.map((article) => article.url ?? ''),
          },
        },
      },
    );

    const newArticles = articles.filter(
      (article) => !articlesInDatabase.some((a) => a.url === article.url),
    );

    const articlesToSave: Article[] = [];
    for (const article of newArticles) {
      await this.summarizeArticle(article, articlesToSave);
      // sleep for 5 second to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    await this.prismaService.client.article.createMany({
      data: articlesToSave,
    });
  }

  private async summarizeArticle(article: Article, articlesToSave: Article[]) {
    try {
      const metadata = await this.aiService.generateMetadata(article);

      articlesToSave.push({
        ...article,
        summary: metadata?.summary ?? null,
        category: metadata?.category ?? null,
        language: metadata?.language ?? article.language,
        keywords: metadata?.keywords ?? [],
        status: metadata ? ProcessingStatus.COMPLETED : ProcessingStatus.FAILED,
      });
    } catch (error) {
      this.logger.error(
        `Error generating metadata for article ${article.url}:`,
        error,
      );
    }
  }
}
