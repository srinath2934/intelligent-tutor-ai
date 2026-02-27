# 🚀 Intelligent Space Tutor AI

> An AI-powered educational platform that teaches children about space using **LangGraph agents**, **RAG (Retrieval-Augmented Generation)**, dynamic quizzes, and a real-time streaming chatbot — all wrapped in a stunning space-themed UI.

[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent-purple?logo=langchain)](https://langchain-ai.github.io/langgraph)
[![Gemini](https://img.shields.io/badge/Gemini-2.5--flash-orange?logo=google)](https://ai.google.dev)

![Architecture Diagram](docs/images/architecture.png)

---

## 🌌 What Is This?

**Intelligent Space Tutor** is a full-stack AI tutoring application designed for children aged 8–14. Students explore space science through:

- **Structured lessons** with intro → explore → quiz → reward flow
- **AI-generated quizzes** on completion (no static questions — every quiz is freshly created by Gemini)
- **Floating AI chat assistant** — available on every page, powered by a streaming LangGraph agent
- **Gamified progress** — earn points and cosmetic badges saved persistently in SQLite
- **RAG-grounded answers** — the AI only teaches verified facts from its knowledge base (no hallucinations)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Student Browser                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │ Lesson     │  │  AI Quiz    │  │  💬 Floating Chat    │ │
│  │ Cards      │  │  (dynamic)  │  │  Panel (WebSocket)   │ │
│  └────────────┘  └─────────────┘  └──────────────────────┘ │
│         React + TypeScript + Tailwind CSS (Vite :5173)      │
└──────────────────────┬──────────────────────────────────────┘
                       │ Vite Proxy
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI Backend  :8000                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  WS  /ws/tutor/{student_id}   (streaming chat)     │     │
│  │  GET /api/quiz/{topic}        (AI quiz generation) │     │
│  │  POST /api/progress/{lesson}  (save completion)    │     │
│  │  GET  /api/progress/overview  (load all progress)  │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────┐  ┌───────────────────────────────┐
│   LangGraph Agent        │  │   SQLite Database             │
│                          │  │                               │
│  🤖 gemini-2.5-flash     │  │  student_progress table       │
│  🔧 retrieve_facts()     │  │  lesson_progress table        │
│  🔧 launch_quiz()        │  │  (persists scores + badges)   │
│  🔧 track_progress()     │  └───────────────────────────────┘
│  🔧 navigate_ui()        │
│  📋 TutorResponse schema │
└──────────┬───────────────┘
           │ RAG retrieval
           ▼
┌──────────────────────────┐
│   FAISS Vector Store     │
│  Gemini Embeddings       │
│  NASA educational docs   │
│  (data/tutor_index/)     │
└──────────────────────────┘
```

---

## ✨ Key Features

| Feature | Technology | Details |
|---|---|---|
| 🤖 **AI Tutor Agent** | LangGraph + Gemini 2.5 Flash | Stateful, multi-turn, tool-calling agent |
| 📚 **RAG Knowledge Base** | FAISS + Gemini Embeddings | Retrieves space science facts before answering |
| ❓ **AI Quiz Generation** | Gemini 2.5 Flash | 3 fresh questions per lesson, generated at runtime |
| 💬 **Streaming Chat** | WebSocket | Token-by-token streaming with typing indicator |
| 🏅 **Gamification** | SQLite | Points + badges persisted across sessions |
| 🎨 **Space UI** | React + Tailwind + Framer Motion | Animated star field, glassmorphism, dark theme |
| 🪐 **Interactive Explore** | Canvas simulation | Gravity simulator with real physics |

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API Framework | **FastAPI** with WebSocket support |
| AI Agent | **LangGraph** `create_agent` with tool calling |
| LLM | **Google Gemini 2.5 Flash** via `langchain-google-genai` |
| RAG | **FAISS** vector store + **Gemini Embeddings** |
| Database | **SQLite** (via Python stdlib `sqlite3`) |
| Server | **Uvicorn** with hot-reload |

### Frontend
| Layer | Technology |
|---|---|
| Framework | **React 18** + **TypeScript** |
| Build Tool | **Vite** with `@vitejs/plugin-react-swc` |
| Styling | **Tailwind CSS** + **shadcn/ui** components |
| Animations | **Framer Motion** |
| Fonts | Orbitron (space headers) + Inter (body) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google AI API key ([get one free](https://aistudio.google.com/app/apikey))

### 1. Clone & Setup Backend

```bash
git clone https://github.com/srinath2934/intelligent-tutor-ai.git
cd intelligent-tutor-ai

# Create virtual environment
python -m venv tutor_env

# Activate (Windows)
.\tutor_env\Scripts\activate
# Activate (Mac/Linux)
source tutor_env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and add your key:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Start the Backend

```bash
.\tutor_env\Scripts\python.exe run.py
# Server runs at http://127.0.0.1:8000
```

First run will build the FAISS index automatically (takes ~30 seconds).

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

Open **http://localhost:5173** 🚀

---

## 📁 Project Structure

```
intelligent-tutor/
├── app/
│   ├── agent.py          # LangGraph agent with tools & system prompt
│   ├── api.py            # FastAPI routes (WS + REST endpoints)
│   ├── db.py             # SQLite CRUD for student & lesson progress
│   ├── models.py         # Pydantic schemas (TutorResponse, QuizData)
│   ├── rag.py            # FAISS vector store + retrieval
│   └── main.py           # App entry (imports api.py)
├── data/
│   ├── educational_docs.json    # Space science knowledge base
│   └── tutor_index/             # Auto-generated FAISS index (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIChatPanel.tsx      # Floating AI chat with WebSocket
│   │   │   ├── LessonView.tsx       # Lesson flow (intro→explore→quiz→reward)
│   │   │   ├── Quiz.tsx             # Quiz renderer
│   │   │   ├── GravitySimulator.tsx # Interactive physics explore
│   │   │   └── BadgeReward.tsx      # Completion celebration
│   │   ├── pages/Index.tsx          # Homepage with lesson cards
│   │   ├── data/lessons.ts          # Lesson definitions
│   │   └── lib/progress.ts          # localStorage progress sync
│   └── vite.config.js               # Proxy: /api + /ws → :8000
├── .env.example          # Environment template
├── requirements.txt      # Python dependencies
└── run.py                # Uvicorn server launcher
```

---

## 🔌 API Reference

### WebSocket — AI Chat
```
WS /ws/tutor/{student_id}
Send: { "question": "What is a black hole?" }
Receive stream:
  { "type": "start" }
  { "type": "text", "chunk": "A black hole..." }
  { "type": "final", "response": { "explanation": "...", "quizData": {...}, ... } }
```

### REST — AI Quiz Generation
```
GET /api/quiz/{lesson_topic}
Response: {
  "questions": [
    { "id": "q1", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "..." }
  ]
}
```

### REST — Progress
```
POST /api/progress/{lesson_id}   — Save lesson completion
GET  /api/progress/overview      — Get all lesson progress
GET  /progress/{student_id}      — Get global score + badges
```

---

## 🤖 How the AI Agent Works

The LangGraph agent follows a strict protocol on every message:

```
Student Question
    ↓
1. retrieve_facts(query)     ← Always first! Grounds answer in knowledge base
    ↓
2. [Optional] launch_quiz()  ← If explanation is complete
         navigate_ui()       ← If a visual simulation would help
         show_visual()       ← For interactive demos
    ↓
3. track_progress()          ← Awards points + badges on correct answers
    ↓
4. Structured Output         ← TutorResponse with explanation, quizData,
                                suggestedTopics, hintText, score, badges
```

The agent **never hallucinates** — it's instructed to always retrieve facts first and teach only from verified sources.

---

## 🎮 Student Experience Flow

```
🏠 Home  →  📖 Lesson Intro  →  🔬 Explore (Gravity Sim)
                                         ↓
                              ❓ AI Quiz (3 fresh questions)
                                         ↓
                              🏅 Badge Reward + Score Save
                                         ↓
                              💬 Chat with AI anytime (floating button)
```

---

## 📝 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | ✅ Yes | Google Gemini API key |

Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey). The free tier includes 15 RPM and 1M tokens/day on `gemini-2.5-flash`.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">
Built with ❤️ using LangGraph + Gemini + React
</div>
