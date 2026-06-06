import httpx
import json

def test():
    payload = {
        "company_name": "MMI Narayana Hospital",
        "industry": "Healthcare",
        "location": "Raipur, Chhattisgarh",
        "company_size": "100-500",
        "pain_points": "Low online presence, manual whatsapp replies, slow response time.",
        "requirements": "Automated WhatsApp chatbot, Google Business Optimization, new website.",
        "generate_flowchart": True,
        "generator_name": "Admin",
        "generator_id": "Admin"
    }
    
    print("Calling /api/generate-audit...")
    try:
        response = httpx.post("http://localhost:8000/api/generate-audit", json=payload, timeout=60.0)
        if response.status_code == 200:
            data = response.json()
            sections = data.get("audit_sections", {})
            print("--- PARSE ERROR ---")
            print(sections.get("parse_error"))
            print("--- RAW RESPONSE ---")
            print(repr(sections.get("raw_response")))
        else:
            print("HTTP Error:", response.status_code, response.text)
    except Exception as e:
        print("Failed:", e)

test()
