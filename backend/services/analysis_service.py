"""
Analysis Service — GPT-4 powered gap analysis, audit generation, and flowchart creation.
"""

import json
import logging
import asyncio
from datetime import date
from typing import Optional
import openai
import os
from dotenv import load_dotenv

from models.schemas import AuditFormInput
from prompts.audit_prompts import (
    MASTER_SYSTEM_PROMPT,
    PROMPT_GAP_ANALYSIS,
    PROMPT_AUDIT_GENERATION,
    PROMPT_FLOWCHART_GENERATION,
    PROMPT_INDUSTRY_INFERENCE,
    PROMPT_PDF_HTML_GENERATION,
)

load_dotenv(override=True)
logger = logging.getLogger(__name__)

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "4000"))
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))

client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ─── Core GPT call with retry ──────────────────────────────────────────────────

async def _call_gpt(user_prompt: str, max_tokens: int = OPENAI_MAX_TOKENS, retries: int = 3) -> str:
    """Call OpenAI with exponential-backoff retry on rate limits."""
    for attempt in range(retries):
        try:
            resp = await client.chat.completions.create(
                model=OPENAI_MODEL,
                temperature=OPENAI_TEMPERATURE,
                max_tokens=max_tokens,
                messages=[
                    {"role": "system", "content": MASTER_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
            )
            return resp.choices[0].message.content.strip()
        except openai.RateLimitError:
            wait = 2 ** attempt
            logger.warning(f"Rate limit hit — retrying in {wait}s (attempt {attempt+1})")
            await asyncio.sleep(wait)
        except Exception as e:
            logger.error(f"OpenAI call failed: {e}")
            if attempt == retries - 1:
                raise
    return ""


def _parse_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON robustly."""
    raw = raw.strip()
    # If the response is wrapped in markdown code blocks, extract the content
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part_clean = part.strip()
            # Strip language specifier if present
            if part_clean.startswith("json"):
                part_clean = part_clean[4:].strip()
            if part_clean.startswith("{") or part_clean.startswith("["):
                raw = part_clean
                break
    else:
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e}\nRaw: {raw[:500]}")
        return {"raw_response": raw, "parse_error": str(e)}



# ─── Public Service Functions ──────────────────────────────────────────────────

async def infer_industry(inp: AuditFormInput) -> dict:
    """When minimal info is provided, infer the industry profile."""
    prompt = PROMPT_INDUSTRY_INFERENCE.format(
        meeting_notes=inp.meeting_notes or "Not provided",
        pain_points=inp.pain_points or "Not provided",
        requirements=inp.requirements or "Not provided",
        additional_context=f"Budget: {inp.budget_range}, Deal type: {inp.deal_type}",
    )
    raw = await _call_gpt(prompt, max_tokens=800)
    return _parse_json(raw)


async def analyze_gaps(inp: AuditFormInput, research_data: dict) -> dict:
    """GPT-4 gap analysis based on research data."""
    # Truncate research_data to avoid token overflow
    research_str = json.dumps(research_data, ensure_ascii=False)[:4000]
    prompt = PROMPT_GAP_ANALYSIS.format(
        research_data=research_str,
        company_name=inp.company_name or "Unknown",
        industry=inp.industry or research_data.get("inferred_industry", "Unknown"),
        location=inp.location or "India",
        pain_points=inp.pain_points or "Not specified",
        requirements=inp.requirements or "Not specified",
        current_tools=inp.current_tools or "Not specified",
        proposed_solution=inp.proposed_solution or "Not specified",
    )
    raw = await _call_gpt(prompt, max_tokens=2000)
    return _parse_json(raw)


async def generate_audit(inp: AuditFormInput, research_data: dict, gap_analysis: dict) -> dict:
    """Generate the complete 10-section audit document."""
    today = date.today().strftime("%B %d, %Y")

    client_context = {
        "company_name": inp.company_name or "Prospective Client",
        "website": inp.website_url,
        "industry": inp.industry or research_data.get("inferred_industry", "Unknown"),
        "size": inp.company_size,
        "location": inp.location or "India",
        "linkedin_url": inp.linkedin_url,
        "social_media_handles": inp.social_media_handles,
        "pain_points": inp.pain_points,
        "requirements": inp.requirements,
        "current_tools": inp.current_tools,
        "budget_range": inp.budget_range,
        "deal_type": inp.deal_type,
        "timeline": inp.timeline,
        "meeting_notes": inp.meeting_notes,
        "proposed_solution": inp.proposed_solution,
        "audit_date": today,
    }

    # Trim to prevent token overflow
    industry_research = str(research_data.get("industry_trends", ""))[:1500]
    competitor_context = str(research_data.get("competitor_analysis", ""))[:1500]
    
    company_research = (
        f"Scraped Website Content:\n{research_data.get('website_content', '')[:1500]}\n\n"
        f"Google Search Company Overview:\n{research_data.get('company_info', '')[:1000]}\n\n"
        f"Detected Social Media Presence:\n{research_data.get('social_presence', '')[:800]}\n\n"
        f"Customer Reviews & Ratings:\n{research_data.get('reviews', '')[:800]}\n\n"
        f"Recent News / Press:\n{research_data.get('news', '')[:800]}"
    )

    prompt = PROMPT_AUDIT_GENERATION.format(
        client_context=json.dumps(client_context, ensure_ascii=False),
        gap_analysis=json.dumps(gap_analysis, ensure_ascii=False)[:2000],
        company_research=company_research,
        industry_research=industry_research,
        competitor_context=competitor_context,
    )

    raw = await _call_gpt(prompt, max_tokens=OPENAI_MAX_TOKENS)
    return _parse_json(raw)


async def generate_flowchart(proposed_solution_section: dict) -> dict:
    """Generate visual workflow JSON from proposed solution."""
    prompt = PROMPT_FLOWCHART_GENERATION.format(
        proposed_solution_section=json.dumps(proposed_solution_section, ensure_ascii=False)
    )
    raw = await _call_gpt(prompt, max_tokens=2000)
    return _parse_json(raw)


def has_system_solution(audit_content: dict) -> bool:
    """Check if section 5 has enough content to warrant a flowchart."""
    s5 = audit_content.get("section_5_proposed_solution", {})
    features = s5.get("key_features", [])
    return len(features) >= 2


async def generate_pdf_html(audit_data: dict) -> str:
    """Uses the 'PDF AI' to generate a faithful HTML representation for the PDF."""
    prompt = PROMPT_PDF_HTML_GENERATION.format(
        audit_data=json.dumps(audit_data, indent=2, ensure_ascii=False)
    )
    # Use higher tokens for the full HTML document
    return await _call_gpt(prompt, max_tokens=4000)
