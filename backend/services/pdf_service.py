"""
PDF Service — Generates professional audit PDFs using WeasyPrint + Jinja2.
"""

import os
import logging
from uuid import uuid4
from pathlib import Path
import jinja2

load_dotenv_done = False
try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv_done = True
except ImportError:
    pass

logger = logging.getLogger(__name__)

PDF_OUTPUT_DIR = os.getenv("PDF_OUTPUT_DIR", "./generated_pdfs")
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"

# Ensure output dir exists
Path(PDF_OUTPUT_DIR).mkdir(parents=True, exist_ok=True)


def _get_jinja_env() -> jinja2.Environment:
    return jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=jinja2.select_autoescape(["html", "xml"]),
    )


def generate_pdf(audit_data: dict, flowchart_data: dict = None) -> str:
    """
    1. Render HTML from Jinja2 template
    2. Convert to PDF (try xhtml2pdf first for Windows stability, then WeasyPrint)
    3. Save to PDF_OUTPUT_DIR
    """
    env = _get_jinja_env()
    template = env.get_template("audit_template.html")

    # Read CSS content (Prefer pdf_style.css for xhtml2pdf, fallback to audit_style.css)
    pdf_css_path = TEMPLATES_DIR / "pdf_style.css"
    audit_css_path = TEMPLATES_DIR / "audit_style.css"
    
    css_content = ""
    target_css = pdf_css_path if pdf_css_path.exists() else audit_css_path
    
    if target_css.exists():
        with open(target_css, "r", encoding="utf-8") as f:
            css_content = f.read()

    html_content = template.render(
        audit=audit_data,
        flowchart_data=flowchart_data,
        css_content=css_content,
        primary_color="#0A0A0F",
        accent_color="#FF6B35",
        accent2_color="#6C63FF",
    )

    file_id = str(uuid4())
    pdf_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.pdf")

    # Try xhtml2pdf (Pure Python, very stable on Windows)
    try:
        from xhtml2pdf import pisa
        with open(pdf_path, "wb") as f:
            pisa_status = pisa.CreatePDF(html_content, dest=f)
        
        if not pisa_status.err:
            logger.info(f"PDF generated via xhtml2pdf: {pdf_path}")
            return pdf_path
        else:
            logger.warning(f"xhtml2pdf failed with error: {pisa_status.err}")
    except Exception as e:
        logger.warning(f"xhtml2pdf import/execution failed: {e}")

    # Try WeasyPrint (Modern CSS, but requires GTK+ on Windows)
    try:
        from weasyprint import HTML
        HTML(string=html_content, base_url=str(TEMPLATES_DIR)).write_pdf(pdf_path)
        logger.info(f"PDF generated via WeasyPrint: {pdf_path}")
        return pdf_path
    except Exception as e:
        logger.warning(f"WeasyPrint failed: {e}")

    # Fallback to HTML
    html_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    logger.info(f"HTML fallback saved: {html_path}")
    return html_path
