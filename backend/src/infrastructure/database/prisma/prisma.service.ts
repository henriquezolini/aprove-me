import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private connectionRetries = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.gracefulShutdown();
  }

  private async connectWithRetry(): Promise<void> {
    try {
      await this.$connect();
      this.isConnected = true;
      this.connectionRetries = 0;
    } catch (error) {
      this.isConnected = false;
      this.connectionRetries++;

      if (this.connectionRetries < this.maxRetries) {
        await this.sleep(this.retryDelay);
        return this.connectWithRetry();
      } else {
        throw error;
      }
    }
  }

  private async gracefulShutdown(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.$disconnect();
        this.isConnected = false;
      } catch (error) {}
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  async reconnect(): Promise<void> {
    if (!this.isConnected) {
      await this.connectWithRetry();
    }
  }

  async clearConnectionPool(): Promise<void> {
    try {
      await this.$disconnect();
      await this.$connect();
    } catch (error) {
      throw error;
    }
  }
}
