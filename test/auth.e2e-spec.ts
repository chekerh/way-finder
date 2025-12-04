import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    connection = moduleFixture.get<Connection>(getConnectionToken());

    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    if (connection) {
      await connection.close();
    }
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      const registerDto = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(registerDto.email);
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
          first_name: 'Test',
          last_name: 'User',
        })
        .expect(400);
    });

    it('should return 400 for weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          first_name: 'Test',
          last_name: 'User',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let testUser: { email: string; password: string };

    beforeAll(async () => {
      // Create a test user for login tests
      testUser = {
        email: `login-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          first_name: 'Login',
          last_name: 'Test',
        });
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });
});
