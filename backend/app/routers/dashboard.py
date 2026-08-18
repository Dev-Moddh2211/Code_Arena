from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardPayload
from app.schemas.problem import ProblemListItem
from app.services.auth_service import get_current_user
from app.services.dashboard_service import DashboardService
from app.services.problem_service import ProblemService

router = APIRouter(tags=["Dashboard & User Data"])

@router.get("/users/me/dashboard", response_model=DashboardPayload)
def get_my_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return DashboardService.get_user_dashboard(db, user)

@router.get("/users/me/favorites", response_model=List[ProblemListItem])
def get_my_favorites(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return ProblemService.get_user_favorites(db, user.id)

@router.get("/users/me/recently-viewed", response_model=List[ProblemListItem])
def get_my_recently_viewed(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return ProblemService.get_recently_viewed(db, user.id)
