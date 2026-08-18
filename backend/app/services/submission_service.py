import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException, status
from app.models.submission import Submission, UserProblemProgress
from app.models.problem import Problem, ProblemLanguageConfig, TestCase
from app.models.user import User
from app.judge.docker_runner import runner
from app.judge.scoring import calculate_submission_score
from app.schemas.submission import (
    RunCodeRequest,
    SubmitCodeRequest,
    ExecutionResult,
    SubmissionResponse,
    SubmissionListItem,
    SubmissionAnalytics,
    TestCaseResult,
)

class SubmissionService:
    @staticmethod
    def run_code(db: Session, req: RunCodeRequest, user: User) -> ExecutionResult:
        problem = db.query(Problem).filter(Problem.id == req.problem_id).first()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        # Fetch custom language wrapper if configured
        cfg = db.query(ProblemLanguageConfig).filter(
            ProblemLanguageConfig.problem_id == problem.id,
            ProblemLanguageConfig.language == req.language.lower()
        ).first()
        wrapper_template = cfg.wrapper_template if cfg else None

        # Build test cases list
        test_cases_to_run = []
        if req.custom_input_json:
            test_cases_to_run.append({
                "id": "custom",
                "input_json": req.custom_input_json,
                "expected_output_json": "",
                "is_sample": True,
                "order_matters": True
            })
        else:
            sample_tcs = [tc for tc in problem.test_cases if tc.is_sample]
            if not sample_tcs:
                # If no sample test cases marked, pick the first test case
                sample_tcs = problem.test_cases[:1]
            
            for tc in sample_tcs:
                test_cases_to_run.append({
                    "id": tc.id,
                    "input_json": tc.input_json,
                    "expected_output_json": tc.expected_output_json,
                    "is_sample": True,
                    "order_matters": tc.order_matters
                })

        raw_result = runner.execute_test_cases(
            language=req.language,
            user_code=req.code,
            wrapper_template=wrapper_template,
            test_cases=test_cases_to_run,
            time_limit_ms=problem.time_limit_ms,
            memory_limit_mb=problem.memory_limit_mb,
            is_run_only=True
        )

        test_results = [TestCaseResult(**tr) for tr in raw_result.get("test_results", [])]
        return ExecutionResult(
            status=raw_result.get("status", "accepted"),
            runtime_ms=raw_result.get("runtime_ms"),
            memory_kb=raw_result.get("memory_kb"),
            total_test_cases=raw_result.get("total_test_cases", 0),
            passed_test_cases=raw_result.get("passed_test_cases", 0),
            score=raw_result.get("score", 0),
            error_message=raw_result.get("error_message"),
            stderr=raw_result.get("stderr"),
            stdout=raw_result.get("stdout"),
            exit_code=raw_result.get("exit_code"),
            language=raw_result.get("language", req.language),
            compiler=raw_result.get("compiler"),
            test_results=test_results
        )

    @staticmethod
    def submit_code(db: Session, req: SubmitCodeRequest, user: User) -> SubmissionResponse:
        problem = db.query(Problem).filter(Problem.id == req.problem_id).first()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        cfg = db.query(ProblemLanguageConfig).filter(
            ProblemLanguageConfig.problem_id == problem.id,
            ProblemLanguageConfig.language == req.language.lower()
        ).first()
        wrapper_template = cfg.wrapper_template if cfg else None

        # Gather all test cases
        all_tcs = problem.test_cases
        if not all_tcs:
            raise HTTPException(status_code=400, detail="Problem has no test cases configured")

        test_cases_to_run = [
            {
                "id": tc.id,
                "input_json": tc.input_json,
                "expected_output_json": tc.expected_output_json,
                "is_sample": tc.is_sample,
                "order_matters": tc.order_matters
            }
            for tc in all_tcs
        ]

        raw_result = runner.execute_test_cases(
            language=req.language,
            user_code=req.code,
            wrapper_template=wrapper_template,
            test_cases=test_cases_to_run,
            time_limit_ms=problem.time_limit_ms,
            memory_limit_mb=problem.memory_limit_mb,
            is_run_only=False
        )

        verdict = raw_result.get("status", "wrong_answer")
        runtime_ms = raw_result.get("runtime_ms", 0)
        memory_kb = raw_result.get("memory_kb", 0)
        passed_count = raw_result.get("passed_test_cases", 0)
        total_count = len(test_cases_to_run)
        
        # Calculate points
        score = calculate_submission_score(
            difficulty=problem.difficulty,
            passed_count=passed_count,
            total_count=total_count,
            base_points=problem.points
        ) if verdict == "accepted" else 0

        # Calculate attempt number
        prior_attempts = db.query(func.count(Submission.id)).filter(
            Submission.user_id == user.id, Submission.problem_id == problem.id
        ).scalar() or 0
        attempt_num = prior_attempts + 1
        code_size_bytes = len(req.code.encode("utf-8"))

        # Save submission
        test_results_raw = raw_result.get("test_results", [])
        submission = Submission(
            user_id=user.id,
            problem_id=problem.id,
            language=req.language,
            code=req.code,
            code_size_bytes=code_size_bytes,
            attempt_number=attempt_num,
            status=verdict,
            runtime_ms=runtime_ms,
            memory_kb=memory_kb,
            score=score,
            test_results_json=json.dumps(test_results_raw)
        )
        db.add(submission)

        # Upsert user progress
        progress = db.query(UserProblemProgress).filter(
            UserProblemProgress.user_id == user.id, UserProblemProgress.problem_id == problem.id
        ).first()

        now = datetime.now(timezone.utc)
        if not progress:
            progress = UserProblemProgress(
                user_id=user.id,
                problem_id=problem.id,
                status="solved" if verdict == "accepted" else "attempted",
                attempts_count=1,
                solved_at=now if verdict == "accepted" else None
            )
            db.add(progress)
        else:
            progress.attempts_count += 1
            if verdict == "accepted":
                progress.status = "solved"
                if not progress.solved_at:
                    progress.solved_at = now
            elif progress.status != "solved":
                progress.status = "attempted"

        try:
            db.commit()
            db.refresh(submission)
        except Exception:
            db.rollback()
            raise

        # Parse test results for client
        test_results = [TestCaseResult(**tr) for tr in test_results_raw]

        return SubmissionResponse(
            id=submission.id,
            problem_id=problem.id,
            problem_title=problem.title,
            problem_slug=problem.slug,
            problem_difficulty=problem.difficulty,
            language=submission.language,
            code=submission.code,
            code_size_bytes=submission.code_size_bytes,
            attempt_number=submission.attempt_number,
            status=submission.status,
            runtime_ms=submission.runtime_ms,
            memory_kb=submission.memory_kb,
            score=submission.score,
            error_message=raw_result.get("error_message"),
            test_results=test_results,
            created_at=submission.created_at
        )

    @staticmethod
    def get_submission_by_id(db: Session, submission_id: str, user: User) -> SubmissionResponse:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")
        if sub.user_id != user.id and user.role != "admin":
            raise HTTPException(status_code=403, detail="Access denied")

        problem = sub.problem
        results_list = []
        try:
            results_list = json.loads(sub.test_results_json or "[]")
        except Exception:
            pass

        return SubmissionResponse(
            id=sub.id,
            problem_id=sub.problem_id,
            problem_title=problem.title if problem else None,
            problem_slug=problem.slug if problem else None,
            problem_difficulty=problem.difficulty if problem else None,
            language=sub.language,
            code=sub.code,
            code_size_bytes=sub.code_size_bytes,
            attempt_number=sub.attempt_number,
            status=sub.status,
            runtime_ms=sub.runtime_ms,
            memory_kb=sub.memory_kb,
            score=sub.score,
            test_results=[TestCaseResult(**r) for r in results_list],
            created_at=sub.created_at
        )

    @staticmethod
    def list_user_submissions(
        db: Session,
        user_id: str,
        problem_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        language: Optional[str] = None,
        limit: int = 50
    ) -> List[SubmissionListItem]:
        query = db.query(Submission).filter(Submission.user_id == user_id)
        if problem_id:
            query = query.filter(Submission.problem_id == problem_id)
        if status_filter:
            query = query.filter(Submission.status == status_filter.lower())
        if language:
            query = query.filter(Submission.language == language.lower())

        submissions = query.order_by(desc(Submission.created_at)).limit(limit).all()

        return [
            SubmissionListItem(
                id=s.id,
                problem_id=s.problem_id,
                problem_title=s.problem.title if s.problem else "Unknown",
                problem_slug=s.problem.slug if s.problem else "",
                problem_difficulty=s.problem.difficulty if s.problem else "easy",
                language=s.language,
                status=s.status,
                runtime_ms=s.runtime_ms,
                memory_kb=s.memory_kb,
                code_size_bytes=s.code_size_bytes,
                attempt_number=s.attempt_number,
                created_at=s.created_at
            )
            for s in submissions
        ]

    @staticmethod
    def get_submission_analytics(db: Session, user_id: str, problem_id: Optional[str] = None) -> SubmissionAnalytics:
        query = db.query(Submission).filter(Submission.user_id == user_id)
        if problem_id:
            query = query.filter(Submission.problem_id == problem_id)

        all_subs = query.order_by(Submission.created_at.asc()).all()
        total = len(all_subs)
        accepted = sum(1 for s in all_subs if s.status == "accepted")
        acc_rate = round((accepted / total) * 100, 1) if total > 0 else 0.0

        runtime_hist = [
            {"attempt": s.attempt_number, "runtime_ms": s.runtime_ms, "status": s.status, "date": s.created_at.strftime("%b %d, %H:%M")}
            for s in all_subs if s.runtime_ms is not None
        ]
        memory_hist = [
            {"attempt": s.attempt_number, "memory_kb": s.memory_kb, "status": s.status, "date": s.created_at.strftime("%b %d, %H:%M")}
            for s in all_subs if s.memory_kb is not None
        ]

        items = [
            SubmissionListItem(
                id=s.id,
                problem_id=s.problem_id,
                problem_title=s.problem.title if s.problem else "",
                problem_slug=s.problem.slug if s.problem else "",
                problem_difficulty=s.problem.difficulty if s.problem else "easy",
                language=s.language,
                status=s.status,
                runtime_ms=s.runtime_ms,
                memory_kb=s.memory_kb,
                code_size_bytes=s.code_size_bytes,
                attempt_number=s.attempt_number,
                created_at=s.created_at
            )
            for s in reversed(all_subs)
        ]

        return SubmissionAnalytics(
            submissions=items,
            total_submissions=total,
            accepted_count=accepted,
            acceptance_rate=acc_rate,
            runtime_history=runtime_hist,
            memory_history=memory_hist
        )
