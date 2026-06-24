from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetCreate(BaseModel):
    name: str; type: str; department_id: Optional[int] = None; organization_id: int
    fiscal_year: int; fiscal_month: Optional[int] = None; planned_amount: float = 0.0
    owner_id: int; notes: Optional[str] = None

class BudgetOut(BaseModel):
    id: int; name: str; type: str; department_id: Optional[int] = None
    organization_id: int; fiscal_year: int; planned_amount: float; actual_amount: float
    variance: float; status: str; owner_id: int; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class ExpenseCreate(BaseModel):
    title: str; category: str; amount: float; department_id: Optional[int] = None
    organization_id: int; budget_id: Optional[int] = None; submitter_id: int
    notes: Optional[str] = None; expense_date: datetime

class ExpenseOut(BaseModel):
    id: int; title: str; category: str; amount: float; department_id: Optional[int] = None
    budget_id: Optional[int] = None; submitter_id: int; status: str
    expense_date: datetime; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class RevenueCreate(BaseModel):
    title: str; amount: float; source: Optional[str] = None; organization_id: int
    order_id: Optional[int] = None; customer_id: Optional[int] = None
    recorded_by_id: int; revenue_date: datetime; notes: Optional[str] = None

class RevenueOut(BaseModel):
    id: int; title: str; amount: float; source: Optional[str] = None
    order_id: Optional[int] = None; customer_id: Optional[int] = None
    recorded_by_id: int; revenue_date: datetime; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class InvoiceCreate(BaseModel):
    invoice_no: str; type: str; customer_id: Optional[int] = None; order_id: Optional[int] = None
    amount: float; tax_amount: float = 0.0; total_amount: float; issued_by_id: int
    issued_at: datetime; due_date: Optional[datetime] = None; notes: Optional[str] = None

class InvoiceOut(BaseModel):
    id: int; invoice_no: str; type: str; customer_id: Optional[int] = None
    order_id: Optional[int] = None; amount: float; tax_amount: float; total_amount: float
    status: str; issued_by_id: int; issued_at: datetime; due_date: Optional[datetime] = None
    model_config = {"from_attributes": True}

class CostReductionCreate(BaseModel):
    title: str; category: str; target_amount: float; department_id: Optional[int] = None
    organization_id: int; owner_id: int; start_date: datetime; end_date: datetime
    notes: Optional[str] = None

class CostReductionOut(BaseModel):
    id: int; title: str; category: str; target_amount: float; achieved_amount: float
    department_id: Optional[int] = None; owner_id: int; status: str
    start_date: datetime; end_date: datetime; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
