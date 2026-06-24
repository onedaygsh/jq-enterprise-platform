from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ObjectiveCreate(BaseModel):
    title: str; description: Optional[str] = None; type: str = "strategic"
    organization_id: int; owner_id: int; parent_id: Optional[int] = None
    start_date: datetime; end_date: datetime; weight: float = 1.0

class ObjectiveOut(BaseModel):
    id: int; title: str; type: str; organization_id: int; owner_id: int
    progress: float; status: str; start_date: datetime; end_date: datetime
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class KeyResultCreate(BaseModel):
    objective_id: int; title: str; target_value: float; current_value: float = 0.0
    unit: Optional[str] = None; weight: float = 1.0
    start_date: datetime; end_date: datetime

class KeyResultOut(BaseModel):
    id: int; objective_id: int; title: str; target_value: float; current_value: float
    unit: Optional[str] = None; weight: float; status: str
    model_config = {"from_attributes": True}

class ExecutionTaskCreate(BaseModel):
    key_result_id: int; title: str; description: Optional[str] = None
    assignee_id: int; priority: str = "medium"; due_date: Optional[datetime] = None

class ExecutionTaskOut(BaseModel):
    id: int; key_result_id: int; title: str; assignee_id: int
    priority: str; status: str; due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
