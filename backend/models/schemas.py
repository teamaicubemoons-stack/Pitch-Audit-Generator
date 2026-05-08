from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class AuditFormInput(BaseModel):
    # Company Info
    company_name: Optional[str] = None
    website_url: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    social_media_handles: Optional[str] = None

    # Requirements
    pain_points: Optional[str] = None
    requirements: Optional[str] = None
    current_tools: Optional[str] = None
    budget_range: Optional[str] = None
    deal_type: Optional[str] = None
    timeline: Optional[str] = None

    # Additional Context
    competitors: Optional[str] = None
    meeting_notes: Optional[str] = None
    proposed_solution: Optional[str] = None
    generate_flowchart: bool = True


class AuditOutput(BaseModel):
    audit_sections: Dict[str, Any]
    flowchart_data: Optional[Dict[str, Any]] = None
    pdf_url: str
    generation_time_seconds: float


class ProgressUpdate(BaseModel):
    step: str
    status: str  # "pending" | "running" | "done" | "error"
    message: str


class ErrorResponse(BaseModel):
    error: str
    detail: str
