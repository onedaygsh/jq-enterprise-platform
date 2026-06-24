"""Manufacturing execution API: order -> work order -> report -> telemetry -> alarms."""
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.business import Order
from app.models.manufacturing import WorkOrder, ProductionReport, EquipmentTelemetry, Alarm
from app.schemas.manufacturing import (
    WorkOrderCreate, WorkOrderOut,
    ProductionReportCreate, ProductionReportOut,
    EquipmentTelemetryCreate, EquipmentTelemetryOut,
    AlarmCreate, AlarmOut,
)

router = APIRouter()


@router.get("/work-orders", response_model=List[WorkOrderOut])
async def list_work_orders(order_id: Optional[int] = Query(None), status: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(WorkOrder)
    if order_id:
        q = q.where(WorkOrder.order_id == order_id)
    if status:
        q = q.where(WorkOrder.status == status)
    result = await db.execute(q.order_by(WorkOrder.created_at.desc()))
    return result.scalars().all()


@router.post("/work-orders", response_model=WorkOrderOut)
async def create_work_order(data: WorkOrderCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    order_result = await db.execute(select(Order).where(Order.id == data.order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")
    item = WorkOrder(**data.model_dump(), work_order_no=f"WO-{uuid.uuid4().hex[:10].upper()}")
    db.add(item)
    if order.status in {"pending", "draft"}:
        order.status = "in_production"
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/work-orders/from-order/{order_id}", response_model=WorkOrderOut)
async def create_work_order_from_order(order_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")
    item = WorkOrder(
        work_order_no=f"WO-{uuid.uuid4().hex[:10].upper()}",
        order_id=order.id,
        product_id=None,
        line_id=None,
        planned_quantity=order.final_amount or order.total_amount or 0,
        completed_quantity=0,
        status="planned",
        priority="medium",
    )
    db.add(item)
    if order.status in {"pending", "draft"}:
        order.status = "in_production"
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/work-orders/{work_order_id}/release", response_model=WorkOrderOut)
async def release_work_order(work_order_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == work_order_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Work order not found")
    item.status = "released"
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/production-reports", response_model=ProductionReportOut)
async def create_production_report(data: ProductionReportCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == data.work_order_id))
    work_order = result.scalar_one_or_none()
    if not work_order:
        raise HTTPException(404, "Work order not found")
    item = ProductionReport(**data.model_dump(), report_no=f"PR-{uuid.uuid4().hex[:10].upper()}")
    db.add(item)
    work_order.completed_quantity = (work_order.completed_quantity or 0) + data.reported_quantity
    if work_order.completed_quantity >= work_order.planned_quantity:
        work_order.status = "completed"
        order_result = await db.execute(select(Order).where(Order.id == work_order.order_id))
        order = order_result.scalar_one_or_none()
        if order:
            order.status = "completed"
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/production-reports/from-order/{order_id}", response_model=ProductionReportOut)
async def create_report_from_order(order_id: int, reported_quantity: float, operator_id: int, scrap_quantity: float = 0.0, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    work_result = await db.execute(select(WorkOrder).where(WorkOrder.order_id == order_id).order_by(WorkOrder.created_at.desc()))
    work_order = work_result.scalar_one_or_none()
    if not work_order:
        work_order = await create_work_order_from_order(order_id, db, _)
    return await create_production_report(
        ProductionReportCreate(
            work_order_id=work_order.id,
            reported_quantity=reported_quantity,
            scrap_quantity=scrap_quantity,
            operator_id=operator_id,
        ),
        db,
        _,
    )


@router.get("/production-reports", response_model=List[ProductionReportOut])
async def list_production_reports(work_order_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(ProductionReport)
    if work_order_id:
        q = q.where(ProductionReport.work_order_id == work_order_id)
    result = await db.execute(q.order_by(ProductionReport.created_at.desc()))
    return result.scalars().all()


@router.post("/telemetry", response_model=EquipmentTelemetryOut)
async def create_telemetry(data: EquipmentTelemetryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    item = EquipmentTelemetry(**data.model_dump())
    db.add(item)
    if data.status.lower() in {"stop", "fault", "alarm", "down"}:
        db.add(Alarm(
            equipment_id=data.equipment_id,
            alarm_type="equipment_status",
            title=f"设备状态异常：{data.equipment_id}",
            content=f"采集状态为 {data.status}",
            status="open",
            severity="high",
            occurred_at=data.snapshot_at,
        ))
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/telemetry", response_model=List[EquipmentTelemetryOut])
async def list_telemetry(equipment_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(EquipmentTelemetry)
    if equipment_id:
        q = q.where(EquipmentTelemetry.equipment_id == equipment_id)
    result = await db.execute(q.order_by(EquipmentTelemetry.snapshot_at.desc()))
    return result.scalars().all()


@router.get("/alarms", response_model=List[AlarmOut])
async def list_alarms(status: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Alarm)
    if status:
        q = q.where(Alarm.status == status)
    result = await db.execute(q.order_by(Alarm.occurred_at.desc()))
    return result.scalars().all()


@router.post("/alarms", response_model=AlarmOut)
async def create_alarm(data: AlarmCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    item = Alarm(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/oee")
async def get_oee(equipment_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(EquipmentTelemetry)
    if equipment_id:
        q = q.where(EquipmentTelemetry.equipment_id == equipment_id)
    result = await db.execute(q.order_by(EquipmentTelemetry.snapshot_at.desc()).limit(200))
    rows = result.scalars().all()
    total_output = sum((r.output_count or 0) for r in rows)
    total_defect = sum((r.defect_count or 0) for r in rows)
    running_rows = [r for r in rows if str(r.status).lower() == "running"]
    operating_rate = round((len(running_rows) / len(rows)) * 100, 2) if rows else 0.0
    performance = round((total_output / max(len(rows), 1)) * 10, 2) if rows else 0.0
    quality = round(((total_output - total_defect) / total_output) * 100, 2) if total_output else 0.0
    oee = round((operating_rate * performance * quality) / 10000, 2) if rows else 0.0
    return {
        "equipment_id": equipment_id,
        "snapshot_count": len(rows),
        "availability": operating_rate,
        "performance": performance,
        "quality": quality,
        "oee": oee,
        "output": total_output,
        "defect": total_defect,
        "updated_at": datetime.utcnow().isoformat(),
    }
