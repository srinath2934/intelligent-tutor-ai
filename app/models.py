from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class ChatRequest(BaseModel):
    """The incoming message from the student."""
    message: str
    target_audience: str = "child aged 8 to 12"
    subject_focus: str = "Space and Astronomy"

class QuizData(BaseModel):
    """Structured data for a multiple choice trivia question."""
    question: str = Field(..., description="The trivia question text.")
    options: List[str] = Field(..., description="List of 3 or 4 multiple choice options.")
    answer_index: int = Field(..., description="The zero-based index of the correct option.")

class TutorResponse(BaseModel):
    """Frontend-ready tutor response."""
    explanation: str = Field(..., description="Clear educational explanation")
    followUpQuestion: str = Field(..., description="Next question to deepen learning")
    navigationEvent: Optional[str] = Field(
        None, 
        description="e.g., 'showMars', 'showGravitySim', 'startQuiz' or None"
    )
    quizData: Optional[QuizData] = Field(None, description="Provide this if a quiz is requested.")
    suggestedTopics: Optional[List[str]] = Field(
        None, 
        description="2-3 clickable topic suggestions for the student, e.g. ['Tell me about Saturn', 'What are black holes?', 'Quiz me on Mars']"
    )
    hintText: Optional[str] = Field(
        None, 
        description="A short, encouraging hint or fun fact to display as a tooltip/callout in the UI"
    )
    score: Optional[int] = Field(None, description="The student's updated point score if points were just awarded.")
    badges: Optional[List[str]] = Field(None, description="The list of badges this student has earned.")
    emotionalTone: str = Field(..., description="'encouraging', 'challenging', 'supportive'")
    confidence: float = Field(..., description="0.0-1.0 how certain tutor is")

class StudentProgress(BaseModel):
    """Track learning journey."""
    event_type: str  # "explained_concept", "watched_video", "passed_quiz"
    topic: str
    score: Optional[float] = None
