# Wayfindr Android App - Master Development Prompt

## ⚠️ CONFIDENTIAL - PRIVATE PROJECT
This document contains proprietary information for Wayfindr Android application development. **DO NOT SHARE** this prompt with external parties or public repositories.

---

## 0. App Overview & Core Philosophy

### App Purpose
Wayfindr is a mobile application designed to personalize the travel experience using artificial intelligence (AI). By asking users simple questions about their travel type and budget, the app recommends tailored options such as flights, hotels, and activities. It aims to streamline the travel planning process, saving users time by presenting them with relevant and personalized suggestions based on their preferences.

### Core Value Proposition
- **Time-Saving**: AI-driven suggestions reduce manual research and streamline decision-making
- **Personalization**: Tailored recommendations based on travel style, budget, and preferences
- **Convenience**: All-in-one platform for flights, hotels, activities, and trip management
- **Ethical AI**: Transparent, fair, and privacy-respecting recommendations

### Design Philosophy
- **Clean & Modern**: Light blue and white color palette with yellow accents for CTAs
- **User-Centric**: Intuitive navigation with clear visual hierarchy
- **Accessible**: Simple, readable typography and clear iconography
- **Responsive**: Card-based layouts for easy browsing and interaction

---

## 1. Backend API Configuration

### Base URL
- **Development**: `http://localhost:3000/api` (when using emulator with `10.0.2.2`)
- **Production**: `https://your-production-domain.com/api` (update when deployed)
- **API Prefix**: All endpoints are prefixed with `/api`

### Authentication
- **Type**: JWT (JSON Web Token) Bearer Authentication
- **Token Format**: `Authorization: Bearer <access_token>`
- **Token Lifetime**: 7 days (configured in backend)
- **Storage**: Store JWT token securely (Android Keystore/EncryptedSharedPreferences)

### Headers
All requests must include:
```
Content-Type: application/json
Accept: application/json
```

Protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Rate Limiting
- **Limit**: 120 requests per minute per IP
- Handle `429 Too Many Requests` responses gracefully
- Implement exponential backoff for retry logic

---

## 2. API Endpoints Specification

### 2.1 Authentication Endpoints

#### POST `/api/auth/register`
**Description**: Register a new user account

**Request Body**:
```json
{
  "username": "string (required, unique)",
  "email": "string (required, valid email, unique)",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "password": "string (required, minimum 6 characters)"
}
```

**Response** (200 OK):
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "string (MongoDB ObjectId)",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "preferences": [],
    "status": "active",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses**:
- `409 Conflict`: Username or email already exists
- `400 Bad Request`: Validation errors (missing fields, invalid email, password too short)

**Android Implementation Notes**:
- Validate email format client-side before sending
- Password must be at least 6 characters
- Show clear error messages for duplicate username/email
- Automatically log in user after successful registration (call login endpoint)

---

#### POST `/api/auth/login`
**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "username": "string (required)",
  "password": "string (required, minimum 6 characters)"
}
```

**Response** (200 OK):
```json
{
  "access_token": "string (JWT token)"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Validation errors

**Android Implementation Notes**:
- Store `access_token` securely (EncryptedSharedPreferences or Android Keystore)
- Include token in all subsequent API requests
- Handle token expiration (redirect to login after 7 days or on 401 response)
- Implement "Remember Me" functionality using secure storage

---

### 2.2 User Profile Endpoints

#### GET `/api/user/profile`
**Description**: Get authenticated user's profile information

**Headers**: `Authorization: Bearer <token>` (required)

**Response** (200 OK):
```json
{
  "_id": "string (MongoDB ObjectId)",
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "preferences": ["string array"],
  "status": "active" | "inactive" | "suspended",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

**Android Implementation Notes**:
- Cache user profile locally for offline access
- Refresh profile on app startup or pull-to-refresh
- Display user avatar placeholder if no image URL (future feature)

---

#### PUT `/api/user/profile`
**Description**: Update authenticated user's profile

**Headers**: `Authorization: Bearer <token>` (required)

**Request Body** (all fields optional):
```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "preferences": ["string array"] (optional),
  "status": "active" | "inactive" | "suspended" (optional)
}
```

**Response** (200 OK):
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "first_name": "string (updated)",
  "last_name": "string (updated)",
  "preferences": ["updated array"],
  "status": "string (updated)",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found
- `400 Bad Request`: Validation errors

**Android Implementation Notes**:
- Only send changed fields (partial update)
- Show loading indicator during update
- Update local cache after successful update
- Preferences can include travel interests: ["beach", "adventure", "culture", "nightlife", etc.]

---

### 2.3 Booking Endpoints

#### GET `/api/booking/offers`
**Description**: Search for travel offers (flights, hotels, activities)

**Query Parameters**:
- `destination` (optional): string - Destination city/country
- `dates` (optional): string - Travel dates
- `type` (optional): string - "flight" | "hotel" | "activity"

**Response** (200 OK):
```json
[
  {
    "id": "offer_1",
    "type": "flight",
    "destination": "New York",
    "price": 199
  },
  {
    "id": "offer_2",
    "type": "hotel",
    "destination": "Paris",
    "price": 99
  }
]
```

**Android Implementation Notes**:
- Currently returns stub data (backend will integrate with real providers later)
- Implement search filters UI (destination, dates, type)
- Show loading skeleton while fetching
- Display offers in a RecyclerView with cards
- Support pagination when backend implements it

---

#### GET `/api/booking/compare`
**Description**: Get detailed price breakdown for an offer

**Query Parameters**:
- `offer_id` (required): string - Offer identifier

**Response** (200 OK):
```json
{
  "offer_id": "offer_1",
  "base_price": 150,
  "taxes": 30,
  "baggage": 20,
  "service_fees": 10,
  "total": 210
}
```

**Android Implementation Notes**:
- Display price breakdown in a detailed view
- Highlight total price prominently
- Show currency (currently assumes USD, update when backend adds currency support)

---

#### POST `/api/booking/confirm`
**Description**: Confirm and create a booking

**Headers**: `Authorization: Bearer <token>` (required)

**Request Body**:
```json
{
  "offer_id": "string (required)",
  "payment_details": {
    "method": "Stripe" | "PayPal",
    "card_last4": "string (optional)",
    "transaction_id": "string (optional)"
  }
}
```

**Response** (200 OK):
```json
{
  "_id": "string (MongoDB ObjectId)",
  "user_id": "string (ObjectId)",
  "offer_id": "string",
  "status": "confirmed",
  "payment_details": {},
  "booking_date": "ISO 8601 datetime",
  "confirmation_number": "CONF-XXXXXXXX",
  "total_price": 200,
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Validation errors
- `404 Not Found`: Offer not found

**Android Implementation Notes**:
- **IMPORTANT**: Do NOT send `user_id` in request body - backend automatically uses authenticated user from JWT token
- Show confirmation number prominently after successful booking
- Send confirmation email notification (backend handles this)
- Navigate to booking details screen after confirmation
- Store booking locally for offline access

---

#### GET `/api/booking/history`
**Description**: Get user's booking history

**Headers**: `Authorization: Bearer <token>` (required)

**Response** (200 OK):
```json
[
  {
    "_id": "string",
    "user_id": "string",
    "offer_id": "string",
    "status": "confirmed" | "pending" | "cancelled",
    "payment_details": {},
    "booking_date": "ISO 8601 datetime",
    "confirmation_number": "string",
    "total_price": 200,
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
]
```

**Android Implementation Notes**:
- Display bookings in chronological order (most recent first)
- Filter by status (confirmed, pending, cancelled)
- Show booking status badges with different colors
- Allow cancellation (future feature - backend endpoint pending)
- Support pull-to-refresh
- Cache bookings locally for offline viewing

---

### 2.4 Payment Endpoints

#### GET `/api/payment/history`
**Description**: Get user's payment transaction history

**Headers**: `Authorization: Bearer <token>` (required)

**Response** (200 OK):
```json
[
  {
    "_id": "string",
    "transaction_id": "txn_XXXXXXXX",
    "user_id": "string",
    "amount": 200,
    "payment_status": "success" | "failed",
    "transaction_date": "ISO 8601 datetime",
    "payment_method": "Stripe" | "PayPal",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
]
```

**Android Implementation Notes**:
- Display transaction history with status indicators
- Group by date for better UX
- Show payment method icons
- Filter by status (success/failed)
- Link transactions to bookings when possible

---

#### POST `/api/payment/record`
**Description**: Record a payment transaction (stub endpoint for testing)

**Headers**: `Authorization: Bearer <token>` (required)

**Request Body**:
```json
{
  "amount": "number (optional, default: 0)",
  "payment_method": "string (optional, default: 'Stripe')",
  "payment_status": "string (optional, default: 'success')"
}
```

**Response** (200 OK):
```json
{
  "_id": "string",
  "transaction_id": "txn_XXXXXXXX",
  "user_id": "string",
  "amount": 200,
  "payment_status": "success",
  "transaction_date": "ISO 8601 datetime",
  "payment_method": "Stripe",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Android Implementation Notes**:
- This is a stub endpoint for testing
- In production, payment processing will be handled by Stripe/PayPal SDKs
- Do not use this endpoint for real payments in production

---

## 3. WebSocket Real-Time Communication

### Connection
- **URL**: `ws://localhost:3000` (development) or `wss://your-domain.com` (production)
- **Library**: Use Socket.IO client for Android (io.socket:socket.io-client)

### Events

#### Subscribe to Price Alerts
**Event Name**: `price_alert`

**Emitted Data**:
```json
{
  "offer_id": "string",
  "destination": "string",
  "old_price": 200,
  "new_price": 150,
  "discount_percentage": 25,
  "message": "Price dropped for your saved destination!"
}
```

**Android Implementation Notes**:
- Connect to WebSocket on app startup (when user is logged in)
- Show push notification when price alert is received
- Update offer prices in real-time in the UI
- Store price alerts locally for notification history

---

#### Chat Messages (Customer Support)
**Event Name**: `chat_message`

**Emitted Data**:
```json
{
  "message": "string",
  "sender": "user" | "support",
  "timestamp": "ISO 8601 datetime",
  "chat_id": "string (optional)"
}
```

**Android Implementation Notes**:
- Implement chat UI for customer support
- Show typing indicators
- Store chat history locally
- Support file attachments (images, documents) - future feature
- Implement read receipts - future feature

---

#### Sending Messages

**Emit Event**: `price_alert` or `chat_message`
**Data**: Send alert preferences or chat message

**Example**:
```kotlin
socket.emit("chat_message", JSONObject().apply {
    put("message", "Hello, I need help with my booking")
    put("sender", "user")
})
```

---

## 4. Data Models

### User Model
```kotlin
data class User(
    val _id: String,
    val username: String,
    val email: String,
    val first_name: String,
    val last_name: String,
    val preferences: List<String>,
    val status: UserStatus, // "active" | "inactive" | "suspended"
    val createdAt: String,
    val updatedAt: String
)

enum class UserStatus {
    ACTIVE, INACTIVE, SUSPENDED
}
```

### Booking Model
```kotlin
data class Booking(
    val _id: String,
    val user_id: String,
    val offer_id: String,
    val status: BookingStatus, // "pending" | "confirmed" | "cancelled"
    val payment_details: Map<String, Any>,
    val booking_date: String,
    val confirmation_number: String,
    val total_price: Double,
    val createdAt: String,
    val updatedAt: String
)

enum class BookingStatus {
    PENDING, CONFIRMED, CANCELLED
}
```

### Offer Model
```kotlin
data class Offer(
    val id: String,
    val type: String, // "flight" | "hotel" | "activity"
    val destination: String,
    val price: Double
)

data class OfferComparison(
    val offer_id: String,
    val base_price: Double,
    val taxes: Double,
    val baggage: Double,
    val service_fees: Double,
    val total: Double
)
```

### Payment Model
```kotlin
data class Payment(
    val _id: String,
    val transaction_id: String,
    val user_id: String,
    val amount: Double,
    val payment_status: String, // "success" | "failed"
    val transaction_date: String,
    val payment_method: String, // "Stripe" | "PayPal"
    val createdAt: String,
    val updatedAt: String
)
```

---

## 5. Error Handling

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation errors or invalid request
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (username/email already exists)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Android Error Handling Strategy
1. **Network Errors**: Show "No internet connection" message, enable retry button
2. **401 Unauthorized**: Clear stored token, redirect to login screen
3. **400 Bad Request**: Display validation errors to user
4. **409 Conflict**: Show specific error message (e.g., "Username already taken")
5. **429 Rate Limit**: Show "Too many requests" message, disable retry temporarily
6. **500 Server Error**: Show generic error message, log error for debugging
7. **Timeout**: Show "Request timeout" message, enable retry

---

## 6. Android Architecture Recommendations

### Recommended Architecture
- **Architecture Pattern**: MVVM (Model-View-ViewModel) or MVI
- **Dependency Injection**: Dagger Hilt or Koin
- **Networking**: Retrofit 2 + OkHttp
- **JSON Parsing**: Gson or Moshi
- **Local Database**: Room Database (for caching)
- **Reactive Programming**: Kotlin Coroutines + Flow
- **Image Loading**: Coil or Glide
- **WebSocket**: Socket.IO Client for Android

### Project Structure
```
app/
├── data/
│   ├── api/
│   │   ├── AuthService.kt
│   │   ├── UserService.kt
│   │   ├── BookingService.kt
│   │   └── PaymentService.kt
│   ├── local/
│   │   ├── database/
│   │   │   ├── WayfindrDatabase.kt
│   │   │   ├── dao/
│   │   │   └── entity/
│   │   └── preferences/
│   └── repository/
├── domain/
│   ├── model/
│   ├── usecase/
│   └── repository/
├── presentation/
│   ├── auth/
│   ├── profile/
│   ├── booking/
│   ├── payment/
│   └── common/
└── di/
```

### Key Android Libraries
```gradle
// Networking
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
implementation 'com.squareup.okhttp3:okhttp:4.12.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'

// WebSocket
implementation 'io.socket:socket.io-client:2.1.0'

// Dependency Injection
implementation 'com.google.dagger:hilt-android:2.48'
kapt 'com.google.dagger:hilt-compiler:2.48'

// Room Database
implementation 'androidx.room:room-runtime:2.6.1'
kapt 'androidx.room:room-compiler:2.6.1'
implementation 'androidx.room:room-ktx:2.6.1'

// Coroutines
implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'

// ViewModel
implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'

// Navigation
implementation 'androidx.navigation:navigation-fragment-ktx:2.7.6'
implementation 'androidx.navigation:navigation-ui-ktx:2.7.6'

// Security
implementation 'androidx.security:security-crypto:1.1.0-alpha06'
```

---

## 7. Security Best Practices

### Token Storage
- Use `EncryptedSharedPreferences` or Android Keystore for storing JWT tokens
- Never store tokens in plain SharedPreferences
- Clear tokens on app uninstall or logout

### Network Security
- Use HTTPS in production (never HTTP)
- Implement certificate pinning for production
- Validate SSL certificates
- Use ProGuard/R8 to obfuscate API keys (if any)

### Input Validation
- Validate all user inputs client-side before sending to API
- Sanitize user inputs to prevent injection attacks
- Validate email format, password strength, etc.

### Authentication
- Implement token refresh mechanism (when backend adds refresh tokens)
- Handle token expiration gracefully
- Clear sensitive data on logout
- Implement biometric authentication for sensitive operations

---

## 8. Feature Requirements (From Original Spec)

### 8.1 AI-Powered Features

#### TripMind AI - Personalized Recommendations
- **Backend Integration**: Currently not implemented (future feature)
- **Implementation**: Call backend API with user preferences and travel history
- **UI**: Display personalized destination cards, hotel suggestions, activity recommendations
- **Data Source**: User preferences, booking history, search patterns

#### AI-Powered Travel Assistant
- **Backend Integration**: Chat WebSocket endpoint (`chat_message`)
- **Implementation**: Integrate with AI chatbot backend (future)
- **UI**: Chat interface with message bubbles, typing indicators
- **Features**: Ask questions, get travel advice, translation support (future)

#### Mode "Voyage Imprévu" (Spontaneous Travel)
- **Backend Integration**: Price alerts via WebSocket (`price_alert`)
- **Implementation**: Subscribe to price drops, last-minute offers
- **UI**: Notification center, offer cards with discount badges
- **Features**: Save destination preferences, receive alerts, quick booking

#### Carbon Footprint Tracking
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: Calculate emissions based on booking type (flight, hotel)
- **UI**: Display carbon footprint dashboard, suggestions for eco-friendly options
- **Data**: Track flights, accommodations, transportation methods

#### AI-Powered Travel Planner
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: Dynamic itinerary planning with AI suggestions
- **UI**: Interactive itinerary view, drag-and-drop reordering
- **Features**: Weather-based adjustments, event integration, real-time updates

### 8.2 Travel Management Features

#### User Profile Management
- **Backend Integration**: `GET /api/user/profile`, `PUT /api/user/profile`
- **Implementation**: Profile screen with editable fields, preferences selector
- **UI**: Form with validation, avatar placeholder, preference chips
- **Features**: Update name, email, travel preferences, status

#### Centralized Booking System
- **Backend Integration**: `GET /api/booking/offers`, `POST /api/booking/confirm`, `GET /api/booking/history`
- **Implementation**: Search, compare, book flights, hotels, activities
- **UI**: Search filters, offer cards, booking confirmation screen
- **Features**: Price comparison, booking history, cancellation (future)

#### Real-Time Notifications
- **Backend Integration**: WebSocket (`price_alert`, `chat_message`)
- **Implementation**: Push notifications, in-app notifications
- **UI**: Notification center, badge counts, toast messages
- **Features**: Price alerts, booking status updates, support messages

#### Integrated Payment System
- **Backend Integration**: `POST /api/payment/record`, `GET /api/payment/history`
- **Implementation**: Integrate Stripe/PayPal SDKs (future)
- **UI**: Payment form, payment history, receipt view
- **Features**: Secure payment processing, transaction history, refunds (future)

#### 24/7 Customer Support Chatbot
- **Backend Integration**: WebSocket (`chat_message`)
- **Implementation**: Chat interface with AI bot (future backend integration)
- **UI**: Chat screen with message bubbles, file attachments (future)
- **Features**: Instant responses, escalation to human agent (future)

### 8.3 Immersive Experience Features

#### AR Destination Explorer
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: ARCore integration for Android
- **UI**: AR camera view with overlay information
- **Features**: Point camera at landmarks, see information, directions

#### VR Travel Preview
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: 360° video/image viewer
- **UI**: VR view with navigation controls
- **Features**: Preview hotels, destinations, activities before booking

#### Personalized Travel Maps
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: Google Maps integration with custom markers
- **UI**: Interactive map with itinerary, points of interest
- **Features**: Create custom maps, share with friends, offline maps

#### Real-Time Reviews & Local Interactions
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: Review system, local user interactions
- **UI**: Review cards, rating system, user profiles
- **Features**: Read/write reviews, connect with locals, real-time updates

### 8.4 Social & Collaborative Features

#### Social Travel Planning
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: Group creation, voting system, collaboration
- **UI**: Group chat, voting interface, shared itinerary
- **Features**: Create travel groups, vote on choices, split costs

#### Instant Group Coordination
- **Backend Integration**: WebSocket for real-time updates (future)
- **Implementation**: Real-time group activity tracking
- **UI**: Group dashboard, activity feed, location sharing
- **Features**: Track group members, share expenses, coordinate activities

#### Travel Budget Planning
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: Budget tracker, expense categorization
- **UI**: Budget dashboard, expense charts, savings suggestions
- **Features**: Set budget, track expenses, get savings tips

### 8.5 Sustainability Features

#### Carbon Footprint Tracking
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: Calculate emissions, suggest eco-friendly options
- **UI**: Carbon footprint dashboard, eco-badges, suggestions
- **Features**: Track emissions, compare with averages, offset options

#### Local Event Integration
- **Backend Integration**: Not yet implemented (future feature)
- **Implementation**: Event discovery API integration
- **UI**: Event cards, calendar view, filters
- **Features**: Discover local events, add to itinerary, purchase tickets

---

## 9. Implementation Checklist

### Phase 1: Core Features (MVP)
- [ ] User authentication (register, login, logout)
- [ ] User profile management (view, edit)
- [ ] Booking search and display (offers)
- [ ] Booking confirmation
- [ ] Booking history
- [ ] Payment history (basic)
- [ ] WebSocket connection (price alerts, chat)

### Phase 2: Enhanced Features
- [ ] Real-time price alerts with notifications
- [ ] Customer support chat interface
- [ ] Offline support (local caching)
- [ ] Push notifications
- [ ] Image loading and caching
- [ ] Error handling and retry logic

### Phase 3: Advanced Features
- [ ] AI-powered recommendations
- [ ] AR destination explorer
- [ ] VR travel preview
- [ ] Social travel planning
- [ ] Carbon footprint tracking
- [ ] Local event integration

---

## 10. Testing Strategy

### Unit Tests
- Test ViewModels with mock repositories
- Test API service classes with mock responses
- Test data models and DTOs
- Test utility functions

### Integration Tests
- Test API integration with mock server (MockWebServer)
- Test Room database operations
- Test WebSocket connections
- Test authentication flow

### UI Tests
- Test login/register flows
- Test booking flow
- Test profile editing
- Test navigation between screens

### Manual Testing Checklist
- [ ] Test on different Android versions (API 21+)
- [ ] Test on different screen sizes
- [ ] Test with poor network conditions
- [ ] Test token expiration handling
- [ ] Test offline functionality
- [ ] Test WebSocket reconnection
- [ ] Test error scenarios

---

## 11. Environment Configuration

### Build Variants
```gradle
buildTypes {
    debug {
        buildConfigField "String", "API_BASE_URL", '"http://10.0.2.2:3000/api"'
        buildConfigField "String", "WS_URL", '"http://10.0.2.2:3000"'
    }
    release {
        buildConfigField "String", "API_BASE_URL", '"https://api.wayfindr.com/api"'
        buildConfigField "String", "WS_URL", '"https://api.wayfindr.com"'
    }
}
```

### Network Security Config
Create `res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

---

## 12. Additional Notes

### Backend Status
- ✅ Authentication (register, login) - Implemented
- ✅ User profile (get, update) - Implemented
- ✅ Booking (search, compare, confirm, history) - Implemented (stub data)
- ✅ Payment (history, record) - Implemented (stub)
- ✅ WebSocket (price alerts, chat) - Implemented
- ⏳ AI features - Not yet implemented
- ⏳ AR/VR features - Not yet implemented
- ⏳ Social features - Not yet implemented
- ⏳ Carbon footprint - Not yet implemented

### Important Reminders
1. **Never send `user_id` in booking confirmation** - Backend uses JWT token automatically
2. **Always include `Authorization: Bearer <token>` header** for protected endpoints
3. **Handle 401 responses** by clearing token and redirecting to login
4. **Store JWT token securely** using EncryptedSharedPreferences or Android Keystore
5. **Implement offline support** using Room database for caching
6. **Test WebSocket reconnection** logic for poor network conditions
7. **Validate all inputs client-side** before sending to API
8. **Use HTTPS in production** - never HTTP for sensitive data

### Future Backend Updates
- Payment gateway integration (Stripe/PayPal)
- Real booking provider integration (flights, hotels)
- AI recommendation engine
- AR/VR content APIs
- Social features APIs
- Carbon footprint calculation APIs
- Local event discovery APIs

---

## 13. Contact & Support

For backend API issues or questions:
- Check Swagger docs: `http://localhost:3000/api-docs` (development)
- Review backend README: `wayfinder/README.md`
- Test endpoints using Postman or similar tools

---

**END OF MASTER PROMPT**

This document is confidential and proprietary to Wayfindr. Do not share externally.

