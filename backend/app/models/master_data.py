"""Master data models for organizations, factories, workshops, lines, materials, BOMs, and equipment."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Factory(Base):
    __tablename__ = "factories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    location = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Workshop(Base):
    __tablename__ = "workshops"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    factory_id = Column(Integer, ForeignKey("factories.id"), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    factory = relationship("Factory", backref="workshops")


class ProductionLine(Base):
    __tablename__ = "production_lines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=False)
    takt_time = Column(String(50), nullable=True)
    status = Column(String(50), default="idle")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    workshop = relationship("Workshop", backref="production_lines")


class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    category = Column(String(100), nullable=True)
    unit = Column(String(50), nullable=False, default="pcs")
    specification = Column(String(300), nullable=True)
    safe_stock = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class BOM(Base):
    __tablename__ = "boms"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    version = Column(String(50), default="V1.0")
    quantity = Column(Float, default=1.0)
    loss_rate = Column(Float, default=0.0)
    status = Column(String(50), default="draft")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", backref="boms")
    material = relationship("Material", backref="boms")


class Equipment(Base):
    __tablename__ = "equipments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    factory_id = Column(Integer, ForeignKey("factories.id"), nullable=True)
    workshop_id = Column(Integer, ForeignKey("workshops.id"), nullable=True)
    line_id = Column(Integer, ForeignKey("production_lines.id"), nullable=True)
    category = Column(String(100), nullable=True)
    model = Column(String(200), nullable=True)
    status = Column(String(50), default="running")
    oee = Column(Float, default=0.0)
    last_maintenance_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    factory = relationship("Factory", backref="equipments")
    workshop = relationship("Workshop", backref="equipments")
    line = relationship("ProductionLine", backref="equipments")
