from __future__ import annotations

import re
from pathlib import Path

import fitz
from docx import Document


SUPPORTED_DOC_TYPES = {".pdf", ".docx"}


def extract_text_from_file(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf_text(path)
    if suffix == ".docx":
        return _extract_docx_text(path)
    raise ValueError(f"Unsupported file type: {suffix}")


def normalize_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[\t\u00a0]+", " ", text)
    return text.strip()


def _extract_pdf_text(path: Path) -> str:
    pages: list[str] = []
    with fitz.open(path) as doc:
        for page in doc:
            pages.append(page.get_text("text"))
    return normalize_text("\n".join(pages))


def _extract_docx_text(path: Path) -> str:
    doc = Document(path)
    return normalize_text("\n".join(p.text for p in doc.paragraphs if p.text))
