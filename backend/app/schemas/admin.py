from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.problem import TestCaseSchema, HintSchema, LanguageConfigSchema

class ProblemCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = None
    description_md: str
    editorial_md: Optional[str] = None
    difficulty: str = Field("medium", description="'easy' | 'medium' | 'hard'")
    topic_tags: List[str] = []
    company_tags: List[str] = []
    constraints_md: Optional[str] = None
    points: int = 10
    time_limit_ms: int = 2000
    memory_limit_mb: int = 256
    status: str = "draft"  # 'draft' | 'published' | 'archived'

class ProblemUpdateRequest(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description_md: Optional[str] = None
    editorial_md: Optional[str] = None
    difficulty: Optional[str] = None
    topic_tags: Optional[List[str]] = None
    company_tags: Optional[List[str]] = None
    constraints_md: Optional[str] = None
    points: Optional[int] = None
    time_limit_ms: Optional[int] = None
    memory_limit_mb: Optional[int] = None
    status: Optional[str] = None

class AdminProblemItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    difficulty: str
    topic_tags: List[str] = []
    company_tags: List[str] = []
    status: str  # 'draft', 'published', 'archived'
    points: int
    test_cases_count: int = 0
    hints_count: int = 0
    language_configs_count: int = 0
    total_submissions: int = 0
    acceptance_rate: float = 0.0
    created_at: datetime
    updated_at: datetime

class AdminProblemDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    description_md: str
    editorial_md: Optional[str] = None
    difficulty: str
    topic_tags: List[str] = []
    company_tags: List[str] = []
    constraints_md: Optional[str] = None
    points: int
    time_limit_ms: int
    memory_limit_mb: int
    status: str
    created_at: datetime
    updated_at: datetime
    test_cases: List[TestCaseSchema] = []
    hints: List[HintSchema] = []
    language_configs: List[LanguageConfigSchema] = []

class TestCaseCreateRequest(BaseModel):
    input_json: str
    expected_output_json: str
    is_sample: bool = False
    order_matters: bool = True
    display_order: int = 0

class HintCreateRequest(BaseModel):
    content_md: str
    display_order: int = 0

class LanguageConfigCreateRequest(BaseModel):
    language: str
    starter_code: str
    wrapper_template: str

class EditorialUpdateRequest(BaseModel):
    editorial_md: str

class SheetCreateRequest(BaseModel):
    slug: Optional[str] = None
    name: str
    description: Optional[str] = None
    problem_ids: List[str] = []

class SheetUpdateRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    problem_ids: Optional[List[str]] = None

class DailyChallengeSetRequest(BaseModel):
    problem_id: str
    challenge_date: str  # YYYY-MM-DD

class AdminProblemStat(BaseModel):
    id: str
    slug: str
    title: str
    difficulty: str
    total_submissions: int
    acceptance_rate: float

class AdminAnalyticsPayload(BaseModel):
    total_users: int
    total_problems: int
    published_problems: int
    draft_problems: int
    archived_problems: int
    total_submissions: int
    total_accepted_submissions: int
    platform_acceptance_rate: float
    most_attempted_problems: List[AdminProblemStat]
    lowest_acceptance_problems: List[AdminProblemStat]
