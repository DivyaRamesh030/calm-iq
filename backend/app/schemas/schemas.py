from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime


# ── User ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    occupation: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int]
    occupation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Stress Log ────────────────────────────────────────────────────────────────

class StressInput(BaseModel):
    sleep_duration: float       # hours  0–12
    work_hours: float           # hours  0–16
    mood_level: int             # 1–10
    screen_time: float          # hours  0–16
    physical_activity: float    # minutes 0–180
    heart_rate: int             # bpm 40–140
    spo2: float                 # % 85–100


class StressLogCreate(StressInput):
    user_id: int


class Factor(BaseModel):
    label: str
    val: float
    pct: float


class Recommendation(BaseModel):
    icon: str
    title: str
    text: str


class StressResult(BaseModel):
    stress_score: float
    stress_level: str
    summary: str
    factors: List[Factor]
    recommendations: List[Recommendation]


class StressLogResponse(BaseModel):
    id: int
    user_id: int
    sleep_duration: float
    work_hours: float
    mood_level: int
    screen_time: float
    physical_activity: float
    heart_rate: int
    spo2: float
    stress_score: float
    stress_level: str
    summary: Optional[str]
    factors: Optional[str]
    recommendations: Optional[str]
    logged_at: datetime

    class Config:
        from_attributes = True


class PredictRequest(BaseModel):
    user_id: int
    inputs: StressInput
