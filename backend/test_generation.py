import asyncio
import os
import json
from dotenv import load_dotenv

from models.schemas import AuditFormInput
from services import research_service, analysis_service

load_dotenv(override=True)

async def test():
    inp = AuditFormInput(
        company_name="MMI Narayana Hospital",
        industry="Healthcare",
        location="Raipur, Chhattisgarh",
        company_size="100-500",
        pain_points="Low online presence, manual whatsapp replies, slow response time.",
        requirements="Automated WhatsApp chatbot, Google Business Optimization, new website.",
        generate_flowchart=True
    )
    
    print("Step 1: Running Research...")
    research_data = await research_service.research_company(inp)
    print("Research Complete.")
    
    print("\nStep 2: Running Gap Analysis...")
    try:
        gaps = await analysis_service.analyze_gaps(inp, research_data)
        print("Gap Analysis Keys:", list(gaps.keys()))
        print("Gap Analysis error:", gaps.get("parse_error"))
    except Exception as e:
        print("Gap Analysis Exception:", e)
        gaps = {}
    
    print("\nStep 3: Generating Audit Document...")
    try:
        audit = await analysis_service.generate_audit(inp, research_data, gaps)
        print("Audit Document Keys:", list(audit.keys()))
        print("Audit Document error:", audit.get("parse_error"))
        print("Audit Client Name:", audit.get("audit_meta", {}).get("client_name"))
    except Exception as e:
        print("Audit Generation Exception:", e)

asyncio.run(test())


