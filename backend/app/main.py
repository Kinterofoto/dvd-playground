import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router

app = FastAPI(title="DVD Playground API", version="1.0.0")

allowed_origins = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-OpenAI-API-Key"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}
