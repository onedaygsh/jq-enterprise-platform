"""Strategy: OKR, KPI, Execution Tracking models."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class ObjectiveType(str, enum.Enum):
    STRATEGIC = "strategic"
    TACTICAL = "tactical"
    OPERATIONAL = "operational"


class Objective(Base):
    __tablename__ = "objectives"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(ObjectiveType), default=ObjectiveType.STRATEGIC)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("objectives.id"), nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    progress = Column(Float, default=0.0)
    status = Column(String(50), default="active")
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", backref="objectives")
    parent = relationship("Objective", remote_side=[id], backref="children")
    key_results = relationship("KeyResult", back_populates="objective", cascade="all, delete-orphan")


class KeyResult(Base):
    __tablename__ = "key_results"
    id = Column(Integer, primary_key=True, index=True)
    objective_id = Column(Integer, ForeignKey("objectives.id"), nullable=False)
    title = Column(String(500), nullable=False)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    unit = Column(String(50), nullable=True)
    weight = Column(Float, default=1.0)
    status = Column(String(50), default="on_track")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    objective = relationship("Objective", back_populates="key_results")


class ExecutionTask(Base):
    __tablename__ = "execution_tasks"
    id = Column(Integer, primary_key=True, index=True)
    key_result_id = Column(Integer, ForeignKey("key_results.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    priority = Column(String(20), default="medium")
    status = Column(String(50), default="todo")
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    key_result = relationship("KeyResult", backref="execution_tasks")
    assignee = relationship("User", backref="execution_tasks")
