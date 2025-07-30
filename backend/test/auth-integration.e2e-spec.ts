import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth (POST)', () => {
    it('should return JWT token with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth')
        .send({ login: 'aprovame', password: 'aprovame' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('expires_in');
          expect(res.body.expires_in).toBe(2592000);
          accessToken = res.body.access_token;
        });
    });

    it('should return 401 with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth')
        .send({ login: 'invalid', password: 'invalid' })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({ login: 'aprovame', password: 'aprovame' });
      accessToken = response.body.access_token;
    });

    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable/123')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect((res) => {
          expect(res.status).not.toBe(401);
        });
    });

    it('should return 401 for protected route without token', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable/123')
        .expect(401);
    });

    it('should return 401 for protected route with invalid token', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable/123')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
