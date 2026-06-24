"""Strategy API: OKR, Execution Tracking."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.strategy import Objective, KeyResult, ExecutionTask
from app.schemas.strategy import (
    ObjectiveCreate, ObjectiveOut, KeyResultCreate, KeyResultOut,
    ExecutionTaskCreate, ExecutionTaskOut,
)

router = APIRouter()

# ---- Objectives ----
@router.get("/objectives", response_model=List[ObjectiveOut])
async def list_objectives(
    organization_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = select(Objective)
    if organization_id: q = q.where(Objective.organization_id == organization_id)
    if status: q = q.where(Objective.status == status)
    result = await db.execute(q.order_by(Objective.created_at.desc()))
    return result.scalars().all()

@router.post("/objectives", response_model=ObjectiveOut)
async def create_objective(data: ObjectiveCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    obj = Objective(**data.model_dump())
    db.add(obj); await db.commit(); await db.refresh(obj)
    return obj

@router.get("/objectives/{id}", response_model=ObjectiveOut)
async def get_objective(id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Objective).where(Objective.id == id))
    obj = result.scalar_one_or_none()
    if not obj: raise HTTPException(404, "Objective not found")
    return obj

# ---- Key Results ----
@router.get("/key-results", response_model=List[KeyResultOut])
async def list_key_results(objective_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(KeyResult)
    if objective_id: q = q.where(KeyResult.objective_id == objective_id)
    result = await db.execute(q)
    return result.scalars().all()

@router.post("/key-results", response_model=KeyResultOut)
async def create_key_result(data: KeyResultCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    kr = KeyResult(**data.model_dump())
    db.add(kr); await db.commit(); await db.refresh(kr)
    return kr

# ---- Execution Tasks ----
@router.get("/tasks", response_model=List[ExecutionTaskOut])
async def list_tasks(
    key_result_id: Optional[int] = Query(None),
    assignee_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    q = select(ExecutionTask)
    if key_result_id: q = q.where(ExecutionTask.key_result_id == key_result_id)
    if assignee_id: q = q.where(ExecutionTask.assignee_id == assignee_id)
    if status: q = q.where(ExecutionTask.status == status)
    result = await db.execute(q.order_by(ExecutionTask.created_at.desc()))
    return result.scalars().all()

@router.post("/tasks", response_model=ExecutionTaskOut)
async def create_task(data: ExecutionTaskCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    task = ExecutionTask(**data.model_dump())
    db.add(task); await db.commit(); await db.refresh(task)
    return task
