"""
FastAPI wrapper for HackEval Agent
Provides REST API endpoints for evaluation functionality
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import asyncio
from dotenv import load_dotenv
import uvicorn
import tempfile

# Import your agent modules
from orchestrator import process_file
from Agents.project_context import ProjectAnalysisContext
from utils import load_eval_parameters_from_path, EvaluationParameters

# Load environment variables
load_dotenv()

app = FastAPI(
    title="HackEval Agent API",
    description="API for evaluating hackathon submissions",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load default evaluation parameters
try:
    eval_params_file = os.getenv("EVAL_PARAMS_FILE", "").strip()
    if eval_params_file and os.path.exists(eval_params_file):
        default_eval_params = load_eval_parameters_from_path(eval_params_file)
    else:
        # Create default parameters if no file is specified
        default_eval_params = EvaluationParameters(
            criteria={
                "Innovation": {"weight": 0.3, "max_score": 30},
                "Technical Implementation": {"weight": 0.3, "max_score": 30},
                "Presentation Quality": {"weight": 0.2, "max_score": 20},
                "Impact": {"weight": 0.2, "max_score": 20}
            },
            rubric="Evaluate based on innovation, technical quality, presentation, and potential impact."
        )
except Exception as e:
    print(f"Warning: Could not load evaluation parameters: {e}")
    default_eval_params = EvaluationParameters(
        criteria={"Overall": {"weight": 1.0, "max_score": 100}},
        rubric="General evaluation"
    )

# Request/Response Models
class EvaluationResponse(BaseModel):
    success: bool
    score: float
    total_score: int
    feedback: Optional[Dict[str, Any]] = None
    scores_breakdown: Optional[Dict[str, int]] = None
    message: Optional[str] = None
    team_name: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    service: str

# Endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "HackEval Agent API"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "HackEval Agent API"
    }

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_submission(
    file: UploadFile = File(...),
    agent_mode: str = Form("combined")
):
    """
    Evaluate hackathon submission from uploaded file (PDF, PPT, DOCX, etc.)
    """
    temp_path = None
    try:
        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_path = tmp.name
        
        # Create semaphore for concurrency control
        semaphore = asyncio.Semaphore(1)
        
        # Process the file
        ctx = await process_file(
            file_path=temp_path,
            agent_mode=agent_mode,
            semaphore=semaphore,
            eval_params=default_eval_params
        )
        
        # Calculate total score
        total_score = sum(ctx.scores.values()) if ctx.scores else 0
        max_possible = sum(c["max_score"] for c in default_eval_params.criteria.values())
        
        return {
            "success": True,
            "score": total_score,
            "total_score": max_possible,
            "feedback": ctx.feedback,
            "scores_breakdown": ctx.scores,
            "team_name": ctx.team_name or file.filename,
            "message": "Evaluation completed successfully"
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

@app.get("/criteria")
async def get_evaluation_criteria():
    """Get current evaluation criteria"""
    return {
        "criteria": default_eval_params.criteria,
        "rubric": default_eval_params.rubric,
        "total_score": sum(c["max_score"] for c in default_eval_params.criteria.values())
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
