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
    
    print("Sending POST request to http://localhost:8000/api/generate-audit...")
    try:
        response = httpx.post("http://localhost:8000/api/generate-audit", json=payload, timeout=60.0)
        print("Status Code:", response.status_code)
        if response.status_code == 200:
            data = response.json()
            print("Response Keys:", list(data.keys()))
            if "audit_sections" in data:
                sections = data["audit_sections"]
                print("Audit Sections Keys:", list(sections.keys()))
                print("Company Overview:", json.dumps(sections.get("company_overview"), indent=2))
            else:
                print("No audit_sections key in response!")
        else:
            print("Error response:", response.text)
    except Exception as e:
        print("HTTP request failed:", e)

test()
