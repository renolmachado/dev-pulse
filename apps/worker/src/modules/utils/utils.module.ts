import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AiService } from './ai.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, AiService],
  exports: [PrismaService, AiService],
})
export class UtilsModule {}
