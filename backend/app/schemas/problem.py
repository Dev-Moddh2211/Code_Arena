from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class TestCaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    input_json: str
    expected_output_json: str
    is_sample: bool = False
    order_matters: bool = True
    display_order: int = 0

class HintSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    content_md: str
    display_order: int = 0

class LanguageConfigSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    language: str
    starter_code: str
    wrapper_template: str

class ProblemListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    difficulty: str
    topic_tags: List[str] = []
    company_tags: List[str] = []
    points: int
    status: str
    acceptance_rate: float = 0.0
    total_submissions: int = 0
    likes_count: int = 0
    dislikes_count: int = 0
    user_status: Optional[str] = None
    is_favorited: bool = False

class ProblemDetail(BaseModel):
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
    sample_test_cases: List[TestCaseSchema] = []
    language_configs: List[LanguageConfigSchema] = []
    hints_count: int = 0
    acceptance_rate: float = 0.0
    total_submissions: int = 0
    total_accepted: int = 0
    likes_count: int = 0
    dislikes_count: int = 0
    user_reaction: Optional[str] = None
    user_status: Optional[str] = None
    is_favorited: bool = False
    user_note: Optional[str] = None
    avg_runtime_ms: Optional[float] = None
    avg_memory_kb: Optional[float] = None

class ReactionRequest(BaseModel):
    reaction: str = Field(..., description="'like' | 'dislike'")

class NoteUpsertRequest(BaseModel):
    content_md: str

class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    problem_id: str
    content_md: str
    updated_at: datetime

class PaginatedProblems(BaseModel):
    items: List[ProblemListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
