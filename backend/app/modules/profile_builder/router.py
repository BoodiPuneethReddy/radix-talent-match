from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.models.common import ApiResponse
from app.models.profile import ProfileModel
from app.utils.json_storage import read_json, write_json

router = APIRouter(prefix="/profile-builder", tags=["profile_builder"])
logger = logging.getLogger(__name__)

MODULE_PATH = Path(__file__).resolve().parent
DATA_PATH = MODULE_PATH.parents[2] / "data"
UPLOAD_PATH = MODULE_PATH.parents[2] / "uploads" / "profile_builder"
PROFILE_DATA_PATH = DATA_PATH / "profile.json"
AUTOSAVE_PATH = DATA_PATH / "profile_autosave.json"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sanitize_filename(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_.-]", "_", name)


def _save_profile(profile: ProfileModel, path: Path = PROFILE_DATA_PATH) -> dict:
    payload = profile.model_dump()
    payload["updatedAt"] = _utc_now()
    write_json(path, payload)
    return payload


@router.get("/profile", response_model=ApiResponse)
def get_profile():
    data = read_json(PROFILE_DATA_PATH)
    if data is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ApiResponse(message="Profile loaded", data=data)


@router.post("/profile", response_model=ApiResponse)
def create_profile(profile: ProfileModel):
    data = _save_profile(profile)
    return ApiResponse(message="Profile saved", data=data)


@router.put("/profile", response_model=ApiResponse)
def update_profile(profile: ProfileModel):
    data = _save_profile(profile)
    return ApiResponse(message="Profile updated", data=data)


@router.delete("/profile", response_model=ApiResponse)
def delete_profile():
    PROFILE_DATA_PATH.unlink(missing_ok=True)
    return ApiResponse(message="Profile deleted", data=None)


@router.post("/autosave", response_model=ApiResponse)
def autosave_profile(profile: ProfileModel):
    data = _save_profile(profile, AUTOSAVE_PATH)
    return ApiResponse(message="Profile autosaved", data=data)


@router.get("/autosave", response_model=ApiResponse)
def load_autosave_profile():
    data = read_json(AUTOSAVE_PATH)
    if data is None:
        raise HTTPException(status_code=404, detail="Autosave profile not found")
    return ApiResponse(message="Autosave profile loaded", data=data)


@router.post("/reset", response_model=ApiResponse)
def reset_profile():
    PROFILE_DATA_PATH.unlink(missing_ok=True)
    AUTOSAVE_PATH.unlink(missing_ok=True)
    return ApiResponse(message="Profile reset completed", data=None)


@router.post("/import", response_model=ApiResponse)
def import_profile(profile: ProfileModel):
    data = _save_profile(profile)
    return ApiResponse(message="Profile imported", data=data)


@router.get("/export")
def export_profile():
    data = read_json(PROFILE_DATA_PATH)
    if data is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    return Response(
        content=json.dumps(data, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=profile.json"},
    )


@router.post("/upload/resume", response_model=ApiResponse)
def upload_resume(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".pdf", ".docx"}:
        raise HTTPException(status_code=400, detail="Resume must be a PDF or DOCX")

    UPLOAD_PATH.mkdir(parents=True, exist_ok=True)
    file_name = _sanitize_filename(file.filename or f"resume{suffix}")
    destination = UPLOAD_PATH / file_name
    destination.write_bytes(file.file.read())

    profile_data = read_json(PROFILE_DATA_PATH, default={}) or {}
    profile_data["resumeFileName"] = file_name
    profile_data["resumeFilePath"] = str(destination)
    profile_data["updatedAt"] = _utc_now()
    write_json(PROFILE_DATA_PATH, profile_data)

    return ApiResponse(
        message="Resume uploaded successfully",
        data={"resumeFileName": file_name, "resumeFilePath": str(destination)},
    )


@router.post("/upload/photo", response_model=ApiResponse)
def upload_profile_photo(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(status_code=400, detail="Photo must be PNG, JPG, JPEG, or WEBP")

    UPLOAD_PATH.mkdir(parents=True, exist_ok=True)
    file_name = _sanitize_filename(file.filename or f"profile{suffix}")
    destination = UPLOAD_PATH / file_name
    destination.write_bytes(file.file.read())

    profile_data = read_json(PROFILE_DATA_PATH, default={}) or {}
    profile_data["profilePhotoName"] = file_name
    profile_data["profilePhotoPath"] = str(destination)
    profile_data["updatedAt"] = _utc_now()
    write_json(PROFILE_DATA_PATH, profile_data)

    return ApiResponse(
        message="Profile photo uploaded successfully",
        data={"profilePhotoName": file_name, "profilePhotoPath": str(destination)},
    )


@router.get("/preview", response_model=ApiResponse)
def preview_profile():
    data = read_json(PROFILE_DATA_PATH)
    if not data:
        raise HTTPException(status_code=404, detail="Profile not found")

    preview_payload = {
        "headline": f"{data.get('name', 'Candidate')} - {', '.join(data.get('preferredRoles', [])[:2])}".strip(" -"),
        "skills": data.get("skills", [])[:15],
        "experience": data.get("experience", [])[:5],
        "projects": data.get("projects", [])[:5],
        "links": {
            "github": data.get("github", ""),
            "linkedin": data.get("linkedin", ""),
            "portfolio": data.get("portfolio", ""),
        },
    }
    return ApiResponse(message="Profile preview generated", data=preview_payload)
