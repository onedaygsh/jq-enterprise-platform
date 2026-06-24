"""Product: IPD - ProductLine, Product, Requirement, Project, Task, Quality models."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class ProductPortfolio(str, enum.Enum):
    """Nine-Grid Portfolio: 引流款/利润款/形象款/活动款/防御款"""
    TRAFFIC = "traffic"
    PROFIT = "profit"
    IMAGE = "image"
    PROMOTION = "promotion"
    DEFENSE = "defense"


class ProductLine(Base):
    __tablename__ = "product_lines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    manager = relationship("User", backref="product_lines")
    products = relationship("Product", back_populates="product_line")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    product_line_id = Column(Integer, ForeignKey("product_lines.id"), nullable=True)
    portfolio = Column(Enum(ProductPortfolio), nullable=True)
    category = Column(String(200), nullable=True)
    unit_price = Column(Float, default=0.0)
    cost_price = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    spec = Column(Text, nullable=True)
    lifecycle_stage = Column(String(50), default="concept")
    is_active = Column(Boolean, default=True)
    launch_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product_line = relationship("ProductLine", back_populates="products")
    requirements = relationship("Requirement", back_populates="product")
    projects = relationship("Project", back_populates="product")


class Requirement(Base):
    __tablename__ = "requirements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    source = Column(String(100), nullable=True)
    priority = Column(String(20), default="medium")
    status = Column(String(50), default="draft")
    submitter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="requirements")
    submitter = relationship("User", foreign_keys=[submitter_id], backref="submitted_requirements")
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="reviewed_requirements")


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    type = Column(String(50), default="development")
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="planning")
    priority = Column(String(20), default="medium")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    budget = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    progress = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="projects")
    manager = relationship("User", backref="managed_projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="todo")
    priority = Column(String(20), default="medium")
    estimated_hours = Column(Float, default=0.0)
    actual_hours = Column(Float, default=0.0)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", backref="tasks")


class QualityCheck(Base):
    __tablename__ = "quality_checks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    check_type = Column(String(100), nullable=False)
    check_point = Column(String(500), nullable=False)
    result = Column(String(50), default="pending")
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    checked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    project = relationship("Project", backref="quality_checks")
    inspector = relationship("User", backref="quality_checks")
