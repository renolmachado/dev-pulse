import { Controller, Get, Query } from '@nestjs/common';

import { ArticlesService } from './articles.service';
import type { GetArticlesResponseDto } from './articles.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getArticles(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<GetArticlesResponseDto> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    return this.articlesService.getArticles(pageNum, limitNum);
  }
}
