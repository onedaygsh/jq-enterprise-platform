"""Supply Chain API: Supplier, PurchaseOrder, Warehouse, Inventory."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.supply_chain import Supplier, PurchaseOrder, Warehouse, Inventory
from app.schemas.supply_chain import (
    SupplierCreate, SupplierOut, PurchaseOrderCreate, PurchaseOrderOut,
    WarehouseCreate, WarehouseOut, InventoryCreate, InventoryOut,
)
import uuid

router = APIRouter()

# ---- Suppliers ----
@router.get("/suppliers", response_model=List[SupplierOut])
async def list_suppliers(category: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Supplier).where(Supplier.is_active == True)
    if category: q = q.where(Supplier.category == category)
    result = await db.execute(q.order_by(Supplier.created_at.desc()))
    return result.scalars().all()

@router.post("/suppliers", response_model=SupplierOut)
async def create_supplier(data: SupplierCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    sup = Supplier(**data.model_dump())
    db.add(sup); await db.commit(); await db.refresh(sup)
    return sup

@router.get("/suppliers/{id}", response_model=SupplierOut)
async def get_supplier(id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Supplier).where(Supplier.id == id))
    s = result.scalar_one_or_none()
    if not s: raise HTTPException(404, "Supplier not found")
    return s

# ---- Purchase Orders ----
@router.get("/purchase-orders", response_model=List[PurchaseOrderOut])
async def list_pos(status: Optional[str] = Query(None), supplier_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(PurchaseOrder)
    if status: q = q.where(PurchaseOrder.status == status)
    if supplier_id: q = q.where(PurchaseOrder.supplier_id == supplier_id)
    result = await db.execute(q.order_by(PurchaseOrder.created_at.desc()))
    return result.scalars().all()

@router.post("/purchase-orders", response_model=PurchaseOrderOut)
async def create_po(data: PurchaseOrderCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    po = PurchaseOrder(**data.model_dump(), po_no=f"PO-{uuid.uuid4().hex[:10].upper()}")
    db.add(po); await db.commit(); await db.refresh(po)
    return po

# ---- Warehouses ----
@router.get("/warehouses", response_model=List[WarehouseOut])
async def list_warehouses(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Warehouse).where(Warehouse.is_active == True))
    return result.scalars().all()

@router.post("/warehouses", response_model=WarehouseOut)
async def create_warehouse(data: WarehouseCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    wh = Warehouse(**data.model_dump())
    db.add(wh); await db.commit(); await db.refresh(wh)
    return wh

# ---- Inventory ----
@router.get("/inventory", response_model=List[InventoryOut])
async def list_inventory(warehouse_id: Optional[int] = Query(None), product_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Inventory)
    if warehouse_id: q = q.where(Inventory.warehouse_id == warehouse_id)
    if product_id: q = q.where(Inventory.product_id == product_id)
    result = await db.execute(q)
    return result.scalars().all()

@router.post("/inventory", response_model=InventoryOut)
async def create_inventory(data: InventoryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    inv = Inventory(**data.model_dump())
    db.add(inv); await db.commit(); await db.refresh(inv)
    return inv
