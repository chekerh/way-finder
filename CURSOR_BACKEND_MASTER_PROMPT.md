# Wayfindr Backend - AI Dynamic Form & Personalization Master Prompt

## ⚠️ CONFIDENTIAL - PRIVATE PROJECT
This document contains proprietary backend implementation requirements for Wayfindr. **DO NOT SHARE** this prompt externally.

---

## Overview

Implement an AI-driven dynamic questionnaire system that collects user preferences one question at a time, then generates personalized travel recommendations. After login/registration, users complete an interactive form where questions appear sequentially based on their previous answers. Once complete, users are redirected to the home screen with tailored recommendations.

---

## 1. Core Requirements

### 1.1 User Flow
1. User logs in/registers → JWT token received
2. Check if user has completed onboarding form (`user.onboarding_completed` flag)
3. If not completed → Redirect to dynamic AI form
4. Form displays one question at a time
5. User answers → Next question appears (AI determines next question)
6. Process continues until AI has sufficient data
7. Form completion → Update user preferences → Generate recommendations
8. Redirect to home screen with personalized content

### 1.2 AI Form Behavior
- **Sequential Questions**: Only one question visible at a time
- **Context-Aware**: Next question depends on previous answers
- **Adaptive**: AI adjusts questions based on user responses
- **Completion Detection**: AI determines when enough data is collected
- **Personalization**: Collected data drives home screen recommendations

---

## 2. New Backend Modules & Endpoints

### 2.1 Onboarding/Form Module

#### POST `/api/onboarding/start`
**Description**: Initialize onboarding form session for authenticated user

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
      { "value": "adventure", "label": "Adventure" },
      { "value": "family", "label": "Family" }
    ],
    "required": true
  },
  "progress": {
    "current": 1,
    "total": null
  }
}
```

**Logic**:
- Check if user already completed onboarding
- Create onboarding session in database
- Generate first question using AI logic
- Return first question

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
    "options": [
      { "value": "sightseeing", "label": "Sightseeing" },
      { "value": "adventure_sports", "label": "Adventure Sports" },
      { "value": "relaxation", "label": "Relaxation" },
      { "value": "nightlife", "label": "Nightlife" }
    ],
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

**Logic**:
- Validate session belongs to authenticated user
- Save answer to database
- Use AI logic to determine if more questions needed
- If complete: Generate recommendations, update user preferences, mark onboarding complete
- Return next question or completion status

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

---

### 2.2 Recommendations Module

#### GET `/api/recommendations/personalized`
**Description**: Get personalized travel recommendations based on user preferences

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

**Logic**:
- Retrieve user preferences from database
- Use AI/matching algorithm to generate recommendations
- Score recommendations based on preference match
- Return top recommendations with explanations

---

#### POST `/api/recommendations/regenerate`
**Description**: Regenerate recommendations (e.g., after updating preferences)

**Headers**: `Authorization: Bearer <token>` (required)

**Response**: Same as `/api/recommendations/personalized`

---

### 2.3 Question Templates & AI Logic

#### Question Categories
1. **Travel Type**: Business, Leisure, Adventure, Family, Solo, Couple
2. **Budget**: Low, Mid-range, High, Luxury
3. **Interests**: Sightseeing, Adventure Sports, Relaxation, Nightlife, Culture, Nature, Food
4. **Accommodation**: Hotel, Airbnb, Hostel, Luxury Resort, Budget-friendly
5. **Destination Preferences**: Beach, Mountains, Cities, Countryside, Historical
6. **Travel Frequency**: Frequent, Occasional, Rare
7. **Group Size**: Solo, Couple, Family (2-4), Large Group (5+)
8. **Duration**: Weekend, Week, 2 Weeks, Month+
9. **Climate Preference**: Warm, Cold, Moderate, No Preference
10. **Activities**: Specific activities user enjoys

---

## 3. Database Schemas

### 3.1 OnboardingSession Schema
```typescript
@Schema({ timestamps: true })
export class OnboardingSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  session_id: string; // UUID

  @Prop({ type: Object, default: {} })
  answers: Record<string, any>; // { question_id: answer }

  @Prop({ type: [String], default: [] })
  questions_answered: string[]; // Array of question IDs

  @Prop({ type: String, default: null })
  current_question_id: string;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Date, default: null })
  completed_at: Date;

  @Prop({ type: Object, default: {} })
  extracted_preferences: {
    travel_type?: string;
    budget?: string;
    interests?: string[];
    accommodation_preference?: string;
    destination_preferences?: string[];
    // ... other extracted preferences
  };
}
```

### 3.2 Update User Schema
Add to existing User schema:
```typescript
@Prop({ type: Boolean, default: false })
onboarding_completed: boolean;

@Prop({ type: Date, default: null })
onboarding_completed_at: Date;

@Prop({ type: Object, default: {} })
onboarding_preferences: {
  travel_type?: string;
  budget?: string;
  interests?: string[];
  accommodation_preference?: string;
  destination_preferences?: string[];
  group_size?: string;
  travel_frequency?: string;
  climate_preference?: string;
  // ... other preferences
};
```

### 3.3 Recommendation Schema (Optional - for caching)
```typescript
@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  type: string; // "destination" | "offer" | "activity"

  @Prop({ required: true })
  item_id: string; // ID of recommended item

  @Prop({ required: true })
  match_score: number; // 0-1

  @Prop({ type: String })
  reason: string; // Why this was recommended

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  generated_at: Date;

  @Prop({ type: Boolean, default: false })
  viewed: boolean;
}
```

---

## 4. AI Logic Implementation

### 4.1 Question Generation Strategy

#### Approach 1: Rule-Based Decision Tree (Recommended for MVP)
```typescript
class OnboardingAI {
  generateNextQuestion(session: OnboardingSession): Question | null {
    const answers = session.answers;
    const answeredIds = session.questions_answered;

    // Decision tree logic
    if (!answeredIds.includes('travel_type')) {
      return this.getQuestion('travel_type');
    }

    if (!answeredIds.includes('budget')) {
      return this.getQuestion('budget');
    }

    if (!answeredIds.includes('interests')) {
      return this.getQuestion('interests');
    }

    // Adaptive questions based on previous answers
    if (answers.travel_type === 'adventure' && !answeredIds.includes('activity_preferences')) {
      return this.getQuestion('activity_preferences');
    }

    if (answers.budget === 'low' && !answeredIds.includes('accommodation_flexibility')) {
      return this.getQuestion('accommodation_flexibility');
    }

    // Check if we have enough information
    if (this.hasEnoughData(answers)) {
      return null; // Form complete
    }

    // Default next question
    return this.getQuestion('destination_preferences');
  }

  hasEnoughData(answers: Record<string, any>): boolean {
    const required = ['travel_type', 'budget', 'interests'];
    const hasRequired = required.every(key => answers[key] !== undefined);
    
    // Additional logic: ensure we have at least 5 questions answered
    return hasRequired && Object.keys(answers).length >= 5;
  }

  extractPreferences(answers: Record<string, any>): UserPreferences {
    return {
      travel_type: answers.travel_type,
      budget: answers.budget,
      interests: this.extractInterests(answers),
      accommodation_preference: answers.accommodation_preference,
      destination_preferences: this.extractDestinations(answers),
      // ... extract other preferences
    };
  }
}
```

#### Approach 2: AI Service Integration (Future Enhancement)
- Integrate with OpenAI GPT-4 or similar for dynamic question generation
- Use AI to analyze answers and generate contextual follow-up questions
- Store API key securely in environment variables

### 4.2 Recommendation Generation Logic

```typescript
class RecommendationEngine {
  async generateRecommendations(userId: string): Promise<Recommendations> {
    const user = await this.userService.findById(userId);
    const preferences = user.onboarding_preferences;

    // Match destinations based on preferences
    const destinations = await this.matchDestinations(preferences);
    
    // Match offers (flights, hotels) based on preferences
    const offers = await this.matchOffers(preferences);
    
    // Match activities based on interests
    const activities = await this.matchActivities(preferences);

    return {
      destinations: this.scoreAndSort(destinations, preferences),
      offers: this.scoreAndSort(offers, preferences),
      activities: this.scoreAndSort(activities, preferences)
    };
  }

  private scoreAndSort(items: any[], preferences: UserPreferences): any[] {
    return items
      .map(item => ({
        ...item,
        match_score: this.calculateMatchScore(item, preferences),
        reason: this.generateReason(item, preferences)
      }))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10); // Top 10
  }

  private calculateMatchScore(item: any, preferences: UserPreferences): number {
    let score = 0;
    let factors = 0;

    // Budget matching
    if (item.price_range && preferences.budget) {
      score += this.matchBudget(item.price_range, preferences.budget) * 0.3;
      factors += 0.3;
    }

    // Interest matching
    if (item.tags && preferences.interests) {
      const matchingInterests = item.tags.filter(tag => 
        preferences.interests.includes(tag)
      ).length;
      score += (matchingInterests / preferences.interests.length) * 0.4;
      factors += 0.4;
    }

    // Travel type matching
    if (item.travel_type && preferences.travel_type) {
      score += (item.travel_type === preferences.travel_type ? 1 : 0) * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0;
  }
}
```

---

## 5. API Key Security

### 5.1 Environment Variables
Create `.env` file (DO NOT commit to git):
```env
# Existing
MONGODB_URI=mongodb://localhost:27017/wayfindr
JWT_SECRET=your_jwt_secret
PORT=3000

# New - AI Service (if using external AI)
OPENAI_API_KEY=sk-... (if using OpenAI)
# OR
GEMINI_API_KEY=... (if using Google Gemini)

# Travel APIs (future)
SKYSCANNER_API_KEY=...
BOOKING_COM_API_KEY=...
GOOGLE_MAPS_API_KEY=...
WEATHER_API_KEY=...
```

### 5.2 Secure Storage
- **Never** expose API keys in frontend code
- Store all API keys in backend `.env` file
- Use environment variables in production (Vercel, Heroku, etc.)
- Add `.env` to `.gitignore`
- Create `.env.example` with placeholder values

### 5.3 Implementation Pattern
```typescript
// config/ai.config.ts
export const aiConfig = {
  apiKey: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY,
  provider: process.env.AI_PROVIDER || 'rule_based', // 'openai' | 'gemini' | 'rule_based'
  model: process.env.AI_MODEL || 'gpt-4',
};

// services/ai.service.ts
@Injectable()
export class AIService {
  async generateQuestion(context: OnboardingContext): Promise<Question> {
    if (aiConfig.provider === 'rule_based') {
      return this.ruleBasedQuestionGenerator.generate(context);
    }
    
    // External AI service
    if (aiConfig.provider === 'openai') {
      return this.openAIService.generateQuestion(context, aiConfig.apiKey);
    }
    
    if (aiConfig.provider === 'gemini') {
      return this.geminiService.generateQuestion(context, aiConfig.apiKey);
    }
  }
}
```

---

## 6. File Structure to Generate

```
src/
├── onboarding/
│   ├── onboarding.module.ts
│   ├── onboarding.controller.ts
│   ├── onboarding.service.ts
│   ├── onboarding.schema.ts
│   ├── onboarding.dto.ts
│   ├── ai/
│   │   ├── onboarding-ai.service.ts (Rule-based AI logic)
│   │   ├── question-generator.service.ts
│   │   └── preference-extractor.service.ts
│   └── questions/
│       └── question-templates.ts (Question definitions)
├── recommendations/
│   ├── recommendations.module.ts
│   ├── recommendations.controller.ts
│   ├── recommendations.service.ts
│   ├── recommendations.schema.ts (optional)
│   └── engine/
│       ├── recommendation-engine.service.ts
│       ├── matching.service.ts
│       └── scoring.service.ts
└── common/
    └── types/
        └── onboarding.types.ts
```

---

## 7. Implementation Steps

### Step 1: Update User Schema
- Add `onboarding_completed` boolean field
- Add `onboarding_preferences` object field
- Add `onboarding_completed_at` date field

### Step 2: Create OnboardingSession Schema
- Define schema with all required fields
- Create indexes on `user_id` and `session_id`

### Step 3: Implement Onboarding Module
- Create controller with all endpoints
- Implement service with business logic
- Create DTOs for request/response validation

### Step 4: Implement AI Logic
- Create rule-based question generator
- Implement decision tree for question flow
- Create preference extraction logic
- (Optional) Integrate external AI service

### Step 5: Implement Recommendations Module
- Create recommendation engine
- Implement matching and scoring algorithms
- Create controller endpoints
- Cache recommendations (optional)

### Step 6: Update Auth Flow
- Modify login/register to check onboarding status
- Return `onboarding_completed` flag in user profile

### Step 7: Testing
- Test question flow logic
- Test preference extraction
- Test recommendation generation
- Test API endpoints with Postman

---

## 8. Question Templates

### Template Structure
```typescript
export const QUESTION_TEMPLATES = {
  travel_type: {
    id: 'travel_type',
    type: 'single_choice',
    text: 'What type of trip are you planning?',
    options: [
      { value: 'business', label: 'Business' },
      { value: 'leisure', label: 'Leisure' },
      { value: 'adventure', label: 'Adventure' },
      { value: 'family', label: 'Family' },
      { value: 'solo', label: 'Solo Travel' },
      { value: 'couple', label: 'Romantic Getaway' }
    ],
    required: true,
    priority: 1
  },
  budget: {
    id: 'budget',
    type: 'single_choice',
    text: 'What is your budget range?',
    options: [
      { value: 'low', label: 'Budget-friendly ($)', min: 0, max: 1000 },
      { value: 'mid_range', label: 'Mid-range ($$)', min: 1000, max: 3000 },
      { value: 'high', label: 'High-end ($$$)', min: 3000, max: 10000 },
      { value: 'luxury', label: 'Luxury ($$$$)', min: 10000, max: null }
    ],
    required: true,
    priority: 2
  },
  interests: {
    id: 'interests',
    type: 'multiple_choice',
    text: 'What activities interest you? (Select all that apply)',
    options: [
      { value: 'sightseeing', label: 'Sightseeing & Landmarks' },
      { value: 'adventure_sports', label: 'Adventure Sports' },
      { value: 'relaxation', label: 'Relaxation & Spa' },
      { value: 'nightlife', label: 'Nightlife & Entertainment' },
      { value: 'culture', label: 'Culture & History' },
      { value: 'nature', label: 'Nature & Wildlife' },
      { value: 'food', label: 'Food & Dining' },
      { value: 'shopping', label: 'Shopping' }
    ],
    required: true,
    priority: 3,
    min_selections: 1,
    max_selections: 5
  },
  // ... more question templates
};
```

---

## 9. Integration with Existing Backend

### Update AppModule
```typescript
@Module({
  imports: [
    // ... existing imports
    OnboardingModule,
    RecommendationsModule,
  ],
  // ...
})
```

### Update User Service
- Add method to check onboarding status
- Add method to update onboarding preferences
- Update profile endpoint to include onboarding status

### Update Auth Service
- After registration, create onboarding session
- Return onboarding status in login response

---

## 10. Error Handling

### Error Responses
- `400 Bad Request`: Invalid answer format, missing required fields
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Session not found, user not found
- `409 Conflict`: Session already completed
- `500 Internal Server Error`: AI service error, recommendation generation error

---

## 11. Future Enhancements

1. **External AI Integration**: Integrate OpenAI/Gemini for dynamic question generation
2. **Machine Learning**: Train ML model on user preferences for better recommendations
3. **A/B Testing**: Test different question flows to optimize completion rates
4. **Analytics**: Track question completion rates, drop-off points
5. **Multi-language**: Support questions in multiple languages
6. **Voice Input**: Allow voice answers to questions
7. **Image-based Questions**: Show destination images for preference selection

---

## 12. Testing Checklist

- [ ] User can start onboarding after login
- [ ] Questions appear one at a time
- [ ] Next question adapts based on previous answers
- [ ] Form completion triggers recommendation generation
- [ ] User preferences are saved correctly
- [ ] Recommendations match user preferences
- [ ] Onboarding status is checked on login
- [ ] User can resume incomplete onboarding
- [ ] API keys are not exposed in responses
- [ ] All endpoints require authentication
- [ ] Error handling works correctly

---

## 13. Environment Setup for Vercel

### Vercel Environment Variables
Add these in Vercel dashboard:
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET`
- `OPENAI_API_KEY` (if using OpenAI)
- `GEMINI_API_KEY` (if using Gemini)
- Other API keys as needed

### Vercel Configuration
- Ensure `vercel.json` is configured for NestJS
- Set build command: `npm run build`
- Set output directory: `dist`
- Set install command: `npm install`

---

**END OF MASTER PROMPT**

This prompt provides complete specifications for implementing the AI-driven dynamic form system. Follow the structure and implement all modules, ensuring secure API key handling and proper integration with existing backend.

