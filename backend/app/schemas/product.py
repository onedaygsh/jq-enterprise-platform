from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductLineCreate(BaseModel):
    name: str; code: str; description: Optional[str] = None; manager_id: Optional[int] = None

class ProductLineOut(BaseModel):
    id: int; name: str; code: str; description: Optional[str] = None
    manager_id: Optional[int] = None; is_active: bool
    model_config = {"from_attributes": True}

class ProductCreate(BaseModel):
    name: str; code: str; product_line_id: Optional[int] = None; portfolio: Optional[str] = None
    category: Optional[str] = None; unit_price: float = 0.0; cost_price: float = 0.0
    description: Optional[str] = None; spec: Optional[str] = None; lifecycle_stage: str = "concept"

class ProductOut(BaseModel):
    id: int; name: str; code: str; product_line_id: Optional[int] = None
    portfolio: Optional[str] = None; unit_price: float; cost_price: float
    lifecycle_stage: str; is_active: bool; launch_date: Optional[datetime] = None
    model_config = {"from_attributes": True}

class RequirementCreate(BaseModel):
    title: str; description: Optional[str] = None; product_id: Optional[int] = None
    source: Optional[str] = None; priority: str = "medium"; submitter_id: int

class RequirementOut(BaseModel):
    id: int; title: str; product_id: Optional[int] = None; priority: str
    status: str; submitter_id: int; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class ProjectCreate(BaseModel):
    name: str; code: str; product_id: Optional[int] = None; type: str = "development"
    manager_id: int; start_date: datetime; end_date: datetime; budget: float = 0.0
    priority: str = "medium"; description: Optional[str] = None

class ProjectOut(BaseModel):
    id: int; name: str; code: str; product_id: Optional[int] = None; type: str
    manager_id: int; status: str; start_date: datetime; end_date: datetime
    budget: float; actual_cost: float; progress: float
    model_config = {"from_attributes": True}

class TaskCreate(BaseModel):
    project_id: int; title: str; description: Optional[str] = None
    assignee_id: int; priority: str = "medium"; estimated_hours: float = 0.0; due_date: Optional[datetime] = None

class TaskOut(BaseModel):
    id: int; project_id: int; title: str; assignee_id: int
    status: str; priority: str; estimated_hours: float; actual_hours: float
    due_date: Optional[datetime] = None; completed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class QualityCheckCreate(BaseModel):
    project_id: int; product_id: Optional[int] = None; check_type: str
    check_point: str; inspector_id: int; notes: Optional[str] = None

class QualityCheckOut(BaseModel):
    id: int; project_id: int; check_type: str; check_point: str
    result: str; inspector_id: int; notes: Optional[str] = None; checked_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
