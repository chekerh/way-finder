# WayFinder Backend API

**Enterprise Travel Booking Platform Backend**

A comprehensive NestJS-based backend system for a modern travel booking platform. Features AI-powered recommendations, real-time messaging, multi-provider flight/hotel integrations, and a complete user authentication system with password reset functionality.

## 🚀 Key Features

- **🔐 Authentication System**: JWT-based auth with Google/Apple OAuth, OTP verification, and password reset
- **✈️ Travel Booking**: Complete flight and hotel booking with Amadeus API integration
- **🤖 AI Integration**: Travel recommendations, video generation, weather-outfit suggestions
- **💬 Real-time Chat**: WebSocket-based messaging system
- **📍 Location Services**: Google Maps integration for destinations and itineraries
- **📧 Notifications**: Firebase Cloud Messaging (FCM) push notifications
- **💰 Rewards System**: Loyalty program with points and discounts
- **📊 Analytics**: User behavior tracking and personalized recommendations
- **🎥 Content Generation**: AI-powered travel video creation

### Technical Highlights
- **26 Feature Modules**: Complete travel booking ecosystem
- **150+ API Endpoints**: Comprehensive REST API surface
- **20+ External APIs**: Amadeus, Google Maps, OpenAI, Firebase, etc.
- **Enterprise Patterns**: MVVM, Repository, Circuit Breaker, Dependency Injection
- **Real-time Features**: WebSocket chat, notifications, price alerts

## 🏗️ Architecture

### Core Technologies
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis with TTL-based expiration
- **Queue**: BullMQ for background jobs
- **Authentication**: JWT with Passport.js

### Design Patterns
- **MVVM**: Mobile app architecture
- **Repository**: Data access abstraction
- **Circuit Breaker**: External API resilience
- **Dependency Injection**: Service orchestration
- **Observer**: Reactive state management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Redis** (for caching and queues)

## ⚙️ Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wayfinder-mobile-dam/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `env.template` to `.env`
   - Configure the following required environment variables:
     ```env
     # Database
     MONGODB_URI=mongodb://localhost:27017/wayfinder

     # JWT
     JWT_SECRET=your-jwt-secret-here
     JWT_REFRESH_SECRET=your-refresh-secret-here

     # Email Service (for password reset)
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password

     # External APIs
     AMADEUS_API_KEY=your-amadeus-key
     AMADEUS_API_SECRET=your-amadeus-secret
     GOOGLE_MAPS_API_KEY=your-google-maps-key
     OPENAI_API_KEY=your-openai-key
     ```

4. **Start the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production build
   npm run build
   npm run start:prod
   ```

## 📊 API Surface

### Core Modules
- **🔐 Authentication**: JWT-based user management with password reset
- **🎫 User Management**: Profile management, preferences, onboarding
- **✈️ Booking System**: Flight and hotel reservations with payment processing
- **🏨 Catalog**: Amadeus API integration for flights and hotels
- **💬 Chat**: Real-time messaging system
- **🤖 Recommendations**: AI-powered travel suggestions
- **⭐ Reviews & Ratings**: User feedback and rating system
- **🎁 Rewards**: Loyalty program with points and discounts
- **🎥 Video Generation**: AI-powered travel content creation
- **📧 Notifications**: Push notifications via FCM
- **📍 Social Features**: User interactions, journey sharing
- **🗺️ Itineraries**: Trip planning and management

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test

# Run linting
npm run lint

# Generate API documentation
npm run docs
```

## 📚 API Documentation

### Auto-generated Documentation
This API documentation is auto-generated using TypeDoc and covers all 26 modules with detailed specifications:
- **150+ Endpoints** with parameter specifications
- **Response schemas** and error handling
- **Authentication requirements**
- **Rate limiting information**

### Key API Endpoints

#### Authentication
```
POST /auth/login              - User login
POST /auth/register           - User registration
POST /auth/google             - Google OAuth login
POST /auth/apple              - Apple Sign-In login
POST /auth/request-password-reset  - Request password reset OTP
POST /auth/reset-password     - Reset password with OTP
POST /auth/verify-email       - Email verification
```

#### User Management
```
GET  /user/profile            - Get user profile
PUT  /user/profile            - Update user profile
POST /user/profile/upload-image - Upload profile image
```

#### Booking System
```
GET  /booking                 - Get user bookings
POST /booking                 - Create booking
POST /booking/confirm         - Confirm booking with payment
```

### Recent Updates
- ✅ **Password Reset Feature**: Added complete password reset flow with OTP verification
- ✅ **Enhanced Authentication**: Improved security with rate limiting and cooldown periods
- ✅ **Email Integration**: SMTP-based email service for notifications and password reset

## 🔒 Security

- JWT authentication with refresh tokens
- Input validation using class-validator
- Rate limiting and CORS protection
- Password hashing with bcrypt
- SQL injection prevention

## 📈 Performance

- Redis caching with >85% hit rate
- Database query optimization
- Background job processing
- Horizontal scaling support
- Circuit breaker pattern for external APIs

## 🤝 Contributing

This is a university engineering project demonstrating enterprise-level software architecture and best practices.
