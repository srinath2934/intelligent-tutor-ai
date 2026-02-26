from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from app.agent import tutor_session, agent
from langchain_core.messages import HumanMessage
import os

app = FastAPI(title="Intelligent Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

            # Stream events
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
            
            # Final structured response
            final = await tutor_session(question, student_id)
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
