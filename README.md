## Wayfinder Backend (NestJS + MongoDB)

TypeScript NestJS backend for Wayfinder travel planning application. Includes JWT auth, user profiles, bookings, payments, real-time WebSockets, AI-driven onboarding, personalized recommendations, social features, and comprehensive travel management features.

### Tech Stack
- NestJS 11, TypeScript
- MongoDB via Mongoose
- JWT + Passport
- class-validator / class-transformer
- WebSockets (Socket.IO)
- Helmet + Throttler
- Swagger (OpenAPI)
- Docker + Docker Compose

### Project Structure
```
src/
├── auth/                    # Authentication (JWT, login, register)
├── user/                    # User profiles, image upload
├── booking/                 # Flight booking, offers, history
├── payment/                 # Payment processing (PayPal integration)
├── onboarding/              # AI-driven dynamic onboarding
│   ├── ai/                  # Onboarding AI service
│   └── questions/           # Question templates
├── recommendations/          # Personalized recommendations
├── catalog/                 # Flight catalog, Amadeus integration, activities
├── discussion/              # Forum posts, comments, likes
├── favorites/               # User favorites management
├── itinerary/               # Travel itineraries, activities
├── reviews/                 # Reviews and ratings
├── notifications/           # In-app notifications
├── social/                  # Social features (follow, share, feed)
├── search-history/          # Search history tracking
├── price-alerts/            # Price monitoring and alerts
├── travel-tips/             # AI-generated destination tips
├── real-time/               # WebSocket gateway
└── common/                  # Shared enums and utilities
```

### Environment Variables
- `PORT` (default: 3000)
- `MONGODB_URI` (e.g., `mongodb://localhost:27017/wayfindr`)
- `JWT_SECRET` (set a strong value for production)
- `AMADEUS_API_KEY` (optional, for flight search)
- `AMADEUS_API_SECRET` (optional, for flight search)

### Installation
```bash
npm install
```

### Run (Local Development)
```bash
# PowerShell
$env:MONGODB_URI="mongodb://localhost:27017/wayfindr"; $env:JWT_SECRET="change_me"; npm run start:dev

# CMD
set MONGODB_URI=mongodb://localhost:27017/wayfindr && set JWT_SECRET=change_me && npm run start:dev

# Unix/Mac
MONGODB_URI=mongodb://localhost:27017/wayfindr JWT_SECRET=change_me npm run start:dev
```

### Run (Docker)
```bash
docker compose up -d --build
```

### Swagger Documentation
Open http://localhost:3000/api-docs (use "Authorize" button with Bearer token for protected endpoints).

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token and onboarding status)

#### User Management
- `GET /api/user/profile` (Bearer) - Get user profile
- `PUT /api/user/profile` (Bearer) - Update user profile
- `POST /api/user/profile/upload-image` (Bearer) - Upload profile image

#### Onboarding
- `POST /api/onboarding/start` (Bearer) - Start onboarding session
- `POST /api/onboarding/answer` (Bearer) - Submit answer, get next question
- `GET /api/onboarding/status` (Bearer) - Check onboarding status
- `POST /api/onboarding/resume` (Bearer) - Resume incomplete session

#### Recommendations
- `GET /api/recommendations/personalized` (Bearer) - Get personalized recommendations
- `GET /api/recommendations/regenerate` (Bearer) - Regenerate recommendations

#### Catalog & Flights
- `GET /api/catalog/recommended` (Bearer) - Get recommended flights
- `GET /api/catalog/explore` - Explore flight offers
- `GET /api/catalog/activities` - Get activities by city/themes

#### Booking
- `GET /api/booking/offers` - Search flight offers
- `GET /api/booking/compare` - Compare offer prices
- `POST /api/booking/confirm` (Bearer) - Confirm booking
- `GET /api/booking/history` (Bearer) - Get booking history
- `GET /api/booking/:id` (Bearer) - Get booking details
- `PUT /api/booking/:id` (Bearer) - Update booking
- `DELETE /api/booking/:id` (Bearer) - Cancel booking

#### Payment
- `POST /api/payment/record` (Bearer) - Record payment
- `GET /api/payment/history` (Bearer) - Get payment history
- `POST /api/payment/paypal/create` (Bearer) - Create PayPal order and approval link
- `POST /api/payment/paypal/capture/:orderId` (Bearer) - Capture PayPal order
- `GET /api/payment/paypal/status/:orderId` (Bearer) - Retrieve PayPal order status

#### Discussion Forum
- `GET /api/discussion/posts` - Get all posts
- `POST /api/discussion/posts` (Bearer) - Create post
- `GET /api/discussion/posts/:id` - Get post details
- `PUT /api/discussion/posts/:id` (Bearer) - Update post
- `DELETE /api/discussion/posts/:id` (Bearer) - Delete post
- `POST /api/discussion/posts/:id/like` (Bearer) - Like/unlike post
- `POST /api/discussion/posts/:id/comments` (Bearer) - Add comment
- `DELETE /api/discussion/comments/:id` (Bearer) - Delete comment

#### Favorites
- `GET /api/favorites` (Bearer) - Get user favorites
- `POST /api/favorites` (Bearer) - Add favorite
- `DELETE /api/favorites/:type/:itemId` (Bearer) - Remove favorite
- `GET /api/favorites/check/:type/:itemId` (Bearer) - Check if item is favorite

#### Travel Itineraries
- `GET /api/itinerary` (Bearer) - Get user itineraries
- `POST /api/itinerary` (Bearer) - Create itinerary
- `GET /api/itinerary/:id` (Bearer) - Get itinerary details
- `PUT /api/itinerary/:id` (Bearer) - Update itinerary
- `DELETE /api/itinerary/:id` (Bearer) - Delete itinerary

#### Reviews & Ratings
- `GET /api/reviews/:itemType/:itemId` - Get reviews for item
- `POST /api/reviews` (Bearer) - Create review
- `PUT /api/reviews/:id` (Bearer) - Update review
- `DELETE /api/reviews/:id` (Bearer) - Delete review
- `GET /api/reviews/:itemType/:itemId/stats` - Get review statistics

#### Notifications
- `GET /api/notifications` (Bearer) - Get user notifications
- `GET /api/notifications/unread-count` (Bearer) - Get unread count
- `PUT /api/notifications/:id/read` (Bearer) - Mark notification as read
- `PUT /api/notifications/read-all` (Bearer) - Mark all as read
- `DELETE /api/notifications/:id` (Bearer) - Delete notification

#### Social Features
- `POST /api/social/follow/:userId` (Bearer) - Follow user
- `DELETE /api/social/unfollow/:userId` (Bearer) - Unfollow user
- `GET /api/social/followers` (Bearer) - Get followers
- `GET /api/social/following` (Bearer) - Get following
- `POST /api/social/share` (Bearer) - Share trip
- `GET /api/social/feed` (Bearer) - Get social feed

#### Search History
- `POST /api/search-history` (Bearer) - Record search
- `GET /api/search-history/recent` (Bearer) - Get recent searches
- `GET /api/search-history/saved` (Bearer) - Get saved searches
- `POST /api/search-history/:id/save` (Bearer) - Save search
- `POST /api/search-history/:id/unsave` (Bearer) - Unsave search
- `DELETE /api/search-history/:id` (Bearer) - Delete search
- `DELETE /api/search-history/recent/clear` (Bearer) - Clear recent searches
- `GET /api/search-history/stats` (Bearer) - Get search statistics

#### Price Alerts
- `POST /api/price-alerts` (Bearer) - Create price alert
- `GET /api/price-alerts` (Bearer) - Get user price alerts
- `GET /api/price-alerts/:id` (Bearer) - Get alert details
- `PUT /api/price-alerts/:id` (Bearer) - Update alert
- `DELETE /api/price-alerts/:id` (Bearer) - Delete alert
- `POST /api/price-alerts/:id/deactivate` (Bearer) - Deactivate alert

#### Travel Tips
- `GET /api/travel-tips?destinationId=:id` - Get tips for destination
- `GET /api/travel-tips/generate/:destinationId` - Generate tips for destination
- `POST /api/travel-tips` (Bearer) - Create custom tip
- `GET /api/travel-tips/:tipId` - Get tip details
- `POST /api/travel-tips/:tipId/helpful` - Mark tip as helpful

### WebSockets
Real-time events via Socket.IO:
- `price_alert` - Price alert notifications
- `chat_message` - Chat message broadcasts
- `notification` - Real-time notifications

### Database Collections
Collections are created automatically on first use:
- `users` - User accounts and profiles
- `bookings` - Booking records
- `payments` - Payment records
- `onboardingsessions` - Onboarding session data
- `discussions` - Forum posts
- `favorites` - User favorites
- `itineraries` - Travel itineraries
- `reviews` - Reviews and ratings
- `notifications` - User notifications
- `socialfollows` - User follow relationships
- `searchhistories` - Search history records
- `pricealerts` - Price alert configurations
- `traveltips` - Travel tips

### Features

#### AI-Driven Onboarding
- Dynamic question generation based on user responses
- Rule-based AI for preference extraction
- Automatic user profile updates

#### Personalized Recommendations
- Destination matching based on user preferences
- Budget and interest-based filtering
- Match scoring and reasoning

#### Travel Tips
- AI-generated tips per destination
- Category-based tips (general, transportation, accommodation, food, culture, safety, budget, weather)
- Helpful count tracking

#### Price Alerts
- Automatic price monitoring
- Alert triggers when conditions are met
- Notification integration

#### Social Features
- User following system
- Trip sharing
- Social feed aggregation

### Security
- Helmet enabled (HTTP headers)
- Global rate limiting (Throttler: 120 requests/minute)
- JWT authentication for protected routes
- Password hashing with bcrypt
- Input validation with class-validator
- CORS enabled
- ValidationPipe: whitelist + transform + forbidNonWhitelisted

### Testing
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Build
```bash
npm run build         # Production build
```

### Troubleshooting
- **MongoDB connection fails**: Ensure MongoDB is running and `MONGODB_URI` is correct
- **JWT errors**: Verify `JWT_SECRET` is set and consistent
- **Docker issues**: Start Docker Desktop first
- **Protected routes**: Add `Authorization: Bearer <token>` header
- **TypeScript errors**: Run `npm run build` to check for compilation errors

### License
Private project. All rights reserved.
