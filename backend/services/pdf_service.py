"""
PDF Service — High-fidelity enterprise PDF generation using Pyppeteer (Chromium).
"""

import os
import logging
import asyncio
from uuid import uuid4
from pathlib import Path
import jinja2
from pyppeteer import launch

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


async def generate_pdf(audit_data: dict, flowchart_data: dict = None) -> str:
    """
    Renders audit data using Puppeteer for pixel-perfect PDF parity.
    """
    env = _get_jinja_env()
    template = env.get_template("audit_template.html")

    # Read the synchronized flowing CSS
    css_path = TEMPLATES_DIR / "pdf_style.css"
    css_content = ""
    if css_path.exists():
        with open(css_path, "r", encoding="utf-8") as f:
            css_content = f.read()

    html_content = template.render(
        audit=audit_data,
        flowchart_data=flowchart_data,
        css_content=css_content
    )

    file_id = str(uuid4())
    pdf_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.pdf")

    try:
        # Use CHROME_PATH env var for Linux/AWS, otherwise let pyppeteer find it
        chrome_path = os.getenv("CHROME_PATH")
        launch_kwargs = {
            "headless": True,
            "args": ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
        if chrome_path:
            launch_kwargs["executablePath"] = chrome_path

        browser = await launch(**launch_kwargs)
        page = await browser.newPage()
        
        # Set viewport to A4 Landscape equivalent for rendering math
        await page.setViewport({'width': 1280, 'height': 800})
        
        # Set content
        await page.setContent(html_content, waitUntil='networkidle0')
        
        # Generate PDF
        await page.pdf({
            'path': pdf_path,
            'format': 'A4',
            'landscape': True,
            'printBackground': True,
            'margin': {
                'top': '10mm',
                'right': '10mm',
                'bottom': '10mm',
                'left': '10mm'
            }
        })
        
        await browser.close()
        logger.info(f"Enterprise PDF generated via Puppeteer: {pdf_path}")
        return pdf_path

    except Exception as e:
        logger.error(f"Puppeteer rendering failed: {e}")
        # Fallback to HTML
        html_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return html_path


async def convert_raw_html_to_pdf(html_content: str) -> str:
    """
    Directly converts raw AI-generated HTML to PDF using Puppeteer.
    """
    file_id = str(uuid4())
    pdf_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.pdf")

    try:
        chrome_path = os.getenv("CHROME_PATH")
        launch_kwargs = {"headless": True, "args": ['--no-sandbox']}
        if chrome_path:
            launch_kwargs["executablePath"] = chrome_path

        browser = await launch(**launch_kwargs)
        page = await browser.newPage()
        await page.setContent(html_content, waitUntil='networkidle0')
        await page.pdf({
            'path': pdf_path,
            'format': 'A4',
            'landscape': True,
            'printBackground': True
        })
        await browser.close()
        return pdf_path
    except Exception as e:
        logger.error(f"AI-HTML Puppeteer conversion failed: {e}")
        html_path = os.path.join(PDF_OUTPUT_DIR, f"{file_id}.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return html_path
