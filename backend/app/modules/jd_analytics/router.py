from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, Response

from app.models.common import ApiResponse
from app.models.jd import JDAnalysisModel
from app.services import AIService
from app.utils.json_storage import read_json, write_json
from app.utils.text_extraction import SUPPORTED_DOC_TYPES, extract_text_from_file

router = APIRouter(prefix="/jd-analytics", tags=["jd_analytics"])
logger = logging.getLogger(__name__)

MODULE_PATH = Path(__file__).resolve().parent
DATA_PATH = MODULE_PATH.parents[2] / "data"
UPLOAD_PATH = MODULE_PATH.parents[2] / "uploads" / "jd_analytics"
FILE_META_PATH = DATA_PATH / "jd_uploaded_file.json"
ANALYSIS_PATH = DATA_PATH / "jd_analysis.json"

SKILL_CATEGORIES = {
    "COD": ["coding", "programming", "problem solving", "data structures", "algorithms"],
    "DSA": ["dsa", "data structures", "algorithms", "leetcode"],
    "OOD": ["ood", "object oriented", "oop", "design patterns"],
    "SQL": ["sql", "postgres", "mysql", "oracle", "database"],
    "AI": ["ai", "ml", "machine learning", "llm", "deep learning", "nlp"],
    "Cloud": ["aws", "azure", "gcp", "cloud", "kubernetes", "docker"],
    "Communication": ["communication", "collaboration", "stakeholder", "presentation"],
    "Networking": ["networking", "tcp", "http", "dns", "load balancer"],
    "Operating Systems": ["linux", "unix", "operating system", "thread", "process"],
    "System Design": ["system design", "microservices", "scalability", "distributed systems"],
    "SWE": ["software engineering", "git", "testing", "ci/cd", "code review"],
    "Aptitude": ["aptitude", "quantitative", "logical reasoning", "analytical"],
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _save_upload(file: UploadFile) -> dict[str, str]:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_DOC_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX are supported")

    UPLOAD_PATH.mkdir(parents=True, exist_ok=True)
    for existing in UPLOAD_PATH.glob("*"):
        existing.unlink(missing_ok=True)

    safe_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", file.filename or f"jd{suffix}")
    file_path = UPLOAD_PATH / safe_name

    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    file_path.write_bytes(content)

    metadata = {
        "file_name": safe_name,
        "file_path": str(file_path),
        "uploaded_at": _utc_now(),
    }
    write_json(FILE_META_PATH, metadata)
    logger.info("JD file uploaded: %s", safe_name)
    return metadata


def _extract_section_lines(text: str, header_tokens: tuple[str, ...]) -> list[str]:
    lines = [line.strip(" -•\t") for line in text.splitlines() if line.strip()]
    collected: list[str] = []
    capture = False
    for line in lines:
        lower = line.lower()
        if any(token in lower for token in header_tokens):
            capture = True
            continue
        if capture and re.match(r"^[A-Z][A-Za-z ]{2,25}:?$", line):
            break
        if capture:
            collected.append(line)
    return collected[:12]


def _extract_company(text: str) -> str:
    patterns = [
        r"company\s*[:\-]\s*(.+)",
        r"organization\s*[:\-]\s*(.+)",
        r"about\s+(?:the\s+)?company\s*[:\-]?\s*(.+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).split("\n")[0].strip()[:100]
    return ""


def _extract_role(text: str) -> str:
    patterns = [
        r"job\s*title\s*[:\-]\s*(.+)",
        r"role\s*[:\-]\s*(.+)",
        r"position\s*[:\-]\s*(.+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).split("\n")[0].strip()[:100]

    first_line = text.splitlines()[0] if text.splitlines() else ""
    return first_line[:100]


def _extract_experience(text: str) -> str:
    match = re.search(
        r"(\d+\+?\s*(?:to\s*\d+\+?\s*)?(?:years?|yrs?)\s*(?:of)?\s*experience)",
        text,
        re.IGNORECASE,
    )
    return match.group(1) if match else ""


def _extract_skill_candidates(text: str) -> list[str]:
    buckets: list[str] = []
    buckets.extend(_extract_section_lines(text, ("required skills", "skills", "must have", "requirements")))
    buckets.extend(_extract_section_lines(text, ("technologies", "tech stack", "tools")))
    words = re.findall(r"[A-Za-z][A-Za-z0-9+#.-]{1,25}", text)
    common = {
        "python", "java", "javascript", "typescript", "react", "node", "fastapi", "django", "flask",
        "aws", "azure", "gcp", "sql", "postgresql", "mysql", "docker", "kubernetes", "git",
        "pandas", "numpy", "spark", "linux", "redis", "mongodb", "langchain", "openai", "tensorflow",
        "pytorch", "ci", "cd", "graphql", "rest", "microservices", "system", "design", "communication",
    }
    buckets.extend([token for token in words if token.lower() in common])

    clean: list[str] = []
    seen: set[str] = set()
    for item in buckets:
        value = item.strip(" ,.;:-")
        if not value:
            continue
        norm = value.lower()
        if norm in seen:
            continue
        seen.add(norm)
        clean.append(value)
    return clean[:50]


def _categorize(skills: list[str]) -> dict[str, list[str]]:
    categorized = {key: [] for key in SKILL_CATEGORIES}
    for skill in skills:
        lowered = skill.lower()
        for category, keywords in SKILL_CATEGORIES.items():
            if any(keyword in lowered for keyword in keywords):
                categorized[category].append(skill)

    for category in categorized:
        categorized[category] = sorted(set(categorized[category]), key=str.lower)
    return categorized


def _build_analysis(text: str, source_file_name: str) -> JDAnalysisModel:
    responsibilities = _extract_section_lines(text, ("responsibilities", "what you'll do", "job duties"))
    skills = _extract_skill_candidates(text)
    technologies = [
        skill
        for skill in skills
        if any(x in skill.lower() for x in ["python", "java", "react", "sql", "aws", "azure", "gcp", "docker", "kubernetes", "fastapi"])
    ]

    model = JDAnalysisModel(
        company=_extract_company(text),
        role=_extract_role(text),
        required_skills=skills,
        responsibilities=responsibilities,
        experience=_extract_experience(text),
        technologies=sorted(set(technologies), key=str.lower),
        categories=_categorize(skills),
        source_file_name=source_file_name,
        analyzed_at=_utc_now(),
    )
    return model


def _current_file_meta() -> dict[str, str]:
    meta = read_json(FILE_META_PATH)
    if not meta:
        raise HTTPException(status_code=404, detail="No uploaded JD file found")
    if not Path(meta["file_path"]).exists():
        raise HTTPException(status_code=404, detail="Uploaded JD file is missing")
    return meta


@router.post("/upload", response_model=ApiResponse)
def upload_jd_file(file: UploadFile = File(...)):
    metadata = _save_upload(file)
    return ApiResponse(message="JD file uploaded successfully", data=metadata)


@router.get("/uploaded-file", response_model=ApiResponse)
def get_uploaded_file():
    return ApiResponse(message="Uploaded file metadata", data=_current_file_meta())


@router.delete("/uploaded-file", response_model=ApiResponse)
def delete_uploaded_file():
    meta = read_json(FILE_META_PATH)
    if not meta:
        return ApiResponse(message="No uploaded JD file to delete", data=None)

    path = Path(meta["file_path"])
    path.unlink(missing_ok=True)
    FILE_META_PATH.unlink(missing_ok=True)
    ANALYSIS_PATH.unlink(missing_ok=True)
    return ApiResponse(message="Uploaded JD file deleted", data=None)


@router.post("/analyze", response_model=ApiResponse)
def analyze_jd():
    meta = _current_file_meta()
    file_path = Path(meta["file_path"])
    text = extract_text_from_file(file_path)
    if not text:
        raise HTTPException(status_code=400, detail="Unable to extract text from JD file")

    analysis = _build_analysis(text, meta["file_name"]) 
    ai_summary = AIService().summarize(text, "Summarize this JD")
    payload = analysis.model_dump()
    if ai_summary:
        payload["ai_summary"] = ai_summary

    write_json(ANALYSIS_PATH, payload)
    return ApiResponse(message="JD analyzed successfully", data=payload)


@router.post("/reanalyze", response_model=ApiResponse)
def reanalyze_jd():
    return analyze_jd()


@router.get("/analysis", response_model=ApiResponse)
def get_jd_analysis():
    data = read_json(ANALYSIS_PATH)
    if not data:
        raise HTTPException(status_code=404, detail="JD analysis not found")
    return ApiResponse(message="JD analysis loaded", data=data)


@router.get("/download-json")
def download_analysis_json():
    data = read_json(ANALYSIS_PATH)
    if not data:
        raise HTTPException(status_code=404, detail="JD analysis not found")

    return Response(
        content=json.dumps(data, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=jd-analysis.json"},
    )
