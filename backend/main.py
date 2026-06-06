"""
FastAPI Application Entry Point — Cubemoons Audit Generator
Runs BOTH backend API and React frontend from a single uvicorn command.
"""

import logging
import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from routes.audit import router as audit_router
from routes.auth import router as auth_router

load_dotenv(override=True)

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── FastAPI App ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Impression Audit Generator API",
    description="AI-powered client pitch audit generator for Impression.pr",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────────────────
app.include_router(audit_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

# ── PDF output dir ────────────────────────────────────────────────────────────
PDF_DIR = os.getenv("PDF_OUTPUT_DIR", "./generated_pdfs")
Path(PDF_DIR).mkdir(parents=True, exist_ok=True)

# ── Serve built React frontend (../frontend/dist) ─────────────────────────────
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    # Catch-all: serve index.html for any non-API route (React Router support)
    @app.get("/{full_path:path}")
    async def serve_react(full_path: str, request: Request):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return
        index = FRONTEND_DIST / "index.html"
        if index.exists():
            return FileResponse(str(index))

# ── Init event ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("✅ Cubemoons Audit Generator API started")
    logger.info(f"📄 PDF output dir: {PDF_DIR}")
    if FRONTEND_DIST.exists():
        logger.info(f"⚛️  Serving React frontend from: {FRONTEND_DIST}")
        logger.info("🌐 Open: http://localhost:8000")
    else:
        logger.warning(f"⚠️  Frontend dist not found at {FRONTEND_DIST} — run 'npm run build' in frontend/")
    logger.info("📖 API docs: http://localhost:8000/api/docs")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Cubemoons Audit Generator API shutting down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
