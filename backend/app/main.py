from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import users, stress_logs
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="calm·IQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(stress_logs.router, prefix="/api/stress", tags=["stress"])

@app.get("/")
def root():
    return {"message": "calm·IQ API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
