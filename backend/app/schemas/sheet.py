from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.problem import ProblemListItem

class SheetSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    description: Optional[str] = None
    total_problems: int = 0
    solved_problems: int = 0
    progress_percentage: float = 0.0

class SheetDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    description: Optional[str] = None
    total_problems: int
    solved_problems: int
    progress_percentage: float
    problems: List[ProblemListItem] = []

class DailyChallengeResponse(BaseModel):
    date: str
    problem: ProblemListItem
    user_solved: bool = False
