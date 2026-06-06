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
import gspread
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from models.schemas import AuditFormInput, AuditOutput
from services import research_service, analysis_service, pdf_service

router = APIRouter()
logger = logging.getLogger(__name__)

PDF_OUTPUT_DIR = os.getenv("PDF_OUTPUT_DIR", "./generated_pdfs")


def upload_to_drive(file_path: str, file_name: str):
    """Uploads a file to Google Drive and returns the public link."""
    try:
        scope = ["https://www.googleapis.com/auth/drive"]
        creds_path = os.path.join(os.getcwd(), "service_account.json")
        creds = Credentials.from_service_account_file(creds_path, scopes=scope)
        service = build("drive", "v3", credentials=creds)

        file_metadata = {
            "name": file_name,
            "parents": ["1P6MtJJmhrjxMebA2_ElgswnHO53JN-T8"] # Your specific 'Audits' folder
        }
        media = MediaFileUpload(file_path, resumable=True)
        
        # Upload with Shared Drive support
        file = service.files().create(
            body=file_metadata, 
            media_body=media, 
            fields="id, webViewLink",
            supportsAllDrives=True
        ).execute()
        file_id = file.get("id")
        
        # Make Public
        service.permissions().create(
            fileId=file_id,
            body={"type": "anyone", "role": "viewer"},
            supportsAllDrives=True
        ).execute()
        
        # Get final link
        res = service.files().get(fileId=file_id, fields="webViewLink").execute()
        return res.get("webViewLink")
    except Exception as e:
        logger.error(f"[DRIVE] Upload failed: {e}")
        return None


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "Impression Audit Generator"}


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
    pdf_path = None
    try:
        pdf_path = await pdf_service.generate_pdf(audit_content, flowchart_data)
        pdf_filename = Path(pdf_path).name
        pdf_url = f"/api/download-pdf/{pdf_filename}"
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        pdf_url = ""

    elapsed = round(time.time() - start_time, 2)
    logger.info(f"[AUDIT] Complete in {elapsed}s")

    # ── STEP 7: Save to Spreadsheet & Drive ────────────────────────────────────
    try:
        # Metadata
        client_id = f"CL-{int(time.time())}"
        company_name = inp.company_name
        gen_name = inp.generator_name or "Unknown"
        gen_id = inp.generator_id or "N/A"
        nice_date = time.strftime("%B %d, %Y")

        # ── DRIVE UPLOAD ──
        drive_link = None
        if pdf_path and os.path.exists(pdf_path):
            drive_link = upload_to_drive(pdf_path, f"Impression_Audit_{company_name}.pdf")
        
        final_link = drive_link or f"http://localhost:8000{pdf_url}"

        # Local JSON Update
        history_file = Path("audits.json")
        history = []
        if history_file.exists():
            with open(history_file, "r") as f:
                try: history = json.load(f)
                except: history = []
        
        history.append({
            "client_id": client_id,
            "company_name": company_name,
            "date": nice_date,
            "generator_name": gen_name,
            "generator_id": gen_id,
            "qr_code": final_link
        })
        with open(history_file, "w") as f:
            json.dump(history, f, indent=4)

        # LIVE GOOGLE SHEETS SYNC
        try:
            scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
            creds_path = os.path.join(os.getcwd(), "service_account.json")
            creds = Credentials.from_service_account_file(creds_path, scopes=scope)
            client = gspread.authorize(creds)
            
            spreadsheet_url = "https://docs.google.com/spreadsheets/d/1fMbZzsr6tvTXc70cjs9rR3CPvqW6zPILr4DIJV0EFDY/edit"
            doc = client.open_by_url(spreadsheet_url)
            all_sheets = doc.worksheets()
            sheet = next((s for s in all_sheets if "Audit" in s.title), all_sheets[0])
            
            row = [client_id, company_name, nice_date, gen_name, gen_id, final_link]
            sheet.append_row(row)
            logger.info(f"✅ [SHEETS] Sync with Drive Link successful for {company_name}")
        except Exception as gs_err:
            logger.error(f"❌ [SHEETS ERROR] {gs_err}")

    except Exception as e:
        logger.error(f"CRITICAL: History saving failed: {e}")

    return AuditOutput(
        audit_sections=audit_content,
        flowchart_data=flowchart_data,
        pdf_url=pdf_url,
        generation_time_seconds=elapsed,
    )


@router.get("/my-audits/{generator_id}")
async def get_my_audits(generator_id: str):
    """Fetch user's audit history from Google Sheets."""
    try:
        scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
        creds_path = os.path.join(os.getcwd(), "service_account.json")
        creds = Credentials.from_service_account_file(creds_path, scopes=scope)
        client = gspread.authorize(creds)
        
        spreadsheet_url = "https://docs.google.com/spreadsheets/d/1fMbZzsr6tvTXc70cjs9rR3CPvqW6zPILr4DIJV0EFDY/edit"
        doc = client.open_by_url(spreadsheet_url)
        
        sheet = doc.get_worksheet(0)
        all_sheets = doc.worksheets()
        sheet = next((s for s in all_sheets if "Audit" in s.title), all_sheets[0])
        
        records = sheet.get_all_records()
        
        my_history = []
        for row in records:
            # Case-insensitive header matching
            row_clean = {str(k).strip().lower(): v for k, v in row.items()}
            
            # Match by Generator ID or Username
            g_id = str(row_clean.get("generator id", "")).lower()
            g_name = str(row_clean.get("generator name", "")).lower()
            
            if g_id == generator_id.lower() or g_name == generator_id.lower():
                my_history.append({
                    "client_id": row_clean.get("client id", "N/A"),
                    "company_name": row_clean.get("company name", "Unknown"),
                    "date": row_clean.get("date", "N/A"),
                    "qr_code": row_clean.get("pdf link", "#")
                })
        
        return my_history[::-1]

    except Exception as e:
        logger.error(f"Failed to fetch history from Sheets: {e}")
        # Fallback to local JSON if sheets fail
        history_file = Path("audits.json")
        if history_file.exists():
            with open(history_file, "r") as f:
                history = json.load(f)
                return [h for h in history if h.get("generator_id") == generator_id][::-1]
        return []


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
            filename=f"Impression_Audit_{safe_name}",
        )
    elif safe_name.endswith(".html"):
        return FileResponse(
            path=str(file_path),
            media_type="text/html",
            filename=f"Impression_Audit_{safe_name}",
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


@router.get("/admin/all-audits")
async def get_all_audits_admin():
    """Fetch ALL audits from Google Sheets for Admin view."""
    try:
        scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
        creds_path = os.path.join(os.getcwd(), "service_account.json")
        creds = Credentials.from_service_account_file(creds_path, scopes=scope)
        client = gspread.authorize(creds)
        
        spreadsheet_url = "https://docs.google.com/spreadsheets/d/1fMbZzsr6tvTXc70cjs9rR3CPvqW6zPILr4DIJV0EFDY/edit"
        doc = client.open_by_url(spreadsheet_url)
        all_sheets = doc.worksheets()
        sheet = next((s for s in all_sheets if "Audit" in s.title), all_sheets[0])
        
        records = sheet.get_all_records()
        
        # Return everything, sorted newest first
        all_history = []
        for row in records:
            row_clean = {str(k).strip().lower(): v for k, v in row.items()}
            all_history.append({
                "client_id": row_clean.get("client id", "N/A"),
                "company_name": row_clean.get("company name", "Unknown"),
                "date": row_clean.get("date", "N/A"),
                "generator_name": row_clean.get("generator name", "N/A"),
                "generator_id": row_clean.get("generator id", "N/A"),
                "qr_code": row_clean.get("pdf link", "#")
            })
        
        return all_history[::-1]
    except Exception as e:
        logger.error(f"Admin fetch failed: {e}")
        return []
