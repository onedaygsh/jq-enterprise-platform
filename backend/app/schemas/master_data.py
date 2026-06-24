from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FactoryCreate(BaseModel):
    name: str
    code: str
    organization_id: Optional[int] = None
    location: Optional[str] = None
    description: Optional[str] = None


class FactoryOut(BaseModel):
    id: int
    name: str
    code: str
    organization_id: Optional[int] = None
    location: Optional[str] = None
    is_active: bool
    model_config = {"from_attributes": True}


class WorkshopCreate(BaseModel):
    name: str
    code: str
    factory_id: int
    description: Optional[str] = None


class WorkshopOut(BaseModel):
    id: int
    name: str
    code: str
    factory_id: int
    is_active: bool
    model_config = {"from_attributes": True}


class ProductionLineCreate(BaseModel):
    name: str
    code: str
    workshop_id: int
    takt_time: Optional[str] = None
    status: str = "idle"
    description: Optional[str] = None


class ProductionLineOut(BaseModel):
    id: int
    name: str
    code: str
    workshop_id: int
    takt_time: Optional[str] = None
    status: str
    is_active: bool
    model_config = {"from_attributes": True}


class MaterialCreate(BaseModel):
    name: str
    code: str
    category: Optional[str] = None
    unit: str = "pcs"
    specification: Optional[str] = None
    safe_stock: float = 0.0


class MaterialOut(BaseModel):
    id: int
    name: str
    code: str
    category: Optional[str] = None
    unit: str
    specification: Optional[str] = None
    safe_stock: float
    is_active: bool
    model_config = {"from_attributes": True}


class BOMCreate(BaseModel):
    product_id: Optional[int] = None
    material_id: Optional[int] = None
    version: str = "V1.0"
    quantity: float = 1.0
    loss_rate: float = 0.0
    status: str = "draft"
    description: Optional[str] = None


class BOMOut(BaseModel):
    id: int
    product_id: Optional[int] = None
    material_id: Optional[int] = None
    version: str
    quantity: float
    loss_rate: float
    status: str
    model_config = {"from_attributes": True}


class EquipmentCreate(BaseModel):
    name: str
    code: str
    factory_id: Optional[int] = None
    workshop_id: Optional[int] = None
    line_id: Optional[int] = None
    category: Optional[str] = None
    model: Optional[str] = None
    status: str = "running"
    oee: float = 0.0


class EquipmentOut(BaseModel):
    id: int
    name: str
    code: str
    factory_id: Optional[int] = None
    workshop_id: Optional[int] = None
    line_id: Optional[int] = None
    status: str
    oee: float
    is_active: bool
    model_config = {"from_attributes": True}
