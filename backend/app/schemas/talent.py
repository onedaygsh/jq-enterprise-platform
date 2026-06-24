from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RecruitmentCreate(BaseModel):
    position_name: str; department_id: int; position_id: Optional[int] = None
    headcount: int = 1; salary_range_min: Optional[float] = None; salary_range_max: Optional[float] = None
    requirements: Optional[str] = None; job_description: Optional[str] = None
    owner_id: int; priority: str = "medium"; target_date: Optional[datetime] = None

class RecruitmentOut(BaseModel):
    id: int; position_name: str; department_id: int; headcount: int; filled_count: int
    status: str; owner_id: int; priority: str; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class CandidateCreate(BaseModel):
    recruitment_id: int; name: str; phone: Optional[str] = None; email: Optional[str] = None
    resume_url: Optional[str] = None; source: Optional[str] = None; notes: Optional[str] = None

class CandidateOut(BaseModel):
    id: int; recruitment_id: int; name: str; phone: Optional[str] = None
    email: Optional[str] = None; stage: str; rating: Optional[int] = None
    model_config = {"from_attributes": True}

class PerformanceCreate(BaseModel):
    user_id: int; cycle: str; period_start: datetime; period_end: datetime
    reviewer_id: int; achievements: Optional[str] = None; improvements: Optional[str] = None

class PerformanceOut(BaseModel):
    id: int; user_id: int; cycle: str; period_start: datetime; period_end: datetime
    reviewer_id: int; self_score: Optional[float] = None; reviewer_score: Optional[float] = None
    final_score: Optional[float] = None; grade: Optional[str] = None; status: str
    model_config = {"from_attributes": True}

class TrainingCreate(BaseModel):
    title: str; category: str; description: Optional[str] = None; trainer: Optional[str] = None
    location: Optional[str] = None; start_date: datetime; end_date: datetime
    max_participants: Optional[int] = None; organizer_id: int

class TrainingOut(BaseModel):
    id: int; title: str; category: str; trainer: Optional[str] = None
    location: Optional[str] = None; start_date: datetime; end_date: datetime
    max_participants: Optional[int] = None; status: str; organizer_id: int
    model_config = {"from_attributes": True}

class CompensationCreate(BaseModel):
    user_id: int; base_salary: float; bonus: float = 0.0; allowance: float = 0.0
    insurance: float = 0.0; total: float = 0.0; effective_date: datetime
    end_date: Optional[datetime] = None; adjustment_reason: Optional[str] = None

class CompensationOut(BaseModel):
    id: int; user_id: int; base_salary: float; bonus: float; allowance: float
    insurance: float; total: float; effective_date: datetime; end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
