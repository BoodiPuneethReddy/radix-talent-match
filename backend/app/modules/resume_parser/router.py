from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.common import ApiResponse
from app.models.resume import ParsedCandidateModel
from app.utils.json_storage import read_json, write_json
from app.utils.text_extraction import SUPPORTED_DOC_TYPES, extract_text_from_file, normalize_text

router = APIRouter(prefix="/resume-parser", tags=["resume_parser"])
logger = logging.getLogger(__name__)

MODULE_PATH = Path(__file__).resolve().parent
DATA_PATH = MODULE_PATH.parents[2] / "data"
UPLOAD_PATH = MODULE_PATH.parents[2] / "uploads" / "resume_parser"
PARSED_PATH = DATA_PATH / "parsed_candidate.json"

FIELD_ALIASES: dict[str, set[str]] = {
    "name": {"name", "full name", "candidate name"},
    "email": {"email", "email id", "mail"},
    "phone": {"phone", "mobile", "contact", "phone number"},
    "education": {"education", "qualification", "degree"},
    "projects": {"projects", "project"},
    "experience": {"experience", "work experience"},
    "skills": {"skills", "skillset", "tech stack"},
    "hackathons": {"hackathons", "hackathon"},
    "internships": {"internships", "internship"},
    "achievements": {"achievements", "achievement", "awards"},
    "certifications": {"certifications", "certification", "certificates"},
    "languages": {"languages", "language"},
    "github": {"github", "github url"},
    "linkedin": {"linkedin", "linkedin url"},
    "portfolio": {"portfolio", "portfolio url", "website"},
}

LIST_FIELDS = {
    "education",
    "projects",
    "experience",
    "skills",
    "hackathons",
    "internships",
    "achievements",
    "certifications",
    "languages",
}


def _normalize_column(name: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9 ]", " ", name.lower())).strip()


def _split_values(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    text = str(value).strip()
    if not text or text.lower() == "nan":
        return []
    parts = re.split(r"\n|,|;|\|", text)
    return [part.strip() for part in parts if part.strip()]


def _extract_named_section(text: str, section_name: str) -> list[str]:
    lines = [line.strip(" -•\t") for line in text.splitlines() if line.strip()]
    values: list[str] = []
    capture = False
    for line in lines:
        lower = line.lower()
        if lower.startswith(section_name):
            capture = True
            continue
        if capture and re.match(r"^[A-Za-z][A-Za-z ]{2,30}:?$", line):
            break
        if capture:
            values.append(line)
    return values[:20]


def _parse_resume_text(text: str) -> dict[str, Any]:
    text = normalize_text(text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    first_line = lines[0] if lines else ""

    email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    phone_match = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", text)
    github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_.-]+", text, re.IGNORECASE)
    linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/[A-Za-z0-9_./-]+", text, re.IGNORECASE)
    portfolio_match = re.search(r"(?:https?://)?(?:www\.)?(?!linkedin|github)[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:/[\w./-]*)?", text)

    skills = _extract_named_section(text, "skills")
    if not skills:
        skills = _split_values(",".join(re.findall(r"\b(?:python|java|javascript|typescript|react|node|sql|aws|azure|gcp|docker|kubernetes|fastapi|django|flask|git|pandas|numpy|machine learning|langchain)\b", text, re.IGNORECASE)))

    parsed = {
        "name": first_line if len(first_line.split()) <= 6 else "",
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0) if phone_match else "",
        "education": _extract_named_section(text, "education"),
        "projects": _extract_named_section(text, "projects"),
        "experience": _extract_named_section(text, "experience"),
        "skills": skills,
        "hackathons": _extract_named_section(text, "hackathons"),
        "internships": _extract_named_section(text, "internships"),
        "achievements": _extract_named_section(text, "achievements"),
        "certifications": _extract_named_section(text, "certifications"),
        "languages": _extract_named_section(text, "languages"),
        "github": github_match.group(0) if github_match else "",
        "linkedin": linkedin_match.group(0) if linkedin_match else "",
        "portfolio": portfolio_match.group(0) if portfolio_match else "",
        "source": {"resume": "parsed"},
    }
    return parsed


def _map_excel_columns(df: pd.DataFrame) -> dict[str, str]:
    mapped: dict[str, str] = {}
    normalized = {_normalize_column(col): col for col in df.columns}
    for target, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            col = normalized.get(_normalize_column(alias))
            if col:
                mapped[target] = col
                break
    return mapped


def _parse_excel(file_path: Path) -> tuple[dict[str, Any], dict[str, str]]:
    try:
        df = pd.read_excel(file_path, engine="openpyxl")
    except Exception as exc:  # pragma: no cover - defensive parsing
        raise HTTPException(status_code=400, detail=f"Excel parsing failed: {exc}") from exc

    if df.empty:
        raise HTTPException(status_code=400, detail="Excel file has no candidate rows")

    mapping = _map_excel_columns(df)
    row = df.iloc[0].to_dict()
    parsed: dict[str, Any] = {}
    for field in FIELD_ALIASES:
        col = mapping.get(field)
        if not col:
            parsed[field] = [] if field in LIST_FIELDS else ""
            continue
        value = row.get(col)
        parsed[field] = _split_values(value) if field in LIST_FIELDS else ("" if pd.isna(value) else str(value).strip())

    parsed["source"] = {"excel": "mapped"}
    return parsed, mapping


def _merge_fields(resume_data: dict[str, Any], excel_data: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    for field in FIELD_ALIASES:
        resume_value = resume_data.get(field)
        excel_value = excel_data.get(field)
        if field in LIST_FIELDS:
            merged_list = []
            for item in (resume_value or []):
                if item and item not in merged_list:
                    merged_list.append(item)
            for item in (excel_value or []):
                if item and item not in merged_list:
                    merged_list.append(item)
            merged[field] = merged_list
        else:
            merged[field] = resume_value or excel_value or ""

    merged["source"] = {
        "resume": "resume-priority",
        "excel": "fallback",
    }
    return merged


def _persist_upload(file: UploadFile, folder: str, allowed: set[str]) -> Path:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")

    target_dir = UPLOAD_PATH / folder
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / re.sub(r"[^a-zA-Z0-9_.-]", "_", file.filename or f"upload{suffix}")
    target_path.write_bytes(file.file.read())
    return target_path


@router.post("/parse", response_model=ApiResponse)
def parse_resume_and_excel(
    resume_file: UploadFile | None = File(default=None),
    excel_file: UploadFile | None = File(default=None),
):
    if not resume_file and not excel_file:
        raise HTTPException(status_code=400, detail="Upload resume_file, excel_file, or both")

    resume_data = {field: ([] if field in LIST_FIELDS else "") for field in FIELD_ALIASES}
    excel_data = {field: ([] if field in LIST_FIELDS else "") for field in FIELD_ALIASES}
    source_files: dict[str, str] = {}
    column_mapping: dict[str, str] = {}

    if resume_file:
        resume_path = _persist_upload(resume_file, "resume", SUPPORTED_DOC_TYPES)
        text = extract_text_from_file(resume_path)
        resume_data = _parse_resume_text(text)
        source_files["resume"] = str(resume_path)

    if excel_file:
        excel_path = _persist_upload(excel_file, "excel", {".xlsx", ".xls"})
        excel_data, column_mapping = _parse_excel(excel_path)
        source_files["excel"] = str(excel_path)

    merged = _merge_fields(resume_data, excel_data)
    parsed = ParsedCandidateModel(**merged).model_dump()
    payload = {
        "candidate": parsed,
        "column_mapping": column_mapping,
        "source_files": source_files,
    }
    write_json(PARSED_PATH, payload)
    logger.info("Resume parser output created")
    return ApiResponse(message="Resume and Excel parsed successfully", data=payload)


@router.get("/parsed", response_model=ApiResponse)
def get_last_parsed_candidate():
    data = read_json(PARSED_PATH)
    if not data:
        raise HTTPException(status_code=404, detail="No parsed candidate found")
    return ApiResponse(message="Parsed candidate loaded", data=data)
