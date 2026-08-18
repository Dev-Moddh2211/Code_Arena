from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from app.models.user import User
from app.models.problem import Problem
from app.models.submission import Submission, UserProblemProgress
from app.models.achievement import Achievement, UserAchievement
from app.schemas.dashboard import (
    DashboardPayload,
    HeatmapDay,
    DifficultyStat,
    DifficultyBreakdown,
    TopicProgress,
    LanguageUsage,
    RecentActivityItem,
    WeeklyProgressDay,
    AchievementItem,
)

class DashboardService:
    @staticmethod
    def get_user_dashboard(db: Session, user: User) -> DashboardPayload:
        today = date.today()

        # 1. Fetch all accepted submissions for heatmap & streaks
        accepted_subs = db.query(
            Submission.problem_id,
            Submission.created_at
        ).filter(
            Submission.user_id == user.id,
            Submission.status == "accepted"
        ).order_by(Submission.created_at.asc()).all()

        # Group by date string (YYYY-MM-DD)
        daily_counts = defaultdict(int)
        for _, created_at in accepted_subs:
            d_str = created_at.strftime("%Y-%m-%d")
            daily_counts[d_str] += 1

        # Build 365-day heatmap ending today
        heatmap_days: List[HeatmapDay] = []
        for i in range(364, -1, -1):
            cur_date = today - timedelta(days=i)
            cur_date_str = cur_date.strftime("%Y-%m-%d")
            count = daily_counts.get(cur_date_str, 0)
            level = 0
            if count >= 7:
                level = 4
            elif count >= 5:
                level = 3
            elif count >= 3:
                level = 2
            elif count >= 1:
                level = 1

            heatmap_days.append(HeatmapDay(date=cur_date_str, count=count, level=level))

        # Calculate streaks
        sorted_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in daily_counts.keys()])
        date_set = set(sorted_dates)

        # Current streak
        current_streak = 0
        check_date = today
        if check_date not in date_set:
            check_date = today - timedelta(days=1)

        while check_date in date_set:
            current_streak += 1
            check_date -= timedelta(days=1)

        # Longest streak
        longest_streak = 0
        if sorted_dates:
            temp_streak = 1
            for i in range(1, len(sorted_dates)):
                if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
                    temp_streak += 1
                elif (sorted_dates[i] - sorted_dates[i - 1]).days > 1:
                    longest_streak = max(longest_streak, temp_streak)
                    temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)

        total_active_days = len(date_set)

        # 2. Difficulty Breakdown
        published_problems = db.query(Problem).filter(Problem.status == "published").all()
        total_by_diff = {"easy": 0, "medium": 0, "hard": 0}
        for p in published_problems:
            d = p.difficulty.lower()
            if d in total_by_diff:
                total_by_diff[d] += 1

        solved_progress = db.query(UserProblemProgress).filter(
            UserProblemProgress.user_id == user.id,
            UserProblemProgress.status == "solved"
        ).all()
        solved_problem_ids = {sp.problem_id for sp in solved_progress}

        solved_by_diff = {"easy": 0, "medium": 0, "hard": 0}
        for p in published_problems:
            if p.id in solved_problem_ids:
                d = p.difficulty.lower()
                if d in solved_by_diff:
                    solved_by_diff[d] += 1

        total_solved = len(solved_problem_ids)
        total_probs = len(published_problems)

        def make_diff_stat(diff: str) -> DifficultyStat:
            s = solved_by_diff.get(diff, 0)
            t = total_by_diff.get(diff, 0)
            pct = round((s / t) * 100, 1) if t > 0 else 0.0
            return DifficultyStat(solved=s, total=t, percentage=pct)

        difficulty_breakdown = DifficultyBreakdown(
            easy=make_diff_stat("easy"),
            medium=make_diff_stat("medium"),
            hard=make_diff_stat("hard"),
            total_solved=total_solved,
            total_problems=total_probs
        )

        # 3. Topic Progress
        topic_totals = defaultdict(int)
        topic_solved = defaultdict(int)
        for p in published_problems:
            for t in (p.topic_tags or []):
                topic_totals[t] += 1
                if p.id in solved_problem_ids:
                    topic_solved[t] += 1

        topic_progress: List[TopicProgress] = []
        for t, tot in sorted(topic_totals.items(), key=lambda x: x[1], reverse=True)[:10]:
            sol = topic_solved[t]
            pct = round((sol / tot) * 100, 1) if tot > 0 else 0.0
            topic_progress.append(TopicProgress(topic=t, solved=sol, total=tot, percentage=pct))

        # 4. Acceptance Rate & Language Usage
        all_user_subs = db.query(Submission).filter(Submission.user_id == user.id).all()
        total_subs = len(all_user_subs)
        accepted_subs_count = sum(1 for s in all_user_subs if s.status == "accepted")
        user_acc_rate = round((accepted_subs_count / total_subs) * 100, 1) if total_subs > 0 else 0.0

        lang_counts = defaultdict(int)
        for s in all_user_subs:
            lang_counts[s.language] += 1

        language_usage: List[LanguageUsage] = []
        for lang, count in sorted(lang_counts.items(), key=lambda x: x[1], reverse=True):
            pct = round((count / total_subs) * 100, 1) if total_subs > 0 else 0.0
            language_usage.append(LanguageUsage(language=lang, count=count, percentage=pct))

        # 5. Recent Activity Feed
        recent_subs = db.query(Submission).filter(
            Submission.user_id == user.id
        ).order_by(desc(Submission.created_at)).limit(10).all()

        recent_activity: List[RecentActivityItem] = []
        for s in recent_subs:
            p = s.problem
            recent_activity.append(
                RecentActivityItem(
                    id=s.id,
                    problem_id=s.problem_id,
                    problem_title=p.title if p else "Problem",
                    problem_slug=p.slug if p else "",
                    problem_difficulty=p.difficulty if p else "easy",
                    status=s.status,
                    language=s.language,
                    runtime_ms=s.runtime_ms,
                    created_at=s.created_at
                )
            )

        # 6. Weekly Progress (Past 7 days)
        weekly_progress: List[WeeklyProgressDay] = []
        for i in range(6, -1, -1):
            day_date = today - timedelta(days=i)
            day_str = day_date.strftime("%Y-%m-%d")
            day_name = day_date.strftime("%a")
            cnt = daily_counts.get(day_str, 0)
            weekly_progress.append(WeeklyProgressDay(day=day_name, date=day_str, count=cnt))

        # 7. Check and retrieve achievements
        achievements = DashboardService.evaluate_achievements(
            db, user, total_solved, current_streak, longest_streak, all_user_subs
        )

        # 8. Calculate total points and platform rank
        total_points = sum(p.points for p in published_problems if p.id in solved_problem_ids)

        # Platform Rank (excluding is_demo users)
        rank = None
        if not user.is_demo:
            user_scores = db.query(
                Submission.user_id,
                func.sum(Submission.score).label("total_score")
            ).join(User).filter(User.is_demo == False).group_by(Submission.user_id).order_by(desc("total_score")).all()

            for idx, (uid, sc) in enumerate(user_scores, 1):
                if uid == user.id:
                    rank = idx
                    break
            if rank is None:
                rank = len(user_scores) + 1
        else:
            rank = 14 # Friendly simulated rank for demo_student

        return DashboardPayload(
            heatmap=heatmap_days,
            current_streak=current_streak,
            longest_streak=longest_streak,
            total_active_days=total_active_days,
            difficulty_breakdown=difficulty_breakdown,
            topic_progress=topic_progress,
            acceptance_rate=user_acc_rate,
            total_submissions=total_subs,
            total_accepted_submissions=accepted_subs_count,
            language_usage=language_usage,
            recent_activity=recent_activity,
            weekly_progress=weekly_progress,
            achievements=achievements,
            total_points=total_points,
            rank=rank
        )

    @staticmethod
    def evaluate_achievements(
        db: Session,
        user: User,
        total_solved: int,
        current_streak: int,
        longest_streak: int,
        submissions: List[Submission]
    ) -> List[AchievementItem]:
        all_achievements = db.query(Achievement).all()
        user_earned = db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
        earned_map = {ua.achievement_id: ua.earned_at for ua in user_earned}

        now = datetime.now(timezone.utc)
        items: List[AchievementItem] = []

        for ach in all_achievements:
            is_earned = ach.id in earned_map
            earned_at = earned_map.get(ach.id)

            # Auto-check criteria if not already marked
            qualifies = False
            if ach.code == "first_solve" and total_solved >= 1:
                qualifies = True
            elif ach.code == "streak_7" and max(current_streak, longest_streak) >= 7:
                qualifies = True
            elif ach.code == "streak_30" and max(current_streak, longest_streak) >= 30:
                qualifies = True
            elif ach.code == "solve_10" and total_solved >= 10:
                qualifies = True
            elif ach.code == "solve_50" and total_solved >= 50:
                qualifies = True
            elif ach.code == "solve_100" and total_solved >= 100:
                qualifies = True
            elif ach.code == "speed_demon" and any(s.runtime_ms and s.runtime_ms < 50 for s in submissions if s.status == "accepted"):
                qualifies = True

            if qualifies and not is_earned:
                ua = UserAchievement(user_id=user.id, achievement_id=ach.id, earned_at=now)
                db.add(ua)
                db.commit()
                is_earned = True
                earned_at = now

            items.append(
                AchievementItem(
                    id=ach.id,
                    code=ach.code,
                    title=ach.title,
                    description=ach.description,
                    icon_key=ach.icon_key,
                    earned=is_earned,
                    earned_at=earned_at
                )
            )

        return items
