export interface PrismaConfig {
  connectionPool: {
    max: number;
    min: number;
    acquireTimeoutMs: number;
    createTimeoutMs: number;
    destroyTimeoutMs: number;
    idleTimeoutMs: number;
    reapIntervalMs: number;
    createRetryIntervalMs: number;
  };

  timeouts: {
    query: number;
    transaction: number;
    connection: number;
  };

  retry: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };

  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    logQueries: boolean;
    logSlowQueries: boolean;
    slowQueryThreshold: number;
  };
}

export const defaultPrismaConfig: PrismaConfig = {
  connectionPool: {
    max: 10,
    min: 2,
    acquireTimeoutMs: 60000,
    createTimeoutMs: 30000,
    destroyTimeoutMs: 5000,
    idleTimeoutMs: 30000,
    reapIntervalMs: 1000,
    createRetryIntervalMs: 200,
  },

  timeouts: {
    query: 30000,
    transaction: 60000,
    connection: 10000,
  },

  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
  },

  logging: {
    enabled: process.env.NODE_ENV === 'development',
    level: 'info',
    logQueries: process.env.NODE_ENV === 'development',
    logSlowQueries: true,
    slowQueryThreshold: 2000,
  },
};

export const productionPrismaConfig: PrismaConfig = {
  ...defaultPrismaConfig,
  connectionPool: {
    ...defaultPrismaConfig.connectionPool,
    max: 20,
    min: 5,
  },
  logging: {
    ...defaultPrismaConfig.logging,
    enabled: true,
    level: 'warn',
    logQueries: false,
    logSlowQueries: true,
    slowQueryThreshold: 1000,
  },
};

export const developmentPrismaConfig: PrismaConfig = {
  ...defaultPrismaConfig,
  connectionPool: {
    ...defaultPrismaConfig.connectionPool,
    max: 5,
    min: 1,
  },
  logging: {
    ...defaultPrismaConfig.logging,
    enabled: true,
    level: 'debug',
    logQueries: true,
    logSlowQueries: true,
    slowQueryThreshold: 500,
  },
};

export function getPrismaConfig(): PrismaConfig {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return productionPrismaConfig;
    case 'development':
      return developmentPrismaConfig;
    default:
      return defaultPrismaConfig;
  }
}
