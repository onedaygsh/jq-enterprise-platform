"""Business: Customer, Lead, Opportunity, Order, Contract models."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class CustomerLevel(str, enum.Enum):
    VIP = "vip"
    GOLD = "gold"
    SILVER = "silver"
    BRONZE = "bronze"
    LEAD = "lead"


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    code = Column(String(100), unique=True, nullable=True)
    industry = Column(String(200), nullable=True)
    level = Column(Enum(CustomerLevel), default=CustomerLevel.LEAD)
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    contact_email = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    source = Column(String(100), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", backref="customers")
    opportunities = relationship("Opportunity", back_populates="customer", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer")


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    company = Column(String(300), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(200), nullable=True)
    source = Column(String(100), nullable=True)
    status = Column(String(50), default="new")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    converted_to_customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", backref="leads")


class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, default=0.0)
    stage = Column(String(50), default="initial")
    probability = Column(Float, default=0.0)
    expected_close_date = Column(DateTime, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    competitor_info = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_won = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    customer = relationship("Customer", back_populates="opportunities")
    owner = relationship("User", backref="opportunities")


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(100), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True)
    total_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    final_amount = Column(Float, default=0.0)
    status = Column(String(50), default="pending")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contract_file_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    signed_at = Column(DateTime, nullable=True)
    expected_delivery_date = Column(DateTime, nullable=True)
    actual_delivery_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    customer = relationship("Customer", back_populates="orders")
    opportunity = relationship("Opportunity", backref="orders")
    owner = relationship("User", backref="orders")
