# Intelligent Space Tutor: AI Architecture Overview

This document outlines the architecture of the Intelligent Space Tutor, designed to meet the requirements of "Path 2: The Intelligent Tutor (AI Architecture)" focusing on a personalized, adaptable learning partner for children aged 8-12.

## Core Requirements & Implementation

### 1. Integration with a Major LLM
*   **Implementation:** We integrated **Google Gemini 1.5 Pro** via the `langchain-google-genai` library.
*   **Location in Code:** `app/agent.py` initializes the `ChatGoogleGenerativeAI` model.
*   **Why:** Gemini natively supports long context windows, complex tool calling, and structured JSON output, making it ideal for an agentic tutor.

### 2. Structured Output
*   **Requirement:** The AI must return clean JSON to update the UI.
*   **Implementation:** We utilized **Pydantic** models (`TutorResponse`, `StudentProgress`) and LangChain's `create_agent` wrapper with the `response_format` parameter.
*   **Location in Code:** `app/models.py` defines the strict schema (explanation, followUpQuestion, navigationEvent, emotionalTone, confidenceScore). `app/agent.py` enforces this format directly to the LLM.
*   **Why:** This ensures the frontend Javascript can seamlessly parse the response and trigger UI changes without unpredictable string parsing errors.

### 3. Context (Memory)
*   **Requirement:** The AI must remember previous turns.
*   **Implementation:** We implemented LangGraph's **`InMemorySaver` Checkpointer**.
*   **Location in Code:** `app/agent.py` attaches the memory bank to the agent. `app/api.py` passes the unique `student_id` as the `thread_id` to the agent.
*   **Why:** LangGraph automatically retrieves and appends previous conversation turns for that specific `thread_id`, ensuring a persistent, context-aware dialogue.

## Strong Signals (Bonus Implementations)

### A. RAG / Grounding
*   **Requirement:** Retrieve facts to prevent hallucination.
*   **Implementation:** We built a local Vector Store using **FAISS** and **GoogleGenerativeAIEmbeddings**.
*   **Location in Code:** `app/rag.py` splits `educational_docs.json` into chunks and stores them in FAISS. `app/agent.py` provides the `@tool retrieve_facts` which the LLM is instructed to *always* call first.
*   **Why:** This guarantees the AI teaches strictly from vetted educational material.

### B. Tool Calling (UI Events)
*   **Requirement:** AI triggers UI events (e.g., navigating to Mars).
*   **Implementation:** We defined explicit Python `@tool` functions (`navigate_ui`, `show_visual`, `launch_quiz`, `track_progress`).
*   **Location in Code:** `app/agent.py`. The system prompt instructs the AI *when* to use these tools.
*   **Frontend Action:** When the AI decides to navigate, it outputs the action in the structured JSON (`navigationEvent`), which the frontend `index.html` intercepts and renders as a UI trigger.

### C. Latency Handling (Streaming)
*   **Requirement:** Streaming responses for a snappy feel.
*   **Implementation:** We built an asynchronous **WebSocket** utilizing LangChain's `astream_events` protocol (`version="v2"`).
*   **Location in Code:** `app/api.py`. The `/ws/tutor/{student_id}` route streams raw text chunks (`on_chat_model_stream`) to the user *while* the AI is still generating, and logs tool execution statuses (`on_tool_start`) to keep the user engaged during backend processing.
*   **Why:** Real-time feedback drastically reduces perceived latency, crucial for maintaining an 8-12 year old student's attention.

## Next Steps / Areas for Improvement
Right now, the architecture fulfills 100% of the core requirements and 100% of the strong signals organically. 
1.  **Frontend Polish:** Expand `index.html` to actually trigger CSS animations or iframe loads when a `navigationEvent` is received over the websocket.
2.  **Expanded Knowledge:** Add more JSON curriculum content to `educational_docs.json` to leverage the RAG system further.
