# How to Verify AI Onboarding is Working

## Log Analysis from Your Render Deployment

### ✅ What's Working:
- Application started successfully
- All routes are mapped
- Server is live at: `https://wayfinder-api-w92x.onrender.com`

### ⚠️ What to Check:

1. **Onboarding Routes**: The logs you shared might be truncated. Look for these in your full logs:
   ```
   [RouterExplorer] Mapped {/api/onboarding/start, POST} route
   [RouterExplorer] Mapped {/api/onboarding/answer, POST} route
   [RouterExplorer] Mapped {/api/onboarding/status, GET} route
   [RouterExplorer] Mapped {/api/onboarding/resume, POST} route
   ```

2. **OpenAI Initialization**: Look for one of these messages:
   - ✅ **Success**: `[OnboardingAIService] OpenAI client initialized`
   - ⚠️ **Warning**: `[OnboardingAIService] OPENAI_API_KEY not set, AI question generation will be disabled`

## How to Test

### Option 1: Check Render Logs (Full Output)
1. Go to your Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Search for: `OnboardingAIService` or `onboarding`
5. You should see the initialization message

### Option 2: Test the Endpoint Directly

**Step 1: Get a JWT Token** (if you have auth working)
```bash
# Login first to get token
curl -X POST https://wayfinder-api-w92x.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'
```

**Step 2: Start Onboarding**
```bash
curl -X POST https://wayfinder-api-w92x.onrender.com/api/onboarding/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (AI Working):**
```json
{
  "session_id": "session_...",
  "completed": false,
  "question": {
    "id": "question_...",
    "type": "single_choice",
    "text": "What type of travel experience are you looking for?",  // AI-generated!
    "options": [
      { "value": "...", "label": "..." }
    ],
    "required": true
  },
  "progress": {
    "current": 0,
    "total": 8
  }
}
```

**Expected Response (AI Not Working - Fallback):**
```json
{
  "session_id": "session_...",
  "completed": false,
  "question": {
    "id": "travel_type",
    "text": "What type of trip are you planning?",  // Static question
    ...
  }
}
```

### Option 3: Check Environment Variables in Render

1. Go to Render Dashboard → Your Service → Environment
2. Verify these are set:
   - ✅ `OPENAI_API_KEY` = `sk-...` (your key)
   - ✅ `OPENAI_MODEL` = `gpt-4o-mini` (optional, defaults to this)
   - ✅ `USE_N8N_ONBOARDING` = not set or `false`

## What Happens When You Test

### If AI is Working:
1. First question will be **AI-generated** and contextual
2. Each subsequent question will **build on previous answers**
3. Questions will feel **conversational** and **personalized**

### If AI is NOT Working (Fallback):
1. You'll get **static questions** from the template
2. Questions follow a **fixed order**
3. Still works, but not personalized

## Debugging Steps

### If you don't see OpenAI initialization log:

1. **Check if OPENAI_API_KEY is set in Render:**
   - Render Dashboard → Environment Variables
   - Make sure `OPENAI_API_KEY` exists and has a value

2. **Check Render logs for errors:**
   - Look for any errors during startup
   - Check if the OnboardingModule is loading

3. **Test the endpoint and check logs:**
   - When you call `/api/onboarding/start`, new logs should appear
   - Look for OpenAI API calls or errors

4. **Verify the code was deployed:**
   - Check Render's "Events" tab
   - Make sure the latest commit (with AI onboarding) was deployed

## Expected Behavior

### First User (No Previous Answers):
- AI generates a welcoming, broad question about travel interests
- Example: "What type of travel experience are you most excited about?"

### After User Answers "Adventure":
- AI generates a follow-up question about adventure activities
- Example: "What kind of adventure activities excite you most?"
- Options might include: Mountain Climbing, Scuba Diving, Safari, etc.

### After User Answers "Mountain Climbing":
- AI generates a question about mountain destinations or difficulty level
- Example: "For your mountain climbing adventures, what's your preferred destination type?"
- Options: Alpine Peaks, Volcanic Mountains, etc.

## Quick Test Checklist

- [ ] Render logs show `OpenAI client initialized`
- [ ] `/api/onboarding/start` returns a question
- [ ] Question text is contextual (not just "What type of trip?")
- [ ] Second question relates to first answer
- [ ] No errors in Render logs when calling onboarding endpoints

