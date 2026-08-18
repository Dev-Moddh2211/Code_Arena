from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.daily_challenge import DailyChallenge
from app.models.submission import UserProblemProgress
from app.models.problem import Problem
from app.models.user import User
from app.schemas.sheet import DailyChallengeResponse
from app.schemas.problem import ProblemListItem
from app.services.auth_service import get_optional_user
from app.services.problem_service import ProblemService

router = APIRouter(tags=["Daily Challenge"])

@router.get("/daily-challenge", response_model=DailyChallengeResponse)
def get_daily_challenge(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    today = date.today()
    dc = db.query(DailyChallenge).filter(DailyChallenge.challenge_date == today).first()
    
    # If no challenge set for today, pick the first published problem
    problem = None
    if dc and dc.problem:
        problem = dc.problem
    else:
        problem = db.query(Problem).filter(Problem.status == "published").first()

    if not problem:
        raise HTTPException(status_code=404, detail="No daily challenge found")

    stats_map = ProblemService.get_stats_for_problems(db, [problem.id])
    st = stats_map.get(problem.id, {})

    user_solved = False
    if user:
        prog = db.query(UserProblemProgress).filter(
            UserProblemProgress.problem_id == problem.id,
            UserProblemProgress.user_id == user.id
        ).first()
        user_solved = (prog is not None and prog.status == "solved")

    p_item = ProblemListItem(
        id=problem.id,
        slug=problem.slug,
        title=problem.title,
        difficulty=problem.difficulty,
        topic_tags=problem.topic_tags or [],
        company_tags=problem.company_tags or [],
        points=problem.points,
        status=problem.status,
        acceptance_rate=st.get("acceptance_rate", 0.0),
        total_submissions=st.get("total_subs", 0),
        likes_count=st.get("likes", 0),
        dislikes_count=st.get("dislikes", 0),
        user_status="solved" if user_solved else ("unsolved" if user else None)
    )

    return DailyChallengeResponse(
        date=today.strftime("%Y-%m-%d"),
        problem=p_item,
        user_solved=user_solved
    )
