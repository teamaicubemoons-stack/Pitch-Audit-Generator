import asyncio
import os
import json
from dotenv import load_dotenv

from models.schemas import AuditFormInput
from services import research_service

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
    
    print("Running research_company...")
    research_data = await research_service.research_company(inp)
    print("Research Data Keys:", list(research_data.keys()))
    print("Research Data Gaps Summary:", research_data.get("gaps_summary"))
    print("Company Info sample:", repr(research_data.get("company_info")))

asyncio.run(test())
