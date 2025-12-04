import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

describe('Booking (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    connection = moduleFixture.get<Connection>(getConnectionToken());

    await app.init();

    // Create test user and get auth token
    const email = `booking-test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password,
      first_name: 'Booking',
      last_name: 'Test',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    authToken = loginResponse.body.access_token;
    userId = loginResponse.body.user._id;
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    await app.close();
  });

  describe('POST /booking', () => {
    it('should create a booking successfully', () => {
      const createDto = {
        flight_details: {
          origin: 'TUN',
          destination: 'CDG',
          departure_date: '2025-06-01',
          return_date: '2025-06-15',
        },
        passengers: [
          {
            first_name: 'Test',
            last_name: 'Passenger',
            date_of_birth: '1990-01-01',
          },
        ],
        total_price: 500,
        currency: 'EUR',
      };

      return request(app.getHttpServer())
        .post('/booking')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.user_id).toBe(userId);
          expect(res.body.status).toBe('pending');
          expect(res.body.total_price).toBe(createDto.total_price);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/booking')
        .send({
          flight_details: {},
          passengers: [],
          total_price: 500,
          currency: 'EUR',
        })
        .expect(401);
    });
  });

  describe('GET /booking', () => {
    it('should return user bookings with pagination', () => {
      return request(app.getHttpServer())
        .get('/booking')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });
});
