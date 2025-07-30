// Setup para testes e2e
import { Logger } from '@nestjs/common';

// Suprimir logs do console durante os testes
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Suprimir logs do Prisma durante os testes
  console.log = (message?: any, ...optionalParams: any[]) => {
    if (typeof message === 'string' && message.includes('prisma:')) {
      return;
    }
    originalConsoleLog(message, ...optionalParams);
  };

  console.error = (message?: any, ...optionalParams: any[]) => {
    if (typeof message === 'string' && message.includes('prisma:')) {
      return;
    }
    originalConsoleError(message, ...optionalParams);
  };

  // Suprimir logs do NestJS durante os testes
  Logger.overrideLogger(false);
});

afterAll(() => {
  // Restaurar logs originais
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  Logger.overrideLogger(true);
}); 