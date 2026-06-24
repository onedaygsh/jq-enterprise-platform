"""Talent: Recruitment, Performance, Training, Compensation models."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class RecruitmentStatus(str, enum.Enum):
    OPEN = "open"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    ONBOARDED = "onboarded"
    CLOSED = "closed"


class Recruitment(Base):
    __tablename__ = "recruitments"
    id = Column(Integer, primary_key=True, index=True)
    position_name = Column(String(300), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    position_id = Column(Integer, ForeignKey("positions.id"), nullable=True)
    headcount = Column(Integer, default=1)
    filled_count = Column(Integer, default=0)
    status = Column(Enum(RecruitmentStatus), default=RecruitmentStatus.OPEN)
    salary_range_min = Column(Float, nullable=True)
    salary_range_max = Column(Float, nullable=True)
    requirements = Column(Text, nullable=True)
    job_description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    priority = Column(String(20), default="medium")
    target_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    department = relationship("Department", backref="recruitments")
    position = relationship("Position", backref="recruitments")
    owner = relationship("User", backref="recruitments")
    candidates = relationship("Candidate", back_populates="recruitment", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    recruitment_id = Column(Integer, ForeignKey("recruitments.id"), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(200), nullable=True)
    resume_url = Column(String(500), nullable=True)
    source = Column(String(100), nullable=True)
    stage = Column(String(50), default="new")
    rating = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    recruitment = relationship("Recruitment", back_populates="candidates")


class PerformanceCycle(str, enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMI_ANNUAL = "semi_annual"
    ANNUAL = "annual"


class Performance(Base):
    __tablename__ = "performances"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cycle = Column(Enum(PerformanceCycle), nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    self_score = Column(Float, nullable=True)
    reviewer_score = Column(Float, nullable=True)
    final_score = Column(Float, nullable=True)
    grade = Column(String(10), nullable=True)
    achievements = Column(Text, nullable=True)
    improvements = Column(Text, nullable=True)
    comments = Column(Text, nullable=True)
    status = Column(String(50), default="draft")
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="performances")
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="reviewed_performances")


class Training(Base):
    __tablename__ = "trainings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    category = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    trainer = Column(String(200), nullable=True)
    location = Column(String(300), nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    max_participants = Column(Integer, nullable=True)
    status = Column(String(50), default="planned")
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    organizer = relationship("User", backref="organized_trainings")
    enrollments = relationship("TrainingEnrollment", back_populates="training", cascade="all, delete-orphan")


class TrainingEnrollment(Base):
    __tablename__ = "training_enrollments"
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey("trainings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="enrolled")
    attended = Column(Boolean, default=False)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    enrolled_at = Column(DateTime, server_default=func.now())

    training = relationship("Training", back_populates="enrollments")
    user = relationship("User", backref="training_enrollments")


class Compensation(Base):
    __tablename__ = "compensations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    base_salary = Column(Float, nullable=False)
    bonus = Column(Float, default=0.0)
    allowance = Column(Float, default=0.0)
    insurance = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    effective_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    adjustment_reason = Column(Text, nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="compensations")
    approved_by = relationship("User", foreign_keys=[approved_by_id], backref="approved_compensations")
