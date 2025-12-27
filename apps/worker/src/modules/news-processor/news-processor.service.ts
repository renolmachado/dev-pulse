import { Injectable } from '@nestjs/common';
import { Article } from '@repo/database';

import { AiService } from '../utils/ai.service';
import { PrismaService } from '../utils/prisma.service';

@Injectable()
export class NewsProcessorService {
  constructor(
    private readonly aiService: AiService,
    private readonly prismaService: PrismaService,
  ) {}

  public async processNews(_articles: Article[]): Promise<void> {}
}
