from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WorkOrderCreate(BaseModel):
    order_id: int
    product_id: Optional[int] = None
    line_id: Optional[int] = None
    planned_quantity: float = 0.0
    priority: str = "medium"
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    notes: Optional[str] = None


class WorkOrderOut(BaseModel):
    id: int
    work_order_no: str
    order_id: int
    product_id: Optional[int] = None
    line_id: Optional[int] = None
    planned_quantity: float
    completed_quantity: float
    status: str
    priority: str
    model_config = {"from_attributes": True}


class ProductionReportCreate(BaseModel):
    work_order_id: int
    line_id: Optional[int] = None
    equipment_id: Optional[int] = None
    reported_quantity: float = 0.0
    scrap_quantity: float = 0.0
    shift: Optional[str] = None
    operator_id: int
    report_time: Optional[datetime] = None
    notes: Optional[str] = None


class ProductionReportOut(BaseModel):
    id: int
    work_order_id: int
    line_id: Optional[int] = None
    equipment_id: Optional[int] = None
    report_no: str
    reported_quantity: float
    scrap_quantity: float
    operator_id: int
    model_config = {"from_attributes": True}


class EquipmentTelemetryCreate(BaseModel):
    equipment_id: int
    status: str
    cycle_time: Optional[float] = None
    output_count: float = 0.0
    defect_count: float = 0.0
    snapshot_at: datetime


class EquipmentTelemetryOut(BaseModel):
    id: int
    equipment_id: int
    status: str
    cycle_time: Optional[float] = None
    output_count: float
    defect_count: float
    snapshot_at: datetime
    model_config = {"from_attributes": True}


class AlarmCreate(BaseModel):
    equipment_id: Optional[int] = None
    line_id: Optional[int] = None
    alarm_type: str
    title: str
    content: Optional[str] = None
    status: str = "open"
    severity: str = "medium"
    occurred_at: datetime
    handler_id: Optional[int] = None


class AlarmOut(BaseModel):
    id: int
    equipment_id: Optional[int] = None
    line_id: Optional[int] = None
    alarm_type: str
    title: str
    status: str
    severity: str
    occurred_at: datetime
    handler_id: Optional[int] = None
    model_config = {"from_attributes": True}
