# Wayfindr Android App - Master Development Prompt

## ⚠️ CONFIDENTIAL - PRIVATE PROJECT
This document contains proprietary information for Wayfindr Android application development. **DO NOT SHARE** this prompt with external parties or public repositories.

---

## 🚀 CURRENT PROJECT STATUS

### ✅ Completed (Android Side)
- **UI Screens**: All 20+ screens from Figma designs are complete using Jetpack Compose
- **Navigation**: Full navigation graph implemented with Material 3 bottom navigation bar
- **Architecture**: MVVM pattern established with ViewModelFactory and repositories
- **Networking Setup**: Retrofit client configured in `tn.esprit.wayfinder.network.RetrofitInstance`
- **API Service**: `ApiService` interface fully defined with all endpoints
- **Data Models**: All models created in `tn.esprit.wayfinder.models` package with `@Serializable` for kotlinx.serialization
- **Authentication Example**: SignUpViewModel and AuthRepository implemented as reference pattern
- **Package Structure**: `tn.esprit.wayfinder.ui.screens` contains all UI screens

### ⏳ Pending Integration (Your Mission)
- **ViewModels**: Create ViewModels for all features (Booking, Profile, Recommendations, Onboarding, etc.)
- **Repositories**: Create repositories for all features following AuthRepository pattern
- **API Integration**: Connect UI screens to backend APIs (replace all static/hardcoded data)
- **Onboarding Flow**: Implement dynamic AI questionnaire after login/registration
- **WebSocket**: Implement real-time price alerts and chat using Socket.IO
- **Error Handling**: Add comprehensive error handling, loading states, and user feedback
- **State Management**: Implement loading, success, and error states for all screens using StateFlow/Flow
- **Token Management**: Secure token storage and automatic token inclusion in API requests

### 🎯 Your Primary Tasks
1. **Complete ViewModel Layer**: Create ViewModels for Booking, Profile, Recommendations, Onboarding, Payment
2. **Complete Repository Layer**: Create repositories following the AuthRepository pattern
3. **Replace Static Data**: Connect all UI screens to live API endpoints
4. **Implement Onboarding**: Create dynamic questionnaire flow that appears after login if not completed
5. **Implement WebSocket**: Add real-time price alerts and chat functionality
6. **Add Error Handling**: Implement comprehensive error handling with user-friendly messages
7. **Add Loading States**: Show loading indicators during API calls
8. **Test Integration**: Ensure all API calls work correctly with the backend

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

## 1. UI/UX Screen Flow & Design Specifications

### 1.1 Screen Flow Overview
The app follows this user journey:
1. **Splash** → 2. **Welcome/Intro** → 3. **Login/Register** → 4. **AI Onboarding Form** (NEW - if not completed) → 5. **Home/Dashboard** → 6. **Search/Explore** → 7. **Offer Details** → 8. **Booking Flow** → 9. **Confirmation** → 10. **Profile/History**

**Critical Flow**: After login/registration, check `onboarding_completed` flag:
- If `false` → Navigate to **AI Onboarding Form** (one question at a time)
- If `true` → Navigate to **Home/Dashboard** with personalized recommendations

### 1.2 Screen Specifications

#### Screen 1: Splash/Onboarding Screen
- **Background**: Dark blue gradient
- **Logo**: "WAYFINDR" in red and yellow
- **Content**: Welcome message/tagline in white text
- **CTA**: White "Get Started" button at bottom
- **Purpose**: Brand introduction and initial entry point
- **Duration**: 2-3 seconds, then auto-navigate to Welcome screen

#### Screen 2: Welcome/Introductory Screen
- **Background**: White
- **Illustration**: Person with backpack, suitcase, and location pin (travel symbol)
- **Title**: "Bienvenue" / "Welcome"
- **Description**: App value proposition text
- **CTA**: Yellow "Continue" button
- **Purpose**: Introduce core value proposition
- **Navigation**: Continue → Login/Register screens

#### Screen 3: Login Screen
- **Background**: Light blue
- **Icon**: Circular icon with globe and airplane at top
- **Title**: "Login"
- **Input Fields**:
  - Username (text input)
  - Password (password input with show/hide toggle)
- **Links**: "Forgot Password?" (future feature)
- **CTA**: Blue "Login" button
- **Social Login**: Google, Apple icons (future feature)
- **Backend Integration**: `POST /api/auth/login`
- **Validation**: Client-side validation before API call

#### Screen 4: Registration Screen (Part 1)
- **Background**: Light blue
- **Icon**: Globe and airplane icon
- **Title**: "Register"
- **Input Fields**:
  - Name (first_name)
  - Surname (last_name)
  - Email (with email validation)
  - Password (minimum 6 characters, show strength indicator)
- **CTA**: Blue "Register" button
- **Backend Integration**: `POST /api/auth/register`
- **Navigation**: Register → Part 2 or auto-login after success

#### Screen 5: Registration Screen (Part 2)
- **Background**: Light blue
- **Input Fields**:
  - Phone Number (optional, future feature)
  - Date of Birth (date picker, optional)
  - Gender (dropdown, optional)
  - Country (dropdown/autocomplete)
  - City (dropdown/autocomplete)
- **CTA**: Blue "Complete Registration" button
- **Purpose**: Gather additional profile information
- **Backend Integration**: `PUT /api/user/profile` (after initial registration)

#### Screen 6A: AI Onboarding Form Screen (NEW - Appears after login if not completed)
- **Layout**:
  - Full-screen question display
  - Progress indicator at top (e.g., "Question 2 of ~8")
  - Question text (large, clear)
  - Answer options (varies by question type)
  - "Next" or "Continue" button (disabled until answer selected)
- **Question Types**:
  - **Single Choice**: Radio buttons (travel type, budget)
  - **Multiple Choice**: Checkboxes with min/max selections (interests, destination preferences)
  - **Text**: Text input field (future)
  - **Number**: Number input (future)
  - **Date**: Date picker (future)
- **Features**:
  - One question displayed at a time
  - Smooth transition between questions
  - Progress tracking
  - Ability to resume if app is closed
- **Backend Integration**:
  - `POST /api/onboarding/start` (initialize session)
  - `POST /api/onboarding/answer` (submit answer, get next question)
  - `GET /api/onboarding/status` (check status)
  - `POST /api/onboarding/resume` (resume incomplete session)
- **Navigation**: 
  - After completion → Home/Dashboard
  - On completion, backend automatically generates personalized recommendations

#### Screen 6: Home/Dashboard Screen
- **Layout**: 
  - Large hero image of featured destination (e.g., Rome) at top
  - Title: "Explore the World" or "Your Personalized Recommendations"
  - Section: "Recommended for You" with personalized destinations
  - Section: "Discover new places" with smaller image and text
  - Bottom navigation bar: Home, Search, Bookings, Profile icons
- **Features**:
  - **Personalized destination recommendations** (from `GET /api/recommendations/personalized`)
  - Quick access to search
  - Recent bookings preview
  - Match scores and reasons for each recommendation
  - Weather widget (future feature)
- **Backend Integration**: 
  - `GET /api/user/profile` (for user info)
  - `GET /api/recommendations/personalized` (personalized recommendations based on onboarding)
  - `GET /api/booking/history` (recent trips)
  - `GET /api/booking/offers` (featured destinations if no onboarding data)
- **Important**: 
  - If user has completed onboarding, show personalized recommendations
  - Display match scores and reasons for transparency
  - Allow users to see why each recommendation was made

#### Screen 7: Destination/Offer Detail Screen
- **Layout**:
  - Large destination image at top
  - Three circular icons in top-right (share, save/favorite, options menu)
  - Title: Destination name (e.g., "Mardi Trade Center")
  - Description text
  - Section: "5-day itinerary" (expandable)
  - Action icons row: Share, Favorite, Map, Review
  - CTA: Yellow "Book Now" button
- **Features**:
  - Image gallery (swipeable)
  - Price display
  - Rating/reviews (future feature)
  - Map integration (tap map icon)
- **Backend Integration**: 
  - `GET /api/booking/offers?offer_id=...` (offer details)
  - `GET /api/booking/compare?offer_id=...` (price breakdown)
- **Navigation**: Book Now → Booking confirmation flow

#### Screen 8: Search/Filter Screen
- **Background**: Light blue
- **Title**: "Search" / "Find Offers"
- **Input Fields**:
  - Destination (autocomplete/search)
  - Dates (date range picker)
  - Travelers (number picker)
  - Type of Trip (radio buttons: Flight, Hotel, Activity)
- **CTA**: Blue "Search" button
- **Backend Integration**: `GET /api/booking/offers?destination=...&dates=...&type=...`
- **Results**: Display in list/grid view with cards

#### Screen 9: Trip Type Selection Screen
- **Header**: Yellow with globe icon
- **Title**: "Choose your trip type"
- **Input Fields**:
  - Destination
  - Departure Date
  - Return Date
  - Number of Travelers
- **CTA**: Blue "Search" button
- **Purpose**: Alternative search interface with trip type focus

#### Screen 10: Calendar/Date Selection Screen
- **Background**: White
- **Title**: "Select Dates"
- **Calendar View**: November 2025 (or current month) with selectable dates
- **Input Fields**: 
  - Check-in date (pre-filled from calendar selection)
  - Check-out date (pre-filled from calendar selection)
- **CTA**: Yellow "Confirm" button
- **Features**: 
  - Highlight available dates
  - Disable past dates
  - Show price variations by date (future feature)

#### Screen 11: Modify Booking Screen
- **Background**: White
- **Title**: "Change Booking"
- **Input Fields**:
  - Departure Date (editable)
  - Return Date (editable)
  - Number of Travelers (editable)
- **CTA**: Red "Cancel Booking" or "Save Changes" button
- **Backend Integration**: Future endpoint for booking modification
- **Validation**: Ensure new dates are valid, check availability

#### Screen 12: Booking Details Screen
- **Background**: White
- **Title**: "Booking Details"
- **Content**:
  - Flight/Booking information (e.g., "Flight from Paris to London")
  - Dates and times
  - Passenger information
  - Large QR code icon (prominent)
- **CTA**: Blue "View Ticket" button
- **Features**:
  - QR code generation for ticket
  - Share booking option
  - Cancel booking option (if allowed)
- **Backend Integration**: `GET /api/booking/history` (specific booking by ID)

#### Screen 13: Confirmation/Payment Screen
- **Background**: White
- **Title**: "Confirmation"
- **Content**:
  - Booking summary (destination, dates, price breakdown)
  - Payment method selection (Stripe, PayPal)
  - Total amount (prominent)
- **CTA**: "Confirm Payment" button
- **Backend Integration**: `POST /api/booking/confirm`
- **Validation**: Ensure all required fields are filled

#### Screen 14: Payment Success Screen
- **Background**: White
- **Title**: "Payment Successful"
- **Content**:
  - Green checkmark icon
  - Amount paid
  - Transaction ID
  - Confirmation number
- **CTA**: Blue "View Receipt" button
- **Backend Integration**: `GET /api/payment/history` (latest transaction)
- **Navigation**: View Receipt → Receipt screen, or Continue → Booking details

#### Screen 15: Digital Ticket/Boarding Pass Screen
- **Background**: White
- **Title**: "Your Ticket"
- **Content**:
  - Flight/Booking details (origin, destination, date, time, gate, seat)
  - Large barcode/QR code (central, scannable)
- **CTA**: Blue "Add to Wallet" button (Google Wallet integration)
- **Features**:
  - QR code generation
  - Offline access (save locally)
  - Share ticket option
- **Backend Integration**: Booking data from `GET /api/booking/history`

#### Screen 16: Booking History/My Trips Screen
- **Background**: White
- **Title**: "My Trips" / "Booking History"
- **Layout**: Scrollable list of cards
- **Card Content**:
  - Destination image
  - Destination name
  - Dates
  - Status badge (confirmed, pending, cancelled)
  - Price
- **CTA**: Blue "View Details" button on each card
- **Backend Integration**: `GET /api/booking/history`
- **Features**:
  - Filter by status
  - Sort by date
  - Pull-to-refresh
  - Empty state when no bookings

#### Screen 17: Settings/Preferences Screen
- **Background**: White
- **Title**: "Settings" / "Preferences"
- **Options** (toggle switches):
  - Notifications (on/off)
  - Dark Mode (on/off)
  - Currency (dropdown)
  - Language (dropdown)
  - Privacy Settings (navigate to privacy screen)
  - Data Dashboard (navigate to data management)
- **Purpose**: App configuration and user preferences
- **Backend Integration**: `PUT /api/user/profile` (for preferences)

#### Screen 18: Profile/Account Management Screen
- **Background**: White
- **Title**: "My Account"
- **Content**:
  - User avatar (placeholder or uploaded image)
  - Name and email (from profile)
  - Options:
    - Edit Profile
    - Payment Methods
    - Privacy Settings
    - Data Dashboard
    - Logout
- **Backend Integration**: 
  - `GET /api/user/profile` (display current profile)
  - `PUT /api/user/profile` (update profile)

#### Screen 19: Notifications/Alerts Screen
- **Background**: White
- **Title**: "Notifications"
- **Layout**: List of notification cards
- **Notification Types**:
  - Price drop alerts (from WebSocket `price_alert`)
  - Flight delay notifications
  - Booking confirmations
  - Support messages (from WebSocket `chat_message`)
- **Features**:
  - Mark as read/unread
  - Delete notifications
  - Filter by type
- **Backend Integration**: WebSocket real-time updates

#### Screen 20: Explore/Recommendations Screen
- **Background**: White
- **Title**: "Explore"
- **Layout**: Grid of destination/theme cards
- **Content**: 
  - Images with labels (e.g., "Paris", "Rome", "Beach", "Mountains")
  - Travel themes and categories
- **CTA**: Blue "Explore" button on each card
- **Backend Integration**: `GET /api/booking/offers` (featured/popular destinations)
- **Features**: 
  - Personalized recommendations based on user preferences
  - Trending destinations
  - AI-powered suggestions (future feature)

### 1.3 Design System

#### Color Palette
- **Primary Blue**: Light blue (#E3F2FD or similar) - backgrounds, primary elements
- **Accent Yellow**: Yellow (#FFC107 or similar) - primary CTAs, highlights
- **Accent Red**: Red (#F44336 or similar) - alerts, cancellations, important actions
- **Dark Blue**: Dark blue (#1976D2 or similar) - headers, text
- **White**: White (#FFFFFF) - cards, content areas
- **Text Colors**: 
  - Primary text: Dark gray/black
  - Secondary text: Medium gray
  - Disabled text: Light gray

#### Typography
- **Font Family**: Sans-serif (Roboto or similar)
- **Headings**: Bold, 18-24sp
- **Body Text**: Regular, 14-16sp
- **Captions**: Regular, 12sp
- **Buttons**: Medium, 14-16sp

#### Components
- **Buttons**: 
  - Primary: Yellow background, dark text
  - Secondary: Blue background, white text
  - Danger: Red background, white text
  - Text: Transparent, colored text
- **Cards**: White background, rounded corners (8-12dp), elevation/shadow
- **Input Fields**: Light blue background, rounded corners, clear labels
- **Icons**: Modern, flat design, consistent stroke width

#### Navigation
- **Bottom Navigation**: 4 main tabs (Home, Search, Bookings, Profile)
- **Top Navigation**: Back button, title, action icons
- **Drawer Navigation**: Optional (for settings, help, etc.)

---

## 2. Backend API Configuration

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
  "access_token": "string (JWT token)",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "preferences": [],
    "status": "active",
    "onboarding_completed": false,
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  },
  "onboarding_completed": false
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Validation errors

**Android Implementation Notes**:
- Store `access_token` securely (EncryptedSharedPreferences or Android Keystore)
- Store user data locally after login
- **Check `onboarding_completed` flag**: If `false`, redirect to onboarding flow instead of home screen
- Include token in all subsequent API requests via Retrofit Interceptor
- Handle token expiration (redirect to login after 7 days or on 401 response)
- Implement "Remember Me" functionality using secure storage
- After login, check onboarding status and navigate accordingly

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

### 2.4 Onboarding Endpoints (NEW - AI Dynamic Form)

#### POST `/api/onboarding/start`
**Description**: Initialize onboarding form session for authenticated user. Called after login if `onboarding_completed` is `false`.

**Headers**: `Authorization: Bearer <token>` (required)

**Request Body**: None

**Response** (200 OK):
```json
{
  "session_id": "string (UUID)",
  "question": {
    "id": "q1",
    "type": "single_choice" | "multiple_choice" | "text" | "number" | "date",
    "text": "What type of trip are you planning?",
    "options": [
      { "value": "business", "label": "Business" },
      { "value": "leisure", "label": "Leisure" },
      { "value": "adventure", "label": "Adventure" }
    ],
    "required": true
  },
  "progress": {
    "current": 1,
    "total": null
  },
  "completed": false
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Onboarding already completed

**Android Implementation Notes**:
- Call this endpoint after login if `onboarding_completed` is `false`
- Display question in a full-screen composable
- Show only one question at a time
- Display progress indicator
- Question types:
  - `single_choice`: Radio buttons or dropdown
  - `multiple_choice`: Checkboxes (respect `min_selections` and `max_selections`)
  - `text`: Text input field
  - `number`: Number input field
  - `date`: Date picker

---

#### POST `/api/onboarding/answer`
**Description**: Submit answer to current question and receive next question

**Headers**: `Authorization: Bearer <token>` (required)

**Request Body**:
```json
{
  "session_id": "string (required)",
  "question_id": "string (required)",
  "answer": "string | number | array | object (required)"
}
```

**Response** (200 OK) - If more questions needed:
```json
{
  "session_id": "string",
  "question": {
    "id": "q2",
    "type": "multiple_choice",
    "text": "What activities interest you?",
    "options": [...],
    "required": true
  },
  "progress": {
    "current": 2,
    "total": null
  },
  "completed": false
}
```

**Response** (200 OK) - If form completed:
```json
{
  "session_id": "string",
  "completed": true,
  "recommendations_generated": true,
  "redirect_to": "home",
  "message": "Onboarding completed! Your personalized recommendations are ready."
}
```

**Android Implementation Notes**:
- Validate answer before sending (required fields, min/max selections)
- Show loading indicator while submitting answer
- If `completed: true`, navigate to home screen
- Store session_id locally to allow resuming if app is closed
- Handle answer format based on question type:
  - `single_choice`: Send string value
  - `multiple_choice`: Send array of selected values
  - `text`: Send string
  - `number`: Send number
  - `date`: Send ISO 8601 date string

---

#### GET `/api/onboarding/status`
**Description**: Get current onboarding status and progress

**Headers**: `Authorization: Bearer <token>` (required)

**Response** (200 OK):
```json
{
  "onboarding_completed": false,
  "session_id": "string | null",
  "progress": {
    "questions_answered": 3,
    "current_question_id": "q4"
  },
  "can_resume": true
}
```

**Android Implementation Notes**:
- Call this on app startup to check onboarding status
- If `can_resume: true`, allow user to resume onboarding
- Show progress indicator based on `questions_answered`

---

#### POST `/api/onboarding/resume`
**Description**: Resume incomplete onboarding session

**Headers**: `Authorization: Bearer <token>` (required)

**Request Body**:
```json
{
  "session_id": "string (optional, if not provided, get latest session)"
}
```

**Response**: Same as `/api/onboarding/start` (returns current question)

**Android Implementation Notes**:
- Use this to resume onboarding if user closed app mid-process
- If `session_id` is not provided, backend uses latest session

---

### 2.5 Recommendations Endpoints (NEW)

#### GET `/api/recommendations/personalized`
**Description**: Get personalized travel recommendations based on user preferences from onboarding

**Headers**: `Authorization: Bearer <token>` (required)

**Query Parameters**:
- `type` (optional): "destinations" | "offers" | "activities" | "all" (default: "all")
- `limit` (optional): number (default: 10)

**Response** (200 OK):
```json
{
  "destinations": [
    {
      "id": "dest_1",
      "name": "Paris, France",
      "image_url": "string",
      "match_score": 0.95,
      "reason": "Matches your preference for cultural experiences and mid-range budget",
      "highlights": ["Eiffel Tower", "Louvre Museum", "Seine River"],
      "estimated_cost": {
        "flight": 450,
        "hotel_per_night": 120,
        "currency": "USD"
      }
    }
  ],
  "offers": [
    {
      "id": "offer_1",
      "type": "flight",
      "destination": "Paris",
      "price": 450,
      "match_score": 0.92,
      "reason": "Best price for your preferred travel dates"
    }
  ],
  "activities": [
    {
      "id": "activity_1",
      "name": "Seine River Cruise",
      "type": "sightseeing",
      "destination": "Paris",
      "price": 25,
      "match_score": 0.88,
      "reason": "Matches your interest in cultural experiences"
    }
  ],
  "generated_at": "ISO 8601 datetime",
  "preferences_used": {
    "travel_type": "leisure",
    "budget": "mid_range",
    "interests": ["sightseeing", "culture"]
  }
}
```

**Android Implementation Notes**:
- Call this endpoint on home screen after onboarding is completed
- Display recommendations in cards with match scores
- Show "Why this recommendation?" tooltip with `reason` field
- Filter by type using query parameter
- Cache recommendations locally for offline access
- Refresh recommendations when user updates preferences

---

#### GET `/api/recommendations/regenerate`
**Description**: Regenerate recommendations (e.g., after updating preferences)

**Headers**: `Authorization: Bearer <token>` (required)

**Response**: Same as `/api/recommendations/personalized`

**Android Implementation Notes**:
- Call this when user updates preferences in profile
- Show loading indicator during regeneration
- Update UI with new recommendations

---

### 2.6 Payment Endpoints

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
@Serializable
data class User(
    @SerialName("_id") val id: String,
    val username: String,
    val email: String,
    @SerialName("first_name") val firstName: String,
    @SerialName("last_name") val lastName: String,
    val preferences: List<String>,
    val status: String, // "active" | "inactive" | "suspended"
    @SerialName("onboarding_completed") val onboardingCompleted: Boolean = false,
    @SerialName("onboarding_preferences") val onboardingPreferences: Map<String, Any>? = null,
    @SerialName("createdAt") val createdAt: String? = null,
    @SerialName("updatedAt") val updatedAt: String? = null
)

enum class UserStatus {
    ACTIVE, INACTIVE, SUSPENDED
}
```

### Onboarding Models
```kotlin
@Serializable
data class OnboardingQuestion(
    val id: String,
    val type: String, // "single_choice" | "multiple_choice" | "text" | "number" | "date"
    val text: String,
    val options: List<QuestionOption>? = null,
    val required: Boolean = true,
    @SerialName("min_selections") val minSelections: Int? = null,
    @SerialName("max_selections") val maxSelections: Int? = null
)

@Serializable
data class QuestionOption(
    val value: String,
    val label: String,
    val min: Double? = null,
    val max: Double? = null
)

@Serializable
data class OnboardingResponse(
    @SerialName("session_id") val sessionId: String,
    val question: OnboardingQuestion,
    val progress: Progress,
    val completed: Boolean,
    @SerialName("redirect_to") val redirectTo: String? = null,
    val message: String? = null
)

@Serializable
data class Progress(
    val current: Int,
    val total: Int? = null
)

@Serializable
data class OnboardingStatus(
    @SerialName("onboarding_completed") val onboardingCompleted: Boolean,
    @SerialName("session_id") val sessionId: String? = null,
    val progress: OnboardingProgress,
    @SerialName("can_resume") val canResume: Boolean
)

@Serializable
data class OnboardingProgress(
    @SerialName("questions_answered") val questionsAnswered: Int,
    @SerialName("current_question_id") val currentQuestionId: String? = null
)

@Serializable
data class AnswerRequest(
    @SerialName("session_id") val sessionId: String,
    @SerialName("question_id") val questionId: String,
    val answer: @Contextual Any // Can be String, Int, List<String>, etc.
)
```

### Recommendation Models
```kotlin
@Serializable
data class PersonalizedRecommendations(
    val destinations: List<Destination>? = null,
    val offers: List<Offer>? = null,
    val activities: List<Activity>? = null,
    @SerialName("generated_at") val generatedAt: String,
    @SerialName("preferences_used") val preferencesUsed: Map<String, Any>
)

@Serializable
data class Destination(
    val id: String,
    val name: String,
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("match_score") val matchScore: Double,
    val reason: String,
    val highlights: List<String>,
    @SerialName("estimated_cost") val estimatedCost: EstimatedCost
)

@Serializable
data class EstimatedCost(
    val flight: Double,
    @SerialName("hotel_per_night") val hotelPerNight: Double,
    val currency: String = "USD"
)

@Serializable
data class Activity(
    val id: String,
    val name: String,
    val type: String,
    val destination: String,
    val price: Double,
    @SerialName("match_score") val matchScore: Double,
    val reason: String
)
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

### Current Architecture (Already Implemented - DO NOT CHANGE)
- **Architecture Pattern**: MVVM (Model-View-ViewModel) ✅
- **UI Framework**: 100% Jetpack Compose ✅
- **Dependency Injection**: ViewModelFactory pattern (ready for Hilt integration if needed)
- **Networking**: Retrofit 2 + OkHttp ✅
- **JSON Parsing**: kotlinx.serialization (NOT Gson - already configured) ✅
- **Serialization**: Use `@Serializable` annotation on all data classes
- **Local Database**: Room Database (structure ready, needs implementation)
- **Reactive Programming**: Kotlin Coroutines + Flow ✅
- **Image Loading**: Coil (recommended for Compose)
- **WebSocket**: Socket.IO Client for Android (needs implementation)
- **Navigation**: Jetpack Navigation Component ✅
- **Package**: `tn.esprit.wayfinder`

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

### Key Android Libraries (Already in Project)
```gradle
// Networking (ALREADY CONFIGURED)
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
// IMPORTANT: Use kotlinx.serialization converter, NOT Gson
implementation 'com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0'
implementation 'com.squareup.okhttp3:okhttp:4.12.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'

// Kotlinx Serialization (ALREADY CONFIGURED)
implementation 'org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0'
plugin 'org.jetbrains.kotlin.plugin.serialization'

// WebSocket (NEEDS TO BE ADDED)
implementation 'io.socket:socket.io-client:2.1.0'

// Jetpack Compose (ALREADY IN PROJECT)
implementation 'androidx.compose.ui:ui:1.5.4'
implementation 'androidx.compose.material3:material3:1.1.2'
implementation 'androidx.activity:activity-compose:1.8.1'

// ViewModel (ALREADY IN PROJECT)
implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
implementation 'androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0'
implementation 'androidx.lifecycle:lifecycle-runtime-compose:2.7.0'

// Coroutines (ALREADY IN PROJECT)
implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'

// Navigation (ALREADY IN PROJECT)
implementation 'androidx.navigation:navigation-compose:2.7.6'

// Room Database (ADD IF NEEDED FOR CACHING)
implementation 'androidx.room:room-runtime:2.6.1'
kapt 'androidx.room:room-compiler:2.6.1'
implementation 'androidx.room:room-ktx:2.6.1'

// Security (ADD FOR TOKEN STORAGE)
implementation 'androidx.security:security-crypto:1.1.0-alpha06'

// Image Loading (RECOMMENDED FOR COMPOSE)
implementation 'io.coil-kt:coil-compose:2.5.0'

// WebSocket (ADD FOR REAL-TIME FEATURES)
implementation 'io.socket:socket.io-client:2.1.0'
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

## 8. Core Features & Functionalities

### 8.1 Personalized Travel Recommendations
**Description**: The app asks users for basic information such as their travel style and budget to generate a set of personalized recommendations. These include options for flights, accommodations, and local activities.

**Implementation**:
- **Interactive Forms**: Ask users simple questions about:
  - Travel type (business, leisure, adventure, family, etc.)
  - Budget range (budget, mid-range, luxury)
  - Preferred destinations or travel style
  - Travel dates and duration
- **AI-Powered Suggestions**: Use user preferences and booking history to recommend:
  - Flights matching budget and preferences
  - Hotels in preferred areas and price range
  - Activities aligned with travel style
- **Backend Integration**: 
  - `GET /api/booking/offers` with user preferences
  - Future: AI recommendation endpoint
- **UI**: Display recommendations in cards on Home/Dashboard and Explore screens
- **Personalization**: Track user behavior, past trips, and preferences to fine-tune recommendations

### 8.2 User Profile and Preferences
**Description**: Users can create and manage their profiles, which helps the app offer even more tailored suggestions over time.

**Implementation**:
- **Profile Creation**: Registration screens (Part 1 & 2) collect:
  - Basic info: name, email, password
  - Additional info: phone, date of birth, gender, country, city
  - Travel preferences: interests, budget, travel style
- **Profile Management**: 
  - Edit profile screen
  - Update preferences (preferences array in user model)
  - Manage account settings
- **Backend Integration**: 
  - `POST /api/auth/register` (initial registration)
  - `PUT /api/user/profile` (update profile and preferences)
  - `GET /api/user/profile` (retrieve profile)
- **Data Tracking**: Track user behavior, past trips, and preferences for personalization

### 8.3 Weather and Location Information
**Description**: Integration with real-time weather updates to help travelers stay informed about conditions at their destination.

**Implementation**:
- **Weather API Integration**: Integrate with weather service (OpenWeatherMap, WeatherAPI, etc.)
- **Display**: 
  - Weather widget on Home/Dashboard screen
  - Weather information on destination detail screens
  - Weather alerts for upcoming trips
- **Features**:
  - Current weather at destination
  - 5-day forecast
  - Weather-based activity suggestions
  - Packing recommendations based on weather
- **Backend Integration**: Future endpoint for weather data (or call weather API directly from Android)
- **UI**: Weather cards with icons, temperature, conditions

### 8.4 Map Integration and Navigation
**Description**: Map feature that helps users find their way around their destination, with points of interest, local businesses, and travel routes.

**Implementation**:
- **Map Library**: Google Maps SDK for Android
- **Features**:
  - Display destination on map
  - Show points of interest (POIs)
  - Display local businesses (restaurants, attractions, etc.)
  - Show travel routes and directions
  - Offline maps support
- **UI**: 
  - Map icon on destination detail screens
  - Full-screen map view
  - Custom markers for bookings, saved places
- **Backend Integration**: 
  - Store location data in bookings
  - Future: POI recommendations endpoint
- **Navigation**: Integration with Google Maps navigation (future feature)

### 8.5 Booking and Scheduling Tools
**Description**: Functionality for booking flights, hotels, and scheduling activities directly through the app, with calendar for selecting travel dates.

**Implementation**:
- **Search Flow**:
  - Search/Filter screen for finding offers
  - Calendar/Date Selection screen for choosing dates
  - Trip Type Selection screen
- **Booking Flow**:
  - Offer detail screen → Book Now
  - Confirmation/Payment screen
  - Payment Success screen
  - Booking Details screen
- **Calendar Integration**:
  - Date picker for selecting travel dates
  - Display bookings on calendar view
  - Show availability and pricing by date
- **Backend Integration**:
  - `GET /api/booking/offers` (search)
  - `GET /api/booking/compare` (price breakdown)
  - `POST /api/booking/confirm` (create booking)
  - `GET /api/booking/history` (view bookings)
- **Features**:
  - Quick booking process
  - Save bookings for later
  - Modify bookings (future feature)
  - Cancel bookings (future feature)

### 8.6 Barcode and QR Code Scanning
**Description**: Ability to scan barcodes or QR codes for accessing tickets, checking in to services, or interacting with local travel-related businesses.

**Implementation**:
- **Library**: ML Kit Barcode Scanning or ZXing
- **Use Cases**:
  - Scan QR code on digital ticket/boarding pass
  - Check-in at hotels/airports
  - Access local business offers/discounts
  - Share bookings via QR code
- **UI**:
  - QR code display on Digital Ticket screen
  - Scanner screen with camera viewfinder
  - Success/error feedback
- **Features**:
  - Generate QR codes for bookings
  - Scan QR codes for check-in
  - Save QR codes to device (Google Wallet integration)
- **Backend Integration**: QR code contains booking confirmation number or booking ID

### 8.7 Interactive Forms and Surveys
**Description**: Ask interactive, fun, and personal questions to gather more detailed preferences for fine-tuning recommendations.

**Implementation**:
- **Onboarding Survey**: 
  - Travel style questions (adventure, relaxation, culture, etc.)
  - Budget preferences
  - Preferred destinations
  - Travel frequency
- **Preference Forms**:
  - Update preferences in Settings/Preferences screen
  - Interactive preference selector (chips, sliders, etc.)
- **AI Questions**: 
  - Fun, engaging questions to understand user personality
  - Travel goals and aspirations
  - Past travel experiences
- **Backend Integration**: 
  - Store preferences in `user.preferences` array
  - `PUT /api/user/profile` to update preferences
- **UI**: 
  - Step-by-step form with progress indicator
  - Visual preference selectors
  - Skip option for optional questions

---

## 9. Ethical Considerations & Privacy Requirements

### 9.1 Privacy & Data Protection
**Critical Requirement**: The app collects sensitive personal data to generate personalized recommendations. User information must be safeguarded to prevent misuse or breaches.

**Implementation Requirements**:
- **Data Encryption**:
  - Encrypt data in transit (HTTPS/TLS)
  - Encrypt sensitive data at rest (Android Keystore)
  - Use EncryptedSharedPreferences for storing tokens
- **Data Minimization**: 
  - Only collect necessary data
  - Request permissions only when needed
  - Allow users to delete their data
- **GDPR Compliance**:
  - Obtain explicit consent for data collection
  - Provide data export functionality
  - Implement right to be forgotten (account deletion)
  - Clear privacy policy and terms of service
- **Security Measures**:
  - Implement certificate pinning for API calls
  - Use secure authentication (JWT tokens)
  - Regular security audits
  - Protect against common vulnerabilities (OWASP Mobile Top 10)

### 9.2 Transparency in Recommendations
**Critical Requirement**: Users must be fully informed about how their data is used and how the algorithm influences recommendations.

**Implementation Requirements**:
- **Data Dashboard** (Screen 18 - Profile):
  - Show what data is collected
  - Display how data is used for recommendations
  - Allow users to view and manage their data
  - Show recommendation reasoning (when AI is implemented)
- **Transparency Features**:
  - Explain why specific recommendations are shown
  - Show factors influencing recommendations (budget, preferences, history)
  - Display data sources and algorithm confidence
  - Provide "Why this recommendation?" button on offer cards
- **User Control**:
  - Allow users to adjust recommendation factors
  - Provide option to disable personalization
  - Clear data and reset preferences
- **Backend Integration**: Future endpoint for recommendation explanation

### 9.3 Algorithm Fairness & Bias Prevention
**Critical Requirement**: Ensure recommendations are fair and not discriminatory, serving all users equally regardless of background.

**Implementation Requirements**:
- **Diverse Recommendations**:
  - Show variety in destinations, price ranges, and options
  - Avoid over-recommending based on single factor
  - Include options outside user's typical preferences
- **Bias Detection**:
  - Monitor recommendation patterns
  - Test with diverse user groups
  - Regular algorithm audits
- **User Feedback**:
  - Allow users to report biased recommendations
  - Collect feedback on recommendation quality
  - Use feedback to improve algorithm
- **Transparency**: Explain how algorithm works in simple terms

### 9.4 Accountability & Compliance
**Critical Requirement**: Developers must take full responsibility for ensuring compliance with data protection regulations.

**Implementation Requirements**:
- **Privacy Policy**: 
  - Clear, accessible privacy policy
  - Explain data collection and usage
  - Update policy when changes occur
- **Terms of Service**:
  - Clear terms of service
  - User rights and responsibilities
  - Service limitations and disclaimers
- **Data Protection Officer**: Designate DPO for GDPR compliance
- **Regular Audits**: 
  - Security audits
  - Privacy impact assessments
  - Algorithm fairness reviews
- **User Rights**:
  - Right to access data
  - Right to rectification
  - Right to erasure
  - Right to data portability
  - Right to object to processing

### 9.5 Privacy Features Implementation

#### Data Dashboard Screen (New Screen)
- **Location**: Accessible from Profile/Settings screen
- **Sections**:
  1. **Data Overview**: 
     - What data we collect
     - How data is used
     - Data retention period
  2. **Personal Data**:
     - View all collected data
     - Edit personal information
     - Download data (JSON/CSV export)
  3. **Recommendation Settings**:
     - Toggle personalization on/off
     - Adjust recommendation factors
     - Clear recommendation history
  4. **Privacy Controls**:
     - Manage data sharing preferences
     - Control location tracking
     - Manage notification preferences
  5. **Account Deletion**:
     - Request account deletion
     - Download data before deletion
     - Confirm deletion action
- **Backend Integration**: 
  - Future endpoints for data export
  - Future endpoint for account deletion
  - `GET /api/user/profile` (current data)

#### Privacy Settings Screen
- **Location**: Accessible from Settings/Profile
- **Options**:
  - Location Services (on/off)
  - Analytics & Tracking (on/off)
  - Personalized Ads (on/off)
  - Data Sharing with Partners (on/off)
  - Biometric Authentication (on/off)
- **Backend Integration**: Store preferences in user profile

---

## 10. Feature Requirements (From Original Spec)

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

## 13. Testing Strategy

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

## 14. Environment Configuration

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

## 15. Additional Notes

### Backend Status
- ✅ Authentication (register, login) - Implemented with onboarding status
- ✅ User profile (get, update) - Implemented with onboarding fields
- ✅ Booking (search, compare, confirm, history) - Implemented (stub data)
- ✅ Payment (history, record) - Implemented (stub)
- ✅ WebSocket (price alerts, chat) - Implemented
- ✅ Onboarding (AI dynamic form) - Implemented with question flow
- ✅ Recommendations (personalized) - Implemented with preference matching
- ⏳ AI external integration (OpenAI/Gemini) - Not yet implemented
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

## 16. Implementation Guide for Android Development

### 16.1 Step-by-Step Integration Process

#### Step 1: Update ApiService Interface
Add new endpoints to `tn.esprit.wayfinder.network.ApiService`:

```kotlin
interface ApiService {
    // Existing endpoints...
    
    // Onboarding endpoints
    @POST("onboarding/start")
    suspend fun startOnboarding(): OnboardingResponse
    
    @POST("onboarding/answer")
    suspend fun submitAnswer(@Body answer: AnswerRequest): OnboardingResponse
    
    @GET("onboarding/status")
    suspend fun getOnboardingStatus(): OnboardingStatus
    
    @POST("onboarding/resume")
    suspend fun resumeOnboarding(@Body request: ResumeRequest): OnboardingResponse
    
    // Recommendations endpoints
    @GET("recommendations/personalized")
    suspend fun getPersonalizedRecommendations(
        @Query("type") type: String = "all",
        @Query("limit") limit: Int = 10
    ): PersonalizedRecommendations
    
    @GET("recommendations/regenerate")
    suspend fun regenerateRecommendations(): PersonalizedRecommendations
}
```

#### Step 2: Create Data Models
Add all models to `tn.esprit.wayfinder.models` package with `@Serializable` annotation:

```kotlin
// Use kotlinx.serialization, NOT Gson
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName

@Serializable
data class LoginResponse(
    @SerialName("access_token") val accessToken: String,
    val user: User,
    @SerialName("onboarding_completed") val onboardingCompleted: Boolean
)

// Add all other models as shown in Section 4
```

#### Step 3: Update Login Flow
Modify login logic to check onboarding status:

```kotlin
// In LoginViewModel or AuthViewModel
fun login(username: String, password: String) {
    viewModelScope.launch {
        try {
            _uiState.value = UiState.Loading
            val response = authRepository.login(username, password)
            
            // Store token securely
            tokenManager.saveToken(response.accessToken)
            tokenManager.saveUser(response.user)
            
            // Check onboarding status
            if (response.onboardingCompleted) {
                _uiState.value = UiState.Success(navigateTo = "home")
            } else {
                _uiState.value = UiState.Success(navigateTo = "onboarding")
            }
        } catch (e: Exception) {
            _uiState.value = UiState.Error(e.message ?: "Login failed")
        }
    }
}
```

#### Step 4: Create Onboarding ViewModel
Create `OnboardingViewModel` following the AuthViewModel pattern:

```kotlin
class OnboardingViewModel(
    private val onboardingRepository: OnboardingRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<OnboardingUiState>(OnboardingUiState.Idle)
    val uiState: StateFlow<OnboardingUiState> = _uiState.asStateFlow()
    
    private var currentSessionId: String? = null
    
    fun startOnboarding() {
        viewModelScope.launch {
            try {
                _uiState.value = OnboardingUiState.Loading
                val response = onboardingRepository.startOnboarding()
                currentSessionId = response.sessionId
                _uiState.value = OnboardingUiState.QuestionLoaded(
                    question = response.question,
                    progress = response.progress
                )
            } catch (e: Exception) {
                _uiState.value = OnboardingUiState.Error(e.message ?: "Failed to start onboarding")
            }
        }
    }
    
    fun submitAnswer(questionId: String, answer: Any) {
        viewModelScope.launch {
            try {
                _uiState.value = OnboardingUiState.Loading
                val sessionId = currentSessionId ?: return@launch
                
                val response = onboardingRepository.submitAnswer(
                    AnswerRequest(sessionId, questionId, answer)
                )
                
                if (response.completed) {
                    _uiState.value = OnboardingUiState.Completed(
                        message = response.message ?: "Onboarding completed!"
                    )
                } else {
                    _uiState.value = OnboardingUiState.QuestionLoaded(
                        question = response.question,
                        progress = response.progress
                    )
                }
            } catch (e: Exception) {
                _uiState.value = OnboardingUiState.Error(e.message ?: "Failed to submit answer")
            }
        }
    }
}

sealed class OnboardingUiState {
    object Idle : OnboardingUiState()
    object Loading : OnboardingUiState()
    data class QuestionLoaded(
        val question: OnboardingQuestion,
        val progress: Progress
    ) : OnboardingUiState()
    data class Completed(val message: String) : OnboardingUiState()
    data class Error(val message: String) : OnboardingUiState()
}
```

#### Step 5: Create Onboarding Repository
Create `OnboardingRepository` following the AuthRepository pattern:

```kotlin
class OnboardingRepository(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) {
    suspend fun startOnboarding(): OnboardingResponse {
        return apiService.startOnboarding()
    }
    
    suspend fun submitAnswer(answer: AnswerRequest): OnboardingResponse {
        return apiService.submitAnswer(answer)
    }
    
    suspend fun getStatus(): OnboardingStatus {
        return apiService.getOnboardingStatus()
    }
    
    suspend fun resume(sessionId: String?): OnboardingResponse {
        return apiService.resumeOnboarding(ResumeRequest(sessionId))
    }
}
```

#### Step 6: Create Onboarding Screen (Compose)
Create `OnboardingScreen.kt` in `tn.esprit.wayfinder.ui.screens`:

```kotlin
@Composable
fun OnboardingScreen(
    viewModel: OnboardingViewModel = viewModel(),
    onComplete: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.startOnboarding()
    }
    
    when (val state = uiState) {
        is OnboardingUiState.Loading -> {
            LoadingIndicator()
        }
        is OnboardingUiState.QuestionLoaded -> {
            QuestionScreen(
                question = state.question,
                progress = state.progress,
                onAnswer = { answer ->
                    viewModel.submitAnswer(state.question.id, answer)
                }
            )
        }
        is OnboardingUiState.Completed -> {
            LaunchedEffect(state) {
                delay(2000) // Show completion message
                onComplete()
            }
            CompletionMessage(message = state.message)
        }
        is OnboardingUiState.Error -> {
            ErrorScreen(message = state.message) {
                viewModel.startOnboarding()
            }
        }
        else -> {}
    }
}

@Composable
fun QuestionScreen(
    question: OnboardingQuestion,
    progress: Progress,
    onAnswer: (Any) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Progress indicator
        LinearProgressIndicator(
            progress = { progress.current.toFloat() / 10f }, // Estimate total
            modifier = Modifier.fillMaxWidth()
        )
        
        Text(
            text = question.text,
            style = MaterialTheme.typography.headlineSmall
        )
        
        // Render question based on type
        when (question.type) {
            "single_choice" -> {
                question.options?.forEach { option ->
                    RadioButton(
                        selected = false,
                        onClick = { onAnswer(option.value) },
                        label = { Text(option.label) }
                    )
                }
            }
            "multiple_choice" -> {
                var selectedOptions by remember { mutableStateOf<List<String>>(emptyList()) }
                
                question.options?.forEach { option ->
                    Checkbox(
                        checked = selectedOptions.contains(option.value),
                        onCheckedChange = { checked ->
                            selectedOptions = if (checked) {
                                selectedOptions + option.value
                            } else {
                                selectedOptions - option.value
                            }
                        },
                        label = { Text(option.label) }
                    )
                }
                
                Button(
                    onClick = { onAnswer(selectedOptions) },
                    enabled = selectedOptions.isNotEmpty()
                ) {
                    Text("Next")
                }
            }
            // Add other question types...
        }
    }
}
```

#### Step 7: Update Navigation Graph
Update `AppNavigation.kt` to include onboarding flow:

```kotlin
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val tokenManager = remember { TokenManager(context) }
    
    NavHost(
        navController = navController,
        startDestination = if (tokenManager.hasToken()) "home" else "login"
    ) {
        composable("login") { LoginScreen(onLoginSuccess = { onboardingCompleted ->
            if (onboardingCompleted) {
                navController.navigate("home") {
                    popUpTo("login") { inclusive = true }
                }
            } else {
                navController.navigate("onboarding") {
                    popUpTo("login") { inclusive = true }
                }
            }
        })}
        
        composable("onboarding") {
            OnboardingScreen(onComplete = {
                navController.navigate("home") {
                    popUpTo("onboarding") { inclusive = true }
                }
            })
        }
        
        composable("home") { HomeScreen() }
        // ... other routes
    }
}
```

#### Step 8: Create Recommendations ViewModel
Create `RecommendationsViewModel`:

```kotlin
class RecommendationsViewModel(
    private val recommendationsRepository: RecommendationsRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<RecommendationsUiState>(RecommendationsUiState.Idle)
    val uiState: StateFlow<RecommendationsUiState> = _uiState.asStateFlow()
    
    fun loadRecommendations(type: String = "all") {
        viewModelScope.launch {
            try {
                _uiState.value = RecommendationsUiState.Loading
                val recommendations = recommendationsRepository.getPersonalizedRecommendations(type)
                _uiState.value = RecommendationsUiState.Success(recommendations)
            } catch (e: Exception) {
                _uiState.value = RecommendationsUiState.Error(e.message ?: "Failed to load recommendations")
            }
        }
    }
}
```

#### Step 9: Update Home Screen
Replace static data with live recommendations:

```kotlin
@Composable
fun HomeScreen(
    viewModel: RecommendationsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadRecommendations()
    }
    
    when (val state = uiState) {
        is RecommendationsUiState.Loading -> {
            LoadingIndicator()
        }
        is RecommendationsUiState.Success -> {
            LazyColumn {
                item {
                    Text("Personalized Recommendations", style = MaterialTheme.typography.headlineMedium)
                }
                items(state.recommendations.destinations ?: emptyList()) { destination ->
                    DestinationCard(destination)
                }
                items(state.recommendations.offers ?: emptyList()) { offer ->
                    OfferCard(offer)
                }
                items(state.recommendations.activities ?: emptyList()) { activity ->
                    ActivityCard(activity)
                }
            }
        }
        is RecommendationsUiState.Error -> {
            ErrorMessage(message = state.message)
        }
        else -> {}
    }
}
```

#### Step 10: Implement Token Interceptor
Create Retrofit interceptor to automatically add token:

```kotlin
class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = tokenManager.getToken()
        
        val newRequest = if (token != null) {
            request.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            request
        }
        
        return chain.proceed(newRequest)
    }
}

// In RetrofitInstance.kt
val client = OkHttpClient.Builder()
    .addInterceptor(AuthInterceptor(tokenManager))
    .addInterceptor(HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    })
    .build()
```

### 16.2 Key Implementation Notes

1. **Use kotlinx.serialization**: All data classes must use `@Serializable` and `@SerialName` for field mapping
2. **State Management**: Use `StateFlow` or `Flow` in ViewModels, collect in Composable with `collectAsState()`
3. **Error Handling**: Always handle errors and show user-friendly messages
4. **Loading States**: Show loading indicators during API calls
5. **Navigation**: Check onboarding status after login and navigate accordingly
6. **Token Storage**: Use EncryptedSharedPreferences or Android Keystore
7. **API Calls**: Use suspend functions in repositories, call from ViewModel with `viewModelScope.launch`

### 16.3 Testing Checklist

- [ ] Login flow works and checks onboarding status
- [ ] Onboarding flow displays questions one at a time
- [ ] Answers are submitted correctly
- [ ] Onboarding completion redirects to home
- [ ] Home screen displays personalized recommendations
- [ ] All API calls include authentication token
- [ ] Error handling works for all endpoints
- [ ] Loading states display correctly
- [ ] Token is stored securely
- [ ] Navigation flow works correctly

---

## 17. Contact & Support

For backend API issues or questions:
- Check Swagger docs: `http://localhost:3000/api-docs` (development)
- Review backend README: `wayfinder/README.md`
- Test endpoints using Postman or similar tools

---

---

## 18. Quick Reference for Gemini AI Agent

### 🎯 Your Mission Summary
You need to complete the Android app integration with the fully functional backend. The UI is 100% complete with Jetpack Compose, but all data is static. Your job is to make it dynamic by connecting to the backend APIs.

### 📋 Priority Task List (In Order)

1. **Update Login Response Model**
   - Add `onboarding_completed` field to LoginResponse
   - Update login logic to check this flag and navigate accordingly

2. **Create Onboarding Feature** (HIGH PRIORITY)
   - Create OnboardingViewModel and OnboardingRepository
   - Create OnboardingScreen composable
   - Implement one-question-at-a-time flow
   - Add onboarding route to navigation graph
   - Handle question types: single_choice, multiple_choice

3. **Create Recommendations Feature**
   - Create RecommendationsViewModel and RecommendationsRepository
   - Update HomeScreen to use live recommendations
   - Display match scores and reasons
   - Replace all static destination/offer data

4. **Create Remaining ViewModels**
   - BookingViewModel (for booking flow)
   - ProfileViewModel (for profile management)
   - PaymentViewModel (for payment history)

5. **Create Remaining Repositories**
   - BookingRepository
   - ProfileRepository
   - PaymentRepository

6. **Update All Screens**
   - Replace static data with API calls
   - Add loading states
   - Add error handling
   - Add pull-to-refresh where appropriate

7. **Implement WebSocket**
   - Connect to Socket.IO server
   - Listen for price_alert events
   - Listen for chat_message events
   - Show notifications

8. **Add Token Management**
   - Create TokenManager class
   - Implement secure token storage
   - Add AuthInterceptor to Retrofit
   - Handle token expiration

### 🔑 Critical Implementation Details

#### kotlinx.serialization (NOT Gson)
```kotlin
// ✅ CORRECT
@Serializable
data class User(
    @SerialName("_id") val id: String,
    @SerialName("first_name") val firstName: String
)

// ❌ WRONG - Don't use Gson annotations
data class User(
    @SerializedName("_id") val id: String
)
```

#### Retrofit Converter
```kotlin
// ✅ Use kotlinx.serialization converter
Retrofit.Builder()
    .baseUrl(BASE_URL)
    .client(client)
    .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
    .build()
```

#### State Management Pattern
```kotlin
// ViewModel
private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
val uiState: StateFlow<UiState> = _uiState.asStateFlow()

// Composable
val uiState by viewModel.uiState.collectAsState()
when (uiState) {
    is UiState.Loading -> LoadingIndicator()
    is UiState.Success -> ContentScreen(data = uiState.data)
    is UiState.Error -> ErrorScreen(message = uiState.message)
}
```

#### Navigation After Login
```kotlin
// After successful login
if (loginResponse.onboardingCompleted) {
    navController.navigate("home") { popUpTo("login") { inclusive = true } }
} else {
    navController.navigate("onboarding") { popUpTo("login") { inclusive = true } }
}
```

### 📦 Required Models to Create

1. **Onboarding Models**:
   - `OnboardingQuestion`
   - `QuestionOption`
   - `OnboardingResponse`
   - `Progress`
   - `OnboardingStatus`
   - `AnswerRequest`

2. **Recommendation Models**:
   - `PersonalizedRecommendations`
   - `Destination`
   - `EstimatedCost`
   - `Activity`

3. **Updated Models**:
   - `LoginResponse` (add onboarding_completed and user fields)
   - `User` (add onboarding_completed and onboarding_preferences fields)

### 🔄 User Flow to Implement

```
1. User opens app
2. Check if token exists
   - No → Show Login/Register screens
   - Yes → Check onboarding status
3. After Login:
   - If onboarding_completed = false → Show Onboarding Screen
   - If onboarding_completed = true → Show Home Screen
4. Onboarding Screen:
   - Call POST /api/onboarding/start
   - Display first question
   - User answers → Call POST /api/onboarding/answer
   - Display next question
   - Repeat until completed
   - On completion → Navigate to Home Screen
5. Home Screen:
   - Call GET /api/recommendations/personalized
   - Display personalized destinations, offers, activities
   - Show match scores and reasons
```

### ⚠️ Important Notes

1. **Never use Gson** - The project uses kotlinx.serialization
2. **Always use @SerialName** for field mapping (backend uses snake_case, Kotlin uses camelCase)
3. **Check onboarding_completed after login** - This determines navigation
4. **One question at a time** - Onboarding form shows only current question
5. **Store session_id** - Allow users to resume onboarding if app is closed
6. **Use StateFlow for state management** - Already established pattern
7. **Handle all error states** - Network errors, validation errors, etc.
8. **Show loading indicators** - During all API calls
9. **Secure token storage** - Use EncryptedSharedPreferences
10. **Add AuthInterceptor** - Automatically add Bearer token to all requests

### 🧪 Testing Requirements

Before considering the task complete, test:
- [ ] User can register and login
- [ ] After login, if onboarding_completed = false, onboarding screen appears
- [ ] Onboarding questions appear one at a time
- [ ] Answers can be submitted and next question appears
- [ ] Onboarding completion redirects to home
- [ ] Home screen shows personalized recommendations
- [ ] All API calls include authentication token
- [ ] Error handling works for all scenarios
- [ ] Loading states display correctly
- [ ] Token persists after app restart
- [ ] User can resume onboarding if app was closed

### 📚 Reference Files in Project

- **Networking**: `tn.esprit.wayfinder.network.RetrofitInstance`
- **API Service**: `tn.esprit.wayfinder.network.ApiService`
- **Models**: `tn.esprit.wayfinder.models` package
- **UI Screens**: `tn.esprit.wayfinder.ui.screens` package
- **Navigation**: `tn.esprit.wayfinder.navigation.AppNavigation`
- **Example ViewModel**: SignUpViewModel (use as reference pattern)
- **Example Repository**: AuthRepository (use as reference pattern)

### 🚀 Start Here

1. Read the entire Android Master Prompt document
2. Review existing SignUpViewModel and AuthRepository as examples
3. Update LoginResponse model and login flow
4. Create OnboardingViewModel and OnboardingRepository
5. Create OnboardingScreen composable
6. Test onboarding flow end-to-end
7. Create RecommendationsViewModel and update HomeScreen
8. Continue with remaining features

---

**END OF MASTER PROMPT**

This document is confidential and proprietary to Wayfindr. Do not share externally.

