import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { faker } from '@faker-js/faker';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Payables Integration (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let createdAssignorId: string | undefined;
  let createdPayableId: string | undefined;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
    
    const authResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({
        login: 'aprovame',
        password: 'aprovame'
      });
    
    authToken = authResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const authResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({
        login: 'aprovame',
        password: 'aprovame'
      });
    
    authToken = authResponse.body.access_token;
  });

  afterEach(async () => {
    if (createdPayableId) {
      try {
        await prisma.payable.delete({
          where: { id: createdPayableId },
        });
      } catch (error) {
      }
      createdPayableId = undefined;
    }

    if (createdAssignorId) {
      try {
        await prisma.assignor.delete({
          where: { id: createdAssignorId },
        });
      } catch (error) {
      }
      createdAssignorId = undefined;
    }
  });

  describe('POST /integrations/payable', () => {
    it('deve criar um payable no banco real com sucesso', async () => {
      const assignorData = {
        document: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        email: faker.internet.email(),
        phone: '11' + faker.string.numeric(9),
        name: faker.person.fullName(),
      };

      const assignorResponse = await request(app.getHttpServer())
        .post('/integrations/assignor')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assignorData)
        .expect(201);

      createdAssignorId = assignorResponse.body.id;
      
      const assignorInDb = await prisma.assignor.findUnique({
        where: { id: createdAssignorId },
      });
      
      expect(assignorInDb).toBeTruthy();
      expect(assignorInDb!.email).toBe(assignorData.email);

      const payableData = {
        value: faker.number.float({ min: 100, max: 10000, multipleOf: 0.01 }),
        emissionDate: faker.date.past({ years: 1 }).toISOString(),
        assignor: createdAssignorId,
      };

      const payableResponse = await request(app.getHttpServer())
        .post('/integrations/payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payableData)
        .expect(201);

      createdPayableId = payableResponse.body.id;

      expect(payableResponse.body).toMatchObject({
        id: expect.any(String),
        value: payableData.value,
        emissionDate: expect.any(String),
        assignorId: createdAssignorId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
      });

      const payableInDb = await prisma.payable.findUnique({
        where: { id: createdPayableId },
        include: { assignor: true },
      });

      expect(payableInDb).toBeTruthy();
      expect(payableInDb!.value).toBe(payableData.value);
      expect(payableInDb!.assignorId).toBe(createdAssignorId);
      expect(payableInDb!.assignor.email).toBe(assignorData.email);
      expect(new Date(payableInDb!.emissionDate).toISOString()).toBe(payableData.emissionDate);
    }, 10000);

    it('deve falhar ao tentar criar payable com valor inválido', async () => {
      const assignorData = {
        document: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        email: faker.internet.email(),
        phone: '11' + faker.string.numeric(9),
        name: faker.person.fullName(),
      };

      const assignorResponse = await request(app.getHttpServer())
        .post('/integrations/assignor')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assignorData)
        .expect(201);

      createdAssignorId = assignorResponse.body.id;

      const invalidPayableData = {
        value: 0,
        emissionDate: faker.date.past({ years: 1 }).toISOString(),
        assignor: createdAssignorId,
      };

      const response = await request(app.getHttpServer())
        .post('/integrations/payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayableData)
        .expect(400);

      expect(response.body.message).toContain('O valor deve ser maior que zero');

      const payablesCount = await prisma.payable.count({
        where: { assignorId: createdAssignorId },
      });

      expect(payablesCount).toBe(0);
    }, 10000);

    it('deve falhar ao tentar criar payable com data futura', async () => {
      const assignorData = {
        document: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        email: faker.internet.email(),
        phone: '11' + faker.string.numeric(9),
        name: faker.person.fullName(),
      };

      const assignorResponse = await request(app.getHttpServer())
        .post('/integrations/assignor')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assignorData)
        .expect(201);

      createdAssignorId = assignorResponse.body.id;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidPayableData = {
        value: faker.number.float({ min: 100, max: 1000, multipleOf: 0.01 }),
        emissionDate: futureDate.toISOString(),
        assignor: createdAssignorId,
      };

      const response = await request(app.getHttpServer())
        .post('/integrations/payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayableData)
        .expect(400);

      expect(response.body.message).toContain('A data de emissão não pode estar no futuro');

      const payablesCount = await prisma.payable.count({
        where: { assignorId: createdAssignorId },
      });

      expect(payablesCount).toBe(0);
    }, 10000);

    it('deve falhar ao tentar criar payable com assignor inexistente', async () => {
      const fakeAssignorId = faker.string.uuid();

      const payableData = {
        value: faker.number.float({ min: 100, max: 1000, multipleOf: 0.01 }),
        emissionDate: faker.date.past({ years: 1 }).toISOString(),
        assignor: fakeAssignorId,
      };

      await request(app.getHttpServer())
        .post('/integrations/payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payableData)
        .expect(500);

      const payablesCount = await prisma.payable.count({
        where: { assignorId: fakeAssignorId },
      });

      expect(payablesCount).toBe(0);
    }, 10000);
  });

  describe('GET /integrations/payable/:id', () => {
    it('deve buscar um payable criado no banco real', async () => {
      const assignorData = {
        document: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        email: faker.internet.email(),
        phone: '11' + faker.string.numeric(9),
        name: faker.person.fullName(),
      };

      const assignorResponse = await request(app.getHttpServer())
        .post('/integrations/assignor')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assignorData)
        .expect(201);

      createdAssignorId = assignorResponse.body.id;

      const payableData = {
        value: faker.number.float({ min: 100, max: 10000, multipleOf: 0.01 }),
        emissionDate: faker.date.past({ years: 1 }).toISOString(),
        assignor: createdAssignorId,
      };

      const payableResponse = await request(app.getHttpServer())
        .post('/integrations/payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payableData)
        .expect(201);

      createdPayableId = payableResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/integrations/payable/${createdPayableId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        id: createdPayableId,
        value: payableData.value,
        assignorId: createdAssignorId,
        assignor: {
          id: createdAssignorId,
          email: assignorData.email,
          name: assignorData.name,
        },
      });

      const payableInDb = await prisma.payable.findUnique({
        where: { id: createdPayableId },
        include: { assignor: true },
      });

      expect(payableInDb!.value).toBe(getResponse.body.value);
      expect(payableInDb!.assignor.email).toBe(getResponse.body.assignor.email);
    }, 10000);
  });

  describe('PUT /integrations/payable/:id', () => {
    it('deve atualizar um payable no banco real', async () => {
      const assignorData = {
        document: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        email: faker.internet.email(),
        phone: '11' + faker.string.numeric(9),
        name: faker.person.fullName(),
      };

      const assignorResponse = await request(app.getHttpServer())
        .post('/integrations/assignor')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assignorData)
        .expect(201);

      createdAssignorId = assignorResponse.body.id;

      const payableData = {
        value: faker.number.float({ min: 100, max: 1000, multipleOf: 0.01 }),
        emissionDate: faker.date.past({ years: 1 }).toISOString(),
        assignor: createdAssignorId,
      };

      const payableResponse = await request(app.getHttpServer())
        .post('/integrations/payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payableData)
        .expect(201);

      createdPayableId = payableResponse.body.id;

      const updateData = {
        value: faker.number.float({ min: 1000, max: 5000, multipleOf: 0.01 }),
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/integrations/payable/${createdPayableId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.value).toBe(updateData.value);
      expect(updateResponse.body.id).toBe(createdPayableId);

      const payableInDb = await prisma.payable.findUnique({
        where: { id: createdPayableId },
      });

      expect(payableInDb!.value).toBe(updateData.value);
    }, 10000);
  });

  describe('DELETE /integrations/payable/:id', () => {
    it('deve fazer soft delete de um payable no banco real', async () => {
      const assignorData = {
        document: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        email: faker.internet.email(),
        phone: '11' + faker.string.numeric(9),
        name: faker.person.fullName(),
      };

      const assignorResponse = await request(app.getHttpServer())
        .post('/integrations/assignor')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assignorData)
        .expect(201);

      createdAssignorId = assignorResponse.body.id;

      const payableData = {
        value: faker.number.float({ min: 100, max: 1000, multipleOf: 0.01 }),
        emissionDate: faker.date.past({ years: 1 }).toISOString(),
        assignor: createdAssignorId,
      };

      const payableResponse = await request(app.getHttpServer())
        .post('/integrations/payable')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payableData)
        .expect(201);

      createdPayableId = payableResponse.body.id;

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/integrations/payable/${createdPayableId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe('Payable deleted successfully');

      const payableInDb = await prisma.payable.findUnique({
        where: { id: createdPayableId },
      });

      expect(payableInDb!.deletedAt).toBeTruthy();

      await request(app.getHttpServer())
        .get(`/integrations/payable/${createdPayableId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      createdPayableId = undefined;
    }, 10000);
  });
}); 