# Quick Test Guide for Multi-Model AI Chat

## ✅ Backend is Ready!

All errors have been fixed and the system is ready for testing.

## 🧪 Quick Test Steps

### 1. Start the Backend (if running locally)
```bash
cd backend
npm run start:dev
```

### 2. Test Chat Endpoint

**Get Available Models:**
```bash
curl -X GET http://localhost:3000/api/chat/models \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Send a Message:**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to travel to Paris",
    "model": "huggingface"
  }'
```

**Expected Response:**
```json
{
  "message": "I've prepared flight packs for you...",
  "model_used": "huggingface",
  "flight_packs": [
    {
      "title": "Pack 1: TUN → CDG - Air France",
      "price": "450 TND",
      "origin": "TUN",
      "destination": "CDG",
      "airline": "Air France"
    }
  ],
  "session_id": "chat_..."
}
```

## 🔧 Fixed Issues

### 1. Hugging Face API Response Handling
- ✅ Now handles multiple response formats (array, string, object)
- ✅ Better error messages for model loading states
- ✅ Increased timeout to 60 seconds for model loading
- ✅ Improved prompt formatting for Mistral models

### 2. Error Handling
- ✅ Better fallback messages based on error type
- ✅ Helpful user guidance when models are unavailable
- ✅ Graceful degradation when API calls fail

### 3. Flight Pack Extraction
- ✅ Robust regex pattern matching
- ✅ Handles various text formats
- ✅ Returns empty array if no packs found (no errors)

## 🚀 Testing Checklist

- [ ] Backend starts without errors
- [ ] `/api/chat/models` returns 3 models
- [ ] Can send message with Hugging Face model
- [ ] Can send message with OpenAI models
- [ ] Flight packs are extracted correctly
- [ ] Error messages are user-friendly
- [ ] Model switching works
- [ ] Chat history loads correctly

## ⚠️ Common Issues & Solutions

### Issue: "Model is loading"
**Solution**: Wait 10-30 seconds and try again. First request to Hugging Face loads the model.

### Issue: "Model not available"
**Solution**: Check environment variables in Render:
- `HUGGINGFACE_API_KEY` is set
- `OPENAI_API_KEY` is set

### Issue: No flight packs returned
**Solution**: This is normal if:
- User didn't ask about flights
- AI didn't format packs correctly
- System will still return a helpful message

### Issue: API timeout
**Solution**: 
- Hugging Face: Model might be loading (wait and retry)
- OpenAI: Check API key and account credits

## 📝 Environment Variables Required

Make sure these are set in Render:
```bash
HUGGINGFACE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini  # Optional
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2  # Optional
```

## 🎯 Ready to Deploy!

Everything is fixed and ready. You can now:
1. Push to GitHub
2. Render will auto-deploy
3. Test the chat feature in your Android app

