from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models.common import ApiResponse
from app.models.profile import ProfileModel
from app.utils.json_storage import read_json, write_json

router = APIRouter(prefix="/profile-builder", tags=["profile_builder"])
DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "profile_builder.json"


@router.get("/profile", response_model=ApiResponse)
def get_profile():
    data = read_json(DATA_PATH)
    if data is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ApiResponse(message="Profile loaded", data=data)


@router.post("/profile", response_model=ApiResponse)
def create_profile(profile: ProfileModel):
    data = profile.model_dump()
    write_json(DATA_PATH, data)
    return ApiResponse(message="Profile saved", data=data)


@router.put("/profile", response_model=ApiResponse)
def update_profile(profile: ProfileModel):
    data = profile.model_dump()
    write_json(DATA_PATH, data)
    return ApiResponse(message="Profile updated", data=data)


@router.delete("/profile", response_model=ApiResponse)
def delete_profile():
    if DATA_PATH.exists():
        DATA_PATH.unlink()
    return ApiResponse(message="Profile deleted", data=None)
