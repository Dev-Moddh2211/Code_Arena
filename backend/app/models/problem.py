import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base, StringListType

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Problem(Base):
    __tablename__ = "problems"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description_md = Column(Text, nullable=False)
    editorial_md = Column(Text, nullable=True)
    difficulty = Column(String(20), nullable=False)  # 'easy', 'medium', 'hard'
    topic_tags = Column(StringListType, default=list, nullable=False)
    company_tags = Column(StringListType, default=list, nullable=False)
    constraints_md = Column(Text, nullable=True)
    points = Column(Integer, default=10, nullable=False)
    time_limit_ms = Column(Integer, default=2000, nullable=False)
    memory_limit_mb = Column(Integer, default=256, nullable=False)
    status = Column(String(20), default="draft", nullable=False)  # 'draft', 'published', 'archived'
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    language_configs = relationship("ProblemLanguageConfig", back_populates="problem", cascade="all, delete-orphan")
    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan", order_by="TestCase.display_order")
    hints = relationship("Hint", back_populates="problem", cascade="all, delete-orphan", order_by="Hint.display_order")
    submissions = relationship("Submission", back_populates="problem", cascade="all, delete-orphan")
    reactions = relationship("ProblemReaction", back_populates="problem", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="problem", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="problem", cascade="all, delete-orphan")

class ProblemLanguageConfig(Base):
    __tablename__ = "problem_language_configs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    language = Column(String(50), nullable=False)  # 'python', 'javascript', 'cpp', 'java'
    starter_code = Column(Text, nullable=False)
    wrapper_template = Column(Text, nullable=False)

    __table_args__ = (UniqueConstraint("problem_id", "language", name="uq_problem_language"),)
    problem = relationship("Problem", back_populates="language_configs")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    input_json = Column(Text, nullable=False)
    expected_output_json = Column(Text, nullable=False)
    is_sample = Column(Boolean, default=False, nullable=False)
    order_matters = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

    problem = relationship("Problem", back_populates="test_cases")

class Hint(Base):
    __tablename__ = "hints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    content_md = Column(Text, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

    problem = relationship("Problem", back_populates="hints")
