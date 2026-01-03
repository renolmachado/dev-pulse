import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { GetArticlesResponseDto } from './articles.dto';
import { Article, Category } from '@repo/database';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticles(
    page: number,
    limit: number,
    category?: Category,
  ): Promise<GetArticlesResponseDto> {
    const where = category ? { category } : {};
    const [articles, total] = await Promise.all([
      this.prisma.client.article.findMany({
        where,
        orderBy: [
          {
            publishedAt: 'desc',
          },
          {
            title: 'desc',
          },
        ],
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prisma.client.article.count({ where }),
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
