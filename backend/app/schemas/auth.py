from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    is_active: bool
    is_superuser: bool
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class OrganizationOut(BaseModel):
    id: int; name: str; code: str; parent_id: Optional[int] = None; is_active: bool
    model_config = {"from_attributes": True}

class DepartmentOut(BaseModel):
    id: int; name: str; code: str; organization_id: int; parent_id: Optional[int] = None; manager_id: Optional[int] = None; is_active: bool
    model_config = {"from_attributes": True}

class PositionOut(BaseModel):
    id: int; name: str; code: str; department_id: int; grade: Optional[str] = None
    model_config = {"from_attributes": True}
