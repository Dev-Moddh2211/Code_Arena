import re
import uuid
from datetime import datetime, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models.user import User
from app.models.problem import Problem, ProblemLanguageConfig, TestCase, Hint
from app.models.submission import Submission, UserProblemProgress
from app.models.sheet import Sheet, SheetProblem
from app.models.daily_challenge import DailyChallenge
from app.schemas.admin import (
    ProblemCreateRequest,
    ProblemUpdateRequest,
    AdminProblemItem,
    AdminProblemDetail,
    TestCaseCreateRequest,
    HintCreateRequest,
    LanguageConfigCreateRequest,
    EditorialUpdateRequest,
    SheetCreateRequest,
    SheetUpdateRequest,
    DailyChallengeSetRequest,
    AdminAnalyticsPayload,
    AdminProblemStat,
)
from app.schemas.problem import (
    ProblemDetail,
    TestCaseSchema,
    HintSchema,
    LanguageConfigSchema,
)
from app.services.auth_service import require_admin
from app.services.problem_service import ProblemService
from app.judge.language_configs import DEFAULT_LANGUAGE_CONFIGS

router = APIRouter(prefix="/admin", tags=["Admin CMS"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

@router.get("/problems", response_model=List[AdminProblemItem])
def list_admin_problems(
    status_filter: Optional[str] = Query(None, description="draft | published | archived"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    query = db.query(Problem)
    if status_filter:
        query = query.filter(Problem.status == status_filter.lower())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Problem.title.ilike(s)) | (Problem.slug.ilike(s)))

    problems = query.order_by(desc(Problem.created_at)).all()
    problem_ids = [p.id for p in problems]
    stats_map = ProblemService.get_stats_for_problems(db, problem_ids)

    items = []
    for p in problems:
        st = stats_map.get(p.id, {})
        items.append(
            AdminProblemItem(
                id=p.id,
                slug=p.slug,
                title=p.title,
                difficulty=p.difficulty,
                topic_tags=p.topic_tags or [],
                company_tags=p.company_tags or [],
                status=p.status,
                points=p.points,
                test_cases_count=len(p.test_cases),
                hints_count=len(p.hints),
                language_configs_count=len(p.language_configs),
                total_submissions=st.get("total_subs", 0),
                acceptance_rate=st.get("acceptance_rate", 0.0),
                created_at=p.created_at,
                updated_at=p.updated_at
            )
        )
    return items

@router.post("/problems", response_model=AdminProblemDetail)
def create_problem(
    req: ProblemCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    slug = req.slug.strip() if req.slug else slugify(req.title)
    existing = db.query(Problem).filter(Problem.slug == slug).first()
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    problem = Problem(
        slug=slug,
        title=req.title,
        description_md=req.description_md,
        editorial_md=req.editorial_md,
        difficulty=req.difficulty.lower(),
        topic_tags=req.topic_tags,
        company_tags=req.company_tags,
        constraints_md=req.constraints_md,
        points=req.points,
        time_limit_ms=req.time_limit_ms,
        memory_limit_mb=req.memory_limit_mb,
        status=req.status.lower(),
        created_by=admin_user.id
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)

    # Add default language configs for python and js
    for lang in ["python", "javascript"]:
        cfg = DEFAULT_LANGUAGE_CONFIGS[lang]
        db.add(ProblemLanguageConfig(
            problem_id=problem.id,
            language=lang,
            starter_code=cfg["starter_code"],
            wrapper_template=cfg["wrapper_template"]
        ))
    db.commit()
    db.refresh(problem)

    return AdminProblemDetail(
        id=problem.id,
        slug=problem.slug,
        title=problem.title,
        description_md=problem.description_md,
        editorial_md=problem.editorial_md,
        difficulty=problem.difficulty,
        topic_tags=problem.topic_tags or [],
        company_tags=problem.company_tags or [],
        constraints_md=problem.constraints_md,
        points=problem.points,
        time_limit_ms=problem.time_limit_ms,
        memory_limit_mb=problem.memory_limit_mb,
        status=problem.status,
        created_at=problem.created_at,
        updated_at=problem.updated_at,
        test_cases=[],
        hints=[],
        language_configs=[LanguageConfigSchema.model_validate(c) for c in problem.language_configs]
    )

@router.get("/problems/{id}", response_model=AdminProblemDetail)
def get_admin_problem(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    return AdminProblemDetail(
        id=problem.id,
        slug=problem.slug,
        title=problem.title,
        description_md=problem.description_md,
        editorial_md=problem.editorial_md,
        difficulty=problem.difficulty,
        topic_tags=problem.topic_tags or [],
        company_tags=problem.company_tags or [],
        constraints_md=problem.constraints_md,
        points=problem.points,
        time_limit_ms=problem.time_limit_ms,
        memory_limit_mb=problem.memory_limit_mb,
        status=problem.status,
        created_at=problem.created_at,
        updated_at=problem.updated_at,
        test_cases=[TestCaseSchema.model_validate(tc) for tc in problem.test_cases],
        hints=[HintSchema.model_validate(h) for h in problem.hints],
        language_configs=[LanguageConfigSchema.model_validate(c) for c in problem.language_configs]
    )

@router.put("/problems/{id}", response_model=AdminProblemDetail)
def update_problem(
    id: str,
    req: ProblemUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    if req.title is not None: problem.title = req.title
    if req.slug is not None: problem.slug = req.slug
    if req.description_md is not None: problem.description_md = req.description_md
    if req.editorial_md is not None: problem.editorial_md = req.editorial_md
    if req.difficulty is not None: problem.difficulty = req.difficulty.lower()
    if req.topic_tags is not None: problem.topic_tags = req.topic_tags
    if req.company_tags is not None: problem.company_tags = req.company_tags
    if req.constraints_md is not None: problem.constraints_md = req.constraints_md
    if req.points is not None: problem.points = req.points
    if req.time_limit_ms is not None: problem.time_limit_ms = req.time_limit_ms
    if req.memory_limit_mb is not None: problem.memory_limit_mb = req.memory_limit_mb
    if req.status is not None: problem.status = req.status.lower()

    problem.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(problem)

    return AdminProblemDetail(
        id=problem.id,
        slug=problem.slug,
        title=problem.title,
        description_md=problem.description_md,
        editorial_md=problem.editorial_md,
        difficulty=problem.difficulty,
        topic_tags=problem.topic_tags or [],
        company_tags=problem.company_tags or [],
        constraints_md=problem.constraints_md,
        points=problem.points,
        time_limit_ms=problem.time_limit_ms,
        memory_limit_mb=problem.memory_limit_mb,
        status=problem.status,
        created_at=problem.created_at,
        updated_at=problem.updated_at,
        test_cases=[TestCaseSchema.model_validate(tc) for tc in problem.test_cases],
        hints=[HintSchema.model_validate(h) for h in problem.hints],
        language_configs=[LanguageConfigSchema.model_validate(c) for c in problem.language_configs]
    )

@router.post("/problems/{id}/clone", response_model=AdminProblemDetail)
def clone_problem(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    source = db.query(Problem).filter(Problem.id == id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source problem not found")

    new_title = f"{source.title} (Clone)"
    new_slug = f"{source.slug}-clone-{uuid.uuid4().hex[:4]}"

    clone = Problem(
        slug=new_slug,
        title=new_title,
        description_md=source.description_md,
        editorial_md=source.editorial_md,
        difficulty=source.difficulty,
        topic_tags=source.topic_tags or [],
        company_tags=source.company_tags or [],
        constraints_md=source.constraints_md,
        points=source.points,
        time_limit_ms=source.time_limit_ms,
        memory_limit_mb=source.memory_limit_mb,
        status="draft",
        created_by=admin_user.id
    )
    db.add(clone)
    db.commit()
    db.refresh(clone)

    # Clone test cases
    for tc in source.test_cases:
        db.add(TestCase(
            problem_id=clone.id,
            input_json=tc.input_json,
            expected_output_json=tc.expected_output_json,
            is_sample=tc.is_sample,
            order_matters=tc.order_matters,
            display_order=tc.display_order
        ))

    # Clone hints
    for h in source.hints:
        db.add(Hint(
            problem_id=clone.id,
            content_md=h.content_md,
            display_order=h.display_order
        ))

    # Clone language configs
    for cfg in source.language_configs:
        db.add(ProblemLanguageConfig(
            problem_id=clone.id,
            language=cfg.language,
            starter_code=cfg.starter_code,
            wrapper_template=cfg.wrapper_template
        ))

    db.commit()
    db.refresh(clone)

    return AdminProblemDetail(
        id=clone.id,
        slug=clone.slug,
        title=clone.title,
        description_md=clone.description_md,
        editorial_md=clone.editorial_md,
        difficulty=clone.difficulty,
        topic_tags=clone.topic_tags or [],
        company_tags=clone.company_tags or [],
        constraints_md=clone.constraints_md,
        points=clone.points,
        time_limit_ms=clone.time_limit_ms,
        memory_limit_mb=clone.memory_limit_mb,
        status=clone.status,
        created_at=clone.created_at,
        updated_at=clone.updated_at,
        test_cases=[TestCaseSchema.model_validate(tc) for tc in clone.test_cases],
        hints=[HintSchema.model_validate(h) for h in clone.hints],
        language_configs=[LanguageConfigSchema.model_validate(c) for c in clone.language_configs]
    )

@router.put("/problems/{id}/publish")
def publish_problem(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    p = db.query(Problem).filter(Problem.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    p.status = "published"
    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "ok", "message": "Problem published successfully"}

@router.put("/problems/{id}/archive")
def archive_problem(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    p = db.query(Problem).filter(Problem.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    p.status = "archived"
    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "ok", "message": "Problem archived"}

@router.delete("/problems/{id}")
def delete_problem(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    p = db.query(Problem).filter(Problem.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    db.delete(p)
    db.commit()
    return {"status": "ok", "message": "Problem deleted"}

@router.get("/problems/{id}/preview", response_model=ProblemDetail)
def preview_problem(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    problem = db.query(Problem).filter(Problem.id == id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Return as student detail view
    return ProblemService.get_problem_by_slug(db, problem.slug, admin_user)

# --- Test Cases Management ---
@router.post("/problems/{id}/test-cases", response_model=TestCaseSchema)
def add_test_case(
    id: str,
    req: TestCaseCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    p = db.query(Problem).filter(Problem.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    tc = TestCase(
        problem_id=p.id,
        input_json=req.input_json,
        expected_output_json=req.expected_output_json,
        is_sample=req.is_sample,
        order_matters=req.order_matters,
        display_order=req.display_order
    )
    db.add(tc)
    db.commit()
    db.refresh(tc)
    return TestCaseSchema.model_validate(tc)

@router.put("/test-cases/{tc_id}", response_model=TestCaseSchema)
def update_test_case(
    tc_id: str,
    req: TestCaseCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    tc = db.query(TestCase).filter(TestCase.id == tc_id).first()
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
    tc.input_json = req.input_json
    tc.expected_output_json = req.expected_output_json
    tc.is_sample = req.is_sample
    tc.order_matters = req.order_matters
    tc.display_order = req.display_order
    db.commit()
    db.refresh(tc)
    return TestCaseSchema.model_validate(tc)

@router.delete("/test-cases/{tc_id}")
def delete_test_case(
    tc_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    tc = db.query(TestCase).filter(TestCase.id == tc_id).first()
    if not tc:
        raise HTTPException(status_code=404, detail="Test case not found")
    db.delete(tc)
    db.commit()
    return {"status": "ok"}

# --- Hints Management ---
@router.post("/problems/{id}/hints", response_model=HintSchema)
def add_hint(
    id: str,
    req: HintCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    p = db.query(Problem).filter(Problem.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    hint = Hint(problem_id=p.id, content_md=req.content_md, display_order=req.display_order)
    db.add(hint)
    db.commit()
    db.refresh(hint)
    return HintSchema.model_validate(hint)

@router.delete("/hints/{hint_id}")
def delete_hint(
    hint_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    h = db.query(Hint).filter(Hint.id == hint_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hint not found")
    db.delete(h)
    db.commit()
    return {"status": "ok"}

# --- Language Configs Management ---
@router.post("/problems/{id}/language-configs", response_model=LanguageConfigSchema)
def set_language_config(
    id: str,
    req: LanguageConfigCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    p = db.query(Problem).filter(Problem.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    cfg = db.query(ProblemLanguageConfig).filter(
        ProblemLanguageConfig.problem_id == p.id,
        ProblemLanguageConfig.language == req.language.lower()
    ).first()

    if cfg:
        cfg.starter_code = req.starter_code
        cfg.wrapper_template = req.wrapper_template
    else:
        cfg = ProblemLanguageConfig(
            problem_id=p.id,
            language=req.language.lower(),
            starter_code=req.starter_code,
            wrapper_template=req.wrapper_template
        )
        db.add(cfg)

    db.commit()
    db.refresh(cfg)
    return LanguageConfigSchema.model_validate(cfg)

# --- Editorial ---
@router.put("/problems/{id}/editorial")
def set_editorial(
    id: str,
    req: EditorialUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    p = db.query(Problem).filter(Problem.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    p.editorial_md = req.editorial_md
    p.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "ok", "message": "Editorial updated"}

# --- Daily Challenge Setting ---
@router.put("/daily-challenge")
def set_daily_challenge(
    req: DailyChallengeSetRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    c_date = datetime.strptime(req.challenge_date, "%Y-%m-%d").date()
    dc = db.query(DailyChallenge).filter(DailyChallenge.challenge_date == c_date).first()
    if dc:
        dc.problem_id = req.problem_id
    else:
        dc = DailyChallenge(problem_id=req.problem_id, challenge_date=c_date)
        db.add(dc)
    db.commit()
    return {"status": "ok", "date": req.challenge_date}

# --- Platform Analytics ---
@router.get("/analytics", response_model=AdminAnalyticsPayload)
def get_admin_analytics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_probs = db.query(func.count(Problem.id)).scalar() or 0
    published_probs = db.query(func.count(Problem.id)).filter(Problem.status == "published").scalar() or 0
    draft_probs = db.query(func.count(Problem.id)).filter(Problem.status == "draft").scalar() or 0
    archived_probs = db.query(func.count(Problem.id)).filter(Problem.status == "archived").scalar() or 0

    total_subs = db.query(func.count(Submission.id)).scalar() or 0
    accepted_subs = db.query(func.count(Submission.id)).filter(Submission.status == "accepted").scalar() or 0
    plat_acc_rate = round((accepted_subs / total_subs) * 100, 1) if total_subs > 0 else 0.0

    # Submissions grouped by problem
    all_published = db.query(Problem).filter(Problem.status == "published").all()
    pids = [p.id for p in all_published]
    stats_map = ProblemService.get_stats_for_problems(db, pids)

    stats_list = []
    for p in all_published:
        st = stats_map.get(p.id, {})
        stats_list.append(
            AdminProblemStat(
                id=p.id,
                slug=p.slug,
                title=p.title,
                difficulty=p.difficulty,
                total_submissions=st.get("total_subs", 0),
                acceptance_rate=st.get("acceptance_rate", 0.0)
            )
        )

    most_attempted = sorted(stats_list, key=lambda x: x.total_submissions, reverse=True)[:5]
    # Lowest acceptance among problems with at least 1 submission
    with_subs = [s for s in stats_list if s.total_submissions > 0]
    lowest_acceptance = sorted(with_subs, key=lambda x: x.acceptance_rate)[:5]

    return AdminAnalyticsPayload(
        total_users=total_users,
        total_problems=total_probs,
        published_problems=published_probs,
        draft_problems=draft_probs,
        archived_problems=archived_probs,
        total_submissions=total_subs,
        total_accepted_submissions=accepted_subs,
        platform_acceptance_rate=plat_acc_rate,
        most_attempted_problems=most_attempted,
        lowest_acceptance_problems=lowest_acceptance
    )
