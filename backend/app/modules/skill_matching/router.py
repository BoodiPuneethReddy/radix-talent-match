from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/skill-matching", tags=["skill_matching"])


@router.get("/status")
def skill_matching_status():
    raise HTTPException(status_code=501, detail="This module will be implemented by Team Member.")
