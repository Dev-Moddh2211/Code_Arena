from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models.user import User
from app.models.submission import Submission, UserProblemProgress
from app.models.problem import Problem

router = APIRouter(tags=["Leaderboard & Profiles"])

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    total_score: int
    solved_count: int
    easy_solved: int
    medium_solved: int
    hard_solved: int

class UserProfileResponse(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    total_score: int
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    created_at: str

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    # Exclude is_demo users from the official public leaderboard per spec
    users = db.query(User).filter(User.is_demo == False).all()
    
    entries = []
    for u in users:
        solved_progs = db.query(UserProblemProgress).filter(
            UserProblemProgress.user_id == u.id,
            UserProblemProgress.status == "solved"
        ).all()
        solved_pids = [p.problem_id for p in solved_progs]
        
        probs = db.query(Problem).filter(Problem.id.in_(solved_pids)).all() if solved_pids else []
        easy_cnt = sum(1 for p in probs if p.difficulty.lower() == "easy")
        med_cnt = sum(1 for p in probs if p.difficulty.lower() == "medium")
        hard_cnt = sum(1 for p in probs if p.difficulty.lower() == "hard")
        total_score = sum(p.points for p in probs)

        entries.append({
            "user_id": u.id,
            "username": u.username,
            "avatar_url": u.avatar_url,
            "bio": u.bio,
            "total_score": total_score,
            "solved_count": len(probs),
            "easy_solved": easy_cnt,
            "medium_solved": med_cnt,
            "hard_solved": hard_cnt
        })

    entries.sort(key=lambda x: (x["total_score"], x["solved_count"]), reverse=True)
    
    result = []
    for idx, e in enumerate(entries[:limit], 1):
        result.append(LeaderboardEntry(rank=idx, **e))
    return result

@router.get("/users/{username}", response_model=UserProfileResponse)
def get_user_profile(
    username: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    solved_progs = db.query(UserProblemProgress).filter(
        UserProblemProgress.user_id == user.id,
        UserProblemProgress.status == "solved"
    ).all()
    solved_pids = [p.problem_id for p in solved_progs]
    probs = db.query(Problem).filter(Problem.id.in_(solved_pids)).all() if solved_pids else []
    
    easy_cnt = sum(1 for p in probs if p.difficulty.lower() == "easy")
    med_cnt = sum(1 for p in probs if p.difficulty.lower() == "medium")
    hard_cnt = sum(1 for p in probs if p.difficulty.lower() == "hard")
    total_score = sum(p.points for p in probs)

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        avatar_url=user.avatar_url,
        bio=user.bio,
        total_score=total_score,
        total_solved=len(probs),
        easy_solved=easy_cnt,
        medium_solved=med_cnt,
        hard_solved=hard_cnt,
        created_at=user.created_at.strftime("%B %Y")
    )
