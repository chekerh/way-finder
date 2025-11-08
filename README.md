## Wayfindr Backend (NestJS + MongoDB)

TypeScript NestJS backend for Wayfindr. Includes JWT auth, user profiles, bookings, payments (stub), real‑time WebSockets, validation, rate limiting, Helmet, and Swagger.

### Tech Stack
- NestJS 11, TypeScript
- MongoDB via Mongoose
- JWT + Passport
- class-validator / class-transformer
- WebSockets (Socket.IO)
- Helmet + Throttler
- Swagger (OpenAPI)
- Docker + Docker Compose

### Structure (key)
```
src/
  auth/ user/ booking/ payment/ real-time/ common/enums/
  app.module.ts, main.ts
```

### Env Vars
- `PORT` (default 3000)
- `MONGODB_URI` (e.g., `mongodb://localhost:27017/wayfindr`)
- `JWT_SECRET` (set a strong value)

### Install
```bash
npm install
```

### Run (local)
```bash
# PowerShell
$env:MONGODB_URI="mongodb://localhost:27017/wayfindr"; $env:JWT_SECRET="change_me"; npm run start:dev
# CMD
set MONGODB_URI=mongodb://localhost:27017/wayfindr && set JWT_SECRET=change_me && npm run start:dev
# Unix
MONGODB_URI=mongodb://localhost:27017/wayfindr JWT_SECRET=change_me npm run start:dev
```

### Swagger Docs
Open http://localhost:3000/api-docs (use Authorize with Bearer token).

### Run (Docker)
```bash
docker compose up -d --build
```

### Endpoints (summary)
- Auth: POST `api/auth/register`, POST `api/auth/login`
- User (Bearer): GET `api/user/profile`, PUT `api/user/profile`
- Booking: GET `api/booking/offers`, GET `api/booking/compare`, POST `api/booking/confirm` (Bearer), GET `api/booking/history` (Bearer)
- Payment (stub, Bearer): POST `api/payment/record`, GET `api/payment/history`

### WebSockets
- Events: `price_alert`, `chat_message` (broadcast)

### Testing
```bash
npm run test
npm run test:e2e
npm run test:cov
```

### Security Defaults
- Helmet enabled
- Global rate limiting (Throttler)
- ValidationPipe: whitelist + transform + forbidNonWhitelisted

### Troubleshooting
- Ensure MongoDB is running / correct `MONGODB_URI`
- For Docker, start Docker Desktop first
- Add `Authorization: Bearer <token>` for protected routes

### License
Private project. All rights reserved.