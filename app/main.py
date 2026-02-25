"""
Intelligent Tutor - Main Application Entry Point
FastAPI application with AI-powered tutoring capabilities.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes.tutor import router as tutor_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Intelligent Tutor API",
    description="An AI-powered tutoring system with RAG, memory, and tool-use capabilities.",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(tutor_router, prefix="/api/tutor", tags=["Tutor"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Intelligent Tutor API is running."}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
