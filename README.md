# 🚀 Intelligent Space Tutor

An AI-powered educational platform designed to transform how children learn about the universe. Built for the **Spacey Science Technical Challenge (Path 2: AI Architecture)**.

## 🌟 Key Features

- **Path 2 Core: AI Architecture**
  - **Structured LLM Response:** Every tutor interaction returns a strict JSON schema for navigation, quizzes, and hints.
  - **Persistent Progress:** Scores and badges are saved to a local SQLite database and persist across sessions.
  - **RAG (Retrieval-Augmented Generation):** Grounded in a space-themed knowledge base (FAISS vector store) to prevent hallucinations.
  - **Tool Calling:** The tutor can physically navigate the UI to different planets and trigger quizzes.
  - **Live Streaming:** Real-time token streaming via WebSockets for a high-performance "alive" feel.

- **Creative UI (Inspiration from Path 1)**
  - **Behance-Style Aesthetics:** Bright, playful, and layered dashboard with smooth animations (Framer Motion).
  - **Interactive 3D Viewscreen:** Engaging visual planet emojis and gamified quiz components.
  - **Gamification:** Earn Mission Points and Achievement Badges for completing cosmic challenges.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- Google Gemini API Key

### 2. Backend Setup
```bash
# Navigate to project root
cd intelligent-tutor

# Create env and install dependencies
python -m venv tutor_env
.\tutor_env\Scripts\activate
pip install -r requirements.txt

# Run the backend
python run.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Technical Implementation

### Architecture
- **Backend:** FastAPI, LangChain, LangGraph (for conversational memory).
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide icons.
- **Database:** SQLite (local file `tutor_progress.db`).
- **RAG:** FAISS (Vector DB) + Google Generative AI Embeddings.

### Specialization: Path 2 (AI Architecture)
This submission focuses heavily on **Path 2**, demonstrating production-ready AI engineering:
- **Grounding:** Uses dense vector search (FAISS) to fetch factual space context before the LLM generates answers.
- **Structured Output:** Pydantic models enforce a strict contract between the AI brain and the React UI.
- **Reliability:** Built-in retry logic and structured tool-calling handlers.
