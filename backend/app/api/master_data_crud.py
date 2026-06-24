"""主数据中心 CRUD 接口。"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.master_data import Factory, Workshop, ProductionLine, Material, BOM, Equipment
from app.schemas.master_data import (
    FactoryCreate, FactoryOut,
    WorkshopCreate, WorkshopOut,
    ProductionLineCreate, ProductionLineOut,
    MaterialCreate, MaterialOut,
    BOMCreate, BOMOut,
    EquipmentCreate, EquipmentOut,
)

router = APIRouter()


def _code(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


@router.get("/factories", response_model=List[FactoryOut])
async def list_factories(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Factory).order_by(Factory.created_at.desc()))
    return result.scalars().all()


@router.post("/factories", response_model=FactoryOut)
async def create_factory(data: FactoryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    item = Factory(**data.model_dump())
    if not item.code:
        item.code = _code("F")
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/factories/{factory_id}", response_model=FactoryOut)
async def update_factory(factory_id: int, data: FactoryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Factory).where(Factory.id == factory_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Factory not found")
    for key, value in data.model_dump().items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/factories/{factory_id}")
async def delete_factory(factory_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Factory).where(Factory.id == factory_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Factory not found")
    await db.delete(item)
    await db.commit()
    return {"deleted": True}


@router.get("/workshops", response_model=List[WorkshopOut])
async def list_workshops(factory_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Workshop)
    if factory_id:
        q = q.where(Workshop.factory_id == factory_id)
    result = await db.execute(q.order_by(Workshop.created_at.desc()))
    return result.scalars().all()


@router.post("/workshops", response_model=WorkshopOut)
async def create_workshop(data: WorkshopCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    item = Workshop(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/workshops/{workshop_id}", response_model=WorkshopOut)
async def update_workshop(workshop_id: int, data: WorkshopCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Workshop).where(Workshop.id == workshop_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Workshop not found")
    for key, value in data.model_dump().items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/lines", response_model=List[ProductionLineOut])
async def list_lines(workshop_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(ProductionLine)
    if workshop_id:
        q = q.where(ProductionLine.workshop_id == workshop_id)
    result = await db.execute(q.order_by(ProductionLine.created_at.desc()))
    return result.scalars().all()


@router.post("/lines", response_model=ProductionLineOut)
async def create_line(data: ProductionLineCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    item = ProductionLine(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/materials", response_model=List[MaterialOut])
async def list_materials(category: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Material)
    if category:
        q = q.where(Material.category == category)
    result = await db.execute(q.order_by(Material.created_at.desc()))
    return result.scalars().all()


@router.post("/materials", response_model=MaterialOut)
async def create_material(data: MaterialCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    item = Material(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/boms", response_model=List[BOMOut])
async def list_boms(product_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(BOM)
    if product_id:
        q = q.where(BOM.product_id == product_id)
    result = await db.execute(q.order_by(BOM.created_at.desc()))
    return result.scalars().all()


@router.post("/boms", response_model=BOMOut)
async def create_bom(data: BOMCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    item = BOM(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/equipment", response_model=List[EquipmentOut])
async def list_equipment(line_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Equipment)
    if line_id:
        q = q.where(Equipment.line_id == line_id)
    result = await db.execute(q.order_by(Equipment.created_at.desc()))
    return result.scalars().all()


@router.post("/equipment", response_model=EquipmentOut)
async def create_equipment(data: EquipmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    item = Equipment(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item
