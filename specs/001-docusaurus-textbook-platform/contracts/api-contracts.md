# API Contracts: Physical AI & Humanoid Robotics Textbook Platform

## Authentication API

### POST /api/auth/register
Register a new user with hardware profile information.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "user123",
  "hardwareProfile": {
    "gpuModel": "RTX 4090",
    "hasJetson": false,
    "realRobotType": "TurtleBot3"
  }
}
```

**Response**:
```json
{
  "userId": "user_12345",
  "email": "user@example.com",
  "username": "user123",
  "hardwareProfile": {
    "gpuModel": "RTX 4090",
    "hasJetson": false,
    "realRobotType": "TurtleBot3"
  },
  "createdAt": "2025-12-07T10:00:00Z",
  "sessionId": "session_67890"
}
```

### GET /api/auth/me
Get current user's profile including hardware information.

**Response**:
```json
{
  "userId": "user_12345",
  "email": "user@example.com",
  "username": "user123",
  "hardwareProfile": {
    "gpuModel": "RTX 4090",
    "hasJetson": false,
    "realRobotType": "TurtleBot3"
  },
  "progress": {
    "completedChapters": [1, 2, 3],
    "quizScores": {
      "1": 80,
      "2": 90,
      "3": 75
    }
  }
}
```

## Content Personalization API

### GET /api/content/{chapterId}/personalized
Get personalized content for a chapter based on user's hardware profile.

**Query Parameters**:
- `language` (optional): "en" or "ur" (default: "en")

**Response**:
```json
{
  "chapterId": "1",
  "title": "Introduction to Physical AI",
  "content": "Personalized chapter content based on user's hardware...",
  "personalizationApplied": true,
  "hardwareProfileUsed": {
    "gpuModel": "RTX 4090",
    "hasJetson": false,
    "realRobotType": "TurtleBot3"
  }
}
```

## RAG Chatbot API

### POST /api/rag/query
Query the RAG system for textbook content.

**Request**:
```json
{
  "query": "Explain how ROS2 works with NVIDIA Isaac",
  "context": {
    "chapterIds": ["3", "4"], // Optional: limit search to specific chapters
    "userId": "user_12345" // Optional: for personalization
  },
  "language": "en" // "en" or "ur"
}
```

**Response**:
```json
{
  "response": "Detailed answer based on textbook content...",
  "sources": [
    {
      "chapterId": "4",
      "chapterTitle": "NVIDIA Isaac",
      "section": "ROS2 Integration",
      "similarityScore": 0.89
    }
  ],
  "queryId": "query_12345"
}
```

## Quiz API

### GET /api/quiz/{chapterId}
Get quiz questions for a specific chapter.

**Response**:
```json
{
  "chapterId": "1",
  "quizId": "quiz_1",
  "questions": [
    {
      "questionId": "q1",
      "question": "What is Physical AI?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "explanation": "Detailed explanation...",
      "urduQuestion": "فزیکل اے آئی کیا ہے؟",
      "urduOptions": ["آپشن اے", "آپشن بی", "آپشن سی", "آپشن ڈی"],
      "urduExplanation": "تفصیلی وضاحت..."
    }
  ]
}
```

### POST /api/quiz/{chapterId}/submit
Submit answers for a chapter quiz.

**Request**:
```json
{
  "answers": [
    {
      "questionId": "q1",
      "selectedOption": "A"
    }
  ]
}
```

**Response**:
```json
{
  "quizId": "quiz_1",
  "chapterId": "1",
  "score": 80,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "feedback": [
    {
      "questionId": "q1",
      "isCorrect": true,
      "explanation": "Explanation for why the answer is correct..."
    }
  ]
}
```