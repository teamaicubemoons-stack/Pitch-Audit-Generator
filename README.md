# Cubemoons Audit Generator

> AI-powered client pitch audit generator for Cubemoons Pvt. Ltd.
> **Stack:** React (Vite) + FastAPI + OpenAI GPT-4o

---

## 🚀 Quick Start

### Option 1: One-Command Start (Windows PowerShell)
```powershell
.\start.ps1
```

### Option 2: Manual Start

**Backend:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Then add your API keys
uvicorn main:app --reload --port 8000
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev                 # Runs on http://localhost:3000
```

---

## 🔑 Environment Variables

Edit `backend/.env`:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |
| `OPENAI_MODEL` | Model to use (default: `gpt-4o`) |
| `SERPER_API_KEY` | Google Search API key (optional, for richer research) |
| `PDF_OUTPUT_DIR` | Where to save PDFs (default: `./generated_pdfs`) |
| `CORS_ORIGINS` | Frontend URL(s) for CORS |

---

## 📁 Project Structure

```
cubemoons-audit-generator/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuditForm.jsx
│   │   │   ├── ProgressTracker.jsx
│   │   │   ├── AuditPreview.jsx
│   │   │   └── FlowchartViewer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── AuditResult.jsx
│   │   └── api/auditApi.js
│   └── package.json
│
├── backend/                     # FastAPI app
│   ├── main.py
│   ├── routes/audit.py
│   ├── services/
│   │   ├── research_service.py  # Web scraping + search
│   │   ├── analysis_service.py  # GPT-4o analysis
│   │   ├── pdf_service.py       # PDF via WeasyPrint
│   │   └── flowchart_service.py # Mermaid → SVG
│   ├── prompts/audit_prompts.py # All OpenAI prompts
│   ├── models/schemas.py        # Pydantic models
│   ├── templates/               # Jinja2 HTML + CSS for PDF
│   └── requirements.txt
│
├── start.ps1                    # One-command launcher
└── setup_backend.ps1
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate-audit` | Generate full audit |
| `GET`  | `/api/download-pdf/{filename}` | Download generated PDF |
| `GET`  | `/api/health` | Health check |
| `GET`  | `/api/docs` | Swagger UI |

---

## 📋 All Form Fields (All Optional)

**Section A — Company Info:** name, website, industry, size, location, LinkedIn, social handles  
**Section B — Requirements:** pain points, requirements, current tools, budget, deal type, timeline  
**Section C — Context:** competitors, meeting notes, proposed solution, generate flowchart toggle

---

## 💡 How It Works

1. User submits form (any combination of fields, all optional)
2. Backend runs **parallel web research** (Serper/DuckDuckGo + scraping)
3. **GPT-4o** performs gap analysis based on collected data
4. **GPT-4o** generates the complete 10-section pitch audit
5. **GPT-4o** (optional) generates a Mermaid.js architecture flowchart
6. **WeasyPrint** compiles everything into a professional PDF
7. Frontend displays preview + download button

---

## 🏢 Cubemoons

- **Website:** https://cubemoons.com
- **Email:** support@cubemoons.com  
- **Phone:** +91-9039034412
- **Address:** 4th Floor, MR DIY Building, Samta Colony, Raipur, CG 492001
