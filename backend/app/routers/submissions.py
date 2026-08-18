from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.submission import (
    RunCodeRequest,
    SubmitCodeRequest,
    ExecutionResult,
    SubmissionResponse,
    SubmissionListItem,
    SubmissionAnalytics,
)
from app.services.auth_service import get_current_user
from app.services.submission_service import SubmissionService

router = APIRouter(prefix="/submissions", tags=["Submissions"])

@router.post("/run", response_model=ExecutionResult)
def run_code(
    req: RunCodeRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return SubmissionService.run_code(db, req, user)

@router.post("/submit", response_model=SubmissionResponse)
def submit_code(
    req: SubmitCodeRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return SubmissionService.submit_code(db, req, user)

@router.get("/analytics", response_model=SubmissionAnalytics)
def get_analytics(
    problem_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return SubmissionService.get_submission_analytics(db, user.id, problem_id)

@router.get("/{id}", response_model=SubmissionResponse)
def get_submission(
    id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return SubmissionService.get_submission_by_id(db, id, user)

@router.get("", response_model=List[SubmissionListItem])
def list_submissions(
    problem_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return SubmissionService.list_user_submissions(
        db=db,
        user_id=user.id,
        problem_id=problem_id,
        status_filter=status,
        language=language,
        limit=limit
    )
