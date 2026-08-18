import uuid
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ProblemReaction(Base):
    __tablename__ = "problem_reactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(String(36), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    reaction = Column(String(20), nullable=False)  # 'like' | 'dislike'

    __table_args__ = (UniqueConstraint("user_id", "problem_id", name="uq_user_problem_reaction"),)

    user = relationship("User", back_populates="reactions")
    problem = relationship("Problem", back_populates="reactions")
