from fastapi import FastAPI, WebSocket, Request, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import json
import asyncio
import re
from app.agent import tutor_session, agent
from langchain_core.messages import HumanMessage
import app.db as db
import os

# ─── Rate Limiter ────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(
    title="Intelligent Tutor API",
    docs_url=None,      # Disable Swagger UI in production
    redoc_url=None,     # Disable ReDoc in production
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS — restrict to known origins ────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    os.getenv("FRONTEND_URL", ""),  # production URL from .env
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# ─── Input Sanitization ──────────────────────────────────────
MAX_INPUT_LENGTH = 500
BLOCKED_PATTERNS = re.compile(
    r"(<script|<iframe|javascript:|on\w+=|SELECT\s+\*|DROP\s+TABLE)",
    re.IGNORECASE
)

def sanitize_input(text: str) -> str:
    """Strip dangerous content and enforce length limits."""
    if not text or not isinstance(text, str):
        raise HTTPException(status_code=400, detail="Invalid input")
    text = text.strip()
    if len(text) > MAX_INPUT_LENGTH:
        raise HTTPException(status_code=400, detail=f"Input too long. Max {MAX_INPUT_LENGTH} characters.")
    if BLOCKED_PATTERNS.search(text):
        raise HTTPException(status_code=400, detail="Input contains disallowed content")
    # Strip HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    return text


from fastapi.responses import HTMLResponse

@app.get("/")
async def root():
    return {"message": "Intelligent Tutor API is running. Connect via WebSocket or /tutor endpoint."}

@app.websocket("/ws/tutor/{student_id}")
async def websocket_tutor(websocket: WebSocket, student_id: str):
    """Real-time bidirectional tutor."""
    await websocket.accept()
    print(f"[DEBUG] WebSocket connection accepted for student: {student_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            question = json.loads(data)["question"]
            
            # Send start event
            await websocket.send_text(json.dumps({"type": "start"}))

            # Single API call — stream AND get final response
            result = None
            async for event in agent.astream_events(
                {"messages": [HumanMessage(content=question)]},
                config={"configurable": {"thread_id": student_id}},
                version="v2",
            ):
                if event["event"] == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    if getattr(chunk, "content", None):
                        await websocket.send_text(
                            json.dumps({"type": "text", "chunk": chunk.content})
                        )
                
                elif event["event"] in ["on_tool_start", "on_tool_end"]:
                    await websocket.send_text(
                        json.dumps({
                            "type": event["event"].split("_")[1],
                            "tool": event["name"]
                        })
                    )
            
            # Get the structured response from the SAME invocation (no second API call)
            state = await agent.aget_state(config={"configurable": {"thread_id": student_id}})
            final = state.values.get("structured_response")
            if final:
                await websocket.send_text(
                    json.dumps({"type": "final", "response": final.model_dump()})
                )
    
    except Exception as e:
        print(f"WebSocket Error: {e}")
        import traceback
        traceback.print_exc()
        reason = str(e)
        if len(reason) > 120:
            reason = reason[:120]
        await websocket.close(code=1011, reason=reason)

@app.post("/tutor/{student_id}")
async def http_tutor(student_id: str, question: str):
    """Non-streaming endpoint."""
    response = await tutor_session(question, student_id)
    return {"response": response.model_dump()}

@app.get("/progress/{student_id}")
async def get_progress(student_id: str):
    """Return a student's saved score and badges from the database."""
    return db.get_progress(student_id)

# ─────────────────────────────────────────────
#  New endpoints for stellar-learning-journey UI
# ─────────────────────────────────────────────

from pydantic import BaseModel
from typing import List, Optional
import os

class LessonProgressBody(BaseModel):
    score: int
    completed: bool
    badges: List[str] = []
    completedAt: Optional[str] = None

@app.post("/api/progress/{lesson_id}")
async def save_lesson_progress(lesson_id: str, body: LessonProgressBody, student_id: str = "student_unique_123"):
    """Save lesson progress (score + badges) to SQLite from the new UI."""
    db.save_lesson_progress(
        student_id=student_id,
        lesson_id=lesson_id,
        score=body.score,
        completed=body.completed,
        badges=body.badges,
        completed_at=body.completedAt
    )
    # Also update the global badge counter
    if body.badges:
        for badge in body.badges:
            db.add_score_and_badge(student_id, 0, badge)
    db.add_score_and_badge(student_id, body.score)
    return {"status": "saved"}

@app.get("/api/progress/overview")
async def get_overview(student_id: str = "student_unique_123"):
    """Return all lesson progress records for the student."""
    return db.get_all_lesson_progress(student_id)

@app.get("/api/quiz/{lesson_topic}")
async def generate_quiz(lesson_topic: str):
    """Generate AI quiz questions for a given lesson topic using the LLM."""
    from langchain_core.messages import HumanMessage
    from app.agent import model
    import re

    prompt = f"""You are a science tutor generating quiz questions for children about the topic: "{lesson_topic}".

Generate exactly 3 multiple-choice quiz questions in the following JSON format:
{{
  "questions": [
    {{
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of the answer."
    }}
  ]
}}

Rules:
- Questions must be fun, engaging, and appropriate for ages 8-14.
- The correctIndex is 0-based (0=first option).
- Return ONLY the JSON, no extra text.
"""
    try:
        response = await model.ainvoke([HumanMessage(content=prompt)])
        raw = response.content.strip()
        # Extract JSON from markdown code fences if present
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            return data
        return json.loads(raw)
    except Exception as e:
        # Fallback static questions if AI fails
        return {
            "questions": [
                {
                    "id": "q1",
                    "question": f"What is a key fact about {lesson_topic}?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctIndex": 0,
                    "explanation": "Great job exploring this topic!"
                }
            ]
        }
