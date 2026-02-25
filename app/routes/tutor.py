"""
Tutor Routes - API endpoints for the intelligent tutor.
"""

from fastapi import APIRouter, HTTPException
from app.models.schema import ChatRequest, ChatResponse, SessionInfo
from app.services.llm import generate_response
from app.services.memory import ConversationMemory
from app.services.rag import retrieve_context
from app.services.tools import execute_tool

router = APIRouter()

# In-memory session store (swap for Redis/DB in production)
sessions: dict[str, ConversationMemory] = {}


def _get_or_create_session(session_id: str) -> ConversationMemory:
    """Get an existing session or create a new one."""
    if session_id not in sessions:
        sessions[session_id] = ConversationMemory(session_id=session_id)
    return sessions[session_id]


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.
    1. Retrieve relevant context via RAG
    2. Load conversation history from memory
    3. Generate LLM response with tool-use support
    4. Store the exchange in memory
    """
    try:
        memory = _get_or_create_session(request.session_id)

        # Step 1 — RAG retrieval
        context = await retrieve_context(request.message)

        # Step 2 — Build conversation history
        history = memory.get_history()

        # Step 3 — LLM generation (may include tool calls)
        answer = await generate_response(
            user_message=request.message,
            context=context,
            history=history,
        )

        # Step 4 — Persist to memory
        memory.add_message(role="user", content=request.message)
        memory.add_message(role="assistant", content=answer)

        return ChatResponse(
            session_id=request.session_id,
            response=answer,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}", response_model=SessionInfo)
async def get_session(session_id: str):
    """Return metadata about an active session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")
    memory = sessions[session_id]
    return SessionInfo(
        session_id=session_id,
        message_count=len(memory.get_history()),
    )


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Clear a session's conversation history."""
    if session_id in sessions:
        del sessions[session_id]
    return {"status": "deleted", "session_id": session_id}
