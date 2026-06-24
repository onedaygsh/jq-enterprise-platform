"""User, Organization, Department, Position models."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    parent_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    parent = relationship("Organization", remote_side=[id], backref="children")
    departments = relationship("Department", back_populates="organization")


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization", back_populates="departments")
    parent = relationship("Department", remote_side=[id], backref="children")
    manager = relationship("User", foreign_keys=[manager_id], backref="managed_departments")
    users = relationship("User", back_populates="department", foreign_keys="User.department_id")


class Position(Base):
    __tablename__ = "positions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    grade = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    department = relationship("Department", backref="positions")
    users = relationship("User", back_populates="position")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    position_id = Column(Integer, ForeignKey("positions.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    position = relationship("Position", back_populates="users")
    organization = relationship("Organization", backref="users")
