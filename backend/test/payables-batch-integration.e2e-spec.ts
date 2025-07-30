import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('PayablesController (batch) - Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Obter token através da rota de login
    const authResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({
        login: 'aprovame',
        password: 'aprovame'
      });
    
    accessToken = authResponse.body.access_token;
  });

  beforeEach(async () => {

    await prismaService.payable.deleteMany({});
    await prismaService.assignor.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /integrations/payable/batch', () => {
    it('deve criar lote de payables com sucesso', async () => {

      const assignor1 = await prismaService.assignor.create({
        data: {
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '11999999999',
          document: '12345678901',
        },
      });

      const assignor2 = await prismaService.assignor.create({
        data: {
          name: 'Maria Santos',
          email: 'maria@example.com',
          phone: '11888888888',
          document: '98765432101',
        },
      });

      const batchData = {
        payables: [
          {
            value: 100.50,
            emissionDate: '2024-01-01',
            assignor: assignor1.id,
          },
          {
            value: 200.75,
            emissionDate: '2024-01-02',
            assignor: assignor2.id,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/integrations/payable/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(batchData)
        .expect(201);

      expect(response.body).toHaveProperty('batchId');
      expect(response.body).toHaveProperty('totalPayables', 2);
      expect(response.body).toHaveProperty('status', 'queued');
      expect(response.body).toHaveProperty('message', 'Lote foi enfileirado para processamento');
    });

    it('deve rejeitar lote com assignor inexistente', async () => {
      const batchData = {
        payables: [
          {
            value: 100.50,
            emissionDate: '2024-01-01',
            assignor: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/integrations/payable/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(batchData)
        .expect(400);

      expect(response.body.message).toContain('Alguns cedentes não existem');
    });

    it('deve rejeitar lote vazio', async () => {
      const batchData = {
        payables: [],
      };

      const response = await request(app.getHttpServer())
        .post('/integrations/payable/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(batchData)
        .expect(400);

      expect(response.body.message).toContain('Pelo menos um payable é necessário');
    });

    it('deve rejeitar lote com payables inválidos', async () => {
      const batchData = {
        payables: [
          {
            value: -100,
            emissionDate: '2024-01-01',
            assignor: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/integrations/payable/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(batchData)
        .expect(400);

      expect(response.body.message).toContain('O valor do payable deve ser positivo');
    });

    it('deve rejeitar lote com data de emissão futura', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const assignor = await prismaService.assignor.create({
        data: {
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '11999999999',
          document: '12345678901',
        },
      });

      const batchData = {
        payables: [
          {
            value: 100.50,
            emissionDate: futureDate.toISOString(),
            assignor: assignor.id,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/integrations/payable/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(batchData)
        .expect(400);

      expect(response.body.message).toContain('A data de emissão não pode estar no futuro');
    });

    it('deve rejeitar acesso sem token', async () => {
      const batchData = {
        payables: [
          {
            value: 100.50,
            emissionDate: '2024-01-01',
            assignor: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/integrations/payable/batch')
        .send(batchData)
        .expect(401);
    });
  });
}); 