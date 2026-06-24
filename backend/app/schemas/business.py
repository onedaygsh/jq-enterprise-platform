from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CustomerCreate(BaseModel):
    name: str; industry: Optional[str] = None; level: str = "lead"
    contact_person: Optional[str] = None; contact_phone: Optional[str] = None
    contact_email: Optional[str] = None; address: Optional[str] = None
    source: Optional[str] = None; owner_id: int; notes: Optional[str] = None

class CustomerOut(BaseModel):
    id: int; name: str; code: Optional[str] = None; industry: Optional[str] = None
    level: str; contact_person: Optional[str] = None; contact_phone: Optional[str] = None
    owner_id: int; is_active: bool; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class LeadCreate(BaseModel):
    name: str; company: Optional[str] = None; phone: Optional[str] = None
    email: Optional[str] = None; source: Optional[str] = None; owner_id: int; notes: Optional[str] = None

class LeadOut(BaseModel):
    id: int; name: str; company: Optional[str] = None; phone: Optional[str] = None
    email: Optional[str] = None; source: Optional[str] = None; status: str; owner_id: int
    model_config = {"from_attributes": True}

class OpportunityCreate(BaseModel):
    name: str; customer_id: int; amount: float = 0.0; stage: str = "initial"
    probability: float = 0.0; expected_close_date: Optional[datetime] = None
    owner_id: int; competitor_info: Optional[str] = None; notes: Optional[str] = None

class OpportunityOut(BaseModel):
    id: int; name: str; customer_id: int; amount: float; stage: str
    probability: float; owner_id: int; is_won: bool
    expected_close_date: Optional[datetime] = None; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class OrderCreate(BaseModel):
    customer_id: int; opportunity_id: Optional[int] = None; total_amount: float = 0.0
    discount_amount: float = 0.0; final_amount: float = 0.0; owner_id: int
    expected_delivery_date: Optional[datetime] = None; notes: Optional[str] = None

class OrderOut(BaseModel):
    id: int; order_no: str; customer_id: int; total_amount: float
    final_amount: float; status: str; owner_id: int; signed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
