# Eureka — AI-Powered Personalized Learning Platform

> An intelligent tutoring platform that generates custom curricula, adapts to your learning style, and remembers your progress across sessions.

🌐 **Live Demo:** [eureka-sable.vercel.app](https://eureka-sable.vercel.app)  
💻 **GitHub:** [github.com/Tolueliz1012/eureka](https://github.com/Tolueliz1012/eureka)

---

## What It Does

Eureka is a full-stack AI tutoring application that gives every user a personalized learning experience. You pick a subject and a goal, and the app builds a custom 12-topic curriculum just for you. An AI tutor named Alex guides you through each topic — explaining concepts, asking questions, and adapting based on how you respond. After every few interactions, Alex quizzes you to make sure the knowledge sticks before moving on.

---

## Features

- **Custom Curriculum Generation** — Claude AI builds a personalized 12-topic learning path based on your subject, goal, and current level
- **Adaptive AI Tutor** — Detects 4 learning styles (example-based, Socratic, visual, direct) and adjusts teaching approach automatically
- **Memory Across Sessions** — Remembers weak areas, completed topics, and session notes so every conversation builds on the last
- **Quiz Mode** — Auto-generates 3-question multiple choice quizzes every 4 interactions to reinforce learning
- **Progress Tracking** — Visual progress bars and topic advancement as you master each concept
- **Multi-User Auth** — Full login/signup with JWT-based authentication — every user gets completely isolated data
- **Markdown Rendering** — Alex's responses render with proper bold text, bullet points, code blocks, and headers
- **6+ Subjects** — Math, Python, Spanish, Science, History, English, or any custom subject

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python** | Core backend language |
| **FastAPI** | REST API framework with automatic docs |
| **Anthropic Claude API** | Powers the AI tutor (claude-sonnet-4) |
| **Supabase** | PostgreSQL database + authentication |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **React** | Component-based UI framework |
| **Axios** | HTTP client for API calls |
| **React Markdown** | Renders AI responses with formatting |
| **Supabase JS** | Client-side auth and session management |

### Infrastructure
| Service | Purpose |
|---|---|
| **Railway** | Backend deployment with auto-deploy from GitHub |
| **Vercel** | Frontend deployment with CDN |
| **GitHub** | Version control and CI/CD trigger |

---

## Architecture

```
React Frontend (Vercel)
        ↕  REST API calls
FastAPI Backend (Railway)
        ↕
   Claude API          Supabase PostgreSQL
 (AI responses)      (users, curricula, memory, sessions)
```

### Database Schema (4 tables)

```sql
users          — id, name, learning_style
curricula      — user_id, subject, topics (JSONB), current_topic_index
memory         — user_id, subject, weak_areas, completed_topics, session_notes
sessions       — user_id, subject, messages (JSONB)
```

### API Endpoints (5 routes)

```
POST /tutor/chat              — Send message to AI tutor
POST /curriculum/generate     — Generate personalized curriculum
GET  /curriculum/get/:id/:sub — Fetch user's curriculum
POST /curriculum/advance/:id  — Advance to next topic
POST /tutor/chat              — Auto-saves session memory on goodbye
```

---

## How the AI Works

### Learning Style Detection
The system monitors user messages for keywords and phrases:
- `"show me"`, `"example"` → **Example learner** — tutor leads with worked examples
- `"just tell me"`, `"short"` → **Direct learner** — concise explanations
- `"imagine"`, `"analogy"` → **Visual learner** — metaphors and real-world comparisons
- Default → **Socratic** — guiding questions to help students discover answers

### Memory System
At session end, Claude outputs a structured JSON summary:
```json
{
  "session_summary": "Covered number lines and negative numbers",
  "weak_areas": ["negative number ordering"],
  "completed_topics": ["Understanding Numbers and Number Lines"]
}
```
This is parsed and stored in Supabase, then injected into the system prompt at the start of every new session.

### Quiz Generation
After every 4 user messages, a "Take a Quiz" button appears. Clicking it sends a structured prompt to Claude requesting a quiz in a specific parseable format (QUIZ_START/QUIZ_END markers). The frontend parses the response and renders an interactive multiple-choice quiz. A score of 2/3 or higher automatically advances the student to the next topic.

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Anthropic API key
- Supabase project

### Backend Setup
```bash
cd backend
pip install fastapi uvicorn anthropic supabase python-dotenv

# Create .env file
echo "ANTHROPIC_API_KEY=your_key" > .env
echo "SUPABASE_URL=your_url" >> .env
echo "SUPABASE_KEY=your_key" >> .env

uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_SUPABASE_URL=your_url" > .env
echo "REACT_APP_SUPABASE_KEY=your_key" >> .env

npm start
```

### Database Setup
Run the SQL in `backend/schema.sql` in your Supabase SQL editor to create the 4 required tables.

---

## Project Structure

```
eureka/
├── backend/
│   ├── main.py                    # FastAPI app + CORS
│   ├── database.py                # Supabase client
│   ├── requirements.txt
│   ├── routes/
│   │   ├── tutor.py               # Chat endpoint
│   │   └── curriculum.py         # Curriculum endpoints
│   └── services/
│       ├── claude.py              # Claude API + system prompts
│       ├── memory.py              # Session memory management
│       ├── learning_style.py      # Style detection
│       └── curriculum.py         # Curriculum generation
└── frontend/
    └── src/
        ├── App.js                 # Auth + routing
        ├── api.js                 # API calls
        ├── supabase.js            # Supabase client
        └── pages/
            ├── Login.jsx          # Auth page
            ├── Dashboard.jsx      # Progress overview
            ├── Onboarding.jsx     # Curriculum builder
            └── TutorChat.jsx      # Main chat + quiz
```

---

## Key Engineering Decisions

**Why FastAPI over Flask?**
FastAPI provides automatic API documentation, built-in request validation via Pydantic, and async support — making it faster to build and easier to maintain.

**Why Claude over GPT-4?**
Claude has a longer context window and excels at nuanced, step-by-step explanations without just giving away answers — critical for a tutoring use case.

**Why Supabase over Firebase?**
Supabase provides a real PostgreSQL database (vs Firebase's NoSQL), built-in auth, and a free tier that doesn't require a credit card.

**Why not store sessions in the frontend?**
Storing session memory server-side in Supabase means the tutor truly remembers the student across different devices and browsers — not just within a single tab.

---

## Future Improvements

- [ ] Voice input via OpenAI Whisper API
- [ ] Teacher dashboard with class-wide progress tracking
- [ ] Spaced repetition system for weak areas
- [ ] Mobile app (React Native)
- [ ] Streak tracking and gamification
- [ ] PDF/document upload for custom curriculum content

---

## Author

**Elizabeth Okiji**  
Built with Python, React, and the Anthropic Claude API.

---

*Eureka — the moment it clicks.*
