# Testing Documentation

## Test Structure

```
backend/
├── src/
│   ├── test/
│   │   ├── utils/
│   │   │   └── test-utils.ts      # Common test utilities and mock factories
│   │   └── README.md              # This file
│   └── **/*.spec.ts               # Unit tests (co-located with source)
└── test/
    ├── *.e2e-spec.ts              # End-to-end tests
    └── jest-e2e.json              # E2E test configuration
```

## Unit Tests

Unit tests are co-located with their source files:
- `src/booking/booking.service.spec.ts`
- `src/user/user.service.spec.ts`
- `src/catalog/catalog.service.spec.ts`

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run a specific test file
npm test -- booking.service.spec.ts
```

## E2E Tests

E2E tests are in the `test/` directory:
- `test/app.e2e-spec.ts` - Basic app health check
- `test/auth.e2e-spec.ts` - Authentication flows
- `test/booking.e2e-spec.ts` - Booking flows

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run a specific E2E test file
npm run test:e2e -- auth.e2e-spec.ts
```

## Test Utilities

The `test-utils.ts` file provides:
- `createMockUser()` - Mock user factory
- `createMockBooking()` - Mock booking factory
- `createMockJwtPayload()` - Mock JWT payload factory
- `createMockRequest()` - Mock request factory
- `createMockModel()` - Mock Mongoose model factory

## Writing Tests

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { createMockBooking } from '../test/utils/test-utils';

describe('BookingService', () => {
  let service: BookingService;
  let bookingModel: jest.Mocked<Model<BookingDocument>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getModelToken(Booking.name),
          useValue: createMockModel(),
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingModel = module.get(getModelToken(Booking.name));
  });

  it('should create a booking', async () => {
    const mockBooking = createMockBooking();
    (bookingModel.create as jest.Mock).mockResolvedValue(mockBooking);

    const result = await service.create('user123', { /* ... */ });

    expect(result).toEqual(mockBooking);
  });
});
```

### E2E Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Feature (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should test feature', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200);
  });
});
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for services
- **E2E Tests**: Critical user flows (auth, booking, payment)
- **Integration Tests**: Service interactions

## Next Steps

1. Add unit tests for all remaining services
2. Expand E2E test coverage
3. Add integration tests for complex workflows
4. Set up CI/CD test automation

