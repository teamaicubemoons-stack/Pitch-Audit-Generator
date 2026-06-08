"""
Research Service — Gathers company/industry data via web searches and scraping.
Uses Serper API (Google Search) with DuckDuckGo as fallback.
"""

import asyncio
import os
import re
import logging
from typing import Optional
import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from models.schemas import AuditFormInput

load_dotenv()
logger = logging.getLogger(__name__)

SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
RESEARCH_TIMEOUT = int(os.getenv("MAX_RESEARCH_TIMEOUT", "30"))


# ─── Industry Benchmarks ───────────────────────────────────────────────────────

INDUSTRY_BENCHMARKS = {
    "Healthcare": {
        "digital_maturity_avg": 4,
        "common_gaps": ["Patient portal / online booking", "Telemedicine integration", "Automated appointment reminders", "Digital health records"],
        "top_competitors_strategy": "Hospital chains in India are rapidly adopting WhatsApp-based appointment booking and AI-powered diagnostics",
        "market_trend": "India's digital health market is projected to reach $10.6B by 2025",
    },
    "Education": {
        "digital_maturity_avg": 5,
        "common_gaps": ["LMS platform", "Live class / recorded content delivery", "Student progress tracking", "Fee payment portal"],
        "top_competitors_strategy": "EdTech leaders like Byju's and Unacademy use AI-personalized learning paths",
        "market_trend": "India EdTech market expected to grow to $30B by 2030",
    },
    "E-commerce": {
        "digital_maturity_avg": 6,
        "common_gaps": ["Mobile-first shopping app", "AI product recommendations", "Abandoned cart recovery", "Multi-channel inventory"],
        "top_competitors_strategy": "D2C brands are investing heavily in mobile apps and WhatsApp commerce",
        "market_trend": "India's e-commerce GMV to hit $350B by 2030",
    },
    "FinTech": {
        "digital_maturity_avg": 7,
        "common_gaps": ["UPI / payment gateway integration", "KYC automation", "Loan origination system", "Compliance dashboard"],
        "top_competitors_strategy": "NBFCs are deploying AI credit scoring to reduce underwriting time by 80%",
        "market_trend": "Indian FinTech market valued at $584B by 2025",
    },
    "Real Estate": {
        "digital_maturity_avg": 4,
        "common_gaps": ["Virtual property tours", "CRM for lead management", "Digital brochures / portals", "EMI calculator & home loan integration"],
        "top_competitors_strategy": "Top builders use 3D virtual tours and AI chatbots for lead qualification",
        "market_trend": "PropTech in India growing at 20% CAGR — $8.26B by 2030",
    },
    "SaaS/Startup": {
        "digital_maturity_avg": 7,
        "common_gaps": ["Scalable cloud infrastructure", "Analytics & monitoring", "CI/CD pipeline", "Multi-tenant architecture"],
        "top_competitors_strategy": "Successful SaaS startups lead with product-led growth and freemium funnels",
        "market_trend": "India's SaaS industry projected to be $35B by 2027",
    },
    "Manufacturing": {
        "digital_maturity_avg": 3,
        "common_gaps": ["ERP / MES system", "IoT-based production monitoring", "Supply chain visibility", "B2B ordering portal"],
        "top_competitors_strategy": "Industry 4.0 adoption — smart factory solutions with IoT dashboards",
        "market_trend": "India Manufacturing sector digitization growing at 25% CAGR",
    },
    "Other": {
        "digital_maturity_avg": 4,
        "common_gaps": ["Professional website", "Social media presence", "Lead generation system", "CRM / customer management"],
        "top_competitors_strategy": "Competitors in most industries are leveraging Google Ads and SEO for lead gen",
        "market_trend": "Digital transformation is a cross-industry imperative — 70% of businesses plan to increase IT spend in 2025",
    },
}


def get_industry_benchmarks(industry: Optional[str]) -> dict:
    return INDUSTRY_BENCHMARKS.get(industry or "Other", INDUSTRY_BENCHMARKS["Other"])


def infer_industry(research_data: dict) -> str:
    """Guess industry from scraped content if not provided."""
    text = " ".join(str(v) for v in research_data.values()).lower()
    mapping = {
        "healthcare": ["hospital", "clinic", "doctor", "patient", "medical", "pharma", "health"],
        "Education": ["school", "college", "university", "student", "course", "learn", "tutor", "edtech"],
        "E-commerce": ["shop", "store", "product", "buy", "sell", "cart", "delivery", "ecommerce"],
        "FinTech": ["loan", "finance", "payment", "insurance", "banking", "credit", "invest", "nbfc"],
        "Real Estate": ["property", "realty", "builder", "apartment", "flat", "plot", "real estate"],
        "SaaS/Startup": ["software", "saas", "app", "startup", "platform", "subscription", "cloud"],
        "Manufacturing": ["manufacture", "factory", "production", "supply chain", "industrial", "plant"],
    }
    for industry, keywords in mapping.items():
        if any(kw in text for kw in keywords):
            return industry
    return "Other"


def identify_gaps(research_data: dict, inp: AuditFormInput) -> dict:
    """Summarise what data was and wasn't found."""
    has_website = bool(research_data.get("website_content"))
    has_social = bool(research_data.get("social_presence"))
    has_reviews = bool(research_data.get("reviews"))
    has_company_info = bool(research_data.get("company_info"))

    gaps = []
    if not has_website:
        gaps.append("No website or website could not be accessed")
    if not has_social:
        gaps.append("No social media presence detected")
    if not has_reviews:
        gaps.append("No public reviews / ratings found")
    if not has_company_info:
        gaps.append("No company directory listings found")

    return {
        "has_website": has_website,
        "has_social": has_social,
        "has_reviews": has_reviews,
        "has_company_info": has_company_info,
        "identified_gaps": gaps,
        "online_presence_score": sum([has_website, has_social, has_reviews, has_company_info]),
    }


def handle_no_online_presence(inp: AuditFormInput, partial_data: dict) -> dict:
    industry = inp.industry or "Other"
    benchmarks = get_industry_benchmarks(industry)
    return {
        "company_stage": "Early stage / pre-digital",
        "digital_maturity_score": 1,
        "biggest_gap": "No online presence — foundational digital setup needed",
        "opportunity": "High potential — starting from scratch means a clean slate for best practices",
        "recommended_starting_point": benchmarks["common_gaps"][0] if benchmarks["common_gaps"] else "Professional website",
        "industry_benchmark": benchmarks,
    }


# ─── HTTP helpers ──────────────────────────────────────────────────────────────

async def _free_search(query: str, num: int = 5) -> list[dict]:
    """Free search using ddgs as fallback."""
    try:
        from ddgs import DDGS
        def sync_search():
            with DDGS() as ddgs:
                return list(ddgs.text(query, max_results=num))
        
        raw_results = await asyncio.to_thread(sync_search)
        mapped_results = []
        for r in raw_results:
            mapped_results.append({
                "title": r.get("title", ""),
                "snippet": r.get("body", ""),
                "link": r.get("href", ""),
            })
        return mapped_results
    except Exception as e:
        logger.warning(f"Free search fallback failed for '{query}': {e}")
        return []


async def _serper_search(query: str, num: int = 5) -> list[dict]:
    """Google search via Serper API, falling back to free search when no key is configured."""
    if not SERPER_API_KEY:
        return await _free_search(query, num)
    try:
        async with httpx.AsyncClient(timeout=RESEARCH_TIMEOUT) as client:
            resp = await client.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"},
                json={"q": query, "num": num, "gl": "in"},
            )
            data = resp.json()
            return data.get("organic", [])
    except Exception as e:
        logger.warning(f"Serper search failed for '{query}': {e}")
        return await _free_search(query, num)



async def _ddg_search(query: str) -> str:
    """DuckDuckGo instant answer fallback."""
    try:
        async with httpx.AsyncClient(timeout=RESEARCH_TIMEOUT) as client:
            resp = await client.get(
                "https://api.duckduckgo.com/",
                params={"q": query, "format": "json", "no_html": 1, "skip_disambig": 1},
            )
            data = resp.json()
            return data.get("AbstractText", "") or data.get("Answer", "")
    except Exception as e:
        logger.warning(f"DuckDuckGo search failed for '{query}': {e}")
        return ""


async def _scrape_url(url: str) -> str:
    """Scrape visible text from a URL."""
    try:
        async with httpx.AsyncClient(
            timeout=RESEARCH_TIMEOUT,
            headers={"User-Agent": "Mozilla/5.0 (compatible; CubemoonsBot/1.0)"},
            follow_redirects=True,
        ) as client:
            resp = await client.get(url)
            soup = BeautifulSoup(resp.text, "html.parser")
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            text = soup.get_text(separator=" ", strip=True)
            # Trim to 3000 chars to keep token usage reasonable
            return re.sub(r"\s+", " ", text)[:3000]
    except Exception as e:
        logger.warning(f"Scrape failed for '{url}': {e}")
        return ""


def _summarise_results(results: list[dict]) -> str:
    """Convert Serper result list to readable text."""
    lines = []
    for r in results[:4]:
        title = r.get("title", "")
        snippet = r.get("snippet", "")
        link = r.get("link", "")
        if title or snippet:
            lines.append(f"• {title}: {snippet} [{link}]")
    return "\n".join(lines)


# ─── Individual Research Functions ────────────────────────────────────────────

async def scrape_website(url: str) -> str:
    return await _scrape_url(url)


async def search_company(name: str, location: Optional[str]) -> str:
    loc = location or "India"
    results = await _serper_search(f"{name} company overview services {loc}")
    if results:
        return _summarise_results(results)
    return await _ddg_search(f"{name} company {loc}")


async def check_social_media(name: str) -> str:
    results = await _serper_search(f"{name} Instagram LinkedIn Facebook online presence")
    return _summarise_results(results)


async def search_reviews(name: str) -> str:
    results = await _serper_search(f"{name} reviews rating customer feedback Google")
    return _summarise_results(results)


async def search_recent_news(name: str) -> str:
    results = await _serper_search(f"{name} news 2024 2025")
    return _summarise_results(results)


async def search_industry_trends(industry: str) -> str:
    benchmarks = get_industry_benchmarks(industry)
    results = await _serper_search(f"{industry} industry trends India 2025 digital transformation")
    if results:
        trend_text = _summarise_results(results)
    else:
        trend_text = benchmarks["market_trend"]
    return trend_text


async def research_competitors(
    competitors_input: Optional[str],
    company_name: Optional[str],
    industry: str,
) -> str:
    if competitors_input:
        names = [c.strip() for c in competitors_input.split(",")]
        queries = [f"{n} services digital presence" for n in names[:3]]
        results_list = await asyncio.gather(*[_serper_search(q, 3) for q in queries])
        summaries = [_summarise_results(r) for r in results_list]
        return "\n".join(summaries)
    # Auto-research top competitors
    results = await _serper_search(f"top {industry} companies India competitors 2025")
    return _summarise_results(results)


# ─── Main Research Orchestrator ───────────────────────────────────────────────

async def research_company(inp: AuditFormInput) -> dict:
    """
    Priority:
    1. User provided → use directly
    2. Website URL → scrape
    3. Company name → search
    4. Nothing → industry/location fallback
    """
    research_data: dict = {}
    tasks = {}

    # Website scraping
    if inp.website_url:
        tasks["website_content"] = scrape_website(inp.website_url)

    # Company searches (run in parallel)
    if inp.company_name:
        tasks["company_info"] = search_company(inp.company_name, inp.location)
        tasks["social_presence"] = check_social_media(inp.company_name)
        tasks["reviews"] = search_reviews(inp.company_name)
        tasks["news"] = search_recent_news(inp.company_name)

    # Industry research always runs
    industry = inp.industry or "Other"
    tasks["industry_trends"] = search_industry_trends(industry)
    tasks["competitor_analysis"] = research_competitors(
        inp.competitors, inp.company_name, industry
    )

    # Execute all tasks concurrently
    if tasks:
        keys = list(tasks.keys())
        values = await asyncio.gather(*tasks.values(), return_exceptions=True)
        for k, v in zip(keys, values):
            research_data[k] = v if not isinstance(v, Exception) else ""

    # Post-processing
    if not inp.industry and research_data:
        research_data["inferred_industry"] = infer_industry(research_data)

    research_data["gaps_summary"] = identify_gaps(research_data, inp)
    research_data["industry_benchmarks"] = get_industry_benchmarks(inp.industry or industry)

    # Handle zero online presence
    gaps = research_data["gaps_summary"]
    if gaps["online_presence_score"] == 0:
        research_data["no_online_presence_analysis"] = handle_no_online_presence(inp, research_data)

    return research_data
