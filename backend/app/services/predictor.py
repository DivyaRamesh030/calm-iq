"""
Stress prediction service.
Uses a Gradient Boosting regression model trained on lifestyle data.
"""

import os
import pickle
import numpy as np
from typing import List, Dict, Any


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))


def _model_path_candidates() -> List[str]:
    env_model_path = os.getenv("MODEL_PATH")
    return [
        env_model_path or "",
        os.path.join(BASE_DIR, "ml", "stress_model.pkl"),
        os.path.join("/app", "ml", "stress_model.pkl"),
    ]


class _RuleBasedModel:
    # Keep API compatible with sklearn estimators.
    def predict(self, feats: np.ndarray) -> np.ndarray:
        out = []
        for row in feats:
            sleep, work, mood, screen, activity, hr, spo2 = row.tolist()
            score = (
                45
                + max(0, (7 - sleep) * 6)
                + max(0, (work - 8) * 3)
                + max(0, (2 - mood) * 4)
                + max(0, (screen - 5) * 2)
                + max(0, (30 - activity) * 0.25)
                + max(0, (hr - 80) * 0.5)
                + max(0, (98 - spo2) * 2.5)
            )
            out.append(min(100, max(0, score)))
        return np.array(out, dtype=float)

# =========================
# LOAD MODEL
# =========================
def _load_model():
    for model_path in _model_path_candidates():
        if model_path and os.path.exists(model_path):
            print("MODEL PATH:", model_path)
            with open(model_path, "rb") as f:
                return pickle.load(f)

    print("MODEL PATH: not found in expected locations")
    print("Falling back to rule-based predictor")
    return _RuleBasedModel()


_model = _load_model()


# =========================
# FEATURE ARRAY
# =========================
def _features(sleep, work, mood, screen, activity, hr, spo2) -> np.ndarray:
    return np.array([[sleep, work, mood, screen, activity, hr, spo2]])


# =========================
# FACTOR ANALYSIS
# =========================
def _compute_factors(sleep, work, mood, screen, activity, hr, spo2) -> List[Dict]:
    raw = [
        {"label": "Sleep deficit",        "val": max(0, (7 - sleep) * 18)},
        {"label": "Work overload",         "val": max(0, (work - 8) * 12)},
        {"label": "Low mood",              "val": max(0, (2 - mood) * 14)},
        {"label": "Excessive screen time", "val": max(0, (screen - 5) * 8)},
        {"label": "Physical inactivity",   "val": max(0, (30 - activity) * 0.8)},
        {"label": "Elevated heart rate",   "val": max(0, (hr - 80) * 1.2)},
        {"label": "Low SpO₂",             "val": max(0, (98 - spo2) * 6)},
    ]
    raw = [f for f in raw if f["val"] > 0]
    raw.sort(key=lambda x: x["val"], reverse=True)
    raw = raw[:4]
    max_val = max((f["val"] for f in raw), default=1)
    return [{"label": f["label"], "val": round(f["val"], 1),
             "pct": round(f["val"] / max_val * 100)} for f in raw]



def _get_recommendations(sleep, work, mood, screen, activity, hr, spo2, level) -> List[Dict]:
    recs = []
    if sleep < 7:
        recs.append({"icon": "🌙", "title": "Improve sleep hygiene",
                     "text": "Aim for 7–8 hours. Try a consistent bedtime and cut screens 1 hour before bed."})
    if work > 9:
        recs.append({"icon": "⏱️", "title": "Set work boundaries",
                     "text": "Schedule hard stops and take short breaks every 90 min. Overworking reduces productivity."})
    if mood < 2:
        recs.append({"icon": "🧘", "title": "Mindfulness practice",
                     "text": "Even 10 minutes of meditation or deep breathing can meaningfully shift your mood."})
    if screen > 7:
        recs.append({"icon": "📵", "title": "Digital detox",
                     "text": "Try the 20-20-20 rule: every 20 min, look 20 feet away for 20 seconds."})
    if activity < 30:
        recs.append({"icon": "🚶", "title": "Move more",
                     "text": "A 30-min walk reduces cortisol. Even light movement breaks stress cycles."})
    if hr > 85:
        recs.append({"icon": "💧", "title": "Hydration & rest",
                     "text": "Elevated resting HR can signal dehydration or fatigue. Drink water and rest."})
    if level == "High":
        recs.append({"icon": "👨‍⚕️", "title": "Talk to someone",
                     "text": "High stress warrants support. Consider speaking with a counsellor or trusted friend."})
    if not recs:
        recs.append({"icon": "✅", "title": "Keep it up!",
                     "text": "Your habits look great. Maintain this routine for long-term wellbeing."})
    return recs[:4]



def _get_summary(level, sleep, work, mood, activity) -> str:
    if level == "Low":
        return ("You're in a good place today. Your lifestyle metrics indicate a well-balanced day "
                "with manageable stress. Keep nurturing these habits.")
    if level == "Medium":
        issues = []
        if sleep < 7:
            issues.append("sleep could be improved")
        if work > 8:
            issues.append("work hours are elevated")
        if mood < 2:
            issues.append("mood is below baseline")
        issue_str = (f"Notably, {' and '.join(issues[:2])}. " if issues else "")
        return (f"Moderate stress detected. {issue_str}Small adjustments to your routine "
                "can bring noticeable relief.")
    return ("Your stress indicators are elevated today. A combination of factors is affecting "
            "your wellbeing. Prioritising rest, movement, and mental breaks can help you recover quickly.")


# =========================
# MAIN FUNCTION
# =========================
def predict_stress(sleep: float, work: float, mood: int,
                   screen: float, activity: float, hr: int, spo2: float) -> Dict[str, Any]:

    feats = _features(sleep, work, mood, screen, activity, hr, spo2)


    score = float(_model.predict(feats)[0])

    level = "Low" if score < 40 else "Medium" if score < 65 else "High"

    return {
        "stress_score": round(score, 1),
        "stress_level": level,
        "summary": _get_summary(level, sleep, work, mood, activity),
        "factors": _compute_factors(sleep, work, mood, screen, activity, hr, spo2),
        "recommendations": _get_recommendations(sleep, work, mood, screen, activity, hr, spo2, level),
    }