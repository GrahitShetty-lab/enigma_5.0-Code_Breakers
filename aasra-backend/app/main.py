"""Aasra Backend — helping families navigate a deceased person's financial life.
Every asset is a hypothesis until a human marks it verified."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Aasra — Financial Life Discovery",
    description=(
        "Helps grieving families discover and close out a deceased person's "
        "financial obligations. Every finding is a hypothesis backed by "
        "evidence and a confidence score — never a confirmed fact."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hackathon — tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routes import auth, cases, documents, assets, tasks, claims, dashboard
import app.models as models

app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(assets.router)
app.include_router(tasks.router)
app.include_router(claims.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["system"])
def health_check():
    """Liveness probe — returns 200 if the server is up."""
    return {"status": "healthy", "service": "aasra-backend"}

