"""Business API: CRM, Sales Pipeline, Orders."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.business import Customer, Lead, Opportunity, Order
from app.schemas.business import (
    CustomerCreate, CustomerOut, LeadCreate, LeadOut,
    OpportunityCreate, OpportunityOut, OrderCreate, OrderOut,
)
import uuid

router = APIRouter()

# ---- Customers ----
@router.get("/customers", response_model=List[CustomerOut])
async def list_customers(level: Optional[str] = Query(None), owner_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Customer)
    if level: q = q.where(Customer.level == level)
    if owner_id: q = q.where(Customer.owner_id == owner_id)
    result = await db.execute(q.order_by(Customer.created_at.desc()))
    return result.scalars().all()

@router.post("/customers", response_model=CustomerOut)
async def create_customer(data: CustomerCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    cust = Customer(**data.model_dump(), code=f"CUST-{uuid.uuid4().hex[:8].upper()}")
    db.add(cust); await db.commit(); await db.refresh(cust)
    return cust

@router.get("/customers/{id}", response_model=CustomerOut)
async def get_customer(id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Customer).where(Customer.id == id))
    c = result.scalar_one_or_none()
    if not c: raise HTTPException(404, "Customer not found")
    return c

# ---- Leads ----
@router.get("/leads", response_model=List[LeadOut])
async def list_leads(status: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Lead)
    if status: q = q.where(Lead.status == status)
    result = await db.execute(q.order_by(Lead.created_at.desc()))
    return result.scalars().all()

@router.post("/leads", response_model=LeadOut)
async def create_lead(data: LeadCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    lead = Lead(**data.model_dump())
    db.add(lead); await db.commit(); await db.refresh(lead)
    return lead

# ---- Opportunities ----
@router.get("/opportunities", response_model=List[OpportunityOut])
async def list_opportunities(stage: Optional[str] = Query(None), customer_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Opportunity)
    if stage: q = q.where(Opportunity.stage == stage)
    if customer_id: q = q.where(Opportunity.customer_id == customer_id)
    result = await db.execute(q.order_by(Opportunity.created_at.desc()))
    return result.scalars().all()

@router.post("/opportunities", response_model=OpportunityOut)
async def create_opportunity(data: OpportunityCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    opp = Opportunity(**data.model_dump())
    db.add(opp); await db.commit(); await db.refresh(opp)
    return opp

# ---- Orders ----
@router.get("/orders", response_model=List[OrderOut])
async def list_orders(status: Optional[str] = Query(None), customer_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Order)
    if status: q = q.where(Order.status == status)
    if customer_id: q = q.where(Order.customer_id == customer_id)
    result = await db.execute(q.order_by(Order.created_at.desc()))
    return result.scalars().all()

@router.post("/orders", response_model=OrderOut)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    order = Order(**data.model_dump(), order_no=f"ORD-{uuid.uuid4().hex[:10].upper()}")
    db.add(order); await db.commit(); await db.refresh(order)
    return order
