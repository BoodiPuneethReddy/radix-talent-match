from pathlib import Path
import shutil

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import ValidationError

from app.models.profile import ProfilePayload
from app.utils.storage import read_profile_data, reset_profile_data, write_profile_data

router = APIRouter()
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/profile")
def load_profile():
    return read_profile_data()


@router.post("/profile/save")
def save_profile(payload: ProfilePayload):
    data = {"profile": payload.model_dump()}
    return write_profile_data(data)


@router.put("/profile/update")
def update_profile(payload: ProfilePayload):
    existing = read_profile_data()
    merged = existing.get("profile", {})
    merged.update(payload.model_dump())
    try:
        validated = ProfilePayload(**merged)
    except ValidationError as error:
        raise HTTPException(status_code=422, detail=error.errors()) from error
    return write_profile_data({"profile": validated.model_dump()})


@router.post("/profile/autosave")
def autosave_profile(payload: ProfilePayload):
    data = {"profile": payload.model_dump()}
    return write_profile_data(data)


@router.delete("/profile")
def delete_profile():
    return reset_profile_data()


@router.post("/upload/resume")
def upload_resume(file: UploadFile = File(...)):
    destination = UPLOAD_DIR / f"resume_{file.filename}"
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    data = read_profile_data()
    profile = data.get("profile", {})
    profile["resume_file"] = destination.name
    return write_profile_data({"profile": profile})


@router.post("/upload/photo")
def upload_photo(file: UploadFile = File(...)):
    destination = UPLOAD_DIR / f"photo_{file.filename}"
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    data = read_profile_data()
    profile = data.get("profile", {})
    profile["profile_photo"] = destination.name
    return write_profile_data({"profile": profile})
