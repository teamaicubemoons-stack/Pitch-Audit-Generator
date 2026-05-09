"""
FastAPI routes for the Audit Generator.
POST /api/generate-audit  — main generation endpoint
GET  /api/download-pdf/{filename} — serve the generated PDF/HTML
GET  /api/health — health check
"""

import os
import time
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import json

from models.schemas import AuditFormInput, AuditOutput
from services import research_service, analysis_service, pdf_service

router = APIRouter()
logger = logging.getLogger(__name__)

PDF_OUTPUT_DIR = os.getenv("PDF_OUTPUT_DIR", "./generated_pdfs")


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "Cubemoons Audit Generator"}


@router.post("/generate-audit", response_model=AuditOutput)
async def generate_audit(inp: AuditFormInput):
    start_time = time.time()

    logger.info(f"[AUDIT] Starting for: {inp.company_name or 'Unknown company'}")

    # ── STEP 1: Research ──────────────────────────────────────────
    logger.info("[STEP 1] Researching company & industry...")
    try:
        research_data = await research_service.research_company(inp)
    except Exception as e:
        logger.error(f"Research failed: {e}")
        research_data = {}

    # ── STEP 2: Industry inference (if nothing provided) ──────────
    if not inp.company_name and not inp.website_url:
        logger.info("[STEP 2] Inferring industry from context...")
        try:
            inferred = await analysis_service.infer_industry(inp)
            research_data["inferred_profile"] = inferred
            if not inp.industry and "inferred_industry" in inferred:
                inp.industry = inferred["inferred_industry"]
        except Exception as e:
            logger.error(f"Industry inference failed: {e}")

    # ── STEP 3: Gap Analysis ──────────────────────────────────────
    logger.info("[STEP 3] Running GPT-4 gap analysis...")
    try:
        gap_analysis = await analysis_service.analyze_gaps(inp, research_data)
    except Exception as e:
        logger.error(f"Gap analysis failed: {e}")
        gap_analysis = {"error": str(e), "identified_gaps": []}

    # ── STEP 4: Full Audit Generation ────────────────────────────
    logger.info("[STEP 4] Generating full audit document...")
    try:
        audit_content = await analysis_service.generate_audit(inp, research_data, gap_analysis)
    except Exception as e:
        logger.error(f"Audit generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Audit generation failed: {str(e)}")

    # ── STEP 5: Flowchart (conditional) ──────────────────────────────────────
    flowchart_data = None

    if inp.generate_flowchart and analysis_service.has_system_solution(audit_content):
        logger.info("[STEP 5] Generating visual flowchart JSON...")
        try:
            flowchart_data = await analysis_service.generate_flowchart(
                audit_content.get("section_5_proposed_solution", {})
            )
        except Exception as e:
            logger.warning(f"Flowchart generation failed (non-fatal): {e}")

    # Inject into audit data for PDF template
    if flowchart_data:
        audit_content["flowchart_data"] = flowchart_data

    # ── STEP 6: PDF Generation ────────────────────────────────────
    logger.info("[STEP 6] Generating PDF...")
    try:
        pdf_path = await pdf_service.generate_pdf(audit_content, flowchart_data)
        pdf_filename = Path(pdf_path).name
        pdf_url = f"/api/download-pdf/{pdf_filename}"
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        pdf_url = ""

    elapsed = round(time.time() - start_time, 2)
    logger.info(f"[AUDIT] Complete in {elapsed}s")

    return AuditOutput(
        audit_sections=audit_content,
        flowchart_data=flowchart_data,
        pdf_url=pdf_url,
        generation_time_seconds=elapsed,
    )


@router.get("/download-pdf/{filename}")
async def download_pdf(filename: str):
    """Serve the generated PDF or HTML file."""
    # Security: prevent path traversal
    safe_name = Path(filename).name
    file_path = Path(PDF_OUTPUT_DIR) / safe_name

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if safe_name.endswith(".pdf"):
        return FileResponse(
            path=str(file_path),
            media_type="application/pdf",
            filename=f"Cubemoons_Audit_{safe_name}",
        )
    elif safe_name.endswith(".html"):
        return FileResponse(
            path=str(file_path),
            media_type="text/html",
            filename=f"Cubemoons_Audit_{safe_name}",
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")


@router.post("/generate-professional-pdf")
async def generate_professional_pdf(audit_data: dict):
    """
    On-demand AI-driven PDF generation. 
    Triggers a second AI call to create a perfect duplicate of the UI in PDF form.
    """
    logger.info("[PDF-AI] Triggered professional PDF generation step...")
    try:
        # Step 1: AI generates the HTML layout
        ai_html = await analysis_service.generate_pdf_html(audit_data)
        
        # Step 2: Convert that AI-HTML to PDF
        pdf_path = await pdf_service.convert_raw_html_to_pdf(ai_html)
        
        filename = Path(pdf_path).name
        return {"pdf_url": f"/api/download-pdf/{filename}"}
    except Exception as e:
        logger.error(f"Professional PDF generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
