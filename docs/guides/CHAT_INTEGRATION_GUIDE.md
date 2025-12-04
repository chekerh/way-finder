# Multi-Model AI Chat Integration Guide

## Overview

The chat system now supports **3 AI models** that users can choose from:
1. **Hugging Face (Free)** - Unlimited usage, free tier available
2. **OpenAI GPT-4o Mini** - Fast and affordable
3. **OpenAI GPT-4o** - Most capable, higher cost

## Features

✅ **Multi-Model Support**: Users can switch between 3 AI models  
✅ **Preference-Based**: Uses user's onboarding preferences to propose flights  
✅ **Real Flight Data**: Integrates with catalog service to show actual flights  
✅ **Conversation History**: Maintains chat history per user  
✅ **Flight Packs**: AI generates flight packages based on user preferences  

## Backend API Endpoints

### Send Message
```http
POST /api/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I want to travel to Paris",
  "model": "huggingface" // optional: "huggingface", "openai_gpt4o_mini", "openai_gpt4o"
}
```

**Response:**
```json
{
  "message": "I've prepared 3 flight packs for you based on your preferences...",
  "model_used": "huggingface",
  "flight_packs": [
    {
      "title": "Pack 1: TUN → CDG - Air France",
      "price": "450 TND",
      "origin": "TUN",
      "destination": "CDG",
      "airline": "Air France",
      "details": "Flight from TUN to CDG with Air France"
    }
  ],
  "session_id": "chat_1234567890_abc123"
}
```

### Switch Model
```http
POST /api/chat/switch-model
Authorization: Bearer <token>
Content-Type: application/json

{
  "model": "openai_gpt4o_mini"
}
```

### Get Chat History
```http
GET /api/chat/history?limit=50
Authorization: Bearer <token>
```

### Clear History
```http
DELETE /api/chat/history
Authorization: Bearer <token>
```

### Get Available Models
```http
GET /api/chat/models
Authorization: Bearer <token>
```

## Environment Variables

Add to your `.env` file:

```bash
# Hugging Face (Free AI Model)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2

# OpenAI (Already configured)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Getting Hugging Face API Key

1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access is enough)
3. Free tier: 1000 requests/month
4. Paid plans: Unlimited requests

## How It Works

1. **User sends message** → Chat service receives it
2. **Loads user preferences** → From onboarding data
3. **Generates AI response** → Using selected model
4. **Detects flight queries** → If user asks about flights
5. **Fetches real flights** → From catalog service based on preferences
6. **Returns response** → With AI message + flight packs

## Model Comparison

| Model | Cost | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| Hugging Face | Free | Medium | Good | Unlimited chat |
| GPT-4o Mini | $0.15/1M tokens | Fast | Very Good | Balanced |
| GPT-4o | $2.50/1M tokens | Medium | Excellent | Complex queries |

## Android Integration Steps

1. **Add Chat Models** (`ChatModels.kt`):
   - `ChatMessageRequest`
   - `ChatMessageResponse`
   - `FlightPack`
   - `SwitchModelRequest`

2. **Add API Endpoints** (`ApiService.kt`):
   ```kotlin
   @POST("chat/message")
   suspend fun sendChatMessage(@Body request: ChatMessageRequest): ChatMessageResponse
   
   @POST("chat/switch-model")
   suspend fun switchModel(@Body request: SwitchModelRequest): SwitchModelResponse
   
   @GET("chat/history")
   suspend fun getChatHistory(@Query("limit") limit: Int = 50): List<ChatHistoryItem>
   
   @DELETE("chat/history")
   suspend fun clearChatHistory(): ClearHistoryResponse
   
   @GET("chat/models")
   suspend fun getAvailableModels(): AvailableModelsResponse
   ```

3. **Create ChatViewModel**:
   - State management
   - Send message function
   - Switch model function
   - Load history function

4. **Update ChatScreen**:
   - Model selection dropdown
   - Message input field
   - Display messages and flight packs
   - Real-time updates

## Testing

Test the chat endpoint:
```bash
curl -X POST https://your-api.com/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to travel to Paris",
    "model": "huggingface"
  }'
```

## Notes

- **Preferences are automatically used** - The system reads user's onboarding preferences
- **Real flights are fetched** - When user asks about flights, actual flight data is shown
- **Fallback available** - If AI fails, system gracefully handles errors
- **History is maintained** - All conversations are saved per user

