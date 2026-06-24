"""Product API: IPD - ProductLine, Product, Requirement, Project, Task, Quality."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import ProductLine, Product, Requirement, Project, Task, QualityCheck
from app.schemas.product import (
    ProductLineCreate, ProductLineOut, ProductCreate, ProductOut,
    RequirementCreate, RequirementOut, ProjectCreate, ProjectOut,
    TaskCreate, TaskOut, QualityCheckCreate, QualityCheckOut,
)

router = APIRouter()

# ---- Product Lines ----
@router.get("/lines", response_model=List[ProductLineOut])
async def list_lines(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(ProductLine).where(ProductLine.is_active == True))
    return result.scalars().all()

@router.post("/lines", response_model=ProductLineOut)
async def create_line(data: ProductLineCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    pl = ProductLine(**data.model_dump())
    db.add(pl); await db.commit(); await db.refresh(pl)
    return pl

# ---- Products ----
@router.get("/products", response_model=List[ProductOut])
async def list_products(
    product_line_id: Optional[int] = Query(None), portfolio: Optional[str] = Query(None),
    lifecycle_stage: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    q = select(Product).where(Product.is_active == True)
    if product_line_id: q = q.where(Product.product_line_id == product_line_id)
    if portfolio: q = q.where(Product.portfolio == portfolio)
    if lifecycle_stage: q = q.where(Product.lifecycle_stage == lifecycle_stage)
    result = await db.execute(q.order_by(Product.created_at.desc()))
    return result.scalars().all()

@router.post("/products", response_model=ProductOut)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    prod = Product(**data.model_dump())
    db.add(prod); await db.commit(); await db.refresh(prod)
    return prod

@router.get("/products/{id}", response_model=ProductOut)
async def get_product(id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Product).where(Product.id == id))
    p = result.scalar_one_or_none()
    if not p: raise HTTPException(404, "Product not found")
    return p

# ---- Requirements ----
@router.get("/requirements", response_model=List[RequirementOut])
async def list_requirements(product_id: Optional[int] = Query(None), status: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Requirement)
    if product_id: q = q.where(Requirement.product_id == product_id)
    if status: q = q.where(Requirement.status == status)
    result = await db.execute(q.order_by(Requirement.created_at.desc()))
    return result.scalars().all()

@router.post("/requirements", response_model=RequirementOut)
async def create_requirement(data: RequirementCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    req = Requirement(**data.model_dump())
    db.add(req); await db.commit(); await db.refresh(req)
    return req

# ---- Projects ----
@router.get("/projects", response_model=List[ProjectOut])
async def list_projects(status: Optional[str] = Query(None), manager_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Project)
    if status: q = q.where(Project.status == status)
    if manager_id: q = q.where(Project.manager_id == manager_id)
    result = await db.execute(q.order_by(Project.created_at.desc()))
    return result.scalars().all()

@router.post("/projects", response_model=ProjectOut)
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    proj = Project(**data.model_dump())
    db.add(proj); await db.commit(); await db.refresh(proj)
    return proj

@router.get("/projects/{id}", response_model=ProjectOut)
async def get_project(id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Project).where(Project.id == id))
    p = result.scalar_one_or_none()
    if not p: raise HTTPException(404, "Project not found")
    return p

# ---- Tasks ----
@router.get("/tasks", response_model=List[TaskOut])
async def list_tasks(project_id: Optional[int] = Query(None), assignee_id: Optional[int] = Query(None), status: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Task)
    if project_id: q = q.where(Task.project_id == project_id)
    if assignee_id: q = q.where(Task.assignee_id == assignee_id)
    if status: q = q.where(Task.status == status)
    result = await db.execute(q.order_by(Task.created_at.desc()))
    return result.scalars().all()

@router.post("/tasks", response_model=TaskOut)
async def create_task(data: TaskCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    task = Task(**data.model_dump())
    db.add(task); await db.commit(); await db.refresh(task)
    return task

# ---- Quality Checks ----
@router.get("/quality-checks", response_model=List[QualityCheckOut])
async def list_quality_checks(project_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(QualityCheck)
    if project_id: q = q.where(QualityCheck.project_id == project_id)
    result = await db.execute(q.order_by(QualityCheck.created_at.desc()))
    return result.scalars().all()

@router.post("/quality-checks", response_model=QualityCheckOut)
async def create_quality_check(data: QualityCheckCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    qc = QualityCheck(**data.model_dump())
    db.add(qc); await db.commit(); await db.refresh(qc)
    return qc
