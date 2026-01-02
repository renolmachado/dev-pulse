import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma, PrismaClient } from '@repo/database';

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

  get article() {
    return this.client.article;
  }

  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }

  get $connect() {
    return this.client.$connect.bind(this.client);
  }

  get $disconnect() {
    return this.client.$disconnect.bind(this.client);
  }
}
