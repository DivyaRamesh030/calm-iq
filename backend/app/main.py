from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api import users, stress_logs
from app.core.database import engine, Base

app = FastAPI(title="calm·IQ API", version="1.0.0")


def get_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS")
    if raw_origins:
        origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
        if origins:
            return origins
    return ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(stress_logs.router, prefix="/api/stress", tags=["stress"])


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "calm·IQ API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
