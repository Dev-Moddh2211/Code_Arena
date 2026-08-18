import uuid
from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    challenge_date = Column(Date, unique=True, index=True, nullable=False)

    problem = relationship("Problem")
