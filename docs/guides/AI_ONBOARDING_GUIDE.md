# AI-Powered Dynamic Onboarding Guide

## Overview

The onboarding system now uses **OpenAI** to generate contextual, dynamic questions that adapt based on the user's previous answers. Each question flows naturally from the conversation, creating a personalized experience.

## How It Works

### 1. **Contextual Question Generation**
- The AI analyzes all previous answers from the user
- It generates the next question that's most relevant to what they've already shared
- Questions build on each other, creating a natural conversation flow

### 2. **Example Flow**
```
User: "I love adventure travel"
AI: "What kind of adventure activities excite you most?" 
    → Options: Mountain Climbing, Scuba Diving, Safari, etc.

User: "Mountain Climbing"
AI: "For your mountain climbing adventures, what's your preferred destination type?"
    → Options: Alpine Peaks, Volcanic Mountains, etc.
```

### 3. **Fallback Mode**
- If OpenAI API key is not configured, the system falls back to basic required questions
- This ensures the onboarding always works, even without AI

## Setup

### 1. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Required for AI-powered questions
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Choose the model (defaults to gpt-4o-mini)
# Options: gpt-4o-mini (cheapest, fast), gpt-4o (more capable), gpt-3.5-turbo (legacy)
OPENAI_MODEL=gpt-4o-mini
```

### 3. Restart the Backend

```bash
npm run start:dev
```

## Features

### ✅ Dynamic Question Flow
- Questions adapt based on previous answers
- No fixed question order
- Natural conversation progression

### ✅ Contextual Options
- Answer options are tailored to the user's profile
- More relevant choices based on their travel style

### ✅ Intelligent Completion
- System determines when enough information is collected
- Typically 5-7 questions (varies based on user responses)

### ✅ Preference Extraction
- Automatically extracts all preferences from answers
- Stores in user profile for personalized recommendations

## API Usage

### Start Onboarding
```http
POST /onboarding/start
Authorization: Bearer <token>
```

**Response:**
```json
{
  "session_id": "session_123",
  "completed": false,
  "question": {
    "id": "question_1",
    "type": "single_choice",
    "text": "What type of trip are you planning?",
    "options": [
      { "value": "adventure", "label": "Adventure" },
      { "value": "leisure", "label": "Leisure" }
    ],
    "required": true
  },
  "progress": {
    "current": 0,
    "total": 8
  }
}
```

### Submit Answer
```http
POST /onboarding/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_id": "session_123",
  "question_id": "question_1",
  "answer": "adventure"
}
```

**Response:** Next question (same format as above)

### Completion
When onboarding is complete:
```json
{
  "session_id": "session_123",
  "completed": true,
  "preferences": {
    "travel_type": "adventure",
    "interests": ["mountain_climbing", "hiking"],
    "budget": "mid_range",
    ...
  },
  "message": "Onboarding completed! Your personalized recommendations are ready."
}
```

## Alternative: Using n8n

If you prefer to use **n8n** for workflow automation, you can:

1. Set `USE_N8N_ONBOARDING=true` in your `.env`
2. Configure `N8N_BASE_URL` to point to your n8n instance
3. Create an n8n workflow that:
   - Receives the webhook at `/webhook/wayfinder/onboarding/next`
   - Uses n8n's OpenAI node to generate questions
   - Returns the question in the same format

### n8n Webhook Payload
```json
{
  "session_id": "session_123",
  "answers": {
    "travel_type": "adventure",
    "budget": "mid_range"
  }
}
```

### Expected n8n Response
```json
{
  "completed": false,
  "question": {
    "id": "question_2",
    "type": "single_choice",
    "text": "What kind of adventure activities excite you?",
    "options": [...],
    "required": true
  }
}
```

Or if complete:
```json
{
  "completed": true,
  "preferences": {
    "travel_type": "adventure",
    ...
  }
}
```

## Cost Considerations

- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **gpt-4o**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- Each question generation uses ~500-1000 tokens
- Estimated cost: **$0.001-0.002 per user onboarding** (with gpt-4o-mini)

## Troubleshooting

### AI Questions Not Generating
1. Check `OPENAI_API_KEY` is set correctly
2. Verify API key has credits/quota
3. Check backend logs for OpenAI errors
4. System will fall back to basic questions if AI fails

### Questions Not Contextual
- Ensure previous answers are being saved correctly
- Check that `session.answers` contains the conversation history
- Verify the AI prompt is receiving the full context

### High Costs
- Switch to `gpt-4o-mini` (default, cheapest)
- Reduce `max_tokens` in the AI service if needed
- Consider caching common question patterns

## Customization

### Adjusting Question Style
Edit `backend/src/onboarding/ai/onboarding-ai.service.ts`:
- Modify `systemPrompt` to change question tone/style
- Adjust `temperature` (0.7 = creative, 0.3 = focused)
- Change `max_tokens` to control response length

### Minimum Questions
Edit `hasEnoughData()` method to change when onboarding completes:
```typescript
hasEnoughData(answers: Record<string, any>): boolean {
  return Object.keys(answers).length >= 5; // Change this number
}
```

## Benefits Over Static Questions

1. **Personalization**: Each user gets a unique question flow
2. **Relevance**: Questions build on previous answers
3. **Engagement**: More conversational, less like filling a form
4. **Flexibility**: Can adapt to different user types automatically
5. **Scalability**: Easy to adjust without code changes

