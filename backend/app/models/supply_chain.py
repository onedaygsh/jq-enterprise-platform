"""Supply Chain: Supplier, PurchaseOrder, Inventory, Warehouse models."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    category = Column(String(200), nullable=True)
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    contact_email = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    payment_terms = Column(String(300), nullable=True)
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", backref="suppliers")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    po_no = Column(String(100), unique=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="draft")
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    expected_delivery = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    supplier = relationship("Supplier", back_populates="purchase_orders")
    product = relationship("Product", backref="purchase_orders")
    requester = relationship("User", foreign_keys=[requester_id], backref="requested_pos")
    approver = relationship("User", foreign_keys=[approver_id], backref="approved_pos")


class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    location = Column(Text, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    manager = relationship("User", backref="warehouses")
    inventories = relationship("Inventory", back_populates="warehouse")


class Inventory(Base):
    __tablename__ = "inventories"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Float, default=0.0)
    safety_stock = Column(Float, default=0.0)
    max_stock = Column(Float, default=0.0)
    unit = Column(String(50), default="pcs")
    last_restock_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", backref="inventories")
    warehouse = relationship("Warehouse", back_populates="inventories")


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventories.id"), nullable=False)
    type = Column(String(50), nullable=False)
    quantity_change = Column(Float, nullable=False)
    reference_type = Column(String(100), nullable=True)
    reference_id = Column(Integer, nullable=True)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    inventory = relationship("Inventory", backref="transactions")
    operator = relationship("User", backref="inventory_transactions")
