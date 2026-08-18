import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Sheet(Base):
    __tablename__ = "sheets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    sheet_problems = relationship("SheetProblem", back_populates="sheet", cascade="all, delete-orphan", order_by="SheetProblem.display_order")

class SheetProblem(Base):
    __tablename__ = "sheet_problems"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sheet_id = Column(String(36), ForeignKey("sheets.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(String(36), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    display_order = Column(Integer, default=0, nullable=False)

    __table_args__ = (UniqueConstraint("sheet_id", "problem_id", name="uq_sheet_problem"),)

    sheet = relationship("Sheet", back_populates="sheet_problems")
    problem = relationship("Problem")
