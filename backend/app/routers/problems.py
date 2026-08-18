from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.problem import (
    PaginatedProblems,
    ProblemListItem,
    ProblemDetail,
    HintSchema,
    ReactionRequest,
    NoteUpsertRequest,
    NoteResponse,
)
from app.services.auth_service import get_optional_user, get_current_user
from app.services.problem_service import ProblemService

router = APIRouter(prefix="/problems", tags=["Problems"])

@router.get("", response_model=PaginatedProblems)
def list_problems(
    difficulty: Optional[str] = Query(None, description="easy | medium | hard"),
    topic: Optional[str] = Query(None, description="Topic tag"),
    company: Optional[str] = Query(None, description="Company tag"),
    search: Optional[str] = Query(None, description="Keyword search"),
    status: Optional[str] = Query(None, description="solved | attempted | unsolved"),
    acceptance_min: Optional[float] = Query(None, description="Min acceptance %"),
    acceptance_max: Optional[float] = Query(None, description="Max acceptance %"),
    language: Optional[str] = Query(None, description="Language filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    return ProblemService.list_problems(
        db=db,
        user=user,
        difficulty=difficulty,
        topic=topic,
        company=company,
        search=search,
        status_filter=status,
        acceptance_min=acceptance_min,
        acceptance_max=acceptance_max,
        language=language,
        page=page,
        page_size=page_size
    )

@router.get("/random", response_model=Optional[ProblemListItem])
def get_random_problem(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    prob = ProblemService.get_random_problem(db, user)
    if not prob:
        raise HTTPException(status_code=404, detail="No problems found")
    return prob

@router.get("/{slug}", response_model=ProblemDetail)
def get_problem(
    slug: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    problem = ProblemService.get_problem_by_slug(db, slug, user)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@router.get("/{slug}/hints", response_model=List[HintSchema])
def get_problem_hints(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return ProblemService.get_hints(db, slug)

@router.get("/{slug}/similar", response_model=List[ProblemListItem])
def get_similar_problems(
    slug: str,
    limit: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    return ProblemService.get_similar_problems(db, slug, limit=limit)

@router.post("/{id}/reaction")
def set_reaction(
    id: str,
    req: ReactionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if req.reaction not in ("like", "dislike"):
        raise HTTPException(status_code=400, detail="Reaction must be 'like' or 'dislike'")
    ProblemService.set_reaction(db, id, user.id, req.reaction)
    return {"status": "ok", "reaction": req.reaction}

@router.get("/{id}/notes", response_model=NoteResponse)
def get_note(
    id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    note = ProblemService.upsert_note(db, id, user.id, "")
    return NoteResponse(problem_id=id, content_md=note.content_md, updated_at=note.updated_at)

@router.put("/{id}/notes", response_model=NoteResponse)
def update_note(
    id: str,
    req: NoteUpsertRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    note = ProblemService.upsert_note(db, id, user.id, req.content_md)
    return NoteResponse(problem_id=id, content_md=note.content_md, updated_at=note.updated_at)

@router.post("/{id}/favorite")
def add_favorite(
    id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    is_fav = ProblemService.toggle_favorite(db, id, user.id)
    return {"status": "ok", "is_favorited": is_fav}

@router.delete("/{id}/favorite")
def remove_favorite(
    id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    is_fav = ProblemService.toggle_favorite(db, id, user.id)
    return {"status": "ok", "is_favorited": is_fav}
