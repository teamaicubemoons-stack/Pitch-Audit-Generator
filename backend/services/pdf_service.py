"""
PDF Service — High-fidelity enterprise PDF generation using Playwright (Chromium).
"""

import os
import logging
import asyncio
from uuid import uuid4
from pathlib import Path
import jinja2
from playwright.sync_api import sync_playwright

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


def _generate_pdf_sync(html_content: str, pdf_path: str, chrome_path: str = None) -> None:
    launch_kwargs = {
        "headless": True,
        "args": ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
    if chrome_path:
        launch_kwargs["executable_path"] = chrome_path

    with sync_playwright() as p:
        browser = p.chromium.launch(**launch_kwargs)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        # Set content and wait for network idle
        page.set_content(html_content, wait_until='networkidle')
        
        # Generate PDF
        page.pdf(
            path=pdf_path,
            format='A4',
            landscape=True,
            print_background=True,
            margin={
                'top': '0mm',
                'right': '0mm',
                'bottom': '0mm',
                'left': '0mm'
            }
        )
        browser.close()


def _convert_raw_html_to_pdf_sync(html_content: str, pdf_path: str, chrome_path: str = None) -> None:
    launch_kwargs = {"headless": True, "args": ['--no-sandbox']}
    if chrome_path:
        launch_kwargs["executable_path"] = chrome_path

    with sync_playwright() as p:
        browser = p.chromium.launch(**launch_kwargs)
        context = browser.new_context()
        page = context.new_page()
        page.set_content(html_content, wait_until='networkidle')
        page.pdf(
            path=pdf_path,
            format='A4',
            landscape=True,
            print_background=True
        )
        browser.close()


async def generate_pdf(audit_data: dict, flowchart_data: dict = None) -> str:
    """
    Renders audit data using Playwright for pixel-perfect PDF parity.
    Runs synchronously in a separate thread to avoid Windows NotImplementedError.
    """
    import base64
    env = _get_jinja_env()
    template = env.get_template("audit_template.html")

    # Read the synchronized flowing CSS
    css_path = TEMPLATES_DIR / "pdf_style.css"
    css_content = ""
    if css_path.exists():
        with open(css_path, "r", encoding="utf-8") as f:
            css_content = f.read()

    # Read logo image as base64
    logo_path = Path(__file__).parent.parent.parent / "impression.png"
    logo_base64 = ""
    if logo_path.exists():
        try:
            with open(logo_path, "rb") as img_f:
                logo_base64 = base64.b64encode(img_f.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to read logo.png for base64 injection: {e}")

    html_content = template.render(
        audit=audit_data,
        flowchart_data=flowchart_data,
        css_content=css_content,
        logo_base64=logo_base64
    )

    file_id = str(uuid4())
    pdf_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.pdf")
    html_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.html")

    # Always write the HTML for debugging/preview fallback
    try:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
    except Exception as e:
        logger.error(f"Failed to save debug HTML: {e}")

    try:
        chrome_path = os.getenv("CHROME_PATH")
        await asyncio.to_thread(_generate_pdf_sync, html_content, pdf_path, chrome_path)
        logger.info(f"Enterprise PDF generated via Playwright: {pdf_path}")
        return pdf_path

    except Exception as e:
        logger.error(f"Playwright rendering failed: {e}")
        # Fallback to HTML
        html_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return html_path


async def convert_raw_html_to_pdf(html_content: str) -> str:
    """
    Directly converts raw AI-generated HTML to PDF using Playwright.
    Runs synchronously in a separate thread to avoid Windows NotImplementedError.
    """
    file_id = str(uuid4())
    pdf_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.pdf")

    try:
        chrome_path = os.getenv("CHROME_PATH")
        await asyncio.to_thread(_convert_raw_html_to_pdf_sync, html_content, pdf_path, chrome_path)
        return pdf_path
    except Exception as e:
        logger.error(f"AI-HTML Playwright conversion failed: {e}")
        html_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return html_path


