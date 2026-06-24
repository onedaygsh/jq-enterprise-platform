"""Talent API: Recruitment, Performance, Training, Compensation."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.talent import Recruitment, Candidate, Performance, Training, TrainingEnrollment, Compensation
from app.schemas.talent import (
    RecruitmentCreate, RecruitmentOut, CandidateCreate, CandidateOut,
    PerformanceCreate, PerformanceOut, TrainingCreate, TrainingOut,
    CompensationCreate, CompensationOut,
)

router = APIRouter()

# ---- Recruitment ----
@router.get("/recruitments", response_model=List[RecruitmentOut])
async def list_recruitments(status: Optional[str] = Query(None), department_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Recruitment)
    if status: q = q.where(Recruitment.status == status)
    if department_id: q = q.where(Recruitment.department_id == department_id)
    result = await db.execute(q.order_by(Recruitment.created_at.desc()))
    return result.scalars().all()

@router.post("/recruitments", response_model=RecruitmentOut)
async def create_recruitment(data: RecruitmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    rec = Recruitment(**data.model_dump())
    db.add(rec); await db.commit(); await db.refresh(rec)
    return rec

@router.get("/recruitments/{id}", response_model=RecruitmentOut)
async def get_recruitment(id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Recruitment).where(Recruitment.id == id))
    r = result.scalar_one_or_none()
    if not r: raise HTTPException(404, "Recruitment not found")
    return r

# ---- Candidates ----
@router.get("/candidates", response_model=List[CandidateOut])
async def list_candidates(recruitment_id: Optional[int] = Query(None), stage: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Candidate)
    if recruitment_id: q = q.where(Candidate.recruitment_id == recruitment_id)
    if stage: q = q.where(Candidate.stage == stage)
    result = await db.execute(q.order_by(Candidate.created_at.desc()))
    return result.scalars().all()

@router.post("/candidates", response_model=CandidateOut)
async def create_candidate(data: CandidateCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    cand = Candidate(**data.model_dump())
    db.add(cand); await db.commit(); await db.refresh(cand)
    return cand

# ---- Performance ----
@router.get("/performances", response_model=List[PerformanceOut])
async def list_performances(user_id: Optional[int] = Query(None), cycle: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Performance)
    if user_id: q = q.where(Performance.user_id == user_id)
    if cycle: q = q.where(Performance.cycle == cycle)
    result = await db.execute(q.order_by(Performance.created_at.desc()))
    return result.scalars().all()

@router.post("/performances", response_model=PerformanceOut)
async def create_performance(data: PerformanceCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    perf = Performance(**data.model_dump())
    db.add(perf); await db.commit(); await db.refresh(perf)
    return perf

# ---- Training ----
@router.get("/trainings", response_model=List[TrainingOut])
async def list_trainings(category: Optional[str] = Query(None), status: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Training)
    if category: q = q.where(Training.category == category)
    if status: q = q.where(Training.status == status)
    result = await db.execute(q.order_by(Training.start_date.desc()))
    return result.scalars().all()

@router.post("/trainings", response_model=TrainingOut)
async def create_training(data: TrainingCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    tr = Training(**data.model_dump())
    db.add(tr); await db.commit(); await db.refresh(tr)
    return tr

@router.get("/trainings/{id}", response_model=TrainingOut)
async def get_training(id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Training).where(Training.id == id))
    t = result.scalar_one_or_none()
    if not t: raise HTTPException(404, "Training not found")
    return t

# ---- Compensation ----
@router.get("/compensations", response_model=List[CompensationOut])
async def list_compensations(user_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Compensation)
    if user_id: q = q.where(Compensation.user_id == user_id)
    result = await db.execute(q.order_by(Compensation.effective_date.desc()))
    return result.scalars().all()

@router.post("/compensations", response_model=CompensationOut)
async def create_compensation(data: CompensationCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    comp = Compensation(**data.model_dump())
    db.add(comp); await db.commit(); await db.refresh(comp)
    return comp
