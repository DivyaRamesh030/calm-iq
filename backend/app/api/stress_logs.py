import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import StressLog, User
from app.schemas.schemas import PredictRequest, StressLogResponse
from app.services.predictor import predict_stress
from typing import List

router = APIRouter()


@router.post("/predict", response_model=StressLogResponse)
def predict_and_save(payload: PredictRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    inp = payload.inputs
    result = predict_stress(
        inp.sleep_duration, inp.work_hours, inp.mood_level,
        inp.screen_time, inp.physical_activity, inp.heart_rate, inp.spo2
    )

    log = StressLog(
        user_id=payload.user_id,
        sleep_duration=inp.sleep_duration,
        work_hours=inp.work_hours,
        mood_level=inp.mood_level,
        screen_time=inp.screen_time,
        physical_activity=inp.physical_activity,
        heart_rate=inp.heart_rate,
        spo2=inp.spo2,
        stress_score=result["stress_score"],
        stress_level=result["stress_level"],
        summary=result["summary"],
        factors=json.dumps(result["factors"]),
        recommendations=json.dumps(result["recommendations"]),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/user/{user_id}", response_model=List[StressLogResponse])
def get_user_logs(user_id: int, limit: int = 30, db: Session = Depends(get_db)):
    logs = (
        db.query(StressLog)
        .filter(StressLog.user_id == user_id)
        .order_by(StressLog.logged_at.desc())
        .limit(limit)
        .all()
    )
    return logs


@router.get("/user/{user_id}/trend")
def get_trend(user_id: int, days: int = 14, db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    since = datetime.utcnow() - timedelta(days=days)
    logs = (
        db.query(StressLog)
        .filter(StressLog.user_id == user_id, StressLog.logged_at >= since)
        .order_by(StressLog.logged_at.asc())
        .all()
    )
    return [
        {
            "date": log.logged_at.isoformat(),
            "score": log.stress_score,
            "level": log.stress_level,
        }
        for log in logs
    ]


@router.get("/user/{user_id}/stats")
def get_stats(user_id: int, db: Session = Depends(get_db)):
    logs = db.query(StressLog).filter(StressLog.user_id == user_id).all()
    if not logs:
        return {"total": 0, "avg_score": 0, "low": 0, "medium": 0, "high": 0}
    return {
        "total": len(logs),
        "avg_score": round(sum(l.stress_score for l in logs) / len(logs), 1),
        "low": sum(1 for l in logs if l.stress_level == "Low"),
        "medium": sum(1 for l in logs if l.stress_level == "Medium"),
        "high": sum(1 for l in logs if l.stress_level == "High"),
    }


@router.delete("/{log_id}", status_code=204)
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(StressLog).filter(StressLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
