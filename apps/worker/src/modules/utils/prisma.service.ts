import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '@repo/database';
import type { PrismaClient } from '@repo/database/generated/prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Use the singleton prisma instance from the database package
  public readonly client: PrismaClient = prisma as unknown as PrismaClient;

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
