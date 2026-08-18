from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

class RunCodeRequest(BaseModel):
    problem_id: str
    language: str
    code: str
    custom_input_json: Optional[str] = None

class SubmitCodeRequest(BaseModel):
    problem_id: str
    language: str
    code: str

class TestCaseResult(BaseModel):
    test_case_id: Optional[str] = None
    is_sample: bool = True
    input_json: Optional[str] = None
    expected_output_json: Optional[str] = None
    actual_output_json: Optional[str] = None
    passed: bool = False
    runtime_ms: Optional[int] = None
    memory_kb: Optional[int] = None
    error_message: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    exit_code: Optional[int] = None

class ExecutionResult(BaseModel):
    status: str  # 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compile_error', 'output_limit_exceeded'
    runtime_ms: Optional[int] = None
    memory_kb: Optional[int] = None
    total_test_cases: int = 0
    passed_test_cases: int = 0
    score: int = 0
    error_message: Optional[str] = None
    stderr: Optional[str] = None
    stdout: Optional[str] = None
    exit_code: Optional[int] = None
    language: Optional[str] = None
    compiler: Optional[str] = None
    test_results: List[TestCaseResult] = []

class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    problem_id: str
    problem_title: Optional[str] = None
    problem_slug: Optional[str] = None
    problem_difficulty: Optional[str] = None
    language: str
    code: str
    code_size_bytes: int
    attempt_number: int
    status: str
    runtime_ms: Optional[int] = None
    memory_kb: Optional[int] = None
    score: int
    error_message: Optional[str] = None
    test_results: List[TestCaseResult] = []
    created_at: datetime

class SubmissionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    problem_id: str
    problem_title: str
    problem_slug: str
    problem_difficulty: str
    language: str
    status: str
    runtime_ms: Optional[int] = None
    memory_kb: Optional[int] = None
    code_size_bytes: int
    attempt_number: int
    created_at: datetime

class SubmissionAnalytics(BaseModel):
    submissions: List[SubmissionListItem]
    total_submissions: int
    accepted_count: int
    acceptance_rate: float
    runtime_history: List[Dict[str, Any]]
    memory_history: List[Dict[str, Any]]
