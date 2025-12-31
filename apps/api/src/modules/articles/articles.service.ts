import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { GetArticlesResponseDto } from './articles.dto';
import type { Article } from '@repo/database';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticles(
    page: number,
    limit: number,
  ): Promise<GetArticlesResponseDto> {
    const [articles, total] = await Promise.all([
      this.prisma.client.article.findMany({
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prisma.client.article.count(),
    ]);

    return {
      articles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getArticleById(id: string): Promise<Article | null> {
    return this.prisma.client.article.findUnique({
      where: { id },
    });
  }

  async getArticleByTitle(title: string): Promise<Article | null> {
    const decodedTitle = decodeURIComponent(title);

    return this.prisma.client.article.findFirst({
      where: {
        title: {
          equals: decodedTitle,
          mode: 'insensitive',
        },
      },
    });
  }
}
