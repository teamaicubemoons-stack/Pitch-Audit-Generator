"""
Flowchart Service — Converts Mermaid.js code to SVG.
Falls back to returning the raw Mermaid code if CLI unavailable.
"""

import logging
import subprocess
import tempfile
import os

logger = logging.getLogger(__name__)


def mermaid_to_svg(mermaid_code: str) -> str:
    """
    Convert Mermaid.js code to SVG string.
    Requires @mermaid-js/mermaid-cli (mmdc) installed globally:
        npm install -g @mermaid-js/mermaid-cli
    Falls back gracefully if not installed.
    """
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".mmd", delete=False) as f:
            f.write(mermaid_code)
            input_path = f.name

        output_path = input_path.replace(".mmd", ".svg")

        result = subprocess.run(
            ["mmdc", "-i", input_path, "-o", output_path, "-b", "transparent"],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode == 0 and os.path.exists(output_path):
            with open(output_path, "r", encoding="utf-8") as f:
                svg_content = f.read()
            os.unlink(input_path)
            os.unlink(output_path)
            return svg_content
        else:
            logger.warning(f"mmdc failed: {result.stderr}")
            os.unlink(input_path)
            return ""

    except FileNotFoundError:
        logger.info("mmdc not found — returning raw Mermaid code (frontend will render)")
        return ""
    except Exception as e:
        logger.error(f"SVG conversion error: {e}")
        return ""
