from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.tools import tool
from langchain_core.messages import HumanMessage
from app.models import TutorResponse
from app.rag import RAGSystem
import app.db as db
import os
from typing import Dict, Any, List

from dotenv import load_dotenv

# Initialize
load_dotenv()
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
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
def track_progress(event: str, points: int = 10, badge: str = None, student_id: str = "student_unique_123") -> str:
    """Log learning milestone, add points, and award optional badges. Use this when the student answers a quiz correctly!"""
    result = db.add_score_and_badge(student_id, points, badge)
    print(f"🎯 PROGRESS: {event} - Score: {result['score']}, Badges: {result['badges']}")
    return f"✅ Logged: {event}. New Score: {result['score']}. Badges: {result['badges']}"

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
7. Use track_progress to award points (e.g. 10 points) and badges (e.g. 'Mars Explorer') when a student gets a question right or completes a major topic. ALWAYS populate 'score' and 'badges' in your JSON if you award them so the UI can show a celebration popup.
8. ALWAYS populate 'suggestedTopics' with exactly 2-3 fun clickable topic suggestions related to what you just taught. Examples: ['Tell me about Saturn! 🪐', 'What are black holes? 🕳️', 'Quiz me on Mars! 📝']. These become clickable buttons in the UI!
9. When giving a quiz, ALWAYS populate 'hintText' with a short, encouraging hint that helps the student without giving away the answer. Example: 'Remember, this planet is known as the Red Planet! 🔴'
10. When NOT giving a quiz, you may still set 'hintText' to a fun bonus fact or leave it null.

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
