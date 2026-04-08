from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    age = Column(Integer)
    occupation = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stress_logs = relationship("StressLog", back_populates="user", cascade="all, delete")


class StressLog(Base):
    __tablename__ = "stress_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Inputs
    sleep_duration = Column(Float, nullable=False)
    work_hours = Column(Float, nullable=False)
    mood_level = Column(Integer, nullable=False)
    screen_time = Column(Float, nullable=False)
    physical_activity = Column(Float, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    spo2 = Column(Float, nullable=False)

    # ML Outputs
    stress_score = Column(Float, nullable=False)
    stress_level = Column(String(10), nullable=False)  # Low / Medium / High
    summary = Column(Text)
    factors = Column(Text)       # JSON string
    recommendations = Column(Text)  # JSON string

    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="stress_logs")
