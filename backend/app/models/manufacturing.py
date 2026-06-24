"""Manufacturing models for work orders, operations, reports, equipment telemetry, and alerts."""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class WorkOrder(Base):
    __tablename__ = "work_orders"
    id = Column(Integer, primary_key=True, index=True)
    work_order_no = Column(String(100), unique=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    line_id = Column(Integer, ForeignKey("production_lines.id"), nullable=True)
    planned_quantity = Column(Float, default=0.0)
    completed_quantity = Column(Float, default=0.0)
    status = Column(String(50), default="planned")
    priority = Column(String(20), default="medium")
    planned_start = Column(DateTime, nullable=True)
    planned_end = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    order = relationship("Order", backref="work_orders")
    product = relationship("Product", backref="work_orders")
    line = relationship("ProductionLine", backref="work_orders")
    reports = relationship("ProductionReport", back_populates="work_order", cascade="all, delete-orphan")


class ProductionReport(Base):
    __tablename__ = "production_reports"
    id = Column(Integer, primary_key=True, index=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id"), nullable=False)
    line_id = Column(Integer, ForeignKey("production_lines.id"), nullable=True)
    equipment_id = Column(Integer, ForeignKey("equipments.id"), nullable=True)
    report_no = Column(String(100), unique=True, nullable=False)
    reported_quantity = Column(Float, default=0.0)
    scrap_quantity = Column(Float, default=0.0)
    shift = Column(String(50), nullable=True)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_time = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    work_order = relationship("WorkOrder", back_populates="reports")
    line = relationship("ProductionLine", backref="reports")
    equipment = relationship("Equipment", backref="reports")
    operator = relationship("User", backref="production_reports")


class EquipmentTelemetry(Base):
    __tablename__ = "equipment_telemetry"
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipments.id"), nullable=False)
    status = Column(String(50), nullable=False)
    cycle_time = Column(Float, nullable=True)
    output_count = Column(Float, default=0.0)
    defect_count = Column(Float, default=0.0)
    snapshot_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    equipment = relationship("Equipment", backref="telemetry")


class Alarm(Base):
    __tablename__ = "alarms"
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipments.id"), nullable=True)
    line_id = Column(Integer, ForeignKey("production_lines.id"), nullable=True)
    alarm_type = Column(String(100), nullable=False)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=True)
    status = Column(String(50), default="open")
    severity = Column(String(20), default="medium")
    occurred_at = Column(DateTime, nullable=False)
    handled_at = Column(DateTime, nullable=True)
    handler_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    equipment = relationship("Equipment", backref="alarms")
    line = relationship("ProductionLine", backref="alarms")
    handler = relationship("User", backref="handled_alarms")
