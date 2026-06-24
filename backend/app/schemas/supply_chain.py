from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SupplierCreate(BaseModel):
    name: str; code: str; category: Optional[str] = None; contact_person: Optional[str] = None
    contact_phone: Optional[str] = None; contact_email: Optional[str] = None
    address: Optional[str] = None; rating: Optional[int] = None; payment_terms: Optional[str] = None
    owner_id: Optional[int] = None; notes: Optional[str] = None

class SupplierOut(BaseModel):
    id: int; name: str; code: str; category: Optional[str] = None; contact_person: Optional[str] = None
    rating: Optional[int] = None; is_active: bool; owner_id: Optional[int] = None
    model_config = {"from_attributes": True}

class PurchaseOrderCreate(BaseModel):
    supplier_id: int; product_id: Optional[int] = None; quantity: float; unit_price: float
    total_amount: float; requester_id: int; expected_delivery: Optional[datetime] = None; notes: Optional[str] = None

class PurchaseOrderOut(BaseModel):
    id: int; po_no: str; supplier_id: int; product_id: Optional[int] = None
    quantity: float; unit_price: float; total_amount: float; status: str
    requester_id: int; expected_delivery: Optional[datetime] = None; created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class WarehouseCreate(BaseModel):
    name: str; code: str; location: Optional[str] = None; manager_id: Optional[int] = None

class WarehouseOut(BaseModel):
    id: int; name: str; code: str; location: Optional[str] = None; manager_id: Optional[int] = None; is_active: bool
    model_config = {"from_attributes": True}

class InventoryCreate(BaseModel):
    product_id: int; warehouse_id: int; quantity: float = 0.0; safety_stock: float = 0.0
    max_stock: float = 0.0; unit: str = "pcs"

class InventoryOut(BaseModel):
    id: int; product_id: int; warehouse_id: int; quantity: float; safety_stock: float
    max_stock: float; unit: str; last_restock_date: Optional[datetime] = None
    model_config = {"from_attributes": True}
