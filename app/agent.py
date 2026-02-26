from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.tools import tool
from langchain_core.messages import HumanMessage
from app.models import TutorResponse
from app.rag import RAGSystem
import os
from typing import Dict, Any, List

from dotenv import load_dotenv

# Initialize
load_dotenv()
model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.7,
)

rag = RAGSystem()

@tool(response_format="content_and_artifact")
def retrieve_facts(query: str) -> tuple[str, List[Dict]]:
    """Retrieve educational facts before teaching."""
    docs = rag.retrieve(query, k=3)
    content = "\n\n".join([
        f"📚 [{d.metadata.get('title', 'Source')}]\n{d.page_content}"
        for d in docs
    ])
    return f"GROUNDED FACTS:\n{content}", docs

@tool
def navigate_ui(topic: str) -> str:
    """Trigger UI navigation."""
    return f"🧭 NAVIGATE: '{topic}'. IMPORTANT: Set 'navigationEvent' to '{topic}' in your final JSON."

@tool
def show_visual(topic: str, params: Dict[str, Any]) -> str:
    """Show interactive visualization."""
    return f"🎬 VISUAL: {topic} ({params}). IMPORTANT: Set 'navigationEvent' to '{topic}' in your final JSON."

@tool
def launch_quiz(topic: str, difficulty: str = "medium") -> str:
    """Start adaptive quiz."""
    return f"📝 QUIZ: {topic} ({difficulty}). IMPORTANT: You MUST populate 'quizData' in your final JSON."

@tool
def track_progress(event: str, details: str) -> str:
    """Log learning milestone."""
    print(f"🎯 PROGRESS: {event} - {details}")
    return f"✅ Logged: {event}"

from langgraph.checkpoint.memory import InMemorySaver

memory = InMemorySaver()

# Full agent
agent = create_agent(
    model=model,
    tools=[retrieve_facts, navigate_ui, show_visual, launch_quiz, track_progress],
    response_format=TutorResponse,
    system_prompt="""You are an incredibly fun, enthusiastic, and magical Space & Astronomy Tutor! Protocol:

1. ALWAYS retrieve_facts first → teach from sources only, never hallucinate.
2. Target Audience: Children aged 8 to 12. Speak to them directly!
3. Tone: OVERWHELMINGLY warm, encouraging, and magical! Use lots of emojis (🚀, 🌟, 🪐). Sound like the best science teacher ever! 
4. Explanations: Keep them simple, exciting, and easy for an 8-year-old to understand. 
5. Use navigate_ui or show_visual to create experiential learning moments. When you use them, you MUST populate the 'navigationEvent' field in your final JSON with the exact topic (e.g. 'Mars', 'Jupiter').
6. Use launch_quiz after explanations to check understanding in a positive way. When you use it, you MUST populate the 'quizData' field in your final JSON with a real multiple-choice question and 3 or 4 options based strictly on what you just taught.
7. track_progress milestones.

Remember: Be magical, use emojis, but stay factually precise!""",
    checkpointer=memory,
)

async def tutor_session(question: str, thread_id: str):
    """Single tutor turn."""
    result = await agent.ainvoke(
        {"messages": [HumanMessage(content=question)]},
        config={"configurable": {"thread_id": thread_id}}
    )
    return result["structured_response"]
