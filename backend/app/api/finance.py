"""Finance API: Budget, Expense, Revenue, Invoice, CostReduction."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.finance import Budget, Expense, Revenue, Invoice, CostReduction
from app.schemas.finance import (
    BudgetCreate, BudgetOut, ExpenseCreate, ExpenseOut,
    RevenueCreate, RevenueOut, InvoiceCreate, InvoiceOut,
    CostReductionCreate, CostReductionOut,
)

router = APIRouter()

# ---- Budgets ----
@router.get("/budgets", response_model=List[BudgetOut])
async def list_budgets(fiscal_year: Optional[int] = Query(None), type: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Budget)
    if fiscal_year: q = q.where(Budget.fiscal_year == fiscal_year)
    if type: q = q.where(Budget.type == type)
    result = await db.execute(q.order_by(Budget.created_at.desc()))
    return result.scalars().all()

@router.post("/budgets", response_model=BudgetOut)
async def create_budget(data: BudgetCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    b = Budget(**data.model_dump())
    db.add(b); await db.commit(); await db.refresh(b)
    return b

@router.get("/budgets/{id}", response_model=BudgetOut)
async def get_budget(id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Budget).where(Budget.id == id))
    b = result.scalar_one_or_none()
    if not b: raise HTTPException(404, "Budget not found")
    return b

# ---- Expenses ----
@router.get("/expenses", response_model=List[ExpenseOut])
async def list_expenses(category: Optional[str] = Query(None), status: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Expense)
    if category: q = q.where(Expense.category == category)
    if status: q = q.where(Expense.status == status)
    result = await db.execute(q.order_by(Expense.created_at.desc()))
    return result.scalars().all()

@router.post("/expenses", response_model=ExpenseOut)
async def create_expense(data: ExpenseCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    exp = Expense(**data.model_dump())
    db.add(exp); await db.commit(); await db.refresh(exp)
    return exp

# ---- Revenues ----
@router.get("/revenues", response_model=List[RevenueOut])
async def list_revenues(organization_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Revenue)
    if organization_id: q = q.where(Revenue.organization_id == organization_id)
    result = await db.execute(q.order_by(Revenue.revenue_date.desc()))
    return result.scalars().all()

@router.post("/revenues", response_model=RevenueOut)
async def create_revenue(data: RevenueCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    rev = Revenue(**data.model_dump())
    db.add(rev); await db.commit(); await db.refresh(rev)
    return rev

# ---- Invoices ----
@router.get("/invoices", response_model=List[InvoiceOut])
async def list_invoices(status: Optional[str] = Query(None), customer_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(Invoice)
    if status: q = q.where(Invoice.status == status)
    if customer_id: q = q.where(Invoice.customer_id == customer_id)
    result = await db.execute(q.order_by(Invoice.created_at.desc()))
    return result.scalars().all()

@router.post("/invoices", response_model=InvoiceOut)
async def create_invoice(data: InvoiceCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    inv = Invoice(**data.model_dump())
    db.add(inv); await db.commit(); await db.refresh(inv)
    return inv

# ---- Cost Reductions ----
@router.get("/cost-reductions", response_model=List[CostReductionOut])
async def list_cost_reductions(status: Optional[str] = Query(None), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    q = select(CostReduction)
    if status: q = q.where(CostReduction.status == status)
    result = await db.execute(q.order_by(CostReduction.created_at.desc()))
    return result.scalars().all()

@router.post("/cost-reductions", response_model=CostReductionOut)
async def create_cost_reduction(data: CostReductionCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    cr = CostReduction(**data.model_dump())
    db.add(cr); await db.commit(); await db.refresh(cr)
    return cr
