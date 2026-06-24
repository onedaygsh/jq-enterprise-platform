"""Finance: Budget, Expense, Revenue, Invoice, FinancialReport models."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class BudgetType(str, enum.Enum):
    REVENUE = "revenue"
    EXPENSE = "expense"
    CAPITAL = "capital"
    CASH_FLOW = "cash_flow"


class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    type = Column(Enum(BudgetType), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    fiscal_month = Column(Integer, nullable=True)
    planned_amount = Column(Float, default=0.0)
    actual_amount = Column(Float, default=0.0)
    variance = Column(Float, default=0.0)
    status = Column(String(50), default="draft")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    department = relationship("Department", backref="budgets")
    owner = relationship("User", foreign_keys=[owner_id], backref="budgets")


class ExpenseCategory(str, enum.Enum):
    SALARY = "salary"
    RENT = "rent"
    MARKETING = "marketing"
    TRAVEL = "travel"
    OFFICE = "office"
    R_AND_D = "r_and_d"
    PROCUREMENT = "procurement"
    OTHER = "other"


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    category = Column(Enum(ExpenseCategory), nullable=False)
    amount = Column(Float, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=True)
    submitter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="pending")
    receipt_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    expense_date = Column(DateTime, nullable=False)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    department = relationship("Department", backref="expenses")
    budget = relationship("Budget", backref="expenses")
    submitter = relationship("User", foreign_keys=[submitter_id], backref="submitted_expenses")
    approver = relationship("User", foreign_keys=[approver_id], backref="approved_expenses")


class Revenue(Base):
    __tablename__ = "revenues"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String(200), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    recorded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    revenue_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("Order", backref="revenues")
    customer = relationship("Customer", backref="revenues")
    recorded_by = relationship("User", backref="recorded_revenues")


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String(100), unique=True, nullable=False)
    type = Column(String(50), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="issued")
    issued_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issued_at = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    customer = relationship("Customer", backref="invoices")
    order = relationship("Order", backref="invoices")
    issued_by = relationship("User", backref="issued_invoices")


class CostReduction(Base):
    __tablename__ = "cost_reductions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    category = Column(String(200), nullable=False)
    target_amount = Column(Float, nullable=False)
    achieved_amount = Column(Float, default=0.0)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="planning")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    department = relationship("Department", backref="cost_reductions")
    owner = relationship("User", backref="cost_reductions")
