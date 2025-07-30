import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const bodyParserOptions = { limit: '10mb' };
  app.use(express.json(bodyParserOptions));
  app.use(express.urlencoded({ ...bodyParserOptions, extended: true }));
  app.use(express.raw(bodyParserOptions));
  app.use(express.text(bodyParserOptions));


  app.enableCors({
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length'],
  });


  app.use((req, res, next) => {
    const timeoutMs = 5 * 60 * 1000;
    req.setTimeout(timeoutMs);
    res.setTimeout(timeoutMs);
    next();
  });

 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
    }),
  );

  
  await app.startAllMicroservices();

 
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
