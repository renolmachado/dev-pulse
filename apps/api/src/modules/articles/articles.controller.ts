import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { ArticlesService } from './articles.service';
import type { GetArticlesResponseDto } from './articles.dto';
import type { Article, Category } from '@repo/database';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getArticles(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category') category?: Category,
  ): Promise<GetArticlesResponseDto> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    return this.articlesService.getArticles(pageNum, limitNum, category);
  }

  @Get('by-title/:title')
  async getArticleByTitle(@Param('title') title: string): Promise<Article> {
    const article = await this.articlesService.getArticleByTitle(title);

    if (article === null) {
      throw new NotFoundException(
        `Article with title "${decodeURIComponent(title)}" not found`,
      );
    }

    return article;
  }

  @Get(':id')
  async getArticleById(@Param('id') id: string): Promise<Article> {
    const article = await this.articlesService.getArticleById(id);

    if (article === null) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }
}
