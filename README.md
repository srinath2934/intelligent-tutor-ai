# 🚀 Intelligent Space Tutor

An AI-powered educational tutor built with **LangChain**, **LangGraph**, and **Google Gemini**, featuring a premium **React** frontend with a space-themed mission control UI.

![Space Tutor Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![Python](https://img.shields.io/badge/Python-3.10+-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)

---

## ✨ Features

- **AI-Powered Tutoring** — Uses Google Gemini (via LangChain) with RAG for grounded, accurate space education
- **Real-Time Streaming** — WebSocket-based communication for instant, chunk-by-chunk AI responses
- **Interactive Quiz Hub** — Multiple-choice quizzes with neon-styled buttons and instant pass/fail feedback
- **Premium Space UI** — Behance-inspired glassmorphic dashboard with animated planets and deep space aesthetics
- **Child-Friendly UX** — Warm, encouraging tutor persona with emojis, "Friendly Alien" thinking animations
- **RAG Knowledge Base** — FAISS vector store with curated space/astronomy educational content

---

## 🏗️ Architecture

```
intelligent-tutor/
├── app/                    # FastAPI Backend
│   ├── api.py              # WebSocket & REST endpoints
│   ├── agent.py            # LangGraph agent with tools
│   ├── models.py           # Pydantic schemas (TutorResponse, QuizData)
│   ├── rag.py              # FAISS RAG system
│   └── main.py             # App entry point
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx         # Main dashboard component
│   │   └── index.css       # Tailwind + custom glassmorphism styles
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── educational_docs.json  # Knowledge base documents
├── run.py                  # Uvicorn server launcher
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variable template
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **LLM** | Google Gemini 1.5 Flash |
| **Embeddings** | Google Gemini Embedding 001 |
| **Framework** | LangChain + LangGraph |
| **Vector Store** | FAISS |
| **Backend** | FastAPI + Uvicorn |
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS v4 + Custom CSS |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone & Setup Backend

```bash
git clone <your-repo-url>
cd intelligent-tutor

# Create virtual environment
python -m venv tutor_env

# Activate it
# Windows:
.\tutor_env\Scripts\activate
# macOS/Linux:
source tutor_env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

### 4. Run the Application

**Terminal 1 — Backend:**
```bash
# From intelligent-tutor/ root (with tutor_env activated)
python run.py
# Server starts at http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

---

## 🎮 Usage

1. Open `http://localhost:5173` in your browser
2. Type a question about space in the "Mission Comms" chat panel
3. Watch the AI tutor respond with rich explanations and follow-up questions
4. Ask "quiz me" or "test my knowledge" to trigger interactive quizzes
5. The central Viewscreen updates with relevant planet visuals based on the topic

---

## 📡 API Endpoints

| Endpoint | Type | Description |
|----------|------|-------------|
| `GET /` | HTTP | Health check |
| `POST /tutor/{student_id}` | HTTP | Non-streaming tutor response |
| `WS /ws/tutor/{student_id}` | WebSocket | Real-time streaming tutor |

### WebSocket Message Format

**Send:**
```json
{ "question": "What is Mars?" }
```

**Receive:**
```json
{ "type": "start" }
{ "type": "text", "chunk": "Mars is..." }
{ "type": "final", "response": { "explanation": "...", "quizData": {...} } }
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ and 🚀 for making space education magical!
