from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.sheet import Sheet, SheetProblem
from app.models.problem import Problem
from app.models.submission import UserProblemProgress
from app.models.user import User
from app.schemas.sheet import SheetSummary, SheetDetail
from app.schemas.problem import ProblemListItem
from app.services.auth_service import get_optional_user
from app.services.problem_service import ProblemService

router = APIRouter(prefix="/sheets", tags=["Company & Topic Sheets"])

@router.get("", response_model=List[SheetSummary])
def list_sheets(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    sheets = db.query(Sheet).all()
    user_solved_ids = set()
    if user:
        solved_records = db.query(UserProblemProgress.problem_id).filter(
            UserProblemProgress.user_id == user.id, UserProblemProgress.status == "solved"
        ).all()
        user_solved_ids = {s[0] for s in solved_records}

    summaries = []
    for s in sheets:
        pids = [sp.problem_id for sp in s.sheet_problems]
        total_p = len(pids)
        solved_p = sum(1 for pid in pids if pid in user_solved_ids)
        pct = round((solved_p / total_p) * 100, 1) if total_p > 0 else 0.0
        summaries.append(
            SheetSummary(
                id=s.id,
                slug=s.slug,
                name=s.name,
                description=s.description,
                total_problems=total_p,
                solved_problems=solved_p,
                progress_percentage=pct
            )
        )
    return summaries

@router.get("/{slug}", response_model=SheetDetail)
def get_sheet_detail(
    slug: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    sheet = db.query(Sheet).filter(Sheet.slug == slug).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")

    user_status_map = {}
    if user:
        progress_records = db.query(UserProblemProgress).filter(UserProblemProgress.user_id == user.id).all()
        user_status_map = {p.problem_id: p.status for p in progress_records}

    ordered_sheet_probs = sorted(sheet.sheet_problems, key=lambda x: x.display_order)
    pids = [sp.problem_id for sp in ordered_sheet_probs]
    stats_map = ProblemService.get_stats_for_problems(db, pids)

    problem_items = []
    solved_count = 0
    for sp in ordered_sheet_probs:
        prob = sp.problem
        if not prob:
            continue
        u_st = user_status_map.get(prob.id, "unsolved")
        if u_st == "solved":
            solved_count += 1
        st = stats_map.get(prob.id, {})
        problem_items.append(
            ProblemListItem(
                id=prob.id,
                slug=prob.slug,
                title=prob.title,
                difficulty=prob.difficulty,
                topic_tags=prob.topic_tags or [],
                company_tags=prob.company_tags or [],
                points=prob.points,
                status=prob.status,
                acceptance_rate=st.get("acceptance_rate", 0.0),
                total_submissions=st.get("total_subs", 0),
                likes_count=st.get("likes", 0),
                dislikes_count=st.get("dislikes", 0),
                user_status=u_st if user else None
            )
        )

    total_p = len(problem_items)
    pct = round((solved_count / total_p) * 100, 1) if total_p > 0 else 0.0

    return SheetDetail(
        id=sheet.id,
        slug=sheet.slug,
        name=sheet.name,
        description=sheet.description,
        total_problems=total_p,
        solved_problems=solved_count,
        progress_percentage=pct,
        problems=problem_items
    )
