from datetime import datetime, date
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class HeatmapDay(BaseModel):
    date: str  # YYYY-MM-DD
    count: int
    level: int  # 0 to 4 intensity

class DifficultyStat(BaseModel):
    solved: int
    total: int
    percentage: float

class DifficultyBreakdown(BaseModel):
    easy: DifficultyStat
    medium: DifficultyStat
    hard: DifficultyStat
    total_solved: int
    total_problems: int

class TopicProgress(BaseModel):
    topic: str
    solved: int
    total: int
    percentage: float

class LanguageUsage(BaseModel):
    language: str
    count: int
    percentage: float

class RecentActivityItem(BaseModel):
    id: str
    problem_id: str
    problem_title: str
    problem_slug: str
    problem_difficulty: str
    status: str
    language: str
    runtime_ms: Optional[int] = None
    created_at: datetime

class WeeklyProgressDay(BaseModel):
    day: str  # Mon, Tue, etc.
    date: str # YYYY-MM-DD
    count: int

class AchievementItem(BaseModel):
    id: str
    code: str
    title: str
    description: str
    icon_key: str
    earned: bool
    earned_at: Optional[datetime] = None

class DashboardPayload(BaseModel):
    heatmap: List[HeatmapDay]
    current_streak: int
    longest_streak: int
    total_active_days: int
    difficulty_breakdown: DifficultyBreakdown
    topic_progress: List[TopicProgress]
    acceptance_rate: float
    total_submissions: int
    total_accepted_submissions: int
    language_usage: List[LanguageUsage]
    recent_activity: List[RecentActivityItem]
    weekly_progress: List[WeeklyProgressDay]
    achievements: List[AchievementItem]
    total_points: int
    rank: Optional[int] = None
