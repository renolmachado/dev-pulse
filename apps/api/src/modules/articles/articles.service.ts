import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { GetArticlesResponseDto } from './articles.dto';

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
}
