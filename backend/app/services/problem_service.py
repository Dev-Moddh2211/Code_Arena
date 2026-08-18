import random
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc, case
from app.models.problem import Problem, ProblemLanguageConfig, TestCase, Hint
from app.models.submission import Submission, UserProblemProgress
from app.models.reaction import ProblemReaction
from app.models.note import Note
from app.models.favorite import Favorite
from app.models.view import ProblemView
from app.models.user import User
from app.schemas.problem import (
    ProblemListItem,
    ProblemDetail,
    TestCaseSchema,
    LanguageConfigSchema,
    HintSchema,
    PaginatedProblems,
)
from app.judge.language_configs import DEFAULT_LANGUAGE_CONFIGS

class ProblemService:
    @staticmethod
    def get_stats_for_problems(db: Session, problem_ids: List[str]):
        """Helper to batch fetch submission counts and acceptance rates for problems."""
        if not problem_ids:
            return {}
        
        subs = db.query(
            Submission.problem_id,
            func.count(Submission.id).label("total_subs"),
            func.sum(case((Submission.status == "accepted", 1), else_=0)).label("accepted_subs")
        ).filter(Submission.problem_id.in_(problem_ids)).group_by(Submission.problem_id).all()

        stats = {}
        for pid, total, accepted in subs:
            acc_rate = round((accepted / total) * 100, 1) if total > 0 else 0.0
            stats[pid] = {"total_subs": total, "accepted_subs": accepted, "acceptance_rate": acc_rate}

        # Reactions
        reactions = db.query(
            ProblemReaction.problem_id,
            func.sum(case((ProblemReaction.reaction == "like", 1), else_=0)).label("likes"),
            func.sum(case((ProblemReaction.reaction == "dislike", 1), else_=0)).label("dislikes")
        ).filter(ProblemReaction.problem_id.in_(problem_ids)).group_by(ProblemReaction.problem_id).all()

        for pid, likes, dislikes in reactions:
            if pid not in stats:
                stats[pid] = {"total_subs": 0, "accepted_subs": 0, "acceptance_rate": 0.0}
            stats[pid]["likes"] = likes or 0
            stats[pid]["dislikes"] = dislikes or 0

        return stats

    @staticmethod
    def list_problems(
        db: Session,
        user: Optional[User] = None,
        difficulty: Optional[str] = None,
        topic: Optional[str] = None,
        company: Optional[str] = None,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,  # 'solved', 'attempted', 'unsolved'
        acceptance_min: Optional[float] = None,
        acceptance_max: Optional[float] = None,
        language: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> PaginatedProblems:
        query = db.query(Problem).filter(Problem.status == "published")

        if difficulty:
            query = query.filter(Problem.difficulty == difficulty.lower())

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Problem.title.ilike(search_term),
                    Problem.slug.ilike(search_term)
                )
            )

        if topic:
            query = query.filter(Problem.topic_tags.like(f"%{topic.strip()}%"))

        if company:
            query = query.filter(Problem.company_tags.like(f"%{company.strip()}%"))

        # User status filtering at query level if authenticated
        if user and status_filter:
            if status_filter.lower() in ["solved", "attempted"]:
                query = query.join(
                    UserProblemProgress,
                    and_(
                        UserProblemProgress.problem_id == Problem.id,
                        UserProblemProgress.user_id == user.id,
                        UserProblemProgress.status == status_filter.lower()
                    )
                )
            elif status_filter.lower() == "unsolved":
                # Not in solved list
                solved_ids = db.query(UserProblemProgress.problem_id).filter(
                    UserProblemProgress.user_id == user.id,
                    UserProblemProgress.status == "solved"
                )
                query = query.filter(~Problem.id.in_(solved_ids))

        # Order by display / created
        query = query.order_by(Problem.created_at.asc())

        # SQL-level Count
        total = query.count()
        total_pages = max(1, (total + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size

        # SQL-level Limit / Offset
        paged_problems = query.offset(start_idx).limit(page_size).all()

        # Batch-fetch stats ONLY for the paged subset (20 items max)
        paged_ids = [p.id for p in paged_problems]
        stats_map = ProblemService.get_stats_for_problems(db, paged_ids)

        user_progress_map = {}
        user_favorites_set = set()
        if user and paged_ids:
            progress_records = db.query(UserProblemProgress).filter(
                UserProblemProgress.user_id == user.id,
                UserProblemProgress.problem_id.in_(paged_ids)
            ).all()
            user_progress_map = {p.problem_id: p.status for p in progress_records}

            fav_records = db.query(Favorite.problem_id).filter(
                Favorite.user_id == user.id,
                Favorite.problem_id.in_(paged_ids)
            ).all()
            user_favorites_set = {f[0] for f in fav_records}

        items = []
        for p in paged_problems:
            st = stats_map.get(p.id, {"total_subs": 0, "accepted_subs": 0, "acceptance_rate": 0.0, "likes": 0, "dislikes": 0})
            u_status = user_progress_map.get(p.id, None)
            items.append(
                ProblemListItem(
                    id=p.id,
                    slug=p.slug,
                    title=p.title,
                    difficulty=p.difficulty,
                    topic_tags=p.topic_tags or [],
                    company_tags=p.company_tags or [],
                    points=p.points,
                    status=p.status,
                    acceptance_rate=st.get("acceptance_rate", 0.0),
                    total_submissions=st.get("total_subs", 0),
                    likes_count=st.get("likes", 0),
                    dislikes_count=st.get("dislikes", 0),
                    user_status=u_status if user else None,
                    is_favorited=(p.id in user_favorites_set)
                )
            )

        return PaginatedProblems(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_problem_by_slug(db: Session, slug: str, user: Optional[User] = None) -> Optional[ProblemDetail]:
        problem = db.query(Problem).filter(Problem.slug == slug).first()
        if not problem:
            return None

        # Sample test cases
        sample_tests = [
            TestCaseSchema.model_validate(tc)
            for tc in problem.test_cases
            if tc.is_sample
        ]

        # Language configs: merge problem-specific configs with defaults so all 4 languages always exist
        configured_map = {cfg.language.lower(): cfg for cfg in (problem.language_configs or [])}
        configs = []
        for lang, default_val in DEFAULT_LANGUAGE_CONFIGS.items():
            if lang in configured_map:
                configs.append(LanguageConfigSchema.model_validate(configured_map[lang]))
            else:
                configs.append(
                    LanguageConfigSchema(
                        language=lang,
                        starter_code=default_val["starter_code"],
                        wrapper_template=default_val["wrapper_template"]
                    )
                )

        # Submission statistics
        subs = db.query(
            func.count(Submission.id).label("total"),
            func.sum(case((Submission.status == "accepted", 1), else_=0)).label("accepted"),
            func.avg(case((Submission.status == "accepted", Submission.runtime_ms), else_=None)).label("avg_runtime"),
            func.avg(case((Submission.status == "accepted", Submission.memory_kb), else_=None)).label("avg_memory")
        ).filter(Submission.problem_id == problem.id).first()

        total_subs = subs.total or 0
        total_accepted = subs.accepted or 0
        acc_rate = round((total_accepted / total_subs) * 100, 1) if total_subs > 0 else 0.0
        avg_runtime = round(subs.avg_runtime, 1) if subs.avg_runtime else None
        avg_memory = round(subs.avg_memory, 1) if subs.avg_memory else None

        # Reactions
        likes = db.query(func.count(ProblemReaction.id)).filter(
            ProblemReaction.problem_id == problem.id, ProblemReaction.reaction == "like"
        ).scalar() or 0
        dislikes = db.query(func.count(ProblemReaction.id)).filter(
            ProblemReaction.problem_id == problem.id, ProblemReaction.reaction == "dislike"
        ).scalar() or 0

        user_reaction = None
        user_status = None
        is_fav = False
        user_note = None

        if user:
            # User reaction
            u_rx = db.query(ProblemReaction).filter(
                ProblemReaction.problem_id == problem.id, ProblemReaction.user_id == user.id
            ).first()
            if u_rx:
                user_reaction = u_rx.reaction

            # User progress
            u_prog = db.query(UserProblemProgress).filter(
                UserProblemProgress.problem_id == problem.id, UserProblemProgress.user_id == user.id
            ).first()
            if u_prog:
                user_status = u_prog.status

            # User favorite
            is_fav = db.query(Favorite).filter(
                Favorite.problem_id == problem.id, Favorite.user_id == user.id
            ).first() is not None

            # User note
            u_note = db.query(Note).filter(
                Note.problem_id == problem.id, Note.user_id == user.id
            ).first()
            if u_note:
                user_note = u_note.content_md

            # Record view
            ProblemService.record_view(db, problem.id, user.id)
        else:
            ProblemService.record_view(db, problem.id, None)

        return ProblemDetail(
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
            sample_test_cases=sample_tests,
            language_configs=configs,
            hints_count=len(problem.hints),
            acceptance_rate=acc_rate,
            total_submissions=total_subs,
            total_accepted=total_accepted,
            likes_count=likes,
            dislikes_count=dislikes,
            user_reaction=user_reaction,
            user_status=user_status,
            is_favorited=is_fav,
            user_note=user_note,
            avg_runtime_ms=avg_runtime,
            avg_memory_kb=avg_memory
        )

    @staticmethod
    def get_hints(db: Session, slug: str) -> List[HintSchema]:
        problem = db.query(Problem).filter(Problem.slug == slug).first()
        if not problem:
            return []
        return [HintSchema.model_validate(h) for h in problem.hints]

    @staticmethod
    def get_similar_problems(db: Session, slug: str, limit: int = 4) -> List[ProblemListItem]:
        current = db.query(Problem).filter(Problem.slug == slug).first()
        if not current:
            return []

        all_published = db.query(Problem).filter(
            Problem.status == "published", Problem.id != current.id
        ).all()

        current_tags = set(t.lower() for t in (current.topic_tags or []))
        scored = []
        for p in all_published:
            p_tags = set(t.lower() for t in (p.topic_tags or []))
            overlap = len(current_tags.intersection(p_tags))
            scored.append((overlap, p))

        scored.sort(key=lambda x: x[0], reverse=True)
        top = [p for _, p in scored[:limit]]

        problem_ids = [p.id for p in top]
        stats = ProblemService.get_stats_for_problems(db, problem_ids)

        return [
            ProblemListItem(
                id=p.id,
                slug=p.slug,
                title=p.title,
                difficulty=p.difficulty,
                topic_tags=p.topic_tags or [],
                company_tags=p.company_tags or [],
                points=p.points,
                status=p.status,
                acceptance_rate=stats.get(p.id, {}).get("acceptance_rate", 0.0),
                total_submissions=stats.get(p.id, {}).get("total_subs", 0),
                likes_count=stats.get(p.id, {}).get("likes", 0),
                dislikes_count=stats.get(p.id, {}).get("dislikes", 0)
            )
            for p in top
        ]

    @staticmethod
    def get_random_problem(db: Session, user: Optional[User] = None) -> Optional[ProblemListItem]:
        query = db.query(Problem).filter(Problem.status == "published")
        if user:
            solved_ids = db.query(UserProblemProgress.problem_id).filter(
                UserProblemProgress.user_id == user.id, UserProblemProgress.status == "solved"
            ).all()
            solved_set = {s[0] for s in solved_ids}
            unsolved = [p for p in query.all() if p.id not in solved_set]
            if unsolved:
                selected = random.choice(unsolved)
                stats = ProblemService.get_stats_for_problems(db, [selected.id])
                return ProblemListItem(
                    id=selected.id,
                    slug=selected.slug,
                    title=selected.title,
                    difficulty=selected.difficulty,
                    topic_tags=selected.topic_tags or [],
                    company_tags=selected.company_tags or [],
                    points=selected.points,
                    status=selected.status,
                    acceptance_rate=stats.get(selected.id, {}).get("acceptance_rate", 0.0),
                    total_submissions=stats.get(selected.id, {}).get("total_subs", 0)
                )

        all_problems = query.all()
        if not all_problems:
            return None
        selected = random.choice(all_problems)
        stats = ProblemService.get_stats_for_problems(db, [selected.id])
        return ProblemListItem(
            id=selected.id,
            slug=selected.slug,
            title=selected.title,
            difficulty=selected.difficulty,
            topic_tags=selected.topic_tags or [],
            company_tags=selected.company_tags or [],
            points=selected.points,
            status=selected.status,
            acceptance_rate=stats.get(selected.id, {}).get("acceptance_rate", 0.0),
            total_submissions=stats.get(selected.id, {}).get("total_subs", 0)
        )

    @staticmethod
    def set_reaction(db: Session, problem_id: str, user_id: str, reaction: str):
        existing = db.query(ProblemReaction).filter(
            ProblemReaction.problem_id == problem_id, ProblemReaction.user_id == user_id
        ).first()

        if existing:
            if existing.reaction == reaction:
                db.delete(existing)
            else:
                existing.reaction = reaction
        else:
            db.add(ProblemReaction(problem_id=problem_id, user_id=user_id, reaction=reaction))
        db.commit()

    @staticmethod
    def upsert_note(db: Session, problem_id: str, user_id: str, content_md: str):
        note = db.query(Note).filter(Note.problem_id == problem_id, Note.user_id == user_id).first()
        if note:
            note.content_md = content_md
            note.updated_at = datetime.now(timezone.utc)
        else:
            note = Note(problem_id=problem_id, user_id=user_id, content_md=content_md)
            db.add(note)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def toggle_favorite(db: Session, problem_id: str, user_id: str) -> bool:
        fav = db.query(Favorite).filter(Favorite.problem_id == problem_id, Favorite.user_id == user_id).first()
        if fav:
            db.delete(fav)
            db.commit()
            return False
        else:
            db.add(Favorite(problem_id=problem_id, user_id=user_id))
            db.commit()
            return True

    @staticmethod
    def get_user_favorites(db: Session, user_id: str) -> List[ProblemListItem]:
        favs = db.query(Favorite).filter(Favorite.user_id == user_id).order_by(desc(Favorite.created_at)).all()
        pids = [f.problem_id for f in favs]
        if not pids:
            return []
        
        problems = db.query(Problem).filter(Problem.id.in_(pids)).all()
        stats = ProblemService.get_stats_for_problems(db, pids)
        prob_map = {p.id: p for p in problems}

        return [
            ProblemListItem(
                id=prob_map[pid].id,
                slug=prob_map[pid].slug,
                title=prob_map[pid].title,
                difficulty=prob_map[pid].difficulty,
                topic_tags=prob_map[pid].topic_tags or [],
                company_tags=prob_map[pid].company_tags or [],
                points=prob_map[pid].points,
                status=prob_map[pid].status,
                acceptance_rate=stats.get(pid, {}).get("acceptance_rate", 0.0),
                total_submissions=stats.get(pid, {}).get("total_subs", 0),
                is_favorited=True
            )
            for pid in pids if pid in prob_map
        ]

    @staticmethod
    def record_view(db: Session, problem_id: str, user_id: Optional[str]):
        try:
            view = ProblemView(problem_id=problem_id, user_id=user_id)
            db.add(view)
            db.commit()
        except Exception:
            db.rollback()

    @staticmethod
    def get_recently_viewed(db: Session, user_id: str, limit: int = 20) -> List[ProblemListItem]:
        views = db.query(ProblemView.problem_id, func.max(ProblemView.viewed_at).label("last_viewed")).filter(
            ProblemView.user_id == user_id
        ).group_by(ProblemView.problem_id).order_by(desc("last_viewed")).limit(limit).all()

        pids = [v[0] for v in views]
        if not pids:
            return []

        problems = db.query(Problem).filter(Problem.id.in_(pids)).all()
        stats = ProblemService.get_stats_for_problems(db, pids)
        prob_map = {p.id: p for p in problems}

        return [
            ProblemListItem(
                id=prob_map[pid].id,
                slug=prob_map[pid].slug,
                title=prob_map[pid].title,
                difficulty=prob_map[pid].difficulty,
                topic_tags=prob_map[pid].topic_tags or [],
                company_tags=prob_map[pid].company_tags or [],
                points=prob_map[pid].points,
                status=prob_map[pid].status,
                acceptance_rate=stats.get(pid, {}).get("acceptance_rate", 0.0),
                total_submissions=stats.get(pid, {}).get("total_subs", 0)
            )
            for pid in pids if pid in prob_map
        ]
